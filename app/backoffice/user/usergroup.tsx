"use client"

import React, { useEffect, useState, useCallback } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
// import Modal from "@/app/modal";
import ModalXL from "@/app/modalW-Auto";
// import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { set } from 'date-fns';
// import { useRouter } from "next/navigation";

interface UserGroupPageProps {
  className?: string
}

export default function UserGroupPage(className: UserGroupPageProps) {

  interface UserGroup {
    ugroupid: string;
    ugroupname: string;
    ugroupprivilege: string;
    ugroupremark: string;
  }

  // const router = useRouter();
  
  const [isOpenUGroupCreate, setIsOpenUGroupCreate] = useState(false);
  const [isOpenUGroupEdit, setIsOpenUGroupEdit] = useState(false);

  // const [userid, setUserid] = useState("");

  const [search, setSearch] = useState(""); // เก็บคำค้นหา

  const [usergroups, setUsergroups] = useState<UserGroup[]>([]);
  const [ugroupId, setGroupId] = useState("");
  const [ugroupname, setGroupname] = useState("");
  const [ugroupprivilege, setGroupprivilege] = useState("");
  const [ugroupremark, setGroupremark] = useState("");

  const [date, setDate] = useState("-");

  const [isLoading, setIsLoading] = useState(false);


  // ดึงข้อมูล
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

    fetchDataFirst();

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
    };
  
      // fetchData(); // เรียกข้อมูลเมื่อ component โหลดครั้งแรก
  }, []);

  // 
  // Wrap fetchDataFirst in useCallback
  const fetchDataFirst = useCallback(async () => {
    setIsLoading(true);
    try {

      await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      }).then((response)=>{
        setUsergroups(response.data.result);
      })

      // console.log(response.data);

    } catch (err: unknown) {

      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.message,
        });
      } else {
        // Handle cases where err is not an Error object
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        });
      }
    }
    setIsLoading(false);
  }, []);

  // Wrap fetchData in useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {

      await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
        params: {
          search: search,
        },
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      }).then((response)=>{
        setUsergroups(response.data.result);
      })

      // console.log(response.data);

    } catch (err: unknown) {

      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.message,
        });
      } else {
        // Handle cases where err is not an Error object
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        });
      }
    }
    setIsLoading(false);
  }, [search]);

  const hadleOpenUGroupCreate = async () => {
    setIsOpenUGroupCreate(true);
    setIsOpenUGroupEdit(false);
    handleClear();
  }

  const handleUGroupEdit = async (userGroupid: string) => {
    const usergroups_: UserGroup | undefined = usergroups.find((usergroup: UserGroup) => usergroup.ugroupid === userGroupid);
    
        if (usergroups_) {
    
            setGroupId(usergroups_.ugroupid ?? '');
            setGroupname(usergroups_.ugroupname ?? '');
            setGroupprivilege(usergroups_.ugroupprivilege ?? '');
            setGroupremark(usergroups_.ugroupremark ?? '');
    
            handleOpenUGroupEdit();
        } else {
            // Handle the case where no shop is found
            // console.error(`Shop with ID ${shopid} not found.`);
            // Or show a user-friendly error message:
            Swal.fire({
                icon: 'error',
                title: 'User Not Found',
                text: `User with ugroupid does not exist.`,
            });
        }
      
  }

  const handleOpenUGroupEdit = async () => {
    setIsOpenUGroupEdit(true);
    setIsOpenUGroupCreate(false);
  }

  // close modal
  const handleCloseModal = () => {
        setIsOpenUGroupCreate(false);
        setIsOpenUGroupEdit(false);
  }

  // Clear data modal
  const handleClear = () => {


    setGroupId('');
    setGroupname('');
    setGroupprivilege('');
    setGroupremark('');
  }

  const handleUGroupCreate = async () => {
    try {

      if(ugroupname === '' || ugroupname === null){
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อกลุ่มบัญชีผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        })

        return;
      }

      setIsLoading(true);
      // let uuid = uuidv4();
      // console.log(shopid, ugroupId, username, userpassword, name, level);
      const payload:Partial<UserGroup> = {
        ugroupid: ugroupId,
        ugroupname: ugroupname,
        ugroupprivilege: ugroupprivilege,
        ugroupremark: ugroupremark
      }
  
    await axios.post(`${config.apiUrl}/backoffice/groupusercreate`, payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      }
    ).then(async () => {
      Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อย',
        text: 'ข้อมูลถูกเพิ่มเรียบร้อย',
        timer: 2000
      });
    })
  
  
    handleCloseModal();
    fetchData();

    setIsLoading(false);
  
    } catch (err: unknown) {
            
      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.message,
        });
      } else {
        // Handle cases where err is not an Error object
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        });
      }
    }
      
  }

  const handleUGroupEditSave = async () => {
    try {

      if(ugroupname === '' || ugroupname === null){
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อกลุ่มบัญชีผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        })

        return;
      }

      setIsLoading(true);
      const payload:Partial<UserGroup> = {
        ugroupid: ugroupId,
        ugroupname: ugroupname,
        ugroupprivilege: ugroupprivilege,
        ugroupremark: ugroupremark
      }

    await axios.put(`${config.apiUrl}/backoffice/groupuseredit`, payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      }
    ).then(async () => {
      Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลเรียบร้อย',
        text: 'ข้อมูลถูกเพิ่มเรียบร้อย',
        timer: 2000
      });
    })

    handleCloseModal();
    fetchData();

    setIsLoading(false);

    } catch (err: unknown) {
            
      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.message,
        });
      } else {
        // Handle cases where err is not an Error object
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        });
      }
    }
 }

const handleGroupDelete = async (userGroupid: string) => {

    try {

      const result = Swal.fire({
        title: 'ลบข้อมูลกลุ่มบัญชีผู้ใช้!',
        text: 'คุณต้องการลบกลุ่มบัญชีผู้ใช้นี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก'
      })

      if ((await result).isConfirmed) {

        const payload = {
          ugroupid: userGroupid
        }
          // console.log(productid);
    
        await axios.delete(`${config.apiUrl}/backoffice/groupuserdelete`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': config.apiKey,
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            data:payload
          },
          
        ).then(async () => {
          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลเรียบร้อย',
            text: 'ข้อมูลถูกลบเรียบร้อย',
            timer: 2000
          });
        })

        handleCloseModal();
        fetchData();
      }

    } catch (err: unknown) {
            
      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: err.message,
        });
      } else {
        // Handle cases where err is not an Error object
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
        });
      }
    }
}

// const toUserPage = async () =>{
//     router.push('/backoffice/user');
// }

 // animation load
 if (isLoading) {
  return <LoadingSpinner />;
}

  return (
    <div className={`flex flex-col ${className.className}`}>
      
      {/* header */}
      <div className='flex flex-row justify-between items-center'>
 
      <div>

        <p className='text-xl md:text-2xl xl:text-4xl pt-4 font-bold'>บัญชีผู้ใช้</p>
        <p className='text-xs md:text-md xl:text-lg pt-2'>{date}</p>

      </div>

      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/*table */}
      <div className="mt-2 overflow-auto">

        {/* table user */}
        <div className='w-[1325px] xl:w-full mt-0 bg-white p-4 rounded-lg shadow-sm'>

            {/* header table */}
            <div className='flex flex-row justify-between items-center text-white'>

              <div className='flex flex-row justify-between items-center p-4'>
                <p className='text-lg xl:text-2xl font-bold text-black'> รายการกลุ่มบัญชีผู้ใช้</p>
              </div>

              {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

              <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-6">

                {/* <button className="btn w-[200px]" onClick={toUserPage}>
                  <i className="fa-solid fa-users"></i> จัดการบัญชีผู้ใช้
                </button> */}
                <button className="btn w-[200px]" onClick={hadleOpenUGroupCreate}>
                  <i className="fa-solid fa-plus"></i> เพิ่มกลุ่มบัญชีผู้ใช้
                </button>

                
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="text"
                    placeholder="Search for User ..."
                    className="w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchData(); // ค้นหาเมื่อกด Enter
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* content table */}
            <div className='overflow-y-auto'>
              <table className='text-[16px] p-2 xl:p-4 table-auto w-full text-center text-black'>
                <thead className='border-b border-[#2B5F60] sticky top-0 bg-[#74d2e7]'>
                  <tr>

                    <th className='h-12 w-[150px]'>กลุ่มบัญชีผู้ใช้</th>
                    <th className='h-12 w-[150px]'>สิทธิพิเศษ</th>
                    <th className='h-12 w-[150px]'>หมายเหตุ</th>
                    <th className='h-12 w-[130px]'>ดำเนินการ</th>

                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(usergroups) && usergroups.length > 0 ? usergroups.map((usergroup: UserGroup) => (
                    <tr key={usergroup.ugroupid} className='border-b border-gray-100 hover:bg-gray-50'>

                      <td className='h-12 w-[100px]'>{usergroup.ugroupname}</td>
                      <td className='h-12 w-[100px]'>{usergroup.ugroupprivilege}</td>
                      <td className='h-12 w-[100px]'>{usergroup.ugroupremark}</td>

                      {/* <td className='h-12 w-[100px]'>฿ {getRandomInt(100,3000).toFixed(2).toLocaleString()}</td>
                      <td className='h-12 w-[100px]'>{getRandomInt(100,1000)}</td> */}
                      <td className='h-12 w-[100px]'>
                        <button className="btn-edit mr-2" onClick={() => handleUGroupEdit(usergroup.ugroupid)}>
                            <i className="fa-solid fa-edit"></i>
                        </button>
                        <button className="btn-delete" onClick={() => handleGroupDelete(usergroup.ugroupid)}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>

                    </tr>
                  )): 
                    <tr>
                      <td colSpan={4} className='py-4 text-center text-base'>ไม่มีข้อมูลกลุ่มบัญชีผู้ใช้</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
        </div>

      </div>

      {/* สร้างกลุ่มบัญชีผู้ใช้ */}
      <ModalXL 
        title="สร้างกลุ่มบัญชีผู้ใช้" 
        isOpen={isOpenUGroupCreate} 
        onClose={handleCloseModal}
        className='h-[220px]'
      >
  
          <div className='flex flex-row justify-between items-center gap-2'>

            <div className='w-[320px] md:w-[400px] flex flex-col gap-2'>

                <div>ชื่อกลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span></div>
                <input type="text" placeholder='กรุณากรอกชื่อกลุ่มบัญชีผู้ใช้' value={ugroupname} onChange={(e) => setGroupname(e.target.value)} />

                {/* <div>สิทธิพิเศษ</div>
                <input type="text" value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)} />

                <div>หมายเหตุ</div>
                <input type="text" value={ugroupremark} onChange={(e) => setGroupremark(e.target.value)} /> */}

                <div className="flex flex-row">
                  <button className="btn mr-2 mt-2 w-[120px]" onClick={handleUGroupCreate}>
                      <i className="fa-solid fa-plus mr-2"></i>
                      เพิ่ม
                  </button>
              </div>
            </div>
  
          </div>
      </ModalXL>

      {/* แก้ไขกลุ่มบัญชีผู้ใช้ */}
      <ModalXL 
        title="แก้ไขกลุ่มบัญชีผู้ใช้" 
        isOpen={isOpenUGroupEdit} 
        onClose={handleCloseModal}
        className='h-[220px]'
      >
  
          <div className='flex flex-row justify-between items-center gap-2'>

            <div className='w-[320px] md:w-[400px] flex flex-col gap-2'>

                <div>ชื่อกลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span></div>
                <input type="text" placeholder='กรุณากรอกชื่อกลุ่มบัญชีผู้ใช้' value={ugroupname} onChange={(e) => setGroupname(e.target.value)} />

                {/* <div>สิทธิพิเศษ</div>
                <input type="text" value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)} />

                <div>หมายเหตุ</div>
                <input type="text" value={ugroupremark} onChange={(e) => setGroupremark(e.target.value)} /> */}

                <div className="flex flex-row">
                  <button className="btn mr-2 mt-2 w-[120px]" onClick={handleUGroupEditSave}>
                      <i className="fa-solid fa-save mr-2"></i>
                      บันทึก
                  </button>
              </div>
            </div>
  
          </div>
      </ModalXL>

    </div>
  )
}
