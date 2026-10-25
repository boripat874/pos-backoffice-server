"use client"

// ตั้งค่าเครื่อง POS: terminalid ไหนเป็นของร้านไหน (เฉพาะสิทธิ์ Admin)
import React, { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";
import { config } from "@/app/lib/config";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { StatusDot } from "@/app/components/TerminalStatus";

interface Terminal {
  terminalid: string;
  shopid: string;
  shopnameth: string;
  terminalname: string;
  details: string;
  status: boolean;
  online: boolean;
  last_seen: string | null;
  create_at: string | null;
  update_at: string | null;
}

interface Shop {
  shopid: string;
  shopnameth: string;
}

interface FormState {
  terminalid: string;     // รหัสเดิม (โหมดแก้ไข)
  newterminalid: string;  // รหัสที่กรอกในฟอร์ม
  shopid: string;
  terminalname: string;
  details: string;
  status: boolean;
}

const EMPTY_FORM: FormState = { terminalid: "", newterminalid: "", shopid: "", terminalname: "", details: "", status: true };
const ID_PATTERN = /^[0-9a-zA-Z_-]+$/;

export default function TerminalSettingPage() {
  const router = useRouter();

  const [date, setDate] = useState("-");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [filterShop, setFilterShop] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const searchRef = useRef("");
  const filterShopRef = useRef("");

  const headers = () => ({
    "Content-Type": "application/json",
    "X-API-KEY": config.apiKey,
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const errorText = (err: unknown) => {
    if (axios.isAxiosError(err)) return err.response?.data?.message || err.message;
    if (err instanceof Error) return err.message;
    return "เกิดข้อผิดพลาดที่ไม่รู้จัก";
  };

  const loadTerminals = useCallback(async () => {
    const res = await axios.get(`${config.apiUrl}/backoffice/terminallist`, {
      headers: headers(),
      params: { search: searchRef.current, shopid: filterShopRef.current },
    });
    setTerminals(res.data.result || []);
  }, []);

  // โหลดครั้งแรก: ต้องเป็น Admin เท่านั้น
  useEffect(() => {
    const tick = () => {
      const datenow = " " + new Date().toLocaleString("th-TH", {
        hour12: false, weekday: "long", month: "long", year: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
      setDate(datenow + " น.");
    };
    tick();
    const intervalId = setInterval(tick, 1000);

    (async () => {
      try {
        const login = await axios.get(`${config.apiUrl}/backoffice/checklogin`, { headers: headers() });
        if (login.data.level !== "Admin") {
          Swal.fire({ icon: "warning", title: "ไม่มีสิทธิ์", text: "เมนูนี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น", timer: 1800 });
          router.push("/backoffice/dashboard");
          return;
        }
        setIsAdmin(true);
        const shopRes = await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, { headers: headers() });
        setShops(shopRes.data.result || []);
        await loadTerminals();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        Swal.fire({ icon: "error", title: "ผิดพลาด", text: errorText(err) });
      }
      setIsLoading(false);
    })();

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    try {
      await loadTerminals();
    } catch (err) {
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: errorText(err) });
    }
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, shopid: filterShop || shops[0]?.shopid || "" });
    setModalMode("create");
  };

  const openEdit = (t: Terminal) => {
    setForm({
      terminalid: t.terminalid,
      newterminalid: t.terminalid,
      shopid: t.shopid,
      terminalname: t.terminalname,
      details: t.details,
      status: t.status,
    });
    setModalMode("edit");
  };

  const save = async () => {
    const id = form.newterminalid.trim();
    if (!id || !ID_PATTERN.test(id)) {
      Swal.fire({ icon: "warning", title: "ข้อมูลไม่ถูกต้อง", text: "terminalid ใช้ได้เฉพาะ a-z, 0-9, _ และ -" });
      return;
    }
    if (!form.shopid) {
      Swal.fire({ icon: "warning", title: "ข้อมูลไม่ครบ", text: "กรุณาเลือกร้าน" });
      return;
    }

    // แก้ไข: เปลี่ยนร้าน / ปิดใช้งาน มีผลกับผู้ใช้ที่ล็อกอินอยู่ -> ยืนยันก่อน
    if (modalMode === "edit") {
      const before = terminals.find((t) => t.terminalid === form.terminalid);
      const moving = before && before.shopid !== form.shopid;
      const disabling = before && before.status && !form.status;
      if (moving || disabling) {
        const ok = await Swal.fire({
          icon: "question",
          title: "ยืนยันการแก้ไข",
          text: moving
            ? "ย้ายเครื่องไปร้านอื่น ผู้ใช้ของร้านเดิมจะล็อกอินเครื่องนี้ไม่ได้อีก"
            : "ปิดใช้งานเครื่องนี้ จะล็อกอินเครื่องนี้ไม่ได้จนกว่าจะเปิดใหม่",
          showCancelButton: true,
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          confirmButtonColor: "#188875",
        });
        if (!ok.isConfirmed) return;
      }
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        await axios.post(
          `${config.apiUrl}/backoffice/terminalcreate`,
          { terminalid: id, shopid: form.shopid, terminalname: form.terminalname, details: form.details, status: form.status },
          { headers: headers() }
        );
      } else {
        await axios.put(
          `${config.apiUrl}/backoffice/terminalupdate`,
          {
            terminalid: form.terminalid,
            newterminalid: id,
            shopid: form.shopid,
            terminalname: form.terminalname,
            details: form.details,
            status: form.status,
          },
          { headers: headers() }
        );
      }
      setModalMode(null);
      await loadTerminals();
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: errorText(err) });
    }
    setSaving(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!isAdmin) return null;

  const inputCls =
    "w-full h-[40px] px-3 rounded-md border border-oxbowteal bg-white text-oxbowteal focus:outline-none focus:ring-2 focus:ring-oxbowteal";

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="max-w-[1300px] flex flex-row justify-between items-center">
        <div>
          <p className="text-4xl pt-4 font-bold text-oxbowteal">ตั้งค่าเครื่อง POS</p>
          <p className="text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      <div className="mt-2 overflow-auto">
        <div className="w-[1100px] xl:w-full bg-oatmilk p-4 rounded-lg shadow-sm border mx-auto">
          {/* toolbar */}
          <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
            <div className="p-2">
              <p className="text-lg xl:text-2xl font-bold text-oxbowteal">เครื่อง POS ของแต่ละร้าน</p>
              <p className="text-[14px] text-oxbowteal opacity-70">
                ทั้งหมด {terminals.length} เครื่อง · ผู้ใช้ล็อกอินได้เฉพาะเครื่องของร้านตัวเอง
              </p>
            </div>

            <div className="text-[14px] xl:text-[16px] p-2 flex flex-row items-center gap-3 flex-wrap">
              <select
                className="h-[40px] w-[200px] rounded-md border border-oxbowteal bg-oatmilk text-oxbowteal px-2"
                value={filterShop}
                onChange={(e) => {
                  setFilterShop(e.target.value);
                  filterShopRef.current = e.target.value;
                  refresh();
                }}
              >
                <option value="">ทุกร้าน</option>
                {shops.map((s) => (
                  <option key={s.shopid} value={s.shopid}>{s.shopnameth}</option>
                ))}
              </select>

              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10"></i>
                <input
                  type="text"
                  placeholder="ค้นหา terminalid / ชื่อเครื่อง / ร้าน"
                  className="w-[280px] p-2 pl-10 rounded-lg border-0 bg-lessengray text-oxbowteal focus:outline-none focus:ring-2 focus:ring-oxbowteal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchRef.current = search;
                      refresh();
                    }
                  }}
                />
              </div>

              <button className="btn w-[170px]" onClick={openCreate}>
                <i className="fa-solid fa-plus mr-2"></i>เพิ่มเครื่อง
              </button>
            </div>
          </div>

          {/* table */}
          <div className="w-full mt-2 overflow-x-auto text-oxbowteal">
            <table className="text-[15px] xl:text-[16px] table-fixed w-full min-w-[1050px] text-center">
              <thead className="border-b border-t border-oxbowteal bg-oatmilk sticky top-0 shadow-md z-10">
                <tr>
                  <th className="h-12 w-[150px] px-2">Terminal ID</th>
                  <th className="h-12 w-[180px] px-2">ร้าน</th>
                  <th className="h-12 w-[150px] px-2">ชื่อเครื่อง</th>
                  <th className="h-12 w-[180px] px-2">รายละเอียด</th>
                  <th className="h-12 w-[110px] px-2">การใช้งาน</th>
                  <th className="h-12 w-[150px] px-2">สถานะเครื่อง</th>
                  <th className="h-12 w-[140px] px-2">แก้ไขล่าสุด</th>
                  <th className="h-12 w-[90px] px-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {terminals.length > 0 ? (
                  terminals.map((t) => (
                    <tr key={t.terminalid} className="border-b border-lessengray hover:bg-hoverteal">
                      <td className="h-12 px-2 font-semibold">{t.terminalid}</td>
                      <td className="h-12 px-2 truncate" title={t.shopid}>{t.shopnameth}</td>
                      <td className="h-12 px-2 truncate">{t.terminalname || "-"}</td>
                      <td className="h-12 px-2 truncate" title={t.details}>{t.details || "-"}</td>
                      <td className="h-12 px-2">
                        <span
                          className={`inline-block min-w-[70px] px-2 py-0.5 rounded-full text-[13px] font-semibold ${
                            t.status ? "bg-oxbowteal text-white" : "bg-lessengray text-[#6b7280]"
                          }`}
                        >
                          {t.status ? "เปิด" : "ปิด"}
                        </span>
                      </td>
                      <td className="h-12 px-2" title={t.last_seen ? `อัปเดตล่าสุด ${t.last_seen}` : "ยังไม่เคยเชื่อมต่อ"}>
                        <div className="flex items-center justify-center gap-2">
                          <StatusDot online={t.online} />
                          <span className={t.online ? "text-[#15803d] font-semibold" : "text-[#6b7280]"}>
                            {t.online ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="h-12 px-2 text-[14px]">{t.update_at || "-"}</td>
                      <td className="h-12 px-2">
                        <button
                          className="w-8 h-8 text-white bg-oxbowteal hover:bg-deepforest rounded-md"
                          onClick={() => openEdit(t)}
                          aria-label={`แก้ไข ${t.terminalid}`}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-[16px] text-center opacity-60">ไม่มีข้อมูลเครื่อง POS</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* modal เพิ่ม / แก้ไข */}
      {modalMode && (
        <div className="fixed inset-0 z-[200] bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-oatmilk rounded-lg shadow-lg w-full max-w-[480px]">
            <h2 className="text-lg xl:text-xl bg-oxbowteal text-white p-4 rounded-t-lg flex justify-between items-center">
              {modalMode === "create" ? "เพิ่มเครื่อง POS" : `แก้ไขเครื่อง POS ${form.terminalid}`}
              <button className="text-gray-200 hover:text-white" onClick={() => setModalMode(null)} aria-label="ปิด">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </h2>

            <div className="p-4 flex flex-col gap-3 text-oxbowteal">
              <label className="flex flex-col gap-1">
                <span className="font-semibold">Terminal ID *</span>
                <input
                  className={inputCls}
                  value={form.newterminalid}
                  placeholder="เช่น RTP71887"
                  onChange={(e) => setForm({ ...form, newterminalid: e.target.value.trim() })}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-semibold">ร้าน *</span>
                <select className={inputCls} value={form.shopid} onChange={(e) => setForm({ ...form, shopid: e.target.value })}>
                  <option value="" disabled>เลือกร้าน</option>
                  {shops.map((s) => (
                    <option key={s.shopid} value={s.shopid}>{s.shopnameth} ({s.shopid})</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-semibold">ชื่อเครื่อง</span>
                <input
                  className={inputCls}
                  value={form.terminalname}
                  placeholder="เช่น เครื่อง POS 1"
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, terminalname: e.target.value })}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-semibold">รายละเอียด</span>
                <textarea
                  className={`${inputCls} h-[70px] py-2`}
                  value={form.details}
                  maxLength={500}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-oxbowteal"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                />
                <span>เปิดใช้งาน (ปิด = ล็อกอินเครื่องนี้ไม่ได้)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="h-[40px] px-4 rounded-md border border-oxbowteal text-oxbowteal hover:bg-hoverteal"
                  onClick={() => setModalMode(null)}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button className="btn w-[120px]" onClick={save} disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
