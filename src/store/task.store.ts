import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  id: string;
  slug: string;
  selectedWallet: string;
  walletPrivateKey: string; // Add this line
  minFloorPricePercentage: number;
  maxFloorPricePercentage: number;
  selectedMarketplaces: string[];
  running: boolean; // Add this line
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskRunning: (id: string) => void; // Add this line
  toggleMultipleTasksRunning: (ids: string[], running: boolean) => void;
  getLastTaskId: () => string;
  // Add this line
}

export const useTaskStore = create(
  persist<TaskStore>(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: Date.now().toString(), running: false },
          ],
        })),
      editTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTaskRunning: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, running: !task.running } : task
          ),
        })),
      toggleMultipleTasksRunning: (ids, running) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task.id) ? { ...task, running } : task
          ),
        })),
      getLastTaskId: () => {
        const state = get();
        return state.tasks[state.tasks.length - 1]?.id;
      },
    }),
    {
      name: "task-storage",
    }
  )
);
