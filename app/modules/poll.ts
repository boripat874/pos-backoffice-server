// =====================================================================
// การดึงข้อมูลเป็นรอบ (polling) แบบประหยัด
//   - ดึงเฉพาะตอนที่แท็บเปิดดูอยู่ (ซ่อนแท็บ / ย่อหน้าต่าง -> หยุดยิง)
//   - กลับมาดูแท็บอีกครั้ง -> ดึงทันที 1 ครั้ง แล้วนับรอบใหม่
// =====================================================================

// รอบการตรวจ (มิลลิวินาที)
export const CHECKLOGIN_INTERVAL_MS = 5 * 60 * 1000;   // ตรวจสถานะล็อกอิน ทุก 5 นาที
export const NOTI_UNREAD_INTERVAL_MS = 30 * 1000;      // จำนวนแจ้งเตือนที่ยังไม่อ่าน ทุก 30 วินาที

// event ให้หน้าอื่นสั่งอัปเดตจำนวนแจ้งเตือนทันที (เช่น หลังเปิดอ่าน / ลบแจ้งเตือน)
export const NOTI_REFRESH_EVENT = "noti-unread-refresh";

export function requestNotiRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTI_REFRESH_EVENT));
}

const isVisible = () => typeof document === "undefined" || document.visibilityState === "visible";

// เริ่ม polling ; คืนฟังก์ชันสำหรับหยุด (ใช้ใน cleanup ของ useEffect)
export function startPolling(fn: () => unknown, intervalMs: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    if (isVisible()) fn();
  };
  const restart = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, intervalMs);
  };
  const onVisible = () => {
    if (isVisible()) {
      fn();
      restart();
    }
  };

  restart();
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    if (timer) clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
