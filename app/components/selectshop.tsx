import React from 'react'
// import Image from 'next/image'


interface Shop {
  shopid: string;
  shopnameth: string;
}


interface SelectshopProps {
  shopid: string;
  shopslist?: Shop[];
  onChange?: (value: string) => void;
  className?: string;
}

export default function Selectshop({shopid,shopslist,onChange,className="w-[160px]  xl:w-[180px]"}: SelectshopProps) {

  return (
    <div>
      <select 
        className={`${className} text-black text-[14px] xl:text-[16px] h-[40px] xl:h-[40px] rounded-md border-[#009f4d] px-2 border overflow-x-hedden`}
        onChange={(e) => onChange && onChange(e.target.value)}
        value={shopid}
        >
        {/* <option value="">บ้านสุขใจ</option> */}
        {Array.isArray(shopslist) && shopslist.length > 0 ? (
          shopslist.map((shop: Shop) => (
            <option key={shop.shopid} value={shop.shopid}>
              {shop.shopnameth}
            </option>
          ))
        ) : (
          <option>ไมมีข้อมูลร้านค้า</option>
        )}
      </select>
    </div>
  );
}
