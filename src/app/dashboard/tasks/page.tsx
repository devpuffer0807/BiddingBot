"use client";

import TaskModal from "@/components/tasks/TaskModal";
import React, { useState } from "react";

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Tasks;
