import React from "react";
import { Task } from "@/store/task.store";
import Toggle from "@/components/common/Toggle";
import EditIcon from "@/assets/svg/EditIcon";

interface TaskTableProps {
  tasks: Task[];
  selectedTasks: string[];
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onToggleTaskSelection: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleMarketplace: (taskId: string, marketplace: string) => void;
  onEditTask: (task: Task) => void;
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
}) => (
  <div className="border rounded-2xl py-3 sm:py-5 px-2 sm:px-6 bg-[#1f2129] border-Neutral/Neutral-Border-[night] h-full overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-Neutral/Neutral-Border-[night]">
          <th scope="col" className="px-6 py-3 text-center">
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
            MagicEden
          </th>
          <th scope="col" className="px-6 py-3 text-center">
            Blur
          </th>
          <th scope="col" className="px-6 py-3 text-center">
            OS
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
            key={task._id}
            className="border-b border-Neutral/Neutral-Border-[night] flex flex-col sm:table-row mb-4 sm:mb-0"
          >
            <td className="py-2 px-2 sm:px-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Select</span>
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
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Slug</span>
              <a
                href={`https://opensea.io/collection/${task.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-Brand/Brand-1 underline"
              >
                {task.slug}
              </a>
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Min Floor Price %</span>
              <span>{task.minFloorPricePercentage}%</span>
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Max Floor Price %</span>
              <span>{task.maxFloorPricePercentage}%</span>
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">MagicEden</span>
              <Toggle
                checked={task.selectedMarketplaces.includes("MagicEden")}
                onChange={() => onToggleMarketplace(task._id, "MagicEden")}
                activeColor="#e42575"
                inactiveColor="#3F3F46"
              />
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Blur</span>
              <Toggle
                checked={task.selectedMarketplaces.includes("Blur")}
                onChange={() => onToggleMarketplace(task._id, "Blur")}
                activeColor="#FF8700"
                inactiveColor="#3F3F46"
              />
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">OpenSea</span>
              <Toggle
                checked={task.selectedMarketplaces.includes("OpenSea")}
                onChange={() => onToggleMarketplace(task._id, "OpenSea")}
                activeColor="#2081e2"
                inactiveColor="#3F3F46"
              />
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Start</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={task.running}
                  onChange={() => onToggleTaskStatus(task._id)}
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
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
              <span className="sm:hidden font-bold">Edit</span>
              <div className="flex items-center justify-end sm:justify-center">
                <button onClick={() => onEditTask(task)}>
                  <EditIcon />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TaskTable;
