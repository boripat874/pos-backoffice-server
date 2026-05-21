import React from 'react'
import Image from 'next/image'
import { config } from "@/app/lib/config";

interface Props {
  imageshop?: string
  shopname: string
  total_income?: number
  total_order_sold?: number
  total_product_sold?: number
}

export default function CardShopdisplay({imageshop,shopname, total_income, total_order_sold, total_product_sold}: Props) {

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString();
  };
  
// w-[275px]
  return (
    <div className="min-w-[200px] h-[300px] xl:min-w-[270px] xl:h-[300px] p-2 gap-2 border hover:border-oxbowteal shadow-lg rounded-lg flex flex-col justify-start items-center transition-all duration-300">
      <div className="my-3">

        <Image
          src={`${
            imageshop
              ? config.apiUrlImage + "/" + imageshop
              : "https://placehold.co/100x100"
          }`}
          alt="shop"
          width={120}
          height={120}
          className="inline-block min-w-[100px] max-w-[80px] h-[90px] lx:w-[120px] lx:h-[120px] rounded-3xl xl:rounded-3xl"
        />
      </div>

      <div>
        <p className="text-[14px] xl:text-[16px] font-bold text-deepforest mb-1">{(shopname || "").length > 30 ? `${shopname.substring(0, 30)}...` : shopname}</p>
      </div>

      <div className="text-[14px] md:text-[12px] xl:text-[14px] w-full h-2 px-2 py-2 flex flex-row justify-between">
        <p className="w-[200px] md:w-[200px] text-deepforest">รายได้รวมทั้งหมด</p>
        <p className="w-[120px] md:w-16 text-deepforest">{`฿ ${formatNumber(
          total_income
        )}`}</p>
      </div>

      <div className="text-[14px] md:text-[12px] xl:text-[14px] w-full h-2 px-2 py-2 flex flex-row justify-between">
        <p className="w-[200px] text-deepforest">บิลที่ขายทั้งหมด</p>
        <p className="w-[120px] md:w-16 text-deepforest">
          {formatNumber(total_order_sold)}
        </p>
      </div>

      <div className="text-[14px] md:text-[12px] xl:text-[14px] w-full h-2 px-2 py-2 flex flex-row justify-between">
        <p className="w-[200px] text-deepforest whitespace-pre-line">{`สินค้าขายออกทั้งหมด\nหลายชิ้น`}</p>
        <p className="w-[120px] md:w-16 text-deepforest">
          {formatNumber(total_product_sold)}
        </p>
      </div>
    </div>
  );
}
