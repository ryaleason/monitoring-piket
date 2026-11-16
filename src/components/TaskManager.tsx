"use client";

import React, { useState, useEffect } from "react";
import { AreaWithTasks, TaskItem } from "@/lib/db";
import { Plus, Trash2, Edit3, Check, X, RefreshCw, ListTodo } from "lucide-react";

interface TaskManagerProps {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export function TaskManager({ onNotify }: TaskManagerProps) {
  const [areas, setAreas] = useState<AreaWithTasks[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Add task state
  const [newTaskText, setNewTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();
      setAreas(data.areas || []);
    } catch {
      onNotify("Gagal memuat daftar tugas", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setIsAdding(true);
    try {
      const activeArea = areas.find((a) => a.id === selectedAreaId);
      const nextOrder = (activeArea?.tasks.length || 0) + 1;

      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaId: selectedAreaId,
          text: newTaskText.trim(),
          displayOrder: nextOrder,
          active: true,
        }),
      });

      if (!res.ok) throw new Error();
      setNewTaskText("");
      onNotify("Tugas baru berhasil ditambahkan!");
      await loadTasks();
    } catch {
      onNotify("Gagal menambahkan tugas", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async (task: TaskItem) => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          areaId: task.areaId,
          text: editingText.trim(),
          displayOrder: task.displayOrder,
          active: task.active,
        }),
      });

      if (!res.ok) throw new Error();
      setEditingTaskId(null);
      onNotify("Tugas berhasil diperbarui!");
      await loadTasks();
    } catch {
      onNotify("Gagal memperbarui tugas", "error");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    try {
      const res = await fetch(`/api/admin/tasks?id=${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      onNotify("Tugas berhasil dihapus!");
      await loadTasks();
    } catch {
      onNotify("Gagal menghapus tugas", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Memuat tugas piket...</span>
      </div>
    );
  }

  const activeArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  return (
    <div className="space-y-4">
      {/* Area selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedAreaId(area.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target ${
              selectedAreaId === area.id
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Daftar Tugas: {activeArea?.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {activeArea?.tasks.length || 0} Tugas
          </span>
        </div>

        {/* Existing tasks */}
        <div className="divide-y divide-slate-100">
          {activeArea?.tasks.map((task, idx) => (
            <div
              key={task.id}
              className="py-2.5 flex items-start justify-between gap-2 text-xs sm:text-sm"
            >
              {editingTaskId === task.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-blue-400 rounded-lg focus:outline-hidden min-h-[36px]"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(task)}
                    className="p-1.5 bg-blue-700 text-white rounded-md touch-target flex items-center justify-center shrink-0"
                    title="Simpan"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="p-1.5 bg-slate-200 text-slate-700 rounded-md touch-target flex items-center justify-center shrink-0"
                    title="Batal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-slate-400 text-xs mt-0.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-slate-800 leading-snug">{task.text}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingText(task.text);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors touch-target flex items-center justify-center"
                      title="Ubah tugas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors touch-target flex items-center justify-center"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new task form */}
        <form onSubmit={handleAddTask} className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Tambah tugas baru di area ini..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isAdding || !newTaskText.trim()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 touch-target transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </form>
      </div>
    </div>
  );
}
