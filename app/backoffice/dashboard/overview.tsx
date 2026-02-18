"use client"

import React, { useEffect, useState , useCallback , useRef } from 'react'
import { config } from "@/app/lib/config";
import Swal from "sweetalert2";
import axios from "axios";
import LoadingSpinner from "@/app/components/LoadingSpinner"
// import { useRouter } from "next/navigation";
import CardShopdisplay from '@/app/components/CardShopdisplay';
import DashboardShopdetail from '@/app/backoffice/dashboard/shopdetail';
import { HorizontalBarChart } from '@/app/components/HorizontalBarChart';
import Selectdate from '@/app/components/selectdate';

interface Shop{
  shoplogoimage?: string;
  shopid: string;
  shopnameth: string;
  totalincome: number;
  totalorder: number;
  totalproduct: number;
}

interface ProductSell{
  productid: string;
  productnameth: string;
  totalitem: number;
}

// interface DashboardOverviewPageProps {

//   overviewUgroupid: string; // ugroupid_ will be accessed from the URL query string, e.g., /overview?ugroupid_=value
// }
 
export default function DashboardOverview() {

  const [date, setDate] = useState("-");
  const [isLoading, setIsLoading] = useState(false);
  // const [total_income, setTotal_income] = useState(0);
  // const [totalitem, setTotalitem] = useState(0);

  const [shoplist, setShoplist] = useState<Shop[]>([]);

  
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  
  const [dashboarddatalist, setDashboarddatalist] = useState<ProductSell[]>([]);
  
  // const [totalincome, setTotalincome] = useState(0);
  // const [totalcreditcard, setTotalcreditcard] = useState(0);
  // const [totalpromptpay, setTotalpromptpay] = useState(0);
  // const [totalewallet, setTotalewallet] = useState(0);
  // const [totalcash, setTotalcash] = useState(0);
  // const [totalorder, setTotalorder] = useState(0);
  // const [totalproductsell, setTotalproductsell] = useState(0);
  const [period, setPeriod] = useState("today");
  const [timestart, setTimeStart] = useState(`${new Date().toISOString().split('T')[0]}`);
  const [timeend, setTimeEnd] = useState(`${new Date().toISOString().split('T')[0]}`);

  const periodRef = useRef(period); // สร้าง ref เก็บค่า period
  const timestartRef = useRef(timestart); // สร้าง ref เก็บค่า shopid
  const timeendRef = useRef(timeend); // สร้าง ref เก็บค่า shopid

  // const router = useRouter();
 
  const fetchDataFirst = useCallback(async () => {
    setIsLoading(true);
    try {

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      const params = {
        period: periodRef.current,
        date_start: timestartRef.current,
        date_end: timeendRef.current,
      };


      const [cardshoplist, productsellslist] = await Promise.all([
        axios.get(`${config.apiUrl}/backoffice/dashboardOverview`, {
          headers,
          params,
        }),
        axios.get(`${config.apiUrl}/backoffice/dashboardproductselllist`, {
          headers,
          params,
        }),
      ]);

      setShoplist(cardshoplist.data.result);
      setDashboarddatalist(productsellslist.data.result);

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

  }, []);

  const fetchData = useCallback(async () => {
    try {

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      const params = {
        period: periodRef.current,
        date_start: timestartRef.current,
        date_end: timeendRef.current,
      };


      const [cardshoplist, productsellslist] = await Promise.all([
        axios.get(`${config.apiUrl}/backoffice/dashboardOverview`, {
          headers,
          params,
        }),
        axios.get(`${config.apiUrl}/backoffice/dashboardproductselllist`, {
          headers,
          params,
        }),
      ]);

      setShoplist(cardshoplist.data.result);
      setDashboarddatalist(productsellslist.data.result);

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

  }, []);

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
    }, 2000); // ตรวจสอบและอัปเดตทุก 2 วินาที

    const interval_fetchDataFirst = setInterval(() => {
      
      fetchData();

    },10000); //ตรวจสอบและอัปเดตทุก 3 วินาที

    return () => {
      clearInterval(intervalId);
      clearInterval(interval_fetchDataFirst);
    } 
    
  }, [fetchData]);

  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (selectedShopId) {
    return (
      <div className="relative w-full flex flex-col gap-4 ">

        <button
          onClick={() => setSelectedShopId(null)}
          className="absolute text-xs md:text-sm xl:text-md self-start mt-2  px-4 py-2 md:py-2 xl:py-2 bg-[#009f4d] text-white rounded-md hover:border-[#3DA48F] hover:bg-[#3DA48F] transition-colors"
        >
          &larr; Back to Overview
        </button>

        <DashboardShopdetail params={{
          shopid_detail: selectedShopId,
          period_detail: period,
          className: "mt-10 w-full",
        }}
        />
        
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4xl:gap-0">

      {/* header */}
      <div className="w-full flex flex-row justify-between items-center">
        <div>
          <p className="text-lg md:text-2xl xl:text-4xl pt-4 font-bold">Dashboard</p>
          <p className="text-xs md:text-md xl:text-lg pt-1 md:pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
      <div className="w-full h-auto flex flex-row justify-start items-center mt-2 gap-x-4">
        {/* เลือกร้านค้า */}
        {/* <div>
          <select className="w-[180px] h-[40px] rounded-md border-[#009f4d] px-2 border text-black">
            <option value="">บ้านสุขใจ</option>
          </select>
        </div> */}

        {/* เลือกช่วงเวลา */}
        {/* <div>
          <select
            className="text-[12px] xl:text-[16px] w-[100px] h-[40px] xl:w-[180px] xl:h-[40px] rounded-md border-[#009f4d] px-2 border text-black"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              periodRef.current = e.target.value;
              fetchDataFirst();
            }}
          >
            <option value="today">วันนี้</option>
            <option value="thisweek">สัปดาห์นี้</option>
            <option value="thismonth">เดือนนี้</option>
            <option value="thisyear">ปีนี้</option>
            <option value="bydate">เลือกวันที่</option>
          </select>
        </div>

        {period === "bydate" && (
          <>
            <div className="flex flex-row justify-start items-center gap-x-4 ">
              <p className="text-[12px] xl:text-[16px] text-black">เริ่มต้น</p>
              <input
                type="date"
                className="text-[12px] xl:text-[16px] w-[120px] h-[40px] xl:w-[150px] xl:h-[40px] rounded-md border-[#009f4d] px-2 border text-black"
                value={timestart}
                onChange={(e) => {

                  const newStartDateString = e.target.value;
                  setTimeStart(newStartDateString);
                  timestartRef.current = newStartDateString;

                  // Convert to Date objects for comparison
                  const newStartDate = new Date(newStartDateString);
                  const currentEndDate = new Date(timeend);
                  if (newStartDate > currentEndDate) {

                    setTimeEnd(newStartDateString); // Set timeend to the new timestart
                    timeendRef.current = newStartDateString;
                  }

                  fetchDataFirst();

                }}
              />
            </div>

            <div className="flex flex-row justify-start items-center gap-x-4">
              <p className="text-[12px] xl:text-[16px] text-black">สิ้นสุด</p>
              <input
                type="date"
                className="text-[12px] xl:text-[16px] w-[120px] h-[40px] xl:w-[150px] xl:h-[40px] rounded-md border-[#009f4d] px-2 border text-black"
                value={timeend}
                onChange={(e) => {

                  const newEndDateString = e.target.value;
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

                  
                  fetchDataFirst();

                }}
              />
            </div>
          </>
        )}
       */}
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
        />
      </div>
      {/* รายชื่อร้าน */}
      {Array.isArray(shoplist) && shoplist.length > 0 ? (
        <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2">
          {shoplist.map((shop, index) => (
            <button
              key={index}
              onClick={() => setSelectedShopId(shop.shopid)}
              className="text-left p-0 focus:outline-none focus:ring-2 focus:ring-[#009f4d] rounded-lg overflow-hidden"
            >
              <CardShopdisplay
                key={index}
                imageshop={shop.shoplogoimage}
                shopname={shop.shopnameth}
                total_income={shop.totalincome}
                total_order_sold={shop.totalorder}
                total_product_sold={shop.totalproduct}
              />

            </button>
          ))}
        </div>
      ) : null}

      {/* ยอดขายสินค้า */}
      <div className="w-full bg-white flex flex-col mt-2 p-2 rounded-lg shadow">
        <p className="text-[12px] md:text-[16px] xl:text-2xl  text-center py-2 font-semibold">ยอดขายสินค้า</p>
        <div className="w-[99%] min-h-[200px] mx-auto  border rounded-lg flex flex-col justify-center items-center">
          {dashboarddatalist.length > 0 ? (
            <HorizontalBarChart productsellslist={dashboarddatalist} />
          ) : (
            <div className="text-md xl:text-lg w-full text-black opacity-60 text-center">
              ไม่พบข้อมูลยอดขายสินค้า
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
