import React from "react";

interface Props {
  page: number;          // หน้าปัจจุบัน (เริ่ม 1)
  totalPages: number;
  total?: number;        // จำนวนรายการทั้งหมด
  pageSize?: number;
  onChange: (page: number) => void;
}

// เลขหน้าที่จะแสดง: ถ้าหน้าเยอะ ย่อด้วย "..." (1 … 4 5 6 … 20)
function pageItems(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("...");
  items.push(totalPages);
  return items;
}

export default function Pagination({ page, totalPages, total, pageSize = 10, onChange }: Props) {
  if (totalPages <= 1) {
    return total !== undefined ? (
      <p className="text-[12px] md:text-[14px] text-oxbowteal opacity-70">ทั้งหมด {total} ร้าน</p>
    ) : null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = total !== undefined ? Math.min(page * pageSize, total) : page * pageSize;
  const btn = "min-w-[34px] h-[34px] px-2 rounded-md border text-[13px] md:text-[14px] transition-colors";

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
      {total !== undefined && (
        <p className="text-[12px] md:text-[14px] text-oxbowteal opacity-70">
          แสดง {from}-{to} จาก {total} ร้าน
        </p>
      )}
      <div className="flex flex-row flex-wrap items-center gap-1">
        <button
          className={`${btn} border-lessengray text-oxbowteal hover:bg-hoverteal disabled:opacity-40 disabled:hover:bg-transparent`}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="หน้าก่อนหน้า"
        >
          &lsaquo;
        </button>
        {pageItems(page, totalPages).map((it, i) =>
          it === "..." ? (
            <span key={`e${i}`} className="px-1 text-oxbowteal opacity-60">…</span>
          ) : (
            <button
              key={it}
              onClick={() => onChange(it)}
              aria-current={it === page ? "page" : undefined}
              className={`${btn} ${
                it === page
                  ? "bg-oxbowteal border-oxbowteal text-white font-semibold"
                  : "border-lessengray text-oxbowteal hover:bg-hoverteal"
              }`}
            >
              {it}
            </button>
          )
        )}
        <button
          className={`${btn} border-lessengray text-oxbowteal hover:bg-hoverteal disabled:opacity-40 disabled:hover:bg-transparent`}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="หน้าถัดไป"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );
}
