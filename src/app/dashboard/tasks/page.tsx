"use client";

import { useEffect, useState } from "react";
import TaskModal from "@/components/tasks/TaskModal";
import { useTaskStore, Task } from "@/store/task.store";
import React from "react";
import TaskTable from "@/components/tasks/TaskTable";
import Accordion from "@/components/common/Accordion";
import RecentBids from "@/components/tasks/RecentBids";
import { BidInfo, WebSocketResponse } from "@/interface";
import TagFilter from "@/components/tasks/TagFilter";
import { Tag } from "@/store/tag.store";
import { useWebSocket } from "@/hooks/useWebSocket";

const NEXT_PUBLIC_SERVER_WEBSOCKET = process.env
  .NEXT_PUBLIC_SERVER_WEBSOCKET as string;

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, setTasks, toggleTaskRunning, toggleMultipleTasksRunning } =
    useTaskStore();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<BidInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [filterText, setFilterText] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { sendMessage } = useWebSocket(NEXT_PUBLIC_SERVER_WEBSOCKET);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/task", {
          credentials: "include", // This ensures cookies are sent with the request
        });
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const fetchedTasks = await response.json();

        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSelection = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId];
      setSelectAll(newSelection.length === tasks.length);
      return newSelection;
    });
  };

  useEffect(() => {
    const runningTasks = tasks.filter((task) => task.running);
    const BASE_URL = "wss://wss-mainnet.magiceden.io";
    const ws = new WebSocket(BASE_URL);

    ws.onopen = () => {
      runningTasks.forEach((task) => {
        const subscribeMessage = {
          type: "subscribeCollection",
          constraint: {
            chain: "ethereum",
            collectionSymbol: task.contract.contractAddress.toLowerCase(),
          },
        };
        ws.send(JSON.stringify(subscribeMessage));
      });
    };

    ws.onmessage = (event) => {
      if (event.data.startsWith("{")) {
        handleWebSocketMessage(event.data);
      } else if (event.data === "ping") {
        console.log("Received ping message");
      } else {
        console.warn("Received non-JSON message:", event.data);
      }
    };

    const handleWebSocketMessage = (data: string) => {
      try {
        const parsedData: WebSocketResponse = JSON.parse(data);
        if (
          parsedData.event === "bid.created" ||
          parsedData.event === "bid.updated"
        ) {
          const bidData = parsedData.data;
          const marketplace = determineMarketplace(bidData.source.domain);
          const task = tasks.find(
            (item) =>
              item.contract.contractAddress.toLowerCase() ===
              bidData.contract.toLowerCase()
          );
          const bidInfo: BidInfo = {
            collectionSlug: task?.contract.slug || "",
            basePrice: bidData.price.amount.raw,
            formattedPrice: bidData.price.amount.decimal.toString(),
            expirationDate: new Date(
              Number(bidData.expiration) * 1000
            ).toISOString(),
            paymentToken: {
              symbol: bidData.price.currency.symbol,
              usdPrice: bidData.price.amount.usd.toString(),
            },
            makerAddress: bidData.maker,
            quantity: bidData.quantityRemaining,
            marketplace: marketplace,
            eventTimestamp: bidData.updatedAt,
          };
          setBids((prevBids) => [bidInfo, ...prevBids]);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [tasks]);

  const toggleSelectedTasksStatus = (running: boolean) => {
    toggleMultipleTasksRunning(selectedTasks, running);
    const selectedTaskDetails = tasks.filter((task) =>
      selectedTasks.includes(task._id)
    );
    sendMessage({
      endpoint: "update-multiple-tasks-status",
      data: { tasks: selectedTaskDetails, running },
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTasks(selectAll ? [] : tasks.map((task) => task._id));
  };

  const openEditModal = React.useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const toggleMarketplace = (taskId: string, marketplace: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      const updatedMarketplaces = task.selectedMarketplaces.includes(
        marketplace
      )
        ? task.selectedMarketplaces.filter((m) => m !== marketplace)
        : [...task.selectedMarketplaces, marketplace];

      const updatedTask = useTaskStore
        .getState()
        .editTask(taskId, { selectedMarketplaces: updatedMarketplaces });

      try {
        const message = { endpoint: "update-marketplace", data: updatedTask };
        sendMessage(message);

        fetch(`/api/task/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
          credentials: "include",
        });
        console.log("Marketplace updated successfully");
      } catch (error) {
        console.error("Error updating marketplace:", error);
      }
    }
  };

  const indexOfLastOffer = currentPage * recordsPerPage;
  const indexOfFirstOffer = indexOfLastOffer - recordsPerPage;
  const currentBids = bids.slice(indexOfFirstOffer, indexOfLastOffer);
  const totalPages = Math.ceil(bids.length / recordsPerPage);

  const paginate = React.useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const renderPageNumbers = React.useCallback(() => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-Brand/Brand-1 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  }, [currentPage, totalPages, paginate]);

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
      <div className="flex flex-col sm:flex-row  gap-2 sm:gap-4 mb-4 justify-between items-center">
        <div className="flex gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Filter by slug"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-3 rounded-lg border border-n-5 bg-Neutral/Neutral-300-[night]"
          />
          <TagFilter selectedTags={selectedTags} onChange={setSelectedTags} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
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
      </div>
      <Accordion title={`Tasks (${tasks.length})`}>
        <TaskTable
          tasks={tasks}
          selectedTasks={selectedTasks}
          selectAll={selectAll}
          onToggleSelectAll={toggleSelectAll}
          onToggleTaskSelection={toggleTaskSelection}
          onToggleTaskStatus={toggleTaskRunning}
          onToggleMarketplace={toggleMarketplace}
          onEditTask={openEditModal}
          filterText={filterText}
          selectedTags={selectedTags}
        />
      </Accordion>
      <RecentBids
        bids={currentBids}
        currentPage={currentPage}
        recordsPerPage={recordsPerPage}
        totalPages={Math.ceil(bids.length / recordsPerPage)}
        setRecordsPerPage={setRecordsPerPage}
        paginate={paginate}
        renderPageNumbers={renderPageNumbers}
      />
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskId={editingTask?._id}
        initialTask={editingTask}
      />
    </section>
  );
};

export default Tasks;

function determineMarketplace(domain: string): string {
  switch (domain) {
    case "opensea.io":
      return "OS";
    case "blur.io":
      return "Blur";
    case "magiceden.io":
      return "Magic Eden";
    default:
      return "Unknown";
  }
}
