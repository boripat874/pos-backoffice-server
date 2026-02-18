import React from 'react'
import Image from 'next/image'


interface CarddisplayProps {
  iconpath: string;
  label: string;
  value: string;
  backgroundColor?: string;
  textColor?:string;
}

export default function Carddisplay({iconpath, label, value , backgroundColor,textColor}: CarddisplayProps) {

  return (
    <div className='w-auto'>
      <div
        className={`w-full h-[125px] xl:h-[140px] p-2 xl:p-4 rounded-md  flex flex-col justify-start items-start ${
          backgroundColor ? backgroundColor : "bg-[#2B5F60]"
        }`}
      >
        <div
          className={`h-[18px] xl:h-[24px] ${
            backgroundColor ? backgroundColor : "#2B5F60"
          } rounded-md flex justify-center items-center`}
        >
          <Image
            src={iconpath}
            alt="money"
            width={20}
            height={20}
            className="inline-block"
            style={{ transform: "rotate(180deg)" }}
          />
        </div>

        <p
          className={`my-1 text-[18px] xl:text-xl font-bold ${
            textColor ? textColor : "text-[#2B5F60]"
          } `}
        >
          {value}
        </p>

        <p
          className={`my-1 text-sm xl:text-md ${
            textColor ? textColor : "text-[#2B5F60]"
          } text-opacity-100 whitespace-pre-line`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
