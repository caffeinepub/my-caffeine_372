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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DonationCategory, type backendInterface } from "../backend";
import type { Donation } from "../backend";

const mockDonations: Donation[] = [
  {
    id: 1n,
    donorName: "আহমেদ করিম",
    amount: 10000,
    date: BigInt(Date.now()),
    category: DonationCategory.cash,
    notes: "মাসিক অনুদান",
    memberId: undefined,
  },
  {
    id: 2n,
    donorName: "ফারহানা ইসলাম",
    amount: 25000,
    date: BigInt(Date.now() - 86400000),
    category: DonationCategory.grant,
    notes: "প্রকল্প সহায়তা",
    memberId: undefined,
  },
  {
    id: 3n,
    donorName: "রফিকুল হক",
    amount: 5000,
    date: BigInt(Date.now() - 172800000),
    category: DonationCategory.inKind,
    notes: "শিক্ষা সামগ্রী",
    memberId: undefined,
  },
];

const categoryLabels: Record<DonationCategory, string> = {
  [DonationCategory.cash]: "নগদ",
  [DonationCategory.inKind]: "বস্তু-সামগ্রী",
  [DonationCategory.grant]: "অনুদান",
};

const categoryColors: Record<DonationCategory, string> = {
  [DonationCategory.cash]: "bg-green-100 text-green-700",
  [DonationCategory.inKind]: "bg-blue-100 text-blue-700",
  [DonationCategory.grant]: "bg-purple-100 text-purple-700",
};

const emptyForm = {
  donorName: "",
  amount: "",
  category: DonationCategory.cash,
  notes: "",
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

export default function Donations({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: donations = mockDonations, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      if (!actor) return mockDonations;
      const list = await actor.getAllDonations();
      return list.length > 0 ? list : mockDonations;
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!actor) throw new Error();
      const d: Donation = {
        id: BigInt(Date.now()),
        donorName: data.donorName,
        amount: Number(data.amount),
        date: BigInt(Date.now()),
        category: data.category,
        notes: data.notes,
        memberId: undefined,
      };
      await actor.addDonation(d);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donations"] });
      toast.success("অনুদান যোগ করা হয়েছে");
      setOpen(false);
    },
    onError: () => toast.error("অনুদান যোগ করতে ব্যর্থ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error();
      await actor.deleteDonation(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["donations"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  const total = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">দান ও অনুদান</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
            style={{ background: "#2D7DD2" }}
          >
            <Plus size={16} className="mr-1" /> নতুন অনুদান
          </Button>
        )}
      </div>

      <Card style={{ borderLeft: "4px solid #2EAD63" }}>
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#2EAD6318" }}
          >
            <Heart size={20} style={{ color: "#2EAD63" }} />
          </div>
          <div>
            <div className="text-2xl font-bold">৳{total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">মোট অনুদান সংগ্রহ</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>দাতার নাম</TableHead>
                  <TableHead>পরিমাণ</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>ধরন</TableHead>
                  <TableHead>নোট</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">কার্যক্রম</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={String(d.id)}>
                    <TableCell className="font-medium">{d.donorName}</TableCell>
                    <TableCell
                      className="font-semibold"
                      style={{ color: "#2EAD63" }}
                    >
                      ৳{d.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(Number(d.date) / 1_000_000).toLocaleDateString(
                        "bn-BD",
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[d.category]}`}
                      >
                        {categoryLabels[d.category]}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.notes}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(d.id)}
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
            <DialogTitle>নতুন অনুদান যোগ করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>দাতার নাম *</Label>
              <Input
                value={form.donorName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, donorName: e.target.value }))
                }
                placeholder="দাতার নাম"
              />
            </div>
            <div>
              <Label>পরিমাণ (৳) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label>ধরন</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as DonationCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DonationCategory.cash}>নগদ</SelectItem>
                  <SelectItem value={DonationCategory.inKind}>
                    বস্তু-সামগ্রী
                  </SelectItem>
                  <SelectItem value={DonationCategory.grant}>অনুদান</SelectItem>
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
                rows={2}
              />
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
              )}{" "}
              যোগ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
