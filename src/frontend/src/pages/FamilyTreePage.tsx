import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Edit2,
  GitBranch,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ModuleHeader from "../components/ModuleHeader";

interface FamilyNode {
  id: string;
  name: string;
  parentId: string | null;
  generationLevel: number;
}

type ViewMode =
  | "tree"
  | "list"
  | "table"
  | "timeline"
  | "card"
  | "expandable"
  | "hybrid";

const STORAGE_KEY = "apon_family_tree";

function loadNodes(): FamilyNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNodes(nodes: FamilyNode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

function getChildren(
  nodes: FamilyNode[],
  parentId: string | null,
): FamilyNode[] {
  return nodes.filter((n) => n.parentId === parentId);
}

function getNodeById(nodes: FamilyNode[], id: string): FamilyNode | undefined {
  return nodes.find((n) => n.id === id);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: "tree", label: "Tree" },
  { key: "list", label: "তালিকা" },
  { key: "table", label: "টেবিল" },
  { key: "timeline", label: "টাইমলাইন" },
  { key: "card", label: "কার্ড" },
  { key: "expandable", label: "ভাঁজযোগ্য" },
  { key: "hybrid", label: "হাইব্রিড" },
];

const GEN_COLORS = [
  "#1a4d2e",
  "#1e40af",
  "#7c2d12",
  "#4a1d96",
  "#065f46",
  "#9d174d",
  "#1f2937",
];

function genColor(level: number) {
  return GEN_COLORS[level % GEN_COLORS.length];
}

// ─── Tree View ────────────────────────────────────────────────────────────────
function TreeNode({
  node,
  nodes,
  selectedId,
  onSelect,
  searchQuery,
}: {
  node: FamilyNode;
  nodes: FamilyNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
}) {
  const children = getChildren(nodes, node.id);
  const isSelected = selectedId === node.id;
  const isMatch =
    searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all whitespace-nowrap ${
          isSelected
            ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
            : isMatch
              ? "border-yellow-400 bg-yellow-50 text-yellow-900"
              : "border-border bg-white text-foreground hover:border-primary hover:shadow-md"
        }`}
        style={
          !isSelected
            ? { borderColor: genColor(node.generationLevel) }
            : undefined
        }
      >
        <div className="text-xs opacity-70 mb-0.5">
          প্রজন্ম {node.generationLevel + 1}
        </div>
        {node.name}
      </button>
      {children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-border" />
          <div className="flex items-start gap-6 relative">
            {children.length > 1 && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5 bg-border"
                style={{
                  top: 0,
                  marginLeft: `calc(50% / ${children.length})`,
                }}
              />
            )}
            {children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center">
                {children.length > 1 && <div className="w-0.5 h-5 bg-border" />}
                {children.length === 1 && idx === 0 && (
                  <div className="w-0.5 h-5 bg-border" />
                )}
                <TreeNode
                  node={child}
                  nodes={nodes}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TreeViewComponent({
  nodes,
  selectedId,
  onSelect,
  searchQuery,
}: {
  nodes: FamilyNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
}) {
  const roots = getChildren(nodes, null);
  if (roots.length === 0) return null;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-12 min-w-max p-4 justify-center">
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            node={root}
            nodes={nodes}
            selectedId={selectedId}
            onSelect={onSelect}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Expandable Tree ──────────────────────────────────────────────────────────
function ExpandableNode({
  node,
  nodes,
  expandedIds,
  toggleExpand,
  selectedId,
  onSelect,
  searchQuery,
  depth,
}: {
  node: FamilyNode;
  nodes: FamilyNode[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  depth: number;
}) {
  const children = getChildren(nodes, node.id);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isMatch =
    searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div style={{ marginLeft: `${depth * 24}px` }} className="mb-1">
      <div className="flex items-center gap-2">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => toggleExpand(node.id)}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
            isSelected
              ? "bg-primary text-primary-foreground border-primary"
              : isMatch
                ? "border-yellow-400 bg-yellow-50 text-yellow-900"
                : "border-border bg-white hover:border-primary"
          }`}
        >
          {node.name}
          <span className="ml-2 text-xs opacity-60">
            প্রজন্ম {node.generationLevel + 1}
          </span>
        </button>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="mt-1 border-l-2 border-border ml-2.5">
          {children.map((child) => (
            <ExpandableNode
              key={child.id}
              node={child}
              nodes={nodes}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
              searchQuery={searchQuery}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── List View (indented) ─────────────────────────────────────────────────────
function ListRow({
  node,
  nodes,
  searchQuery,
  depth,
}: {
  node: FamilyNode;
  nodes: FamilyNode[];
  searchQuery: string;
  depth: number;
}) {
  const children = getChildren(nodes, node.id);
  const isMatch =
    searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded ${
          isMatch ? "bg-yellow-50" : "hover:bg-secondary/50"
        }`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: genColor(node.generationLevel) }}
        />
        <span className="text-sm font-medium">{node.name}</span>
        <Badge variant="outline" className="text-xs ml-auto">
          প্রজন্ম {node.generationLevel + 1}
        </Badge>
      </div>
      {children.map((child) => (
        <ListRow
          key={child.id}
          node={child}
          nodes={nodes}
          searchQuery={searchQuery}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FamilyTreePage({ isAdmin }: { isAdmin: boolean }) {
  const [nodes, setNodes] = useState<FamilyNode[]>(loadNodes);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "root" | "child" | "sibling" | "edit"
  >("root");
  const [modalName, setModalName] = useState("");
  const [modalError, setModalError] = useState("");
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    if (modalOpen && modalInputRef.current) {
      setTimeout(() => modalInputRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openModal(mode: "root" | "child" | "sibling" | "edit") {
    setModalMode(mode);
    if (mode === "edit" && selectedId) {
      const n = getNodeById(nodes, selectedId);
      setModalName(n?.name ?? "");
    } else {
      setModalName("");
    }
    setModalError("");
    setModalOpen(true);
  }

  function handleModalSubmit() {
    const trimmed = modalName.trim();
    if (!trimmed) {
      setModalError("নাম খালি রাখা যাবে না।");
      return;
    }
    if (modalMode === "root") {
      const root: FamilyNode = {
        id: generateId(),
        name: trimmed,
        parentId: null,
        generationLevel: 0,
      };
      setNodes([root]);
      setExpandedIds(new Set([root.id]));
    } else if (modalMode === "child" && selectedId) {
      const parent = getNodeById(nodes, selectedId);
      if (!parent) return;
      const child: FamilyNode = {
        id: generateId(),
        name: trimmed,
        parentId: selectedId,
        generationLevel: parent.generationLevel + 1,
      };
      setNodes((prev) => [...prev, child]);
      setExpandedIds((prev) => new Set([...prev, selectedId]));
    } else if (modalMode === "sibling" && selectedId) {
      const node = getNodeById(nodes, selectedId);
      if (!node) return;
      const sibling: FamilyNode = {
        id: generateId(),
        name: trimmed,
        parentId: node.parentId,
        generationLevel: node.generationLevel,
      };
      setNodes((prev) => [...prev, sibling]);
    } else if (modalMode === "edit" && selectedId) {
      setNodes((prev) =>
        prev.map((n) => (n.id === selectedId ? { ...n, name: trimmed } : n)),
      );
    }
    setModalOpen(false);
    setModalName("");
  }

  function handleDelete() {
    if (!selectedId) return;
    // recursively collect all descendant ids
    function collectIds(id: string): string[] {
      const children = getChildren(nodes, id);
      return [id, ...children.flatMap((c) => collectIds(c.id))];
    }
    const toDelete = new Set(collectIds(selectedId));
    setNodes((prev) => prev.filter((n) => !toDelete.has(n.id)));
    setSelectedId(null);
  }

  function handleExport() {
    const win = window.open("", "_blank");
    if (!win) return;
    const selectedNode = selectedId ? getNodeById(nodes, selectedId) : null;
    const maxGen = nodes.length
      ? Math.max(...nodes.map((n) => n.generationLevel))
      : 0;
    const genGroups: Record<number, FamilyNode[]> = {};
    for (let g = 0; g <= maxGen; g++) {
      genGroups[g] = nodes.filter((n) => n.generationLevel === g);
    }

    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8" />
      <title>বংশপরম্পরা চার্ট</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        body { font-family: 'Hind Siliguri', sans-serif; padding: 32px; color: #1f2937; }
        h1 { color: #166534; text-align: center; margin-bottom: 24px; }
        .gen-section { margin-bottom: 24px; }
        .gen-title { font-weight: 700; font-size: 14px; color: #166534; border-bottom: 2px solid #166534; padding-bottom: 4px; margin-bottom: 12px; }
        .nodes-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .node-card { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 16px; background: #f9fafb; }
        .node-name { font-weight: 600; }
        .node-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }
        button { background: #166534; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 15px; margin: 16px auto; display: block; }
        button:hover { background: #14532d; }
        @media print { button { display: none; } }
      </style>
    </head><body>
      <h1>বংশপরম্পরা চার্ট — আপন ফাউন্ডেশন</h1>
      <button onclick="window.print()">PDF সংরক্ষণ / প্রিন্ট করুন</button>
      ${Object.entries(genGroups)
        .map(
          ([gen, ns]) => `
        <div class="gen-section">
          <div class="gen-title">প্রজন্ম ${Number(gen) + 1}</div>
          <div class="nodes-row">
            ${ns
              .map(
                (n) => `
              <div class="node-card">
                <div class="node-name">${n.name}</div>
                <div class="node-meta">আইডি: ${n.id} | ${n.parentId ? `পিতা: ${getNodeById(nodes, n.parentId)?.name ?? ""}` : "মূল পূর্বপুরুষ"}</div>
              </div>`,
              )
              .join("")}
          </div>
        </div>`,
        )
        .join("")}
      <button onclick="window.print()">PDF সংরক্ষণ / প্রিন্ট করুন</button>
    </body></html>`);
    win.document.close();
    void selectedNode;
  }

  function handleHybridExport() {
    const win = window.open("", "_blank");
    if (!win) return;

    const maxGen = nodes.length
      ? Math.max(...nodes.map((n) => n.generationLevel))
      : 0;
    const settingsRaw = localStorage.getItem("apon_settings");
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    const orgAddress =
      (settings.orgAddress as string) || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ";
    const orgLogo = localStorage.getItem("apon_logo") || "";

    // Build tree rows recursively
    function buildRows(parentId: string | null, depth: number): string {
      const children = nodes.filter((n) => n.parentId === parentId);
      if (!children.length) return "";
      const genColors = [
        "#1a4d2e",
        "#1e40af",
        "#7c2d12",
        "#4a1d96",
        "#065f46",
        "#9d174d",
        "#1f2937",
      ];
      let html = "";
      for (const node of children) {
        const color = genColors[node.generationLevel % genColors.length];
        const pad = depth * 22;
        const arrow =
          depth > 0
            ? '<span style="color:#9ca3af;font-size:10px;margin-right:4px;">└─</span>'
            : "";
        const childRows = buildRows(node.id, depth + 1);
        html += `<div style="padding-left:${pad}px;margin:3px 0;"><div style="display:inline-flex;align-items:center;gap:6px;">${arrow}<span style="background:${color};color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${node.generationLevel + 1}</span><span style="font-weight:${depth === 0 ? "700" : "500"};font-size:${14 - Math.min(depth, 3)}px;color:#1f2937;">${node.name}</span></div>${childRows}</div>`;
      }
      return html;
    }

    // Build generation list
    function buildList(): string {
      const genColors = [
        "#1a4d2e",
        "#1e40af",
        "#7c2d12",
        "#4a1d96",
        "#065f46",
        "#9d174d",
        "#1f2937",
      ];
      let html = "";
      for (let g = 0; g <= maxGen; g++) {
        const members = nodes.filter((n) => n.generationLevel === g);
        const color = genColors[g % genColors.length];
        html += `<div style="margin-bottom:14px;"><div style="font-weight:700;font-size:12px;color:${color};border-bottom:2px solid ${color};padding-bottom:3px;margin-bottom:7px;">প্রজন্ম ${g + 1} (${members.length} জন)</div>`;
        for (const node of members) {
          const parent = node.parentId
            ? nodes.find((x) => x.id === node.parentId)
            : null;
          html += `<div style="display:flex;gap:8px;margin-bottom:5px;padding:5px 8px;background:#f9fafb;border-radius:5px;border-left:3px solid ${color};"><div><div style="font-weight:600;font-size:12px;color:#1f2937;">${node.name}</div><div style="font-size:10px;color:#6b7280;">${parent ? `পিতা/মাতা: ${parent.name}` : "মূল পূর্বপুরুষ"}</div></div></div>`;
        }
        html += "</div>";
      }
      return html;
    }

    const treeHTML = buildRows(null, 0);
    const listHTML = buildList();
    const logoTag = orgLogo
      ? `<img src="${orgLogo}" style="width:100%;height:100%;object-fit:cover;" />`
      : '<span style="font-size:20px;color:#1a4d2e;">আ</span>';
    const wmTag = orgLogo
      ? `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.07;pointer-events:none;z-index:0;width:160mm;height:160mm;"><img src="${orgLogo}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;" /></div>`
      : "";
    const today = new Date().toLocaleDateString("bn-BD");
    const now = new Date().toLocaleString("bn-BD");

    const html = `<!DOCTYPE html><html lang='bn'><head><meta charset='UTF-8'/><title>বংশপরম্পরা হাইব্রিড চার্ট — আপন ফাউন্ডেশন</title><style>@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');@page { size: A4 landscape; margin: 10mm; }* { box-sizing: border-box; margin: 0; padding: 0; }body { font-family: 'Hind Siliguri', Arial, sans-serif; background: #fff; color: #1f2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; }.page { width: 277mm; min-height: 190mm; padding: 8mm; }.header { display:flex; align-items:center; gap:12px; padding-bottom:8px; border-bottom:3px solid #1a4d2e; margin-bottom:10px; }.logo-wrap { width:55px; height:55px; border-radius:50%; overflow:hidden; border:3px solid #1a4d2e; background:#f0fdf4; flex-shrink:0; display:flex; align-items:center; justify-content:center; }.org-info { flex:1; }.bismillah { font-size:13px; color:#1e40af; margin-bottom:2px; }.org-name { font-size:20px; font-weight:700; }.apon { color:#0f766e; }.foundation { color:#b91c1c; }.org-address { font-size:10px; color:#d97706; margin-top:2px; }.doc-title { text-align:right; font-size:17px; font-weight:700; color:#1a4d2e; }.doc-sub { text-align:right; font-size:10px; color:#6b7280; margin-top:2px; }.body-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px; position:relative; z-index:1; }.col-title { font-size:12px; font-weight:700; color:#1a4d2e; border-bottom:2px solid #d1fae5; padding-bottom:3px; margin-bottom:7px; }.footer { margin-top:10px; border-top:1px solid #d1fae5; padding-top:5px; display:flex; justify-content:space-between; font-size:9px; color:#9ca3af; position:relative; z-index:1; }.print-btn { background:#1a4d2e; color:white; border:none; padding:9px 24px; border-radius:7px; cursor:pointer; font-size:13px; font-family:'Hind Siliguri',sans-serif; margin:10px auto 0; display:block; }@media print { .print-btn { display:none; } }</style></head><body><div class='page'>${wmTag}<div class='header'><div class='logo-wrap'>${logoTag}</div><div class='org-info'><div class='bismillah'>بسم الله الرحمن الرحيم</div><div class='org-name'><span class='apon'>আপন</span> <span class='foundation'>ফাউন্ডেশন</span></div><div class='org-address'>${orgAddress}</div></div><div><div class='doc-title'>বংশপরম্পরা হাইব্রিড চার্ট</div><div class='doc-sub'>মোট: ${nodes.length} জন | প্রজন্ম: ${maxGen + 1}টি</div><div class='doc-sub'>তারিখ: ${today}</div></div></div><div class='body-grid'><div><div class='col-title'>🌳 বংশ-বৃক্ষ (Tree View)</div><div style='font-size:12px;'>${treeHTML}</div></div><div><div class='col-title'>📋 প্রজন্মভিত্তিক তালিকা</div><div style='font-size:12px;'>${listHTML}</div></div></div><div class='footer'><span>আপন ফাউন্ডেশন — বংশপরম্পরা চার্ট</span><span>মুদ্রণ: ${now}</span><span>পৃষ্ঠা ১</span></div></div><button class='print-btn' onclick='window.print()'>📥 ৮K ল্যান্ডস্কেপ PDF ডাউনলোড করুন</button></body></html>`;

    win.document.write(html);
    win.document.close();
  }

  const selectedNode = selectedId ? getNodeById(nodes, selectedId) : null;
  const filteredNodes = searchQuery
    ? nodes.filter((n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : nodes;

  const maxGen = nodes.length
    ? Math.max(...nodes.map((n) => n.generationLevel))
    : 0;

  // ── Render empty state ──────────────────────────────────────────────────────
  if (nodes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: "#d1fae5" }}
          >
            <GitBranch size={40} style={{ color: "#1a4d2e" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a4d2e" }}>
            বংশপরম্পরা চার্ট
          </h1>
          <p className="text-muted-foreground text-sm">
            পূর্বপুরুষের নাম দিয়ে আপনার বংশলতিকা শুরু করুন
          </p>
        </div>
        {isAdmin ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <label
              htmlFor="ancestor-input"
              className="block text-sm font-semibold mb-3"
              style={{ color: "#1a4d2e" }}
            >
              পূর্বপুরুষের নাম লিখুন
            </label>
            <div className="flex gap-3">
              <Input
                ref={modalInputRef}
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                id="ancestor-input"
                placeholder="যেমন: আব্দুল করিম (২০০ বছর আগে)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const trimmed = modalName.trim();
                    if (!trimmed) return;
                    const root: FamilyNode = {
                      id: generateId(),
                      name: trimmed,
                      parentId: null,
                      generationLevel: 0,
                    };
                    setNodes([root]);
                    setExpandedIds(new Set([root.id]));
                    setModalName("");
                  }
                }}
                data-ocid="familytree.input"
              />
              <Button
                onClick={() => {
                  const trimmed = modalName.trim();
                  if (!trimmed) return;
                  const root: FamilyNode = {
                    id: generateId(),
                    name: trimmed,
                    parentId: null,
                    generationLevel: 0,
                  };
                  setNodes([root]);
                  setExpandedIds(new Set([root.id]));
                  setModalName("");
                }}
                style={{ background: "#1a4d2e" }}
                data-ocid="familytree.primary_button"
              >
                শুরু করুন
              </Button>
            </div>
            {modalError && (
              <p
                className="text-red-500 text-xs mt-2"
                data-ocid="familytree.error_state"
              >
                {modalError}
              </p>
            )}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl border border-border"
            data-ocid="familytree.empty_state"
          >
            <p className="text-muted-foreground">ডেটা নেই</p>
          </div>
        )}
      </div>
    );
  }

  // ── Render full page ────────────────────────────────────────────────────────
  return (
    <div className="max-w-full">
      {/* Header */}
      <ModuleHeader
        title="বংশপরম্পরা চার্ট"
        subtitle={`${nodes.length} জন সদস্য · ${maxGen + 1} প্রজন্ম`}
        icon={<GitBranch size={22} />}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div />
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম খুঁজুন..."
              className="pl-8 h-9 w-48 text-sm"
              data-ocid="familytree.search_input"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 gap-1.5"
            data-ocid="familytree.secondary_button"
          >
            <Download size={14} />
            PDF
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => openModal("root")}
              className="h-9 gap-1.5"
              style={{ background: "#1a4d2e" }}
              data-ocid="familytree.open_modal_button"
            >
              <Plus size={14} />
              নতুন পূর্বপুরুষ
            </Button>
          )}
        </div>
      </div>

      {/* Admin Action Bar for selected node */}
      {isAdmin && selectedNode && (
        <div
          className="flex items-center gap-2 flex-wrap mb-4 p-3 rounded-xl border border-primary/20"
          style={{ background: "#f0fdf4" }}
          data-ocid="familytree.panel"
        >
          <span
            className="text-sm font-semibold mr-2"
            style={{ color: "#1a4d2e" }}
          >
            নির্বাচিত: {selectedNode.name}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => openModal("child")}
            data-ocid="familytree.primary_button"
          >
            <UserPlus size={13} /> সন্তান যোগ করুন
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => openModal("sibling")}
            data-ocid="familytree.secondary_button"
          >
            <Users size={13} /> ভাই/বোন যোগ করুন
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => openModal("edit")}
            data-ocid="familytree.edit_button"
          >
            <Edit2 size={13} /> সম্পাদনা
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            data-ocid="familytree.delete_button"
          >
            <Trash2 size={13} /> মুছুন
          </Button>
          <button
            type="button"
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedId(null)}
          >
            ✕ বাতিল
          </button>
        </div>
      )}

      {/* View Mode Tabs */}
      <div
        className="flex gap-1 flex-wrap mb-6 border-b border-border pb-2"
        data-ocid="familytree.tab"
      >
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setViewMode(tab.key)}
            className={`px-4 py-2 text-sm rounded-t-md font-medium transition-colors ${
              viewMode === tab.key
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            style={viewMode === tab.key ? { background: "#1a4d2e" } : {}}
            data-ocid={`familytree.${tab.key}.tab`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4 min-h-[300px]">
        {/* 1. Tree View */}
        {viewMode === "tree" && (
          <TreeViewComponent
            nodes={searchQuery ? filteredNodes : nodes}
            selectedId={selectedId}
            onSelect={handleSelect}
            searchQuery={searchQuery}
          />
        )}

        {/* 2. List View */}
        {viewMode === "list" && (
          <div>
            {getChildren(searchQuery ? filteredNodes : nodes, null).map(
              (root) => (
                <ListRow
                  key={root.id}
                  node={root}
                  nodes={searchQuery ? filteredNodes : nodes}
                  searchQuery={searchQuery}
                  depth={0}
                />
              ),
            )}
            {searchQuery && filteredNodes.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                কোনো ফলাফল পাওয়া যায়নি
              </p>
            )}
          </div>
        )}

        {/* 3. Table View */}
        {viewMode === "table" && (
          <div className="overflow-x-auto" data-ocid="familytree.table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>পিতা/মাতা</TableHead>
                  <TableHead>প্রজন্ম</TableHead>
                  <TableHead>আইডি</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(searchQuery ? filteredNodes : nodes).map((n, idx) => (
                  <TableRow
                    key={n.id}
                    className={`cursor-pointer ${
                      selectedId === n.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => handleSelect(n.id)}
                    data-ocid={`familytree.row.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{n.name}</TableCell>
                    <TableCell>
                      {n.parentId ? (
                        (getNodeById(nodes, n.parentId)?.name ?? "—")
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          মূল পূর্বপুরুষ
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: genColor(n.generationLevel),
                          color: genColor(n.generationLevel),
                        }}
                      >
                        প্রজন্ম {n.generationLevel + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {n.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {searchQuery && filteredNodes.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                কোনো ফলাফল পাওয়া যায়নি
              </p>
            )}
          </div>
        )}

        {/* 4. Timeline View */}
        {viewMode === "timeline" && (
          <div className="space-y-6">
            {Array.from({ length: maxGen + 1 }, (_, i) => i).map((g) => {
              const genNodes = (searchQuery ? filteredNodes : nodes).filter(
                (n) => n.generationLevel === g,
              );
              if (genNodes.length === 0) return null;
              return (
                <div key={`gen-${g}`} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-28 text-right">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold"
                      style={{ background: genColor(g) }}
                    >
                      প্রজন্ম {g + 1}
                    </div>
                    <div className="w-px bg-border mx-auto mt-1 h-full" />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 pb-4 border-b border-dashed border-border">
                    {genNodes.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleSelect(n.id)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          selectedId === n.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-white border-border hover:border-primary"
                        }`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Card View */}
        {viewMode === "card" && (
          <div className="space-y-6">
            {Array.from({ length: maxGen + 1 }, (_, i) => i).map((g) => {
              const genNodes = (searchQuery ? filteredNodes : nodes).filter(
                (n) => n.generationLevel === g,
              );
              if (genNodes.length === 0) return null;
              return (
                <div key={`gen-${g}`}>
                  <h3
                    className="text-sm font-bold mb-3 flex items-center gap-2"
                    style={{ color: genColor(g) }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: genColor(g) }}
                    />
                    প্রজন্ম {g + 1} ({genNodes.length} জন)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {genNodes.map((n, idx) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleSelect(n.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedId === n.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-white hover:border-primary/50 hover:shadow-md"
                        }`}
                        data-ocid={`familytree.card.item.${idx + 1}`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                          style={{ background: genColor(g) }}
                        >
                          {n.name[0]}
                        </div>
                        <div className="text-sm font-semibold leading-tight">
                          {n.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {n.parentId
                            ? (getNodeById(nodes, n.parentId)?.name ?? "")
                            : "মূল পূর্বপুরুষ"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Expandable Tree */}
        {viewMode === "expandable" && (
          <div>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedIds(new Set(nodes.map((n) => n.id)))}
                className="text-xs h-7"
              >
                সব খুলুন
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedIds(new Set())}
                className="text-xs h-7"
              >
                সব বন্ধ করুন
              </Button>
            </div>
            {getChildren(nodes, null).map((root) => (
              <ExpandableNode
                key={root.id}
                node={root}
                nodes={nodes}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                selectedId={selectedId}
                onSelect={handleSelect}
                searchQuery={searchQuery}
                depth={0}
              />
            ))}
          </div>
        )}

        {/* 7. Hybrid View */}
        {viewMode === "hybrid" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#1a4d2e" }}
                >
                  Tree View
                </h3>
                <div className="overflow-x-auto border rounded-lg p-2">
                  <TreeViewComponent
                    nodes={nodes}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    searchQuery={searchQuery}
                  />
                </div>
              </div>
              <div>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#1a4d2e" }}
                >
                  তালিকা View
                </h3>
                <div className="border rounded-lg p-2 max-h-96 overflow-y-auto">
                  {getChildren(nodes, null).map((root) => (
                    <ListRow
                      key={root.id}
                      node={root}
                      nodes={nodes}
                      searchQuery={searchQuery}
                      depth={0}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleHybridExport}
                className="gap-2 px-6"
                style={{ background: "#1a4d2e", color: "white" }}
                data-ocid="familytree.hybrid_pdf_button"
              >
                <Download size={16} />
                ৮K ল্যান্ডস্কেপ PDF ডাউনলোড করুন
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          data-ocid="familytree.modal"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h2
              className="text-base font-bold mb-4"
              style={{ color: "#1a4d2e" }}
            >
              {modalMode === "root" && "নতুন পূর্বপুরুষ যোগ করুন"}
              {modalMode === "child" && `সন্তান যোগ করুন — ${selectedNode?.name}`}
              {modalMode === "sibling" &&
                `ভাই/বোন যোগ করুন — ${selectedNode?.name}`}
              {modalMode === "edit" && `নাম সম্পাদনা — ${selectedNode?.name}`}
            </h2>
            <Input
              ref={modalInputRef}
              value={modalName}
              onChange={(e) => {
                setModalName(e.target.value);
                setModalError("");
              }}
              placeholder="নাম লিখুন"
              onKeyDown={(e) => e.key === "Enter" && handleModalSubmit()}
              data-ocid="familytree.input"
            />
            {modalError && (
              <p
                className="text-red-500 text-xs mt-1"
                data-ocid="familytree.error_state"
              >
                {modalError}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleModalSubmit}
                className="flex-1"
                style={{ background: "#1a4d2e" }}
                data-ocid="familytree.confirm_button"
              >
                সংরক্ষণ করুন
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1"
                data-ocid="familytree.cancel_button"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
