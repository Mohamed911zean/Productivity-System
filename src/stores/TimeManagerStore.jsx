import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTimeManagerStore = create(
  persist(
    (set, get) => ({
      ////////////////////////
      ////// TIMERS STORE ////
      ////////////////////////
      timers: [],

      addTimer: (timer) => {
        // Only allow one timer at a time
        const currentTimers = get().timers;
        if (currentTimers.length > 0) {
          return false; // Return false to indicate timer wasn't added
        }
        
        set((state) => ({
          timers: [
            ...state.timers,
            {
              id: Date.now(),
              isRunning: false,
              remaining: timer.duration || 0,
              duration: timer.duration || 0,
              status: 'running', // 'running', 'paused', 'stopped'
              ...timer,
            },
          ],
        }));
        return true; // Return true to indicate success
      },

      removeTimer: (id) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
        })),

      stopTimer: (id, status) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, isRunning: status === 'running', status } : t
          ),
        })),

      resetTimer: (id) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, remaining: t.duration, isRunning: false, status: 'stopped' } : t
          ),
        })),

      tickTimers: () => {
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.isRunning && t.remaining > 0) {
              return { ...t, remaining: t.remaining - 1 };
            }
            return t;
          }),
        }));
      },
    }),
    {
      name: "time-manager-storage",
    }
  )
);