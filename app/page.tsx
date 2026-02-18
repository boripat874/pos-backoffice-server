"use client"

import { useEffect } from "react";
import SignIn from "./signin/page";
import { useRouter } from "next/navigation";
import axios from "axios";
import { config } from "@/app/lib/config";
import Image from "next/image";
// import Link from "next/link";


export default function Home() {

  const router = useRouter();//เรียกใช้งาน router

  useEffect(() => {

    const token = localStorage.getItem('token');

    axios.get(`${config.apiUrl}/backoffice/checklogin`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'authorization': `Bearer ${token}`
      }
    }).then((res) => {

      // console.log(res.data);

      if(res.status === 200){
        router.push('/backoffice/dashboard');
      }

    }).catch((err) => {
      console.log(err);
    });
    
  }, [])
 
  return (
    <>
      <div className="w-screen h-screen relative">
        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src="/img/login.jpg"
            alt="login"
            width={1920}
            height={1080}
            className="w-full h-full object-cover xl:object-cover "
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 md:opacity-20"></div>
        <SignIn />
      </div>
      {/* <h1>adada</h1> */}
    </>
  );
}
