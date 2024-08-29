"use client";

import React, { useState } from "react";
import { expenseGraph, gasGraph, incomeGraph, inventoryGraph } from "@/assets";
import ExpenseIcon from "@/assets/svg/ExpenseIcon";
import GasIcon from "@/assets/svg/GasIcon";
import InventoryIcon from "@/assets/svg/InventoryIcon";
import ProfitIcon from "@/assets/svg/ProfitIcon";
import SoldIcon from "@/assets/svg/SoldIcon";
import WalletModal from "@/components/wallet/WalletModal";
import Card from "@/components/wallet/Card";

const cardData = [
  {
    icon: <ExpenseIcon />,
    amount: "$17.2k",
    title: "Total Spent",
    percentage: 5,
    graph: incomeGraph,
  },
  {
    icon: <SoldIcon />,
    amount: "$57.9k",
    title: "Total Sold",
    percentage: -5,
    graph: expenseGraph,
  },
  {
    icon: <InventoryIcon />,
    amount: "$82k",
    title: "Inventory Cost",
    percentage: -5,
    graph: inventoryGraph,
  },
  {
    icon: <ProfitIcon />,
    amount: "$25k",
    title: "Realized Profit",
    percentage: 20,
    graph: incomeGraph,
  },
  {
    icon: <GasIcon />,
    amount: "$200",
    title: "Tx Fees",
    percentage: -5,
    graph: gasGraph,
  },
];

const Wallet = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="ml-20 p-6 pb-24">
      <div className="flex flex-col items-center justify-between mb-8 pb-4 sm:flex-row">
        <h1 className="text-xl font-bold mb-4 sm:mb-0 sm:text-2xl md:text-[28px]">
          Manage Wallet
        </h1>
        <button
          className="w-full sm:w-auto dashboard-btn uppercase bg-Brand/Brand-1 text-xs py-3 px-4 sm:text-sm sm:px-6 md:px-8"
          onClick={() => setIsModalOpen(true)}
        >
          Create New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mx-auto">
        {cardData.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Wallet;
