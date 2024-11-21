"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskTable from "@/components/tasks/TaskTable";
import TaskModal from "@/components/tasks/TaskModal";
import { useTaskStore, Task } from "@/store/task.store";
import React from "react";

const ImportVerification = () => {
  const router = useRouter();
  const { importedTasks, clearImportedTasks, addTask } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  // Redirect if no imported tasks
  useEffect(() => {
    if (!importedTasks.length) {
      router.push("/dashboard/tasks");
    }
  }, [importedTasks, router]);

  const handleConfirmImport = () => {
    // Add each imported task to the main tasks list
    importedTasks.forEach((task) => {
      addTask(task);
    });
    clearImportedTasks();
    router.push("/dashboard/tasks");
  };

  const handleCancelImport = () => {
    clearImportedTasks();
    router.push("/dashboard/tasks");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <section className="ml-0 sm:ml-20 p-4 sm:p-6 pb-24">
      <div className="flex flex-col items-center justify-between mb-4 sm:mb-8 pb-4 sm:flex-row">
        <h1 className="text-xl font-bold mb-4 sm:mb-0 sm:text-2xl md:text-[28px]">
          Verify Imported Tasks
        </h1>
        <div className="flex gap-4">
          <button
            className="dashboard-button"
            onClick={handleConfirmImport}
            disabled={importedTasks.length === 0}
          >
            Confirm Import
          </button>
          <button
            className="dashboard-button !bg-[#ef4444]"
            onClick={handleCancelImport}
          >
            Cancel Import
          </button>
        </div>
      </div>

      <TaskTable
        tasks={importedTasks}
        selectedTasks={[]}
        selectAll={false}
        onToggleSelectAll={() => {}}
        onToggleTaskSelection={() => {}}
        onToggleTaskStatus={() => {}}
        onToggleMarketplace={() => {}}
        onEditTask={(task) => {
          setEditingTask(task);
          setIsModalOpen(true);
        }}
        filterText=""
        selectedTags={[]}
        selectedBidTypes={[]}
        isVerificationMode={true}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskId={editingTask?._id}
        initialTask={editingTask}
        isVerificationMode={true}
      />
    </section>
  );
};

export default ImportVerification;
