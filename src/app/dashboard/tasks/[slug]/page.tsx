"use client";
import CancelIcon from "@/assets/svg/CancelIcon";
import MarketplaceFilter, {
  Marketplace,
} from "@/components/tasks/MarketplaceFilter";
import { useTaskStore } from "@/store";
import { useCallback, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  } else {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<
    Marketplace[]
  >([]);

  const { tasks } = useTaskStore();

  const {
    data,
    error,
    isLoading,
  }: {
    data: OfferData[];
    error: any;
    isLoading: boolean;
  } = useSWR(`/api/progress/${params.slug}`, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 1000,
  });

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTasks(selectAll ? [] : data.map((task) => task.value));
  };

  const toggleBid = (value: string) => {
    setSelectedTasks((prev) => {
      const newSelection = prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value];
      setSelectAll(newSelection.length === tasks.length);
      return newSelection;
    });
  };

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const filteredBids = data?.filter(
    (bid) =>
      selectedMarketplaces.length === 0 ||
      selectedMarketplaces.includes(bid.marketplace as Marketplace)
  );

  const indexOfLastOffer = currentPage * recordsPerPage;
  const totalPages = Math.ceil(filteredBids?.length / recordsPerPage) ?? 1;
  const indexOfFirstOffer = indexOfLastOffer - recordsPerPage;
  const currentBids =
    filteredBids?.slice(indexOfFirstOffer, indexOfLastOffer) ?? [];

  const renderPageNumbers = useCallback(() => {
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
      <div></div>
      Task: {params.slug} ({data?.length} SUCCESSFUL BIDS)
      <div className="flex items-center justify-between my-4">
        <MarketplaceFilter
          selectedMarketplaces={selectedMarketplaces}
          onChange={setSelectedMarketplaces}
        />
        <button
          className="w-full sm:w-auto dashboard-btn uppercase bg-red-500 text-xs py-3 px-4 sm:text-sm sm:px-6 md:px-8"
          onClick={() => {}}
        >
          Cancel Selected
        </button>
      </div>
      <div className="border rounded-2xl py-3 sm:py-5 px-2 sm:px-6 bg-[#1f2129] border-Neutral/Neutral-Border-[night] h-full overflow-x-auto mt-8">
        <table className="w-full text-sm text-left">
          <thead className="hidden sm:table-header-group">
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
                name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                marketplace
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                offer price
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Expires In
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Cancel Bid
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBids &&
              currentBids?.length > 0 &&
              currentBids?.map((bid, index) => {
                return (
                  <tr
                    key={index}
                    className="border-b border-Neutral/Neutral-Border-[night] flex flex-col sm:table-row mb-4 sm:mb-0"
                  >
                    <td className="py-2 px-2 sm:px-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
                      <span className="sm:hidden font-bold">Select</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedTasks.includes(bid.value)}
                          onChange={() => toggleBid(bid.value)}
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-200 ease-in-out ${
                            selectedTasks.includes(bid.value)
                              ? "bg-[#7F56D9] border-[#7F56D9]"
                              : "bg-transparent border-gray-400"
                          }`}
                        >
                          {selectedTasks.includes(bid.value) && (
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
                    <td className="py-2 px-2 sm:px-4 text-left sm:text-center flex items-center justify-center sm:table-cell ">
                      <div className="flex gap-2 items-center justify-center">
                        <span
                          className={`w-4 h-4 rounded-full ${
                            bid.marketplace === "opensea"
                              ? "bg-[#2081e2]"
                              : bid.marketplace === "blur"
                              ? "bg-[#FF8700]"
                              : bid.marketplace === "magiceden"
                              ? "bg-[#e42575]"
                              : ""
                          }`}
                        ></span>
                        <div>{bid.marketplace}</div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
                      {params.slug}{" "}
                      {bid.identifier === "default"
                        ? null
                        : `#${bid.identifier}`}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
                      {Number(bid.offerPrice) / 1e18} WETH
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
                      {formatTimeRemaining(bid.ttl)}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-left sm:text-center flex items-center justify-between sm:table-cell">
                      <span className="sm:hidden font-bold">Edit</span>
                      <div className="flex items-center justify-end sm:justify-center">
                        <button onClick={() => {}}>
                          <CancelIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Show</span>
          <select
            value={recordsPerPage}
            onChange={(e) => setRecordsPerPage(Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-400">Records</span>
        </div>
        <div className="flex flex-wrap justify-center space-x-2">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <div className="hidden sm:flex space-x-2">{renderPageNumbers()}</div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
      <div className="sm:hidden mt-4 text-center">
        <span className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </section>
  );
}

interface OfferData {
  key: string;
  value: string;
  ttl: number;
  marketplace: string;
  identifier: string;
  offerPrice: string;
  expirationDate: string;
}
