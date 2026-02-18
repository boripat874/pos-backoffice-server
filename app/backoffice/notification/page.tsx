"use client"

import React, { useEffect, useState, useCallback , useRef} from 'react'
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { config } from "@/app/lib/config";
import LoadingSpinner from "../../components/LoadingSpinner"
import Selectdate from '@/app/components/selectdate';
import Selectshop  from '@/app/components/selectshop';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import { error } from 'console';

interface NotificationItem {
  notificationid: string | number; // Adjust type as needed
  create_at: string;
  title: string;
  details: string;
}

interface Shop {
  shopid: string;
  shopnameth: string;
  unreadCount: number;
}

export default function Notification() {

  const [date, setDate] = useState("-");
  const [level, setLevel] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]); // Use the interface
  const [shoplist, setShoplist] = useState<Shop[]>([]); // Use the interface]

  const [search, setSearch] = useState("");
  const [shopid, setShopid] = useState("");
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

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // อัปเดตเวลาเริ่มแรก
    const datenow =
      " " +
      new Date().toLocaleString("th-TH", {
        hour12: false,
        weekday: "long",
        month: "long",
        year: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    setDate(datenow + " น.");
    fetchDataFirst();

    const intervalId = setInterval(() => {
      // อัปเดตเวลา
      const datenow =
        " " +
        new Date().toLocaleString("th-TH", {
          hour12: false,
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      setDate(datenow + " น.");
    }, 2000); // ตรวจสอบและอัปเดตทุก 1 วินาที

    const intervalId2 = setInterval(() => {
      fetchData();
    }, 10000); // ตรวจสอบและอัปเดตทุก 10 วินาที

    // ล้าง interval เมื่อ component unmount
    return () => {
      clearInterval(intervalId);
      clearInterval(intervalId2);
    };
  }, []);

  const fetchDataFirst = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search,
      };

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

      await axios
        .get(config.apiUrl + "/backoffice/notiCountByShoplist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);

          shopidRef.current = shoplist.data.result[0].shopid;
          // console.log(shoplist.data.result);

          const response = await axios.post(
            config.apiUrl + "/backoffice/notificationlist",
            {
              shopid: shoplist.data.result[0].shopid,
            },
            {
              headers,
              params,
            }
          );

          if (response.status === 200) {
            setNotifications(response.data.result);
          } else {
            Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: response.data.message,
            });
          }
        });
    } catch (err: unknown) {
      console.error("Error deleting notification:", err); // Log the error
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  };

  // Wrap fetchData in useCallback
  const fetchData = useCallback(async () => {
    try {
      const currentSearch = searchRef.current; // อ่านค่าล่าสุดจาก ref
      const currentPeriod = periodRef.current; // อ่านค่าล่าสุดจาก ref
      const currentTimestart = timestartRef.current; // อ่านค่าล่าสุดจาก ref
      const currentTimeend = timeendRef.current; // อ่านค่าล่าสุดจาก ref
      const currentShopid = shopidRef.current; // อ่านค่าล่าสุดจาก ref
      // console.log('Fetching data with search:', currentSearch);

      const params = {
        search: currentSearch,
        period: currentPeriod,
        date_start: currentTimestart,
        date_end: currentTimeend,
      };

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const response = await axios.post(
        config.apiUrl + "/backoffice/notificationlist",
        {
          shopid: currentShopid,
        },
        {
          headers,
          params,
        }
      );

      if (response.status === 200) {
        setNotifications(response.data.result);
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: response.data.message,
        });
      }

      await axios
        .get(config.apiUrl + "/backoffice/notiCountByShoplist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);
          // console.log(shoplist.data.result);
        });

    } catch (err: unknown) {
      console.error("Error deleting notification:", err); // Log the error
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
      });
    }
  }, []);

  const deleteNotification = async (id: string) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const response = await axios.delete(
        config.apiUrl + "/backoffice/notificationdelete/" + id,
        { headers }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "ลบข้อมูลเรียบร้อย",
          // text: response.data.message,
          showConfirmButton: false,
          timer: 1000,
        });
        fetchData();
      }
    } catch (err: unknown) {
      console.error("Error fetching notifications:", err); // Log the error
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
      });
    }
  };

  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='flex flex-col'>

      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-2xl xl:text-4xl pt-4 font-bold">Notification</p>
          <p className="text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-4 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
      <div className="w-full flex flex-col md:flex-row justify-start items-start mt-2 gap-x-2 xl:gap-x-4 gap-y-2 xl:gap-y-0">

        {/* เลือกร้านค้า */}
        {level === "Admin" ||
        (level === "Owner" && (
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
              {shoplist.map((shop) => (
                <option className={`${shop.unreadCount > 0 ? "text-red-700" : ""}`} key={shop.shopid} value={shop.shopid}>
                  {shop.shopnameth}{" "}
                  {shop.unreadCount > 0 ? "●" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}

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
        <div className="w-[1335px] xl:w-full bg-white p-4 rounded-lg shadow-sm">
          
          {/* header table */}
          <div className="flex flex-row justify-between items-center text-white">

            <div className="flex flex-row justify-between items-center p-4">
              <p className="text-lg xl:text-2xl font-bold text-black"> รายการแจ้งเตือน</p>
            </div>

            {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

            <div className="p-4 flex items-center gap-6">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Search for Notification..."
                  className="text-[14px] xl:text-[16px] w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // setSearch(e.currentTarget.value);
                      searchRef.current = search;
                      fetchData();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* content table */}
          <div className="overflow-x-auto text-black">
            
            <table className="text-[14px] xl:text-[16px] w-full p-4 table-auto text-center ">
              
              <thead className="border-b border-[#2B5F60] sticky top-0 bg-[#74d2e7]">
                <tr>
                  <th className="h-12 w-[80px]">เวลา วันที่</th>
                  <th className="h-12 w-[100px]">หัวข้อ</th>
                  <th className="h-12 w-[200px]">รายละเอียด</th>
                  <th className="h-12 w-[50px]">ดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((notification: NotificationItem) => (
                    <tr
                      key={notification.notificationid}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 w-[80px]">
                        {notification.create_at}
                      </td>
                      <td className="h-12 w-[100px]">{notification.title}</td>
                      <td className="h-12 w-[200px]">{notification.details}</td>

                      <td className="h-12 w-[50px]">
                        <button
                          className="btn-delete"
                          onClick={() =>
                            deleteNotification(
                              notification.notificationid as string
                            )
                          }
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-base text-center text-black opacity-60"
                    >
                      ไม่พบข้อมูลการแจ้งเตือน
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
