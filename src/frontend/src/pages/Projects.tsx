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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectStatus, type backendInterface } from "../backend";
import type { Project } from "../backend";

const mockProjects: Project[] = [
  {
    id: 1n,
    title: "বৃক্ষরোপণ প্রকল্প",
    description: "১০,০০০ গাছ লাগানোর উদ্যোগ",
    startDate: BigInt(Date.now()),
    endDate: BigInt(Date.now()),
    status: ProjectStatus.active,
    budget: 500000,
    spent: 180000,
  },
  {
    id: 2n,
    title: "শিক্ষা বৃত্তি কর্মসূচি",
    description: "সুবিধাবঞ্চিত শিক্ষার্থীদের বৃত্তি",
    startDate: BigInt(Date.now()),
    endDate: BigInt(Date.now()),
    status: ProjectStatus.active,
    budget: 1000000,
    spent: 450000,
  },
  {
    id: 3n,
    title: "স্বাস্থ্য সেবা কেন্দ্র",
    description: "গ্রামীণ স্বাস্থ্যসেবা",
    startDate: BigInt(Date.now()),
    endDate: BigInt(Date.now()),
    status: ProjectStatus.completed,
    budget: 750000,
    spent: 720000,
  },
  {
    id: 4n,
    title: "নারী উদ্যোক্তা প্রশিক্ষণ",
    description: "নারীদের দক্ষতা উন্নয়ন",
    startDate: BigInt(Date.now()),
    endDate: BigInt(Date.now()),
    status: ProjectStatus.planning,
    budget: 300000,
    spent: 0,
  },
];

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.planning]: "পরিকল্পনা",
  [ProjectStatus.active]: "সক্রিয়",
  [ProjectStatus.completed]: "সম্পন্ন",
  [ProjectStatus.onHold]: "বিরতি",
};

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.planning]: "bg-yellow-100 text-yellow-700",
  [ProjectStatus.active]: "bg-green-100 text-green-700",
  [ProjectStatus.completed]: "bg-blue-100 text-blue-700",
  [ProjectStatus.onHold]: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  title: "",
  description: "",
  budget: "",
  status: ProjectStatus.planning,
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

export default function Projects({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: projects = mockProjects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return mockProjects;
      const list = await actor.getAllProjects();
      return list.length > 0 ? list : mockProjects;
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!actor) throw new Error();
      const p: Project = {
        id: BigInt(Date.now()),
        title: data.title,
        description: data.description,
        budget: Number(data.budget),
        spent: 0,
        startDate: BigInt(Date.now()),
        endDate: BigInt(Date.now() + 90 * 86400000),
        status: data.status,
      };
      await actor.addProject(p);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("প্রকল্প যোগ করা হয়েছে");
      setOpen(false);
    },
    onError: () => toast.error("প্রকল্প যোগ করতে ব্যর্থ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error();
      await actor.deleteProject(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">প্রকল্প ব্যবস্থাপনা</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditProject(null);
              setForm(emptyForm);
              setOpen(true);
            }}
            style={{ background: "#2D7DD2" }}
          >
            <Plus size={16} className="mr-1" /> নতুন প্রকল্প
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const pct =
              p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
            return (
              <Card key={String(p.id)} className="shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${statusColors[p.status]}`}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">বাজেট ব্যবহার</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>ব্যয়: ৳{p.spent.toLocaleString()}</span>
                      <span>বাজেট: ৳{p.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditProject(p);
                          setForm({
                            title: p.title,
                            description: p.description,
                            budget: String(p.budget),
                            status: p.status,
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil size={13} className="mr-1" /> সম্পাদনা
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(p.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editProject ? "প্রকল্প সম্পাদনা" : "নতুন প্রকল্প"}
            </DialogTitle>
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
              <Label>বাজেট (৳)</Label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>অবস্থা</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as ProjectStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectStatus.planning}>
                    পরিকল্পনা
                  </SelectItem>
                  <SelectItem value={ProjectStatus.active}>সক্রিয়</SelectItem>
                  <SelectItem value={ProjectStatus.completed}>সম্পন্ন</SelectItem>
                  <SelectItem value={ProjectStatus.onHold}>বিরতি</SelectItem>
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
              {editProject ? "আপডেট" : "যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
