"use client";

import EditIcon from "@/assets/svg/EditIcon";
import TaskModal from "@/components/tasks/TaskModal";
import { useTaskStore, Task } from "@/store/task.store";
import React, { useState, useCallback } from "react";

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
    console.log("Opening edit modal for task:", task);
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  console.log("Current editingTask:", editingTask);
  console.log("Modal open state:", isModalOpen);

  return (
    <section className="ml-20 p-6 pb-24">
      <div className="flex flex-col items-center justify-between mb-8 pb-4 sm:flex-row">
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
      <div className="flex justify-end gap-4 mb-4">
        <button
          className="px-4 py-2 bg-Brand/Brand-1 text-white rounded text-sm"
          onClick={() => toggleSelectedTasksStatus(true)}
          disabled={selectedTasks.length === 0}
        >
          Start Selected
        </button>
        <button
          className="px-4 py-2 bg-Accents/Red text-white rounded text-sm"
          onClick={() => toggleSelectedTasksStatus(false)}
          disabled={selectedTasks.length === 0}
        >
          Stop Selected
        </button>
      </div>
      <div className="border rounded-2xl py-5 px-3 sm:px-6 bg-[#1f2129] border-Neutral/Neutral-Border-[night] h-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-Neutral/Neutral-Border-[night]">
                <th scope="col" className="px-6 py-3 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ease-in-out ${
                        selectAll
                          ? "bg-[#7F56D9] border-[#7F56D9]"
                          : "bg-transparent border-gray-400"
                      }`}
                    >
                      {selectAll && (
                        <svg
                          className="w-3 h-3 text-white"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.3333 4L6 11.3333L2.66667 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                </th>

                <th scope="col" className="px-6 py-3 text-center">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Min Floor Price %
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Max Floor Price %
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Marketplaces
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Start
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-Neutral/Neutral-Border-[night]"
                >
                  <td className="py-2 px-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ease-in-out ${
                          selectedTasks.includes(task.id)
                            ? "bg-[#7F56D9] border-[#7F56D9]"
                            : "bg-transparent border-gray-400"
                        }`}
                      >
                        {selectedTasks.includes(task.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3333 4L6 11.3333L2.66667 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">{task.slug}</td>
                  <td className="px-6 py-4 text-center">
                    {task.minFloorPricePercentage}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    {task.maxFloorPricePercentage}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    {task.selectedMarketplaces.join(", ")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={task.running}
                        onChange={() => toggleTaskStatus(task.id)}
                      />
                      <div
                        className={`relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out ${
                          task.running ? "!bg-Brand/Brand-1" : ""
                        }`}
                      >
                        <div
                          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            task.running ? "transform translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button onClick={() => openEditModal(task)}>
                        <EditIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
