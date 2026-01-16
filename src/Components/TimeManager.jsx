import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, X, Clock, Timer as TimerIcon, Coffee, Brain, Zap, AlertTriangle, Square } from "lucide-react";
import { useTimeManagerStore } from "../stores/TimeManagerStore";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyticsStore } from "../stores/AnaliticsStore";
import SideBar from "./sidebar.jsx";

// Simple sound hook
const useSoundEffect = (url) => {
  const audio = new Audio(url);
  return () => {
    audio.currentTime = 0;
    audio.play().catch(() => { });
  };
};

// Sound URLs
const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3",
  alarm: "https://assets.mixkit.co/active_storage/sfx/1005/1005-preview.mp3",
  timerEnd: "https://assets.mixkit.co/active_storage/sfx/1006/1006-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
};

// Delete Confirmation Modal Component
function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-red-500/10">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-100">Delete Timer?</h3>
        </div>

        <p className="text-zinc-400 mb-6">
          Are you sure you want to delete this timer? Your progress will be lost.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TimeManager() {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState(null);

  // Sounds
  const playClick = useSoundEffect(SOUNDS.click);
  const playTimerEnd = useSoundEffect(SOUNDS.timerEnd);

  const startSession = useAnalyticsStore(state => state.startSession);
  const endSession = useAnalyticsStore(state => state.endSession);

  const {
    timers,
    tickTimers,
    stopTimer,
    removeTimer,
    addTimer,
    resetTimer
  } = useTimeManagerStore();

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimers();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimers]);

  // Check for completed timers
  useEffect(() => {
    timers.forEach((t) => {
      if (t.remaining === 0 && t.isRunning) {
        playTimerEnd();
        toast.success("⏰ Timer completed!");
        endSession();
        setTimeout(() => removeTimer(t.id), 100);
      }
    });
  }, [timers, playTimerEnd, removeTimer, endSession]);

  const handleStartTimer = (minutes) => {
    playClick();

    // Check if timer already exists
    const success = addTimer({ duration: minutes * 60, isRunning: true, label: `${minutes} min` });

    if (!success) {
      toast.error("You already have an active timer! Complete or delete it first.");
      return;
    }

    startSession();
    toast.success(`${minutes} min timer started!`);
  };

  const handlePauseTimer = (id) => {
    playClick();
    // Pause the timer and end analytics session
    endSession();
    stopTimer(id, 'paused');
    toast("Timer paused");
  };

  const handleResumeTimer = (id) => {
    playClick();
    // Resume the timer and start new analytics session
    startSession();
    stopTimer(id, 'running');
    toast.success("Timer resumed");
  };

  const handleStopTimer = (id) => {
    playClick();
    // Stop timer and end analytics session
    endSession();
    stopTimer(id, 'stopped');
    toast("Timer stopped");
  };

  const handleResetTimer = (id) => {
    playClick();
    // Reset timer and end analytics session
    endSession();
    resetTimer(id);
    toast("Timer reset");
  };

  // Show confirmation before deleting
  const handleDeleteTimer = (id) => {
    setTimerToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (timerToDelete) {
      playClick();
      endSession();
      removeTimer(timerToDelete);
      toast("Timer deleted");
      setDeleteModalOpen(false);
      setTimerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTimerToDelete(null);
  };

  const formatTimerDisplay = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const getProgress = (timer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  return (
    <>
      <SideBar />
      <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 p-6 md:p-12">
        <Toaster position="top-center" toastOptions={{
          style: {
            background: 'rgba(28, 28, 30, 0.9)',
            color: '#fff',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }} />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModalOpen && (
            <DeleteConfirmModal
              isOpen={deleteModalOpen}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
            />
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-10 pt-12 md:pt-0">
          {timers.length === 0 && (
            <>
              <header className="flex flex-col gap-2">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-3xl font-medium tracking-tight text-white'
                >
                  Pomodoro Focus
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-zinc-500 text-sm font-medium"
                >
                  Manage your time and boost productivity
                </motion.p>
              </header>

              {/* Presets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <button
                  onClick={() => handleStartTimer(25)}
                  disabled={timers.length > 0}
                  className={`group p-6 rounded-2xl border border-zinc-800/50 transition-all duration-300 flex flex-col items-center gap-3 ${timers.length > 0
                      ? 'bg-zinc-900/10 opacity-50 cursor-not-allowed'
                      : 'bg-zinc-900/20 hover:bg-zinc-900/40'
                    }`}
                >
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
                    <Brain size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-zinc-100">Focus</h3>
                    <p className="text-sm text-zinc-500">25 Minutes</p>
                  </div>
                </button>

                <button
                  onClick={() => handleStartTimer(5)}
                  disabled={timers.length > 0}
                  className={`group p-6 rounded-2xl border border-zinc-800/50 transition-all duration-300 flex flex-col items-center gap-3 ${timers.length > 0
                      ? 'bg-zinc-900/10 opacity-50 cursor-not-allowed'
                      : 'bg-zinc-900/20 hover:bg-zinc-900/40'
                    }`}
                >
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                    <Coffee size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-zinc-100">Short Break</h3>
                    <p className="text-sm text-zinc-500">5 Minutes</p>
                  </div>
                </button>

                <button
                  onClick={() => handleStartTimer(15)}
                  disabled={timers.length > 0}
                  className={`group p-6 rounded-2xl border border-zinc-800/50 transition-all duration-300 flex flex-col items-center gap-3 ${timers.length > 0
                      ? 'bg-zinc-900/10 opacity-50 cursor-not-allowed'
                      : 'bg-zinc-900/20 hover:bg-zinc-900/40'
                    }`}
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                    <Zap size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-zinc-100">Long Break</h3>
                    <p className="text-sm text-zinc-500">15 Minutes</p>
                  </div>
                </button>
              </motion.div>

              {/* Custom Timer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/20"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-zinc-400 mb-2 block">Custom Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
                      disabled={timers.length > 0}
                    />
                  </div>
                  <button
                    onClick={() => handleStartTimer(customMinutes)}
                    disabled={timers.length > 0}
                    className={`mt-7 p-3.5 rounded-xl font-medium flex items-center gap-2 transition-colors ${timers.length > 0
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-300'
                      }`}
                  >
                    <Plus size={20} />
                    <span>Start</span>
                  </button>
                </div>
              </motion.div>

             
            </>
          )}

          {/* Active Timer - Circular Style (shown when timer exists) */}
          {timers.length > 0 && (
            <AnimatePresence mode="popLayout">
              {timers.map((timer) => (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="min-h-[calc(100vh-8rem)] flex items-center justify-center"
                >
                  <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 flex flex-col items-center gap-8">
                    {/* Circular Timer Display */}
                    <div className="relative flex items-center justify-center">
                      {/* Progress Circle */}
                      <svg className="w-72 h-72 -rotate-90">
                        {/* Background Circle */}
                        <circle
                          cx="144"
                          cy="144"
                          r="136"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-zinc-800"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="144"
                          cy="144"
                          r="136"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 136}`}
                          strokeDashoffset={`${2 * Math.PI * 136 * (1 - getProgress(timer) / 100)}`}
                          className={`transition-all duration-1000 ${timer.status === 'running' ? 'text-blue-500' :
                              timer.status === 'paused' ? 'text-amber-500' :
                                'text-red-500'
                            }`}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Timer Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-light tracking-tight font-mono text-zinc-100">
                          {formatTimerDisplay(timer.remaining)}
                        </div>
                        {timer.status === 'paused' && (
                          <div className="text-sm text-zinc-400 mt-2">
                            Paused
                          </div>
                        )}
                        {timer.status === 'stopped' && (
                          <div className="text-sm text-zinc-400 mt-2">
                            Stopped
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                      {timer.status === 'running' && (
                        <button
                          onClick={() => handlePauseTimer(timer.id)}
                          className="w-full px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-lg"
                        >
                          Pause
                        </button>
                      )}

                      {timer.status === 'paused' && (
                        <>
                          <button
                            onClick={() => handleResumeTimer(timer.id)}
                            className="w-full px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-lg"
                          >
                            Continue
                          </button>
                          <button
                            onClick={() => handleDeleteTimer(timer.id)}
                            className="w-full px-6 py-4 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10 font-medium transition-all text-lg"
                          >
                            End
                          </button>
                        </>
                      )}

                      {timer.status === 'stopped' && (
                        <button
                          onClick={() => handleResetTimer(timer.id)}
                          className="w-full px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-lg"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Delete button - always visible at bottom */}
                    {timer.status !== 'paused' && (
                      <button
                        onClick={() => handleDeleteTimer(timer.id)}
                        className="text-sm text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        Delete Timer
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}