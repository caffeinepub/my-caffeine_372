import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  MemberStatus,
  MembershipRole,
  type backendInterface,
} from "../backend";
import type { Member } from "../backend";

const mockMembers: Member[] = [
  {
    id: Principal.anonymous(),
    name: "রাহেলা বেগম",
    email: "rahela@example.com",
    phone: "01711000001",
    role: MembershipRole.board,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now()),
    notes: "",
  },
  {
    id: Principal.anonymous(),
    name: "করিম হোসেন",
    email: "karim@example.com",
    phone: "01711000002",
    role: MembershipRole.volunteer,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now()),
    notes: "",
  },
  {
    id: Principal.anonymous(),
    name: "সালমা খানম",
    email: "salma@example.com",
    phone: "01711000003",
    role: MembershipRole.member,
    status: MemberStatus.inactive,
    joinDate: BigInt(Date.now()),
    notes: "",
  },
];

const roleLabels: Record<MembershipRole, string> = {
  [MembershipRole.board]: "বোর্ড",
  [MembershipRole.volunteer]: "স্বেচ্ছাসেবী",
  [MembershipRole.member]: "সদস্য",
};

const roleColors: Record<MembershipRole, string> = {
  [MembershipRole.board]: "bg-purple-100 text-purple-700",
  [MembershipRole.volunteer]: "bg-blue-100 text-blue-700",
  [MembershipRole.member]: "bg-gray-100 text-gray-700",
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: MembershipRole.member,
  notes: "",
};

export default function Members({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: members = mockMembers, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return mockMembers;
      const list = await actor.getAllMembers();
      return list.length > 0 ? list : mockMembers;
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!actor) throw new Error("No actor");
      const member: Member = {
        id: Principal.anonymous(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: MemberStatus.active,
        joinDate: BigInt(Date.now()),
        notes: data.notes,
      };
      await actor.addMember(member);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য যোগ করা হয়েছে");
      setOpen(false);
    },
    onError: () => toast.error("সদস্য যোগ করতে ব্যর্থ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: Principal) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMember(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলতে ব্যর্থ"),
  });

  const openAdd = () => {
    setEditMember(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (m: Member) => {
    setEditMember(m);
    setForm({
      name: m.name,
      email: m.email,
      phone: m.phone,
      role: m.role,
      notes: m.notes,
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      toast.error("নাম এবং ইমেইল আবশ্যক");
      return;
    }
    addMutation.mutate(form);
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">সদস্য ব্যবস্থাপনা</h1>
        {isAdmin && (
          <Button onClick={openAdd} style={{ background: "#2D7DD2" }}>
            <Plus size={16} className="mr-1" /> নতুন সদস্য
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} className="text-muted-foreground" />
            <Input
              placeholder="সদস্য খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm h-8"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>ইমেইল</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>ভূমিকা</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">কার্যক্রম</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.email}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[m.role]}`}
                      >
                        {roleLabels[m.role]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.status === MemberStatus.active
                            ? "default"
                            : "secondary"
                        }
                        style={
                          m.status === MemberStatus.active
                            ? { background: "#2EAD63" }
                            : {}
                        }
                      >
                        {m.status === MemberStatus.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(m)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(m.id)}
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMember ? "সদস্য সম্পাদনা" : "নতুন সদস্য যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>নাম *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="সদস্যের নাম"
              />
            </div>
            <div>
              <Label>ইমেইল *</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>ফোন</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="01700000000"
              />
            </div>
            <div>
              <Label>ভূমিকা</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as MembershipRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MembershipRole.member}>সদস্য</SelectItem>
                  <SelectItem value={MembershipRole.volunteer}>
                    স্বেচ্ছাসেবী
                  </SelectItem>
                  <SelectItem value={MembershipRole.board}>বোর্ড</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>নোট</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="অতিরিক্ত তথ্য..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addMutation.isPending}
              style={{ background: "#2D7DD2" }}
            >
              {addMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editMember ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
