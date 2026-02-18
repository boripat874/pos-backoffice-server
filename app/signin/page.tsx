'use client'

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { config } from "@/app/lib/config";
import axios from "axios";

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const paylaod = {
        uinfologinname: username,
        uinfologinpass: password,
      }
      const response = await axios.post(
        `${config.apiUrl}/backoffice/signin`,
        paylaod,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } 
        }
      );

      if(response.data.token !== null){
        localStorage.setItem('token', response.data.token)
        router.push('/backoffice/dashboard')
        return;
      } else {
        Swal.fire({
          title: 'กรุณาตรวจสอบบัญชีผู้ใช้',
          text: 'ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง',
          icon: 'warning',
          timer: 2000
        })
        setIsLoading(false);
        return;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          title: 'กรุณาตรวจสอบบัญชีผู้ใช้',
          text: 'ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง',
          icon: 'warning',
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'An unknown error occurred',
          icon: 'error',
        });
      }
      setIsLoading(false);
      return;
    }
  }
 
  return (
    <div className="signin-container relative">
      {isLoading && (
        <div className="absolute z-[2]">
          <div className="w-[90vw] h-screen m-auto flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-8 border-b-8 border-[#3EB776]"></div>
          </div>
        </div>
      )}

      <div className="signin-box relative">
        <p className="w-full text-center text-white font-bold text-4xl pb-14">POS Backoffice</p>
        <div className="w-full flex flex-col justify-center items-center my-2 pb-8">
          <h1 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h1>
          <h4 className="text-white">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</h4>
        </div>

        <div className="text-white">
          บัญชีผู้ใช้ <span className="text-red-600">*</span>
        </div>
        <input
          className="mt-1 w-full p-2 text-sm"
          type="text"
          placeholder="กรุณากรอกชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignIn(); // sign in on Enter key
            }
          }}
        />

        <div className="mt-4 text-white">
          รหัสผ่าน <span className="text-red-600">*</span>
        </div>
        <div className="relative w-full">
          <input
            placeholder="กรุณากรอกรหัสผ่าน"
            className="text-sm mt-1 w-full p-2 pr-10 border  border-[#2B5F60] rounded-md"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSignIn(); // sign in on Enter key
              }
            }}
          />

          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-[25px] transform -translate-y-1/2 text-gray-500"
          >
            {isPasswordVisible ? (
              <i className="fa-solid fa-eye-slash"></i>
            ) : (
              <i className="fa-solid fa-eye"></i>
            )}
          </button>
        </div>

        

        <div className="w-full pt-6 flex flex-col justify-center items-center">
          <button className="btn mt-4 w-full border" onClick={handleSignIn}>
            เข้าสู่ระบบ
            <i className="fa fa-sign-in-alt ml-2"></i>
          </button>
        </div>

        {/* Forgot Password Section */}
        <div className="w-full text-right mt-2">
          <button
            type="button"
            className="text-white text-sm underline"
            onClick={() => router.push('/signin/send-email')}
          >
            ลืมรหัสผ่าน?
          </button>
        </div>
      </div>
    </div>
  );
}