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
import {
  BookOpen,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { loadSettings } from "../store/settingsStore";

interface ConstitutionChapter {
  id: bigint;
  chapterNumber: bigint;
  title: string;
  content: string;
}

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

interface FormState {
  title: string;
  content: string;
}

const emptyForm: FormState = { title: "", content: "" };

export default function ConstitutionPage({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<ConstitutionChapter | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ConstitutionChapter | null>(
    null,
  );

  const org = loadSettings();
  const logoSrc =
    org.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

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
      if (!actor) return loadFromLS();
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
      const current = chapters;
      const newId = BigInt(Date.now());
      const newChapter: ConstitutionChapter = {
        id: newId,
        chapterNumber: BigInt(current.length + 1),
        title: form.title,
        content: form.content,
      };
      const updated = [...current, newChapter];
      saveToLS(updated);
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
      if (editChapter) {
        const updated = chapters.map((c) =>
          c.id === editChapter.id
            ? { ...c, title: form.title, content: form.content }
            : c,
        );
        saveToLS(updated);
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
      const updated = chapters.filter((c) => c.id !== id);
      saveToLS(updated);
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

  function handleDownloadPDF() {
    const year = new Date().getFullYear();
    const chapterPages = chapters
      .map(
        (ch) => `
      <div class="chapter-block">
        <div class="chapter-header">
          <div class="org-header">
            <img src="${logoSrc}" class="org-logo" alt="" onerror="this.style.display='none'"/>
            <div class="org-info">
              <div class="org-name"><span class="name1">${org.orgName1}</span> <span class="name2">${org.orgName2}</span></div>
              <div class="org-meta">${org.address} | ইমেইল: ${org.email} | হোয়াটসঅ্যাপ: ${org.whatsapp} | ওয়েব: ${org.website}</div>
            </div>
          </div>
          <div class="chapter-badge-row">
            <span class="chapter-badge">অধ্যায় ${String(ch.chapterNumber)}</span>
            <span class="chapter-title">${ch.title}</span>
          </div>
        </div>
        <div class="chapter-content">${ch.content.replace(/\n/g, "<br/>")}</div>
      </div>
    `,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<title>গঠনতন্ত্র — ${org.orgName1} ${org.orgName2}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
body { font-family:'Noto Sans Bengali',sans-serif; background:#fff; }

/* Cover Page */
.cover-page {
  width:210mm;
  height:297mm;
  background: linear-gradient(160deg, #0f4c2a 0%, #1a6b3a 40%, #0f4c2a 100%);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  page-break-after:always;
  position:relative;
  overflow:hidden;
}
.cover-bg-ornament {
  position:absolute; top:0; left:0; right:0; bottom:0;
  background-image: radial-gradient(circle at 20% 20%, rgba(212,175,55,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.08) 0%, transparent 50%);
}
.cover-logo {
  width:100px; height:100px; object-fit:contain;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  margin-bottom:24px;
}
.cover-top-line {
  width:180px; height:2px;
  background:linear-gradient(90deg, transparent, #d4af37, transparent);
  margin-bottom:28px;
}
.cover-main-title {
  font-size:34px; font-weight:800; color:#d4af37;
  letter-spacing:0.04em;
  text-align:center;
  line-height:1.3;
  margin-bottom:8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.cover-org-name {
  font-size:22px; font-weight:700; color:#ffffff;
  text-align:center; margin-bottom:30px;
  letter-spacing:0.02em;
}
.cover-divider {
  width:260px; height:1px;
  background:linear-gradient(90deg, transparent, #d4af37 30%, #d4af37 70%, transparent);
  margin-bottom:30px;
}
.cover-meta {
  text-align:center; color:rgba(255,255,255,0.82);
  font-size:13px; line-height:2; max-width:340px;
}
.cover-meta .label { color:#d4af37; font-weight:600; font-size:12px; display:block; margin-top:14px; }
.cover-bottom-line {
  width:180px; height:2px;
  background:linear-gradient(90deg, transparent, #d4af37, transparent);
  margin-top:30px; margin-bottom:12px;
}
.cover-year { color:rgba(255,255,255,0.55); font-size:13px; }

/* Chapter Pages */
.chapter-block {
  width:210mm;
  margin:0 auto;
  padding:18mm 20mm;
  background:#fff;
  page-break-after:always;
  page-break-inside:auto;
}
.org-header { display:flex; align-items:center; gap:14px; border-bottom:3px double #166534; padding-bottom:10px; margin-bottom:14px; }
.org-logo { width:56px; height:56px; object-fit:contain; }
.org-name { font-size:20px; font-weight:700; }
.name1 { color:${org.color1}; }
.name2 { color:${org.color2}; }
.org-meta { font-size:11px; color:#444; margin-top:3px; line-height:1.6; }
.chapter-badge-row { display:flex; align-items:center; gap:12px; margin:18px 0 10px; }
.chapter-badge { background:#166534; color:#fff; font-size:12px; font-weight:700; padding:4px 14px; border-radius:20px; white-space:nowrap; }
.chapter-title { font-size:17px; font-weight:700; color:#166534; }
.chapter-content { font-size:13px; line-height:2.1; color:#111; white-space:pre-wrap; margin-top:10px; }

@media print {
  @page { size:A4; margin:0; }
  body { margin:0; }
  .cover-page {
    page-break-after:always;
    background: linear-gradient(160deg, #0f4c2a 0%, #1a6b3a 40%, #0f4c2a 100%) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .cover-main-title { color:#d4af37 !important; }
  .cover-org-name { color:#ffffff !important; }
  .cover-meta { color:rgba(255,255,255,0.9) !important; }
  .cover-meta .label { color:#d4af37 !important; }
  .cover-year { color:rgba(255,255,255,0.7) !important; }
  .cover-top-line, .cover-bottom-line { background:linear-gradient(90deg, transparent, #d4af37, transparent) !important; }
  .cover-divider { background:linear-gradient(90deg, transparent, #d4af37 30%, #d4af37 70%, transparent) !important; }
  .chapter-badge { background:#166534 !important; color:#fff !important; }
  .chapter-block { page-break-after:always; page-break-inside:auto; }
}
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover-page">
  <div class="cover-bg-ornament"></div>
  <img src="${logoSrc}" class="cover-logo" alt="" onerror="this.style.display='none'"/>
  <div class="cover-top-line"></div>
  <div class="cover-main-title">গঠনতন্ত্র ও নীতিমালা</div>
  <div class="cover-org-name">${org.orgName1} ${org.orgName2}</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <span class="label">সংকলন ও সম্পাদনায়</span>
    মুহাম্মদ উজ্জল মিয়া<br/>উপদেষ্টা, আপন ফাউন্ডেশন
    <span class="label">সহযোগিতায়</span>
    আব্দুল জিহাদ<br/>প্রধান উদ্যোক্তা ও প্রতিষ্ঠাতা উপদেষ্টা, আপন ফাউন্ডেশন
  </div>
  <div class="cover-bottom-line"></div>
  <div class="cover-year">${year}</div>
</div>

<!-- Chapter Pages -->
${chapterPages}

<script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      toast.error("পপআপ ব্লক হয়েছে, অনুগ্রহ করে অনুমতি দিন");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={24} style={{ color: "#166534" }} />
          <h1 className="text-2xl font-bold text-foreground">গঠনতন্ত্র</h1>
        </div>
        <div className="flex items-center gap-2">
          {chapters.length > 0 && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
              data-ocid="constitution.download_button"
            >
              <Download size={16} className="mr-1" /> PDF ডাউনলোড
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={openAdd}
              style={{ background: "#166534" }}
              className="text-white"
              data-ocid="constitution.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> নতুন অধ্যায় যোগ করুন
            </Button>
          )}
        </div>
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
                  {isAdmin && (
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
                  )}
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

      {isAdmin && (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              className="max-w-2xl"
              data-ocid="constitution.dialog"
            >
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
                  {isMutating && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
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
                আপনি কি নিশ্চিত যে <strong>"{deleteTarget?.title}"</strong>{" "}
                অধ্যায়টি মুছে ফেলতে চান?
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
        </>
      )}
    </div>
  );
}
