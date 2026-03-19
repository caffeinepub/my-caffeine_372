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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface ConstitutionChapter {
  id: bigint;
  chapterNumber: bigint;
  title: string;
  content: string;
}

const _SEED_CHAPTERS: ConstitutionChapter[] = [
  {
    id: 1n,
    chapterNumber: 1n,
    title: "প্রতিষ্ঠানের নাম ও পরিচিতি",
    content:
      "এই সংগঠনের নাম হবে 'আপন ফাউন্ডেশন'। ইহা একটি অরাজনৈতিক, অলাভজনক ও স্বেচ্ছাসেবী সামাজিক সংগঠন। সংগঠনটি বাংলাদেশের প্রচলিত আইন অনুযায়ী পরিচালিত হবে।",
  },
  {
    id: 2n,
    chapterNumber: 2n,
    title: "উদ্দেশ্য ও লক্ষ্য",
    content:
      "সমাজের সুবিধাবঞ্চিত মানুষদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে কাজ করা। দারিদ্র্য বিমোচনে কার্যকর ভূমিকা পালন করা। শীতবস্ত্র বিতরণ, শিক্ষা উপকরণ সহায়তা এবং মানবিক সেবা প্রদান করা।",
  },
  {
    id: 3n,
    chapterNumber: 3n,
    title: "সদস্যপদ",
    content:
      "বাংলাদেশের যেকোনো নাগরিক যিনি সংগঠনের উদ্দেশ্য ও লক্ষ্যে বিশ্বাসী এবং সংগঠনের গঠনতন্ত্র মেনে চলতে সম্মত, তিনি সদস্য হতে পারবেন। সদস্যপদের জন্য নির্ধারিত ফর্ম পূরণ করে কার্যনির্বাহী পরিষদের কাছে আবেদন করতে হবে।",
  },
  {
    id: 4n,
    chapterNumber: 4n,
    title: "সাংগঠনিক কাঠামো",
    content:
      "সংগঠনটি তিনটি পরিষদ নিয়ে গঠিত: (১) সাধারণ পরিষদ — সকল নিয়মিত সদস্য নিয়ে গঠিত। (২) কার্যনির্বাহী পরিষদ — সংগঠনের দৈনন্দিন কার্যক্রম পরিচালনা করে। (৩) উপদেষ্টা পরিষদ — সংগঠনের কার্যক্রমে পরামর্শ ও দিকনির্দেশনা প্রদান করে।",
  },
  {
    id: 5n,
    chapterNumber: 5n,
    title: "আর্থিক ব্যবস্থাপনা",
    content:
      "সংগঠনের সকল আয়-ব্যয়ের হিসাব সুষ্ঠুভাবে সংরক্ষণ করতে হবে। প্রতি অর্থবছর শেষে অডিট সম্পন্ন করতে হবে। সদস্যদের ত্রৈমাসিক চাঁদা ও বাহিরের অনুদান সংগঠনের প্রধান আয়ের উৎস।",
  },
];

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

interface FormState {
  title: string;
  content: string;
}

const emptyForm: FormState = { title: "", content: "" };

export default function ConstitutionPage({ actor }: Props) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<ConstitutionChapter | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ConstitutionChapter | null>(
    null,
  );

  const LS_KEY = "aponConstitutionChapters";

  function loadFromLS(): ConstitutionChapter[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((c: any) => ({
          ...c,
          id: BigInt(c.id),
          chapterNumber: BigInt(c.chapterNumber),
        }));
      }
    } catch {}
    return [];
  }

  function saveToLS(list: ConstitutionChapter[]) {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify(
          list.map((c) => ({
            ...c,
            id: String(c.id),
            chapterNumber: String(c.chapterNumber),
          })),
        ),
      );
    } catch {}
  }

  const { data: chapters = [], isLoading } = useQuery<ConstitutionChapter[]>({
    queryKey: ["chapters"],
    queryFn: async () => {
      if (!actor) {
        return loadFromLS();
      }
      try {
        const list = await (actor as any).getAllChapters();
        if (list.length > 0) {
          const sorted = [...list].sort(
            (a: ConstitutionChapter, b: ConstitutionChapter) =>
              Number(a.chapterNumber) - Number(b.chapterNumber),
          );
          saveToLS(sorted);
          return sorted;
        }
        return loadFromLS();
      } catch {
        return loadFromLS();
      }
    },
    enabled: true,
  });

  const addMutation = useMutation({
    mutationFn: async (f: FormState) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).addChapter(f.title, f.content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("অধ্যায় যোগ করা হয়েছে");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => {
      // Fallback: save to localStorage
      const current = chapters;
      const newId = BigInt(Date.now());
      const newChapter: ConstitutionChapter = {
        id: newId,
        chapterNumber: BigInt(current.length + 1),
        title: form.title,
        content: form.content,
      };
      const updated = [...current, newChapter];
      try {
        localStorage.setItem(
          "aponConstitutionChapters",
          JSON.stringify(
            updated.map((c) => ({
              ...c,
              id: String(c.id),
              chapterNumber: String(c.chapterNumber),
            })),
          ),
        );
      } catch {}
      qc.setQueryData(["chapters"], updated);
      toast.success("অধ্যায় যোগ করা হয়েছে (স্থানীয়ভাবে)");
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      chapter,
      f,
    }: { chapter: ConstitutionChapter; f: FormState }) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).updateChapter(chapter.id, f.title, f.content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("অধ্যায় আপডেট হয়েছে");
      setDialogOpen(false);
      setEditChapter(null);
      setForm(emptyForm);
    },
    onError: () => {
      // Fallback: update localStorage
      if (editChapter) {
        const updated = chapters.map((c) =>
          c.id === editChapter.id
            ? { ...c, title: form.title, content: form.content }
            : c,
        );
        try {
          localStorage.setItem(
            "aponConstitutionChapters",
            JSON.stringify(
              updated.map((c) => ({
                ...c,
                id: String(c.id),
                chapterNumber: String(c.chapterNumber),
              })),
            ),
          );
        } catch {}
        qc.setQueryData(["chapters"], updated);
        toast.success("অধ্যায় আপডেট হয়েছে (স্থানীয়ভাবে)");
        setDialogOpen(false);
        setEditChapter(null);
        setForm(emptyForm);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).deleteChapter(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("অধ্যায় মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
    },
    onError: (_, id) => {
      // Fallback: delete from localStorage
      const updated = chapters.filter((c) => c.id !== id);
      try {
        localStorage.setItem(
          "aponConstitutionChapters",
          JSON.stringify(
            updated.map((c) => ({
              ...c,
              id: String(c.id),
              chapterNumber: String(c.chapterNumber),
            })),
          ),
        );
      } catch {}
      qc.setQueryData(["chapters"], updated);
      toast.success("অধ্যায় মুছে ফেলা হয়েছে (স্থানীয়ভাবে)");
      setDeleteTarget(null);
    },
  });

  function openAdd() {
    setEditChapter(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(ch: ConstitutionChapter) {
    setEditChapter(ch);
    setForm({ title: ch.title, content: ch.content });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("অধ্যায়ের শিরোনাম আবশ্যক");
      return;
    }
    if (!form.content.trim()) {
      toast.error("অধ্যায়ের বিষয়বস্তু আবশ্যক");
      return;
    }
    if (editChapter) {
      updateMutation.mutate({ chapter: editChapter, f: form });
    } else {
      addMutation.mutate(form);
    }
  }

  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={24} style={{ color: "#166534" }} />
          <h1 className="text-2xl font-bold text-foreground">গঠনতন্ত্র</h1>
        </div>
        <Button
          onClick={openAdd}
          style={{ background: "#166534" }}
          className="text-white"
          data-ocid="constitution.open_modal_button"
        >
          <Plus size={16} className="mr-1" /> নতুন অধ্যায় যোগ করুন
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="constitution.loading_state"
        >
          <Loader2
            className="animate-spin h-8 w-8"
            style={{ color: "#166534" }}
          />
        </div>
      ) : chapters.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="constitution.empty_state"
        >
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">কোনো অধ্যায় যোগ করা হয়নি</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, idx) => (
            <Card
              key={String(ch.id)}
              className="border-l-4"
              style={{ borderLeftColor: "#166534" }}
              data-ocid={`constitution.item.${idx + 1}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: "#166534" }}
                    >
                      {String(ch.chapterNumber)}
                    </span>
                    <CardTitle className="text-lg" style={{ color: "#166534" }}>
                      {ch.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(ch)}
                      className="h-7 w-7"
                      data-ocid={`constitution.edit_button.${idx + 1}`}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteTarget(ch)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      data-ocid={`constitution.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {ch.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" data-ocid="constitution.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#166534" }}>
              {editChapter ? "অধ্যায় সম্পাদনা" : "নতুন অধ্যায় যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                অধ্যায়ের শিরোনাম *
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="অধ্যায়ের শিরোনাম লিখুন"
                className="mt-1"
                data-ocid="constitution.dialog.input"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                বিষয়বস্তু *
              </Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="অধ্যায়ের বিস্তারিত বিষয়বস্তু লিখুন"
                rows={8}
                className="mt-1"
                data-ocid="constitution.dialog.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditChapter(null);
              }}
              data-ocid="constitution.dialog.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating}
              style={{ background: "#166534" }}
              className="text-white"
              data-ocid="constitution.dialog.submit_button"
            >
              {isMutating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editChapter ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent data-ocid="constitution.delete.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#991b1b" }}>
              অধ্যায় মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            আপনি কি নিশ্চিত যে <strong>"{deleteTarget?.title}"</strong> অধ্যায়টি
            মুছে ফেলতে চান?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="constitution.delete.cancel_button"
            >
              না, বাতিল
            </Button>
            <Button
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="constitution.delete.confirm_button"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              হ্যাঁ, মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
