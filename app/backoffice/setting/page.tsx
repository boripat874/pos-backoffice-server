"use client"

import React, { useEffect, useState } from 'react'

export default function Setting() {
  
  const [date, setDate] = useState("");

  useEffect(() => {

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
      }, 1000); // ตรวจสอบและอัปเดตทุก 1 วินาที
  
      return () => {
        clearInterval(intervalId);
      }
  
  }, []);
  
  return (
    <>
      {/* header */}
      <div className='max-w-[1300px] flex flex-row justify-between items-center'>

      <div>

        <p className='text-4xl pt-4 font-bold'>ตั้งค่า</p>
        <p className='text-lg pt-4'>{date}</p>
      </div>

      </div>

      {/* เส้นคั่น */}
      <hr className="my-4 border-t-3 border-[#2B5F60]" />

      <div className='w-[1760px] min-h-[810px] bg-white p-4 rounded-lg shadow-sm'>

      </div>

    </>
  )
}
