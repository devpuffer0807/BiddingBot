"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardHeader = () => {
  const pathname = usePathname();

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-Neutral/Neutral-Border-[night] shadow-md shadow-gray-800/20 bg-Neutral-BG-[night]`}
    >
      <div className="flex items-center justify-between px-5 lg:px-7.5 xl:px-24 max-lg:py-4 py-4">
        <Link className="w-[12rem] xl:mr-8 flex items-center gap-4" href="/">
          <Image src="/logo.png" width={60} height={60} alt="NFTTOOLS" />
          <h2 className="text-xl font-bold">Dashboard</h2>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
