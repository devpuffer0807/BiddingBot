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
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create(
  persist<TaskStore>(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: Date.now().toString() }],
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
    }),
    {
      name: "task-storage",
    }
  )
);
