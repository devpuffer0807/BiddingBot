"use client";

import "../globals.css";
import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "../context/GlobalContext";
import Sidebar from "@/components/sidebar/Sidebar";
import BackIcon from "@/assets/svg/BackIcon";
import DashboardHeader from "@/components/header/DashboardHeader";

export default function RootLayout({ children }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const { showSideBar, setShowSidebar } = useGlobal();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
        setIsMobileOrTablet(true);
      } else {
        setIsCollapsed(false);
        setIsMobileOrTablet(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main>
      <Suspense>
        <DashboardHeader />
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="transition-all duration-300">
          <button
            onClick={() => {
              setShowSidebar(true);
              router.back();
            }}
            className="flex items-center gap-3 ml-28 mt-28"
          >
            <BackIcon fill="#AEB9E1" />
            <h3>Back</h3>
          </button>
          {children}
        </div>
      </Suspense>
    </main>
  );
}
