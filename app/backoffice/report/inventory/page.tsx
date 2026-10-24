"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import Selectshop from '@/app/components/selectshop';

// รายงานสินค้าคงเหลือ
interface ReportInventory {
  productid: string;
  shopid: string;
  shopnameth: string;
  create_at: string;       // เวลาเพิ่มสินค้า
  update_at: string;       // เวลาอัพเดตข้อมูลสินค้าล่าสุด
  categoryname: string;
  productnameth: string;
  productnameeng: string;
  productdatath: string;
  productdataeng: string;
  productprice: number;
  additional: string;      // "เผ็ดมาก, เผ็ดน้อย"
  productremain: number;
}

interface Shop {
  shopid: string;
  shopnameth: string;
}

const cut = (v: string | null | undefined, n: number) => {
  const s = v || "";
  return s.length > n ? s.slice(0, n) + "..." : s;
};

export default function ReportInventoryPage() {

  const router = useRouter();

  const [date, setDate] = useState("-");
  const [reportinventory, setReportinventory] = useState<ReportInventory[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState("");
  const [shoplist, setShoplist] = useState<Shop[]>([]);
  const [shopid, setShopid] = useState("");

  const searchRef = useRef(search);
  const shopidRef = useRef(shopid);

  useEffect(() => { searchRef.current = search; }, [search]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-API-KEY": config.apiKey,
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const showError = (err: unknown) => {
    console.error("Error fetching report data:", err);
    let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || err.message;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    Swal.fire({ icon: "error", title: "ผิดพลาด", text: errorMessage });
  };

  const loadReport = async () => {
    const res = await axios.post(
      `${config.apiUrl}/backoffice/reportinventorylist`,
      { shopid: shopidRef.current },
      { headers: getHeaders(), params: { search: searchRef.current } }
    );
    setReportinventory(res.data.result || []);
  };

  // โหลดครั้งแรก: เช็คสิทธิ์ -> รายชื่อร้านตามสิทธิ์ -> รายงาน
  const fetchDataFirst = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getHeaders();

      let userLevel = "";
      try {
        const res = await axios.get(`${config.apiUrl}/backoffice/checklogin`, { headers });
        userLevel = res.data.level;
        setLevel(userLevel);
      } catch {
        Swal.fire({ icon: "warning", title: "เข้าสู่ระบบ", text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง", timer: 1500 });
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      // Admin = ทุกร้าน, Owner = ร้านในกลุ่ม, Manager/Employee = ร้านตัวเอง (กรองที่ server)
      const shopRes = await axios.get(config.apiUrl + "/backoffice/headerdatashopslist", { headers });
      const shops: Shop[] = shopRes.data.result || [];
      setShoplist(shops);

      let firstShop = "";
      if (userLevel === "Admin" || userLevel === "Owner") {
        firstShop = shops.length > 0 ? "all" : "";
      } else {
        firstShop = shops.length > 0 ? shops[0].shopid : "";
      }
      setShopid(firstShop);
      shopidRef.current = firstShop;

      if (firstShop) await loadReport();
    } catch (err: unknown) {
      showError(err);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadReport();
    } catch (err: unknown) {
      showError(err);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = () => {
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
    };
    tick();
    fetchDataFirst();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [fetchDataFirst]);

  // --- CSV Export ---
  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Swal.fire('ข้อผิดพลาด', 'เบราว์เซอร์ของคุณไม่รองรับการดาวน์โหลดไฟล์โดยตรง', 'error');
    }
  };

  const showShopColumn = shopid === "all";

  const handleExportCSV = () => {
    if (!reportinventory || reportinventory.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'รายงานสินค้าคงเหลือ', 'info');
      return;
    }
    const headers = [
      ...(showShopColumn ? ['ร้าน'] : []),
      'เวลาเพิ่มสินค้า', 'เวลาอัพเดตข้อมูลสินค้าล่าสุด', 'หมวดหมู่สินค้า',
      'ชื่อภาษาไทย', 'ชื่อภาษาอังกฤษ', 'ข้อมูลสินค้าภาษาไทย', 'ข้อมูลสินค้าภาษาอังกฤษ',
      'ราคาสินค้า', 'ตัวเลือกเพิ่มเติม', 'จำนวนคงเหลือ',
    ];
    const rows = reportinventory.map((r) => [
      ...(showShopColumn ? [escapeCSV(r.shopnameth)] : []),
      escapeCSV(r.create_at),
      escapeCSV(r.update_at),
      escapeCSV(r.categoryname),
      escapeCSV(r.productnameth),
      escapeCSV(r.productnameeng),
      escapeCSV(r.productdatath),
      escapeCSV(r.productdataeng),
      escapeCSV(Number(r.productprice).toFixed(2)),
      escapeCSV(r.additional),
      escapeCSV(r.productremain),
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const dateStr = format(new Date(), 'dd-MM-yyyy');
    downloadCSV(csvContent, `inventory_report_${dateStr}.csv`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const colCount = showShopColumn ? 11 : 10;

  return (
    <div className="flex flex-col">

      {/* header */}
      <div className='max-w-[1300px] flex flex-row justify-between items-center'>
        <div>
          <p className='text-4xl pt-4 font-bold text-oxbowteal'>รายงาน</p>
          <p className='text-md xl:text-lg pt-2'>{date}</p>
        </div>
      </div>

      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* เลือกร้าน: Admin = ทุกร้าน, Owner = ร้านในกลุ่ม ; Manager/Employee เห็นเฉพาะร้านตัวเองจึงไม่ต้องเลือก */}
      {level === "Admin" || level === "Owner" ? (
        <div className="w-full h-11 flex flex-row justify-start items-center mt-2 gap-x-4">
          <Selectshop
            shopid={shopid}
            shopslist={shoplist}
            allOption="ทุกร้าน"
            onChange={(value) => {
              setShopid(value);
              shopidRef.current = value;
              fetchData();
            }}
          />
        </div>
      ) : null}

      {/* table */}
      <div className="mt-2 overflow-auto">
        <div className='w-[1325px] xl:w-full bg-oatmilk p-4 rounded-lg shadow-sm border mx-auto'>

          {/* header table */}
          <div className='flex flex-row justify-between items-start text-white gap-4'>
            <div className='p-2'>
              <p className='text-lg xl:text-2xl font-bold text-oxbowteal'>รายงานสินค้าคงเหลือ</p>
              <p className='text-[14px] text-oxbowteal opacity-70'>ทั้งหมด {reportinventory.length} รายการ</p>
            </div>

            <div className="text-[14px] xl:text-[16px] p-2 flex flex-row items-center gap-4">
              <button
                className="btn w-[160px]"
                onClick={handleExportCSV}
                disabled={!reportinventory || reportinventory.length === 0}
              >
                <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                <span>ส่งออก CSV</span>
              </button>

              <div className="relative w-auto">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"></i>
                <input
                  type="text"
                  placeholder="Search for Product..."
                  className="w-[300px] p-2 pl-10 rounded-lg border-0 bg-lessengray text-oxbowteal focus:outline-none focus:ring-2 focus:ring-oxbowteal"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchRef.current = search;
                      fetchData();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* content table */}
          <div className='w-full mt-2 overflow-x-auto text-oxbowteal'>
            <div className='overflow-y-auto'>
              <table className={`text-[16px] table-fixed ${showShopColumn ? "min-w-[1900px]" : "min-w-[1750px]"} w-full text-center`}>
                <thead className='border-b border-t border-oxbowteal bg-oatmilk sticky top-0 shadow-md z-10'>
                  <tr>
                    {showShopColumn && <th className='h-12 w-[150px] px-2'>ร้าน</th>}
                    <th className='h-12 w-[150px] px-2'>เวลาเพิ่มสินค้า</th>
                    <th className='h-12 w-[170px] px-2'>เวลาอัพเดตข้อมูลสินค้าล่าสุด</th>
                    <th className='h-12 w-[140px] px-2'>หมวดหมู่สินค้า</th>
                    <th className='h-12 w-[170px] px-2'>ชื่อภาษาไทย</th>
                    <th className='h-12 w-[170px] px-2'>ชื่อภาษาอังกฤษ</th>
                    <th className='h-12 w-[220px] px-2'>ข้อมูลสินค้าภาษาไทย</th>
                    <th className='h-12 w-[220px] px-2'>ข้อมูลสินค้าภาษาอังกฤษ</th>
                    <th className='h-12 w-[110px] px-2'>ราคาสินค้า</th>
                    <th className='h-12 w-[220px] px-2'>ตัวเลือกเพิ่มเติม</th>
                    <th className='h-12 w-[120px] px-2'>จำนวนคงเหลือ</th>
                  </tr>
                </thead>
                <tbody className='text-oxbowteal'>
                  {Array.isArray(reportinventory) && reportinventory.length > 0 ? (
                    reportinventory.map((r: ReportInventory) => (
                      <tr key={`${r.shopid}-${r.productid}`} className="border-b border-gray-100 hover:bg-hoverteal">
                        {showShopColumn && <td className='h-12 px-2 truncate' title={r.shopnameth}>{cut(r.shopnameth, 30)}</td>}
                        <td className='h-12 px-2'>{r.create_at}</td>
                        <td className='h-12 px-2'>{r.update_at}</td>
                        <td className='h-12 px-2 truncate' title={r.categoryname}>{cut(r.categoryname, 30)}</td>
                        <td className='h-12 px-2 truncate' title={r.productnameth}>{cut(r.productnameth, 30)}</td>
                        <td className='h-12 px-2 truncate' title={r.productnameeng}>{cut(r.productnameeng, 30)}</td>
                        <td className='h-12 px-2 truncate' title={r.productdatath}>{cut(r.productdatath, 40)}</td>
                        <td className='h-12 px-2 truncate' title={r.productdataeng}>{cut(r.productdataeng, 40)}</td>
                        <td className='h-12 px-2'>{Number(r.productprice).toFixed(2)}</td>
                        <td className='h-12 px-2 truncate' title={r.additional}>{cut(r.additional, 40) || "-"}</td>
                        <td className='h-12 px-2 font-semibold'>{r.productremain}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={colCount} className="py-4 text-[16px] text-center text-oxbowteal opacity-60">ไม่มีข้อมูลรายงานสินค้าคงเหลือ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
