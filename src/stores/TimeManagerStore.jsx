import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const useTimeManagerStore = create(
  persist(
    (set, get) => ({
      // User for Firebase sync
      user: null,
      isLoading: false,

      ////////////////////////
      ////// TIMERS STORE ////
      ////////////////////////
      timers: [],

      // ===== USER & FIREBASE SYNC FUNCTIONS =====

      setUser: async (user) => {
        set({ user, isLoading: true });

        if (user) {
          // Load data from Firebase first
          await get().fetchFromFirestore();
          get().changeStorageKey(`time-manager-storage-${user.uid}`);
        } else {
          // Clear data on logout
          set({ timers: [] });
          get().changeStorageKey("time-manager-storage-guest");
        }

        set({ isLoading: false });
      },

      changeStorageKey: (newKey) => {
        const state = get();
        const data = JSON.stringify({
          state: {
            timers: state.timers,
          }
        });
        localStorage.setItem(newKey, data);
      },

      syncToFirestore: async () => {
        const { user, timers } = get();
        if (!user) return;

        try {
          await setDoc(
            doc(db, "users", user.uid),
            {
              timeManager: {
                timers,
              }
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Failed to sync time manager to Firebase:", error);
        }
      },

      fetchFromFirestore: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.timeManager) {
              set({
                timers: data.timeManager.timers || [],
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch time manager from Firebase:", error);
        }
      },

      // ===== TIMER FUNCTIONS =====

      addTimer: async (timer) => {
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

        // Sync to Firebase
        const { user } = get();
        if (user) {
          try {
            await get().syncToFirestore();
          } catch (error) {
            console.error("Failed to sync timer add to Firebase:", error);
          }
        }

        return true; // Return true to indicate success
      },

      removeTimer: async (id) => {
        const oldTimers = get().timers;

        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
        }));

        // Sync to Firebase
        const { user } = get();
        if (user) {
          try {
            await get().syncToFirestore();
          } catch (error) {
            console.error("Failed to sync timer removal to Firebase:", error);
            // Rollback on failure
            set({ timers: oldTimers });
          }
        }
      },

      stopTimer: async (id, status) => {
        const oldTimers = get().timers;

        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, isRunning: status === 'running', status } : t
          ),
        }));

        // Sync to Firebase
        const { user } = get();
        if (user) {
          try {
            await get().syncToFirestore();
          } catch (error) {
            console.error("Failed to sync timer stop to Firebase:", error);
            // Rollback on failure
            set({ timers: oldTimers });
          }
        }
      },

      resetTimer: async (id) => {
        const oldTimers = get().timers;

        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, remaining: t.duration, isRunning: false, status: 'stopped' } : t
          ),
        }));

        // Sync to Firebase
        const { user } = get();
        if (user) {
          try {
            await get().syncToFirestore();
          } catch (error) {
            console.error("Failed to sync timer reset to Firebase:", error);
            // Rollback on failure
            set({ timers: oldTimers });
          }
        }
      },

      tickTimers: () => {
        // Note: tickTimers runs frequently and doesn't sync to Firebase
        // to avoid excessive writes. Timer state is synced on start/stop/reset.
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timers: state.timers,
      }),
    }
  )
);