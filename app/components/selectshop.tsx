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
  allOption?: string; // ถ้าระบุ จะเพิ่มตัวเลือก value="all" ไว้บนสุด (เช่น "ทุกร้าน")
}

export default function Selectshop({shopid,shopslist,onChange,className="w-[160px]  xl:w-[180px]",allOption}: SelectshopProps) {

  return (
    <div>
      <select 
        className={`${className} bg-oatmilk text-oxbowteal text-[14px] xl:text-[16px] h-[40px] xl:h-[40px] rounded-md border-oxbowteal px-2 border overflow-x-hidden`}
        onChange={(e) => onChange && onChange(e.target.value)}
        value={shopid}
        >
        {/* <option value="">บ้านสุขใจ</option> */}
        {allOption && Array.isArray(shopslist) && shopslist.length > 0 ? (
          <option value="all">{allOption}</option>
        ) : null}
        {Array.isArray(shopslist) && shopslist.length > 0 ? (
          shopslist.map((shop: Shop) => (
            <option key={shop.shopid} value={shop.shopid}>
              {(shop.shopnameth || "").length > 30 ? `${shop.shopnameth.substring(0, 30)}...` : shop.shopnameth}
            </option>
          ))
        ) : (
          <option>ไมมีข้อมูลร้านค้า</option>
        )}
      </select>
    </div>
  );
}
