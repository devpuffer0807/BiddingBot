import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  _id: string;
  slug: string;
  selectedWallet: string;
  walletPrivateKey: string; // Add this line
  minFloorPricePercentage: number;
  maxFloorPricePercentage: number;
  selectedMarketplaces: string[];
  running: boolean; // Add this line
  contractAddress: string; // Add this line
  tags: { name: string; color: string }[]; // Add this line
  selectedTraits: Record<string, string[]>; // Add this line
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  outbid: boolean; // Add this line
  blurOutbidMargin: number | null; // Add this line
  openseaOutbidMargin: number | null; // Add this line
  magicedenOutbidMargin: number | null; // Add this line
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "_id">) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskRunning: (id: string) => void; // Add this line
  toggleMultipleTasksRunning: (ids: string[], running: boolean) => void;
  getLastTaskId: () => string;
  setTasks: (tasks: Task[]) => void; // Add this line
}

export const useTaskStore = create(
  persist<TaskStore>(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, _id: Date.now().toString(), running: false },
          ],
        })),
      editTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === id ? { ...task, ...updatedTask } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task._id !== id),
        })),
      toggleTaskRunning: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === id ? { ...task, running: !task.running } : task
          ),
        })),
      toggleMultipleTasksRunning: (ids, running) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task._id) ? { ...task, running } : task
          ),
        })),
      getLastTaskId: () => {
        const state = get();
        return state.tasks[state.tasks.length - 1]?._id;
      },
      setTasks: (tasks) => set({ tasks }), // Add this line
    }),
    {
      name: "tasks",
    }
  )
);
