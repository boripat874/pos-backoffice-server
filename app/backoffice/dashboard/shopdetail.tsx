"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { config } from "@/app/lib/config";
import Swal from "sweetalert2";
import axios from "axios";
import Carddisplay from "@/app/components/Carddisplay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HorizontalBarChart } from "@/app/components/HorizontalBarChart";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Selectdate from "@/app/components/selectdate";
import Selectshop from "@/app/components/selectshop";
import { useReactToPrint } from "react-to-print";

interface Shop {
  shopid: string;
  shopnameth: string;
}

interface ProductSell {
  productid: string;
  productnameth: string;
  totalitem: number;
}

export interface DashboardShopdetailProps {
  params: {
    shopid_detail: string;
    period_detail?: string;
    className?: string;
  };
}

export default function DashboardShopdetail({ params }: DashboardShopdetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("-");
  const [period, setPeriod] = useState(params.period_detail || "today");
  const [timestart, setTimeStart] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeend, setTimeEnd] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [shopid, setShopid] = useState(params.shopid_detail || "");
  const [shoplist, setShoplist] = useState<Shop[]>([]);
  const [dashboarddatalist, setDashboarddatalist] = useState<ProductSell[]>([]);
  const [shopnameth, setShopnameth] = useState("");
  const [shoplogoimage, setShoplogoimage] = useState("");
  
  // State ข้อมูลการเงินแยกประเภท
  const [totalincome, setTotalincome] = useState(0);
  const [totalcreditcard, setTotalcreditcard] = useState(0);
  const [totalpromptpay, setTotalpromptpay] = useState(0);
  const [totalewallet, setTotalewallet] = useState(0);
  const [totalcash, setTotalcash] = useState(0);
  const [totalorder, setTotalorder] = useState(0);
  const [totalproductsell, setTotalproductsell] = useState(0);
  const [level, setLevel] = useState("");

  const periodRef = useRef(period);
  const shopidRef = useRef(params.shopid_detail);
  const timestartRef = useRef(timestart);
  const timeendRef = useRef(timeend);
  const router = useRouter();

  // Ref สำหรับ Export PDF
  const componentRef = useRef(null);

  // ฟังก์ชัน Print
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Dashboard Product sales Report",
    // เพิ่ม pageStyle เพื่อกำหนด margin ให้มีพื้นที่แสดงเลขหน้าของ Browser
    pageStyle: `
      @page {
        size: auto;
        margin: 20mm;
      }
    `,
  });

  useEffect(() => {
    const updateTime = () => {
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
    };

    updateTime();
    fetchDatafirst();

    const intervalId = setInterval(updateTime, 2000);
    const interval_fetchData = setInterval(fetchData, 10000);

    return () => {
      clearInterval(intervalId);
      clearInterval(interval_fetchData);
    };
  }, []);

  const fetchDatafirst = useCallback(async () => {
    setIsLoading(true);
    try {
      const shopidR = shopidRef.current;
      const periodR = periodRef.current;
      const timestartR = timestartRef.current;
      const timeendR = timeendRef.current;
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      const params = {
        period: periodR,
        date_start: timestartR,
        date_end: timeendR,
      };

      await axios
        .get(config.apiUrl + "/backoffice/checklogin", { headers })
        .then((res) => {
          if (res.status === 200) {
            setLevel(res.data.level);
          } else {
            localStorage.removeItem("token");
            router.push("/");
          }
        });

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then((shoplist) => {
          setShoplist(shoplist.data.result);
        });

      const response = await axios.post(
        `${config.apiUrl}/backoffice/dashboarddatalist`,
        { shopid: shopidR },
        { headers, params }
      );

      setShopnameth(response.data.result?.shopnameth || "");
      setShoplogoimage(response.data.result?.shoplogoimage || "");
      setTotalincome(Number(response.data.result?.total_income) || 0);
      setTotalcreditcard(Number(response.data.result?.total_creditcard) || 0);
      setTotalpromptpay(Number(response.data.result?.total_promptpay) || 0);
      setTotalewallet(Number(response.data.result?.total_ewallet) || 0);
      setTotalcash(Number(response.data.result?.total_cash) || 0);
      setTotalorder(Number(response.data.result?.total_order) || 0);
      setTotalproductsell(Number(response.data.result?.total_product) || 0);
      setDashboarddatalist(response.data.result?.product_sales || []);
    } catch (err: unknown) {
      console.error("Error fetching report data:", err);
    }
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const shopidR = shopidRef.current;
      const periodR = periodRef.current;
      const timestartR = timestartRef.current;
      const timeendR = timeendRef.current;
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: "Bearer " + localStorage.getItem("token"),
      };
      const params = {
        period: periodR,
        date_start: timestartR,
        date_end: timeendR,
      };

      const response = await axios.post(
        `${config.apiUrl}/backoffice/dashboarddatalist`,
        { shopid: shopidR },
        { headers, params }
      );

      setShopnameth(response.data.result?.shopnameth || "");
      setShoplogoimage(response.data.result?.shoplogoimage || "");
      setTotalincome(Number(response.data.result?.total_income) || 0);
      setTotalcreditcard(Number(response.data.result?.total_creditcard) || 0);
      setTotalpromptpay(Number(response.data.result?.total_promptpay) || 0);
      setTotalewallet(Number(response.data.result?.total_ewallet) || 0);
      setTotalcash(Number(response.data.result?.total_cash) || 0);
      setTotalorder(Number(response.data.result?.total_order) || 0);
      setTotalproductsell(Number(response.data.result?.total_product) || 0);
      setDashboarddatalist(response.data.result?.product_sales || []);
    } catch (err: unknown) {
      console.error("Error fetching report data:", err);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`flex flex-col ${params.className || ""}`}>
      {/* Header */}
      <div className="w-full flex flex-row justify-between items-center">
        <div>
          <p className="text-lg md:text-2xl xl:text-4xl pt-2 md:pt-3 xl:pt-4 font-bold">Dashboard</p>
          <p className="text-xs md:text-md xl:text-lg pt-1 md:pt-2 xl:pt-4">{date}</p>
        </div>
      </div>

      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* Controls: Select Shop, Date, PDF Button */}
      <div className="w-full flex flex-col md:flex-row justify-start mt-2 items-start gap-x-4 gap-y-2 md:gap-y-0">
        
        {/* Select Shop */}
        {(level === "Admin" || level === "Owner") && (
          <Selectshop 
            shopid={shopid} 
            shopslist={shoplist} 
            onChange={(value) => {
              setShopid(value);
              shopidRef.current = value;
              fetchData();
            }} 
          />
        )}

        {/* Select Date & Export Button Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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
              setTimeStart(value);
              timestartRef.current = value;
              if (new Date(value) > new Date(timeend)) {
                setTimeEnd(value);
                timeendRef.current = value;
              }
              fetchData();
            }}
            onChangeTimeend={(value) => {
              setTimeEnd(value);
              timeendRef.current = value;
              if (new Date(value) < new Date(timestart)) {
                setTimeEnd(timestart);
                timeendRef.current = timestart;
              }
              fetchData();
            }}
          />

          {/* PDF Export Button */}
          <button 
            className="print:hidden p-2 text-center text-[#FFFFFF] hover:text-[#009f4d] bg-[#009f4d] hover:bg-transparent border border-[#009f4d] rounded-md h-[40px] px-4 whitespace-nowrap"
            onClick={() => handlePrint()}
          >
            Export to PDF
          </button>
        </div>
      </div>

      {/* Content Area to Print */}
      <div ref={componentRef} className="w-full print:p-4">
        {/* Shop Info Header */}
        <div className="flex flex-row p-4 mt-2 justify-start items-center gap-x-4 bg-white rounded-xl">
          <Image
            src={`${
              shoplogoimage != "" && shoplogoimage != null
                ? config.apiUrlImage + "/" + shoplogoimage
                : "https://placehold.co/100x100"
            }`}
            alt="ร้านค้า"
            width={80}
            height={60}
            className="inline-block w-[60px] h-[50px] xl:w-[80px] xl:h-[60px] object-contain"
            style={{ transform: "rotate(0deg)" }}
          />
          <p className="ml-10 text-lg xl:text-2xl font-bold">{shopnameth || "-"}</p>
        </div>

        {/* Info Cards Grid - ปรับสีตามรูปตัวอย่าง (HTML Dump) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 mt-2 gap-1 xl:gap-1">
          {/* Card 1: Income All Channels - Green #358326 */}
          <Carddisplay
            label={"รายได้รวมทั้งหมดจาก\nทุกช่องทาง"}
            value={`฿ ${totalincome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#005670]" 
            iconpath={"/icon/money.svg"}
          />

          {/* Card 2: Credit Card - Blue #4D4DFF */}
          <Carddisplay
            label={"รายได้รวมทั้งหมดจาก\nCredit Card"}
            value={`฿ ${totalcreditcard.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#358326]" 
            iconpath={"/icon/creait_card.svg"}
          />

          {/* Card 3: PromptPay - Light Blue #1A8AF3 */}
          <Carddisplay
            label={"รายได้รวมทั้งหมดจาก\nPromptPay"}
            value={`฿ ${totalpromptpay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#fe5000]"
            iconpath={"/icon/promaptpay.svg"}
          />

          {/* Card 4: E-Wallet - Purple #BF33BF */}
          <Carddisplay
            label={"รายได้รวมทั้งหมดจาก\nE-wallet"}
            value={`฿ ${totalewallet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#da1884]"
            iconpath={"/icon/E_wallet.svg"}
          />

          {/* Card 5: Cash - Orange/Gold #C88100 */}
          <Carddisplay
            label={"รายได้รวมทั้งหมดจาก\nเงินสด"}
            value={`฿ ${totalcash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#a51890]"
            iconpath={"/icon/cash.svg"}
          />

          {/* Card 6: Total Bills - Steel Blue #4682B4 */}
          <Carddisplay
            label={"บิลที่ขายได้ทั้งหมด"}
            value={`${totalorder.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#0077c8]"
            iconpath={"/icon/order.svg"}
          />

          {/* Card 7: Total Items - Dark Purple #800080 */}
          <Carddisplay
            label={"สินค้าขายออกทั้งหมด\nหลายชิ้น"}
            value={`${totalproductsell.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            textColor="text-[#FFFFFF]"
            backgroundColor="bg-[#008eaa]"
            iconpath={"/icon/creait_card.svg"}
          />
        </div>

        {/* Chart Section */}
        <div className="w-full bg-white flex flex-col mt-2 p-2 rounded-lg shadow">
          <p className="text-[12px] md:text-[16px] xl:text-2xl text-center py-2 font-semibold">ยอดขายสินค้า</p>
          <div className="w-[99%] min-h-[100px] mx-auto border rounded-lg flex flex-col items-center justify-center">
            {dashboarddatalist.length > 0 ? (
              <HorizontalBarChart productsellslist={dashboarddatalist} />
            ) : (
              <p className="text-md xl:text-lg text-center text-black opacity-60">ไม่พบข้อมูลยอดขายสินค้า</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}