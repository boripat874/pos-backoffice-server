
import Link from "next/link"
import React, { useState, useEffect, useRef } from 'react';
// import Image from "next/image"; // Import the Image component
// import IconSVG from "@/public/icons/icon.svg"; // ปรับ path ให้ตรงกับตำแหน่งไฟล์ .svg

interface ButtomSidebarProps {
  label: string
  urllink: string
  status?: boolean
  hoveraction?: boolean
  children?: React.ReactNode
  onClick?: () => void
}

function ButtomSidebar( {label,urllink, status,hoveraction , children , onClick}: ButtomSidebarProps , ) {
  const [showLabelWithDelay, setShowLabelWithDelay] = useState(false);
  const labelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check screen size
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const LABEL_DISPLAY_DELAY = isMobile ? 0 : 400;

  useEffect(() => {

    if (hoveraction) {

      // If sidebar is intended to be expanded (hoveraction is true)
      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
      labelTimerRef.current = setTimeout(() => {
        setShowLabelWithDelay(true);
      }, LABEL_DISPLAY_DELAY);

    } else {

      // If sidebar is intended to be collapsed (hoveraction is false)
      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
      setShowLabelWithDelay(false); // Hide label immediately

    }

    // Cleanup function to clear the timer if the component unmounts or hoveraction changes
    return () => {

      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
      
    };
  }, [hoveraction]); // Re-run this effect whenever hoveraction changes

  // Use 0 delay if mobile, otherwise 400ms
  

  

  return (
    <>
      <Link
        href={urllink}
        onClick={onClick} // เพิ่ม onClick handler
        className={`relative w-full h-[50px] md:h-[45px] xl:h-[70px] pl-[8px] xl:pl-[10px] rounded-tl-md rounded-bl-md md:rounded-tl-lg md:rounded-bl-lg xl:rounded-tl-xl xl:rounded-bl-xl ${
          status ? "bg-[#2B5F60]" : "bg-white hover:bg-[#ecf7f4]"
        } flex items-center`}
      >
        {/* <Link href={urllink}> */}
          {/* ไอคอน */}
          <div
            className={`w-[45px]  md:w-[35px] xl:w-[55px] h-[40px] md:h-[30px]  xl:h-[50px] rounded-lg xl:rounded-lg flex justify-center items-center ${
              status ? "bg-[#009f4d]" : "bg-white"
            }`}
          >
            {children}
          </div>
          {showLabelWithDelay ? (
            <span className={`ml-8 md:ml-2 xl:ml-4 text-[16px] md:text-[10px] xl:text-sm font-semibold ${status ? "text-white" : "text-[#009f4d]"}`}>{label}</span>
          ):null}
        {/* </Link> */}

        {/* บน */}
        {/* <div
            className={`absolute -top-[18px] -right-[1px] ${
              status ? "block" : "hidden"
            }`}
          >
            <Image
              src="/sidebar/vectorPathTop.svg" // ตัวอย่างไฟล์ .svg สำหรับส่วนบน
              alt="top icon"
              // className="w-[20px] h-[20px]"
              width={20} // Add width prop
              height={20} // Add height prop
            />
          </div> */}

        {/* ล่าง */}
      </Link>
    </>
  );
}

export default ButtomSidebar