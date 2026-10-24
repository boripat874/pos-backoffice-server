import React from "react";

// ข้อมูลจาก API (dashboardOverview / dashboarddatalist -> terminal)
export interface TerminalInfo {
  online: boolean;
  last_seen: string | null;          // "YYYY-MM-DD HH:mm:ss"
  last_seen_ago_sec: number | null;
  online_terminals: number;
  total_terminals: number;
  uinfoname: string | null;
  slot_to_app: boolean;              // App ได้รับ slot หรือไม่
}

const agoText = (sec: number | null | undefined) => {
  if (sec === null || sec === undefined) return "ยังไม่เคยเชื่อมต่อ";
  if (sec < 60) return "เมื่อสักครู่";
  if (sec < 3600) return `${Math.floor(sec / 60)} นาทีที่แล้ว`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(sec / 86400)} วันที่แล้ว`;
};

// ไฟสถานะ: เขียว = online, เทา = offline
export function StatusDot({ online, size = 10 }: { online: boolean; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {online && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 animate-ping" />
      )}
      <span
        className={`relative inline-flex rounded-full ${online ? "bg-[#22c55e]" : "bg-[#9ca3af]"}`}
        style={{ width: size, height: size }}
      />
    </span>
  );
}

interface Props {
  terminal?: TerminalInfo | null;
  variant?: "card" | "full";
}

// สถานะ Terminal (เครื่อง POS) ของร้าน
export default function TerminalStatus({ terminal, variant = "card" }: Props) {
  const online = !!terminal?.online;
  const label = online ? "Online" : "Offline";
  const title = terminal?.last_seen ? `อัปเดตล่าสุด ${terminal.last_seen}` : "ยังไม่เคยเชื่อมต่อ";

  if (variant === "card") {
    return (
      <div className="w-full flex flex-row justify-between items-center px-2 text-[12px] xl:text-[13px]" title={title}>
        <div className="flex items-center gap-1.5">
          <StatusDot online={online} />
          <span className={`font-semibold ${online ? "text-[#15803d]" : "text-[#6b7280]"}`}>Terminal {label}</span>
        </div>
        <span className={`px-1.5 rounded ${terminal?.slot_to_app ? "bg-hoverteal text-oxbowteal" : "bg-lessengray text-[#6b7280]"}`}>
          {terminal?.slot_to_app ? "รับออเดอร์ App" : "ปิดรับ App"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-[13px] xl:text-[15px]" title={title}>
      <div className="flex items-center gap-2">
        <StatusDot online={online} size={12} />
        <span className={`font-semibold ${online ? "text-[#15803d]" : "text-[#6b7280]"}`}>Terminal {label}</span>
        {terminal && terminal.total_terminals > 0 && (
          <span className="text-oxbowteal opacity-70">
            ({terminal.online_terminals}/{terminal.total_terminals} เครื่อง)
          </span>
        )}
      </div>
      <div className="text-oxbowteal opacity-80">
        อัปเดตล่าสุด: {agoText(terminal?.last_seen_ago_sec)}
        {terminal?.uinfoname ? ` · ผู้ใช้: ${terminal.uinfoname}` : ""}
      </div>
      <div className={terminal?.slot_to_app ? "text-oxbowteal" : "text-[#b91c1c]"}>
        {terminal?.slot_to_app ? "ส่ง Slot ให้ App: เปิด" : "ส่ง Slot ให้ App: ปิด (Terminal ขาดการเชื่อมต่อ)"}
      </div>
    </div>
  );
}

// สถานะการเชื่อมต่อ Backoffice -> Backend (API server)
export function BackendStatus({ online, lastSync }: { online: boolean; lastSync?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-[12px] md:text-[14px] px-3 py-1 rounded-full border border-lessengray bg-oatmilk"
      title={lastSync ? `อัปเดตข้อมูลล่าสุด ${lastSync}` : undefined}
    >
      <StatusDot online={online} />
      <span className={online ? "text-[#15803d] font-semibold" : "text-[#6b7280] font-semibold"}>
        Backend {online ? "Online" : "Offline"}
      </span>
      {lastSync && <span className="text-oxbowteal opacity-70 hidden md:inline">· {lastSync}</span>}
    </div>
  );
}
