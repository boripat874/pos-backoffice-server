"use client"

import React, { useEffect, useState, useCallback , useRef } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
import LoadingSpinner from "@/app/components/LoadingSpinner"
// import { TbPdf } from "react-icons/tb";
// import { useRouter } from "next/navigation";
// import { format, parseISO } from 'date-fns'; // เพิ่ม parseISO ถ้า timestamp เป็น ISO string
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import Selectshop  from '@/app/components/selectshop';

// Define interfaces for the report data structures
interface ReportUser {

  uinfoid?: string; // Optional ID if available
  shopnameth: string;
  ugroupname: string;
  uinfoname: string;
  uinfologinname: string;
  level: string;
  details: string;
}

interface Shop {
  shopid: string;
  shopnameth: string;
}

// interface ReportProduct {
//   id?: number | string; // Optional ID if available
//   ordertimestamp: string;
//   shopnameth: string;
//   productnameth: string;
//   productprice: number | string;
//   qty: number;
//   totalprice: number | string;
// }


export default function Reportusers() {

  const router = useRouter();

  const [date, setDate] = useState("-");

  const [reportusers, setReportusers] = useState<ReportUser[]>([]); // Use interface

  // const [reportproducts, setReportproducts] = useState<ReportProduct[]>([]); // Use interface

  const [search, setSearch] = useState(""); // เก็บคำค้นหา
  // const [searchProduct, setSearchProduct] = useState(""); // เก็บคำค้นหา]
  const [isLoading, setIsLoading] = useState(false);

  const [level, setLevel] = useState("");

  const [shoplist, setShoplist] = useState<Shop[]>([]);
  const [shopid, setShopid] = useState("");

  // const [period, setPeriod] = useState("today");
  // const [timestart, setTimeStart] = useState( 
  //   `${new Date().toISOString().split("T")[0]}`
  // );
  // const [timeend, setTimeEnd] = useState(
  //   `${new Date().toISOString().split("T")[0]}`
  // );

  const searchRef = useRef(search); // สร้าง ref เก็บค่า search
  // const periodRef = useRef(period); // สร้าง ref เก็บค่า period
  // const timestartRef = useRef(timestart); // สร้าง ref เก็บค่า shopid
  // const timeendRef = useRef(timeend); // สร้าง ref เก็บค่า shopid
  const shopidRef = useRef(shopid); // สร้าง ref เก็บค่า shopid

  useEffect(() => {

      // อัปเดตเวลา
      const datenow = " " + new Date().toLocaleString('th-TH', {
        hour12: false,
        weekday: 'long',
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    setDate(datenow + " น.");

    fetchDataFirst();
    
    const intervalId = setInterval(() => {
        // อัปเดตเวลา
        const datenow = " " + new Date().toLocaleString('th-TH', {
            hour12: false,
            weekday: 'long',
            month: 'long',
            year: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        setDate(datenow + " น.");
    }, 1000); // ตรวจสอบและอัปเดตทุก 1 วินาที

     // Cleanup function to clear the interval when the component unmounts
     return () => clearInterval(intervalId);
  
  }, []);

  // Wrap fetchData in useCallback
  const fetchDataFirst = useCallback(async () => {
    setIsLoading(true);
    try {

      const searchR = searchRef.current
      // const shopid = shopidRef.current
      // const periodref = periodRef.current
      // const timestartref = timestartRef.current
      // const timeendref = timeendRef.current
 

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      await axios
        .get(`${config.apiUrl}/backoffice/checklogin`, {
          headers: headers,
        })
        .then((res) => {
          if (res.status == 200) {
            setLevel(res.data.level);
          } else if (res.status == 401) {
            Swal.fire({
              icon: "warning",
              title: "เข้าสู่ระบบ",
              text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
              showCancelButton: true,
              timer: 1500,
            });

            localStorage.removeItem("token");
            router.push("/");
          } else {
            localStorage.removeItem("token");
            router.push("/");
          }
        });

      const params = {
        search: searchR,
        // period: periodref,
        // timestart: timestartref,
        // timeend: timeendref,
      };

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);

          let shopidref = ""

          if(shoplist.data.result.length > 0){

            setShopid(shoplist.data.result[0].shopid);

            shopidref = shoplist.data.result[0].shopid;

            shopidRef.current = shopidref;


          }

          const [usersResponse] = await Promise.all([
            axios.post(`${config.apiUrl}/backoffice/reportuserlist`, {
              shopid:shopidref
            },{
              headers,
              params: params,
            })
          ]);

          setReportusers(usersResponse.data.result || []); // Ensure it's an array
        });  


      // setReportproducts(productsResponse.data.result || []); // Ensure it's an array
    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {

      const searchR = searchRef.current
      const shopidR = shopidRef.current


      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const params = {
        search: searchR,
      };

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {
          setShoplist(shoplist.data.result);


          const [usersResponse] = await Promise.all([
            axios.post(`${config.apiUrl}/backoffice/reportuserlist`, {
              shopid:shopidR
            },{
              headers,
              params: params,
            }),
          ]);
    
          setReportusers(usersResponse.data.result || []); // Ensure it's an array
        });

      // setReportproducts(productsResponse.data.result || []); // Ensure it's an array
    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  }, [search]);
  
  // --- CSV Export Helper Functions ---

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If the value contains a comma, double quote, or newline, wrap it in double quotes
    // Also, escape any existing double quotes within the value by doubling them
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    // Add BOM for Excel compatibility with UTF-8 (especially Thai characters)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Check if HTML5 download attribute is supported
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    } else {
        Swal.fire('ข้อผิดพลาด', 'เบราว์เซอร์ของคุณไม่รองรับการดาวน์โหลดไฟล์โดยตรง', 'error');
    }
  };

  const handleExportOrdersCSV = () => {
    if (!reportusers || reportusers.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'รายงานบัญชีผู้ใช้', 'info');
      return;
    }

    const headers = ['ร้าน', 'กลุ่มบัญชีผู้ใช้', 'ชื่อ นามสกุล', 'บัญชีผู้ใช้', 'สิทธิ์ใช้งาน', 'รายละเอียด'];
    const rows = reportusers.map((order: ReportUser) => [
      escapeCSV(order.shopnameth),
      escapeCSV(order.ugroupname),
      escapeCSV(order.uinfoname), // Assuming this is 'ราคารวม'
      escapeCSV(order.uinfologinname),
      escapeCSV(order.level),
      escapeCSV(order.details) // Assuming this is 'ยอดรวมย่อย'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dateStr = format(new Date(), 'dd-MM-yyyy'); // DD-MM-YYYY
    downloadCSV(csvContent, `user_report_${dateStr}.csv`);
  };

  // --- End CSV Export Helper Functions ---
  
  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (

    <div className="flex flex-col">
      
      {/* header */}
      <div className='max-w-[1300px] flex flex-row justify-between items-center'>
        <div>
          <p className='text-4xl pt-4 font-bold'>รายงาน</p>
          <p className='text-md xl:text-lg pt-2'>{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
        {level === "Admin" || level === "Owner" && (
        <div className="w-full h-11 flex flex-row justify-start items-center mt-2 gap-x-4">
          
          
          {/* เลือกร้านค้า */}
          <Selectshop 
            shopid={shopid} 
            shopslist={shoplist} 
            onChange={
  
              (value) => {
                
                setShopid(value);
                shopidRef.current = value;
                fetchData();
                
              }
            } 
          />

      
        </div>
      )}

      {/*table */}
      <div className="mt-2 overflow-auto">

        {/* table user */}
        <div className='w-[1325px] xl:w-full bg-white p-4 rounded-lg shadow-sm mx-auto'> {/* Added w-full, max-w, mx-auto */}

            {/* header table */}
            <div className='flex flex-row justify-between items-start text-white gap-4'> {/* Responsive flex direction */}
              
              <div className='p-2'>
                <p className='text-lg xl:text-2xl font-bold text-black'>รายงานบัญชีผู้ใช้</p>
              </div>

              <div className="text-[14px] xl:text-[16px] p-2 flex flex-row items-center gap-4"> {/* Responsive flex direction and gap */}
                
                {/* --- Attach onClick handler --- */}
                <button
                  className="btn w-[160px]" // Responsive width
                  onClick={handleExportOrdersCSV}
                  disabled={!reportusers || reportusers.length === 0} // Disable if no data
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> 
                  <span className=''>ส่งออก CSV</span>
                </button>

                <div className="relative w-auto"> {/* Responsive width */}
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"></i>
                  <input
                    type="text"
                    placeholder="Search for User..."
                    className=" w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchData(); // ค้นหาเมื่อกด Enter
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* content table - Use a wrapper div for scrolling */}
            <div className='w-full mt-2 overflow-x-auto text-black'> {/* Allow horizontal scroll on small screens */}
              <div className='overflow-y-auto'> {/* Set height and vertical scroll on this div */}
                <table className='text-[16px] table-fixed w-full text-center '>
                  <thead className='border-b border-[#2B5F60] sticky top-0 z-10 bg-[#74d2e7]'>
                    <tr>

                      <th className='h-12 w-[150px] px-2'>ร้าน</th> 
                      <th className='h-12 w-[150px] px-2'>กลุ่มบัญชีผู้ใช้</th>
                      <th className='h-12 w-[150px] px-2'>ชื่อ นามสกุล</th> 
                      <th className='h-12 w-[150px] px-2'>บัญชีผู้ใช้</th> 
                      <th className='h-12 w-[150px] px-2'>สิทธิ์ใช้งาน</th> 
                      <th className='h-12 w-[450px] px-2'>รายละเอียด</th> 

                    </tr>
                  </thead>
                  <tbody>
                      {/* {Array.isArray(reportusers) && reportusers.length > 0 ? (reportusers.map((reportorder: ReportUser, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className='h-12 px-2 truncate'>{reportorder.ordertimestamp}</td> 
                        <td className='h-12 px-2 truncate'>{reportorder.ordernumber}</td>
                        <td className='h-12 px-2 truncate'>{Number(reportorder.ordertotalprice).toFixed(2)}</td>
                        <td className='h-12 px-2 text-center'>{Number(reportorder.vat7pc).toFixed(2)}</td> 
                        <td className='h-12 px-2 text-center'>{Number(reportorder.ordertotaldiscount).toFixed(2)}</td> 
                        <td className='h-12 px-2 text-center'>{Number(reportorder.ordertotalprice).toFixed(2)}</td> 
                        <td className='h-12 px-2 text-center'>เงินสด</td>
                        <td className='h-12 px-2 text-center items-center justify-center flex'>
                          <button className='w-8 h-8 text-white bg-[#2B5F60] rounded-md flex justify-center items-center'>
                            <TbPdf size={25}/>
                          </button>
                        </td> 
                      </tr>
                      ))): (
                        <tr>
                          <td colSpan={7} className="h-64 text-lg text-center text-black opacity-60">ไม่พบข้อมูลรายการบิล</td>
                        </tr>
                      )} */}
                      {/* <tr  className="border-b border-gray-100 hover:bg-gray-50">
                        <td className='h-12 px-2 truncate'>บ้านสุขใจ</td> 
                        <td className='h-12 px-2 truncate'>Smart</td>
                        <td className='h-12 px-2 truncate'>สมศรี รักดี</td>
                        <td className='h-12 px-2 text-center'>Somsri</td> 
                        <td className='h-12 px-2 text-center'>admin</td> 
                        <td className='h-12 px-2 text-center'>ผู้ดูแลระบบ POS Backoffice</td> 
                      </tr> */}
                      {
                        Array.isArray(reportusers) && reportusers.length > 0 ? (
                          reportusers.map((reportuser: ReportUser) => (
                            <tr key={reportuser.uinfoid}>
                              <td className='h-12 px-2 truncate'>{reportuser.shopnameth}</td> 
                              <td className='h-12 px-2 truncate'>{reportuser.ugroupname}</td>
                              <td className='h-12 px-2 truncate'>{reportuser.uinfoname}</td> 
                              <td className='h-12 px-2 text-center'>{reportuser.uinfologinname}</td> 
                              <td className='h-12 px-2 text-center'>{reportuser.level}</td> 
                              <td className='h-12 px-2 text-center'>{reportuser.details}</td> 
                            </tr>
                          ))
                        ): (
                          <tr>
                            <td colSpan={6} className="py-4 text-[16px] text-center text-black opacity-60">ไม่มีข้อมูลรายงานบัญชีผู้ใช้</td>
                          </tr>
                        )

                      }
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

    </div>
  )
}
