
import Link from "next/link"
import React, { useState, useEffect, useRef } from 'react';
// import Image from "next/image"; // Import the Image component
import { useRouter,usePathname } from 'next/navigation'; // Import usePathname
import { BiChevronUp , BiChevronDown } from "react-icons/bi";
// import IconSVG from "@/public/icons/icon.svg"; // ปรับ path ให้ตรงกับตำแหน่งไฟล์ .svg

interface ButtomSidebardata{
  label:string
  urllink:string
}

interface ButtomSidebarProps {
  label: string
  urllink?: string
  data: Array<ButtomSidebardata>
  status?: boolean
  hoveraction?: boolean
  children?: React.ReactNode
  onClick?: () => void
}

function SubButtomSidebar( {label,data , status,hoveraction , children , onClick}: ButtomSidebarProps , ) {
  const [showLabelWithDelay, setShowLabelWithDelay] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false); // State to control sub-menu visibility on click
  const labelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathname = usePathname(); // Get current pathname
  const [isMobile, setIsMobile] = useState(true);
  
    useEffect(() => {
      // Check screen size
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    const LABEL_DISPLAY_DELAY = isMobile ? 0 : 400;

  const router = useRouter();

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
      setIsSubMenuOpen(false); // Close sub-menu when sidebar collapses
      setShowLabelWithDelay(false); // Hide label immediately

    }

    // Cleanup function to clear the timer if the component unmounts or hoveraction changes
    return () => {

      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
      
    };
  }, [hoveraction]); // Re-run this effect whenever hoveraction changes

  const handleButtonClick = () => {

    if(currentPathname !== "/backoffice/report/order" && currentPathname !== "/backoffice/report/user"){
                  
      router.push("/backoffice/report/order");
    }

    if (onClick) {
      onClick(); // Call the parent's onClick (e.g., to set status)
    }
    if (hoveraction) { // Only toggle sub-menu if sidebar is expanded
      setIsSubMenuOpen(!isSubMenuOpen);
    }
  };

  return (
    <div className={`relative w-full ${status ? "bg-slate-700" : "bg-white"} md:rounded-tl-lg md:rounded-bl-lg rounded-tl-xl rounded-bl-xl flex flex-col justify-start`}>

      <button
        onClick={handleButtonClick} // Use the new handler
        className={`relative w-full h-[50px] xl:h-[70px] pl-[10px] md:rounded-tl-lg md:rounded-bl-lg rounded-tl-xl rounded-bl-xl ${
          status ? "bg-[#2B5F60]" : "bg-white hover:bg-[#ecf7f4]"
        } flex items-center justify-between pr-2`}
      >

        {/* <Link href={urllink}> */}
        <div className="flex items-center">
          {/* ไอคอน */}
          <div
            className={`w-[45px]  md:w-[35px] xl:w-[55px] h-[40px] md:h-[30px]  xl:h-[50px] rounded-md md:rounded-lg flex justify-center items-center ${
              status ? "bg-[#3DA48F]" : "bg-white"
            }`}
          >
            {children}
          </div>
          {showLabelWithDelay ? (
            <span
              className={`ml-8 md:ml-2 xl:ml-4 text-[16px] md:text-[10px] xl:text-sm font-semibold ${
                status ? "text-white" : "text-[#3DA48F]"
              }`}
            >
              {label}
            </span>
          ) : null}
        </div>

        {showLabelWithDelay ? (
          isSubMenuOpen ? (
            <BiChevronUp
              size={25}
              className={`ml-2 ${status ? "text-white" : "text-[#3DA48F]"}`}
            />
          ) : (
            <BiChevronDown
              size={25}
              className={`ml-2 ${status ? "text-white" : "text-[#3DA48F]"}`}
            />
          )
        ) : null}

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
      </button>

      {/* Render sub-links only if sidebar is hovered AND sub-menu is open */}
      {hoveraction &&
        isSubMenuOpen && // Removed showLabelWithDelay from this condition as it's for the main button label
        showLabelWithDelay &&
        status &&
        data?.map((item, index) => (
          // Using a div here as the button handles the click for toggling.
          // The Link component inside handles navigation.
          <div key={index} className="w-full flex justify-center items-center">
            <Link
              href={item.urllink}
              className={`text-[16px] md:text-[10px] xl:text-sm flex items-center justify-center w-full h-[35px] xl:h-[45px] md:rounded-bl-lg rounded-bl-xl
                          ${
                            currentPathname === item.urllink
                              ? "bg-[#2B5F60] text-white" // Active link style
                              : "text-white hover:bg-slate-600" // Default and hover style
                          }`}
            >
              {item.label}
            </Link>
          </div>
        ))}
    </div>
  );
}

export default SubButtomSidebar