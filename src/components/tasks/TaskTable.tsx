import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Task } from "@/store/task.store";
import Toggle from "@/components/common/Toggle";
import EditIcon from "@/assets/svg/EditIcon";
import { Tag } from "@/store/tag.store";
import { useWebSocket } from "@/hooks/useWebSocket";
import Link from "next/link";
import DeleteIcon from "@/assets/svg/DeleteIcon";
import { useTaskStore } from "@/store/task.store";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteTaskModal";

const GENERAL_BID_PRICE = "GENERAL_BID_PRICE";
const MARKETPLACE_BID_PRICE = "MARKETPLACE_BID_PRICE";

interface TaskTableProps {
  tasks: Task[];
  selectedTasks: string[];
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onToggleTaskSelection: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleMarketplace: (taskId: string, marketplace: string) => void;
  onEditTask: (task: Task) => void;
  filterText: string;
  selectedTags: Tag[];
  selectedBidTypes?: ("COLLECTION" | "TOKEN" | "TRAIT")[]; // Make this prop optional
  // onDeleteTask: (taskId: string) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  selectedTasks,
  selectAll,
  onToggleSelectAll,
  onToggleTaskSelection,
  onToggleTaskStatus,
  onToggleMarketplace,
  onEditTask,
  filterText,
  selectedTags,
  selectedBidTypes = [], // Provide a default empty array
  // onDeleteTask,
}) => {
  const NEXT_PUBLIC_SERVER_WEBSOCKET = process.env
    .NEXT_PUBLIC_SERVER_WEBSOCKET as string;

  const { sendMessage } = useWebSocket(NEXT_PUBLIC_SERVER_WEBSOCKET);
  const filteredTasks = tasks.filter((task) => {
    const matchesSlug = task.contract.slug
      .toLowerCase()
      .includes(filterText.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) =>
        task.tags.some((taskTag) => taskTag.name === tag.name)
      );
    const bidType =
      Object.keys(task?.selectedTraits || {}).length > 0
        ? "TRAIT"
        : task.bidType === "token" && task.tokenIds.length > 0
        ? "TOKEN"
        : task.bidType.toUpperCase();
    const matchesBidType =
      selectedBidTypes.length === 0 ||
      selectedBidTypes.includes(bidType as any);
    return matchesSlug && matchesTags && matchesBidType;
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [bidStats, setBidStats] = useState<{
    [key: string]: { opensea: number; magiceden: number; blur: number };
  }>({});
  const [previousTotalBids, setPreviousTotalBids] = useState({
    opensea: 0,
    blur: 0,
    magiceden: 0,
  });

  const getBidStats = useCallback(async () => {
    const runningTasks = tasks.map((task) => ({
      slug: task.contract.slug,
      selectedMarketplaces: task.selectedMarketplaces,
    }));

    if (!runningTasks.length) return;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks: runningTasks }), // Send the filtered tasks
      });

      if (!response.ok) {
        throw new Error("Failed to post running tasks");
      }

      const data = await response.json();
      console.log("Response from server:", data);
      setBidStats((prevStats) => {
        const updatedStats = { ...prevStats };
        for (const slug of Object.keys(data)) {
          updatedStats[slug] = data[slug];
        }
        return updatedStats;
      });
    } catch (error) {
      console.error("Error posting running tasks:", error);
    }
  }, [tasks]);

  const mergedTasks = useMemo(() => {
    return tasks.map((task) => {
      const slug = task.contract.slug;
      const stats = bidStats[slug] || { OpenSea: 0, MagicEden: 0, Blur: 0 }; // Default stats if slug not found
      return { ...task, bidStats: stats };
    });
  }, [tasks, bidStats]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getBidStats();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [getBidStats]);

  const { deleteTask } = useTaskStore();

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        const response = await fetch(`/api/task/${taskToDelete._id}`, {
          method: "DELETE",
          credentials: "include",
        });

        deleteTask(taskToDelete._id);
        toast.success("Task deleted successfully");

        const message = {
          endpoint: "stop-task",
          data: taskToDelete,
        };
        sendMessage(message);
      } catch (error) {
        console.log("handleDeleteConfirm: ", error);
        toast.error("Failed to delete task");
      }
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const totalBids = useMemo(() => {
    return {
      opensea: Object.values(bidStats).reduce(
        (sum, stats) => sum + (stats.opensea || 0),
        0
      ),
      blur: Object.values(bidStats).reduce(
        (sum, stats) => sum + (stats.blur || 0),
        0
      ),
      magiceden: Object.values(bidStats).reduce(
        (sum, stats) => sum + (stats.magiceden || 0),
        0
      ),
    };
  }, [bidStats]);

  useEffect(() => {
    setPreviousTotalBids((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(totalBids)) {
        return { ...totalBids };
      }
      return prev;
    });
  }, [totalBids]);

  return (
    <>
      <div className="flex my-4 gap-4">
        {["opensea", "blur", "magiceden"].map((marketplace, index) => (
          <div className="flex gap-2 items-center" key={index}>
            <div
              className={`w-4 h-4 rounded-full ${
                marketplace === "opensea"
                  ? "bg-[#2081e2]"
                  : marketplace === "blur"
                  ? "bg-[#FF8700]"
                  : marketplace === "magiceden"
                  ? "bg-[#e42575]"
                  : ""
              }`}
            ></div>
            <div>{totalBids[marketplace]}</div>
          </div>
        ))}
      </div>
      <div className="border rounded-2xl py-3 sm:py-5 px-2 sm:px-6 bg-[#1f2129] border-Neutral/Neutral-Border-[night] h-full">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full table-fixed whitespace-nowrap text-sm">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-Neutral/Neutral-Border-[night]">
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectAll}
                      onChange={onToggleSelectAll}
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
                <th scope="col" className="px-6 py-3 text-center w-[150px]">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[150px]">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[120px]">
                  Bid Type
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[120px]">
                  Min Price
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[120px]">
                  Max Price
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  OS
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  Blur
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  MagicEden
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[100px]">
                  Start
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[80px]">
                  Edit
                </th>
                <th scope="col" className="px-6 py-3 text-center w-[80px]">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {mergedTasks.map((task) => {
                return (
                  <tr
                    key={task._id}
                    className="border-b border-Neutral/Neutral-Border-[night] sm:table-row"
                  >
                    <td className="px-6 py-4 text-center w-[100px]">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedTasks.includes(task._id)}
                          onChange={() => onToggleTaskSelection(task._id)}
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ease-in-out ${
                            selectedTasks.includes(task._id)
                              ? "bg-[#7F56D9] border-[#7F56D9]"
                              : "bg-transparent border-gray-400"
                          }`}
                        >
                          {selectedTasks.includes(task._id) && (
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
                    <td className="px-6 py-4 text-center w-[150px]">
                      <Link
                        href={`/dashboard/tasks/${task.contract.slug}`}
                        className="text-Brand/Brand-1 underline"
                      >
                        {task.contract.slug}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center w-[150px] text-sm">
                      {task.selectedMarketplaces.length > 0 ? (
                        task.selectedMarketplaces
                          .map((marketplace) => marketplace.toLowerCase())
                          .map((marketplace, index) => {
                            const total =
                              task.bidType === "collection" &&
                              Object.keys(task?.selectedTraits || {}).length ==
                                0
                                ? 1
                                : Object.keys(task?.selectedTraits || {})
                                    .length > 0
                                ? Object.values(task.selectedTraits).reduce(
                                    (acc: number, curr: string[]) =>
                                      acc + curr.length,
                                    0
                                  )
                                : task.tokenIds?.length || 1;

                            return (
                              <div
                                className="flex gap-2 items-center"
                                key={index}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    marketplace === "opensea"
                                      ? "bg-[#2081e2]"
                                      : marketplace === "blur"
                                      ? "bg-[#FF8700]"
                                      : marketplace === "magiceden"
                                      ? "bg-[#e42575]"
                                      : ""
                                  }`}
                                ></div>
                                <div>
                                  {task.bidStats[marketplace]} / {total}
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <span>No Marketplaces Selected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center w-[120px]">
                      {Object.keys(task?.selectedTraits || {}).length > 0
                        ? "TRAIT"
                        : task.bidType === "token" && task.tokenIds.length > 0
                        ? "TOKEN"
                        : task.bidType.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-center w-[120px]">
                      <div className="flex flex-col">
                        {task.bidPrice.min &&
                        task.bidPrice.minType &&
                        task.bidPriceType === GENERAL_BID_PRICE ? (
                          <span>
                            {task.bidPrice.min}{" "}
                            {task.bidPrice.minType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.openseaBidPrice.min &&
                        task.openseaBidPrice.minType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#2081e2]">
                            {task.openseaBidPrice.min}{" "}
                            {task.openseaBidPrice.minType === "percentage"
                              ? "%"
                              : "WETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.blurBidPrice.min &&
                        task.blurBidPrice.minType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#FF8700]">
                            {task.blurBidPrice.min}{" "}
                            {task.blurBidPrice.minType === "percentage"
                              ? "%"
                              : "BETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.magicEdenBidPrice.min &&
                        task.magicEdenBidPrice.minType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#e42575]">
                            {task.magicEdenBidPrice.min}{" "}
                            {task.magicEdenBidPrice.minType === "percentage"
                              ? "%"
                              : "WETH".toUpperCase()}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center w-[120px]">
                      <div className="flex flex-col">
                        {task.bidPrice.max &&
                        task.bidPrice.maxType &&
                        task.bidPriceType === GENERAL_BID_PRICE &&
                        task.outbidOptions.outbid ? (
                          <span>
                            {task.bidPrice.max}{" "}
                            {task.bidPrice.maxType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : task.bidPrice.min &&
                          task.bidPrice.minType &&
                          task.bidPriceType === GENERAL_BID_PRICE ? (
                          <span>
                            {task.bidPrice.min}{" "}
                            {task.bidPrice.minType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.openseaBidPrice.max &&
                        task.openseaBidPrice.maxType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE &&
                        task.outbidOptions.outbid ? (
                          <span className="text-[#2081e2]">
                            {task.openseaBidPrice.max}{" "}
                            {task.openseaBidPrice.maxType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : task.openseaBidPrice.min &&
                          task.openseaBidPrice.minType &&
                          task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#2081e2]">
                            {task.openseaBidPrice.min}{" "}
                            {task.openseaBidPrice.minType === "percentage"
                              ? "%"
                              : "WETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.blurBidPrice.max &&
                        task.blurBidPrice.maxType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE &&
                        task.outbidOptions.outbid ? (
                          <span className="text-[#FF8700]">
                            {task.blurBidPrice.max}{" "}
                            {task.blurBidPrice.maxType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : task.blurBidPrice.min &&
                          task.blurBidPrice.minType &&
                          task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#FF8700]">
                            {task.blurBidPrice.min}{" "}
                            {task.blurBidPrice.minType === "percentage"
                              ? "%"
                              : "BETH".toUpperCase()}
                          </span>
                        ) : null}

                        {task.magicEdenBidPrice.max &&
                        task.magicEdenBidPrice.maxType &&
                        task.bidPriceType === MARKETPLACE_BID_PRICE &&
                        task.outbidOptions.outbid ? (
                          <span className="text-[#e42575]">
                            {task.magicEdenBidPrice.max}{" "}
                            {task.magicEdenBidPrice.maxType === "percentage"
                              ? "%"
                              : "ETH".toUpperCase()}
                          </span>
                        ) : task.magicEdenBidPrice.min &&
                          task.magicEdenBidPrice.minType &&
                          task.bidPriceType === MARKETPLACE_BID_PRICE ? (
                          <span className="text-[#e42575]">
                            {task.magicEdenBidPrice.min}{" "}
                            {task.magicEdenBidPrice.minType === "percentage"
                              ? "%"
                              : "WETH".toUpperCase()}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <span className="sm:hidden font-bold">OpenSea</span>
                      <Toggle
                        checked={task.selectedMarketplaces.includes("OpenSea")}
                        onChange={() =>
                          onToggleMarketplace(task._id, "OpenSea")
                        }
                        activeColor="#2081e2"
                        inactiveColor="#3F3F46"
                        disabled={!task.slugValid}
                      />
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <span className="sm:hidden font-bold">Blur</span>
                      <Toggle
                        checked={task.selectedMarketplaces.includes("Blur")}
                        onChange={() => onToggleMarketplace(task._id, "Blur")}
                        activeColor="#FF8700"
                        inactiveColor="#3F3F46"
                        disabled={!task.blurValid || task.bidType === "token"}
                      />
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <span className="sm:hidden font-bold">MagicEden</span>
                      <Toggle
                        checked={task.selectedMarketplaces.includes(
                          "MagicEden"
                        )}
                        onChange={() =>
                          onToggleMarketplace(task._id, "MagicEden")
                        }
                        activeColor="#e42575"
                        inactiveColor="#3F3F46"
                        disabled={!task.magicEdenValid}
                      />
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <span className="sm:hidden font-bold">Tags</span>
                      <div className="flex flex-wrap gap-1 items-center justify-center">
                        {task.tags.map((tag) => (
                          <span
                            key={tag.name}
                            style={{ backgroundColor: tag.color }}
                            className="w-5 h-5 rounded-full"
                          ></span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center w-[100px]">
                      <span className="sm:hidden font-bold">Start</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={task.running}
                          onChange={() => {
                            onToggleTaskStatus(task._id);
                            const message = {
                              endpoint: "toggle-status",
                              data: task,
                            };
                            sendMessage(message);
                          }}
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
                    <td className="px-6 py-4 text-center w-[80px]">
                      <span className="sm:hidden font-bold">Edit</span>
                      <div className="flex items-center justify-end sm:justify-center">
                        <button onClick={() => onEditTask(task)}>
                          <EditIcon />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center w-[80px]">
                      <span className="sm:hidden font-bold">Delete</span>
                      <div className="flex items-center justify-end sm:justify-center">
                        <button onClick={() => handleDeleteClick(task)}>
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        taskSlug={taskToDelete?.contract.slug || ""}
      />
    </>
  );
};

export default TaskTable;
