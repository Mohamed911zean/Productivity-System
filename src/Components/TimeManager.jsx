import React, { useState, useEffect } from "react";
import { Globe, Bell, Timer, Plus, Trash2, Clock, X } from "lucide-react";
import { useTimeManagerStore } from "../stores/TimeManagerStore";
import toast, { Toaster } from "react-hot-toast";

// Simple sound hook
const useSoundEffect = (url) => {
  const audio = new Audio(url);
  return () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
};

// Sound URLs
const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3",
  alarm: "https://assets.mixkit.co/active_storage/sfx/1005/1005-preview.mp3",
  timerEnd: "https://assets.mixkit.co/active_storage/sfx/1006/1006-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
};

export default function ClockView() {
  const [activeTab, setActiveTab] = useState("world");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [alarmHour, setAlarmHour] = useState(12);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmLabel, setAlarmLabel] = useState("");
  const [alarmPeriod, setAlarmPeriod] = useState("AM");
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchStartTime, setStopwatchStartTime] = useState(null);
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSeconds, setCustomSeconds] = useState(0);

  // Sounds
  const playClick = useSoundEffect(SOUNDS.click);
  const playAlarm = useSoundEffect(SOUNDS.alarm);
  const playTimerEnd = useSoundEffect(SOUNDS.timerEnd);
  const playSuccess = useSoundEffect(SOUNDS.success);

  // Store
  const {
    timers,
    tickTimers,
    toggleTimer,
    removeTimer,
    alarms,
    addAlarm,
    removeAlarm,
    checkAlarms,
    addTimer,
  } = useTimeManagerStore();

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      tickTimers();

      if (currentTime.getSeconds() === 0) {
        const triggered = checkAlarms();
        triggered.forEach((alarm) => {
          playAlarm();
          if (Notification.permission === "granted") {
            new Notification("⏰ Alarm!", {
              body: alarm.label || "Time's up!",
            });
          }
          toast.success(`Alarm: ${alarm.label || "Time's up!"}`);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTime, tickTimers, checkAlarms, playAlarm]);

  // High-precision stopwatch
  useEffect(() => {
    if (!stopwatchRunning) return;
    
    let animationFrame;
    const updateStopwatch = () => {
      setStopwatchMs(Date.now() - stopwatchStartTime);
      animationFrame = requestAnimationFrame(updateStopwatch);
    };
    
    animationFrame = requestAnimationFrame(updateStopwatch);
    return () => cancelAnimationFrame(animationFrame);
  }, [stopwatchRunning, stopwatchStartTime]);

  // Check for completed timers
  useEffect(() => {
    timers.forEach((t) => {
      if (t.remaining === 0 && t.isRunning) {
        playTimerEnd();
        toast.success("⏰ Timer completed!");
        setTimeout(() => removeTimer(t.id), 100);
      }
    });
  }, [timers, playTimerEnd, removeTimer]);

  // Timer control
  const handleQuickTimer = (minutes) => {
    playClick();
    addTimer({ duration: minutes * 60, isRunning: true });
    toast.success(`${minutes} min timer started!`);
  };

  const handleCustomTimer = () => {
    playClick();
    setShowCustomTimerModal(true);
  };

  const handleSaveCustomTimer = () => {
    const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (totalSeconds > 0) {
      addTimer({ duration: totalSeconds, isRunning: true });
      toast.success("Custom timer started!");
      setShowCustomTimerModal(false);
      setCustomHours(0);
      setCustomMinutes(5);
      setCustomSeconds(0);
    }
  };

  const handleCancelTimer = (id) => {
    playClick();
    removeTimer(id);
    toast("Timer cancelled");
  };

  // Stopwatch control
  const handleStopwatchStartStop = () => {
    playClick();
    if (!stopwatchRunning) {
      setStopwatchStartTime(Date.now() - stopwatchMs);
      setStopwatchRunning(true);
    } else {
      setStopwatchRunning(false);
    }
  };

  const handleStopwatchReset = () => {
    playClick();
    setStopwatchMs(0);
    setStopwatchRunning(false);
    setStopwatchStartTime(null);
  };

  // Alarm control
  const handleAddAlarm = () => {
    playSuccess();
    let hour24 = alarmHour;
    if (alarmPeriod === "PM" && alarmHour !== 12) hour24 += 12;
    if (alarmPeriod === "AM" && alarmHour === 12) hour24 = 0;

    addAlarm({ hour: hour24, minute: alarmMinute, label: alarmLabel || "Alarm" });
    setShowAlarmForm(false);
    setAlarmLabel("");
    toast.success("Alarm created!");
    if (Notification.permission === "default") Notification.requestPermission();
  };

  const handleDeleteAlarm = (id) => {
    playClick();
    removeAlarm(id);
    toast("Alarm deleted");
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const formatTimerDisplay = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatStopwatch = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1c1c1e', color: '#fff', borderRadius: '12px' }
      }} />

      {/* Top Navigation - Compact & Professional */}
      <div className="bg-black border-b border-zinc-800 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => { playClick(); setActiveTab("world"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "world" ? "bg-zinc-900 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Globe size={18} strokeWidth={2} />
          <span className="text-sm font-medium">World</span>
        </button>

        <button
          onClick={() => { playClick(); setActiveTab("alarm"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "alarm" ? "bg-zinc-900 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Bell size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Alarm</span>
        </button>

        <button
          onClick={() => { playClick(); setActiveTab("stopwatch"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "stopwatch" ? "bg-zinc-900 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Clock size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Stopwatch</span>
        </button>

        <button
          onClick={() => { playClick(); setActiveTab("timer"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "timer" ? "bg-zinc-900 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Timer size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Timer</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "world" && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-8xl sm:text-9xl font-thin tracking-tight mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {formatTime(currentTime)}
            </div>
            <div className="text-lg font-light text-zinc-400 tracking-wide">{formatDate(currentTime)}</div>
          </div>
        )}

        {activeTab === "alarm" && (
          <div className="p-4 space-y-3">
            {/* Add Alarm Form */}
            {showAlarmForm && (
              <div className="bg-zinc-900 rounded-2xl p-5 space-y-4 fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold tracking-tight">Add Alarm</h3>
                  <button onClick={() => setShowAlarmForm(false)} className="text-zinc-500 hover:text-zinc-300">
                    <X size={22} />
                  </button>
                </div>
                
                <div className="flex justify-center gap-3 py-6">
                  <select value={alarmHour} onChange={(e) => setAlarmHour(Number(e.target.value))} className="bg-zinc-800 text-white text-4xl font-thin px-4 py-3 rounded-xl outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                  <span className="text-4xl font-thin self-center">:</span>
                  <select value={alarmMinute} onChange={(e) => setAlarmMinute(Number(e.target.value))} className="bg-zinc-800 text-white text-4xl font-thin px-4 py-3 rounded-xl outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {[...Array(60)].map((_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
                  </select>
                  <select value={alarmPeriod} onChange={(e) => setAlarmPeriod(e.target.value)} className="bg-zinc-800 text-white text-2xl font-light px-3 py-3 rounded-xl outline-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Label"
                  value={alarmLabel}
                  onChange={(e) => setAlarmLabel(e.target.value)}
                  className="w-full bg-zinc-800 text-white px-4 py-3.5 rounded-xl outline-none placeholder-zinc-500 text-base"
                />
                
                <button onClick={handleAddAlarm} className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-semibold tracking-wide hover:bg-yellow-400 transition">
                  Save Alarm
                </button>
              </div>
            )}

            {/* Alarms List */}
            {alarms.length === 0 && !showAlarmForm && (
              <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
                <Bell size={64} className="mb-4 opacity-20" strokeWidth={1.5} />
                <p className="text-base font-light">No Alarms</p>
              </div>
            )}

            <div className="space-y-2">
              {alarms.map((alarm) => {
                let h = alarm.hour, p = "AM";
                if (h >= 12) { p = "PM"; if (h > 12) h -= 12; }
                if (h === 0) h = 12;
                return (
                  <div key={alarm.id} className="bg-zinc-900 rounded-2xl p-5 flex justify-between items-center hover:bg-zinc-800 transition fade-in slide-in">
                    <div>
                      <div className="text-5xl font-thin tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {h}:{String(alarm.minute).padStart(2, "0")} <span className="text-2xl font-light">{p}</span>
                      </div>
                      <div className="text-sm text-zinc-400 mt-1.5 font-light">{alarm.label}</div>
                    </div>
                    <button onClick={() => handleDeleteAlarm(alarm.id)} className="p-2.5 hover:bg-zinc-700 rounded-lg text-red-500 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "stopwatch" && (
          <div className="flex flex-col h-full items-center justify-center px-4">
            <div className="text-8xl sm:text-9xl font-thin tracking-tight mb-16" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {formatStopwatch(stopwatchMs)}
            </div>
            <div className="flex gap-8">
              <button onClick={handleStopwatchReset} className="w-24 h-24 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition text-base">
                Reset
              </button>
              <button onClick={handleStopwatchStartStop} className={`w-24 h-24 rounded-full font-semibold transition text-base ${stopwatchRunning ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}>
                {stopwatchRunning ? "Stop" : "Start"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "timer" && (
          <div className="p-4 space-y-3">
            {/* Custom Timer Modal */}
            {showCustomTimerModal && (
              <div className="bg-zinc-900 rounded-2xl p-5 space-y-4 fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold tracking-tight">Custom Timer</h3>
                  <button onClick={() => setShowCustomTimerModal(false)} className="text-zinc-500 hover:text-zinc-300">
                    <X size={22} />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 py-6">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={customHours}
                      onChange={(e) => setCustomHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                      className="w-20 bg-zinc-800 text-white text-4xl font-thin px-3 py-3 rounded-xl outline-none text-center"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      min="0"
                      max="23"
                    />
                    <span className="text-xs text-zinc-500 mt-2">hours</span>
                  </div>
                  <span className="text-4xl font-thin self-center mb-6">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-20 bg-zinc-800 text-white text-4xl font-thin px-3 py-3 rounded-xl outline-none text-center"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      min="0"
                      max="59"
                    />
                    <span className="text-xs text-zinc-500 mt-2">minutes</span>
                  </div>
                  <span className="text-4xl font-thin self-center mb-6">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-20 bg-zinc-800 text-white text-4xl font-thin px-3 py-3 rounded-xl outline-none text-center"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      min="0"
                      max="59"
                    />
                    <span className="text-xs text-zinc-500 mt-2">seconds</span>
                  </div>
                </div>
                
                <button onClick={handleSaveCustomTimer} className="w-full bg-yellow-500 text-black py-3.5 rounded-xl font-semibold tracking-wide hover:bg-yellow-400 transition">
                  Start Timer
                </button>
              </div>
            )}

            {/* Quick Timer Grid */}
            {!showCustomTimerModal && (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 3, 5, 10, 15, 20, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => handleQuickTimer(min)}
                      className="bg-zinc-900 text-white py-10 rounded-2xl font-light text-3xl hover:bg-zinc-800 transition tracking-tight"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                      {min}<span className="text-sm text-zinc-400 block font-normal mt-1">min</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleCustomTimer} className="w-full bg-yellow-500 text-black font-semibold py-3.5 rounded-xl hover:bg-yellow-400 transition tracking-wide">
                  + Custom Timer
                </button>
              </>
            )}

            {/* Active Timers */}
            {timers.length === 0 && !showCustomTimerModal && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Timer size={64} className="mb-4 opacity-20" strokeWidth={1.5} />
                <p className="text-base font-light">No Timers</p>
              </div>
            )}

            {!showCustomTimerModal && (
              <div className="space-y-2">
                {timers.map((t) => {
                  const progress = ((t.duration - t.remaining) / t.duration) * 100;
                  return (
                    <div key={t.id} className="bg-zinc-900 rounded-2xl p-5 relative overflow-hidden hover:bg-zinc-800 transition fade-in slide-in">
                      <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all" style={{ width: `${progress}%` }}></div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-5xl font-thin tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {formatTimerDisplay(t.remaining)}
                          </div>
                          <div className="text-sm text-zinc-400 mt-1.5 font-light">
                            {Math.floor(t.duration / 60)} min 
                            {!t.isRunning && <span className="text-yellow-500"> • Paused</span>}
                          </div>
                        </div>
                        <div className="flex gap-2.5">
                          <button onClick={() => { playClick(); toggleTimer(t.id); }} className={`w-16 h-16 rounded-full text-sm font-semibold transition ${t.isRunning ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}>
                            {t.isRunning ? "Stop" : "Start"}
                          </button>
                          <button onClick={() => handleCancelTimer(t.id)} className="w-16 h-16 rounded-full bg-zinc-800 text-red-500 hover:bg-zinc-700 transition flex items-center justify-center">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button - Only on Alarm Tab */}
      {activeTab === "alarm" && !showAlarmForm && (
        <button
          onClick={() => { playClick(); setShowAlarmForm(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-400 transition z-50"
        >
          <Plus size={28} className="text-black" />
        </button>
      )}
    </div>
  );
}