import { useEffect, useState } from "react";

const QUEUE_KEY = "aponOfflineQueue";

export interface OfflineOperation {
  id: string;
  type:
    | "addMember"
    | "updateMember"
    | "deleteMember"
    | "addIncome"
    | "updateIncome"
    | "deleteIncome"
    | "addExpense"
    | "updateExpense"
    | "deleteExpense"
    | "addChapter"
    | "updateChapter"
    | "deleteChapter";
  payload: any;
  timestamp: number;
}

export function getQueue(): OfflineOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToQueue(op: Omit<OfflineOperation, "id" | "timestamp">) {
  const queue = getQueue();
  const newOp: OfflineOperation = {
    ...op,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  queue.push(newOp);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return newOp;
}

export function removeFromQueue(id: string) {
  const queue = getQueue().filter((op) => op.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function usePendingCount() {
  const [count, setCount] = useState(() => getQueue().length);

  useEffect(() => {
    function sync() {
      setCount(getQueue().length);
    }
    window.addEventListener("storage", sync);
    // Poll every 5s to catch same-tab updates
    const interval = setInterval(sync, 5000);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, []);

  return count;
}
