import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Task {
  _id: string;
  slug: string;
  selectedWallet: string;
  walletPrivateKey: string;
  selectedMarketplaces: string[];
  running: boolean;
  contractAddress: string;
  tags: { name: string; color: string }[];
  selectedTraits: Record<string, string[]>;
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  outbid: boolean;
  blurOutbidMargin: number | null;
  openseaOutbidMargin: number | null;
  magicedenOutbidMargin: number | null;
  counterbid: boolean;
  minFloorPrice: number;
  minTraitPrice: number;
  maxPurchase: number;
  pauseAllBids: boolean;
  stopAllBids: boolean;
  cancelAllBids: boolean;
  bidPrice: {
    min: number;
    max: number;
    minType: "percentage" | "eth";
    maxType: "percentage" | "eth";
  };
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "_id">) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskRunning: (id: string) => void;
  toggleMultipleTasksRunning: (ids: string[], running: boolean) => void;
  getLastTaskId: () => string;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create(
  persist<TaskStore>(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              _id: Date.now().toString(),
              running: false,
              bidPrice: task.bidPrice,
            },
          ],
        })),
      editTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === id
              ? {
                  ...task,
                  ...updatedTask,
                  bidPrice: {
                    min: updatedTask.bidPrice?.min ?? task.bidPrice.min,
                    max: updatedTask.bidPrice?.max ?? task.bidPrice.max,
                    minType:
                      updatedTask.bidPrice?.minType ?? task.bidPrice.minType,
                    maxType:
                      updatedTask.bidPrice?.maxType ?? task.bidPrice.maxType,
                  },
                }
              : task
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
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: "tasks",
    }
  )
);
