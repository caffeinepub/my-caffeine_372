import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventStatus, type backendInterface } from "../backend";
import type { EventView } from "../backend";

const mockEvents: EventView[] = [
  {
    id: 1n,
    title: "বার্ষিক সাধারণ সভা",
    description: "সংগঠনের বার্ষিক সভা",
    date: BigInt(Date.now() * 1_000_000),
    location: "ঢাকা কমিউনিটি হল",
    maxAttendees: 100n,
    registeredAttendees: [],
    status: EventStatus.upcoming,
  },
  {
    id: 2n,
    title: "ফান্ড রেইজিং ডিনার",
    description: "বার্ষিক ফান্ড রেইজিং ইভেন্ট",
    date: BigInt(Date.now() * 1_000_000),
    location: "গ্র্যান্ড হোটেল, ঢাকা",
    maxAttendees: 50n,
    registeredAttendees: [],
    status: EventStatus.upcoming,
  },
  {
    id: 3n,
    title: "স্বাস্থ্য সেবা ক্যাম্প",
    description: "বিনামূল্যে স্বাস্থ্য সেবা",
    date: BigInt(Date.now() * 1_000_000),
    location: "রাজশাহী",
    maxAttendees: 200n,
    registeredAttendees: [],
    status: EventStatus.completed,
  },
];

const statusLabels: Record<EventStatus, string> = {
  [EventStatus.upcoming]: "আসন্ন",
  [EventStatus.ongoing]: "চলমান",
  [EventStatus.completed]: "সম্পন্ন",
  [EventStatus.cancelled]: "বাতিল",
};

const statusColors: Record<EventStatus, string> = {
  [EventStatus.upcoming]: "bg-blue-100 text-blue-700",
  [EventStatus.ongoing]: "bg-yellow-100 text-yellow-700",
  [EventStatus.completed]: "bg-green-100 text-green-700",
  [EventStatus.cancelled]: "bg-red-100 text-red-700",
};

const emptyForm = {
  title: "",
  description: "",
  location: "",
  maxAttendees: "50",
  status: EventStatus.upcoming,
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

export default function Events({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventView | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: events = mockEvents, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      if (!actor) return mockEvents;
      const list = await actor.getAllEvents();
      return list.length > 0 ? list : mockEvents;
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!actor) throw new Error();
      const ev: EventView = {
        id: BigInt(Date.now()),
        title: data.title,
        description: data.description,
        location: data.location,
        maxAttendees: BigInt(Number(data.maxAttendees)),
        registeredAttendees: [] as Principal[],
        date: BigInt(Date.now() * 1_000_000),
        status: data.status,
      };
      await actor.addEvent(ev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("ইভেন্ট যোগ করা হয়েছে");
      setOpen(false);
    },
    onError: () => toast.error("ইভেন্ট যোগ করতে ব্যর্থ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error();
      await actor.deleteEvent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ইভেন্ট ব্যবস্থাপনা</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditEvent(null);
              setForm(emptyForm);
              setOpen(true);
            }}
            style={{ background: "#2D7DD2" }}
          >
            <Plus size={16} className="mr-1" /> নতুন ইভেন্ট
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <Card key={String(ev.id)} className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{ev.title}</CardTitle>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${statusColors[ev.status]}`}
                  >
                    {statusLabels[ev.status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {ev.description}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{ev.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays size={14} />
                  <span>
                    {new Date(Number(ev.date) / 1_000_000).toLocaleDateString(
                      "bn-BD",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users size={14} />
                  <span>
                    {ev.registeredAttendees.length} / {Number(ev.maxAttendees)}{" "}
                    জন নিবন্ধিত
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditEvent(ev);
                        setForm({
                          title: ev.title,
                          description: ev.description,
                          location: ev.location,
                          maxAttendees: String(Number(ev.maxAttendees)),
                          status: ev.status,
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil size={13} className="mr-1" /> সম্পাদনা
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(ev.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEvent ? "ইভেন্ট সম্পাদনা" : "নতুন ইভেন্ট"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>বিবরণ</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div>
              <Label>স্থান</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>সর্বোচ্চ অংশগ্রহণকারী</Label>
              <Input
                type="number"
                value={form.maxAttendees}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxAttendees: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>অবস্থা</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as EventStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventStatus.upcoming}>আসন্ন</SelectItem>
                  <SelectItem value={EventStatus.ongoing}>চলমান</SelectItem>
                  <SelectItem value={EventStatus.completed}>সম্পন্ন</SelectItem>
                  <SelectItem value={EventStatus.cancelled}>বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={() => addMutation.mutate(form)}
              disabled={addMutation.isPending}
              style={{ background: "#2D7DD2" }}
            >
              {addMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editEvent ? "আপডেট" : "যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
