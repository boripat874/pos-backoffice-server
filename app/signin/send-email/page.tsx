'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import axios from 'axios';
import { config } from '@/app/lib/config';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetRequest = async () => {
    if (!email) {
      Swal.fire({
        title: 'Error',
        text: 'กรุณากรอกอีเมลของคุณ',
        icon: 'warning'
      });
      return;
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        title: 'รูปแบบอีเมลไม่ถูกต้อง',
        text: 'กรุณากรอกอีเมลที่ถูกต้อง',
        icon: 'warning',
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${config.apiUrl}/backoffice/forgotemail`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': config.apiKey
          }
        }
      );

      if (response.status === 200) {

        Swal.fire({
          title: 'ส่งอีเมลเรียบร้อย',
          text: 'กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน',
          icon: 'success',
          timer: 3000
        });

        router.push('/');

      } else {

        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: response.data.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง',
          icon: 'error'
        });

      }
    } catch (error: unknown) {

      Swal.fire({
        title: 'แจ้งเตือน',
        text: 'อีเมลนี้ไม่มีในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง',
        icon: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col justify-center items-center bg-gradient-to-r from-[#009f4d] via-[#84bd00] to-[#efdf00] ">
    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-100 md:opacity-40"></div>
      
      {isLoading && (
        <div className="absolute z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#3EB776]"></div>
        </div>
      )}

      <div className="bg-white rounded-xl p-8 shadow-md w-[400px] z-10">

        <h1 className="text-2xl font-bold mb-4 text-center">รีเซ็ตรหัสผ่าน</h1>

        <p className="text-md mb-4 text-center">
          กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
        </p>

        <input
          type="email"
          placeholder="อีเมลของคุณ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          onKeyDown={(e) => {
            
            if (e.key === "Enter") {
            handleSendResetRequest(); // sign in on Enter key
            }
        }}
        />

        <button
          onClick={handleSendResetRequest}
          className="btn w-full text-white p-2 rounded"
        >
          ส่งคำขอรีเซ็ตรหัสผ่าน
        </button>

      </div>
    </div>
  );
}