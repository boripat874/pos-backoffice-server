'use client'

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import axios from 'axios';
import { config } from '@/app/lib/config';

export default function ResetPassword() {

  const router = useRouter();
  const params = useParams();

  // The token in the URL should be in UUID format
  const forgotemailid = params.id;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    // const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

  const handleResetPassword = async () => {

    const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }

    if (newPassword !== confirmPassword) {

      Swal.fire({
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
        icon: 'warning'
      });

      return;
    }

    try {
      setIsLoading(true);
      // Call your API endpoint to reset the password using the token
      const response = await axios.post(`${config.apiUrl}/backoffice/updatepassword`,
        {
          forgotemailid,
          newPassword
        },
        {
          headers
        }
      );
      if (response.status === 200) {
        Swal.fire({
          title: 'รีเซ็ตรหัสผ่านสําเร็จ',
          text: 'รหัสผ่านของคุณถูกรีเซ็ตเรียบร้อยแล้ว',
          icon: 'success'
        });
        router.push('/');
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error'
        });
      }
    } catch (error: unknown) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่มีคำร้องขอรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#009f4d] via-[#84bd00] to-[#efdf00]">
    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 md:opacity-40"></div>
      
      {isLoading && (
        <div className="absolute z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#3EB776]"></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-md w-[400px] z-10">

        <h1 className="text-xl font-bold mb-4 text-center">รีเซ็ตรหัสผ่าน</h1>

        <p className="text-sm mb-4 text-center">Token: {forgotemailid}</p>

        <div className="relative w-full">

            <input
            type={isNewPasswordVisible ? "text" : "password"}
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            className="w-full p-2 border border-[#2B5F60] rounded mb-2 pr-10"
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                handleResetPassword(); // sign in on Enter key
                }
            }}
            />

            <button
                type="button"
                onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                className="absolute right-4 top-[25px] transform -translate-y-1/2 text-gray-500"
            >
                {isNewPasswordVisible ? (
                <i className="fa-solid fa-eye-slash"></i>
                ) : (
                <i className="fa-solid fa-eye"></i>
                )}
            </button>

        </div>

        <div className="relative w-full">
            <input
                type={isNewPasswordVisible ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                className="w-full p-2 border border-[#2B5F60] rounded mb-4 pr-10"
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                handleResetPassword(); // sign in on Enter key
                }
            }}/>

            <button
                type="button"
                onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                className="absolute right-4 top-[25px] transform -translate-y-1/2 text-gray-500"
            >
                {isNewPasswordVisible ? (
                <i className="fa-solid fa-eye-slash"></i>
                ) : (
                <i className="fa-solid fa-eye"></i>
                )}
            </button>

        </div>

        <button
          onClick={handleResetPassword}
          className="btn w-full bg-blue-500 text-white p-2 rounded"
        >
          ยืนยัน
        </button>

      </div>
    </div>
  );
}