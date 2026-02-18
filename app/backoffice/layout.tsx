"use client"

import { useEffect, useState } from "react";
import Sidebar from "@/app/sidebar";
import Sidebar_mobile from "@/app/sidebar_Moblie";

export default function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null; // prevent mismatches during hydration

  return (
    <>
      <div className="relative flex">
        {isMobile && (
            <button
              className="absolute top-2 right-2 z-50 h-[35px] bg-[#84bd00] px-2 py-1  bg-opacity-80 rounded-lg "
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className="fa-solid fa-bars text-black text-2xl"></i>
            </button>

        )}

        {(isMobile && isSidebarOpen) && (
          <div className="fixed w-full h-full top-2 px-4 flex justify-end items-center z-10">
            {/* <div className="sticky top-0 z-100"> */}
              <Sidebar_mobile />
            {/* </div> */}
          </div>
        )}
        
        <div className="relative flex w-full h-full">
          {(!isMobile && !isSidebarOpen) && <Sidebar className="sticky top-0 left-0 z-[100]" />}
          <div className="flex-1 px-2 md:px-0 md:ml-2 overflow-auto">{children}</div>
        </div>
      </div>
    </>
  );
}