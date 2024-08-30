"use client";

import EditIcon from "@/assets/svg/EditIcon";
import TaskModal from "@/components/tasks/TaskModal";
import { useTaskStore, Task } from "@/store/task.store";
import React, { useState, useCallback } from "react";
import Toggle from "@/components/common/Toggle"; // Make sure to import the Toggle component
import TaskTable from "@/components/tasks/TaskTable";

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, toggleTaskRunning, toggleMultipleTasksRunning } =
    useTaskStore();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSelection = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId];
      setSelectAll(newSelection.length === tasks.length);
      return newSelection;
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    toggleTaskRunning(taskId);
  };

  const toggleSelectedTasksStatus = (running: boolean) => {
    toggleMultipleTasksRunning(selectedTasks, running);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTasks(selectAll ? [] : tasks.map((task) => task.id));
  };

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const toggleMarketplace = (taskId: string, marketplace: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedMarketplaces = task.selectedMarketplaces.includes(
        marketplace
      )
        ? task.selectedMarketplaces.filter((m) => m !== marketplace)
        : [...task.selectedMarketplaces, marketplace];

      useTaskStore
        .getState()
        .editTask(taskId, { selectedMarketplaces: updatedMarketplaces });
    }
  };

  return (
    <section className="ml-0 sm:ml-20 p-4 sm:p-6 pb-24">
      <div className="flex flex-col items-center justify-between mb-4 sm:mb-8 pb-4 sm:flex-row">
        <h1 className="text-xl font-bold mb-4 sm:mb-0 sm:text-2xl md:text-[28px]">
          Manage Tasks
        </h1>
        <button
          className="w-full sm:w-auto dashboard-btn uppercase bg-Brand/Brand-1 text-xs py-3 px-4 sm:text-sm sm:px-6 md:px-8"
          onClick={() => setIsModalOpen(true)}
        >
          Create New Task
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4 mb-4">
        <button
          className="px-4 py-2 bg-Brand/Brand-1 text-white rounded text-sm w-full sm:w-auto"
          onClick={() => toggleSelectedTasksStatus(true)}
          disabled={selectedTasks.length === 0}
        >
          Start Selected
        </button>
        <button
          className="px-4 py-2 bg-Accents/Red text-white rounded text-sm w-full sm:w-auto"
          onClick={() => toggleSelectedTasksStatus(false)}
          disabled={selectedTasks.length === 0}
        >
          Stop Selected
        </button>
      </div>
      <TaskTable
        tasks={tasks}
        selectedTasks={selectedTasks}
        selectAll={selectAll}
        onToggleSelectAll={toggleSelectAll}
        onToggleTaskSelection={toggleTaskSelection}
        onToggleTaskStatus={toggleTaskRunning}
        onToggleMarketplace={toggleMarketplace}
        onEditTask={openEditModal}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskId={editingTask?.id}
        initialTask={editingTask}
      />
    </section>
  );
};

export default Tasks;
