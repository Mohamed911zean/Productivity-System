import React, { useState, useEffect } from "react";
import { Search, Plus, Edit3, Save, X, Trash2, Moon, Sun, Sparkles, Zap, Shield } from "lucide-react";

// Zustand Store
const useTodoStore = (() => {
  let notes = [];
  let listeners = [];

  const getState = () => ({ notes });
  
  const setState = (fn) => {
    const newState = fn({ notes });
    notes = newState.notes;
    listeners.forEach(listener => listener());
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  return () => {
    const [, forceUpdate] = useState({});
    
    useEffect(() => {
      return subscribe(() => forceUpdate({}));
    }, []);

    return {
      notes: getState().notes,
      addNote: (text) => {
        setState(state => ({
          notes: [...state.notes, { id: Date.now(), text }]
        }));
      },
      removeNote: (id) => {
        setState(state => ({
          notes: state.notes.filter(note => note.id !== id)
        }));
      },
      updateNote: (id, text) => {
        setState(state => ({
          notes: state.notes.map(note => 
            note.id === id ? { ...note, text } : note
          )
        }));
      }
    };
  };
})();

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-xl border ${
      type === 'success' 
        ? 'bg-emerald-500/90 border-emerald-400/50' 
        : 'bg-rose-500/90 border-rose-400/50'
    } text-white font-medium animate-in slide-in-from-top`}>
      <span className="text-xl">{type === 'success' ? '✓' : '×'}</span>
      <span>{message}</span>
    </div>
  );
};

// Format Date Function
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
};

export default function NoteApp() {
  const { notes, addNote, removeNote, updateNote } = useTodoStore();

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState(null);

  // Dark Mode من localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // فلترة النوتات
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
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    updateNote(editingId, editText.trim());
    setEditingId(null);
    showToast("Note updated successfully", "success");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className={`min-h-screen transition-colors duration-500 ${
          darkMode
            ? "bg-slate-950"
            : "bg-gray-50"
        }`}
      >
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 -left-4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-blue-500' : 'bg-blue-300'
          } animate-pulse`}></div>
          <div className={`absolute top-1/3 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-purple-500' : 'bg-purple-300'
          } animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? 'bg-pink-500' : 'bg-pink-300'
          } animate-pulse delay-2000`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          {/* Premium Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              } shadow-xl`}>
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  NoteFlow
                </h1>
                <p className={`text-sm md:text-base mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Professional note-taking reimagined
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl ${
                darkMode ? 'bg-slate-800/50 text-gray-300' : 'bg-white text-gray-700'
              } border ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <Shield size={16} className="text-green-500" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 md:p-4 rounded-xl shadow-lg transition-all transform hover:scale-105 ${
                  darkMode
                    ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Premium Input Section */}
          <div className={`backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl mb-8 border transition-all ${
            darkMode
              ? "bg-slate-900/50 border-slate-800"
              : "bg-white/80 border-gray-200"
          }`}>
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className={darkMode ? "text-gray-500" : "text-gray-400"} size={20} />
              </div>
              <input
                type="text"
                placeholder="Search through your notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-14 pr-12 py-4 rounded-2xl transition-all text-base font-medium ${
                  darkMode
                    ? "bg-slate-800 text-white placeholder-gray-500 border-slate-700 focus:border-blue-500"
                    : "bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-400"
                } border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Add Input */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Create a new note..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                className={`flex-1 py-4 px-6 rounded-2xl transition-all text-base font-medium ${
                  darkMode
                    ? "bg-slate-800 text-white placeholder-gray-500 border-slate-700 focus:border-purple-500"
                    : "bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-purple-400"
                } border-2 focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
              />
              <button
                onClick={handleAdd}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl text-base whitespace-nowrap"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Create Note
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {notes.length > 0 && (
            <div className={`flex items-center gap-6 mb-6 px-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-sm font-medium">{notes.length} Total Notes</span>
              </div>
              {search && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{filteredNotes.length} Results</span>
                </div>
              )}
            </div>
          )}

          {/* Premium Notes Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.length === 0 ? (
              <div className={`col-span-full text-center py-24 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                  darkMode ? 'bg-slate-800' : 'bg-gray-100'
                }`}>
                  <Sparkles size={32} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                </div>
                <p className="text-xl font-medium">
                  {search
                    ? "No matching notes found"
                    : notes.length === 0
                    ? "Start your journey with your first note"
                    : "No notes to display"}
                </p>
                <p className="text-sm mt-2 opacity-60">
                  {!search && notes.length === 0 && "Click 'Create Note' to begin"}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative backdrop-blur-xl rounded-3xl p-6 shadow-lg transition-all border ${
                    darkMode
                      ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      : "bg-white/90 border-gray-200 hover:border-gray-300"
                  } hover:shadow-2xl hover:-translate-y-2`}
                >
                  {editingId === note.id ? (
                    <>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className={`w-full p-4 rounded-2xl resize-none transition-all text-base ${
                          darkMode
                            ? "bg-slate-800 text-white border-slate-700"
                            : "bg-gray-50 text-gray-900 border-gray-200"
                        } border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500`}
                        rows="4"
                        autoFocus
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-lg"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={`flex-1 py-3 rounded-xl transition-all active:scale-95 text-sm font-semibold ${
                            darkMode 
                              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={`font-medium text-base md:text-lg leading-relaxed break-words ${
                        darkMode ? "text-gray-100" : "text-gray-800"
                      }`}>
                        {note.text}
                      </p>

                      <div className={`flex items-center justify-between mt-6 pt-4 border-t ${
                        darkMode ? 'border-slate-800' : 'border-gray-100'
                      }`}>
                        <span className={`text-xs font-medium ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {formatDate(note.id)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          darkMode ? 'bg-blue-500' : 'bg-blue-400'
                        }`}></div>
                      </div>

                      {/* Premium Actions */}
                      <div className="flex gap-2 mt-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => startEdit(note)}
                          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-semibold shadow-md"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            removeNote(note.id);
                            showToast("Note deleted", "error");
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs font-semibold shadow-md"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Premium Footer */}
          <div className={`text-center mt-16 pb-8 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <p className="text-sm font-medium">Powered by NoteFlow Enterprise</p>
          </div>
        </div>
      </div>
    </>
  );
}