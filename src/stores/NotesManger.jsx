import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { useTodoStore } from "./NotestMangerStore";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-xl border ${
        type === "success"
          ? "bg-emerald-500/90 border-emerald-400/50"
          : "bg-rose-500/90 border-rose-400/50"
      } text-white font-medium animate-in slide-in-from-top`}
    >
      <span className="text-xl">{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
    </div>
  );
};

// Format Date Function
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (diffDays === 0) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } else if (diffDays < 7) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  } else {
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
};

const getPreviewText = (text) => {
  return text.length > 80 ? text.substring(0, 80) + "..." : text;
};

export default function NoteApp() {
  const { notes, addNote, removeNote, updateNote } = useTodoStore();

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const filteredNotes = notes
    .filter((note) =>
      note.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.id - a.id);

  const handleAdd = () => {
    if (!input.trim()) return;
    addNote(input.trim());
    setInput("");
    showToast("Note created successfully", "success");
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
    setSelectedNote(note);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    updateNote(editingId, editText.trim());
    setEditingId(null);
    setSelectedNote(null);
    showToast("Note updated successfully", "success");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setSelectedNote(null);
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setEditingId(null);
  };

  const handleBack = () => {
    setSelectedNote(null);
    setEditingId(null);
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Container */}
      <div className="h-screen bg-black text-white flex flex-col">
        {/* Status Bar */}
       

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* List View */}
          <div
            className={`${
              selectedNote || editingId ? "hidden md:flex" : "flex"
            } flex-col w-full md:w-96 bg-zinc-900 border-r border-zinc-800`}
          >
            {/* Header */}
            <div className="p-4 pb-2">
              <h1 className="text-3xl font-bold mb-4">Notes</h1>

              {/* Search */}
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search notes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <p className="text-sm">
                    {search ? "No notes found" : "Start by adding your first note!"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`w-full text-left p-4 hover:bg-zinc-800 transition ${
                        selectedNote?.id === note.id ? "bg-zinc-800" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-base line-clamp-1">
                          {note.text.split('\n')[0] || "No title"}
                        </h3>
                        <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
                          {formatDate(note.id)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">
                        {getPreviewText(note.text)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail/Edit View */}
          <div
            className={`${
              selectedNote || editingId ? "flex" : "hidden md:flex"
            } flex-col flex-1 bg-black`}
          >
            {selectedNote || editingId ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
                  >
                    <ChevronLeft size={24} />
                    <span className="text-lg">Notes</span>
                  </button>
                  <div className="flex gap-2">
                    {editingId ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm"
                        >
                          <Save size={16} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 text-sm"
                        >
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(selectedNote)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-yellow-500"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            removeNote(selectedNote.id);
                            showToast("Note deleted", "error");
                            handleBack();
                          }}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-red-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-3xl mx-auto p-6">
                    {editingId ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-transparent text-base leading-relaxed outline-none resize-none min-h-[500px]"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="text-xs text-zinc-500 mb-6">
                          {formatDate(selectedNote.id)}
                        </p>
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                          {selectedNote.text}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <p className="text-lg mb-2">No note selected</p>
                  <p className="text-sm">Select a note or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Note Input (Always visible at bottom on mobile) */}
        {!selectedNote && !editingId && (
          <div className="md:hidden p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a note..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white outline-none"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Add Note Input (Desktop - in sidebar) */}
        {!selectedNote && !editingId && (
          <div className="hidden md:block p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a note..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white outline-none"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}