"use client"

import React, { useEffect, useState , useCallback,useRef } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
import LoadingSpinner from "../../components/LoadingSpinner"
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import Selectshop  from '@/app/components/selectshop';
import Selectdate from '@/app/components/selectdate';


interface EventLogItem {
  id: number | string; // Assuming id can be number or string
  timestamplog: string;
  shopnameth: string;
  uinfoname: string;
  details: string;
}

interface Shop {
  shopid: string;
  shopnameth: string;
}

export default function Event_log() {

  const router = useRouter();
  const [level, setLevel] = useState("");

  const [date, setDate] = useState("-");

  const [eventloglist, setEventloglist] = useState<EventLogItem[]>([]);
  const [search, setSearch] = useState("");
  const [shopid, setShopid] = useState("");
  
  const [shoplist, setShoplist] = useState<Shop[]>([]); // Use the interface]
  
  const [period, setPeriod] = useState("today");
  const [timestart, setTimeStart] = useState(
    `${new Date().toISOString().split("T")[0]}`
  );
  const [timeend, setTimeEnd] = useState(
    `${new Date().toISOString().split("T")[0]}`
  );

  const searchRef = useRef(search); // สร้าง ref เก็บค่า search
  const periodRef = useRef(period); // สร้าง ref เก็บค่า period
  const timestartRef = useRef(timestart); // สร้าง ref เก็บค่า shopid
  const timeendRef = useRef(timeend); // สร้าง ref เก็บค่า shopid
  const shopidRef = useRef(shopid); // สร้าง ref เก็บค่า shopid
  const levelRef = useRef(level); // สร้าง ref เก็บค่า level


  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

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
  
      // fetchData(); // เรียกข้อมูลเมื่อ component โหลดครั้งแรก

    return () => {
      clearInterval(intervalId);
    }
  
  }, []);

  const fetchDataFirst = async () => {
    setIsLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      await axios
        .get(`${config.apiUrl}/backoffice/checklogin`, {
          headers: headers,
        })
        .then((res) => {
          if (res.status == 200) {
            setLevel(res.data.level);
            levelRef.current = res.data.level;
            // console.log("level -->>",res.data.level);
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

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);

          shopidRef.current = (levelRef.current == "Admin" || levelRef.current == "Owner") 
            ? "" : shoplist.data.result[0].shopid;

          const [response] = await Promise.all([
            axios.post(`${config.apiUrl}/backoffice/eventloglist`, 
              {
                shopid: shopidRef.current,
              },
              { headers}
            )
          ]);
    
          setEventloglist(response.data.result || []); // Ensure it's an array
        });

    } catch (err: unknown) {

      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: errorMessage,
      });
    }
    setIsLoading(false);
  }; // Include search in the dependency array

  // Wrap fetchData in useCallback to stabilize its identity
  const fetchData = useCallback(async () => {
    // setIsLoading(true);
    try {

      const currentSearch = searchRef.current; // อ่านค่าล่าสุดจาก ref
      const currentPeriod = periodRef.current; // อ่านค่าล่าสุดจาก ref
      const currentTimestart = timestartRef.current; // อ่านค่าล่าสุดจาก ref
      const currentTimeend = timeendRef.current; // อ่านค่าล่าสุดจาก ref
      const currentShopid = shopidRef.current; // อ่านค่าล่าสุดจาก ref

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      const params = {
        search: currentSearch,
        period: currentPeriod,
        date_start: currentTimestart,
        date_end: currentTimeend,
      };
      
      const [response] = await Promise.all([
        axios.post(`${config.apiUrl}/backoffice/eventloglist`, {
          shopid: currentShopid
        },
        { headers, params: params })
      ]);

      setEventloglist(response.data.result || []); // Ensure it's an array

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);
        });
    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: errorMessage,
      });
    }
    // setIsLoading(false);
  }, [search, period, timestart, timeend]); // Include search in the dependency array


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

  // ฟังก์ชันสำหรับ Export CSV
  const handleExportCSV = () => {
    if (!eventloglist || eventloglist.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'ไม่มีข้อมูล',
        text: 'ไม่มีข้อมูล Event Log สำหรับ Export',
      });
      return;
    }

    const headers = ['เวลา วันที่', 'ร้าน', 'User', 'การดำเนินงาน'];
    const rows = eventloglist.map((eventlog) => [
      escapeCSV(eventlog.timestamplog),
      escapeCSV(eventlog.shopnameth),
      escapeCSV(eventlog.uinfoname),
      escapeCSV(eventlog.details),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const dateStr = format(new Date(), 'dd-MM-yyyy'); // DD-MM-YYYY
    downloadCSV(csvContent, `event_log_${dateStr}.csv`);
  };

  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-2xl xl:text-4xl pt-4 font-bold">ดำเนินการ</p>
          <p className="text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
      <div className="w-full flex flex-col md:flex-row justify-start items-start mt-2 gap-x-2 xl:gap-x-4 gap-y-2 xl:gap-y-0">
        {/* เลือกร้านค้า */}
        {(level === "Admin" || level === "Owner") && (
          <div>
            <select
              className="text-[16px] w-[160px]  xl:w-[180px] h-[40px] xl:h-[40px] rounded-md border-[#009f4d] px-2 border text-black"
              value={shopid}
              onChange={(e) => {
                setShopid(e.target.value);
                shopidRef.current = e.target.value;
                fetchData();
              }}
            >
              <option key={""} value={""}>
                ร้านค้าทั้งหมด
              </option>
              {shoplist.map((shop) => (
                <option key={shop.shopid} value={shop.shopid}>
                  {shop.shopnameth}
                </option>
              ))}
            </select>
          </div>

          // <Selectshop
          //   shopid={shopid}
          //   shopslist={shoplist}
          //   onChange={(value) => {

          //     setShopid(value);
          //     shopidRef.current = value;
          //     fetchData();

          //   }}
          // />
        )}

        {/* เลือกช่วงเวลา */}
        <Selectdate
          period={period}
          timestart={timestart}
          timeend={timeend}
          periodRef={periodRef}
          onChangePeriod={(value) => {
            setPeriod(value);
            periodRef.current = value;
            fetchData();
          }}
          onChangeTimestart={(value) => {
            const newStartDateString = value;
            setTimeStart(newStartDateString);
            timestartRef.current = newStartDateString;

            // Convert to Date objects for comparison
            const newStartDate = new Date(newStartDateString);
            const currentEndDate = new Date(timeend);
            if (newStartDate > currentEndDate) {
              setTimeEnd(newStartDateString); // Set timeend to the new timestart
              timeendRef.current = newStartDateString;
            }

            fetchData();
          }}
          onChangeTimeend={(value) => {
            const newEndDateString = value;
            // Convert to Date objects for comparison
            const newEndDate = new Date(newEndDateString);
            const currentStartDate = new Date(timestart);
            if (newEndDate < currentStartDate) {
              setTimeEnd(timestart); // Set timeend to the current timestart
              timeendRef.current = timestart;
            } else {
              setTimeEnd(newEndDateString);
              timeendRef.current = newEndDateString;
            }
            fetchData();
          }}
        />
      </div>

      {/*table */}
      <div className="mt-2 overflow-auto">
        {/* table event log */}
        <div className="w-[1325px] xl:w-full mt-0 bg-white p-4 rounded-lg shadow-sm">
          {/* header table */}
          <div className="flex flex-row justify-between items-center text-white">
            <div className="flex flex-row justify-between items-center p-4">
              <p className="text-lg xl:text-2xl font-bold text-black">
                {" "}
                การดำเนินงาน
              </p>
            </div>

            {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

            <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-4">
              {/* ปุ่ม Export CSV */}
              <button
                className="btn" // เพิ่ม style ให้ปุ่ม
                onClick={handleExportCSV}
              >
                <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                <span className="">ส่งออก CSV</span>
              </button>

              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Search for Event log ..."
                  className="w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchRef.current = search;
                      fetchData(); // ค้นหาเมื่อกด Enter
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* content table */}
          <div className="overflow-y-auto text-black">
            <table className="text-[14px] xl:text-[16px] p-4 table-auto w-full text-center ">
              <thead className="border-b border-[#2B5F60 sticky top-0 bg-[#74d2e7]">
                <tr>
                  <th className="h-12 w-[150px]">เวลา วันที่</th>
                  <th className="h-12 w-[100px]">ร้าน</th>
                  <th className="h-12 w-[100px]">User</th>
                  <th className="h-12 w-[350px]">การดำเนินงาน</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(eventloglist) && eventloglist.length > 0 ? (
                  eventloglist.map((eventlog: EventLogItem) => (
                    <tr
                      key={eventlog.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 w-[150px]">
                        {eventlog.timestamplog}
                      </td>
                      <td className="h-12 w-[100px]">{eventlog.shopnameth}</td>
                      <td className="h-12 w-[100px]">{eventlog.uinfoname}</td>
                      <td className="h-12 w-[350px]">{eventlog.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4  text-base text-center text-black opacity-60"
                    >
                      ไม่พบข้อมูลการดำเนินงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
