import type { Principal } from "@icp-sdk/core/principal";

export enum UserRole {
  admin = "admin",
  user = "user",
  guest = "guest",
}

export interface CouncilMember {
  id: bigint;
  serialNumber: bigint;
  council: Council;
  memberName: string;
  fatherName: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  currentAddress: string;
  permanentAddress: string;
  designation: string;
}

export type Council =
  | { __kind__: "sadharanParishad" }
  | { __kind__: "karyanirbahaParishad" }
  | { __kind__: "upadeshataParishad" };

export interface ConstitutionChapter {
  id: bigint;
  chapterNumber: bigint;
  title: string;
  content: string;
}

export interface IncomeRecord {
  id: bigint;
  serialNumber: bigint;
  date: string;
  category: string;
  donorName: string;
  donorAddress: string;
  mobile: string;
  amount: number;
  designation: string;
}

export interface ExpenseRecord {
  id: bigint;
  serialNumber: bigint;
  date: string;
  category: string;
  recipientName: string;
  recipientAddress: string;
  mobile: string;
  amount: number;
  proofFileId: string;
}

export interface ExpenseCategory {
  id: bigint;
  name: string;
}

export interface backendInterface {
  getCallerUserRole(): Promise<UserRole>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;

  // Council Members
  getNextSerialNumber(): Promise<bigint>;
  getAllMembers(): Promise<Array<CouncilMember>>;
  getMembersByCouncil(council: Council): Promise<Array<CouncilMember>>;
  addMember(
    council: Council,
    memberName: string,
    fatherName: string,
    mobile: string,
    email: string,
    bloodGroup: string,
    currentAddress: string,
    permanentAddress: string,
    designation: string
  ): Promise<CouncilMember>;
  updateMember(id: bigint, updated: CouncilMember): Promise<void>;
  deleteMember(id: bigint): Promise<void>;

  // Constitution
  getAllChapters(): Promise<Array<ConstitutionChapter>>;
  addChapter(title: string, content: string): Promise<ConstitutionChapter>;
  updateChapter(id: bigint, title: string, content: string): Promise<void>;
  deleteChapter(id: bigint): Promise<void>;

  // Income
  getAllIncomeRecords(): Promise<Array<IncomeRecord>>;
  addIncomeRecord(
    date: string,
    category: string,
    donorName: string,
    donorAddress: string,
    mobile: string,
    amount: number,
    designation: string
  ): Promise<IncomeRecord>;
  deleteIncomeRecord(id: bigint): Promise<void>;

  // Expense
  getAllExpenseRecords(): Promise<Array<ExpenseRecord>>;
  addExpenseRecord(
    date: string,
    category: string,
    recipientName: string,
    recipientAddress: string,
    mobile: string,
    amount: number,
    proofFileId: string
  ): Promise<ExpenseRecord>;
  deleteExpenseRecord(id: bigint): Promise<void>;

  // Expense Categories
  getAllExpenseCategories(): Promise<Array<ExpenseCategory>>;
  addExpenseCategory(name: string): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: bigint): Promise<void>;
}
