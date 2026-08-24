"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function CategoryTree({
  category,
  allCategories,
  isAdmin,
  depth,
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const children = allCategories.filter((c) => c.parentId === category.id);
  const hasChildren = children.length > 0;

  async function handleSaveEdit() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId: category.parentId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Could not delete category");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div
        className="p-4 flex items-center justify-between gap-3"
        style={{ paddingLeft: `${16 + depth * 24}px` }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-slate-400 hover:text-slate-700 shrink-0">
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="py-1.5"
              />
              <Button
                className="px-2.5 py-1.5 text-xs"
                onClick={handleSaveEdit}
                disabled={loading}>
                Save
              </Button>
              <Button
                variant="secondary"
                className="px-2.5 py-1.5 text-xs"
                onClick={() => {
                  setEditing(false);
                  setName(category.name);
                }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {category.name}
              </p>
              <p className="text-xs text-slate-400">
                {category._count.products} product
                {category._count.products !== 1 && "s"}
                {hasChildren &&
                  ` · ${children.length} subcategor${children.length !== 1 ? "ies" : "y"}`}
              </p>
            </div>
          )}
        </div>

        {isAdmin && !editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {error && (
        <p
          className="text-red-600 text-xs px-4 pb-2"
          style={{ paddingLeft: `${16 + depth * 24}px` }}>
          {error}
        </p>
      )}

      {expanded && hasChildren && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {children.map((child) => (
            <CategoryTree
              key={child.id}
              category={child}
              allCategories={allCategories}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
