import { useGlobal } from "@/app/context/GlobalContext";
import { toggle } from "@/assets";
import DashboardIcon from "@/assets/svg/DashboardIcon";
import WalletIcon from "@/assets/svg/WalletIcon";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = ({ isCollapsed, setIsCollapsed }: any) => {
  const pathname = usePathname();
  const router = useRouter();

  const { showSideBar, setShowSidebar } = useGlobal();

  const NAV_ITEMS = [
    { name: "Dashboard", icon: DashboardIcon, href: "/dashboard" },
    { name: "Wallet", icon: WalletIcon, href: "/dashboard/wallet" },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  async function signOut() {
    try {
      const response = await fetch("/api/auth/signout");
      const { success } = await response.json();
      if (success) {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      className={`pt-9 bg-Neutral-BG-[night] border top-[92px] left-0 pb-[300px] border-Neutral/Neutral-Border-[night] h-full fixed z-[99] transition-all duration-300 ${
        isCollapsed ? "w-[80px]" : "w-[300px]"
      } ${
        window.innerWidth <= 768
          ? showSideBar
            ? "translate-x-0"
            : "-translate-x-full"
          : ""
      }`}
    >
      <button
        onClick={toggleCollapse}
        className={`fixed transition-all duration-300 ease-in-out ${
          isCollapsed ? "left-[50px] top-[56px]" : "left-[268px] top-[64px]"
        } text-white rounded-md`}
      >
        <Image
          src={toggle}
          alt="toggle icon"
          width={60}
          height={60}
          className={`${isCollapsed ? "transform rotate-180" : ""}`}
        />
      </button>
      <div
        className={`mt-[42px] flex flex-col gap-6 px-7 pb-[21px] border-b border-[#FFFFFF33] ${
          isCollapsed ? "items-center" : ""
        }`}
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            pathname.replace("/dashboard", "").split("/")[1] ===
            item.href.split("/")[2];
          return (
            <Link
              href={item.href}
              key={index}
              onClick={() => setIsCollapsed(false)}
              className={`p-4 flex gap-4 items-center ${
                isCollapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "text-white bg-Brand/Brand-1 rounded-xl"
                  : "text-[#AEB9E1]"
              }`}
            >
              <item.icon fill={isActive ? "#ffffff" : "#AEB9E1"} />
              {!isCollapsed && (
                <h4
                  className={`font-semibold font-poppins ${
                    isActive ? "text-white" : "text-[#AEB9E1]"
                  }`}
                >
                  {item.name}
                </h4>
              )}
            </Link>
          );
        })}
        <button className="mt-8 flex items-center gap-6" onClick={signOut}>
          {!isCollapsed && (
            <h4 className={`font-semibold font-poppins text-[#AEB9E1]`}>
              Sign out
            </h4>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
