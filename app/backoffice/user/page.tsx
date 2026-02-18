"use client"

import React, { useEffect, useState, useCallback } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
// import Modal from "@/app/modal";
import ModalXL from "@/app/modalW-Auto";
// import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from "../../components/LoadingSpinner"
// import { useRouter } from "next/navigation";
// import {getLevel} from "@/app/modules/getlevel";
// import { stat } from 'fs';
import UserGroupPage from './usergroup';
import Papa from "papaparse";
import escapeCSV from '@/app/components/escapeCSV';
import { format } from 'date-fns';

export default function UserPage() {

  // เก็บข้อมูล
  interface User {
    shopid: string;
    uinfoid: string;
    ugroupid: string;
    shopnameth: string;
    shopnameeng: string;
    ugroupname: string;
    uinfologinname: string;
    uinfologinpass: string;
    uinfoname: string;
    level: string;
    uinfoemail: string;
    details: string;
  }

  interface UserGroup {
    ugroupid: string;
    ugroupname: string;
    ugroupprivilege: string;
    ugroupremark: string;
  }

  interface UserAccountRight {
    id: number;
    level: string;
  }

  interface Shop {
    shopid: string;
    shopnameth: string;
    ugroupid: string;
  }

  const EmailChange = (value: string) => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return false;
        
        } else {
          return true;
        }
    };

  // const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const value = e.target.value;
  //     setEmail(value);
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(value)) {
  //         setError('อีเมลไม่ถูกต้อง');
  //     } else {
  //         setError('');
  //     }
  // };
  const [importFile, setImportFile] = useState<File | null>(null);

  const [isOpenDataManagement, setIsOpenDataManagement] = useState(false);

  const [toUserGroupPage, setToUserGroupPage] = useState(false);
  // const router = useRouter();
  const [leveluser, setLeveluser] = useState(""); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [shopid, setShopid] = useState("");
  const [userid, setUserid] = useState("");
  // const [shopnameth, setShopnameth] = useState("");
  // const [shopnameeng, setShopnameeng] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [userpassword, setPassword] = useState("");
  const [level, setLevel] = useState("");
  const [uinfoemail, setUinfoemail] = useState("");

  const [search, setSearch] = useState(""); // เก็บคำค้นหา

  const [users, setUsers] = useState<User[]>([]);

  const [shops, setShops] = useState<Shop[]>([]);

  const [usergroups, setUsergroups] = useState<UserGroup[]>([]);
  
  const [ugroupId, setUgroupId] = useState("");

  const [shopidExport, setShopidExport] = useState("");
  const [shopidImport, setShopidImport] = useState("");

  const [groupuseridExport, setGroupuseridExport] = useState("");
  const [groupuseridImport, setGroupuseridImport] = useState("");

  // const [ugroupname, setGroupname] = useState("");
  // const [ugroupprivilege, setGroupprivilege] = useState("");
  // const [ugroupremark, setGroupremark] = useState("");

  const [date, setDate] = useState("-");

  // const [shops, setShops] = useState([]); 

  // const [levellist, setLevellist] = useState([]); 

  const [isLoading, setIsLoading] = useState(false);

  const userAccountRights = [
    {id:1,level:"Admin"},
    {id:2,level:"Owner"},
    {id:3,level:"Manager"},
    {id:4,level:"Employee"},
  ]

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
    
  }, []);

  // Wrap fetchDataFirst in useCallback
  const fetchDataFirst = useCallback(async () => {

    setIsLoading(true);

    try {
      const headers = {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      
      await axios.get(`${config.apiUrl}/backoffice/checklogin`, {
        headers
      }).then((response)=>{
        setLeveluser(response.data.level);
        setUgroupId(response.data.ugroupid);
        setShopid(response.data.shopid);
        // console.log(response.data.ugroupid);
      })

      // const userLevel = await getLevel(); // Renamed variable to avoid shadowing

      await axios.get(`${config.apiUrl}/backoffice/userlistall`, {
        headers
      }).then((response)=>{
        setUsers(response.data.result);
        // console.log(response.data);
      })


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

       const headers = {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }

      await axios.get(`${config.apiUrl}/backoffice/userlistall`, {
        params: {
          search: search,
        },
        headers
      }).then((response)=>{
        setUsers(response.data.result);
      })

      if (leveluser === 'Admin') {
        await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
          headers,
        }).then((response)=>{
          setUsergroups(response.data.result);
        })
        
      }

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
 
  // open modal
  const handleOpenModal = () => {
    setIsOpen(true);
    setIsOpenCreate(false);
  }

  // close modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setIsOpenCreate(false);
    setIsOpenDataManagement(false);
  }

  // open modal create
  const handleOpenCreate = async() => {
    
    try{

      setIsLoading(true);

      if (leveluser === 'Admin') {
        
        await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // เพิ่ม header อื่นๆ ตามต้องการ
          },
        }).then((response)=>{

          setUsergroups(response.data.result);

          if(leveluser === 'Admin'){

            setUgroupId('0');

          }else if(leveluser === 'Owner' || leveluser === 'Manager'){

            setUgroupId(response.data.result[0].ugroupid);
          }
          // setUgroupId(response.data.result[0].ugroupid);
        })
      }else{

      }


      await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {

        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },

      }).then((response)=>{

        setShops(response.data.result);

        if(leveluser === 'Admin'){

          setShopid('0'); 

        }else if(leveluser === 'Owner'){

          setShopid('0');
          
        }else if(leveluser === 'Manager'){

          setShopid(response.data.result[0].shopid);
          
        }
        // setShopid(response.data.result[0].shopid);
      })


    }catch (err: unknown) {
                
      // console.log(err);

      if (err instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: "มีบัญชีผู้ใช้นี้แล้ว",
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
    handleClear();
    setIsOpenCreate(true);
  }

  // Clear data modal
  const handleClear = () => {

    
    setUserid('');
    setName('');
    setUsername('');
    setPassword('');
    setUinfoemail('');
    
    if (leveluser === 'Admin') {
      setLevel('Admin');
    }else if (leveluser === 'Owner') {
      setLevel('Owner');
    }else{
      setLevel('Employee');
    }

    // setUgroupId('');
    // setGroupname('');
    // setGroupprivilege('');
    // setGroupremark('');
  }

  const handleEdit = async(userid: string) => {

    setIsLoading(true);

    try {

      if (leveluser === 'Admin') {
        await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
          headers: {
            'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // ตัวอย่าง header Authorization
            // เพิ่ม header อื่นๆ ตามต้องการ
          },
        }).then((response)=>{
          setUsergroups(response.data.result);
        })
      }

      await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {

        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },

      }).then((response)=>{

        setShops(response.data.result);

      })

      const users_: User | undefined = users.find((user: User) => user.uinfoid === userid);

      if (users_) {

        setShopid(users_.shopid ?? '');
        setUserid(users_.uinfoid ?? '');
        setUgroupId(users_.ugroupid ?? '');
        // setGroupname(users_.ugroupname ?? '');
        // setShopnameth(users_.shopnameth ?? '');
        setName(users_.uinfoname ?? '');
        setUsername(users_.uinfologinname ?? '');
        setPassword(users_.uinfologinpass ?? '');
        setLevel(users_.level ?? '');
        setUinfoemail(users_.uinfoemail ?? '');

        
        setIsLoading(false);
        handleOpenModal();

      } else {
        // Handle the case where no shop is found
        // console.error(`Shop with ID ${shopid} not found.`);
        // Or show a user-friendly error message:.
        setIsLoading(false);

        Swal.fire({
          icon: 'error',
          title: 'User Not Found',
          text: `User with uinfoid does not exist.`,
        });
      }


    } catch (error: unknown) {
      setIsLoading(false);

      if (error instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: error.message,
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

  };

  const handleEditSave = async () => {
    try {

      if (name === '' || name === null) {

        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else if (username === '' || username === null) {

        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อบัญชีผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else if ((userpassword === '') || (userpassword === null)) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกรหัสผ่าน',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;
      }else if (uinfoemail === '' || uinfoemail === null) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกอีเมล์ผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;
      }else if (EmailChange(uinfoemail) === false) {
        Swal.fire({
          icon: 'warning',
          title: 'อีเมลไม่ถูกต้อง',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else{
        setIsLoading(true);

        const payload:Partial<User> = {
          uinfoid: userid,
          shopid: shopid,
          ugroupid: ugroupId,
          uinfologinname: username,
          uinfologinpass: userpassword,
          uinfoname: name,
          level: level,
          uinfoemail: uinfoemail
        }
    
        await axios.put(`${config.apiUrl}/backoffice/useredit`, payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': config.apiKey,
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          }
        ).then(async (result) => {

          if(result.status === 200){
            Swal.fire({
              icon: 'success',
              title: 'บันทึกข้อมูลเรียบร้อย',
              text: 'ข้อมูลถูกเพิ่มเรียบร้อย',
              timer: 2000
            });

            handleCloseModal();
            fetchData();
            setIsLoading(false);

          }else  if (result.status === 204){
           Swal.fire({
             icon: 'warning',
             title: 'บัญชีผู้ใช้นี้ไม่มีในระบบ',
             text: 'กรุณากรอก User ใหม่',
             timer: 2000
           })
           setIsLoading(false);
           return;
          }else  if (result.status === 205){
           Swal.fire({
             icon: 'warning',
             title: 'อีเมล์นี้ถูกใช้ไปแล้ว',
             text: 'กรุณากรอกอีเมลใหม่',
             timer: 2000
           })
           setIsLoading(false);
           return;
          }
        })
    
        
      }
      // let uuid = uuidv4();
      // console.log(shopid, ugroupId, username, userpassword, name, level);

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

      setIsLoading(false);
    }
  }

  const handleCreate = async () => {
    try {

      if (name === '' || name === null) {

        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else if (username === '' || username === null) {

        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อบัญชีผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else if ((userpassword === '') || (userpassword === null)) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกรหัสผ่าน',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;
      }else if (uinfoemail === '' || uinfoemail === null) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกอีเมล์ผู้ใช้',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;
      }else if (EmailChange(uinfoemail) === false) {
        Swal.fire({
          icon: 'warning',
          title: 'อีเมลไม่ถูกต้อง',
          text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
        });
        return;

      }else{

        setIsLoading(true);

        const payload:Partial<User> = {
          shopid: shopid,
          ugroupid: ugroupId,
          uinfologinname: username,
          uinfologinpass: userpassword,
          uinfoname: name,
          level: level,
          uinfoemail: uinfoemail
        }
    
        await axios.post(`${config.apiUrl}/backoffice/usercreate`, payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': config.apiKey,
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          }
        ).then(async (result) => {
          if(result.status === 200){
            Swal.fire({
              icon: 'success',
              title: 'บันทึกข้อมูลเรียบร้อย',
              text: 'ข้อมูลถูกเพิ่มเรียบร้อย',
              timer: 2000
            });

            handleCloseModal();
            fetchData();
            setIsLoading(false);

          }else  if (result.status === 204){
           Swal.fire({
             icon: "warning",
             title: "บัญชีผู้ใช้นี้ถูกใช้ไปแล้ว",
             text: "กรุณากรอกบัญชีผู้ใช้ใหม่",
             timer: 2000,
           });
           setIsLoading(false);
           return;
          }else  if (result.status === 205){
           Swal.fire({
             icon: 'warning',
             title: 'อีเมล์นี้ถูกใช้ไปแล้ว',
             text: 'กรุณากรอกอีเมลใหม่',
             timer: 2000
           })

           setIsLoading(false);
           return;
          }
        })
      }
      // let uuid = uuidv4();
      // console.log(shopid, ugroupId, username, userpassword, name, level);

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

      setIsLoading(false);
    }
      
  }

  const handleDelete = async (userid: string) => {

    try {

      const result = Swal.fire({
        title: 'ลบข้อมูลบัญชีผู้ใช้!',
        text: 'คุณต้องการลบบัญชีผู้ใช้นี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก'
      })

      if ((await result).isConfirmed) {

        const payload = {
          uinfoid: userid
        }
          // console.log(productid);
    
        await axios.delete(`${config.apiUrl}/backoffice/userdelete`,
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

  // 
  // const CustomDropdown = ({ options, onChange }: { options: any[]; onChange: (value: string) => void }) => {
  //   const [isOpen, setIsOpen] = useState(false);
  //   const [selected, setSelected] = useState("");
  
  //   const handleSelect = (value: string) => {
  //     setSelected(value);
  //     onChange(value);
  //     setIsOpen(false);

  //   };
  
  //   return (
  //     <div className="relative w-full">
  //       <div
  //         className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2 cursor-pointer"
  //         onClick={() => setIsOpen(!isOpen)}
  //       >
  //         {selected || options[0].label || "ไม่มีกลุ่มบัญชีผู้ใช้"}
  //       </div>
  //       {isOpen && (
  //         <ul className="absolute w-full bg-white border border-[#2B5F60] rounded-md mt-1 z-10">
  //           {options.map((option) => (
  //             <li
  //               key={option.value}
  //               className="p-2 flex items-center gap-2 cursor-pointer hover:bg-[#F6F4F4]"
  //               onClick={() => handleSelect(option.value)}

  //             >
  //               {option.icon && <i className={option.icon}></i>}
  //               {option.label}
  //               <input type="hidden" name="ugroupid" value={option.ugroupid} />
  //               <input type="hidden" name="ugroupname" value={option.ugroupname}/>
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //     </div>
  //   );
  // };

  // const userGroups = users.map((user: User) => ({
  //   icon: "fa-solid fa-users",
  //   value: user.ugroupname,
  //   label: user.ugroupname,
  //   ugroupId: user.ugroupid,
  //   ugroupname: user.ugroupname,
  // }));

  

  // เปิดหน้าต่างสําหรับการจัดการข้อมูล
    const handleOpenDataManagement = async() => {

      try {

        setIsLoading(true);

        const headers = {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }

        if(leveluser === 'Admin'){
          
          await axios.get(`${config.apiUrl}/backoffice/groupuserlist`, {
            headers,
          }).then((response)=>{
  
            setUsergroups(response.data.result);
            setGroupuseridExport(response.data.result[0].ugroupid);
            setGroupuseridImport(response.data.result[0].ugroupid);
  
          })

        }else{

          setGroupuseridExport(ugroupId);
          setGroupuseridImport(ugroupId);
        }


        await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {
          headers,
        }).then((response)=>{

          setShops(response.data.result);
          setShopid(response.data.result[0].shopid);
          setShopidExport(response.data.result[0].shopid);
          setShopidImport(response.data.result[0].shopid);

        })

        // setShopidExport(shops[0].shopid);
        // setShopidImport(shops[0].shopid);
        setIsLoading(false);
        setIsOpenDataManagement(true);
    } catch (error: unknown) {
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการดําเนินการ',
      })
      setIsLoading(false);
    }
  }
  
    // อัปโหลดไฟล์ CSV
    const handleImportCSV = async() => {
  
      if (!importFile) {
        Swal.fire({ 
          icon: "warning", 
          title: "กรุณาเลือกไฟล์ CSV ก่อน" ,
          timer: 2000
        });
        return;
      }

      setIsLoading(true);
  
      Papa.parse(importFile, {
        header: true,
        skipEmptyLines: true,
  
        complete: async(results) => {
  
          const data = results.data as any[];
  
          // 1. ไม่มีข้อมูล
          if (!data || data.length === 0) {
            Swal.fire({
              icon: "warning",
              title: "ไม่มีข้อมูล",
              text: "ไฟล์ CSV ไม่มีข้อมูล",
            });
            setIsLoading(false);
            return;
          }
  
          // 2. ไม่มีหัวข้อหรือหัวข้อไม่ตรงกัน
          const requiredHeaders = [
            "อีเมล์",
            "ชื่อ นามสกุล", 
            "ชื่อบัญชีผู้ใช้",
            "รหัสผ่าน",
            "สิทธิ์ใช้งาน",
            "รายละเอียด"
          ];
  
          const fileHeaders = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(
            (header) => !fileHeaders.includes(header)
          );
  
          if (missingHeaders.length > 0) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: `ไฟล์ CSV ต้องมีหัวข้อ: ${requiredHeaders.join(", ")}`,
            });
            setIsLoading(false);
            return;
          }
  
          // 3.ตรวจสอบลำดับหัวข้อ
          const isOrderCorrect = requiredHeaders.every((header, idx) => fileHeaders[idx] === header);
          if (!isOrderCorrect) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: `กรุณาเรียงลำดับหัวข้อในไฟล์ CSV ให้ตรงกับ: ${requiredHeaders.join(", ")}`,
            });
            setIsLoading(false);
            return;
          }
  
          // 4. ข้อมูลต้องไม่ว่าง
          const invalidRows = data.filter(
            (row) =>
              !row["อีเมล์"]?.trim() ||
              // !row["ชื่อ นามสกุล"]?.trim() ||
              !row["ชื่อบัญชีผู้ใช้"]?.trim() ||
              !row["รหัสผ่าน"]?.trim() ||
              !row["สิทธิ์ใช้งาน"]?.trim() 
  
          );

          console.log(invalidRows);

          if (invalidRows.length > 0) {
  
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: "อีเมล์,ชื่อ นามสกุล,ชื่อบัญชีผู้ใช้,รหัสผ่าน,สิทธิ์ใช้งาน จะต้องไม่ว่าง!",
            });
            setIsLoading(false);
            return;
          }

          // ตรวจสอบอีเมล์ต้องเป็นรูปแบบอีเมล์
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const invalidEmailRows = data.filter(
            (row) => !emailRegex.test(row["อีเมล์"]?.trim() || "")
          );
          if (invalidEmailRows.length > 0) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: "อีเมล์ในไฟล์ CSV รูปแบบไม่ถูกต้อง",
            });
            setIsLoading(false);
            return;
          }

          // ตรวจสอบอีเมล์ซ้ำ
          const emailSet = new Set<string>();
          const duplicateEmail = data.find(row => {
            const email = row["อีเมล์"]?.trim();
            if (emailSet.has(email)) return true;
            emailSet.add(email);

            return false;
          });
          if (duplicateEmail) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: "อีเมล์ในไฟล์ CSV ต้องไม่ซ้ำกัน",
            });
            setIsLoading(false);
            return;
          }

          // // ดึงค่าที่อนุญาตจาก userAccountRights
          // const validLevels = userAccountRights.map((item) => item.level);

          // // ตรวจสอบสิทธิ์ใช้งาน
          // const invalidLevelRows = data.filter(
          //   (row) => !validLevels.includes((row["สิทธิ์ใช้งาน"] || "").trim())
          // );

          // if (invalidLevelRows.length > 0) {
          //   Swal.fire({
          //     icon: "error",
          //     title: "สิทธิ์ใช้งานไม่ถูกต้อง",
          //     text: `สิทธิ์ใช้งานต้องเป็นหนึ่งใน: ${validLevels.join(", ")}`,
          //   });
          //   return;
          // }

          // ตรวจสอบชื่อบัญชีผู้ใช้ซ้ำ
          const usernameSet = new Set<string>();
          const duplicateUsername = data.find(row => {
            const username = row["ชื่อบัญชีผู้ใช้"]?.trim();
            if (usernameSet.has(username)) return true;
            usernameSet.add(username);
            return false;
          });
          if (duplicateUsername) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: "ชื่อบัญชีผู้ใช้ในไฟล์ CSV ต้องไม่ซ้ำกัน",
            });
            setIsLoading(false);
            return;
          }

          const ugroupidE = groupuseridImport;
          let shopidE = shopidImport;

          if(ugroupidE == "") {
            shopidE = "";
          }else if(ugroupidE == "0") {
            shopidE = "0";
          }

          // กำหนดสิทธิ์ที่อนุญาตตามเงื่อนไข
          let validLevels: string[] = [];

          if (ugroupidE === "0") {
            validLevels = ["Admin", "Owner"];
          } else if (ugroupidE !== "0" && shopidE === "0") {
            validLevels = ["Owner"];
          } else if (ugroupidE !== "0" && shopidE !== "0") {
            validLevels = ["Manager", "Employee"];
          }

          // ตรวจสอบสิทธิ์ใช้งาน
          const invalidLevelRows = data.filter(
            (row) => !validLevels.includes((row["สิทธิ์ใช้งาน"] || "").trim())
          );

          if (invalidLevelRows.length > 0) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ถูกต้อง",
              text: `สิทธิ์ใช้งานต้องเป็นหนึ่งใน: ${validLevels.join(", ")}`,
            });
            setIsLoading(false);
            return;
          }
  
          // console.log(data);
  
          // ส่งข้อมูลจากไฟล์ CSV
          const payload = data.map((row) => ({
  
            ugroupid: ugroupidE,
            shopid: shopidE,
            uinfoemail: row["อีเมล์"],
            uinfoname: row["ชื่อ นามสกุล"],
            uinfologinname: row["ชื่อบัญชีผู้ใช้"],
            uinfologinpass: row["รหัสผ่าน"],
            level: row["สิทธิ์ใช้งาน"],
            details: row["รายละเอียด"]
            // productCgtyId: productCgtyIdImport,
          }))


          // console.log("payload >> ",payload);
          
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "X-API-KEY": config.apiKey,
          };
  
          await axios.post(`${config.apiUrl}/backoffice/importusers`, {
            shopid: shopidE,
            users: payload
          }, {
            headers
          }).then((response) => {
            
            if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "นำเข้าข้อมูลสำเร็จ",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }else if(response.status === 202){
              Swal.fire({
                icon: "warning",
                title: "นำเข้าข้อมูลไม่สำเร็จ",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }else if(response.status === 203){
              Swal.fire({
                icon: "warning",
                title: "ข้อมูลนำเข้ามีบัญชีผู้ใช้ที่มีอยู่แล้ว",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }else if(response.status === 204){
              Swal.fire({
                icon: "warning",
                title: "ข้อมูลนำเข้ามีอีเมล์ที่มีอยู่แล้ว",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }else if(response.status === 205){
              Swal.fire({
                icon: "warning",
                title: "ไม่มีร้านค้าที่ต้องการนำเข้าข้อมูล",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }else if(response.status === 206){
              Swal.fire({
                icon: "warning",
                title: "ไม่มีกลุ่มผู้ใช้ที่ต้องการนำเข้าข้อมูล",
                text: `ข้อมูลนำเข้า ${data.length} รายการ`,
                timer: 2000,
              });
            }
          })
  
          fetchData();
  
          // console.log("result >> ",payload.map((shop) => {
  
          //   const sopen = format(new Date(`2000-01-01 ${shop.shopopentime}`), 'HH:mm');
          //   const sclose = format(new Date(`2000-01-01 ${shop.shopclosetime}`), 'HH:mm');
          //   // const sexpiredate = format(new Date(`${shop.shopexpiredate} 00:00`), 'yyyy-MM-dd');
  
          //   shop.shopopentime = sopen;
          //   shop.shopclosetime = sclose;
          //   shop.shopexpiredate = convertDateToISO(shop.shopexpiredate);
  
          //   return {
          //     ...shop
          //   }
          // }));
  
          setIsLoading(false);
          handleCloseModal();

  
        },
        error: () => {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถอ่านไฟล์ CSV ได้",
          });
          setIsLoading(false);
        },
      });
    };
    
    // ฟังก์ชันสำหรับ Export CSV
    const handleExportCSV = async() => {
  
      try {
        
        setIsLoading(true);
        // console.log(productCgtyIdExport);
  
        // const categoryidE = categorylist.length > 0 ? 
        //   categorylist.filter((category: Category) => category.productCgtyId === productCgtyIdExport)[0]?.productCgtyId || "0"
        //   : "0";
        const ugroupidE = groupuseridExport;
        let shopidE = shopidExport;

        if(ugroupidE == "") {
          shopidE = "";
        }else if(ugroupidE == "0") {
          shopidE = "0";
        }

        // console.log("data >>"+ugroupidE+" "+shopidE);
        // console.log("data >>");
  
        const groupusernameE = usergroups.length > 0 ? 
          usergroups.filter((group: UserGroup) => group.ugroupid === ugroupidE)[0]?.ugroupname || "บัญชีผู้ใช้ทั้งหมด" : "บัญชีผู้ใช้ทั้งหมด";
  
        const shopnameE = shops.length > 0 ? 
          shops.filter((shop_) => shop_.shopid === shopidE)[0]?.shopnameth || "ร้านทั้งหมด" : "ร้านทั้งหมด";

        // console.log("name >>"+groupusernameE+" "+shopnameE);
  
        const headers = {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        };
  
        await axios.post(`${config.apiUrl}/backoffice/exportusers`, { ugroupid: ugroupidE, shopid: shopidE }, { headers: headers })

          .then(async(response) => {
            
            const usersExport: User[] = [];
  
            if (response.data.result.length > 0 ) {
              usersExport.push(...response.data.result);
            }
  
            await new Promise((resolve) => setTimeout(resolve, 100));
  
            if (!usersExport || usersExport.length === 0) {

              Swal.fire({
                icon: 'info',
                title: 'ไม่มีข้อมูล',
                text: 'ไม่มีข้อมูลบัญชีผู้ใช้สำหรับส่งออก',
                timer: 2000
              });
  
              setIsLoading(false);
              return;
            }
        
            const headersCSV = [
              "อีเมล์",
              "ชื่อ นามสกุล", 
              "ชื่อบัญชีผู้ใช้",
              "รหัสผ่าน",
              "สิทธิ์ใช้งาน",
              "รายละเอียด"
            ];
  
            const rows = usersExport.map((userE) => [
              escapeCSV(userE.uinfoemail),
              escapeCSV(userE.uinfoname),
              escapeCSV(userE.uinfologinname),
              escapeCSV(userE.uinfologinpass),
              escapeCSV(userE.level),
              escapeCSV(userE.details)

            ]);
        
            const csvContent = [
              headersCSV.join(','),
              ...rows.map(row => row.join(',')),
            ].join('\n');
        
            const dateStr = format(new Date(), 'yyyy-MM-dd'); // YYYY-MM-DD

            let filename = `${groupusernameE}_${shopnameE},_${dateStr}.csv`;

            if(ugroupidE === "0" && shopidE === "0") {

              filename = `ผู้ดูแลระบบ_${dateStr}.csv`;
            
            }else if(groupusernameE === "บัญชีผู้ใช้ทั้งหมด" && shopnameE === "ร้านทั้งหมด") {

              filename = `บัญชีผู้ใช้ทั้งหมด_${dateStr}.csv`;
            
            } 
  
            downloadCSV(csvContent, filename);
  
            setIsLoading(false);
  
          }).catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'ไม่สามารถโหลดข้อมูลได้',
              text: error,
            });
            setIsLoading(false);
          })
        } catch (error) {
  
          console.log(error);
  
          setIsLoading(false);
        }
      
    };
  
    // ฟังก์ชันสําหรับดาวน์โหลด CSV
    const downloadCSV = (csvContent: string, filename: string) => {
        // Add BOM for Excel compatibility with UTF-8 (especially Thai characters)
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { // Check if HTML5 download attribute is supported
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url); // Clean up the object URL
        } else {
            Swal.fire('ข้อผิดพลาด', 'เบราว์เซอร์ของคุณไม่รองรับการดาวน์โหลดไฟล์โดยตรง', 'error');
        }
    };

    // const handleGroupChange = (value: string) => {
    //   console.log("Selected Group:", value);
    // };

   // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (toUserGroupPage) {
    return (
      <>
      <div className="relative w-full flex flex-col gap-4 ">
            
      <button
        onClick={() => {
          setToUserGroupPage(false);
          fetchData();
        }}
        className="absolute mt-2 px-4 py-2 bg-[#009f4d] text-white rounded-md hover:border-[#3DA48F] hover:bg-[#3DA48F] transition-colors"
      >
        &larr; กลับไปที่หน้าบัญชีผู้ใช้
      </button>

      {/* <GategoryProductPage className='absolute top-10 w-full' shopid_={shopid} /> */}
      <UserGroupPage className='mt-10 w-full'/>

    </div>
      </>
    )
  }

  return (
    <div className="flex flex-col overflow-auto">

      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-xl md:text-2xl xl:text-4xl pt-4 font-bold">บัญชีผู้ใช้</p>
          <p className="text-xs md:text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/*table */}
      <div className="mt-2 overflow-auto">

        {/* table user */}
        <div className="w-[1325px] xl:w-full mt-0 bg-white p-4 rounded-lg shadow-sm">
          {/* header table */}
          <div className="flex flex-row justify-between items-center text-white">
            <div className="flex flex-row justify-between items-center p-4">
              <p className="text-lg xl:text-2xl font-bold text-black">
                รายการบัญชีผู้ใช้
              </p>
            </div>

            {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

            <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-6">

              <button
                className="btn"
                onClick={handleOpenCreate}
              >
                <i className="fa-solid fa-plus"></i> เพิ่มบัญชีผู้ใช้
              </button>

              {leveluser === "Admin" && (
                <button
                  className="btn w-[215px]"
                  onClick={() => setToUserGroupPage(true)}
                >
                  <i className="fa-solid fa-users"></i> จัดการกลุ่มบัญชีผู้ใช้
                </button>
              )}

              {leveluser !== "Employee" && (
                <button
                  className="btn w-[220px] xl:w-[220px] h-[40px] text-white rounded-md
                  flex flex-row justify-center items-center gap-x-2
                  "
                  onClick={handleOpenDataManagement} // ไปที่หน้าจัดการหมวดหมู่สินค้า
                >
                  <i className="fa-solid fa-database"></i>
                  <span className="">จัดการข้อมูลบัญชีผู้ใช้</span>
                </button>
              )}

              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Search for User ..."
                  className=" w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
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
          <div className="overflow-y-auto">
            <table className="text-[16px] p-2 xl:p-4 table-auto w-full text-center text-black">
              <thead className="border-b border-[#2B5F60] sticky top-0 bg-[#74d2e7]">
                <tr>
                  <th className="h-12 w-[150px]">ร้าน</th>
                  <th className="h-12 w-[150px]">กลุ่มบัญชีผู้ใช้</th>
                  <th className="h-12 w-[150px]">ชื่อ นามสกุล</th>
                  <th className="h-12 w-[190px]">User</th>
                  <th className="h-12 w-[130px]">สิทธิ์ใช้งาน</th>
                  <th className="h-12 w-[130px]">ดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user: User) => (
                    <tr
                      key={user.uinfoid}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 w-[100px]">{user.shopnameth}</td>
                      <td className="h-12 w-[100px]">{user.ugroupname}</td>
                      <td className="h-12 w-[100px]">{user.uinfoname}</td>
                      <td className="h-12 w-[100px]">{user.uinfologinname}</td>
                      <td className="h-12 w-[100px]">{user.level}</td>

                      {/* <td className='h-12 w-[100px]'>฿ {getRandomInt(100,3000).toFixed(2).toLocaleString()}</td>
                      <td className='h-12 w-[100px]'>{getRandomInt(100,1000)}</td> */}
                      <td className="h-12 w-[100px]">
                        <button
                          className="btn-edit mr-2"
                          onClick={() => handleEdit(user.uinfoid)}
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user.uinfoid)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-base text-black opacity-60"
                    >
                      ไม่มีข้อมูลบัญชีผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* แก้ไข */}
      <ModalXL
        title="แก้ไขบัญชีผู้ใช้"
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-h-[660px] md:max-h-[440px] w-[350px]  md:w-[700px]"
      >
        <div className="flex flex-col gap-2">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-2">
            {leveluser === "Admin" && (
              <div>
                <div>กลุ่มบัญชีผู้ใช้</div>

                <select
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                  value={ugroupId}
                  onChange={(e) => {

                    if(e.target.value == "0"){

                      setUgroupId(e.target.value)
                      setShopid(e.target.value)
                      setLevel("Admin")

                    }else{

                      setLevel("Owner");
                      setUgroupId(e.target.value)
                    }

                  }}
                >
                  <option value="0">ไม่ระบุกลุ่มบัญชีผู้ใช้</option>
                  {Array.isArray(usergroups) && usergroups.length > 0 ? (
                    usergroups.map((usergroup: UserGroup) => (
                      <option
                        key={usergroup.ugroupid}
                        value={usergroup.ugroupid}
                      >
                        {usergroup.ugroupname}
                      </option>
                    ))
                  ) : null}
                </select>
              </div>
            )}

            {(leveluser === "Admin" || leveluser === "Owner") && (
              <div>
                <div>ร้าน</div>
                <select
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                  value={shopid}
                  onChange={(e) => {
                    if(e.target.value == "0"){
                      setShopid(e.target.value)
                      setLevel("Owner")
                    }else{
                      setShopid(e.target.value)
                      setLevel("Employee")
                    }
                  }}
                >
                  <option value="0">ไม่ระบุร้านค้า</option>
                  {Array.isArray(shops) && shops.length > 0 ? (
                    shops
                      .filter((shop) => shop.ugroupid === ugroupId)
                      .map((shop: Shop) => (
                        <option key={shop.shopid} value={shop.shopid}>
                          {shop.shopnameth}
                        </option>
                      ))
                  ) : null}
                </select>
              </div>
            )}

            <div>
              <div>ชื่อ นามสกุล <span className="text-red-500">*</span></div>
              <input
                type="text"
                value={name}
                placeholder="กรุณากรอกชื่อ นามสกุล"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <div>อีเมล์ (ใช้สำหรับการรีเซ็ตรหัสผ่านใหม่) <span className="text-red-500">*</span></div>
              <input
                type="email"
                placeholder="กรุณากรอกอีเมล์"
                value={uinfoemail}
                onChange={(e) => setUinfoemail(e.target.value)}
              />
            </div>

            <div>
              <div>ชื่อบัญชีผู้ใช้ <span className="text-red-500">*</span></div>
              <input
                type="text"
                value={username}
                placeholder="กรุณากรอกชื่อบัญชีผู้ใช้"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <div>รหัสผ่าน <span className="text-red-500">*</span></div>

              <div className="relative">
                <input
                  placeholder="กรุณากรอกรหัสผ่าน"
                  type={isPasswordVisible ? "text" : "password"} // Toggle between text and password
                  value={userpassword}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-[#2B5F60] rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibility
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {isPasswordVisible ? (
                    <i className="fa-solid fa-eye-slash"></i> // Eye-slash icon for hidden
                  ) : (
                    <i className="fa-solid fa-eye"></i> // Eye icon for visible
                  )}
                </button>
              </div>
            </div>

            <div>
              <div>สิทธิ์ใช้งาน <span className="text-red-500">*</span></div>
              {/* <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} /> */}
              <select
                className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {
                  // ไม่ระบุกลุ่มผู้ใช้งาน ไม่ระบุร้านค้า
                  ((ugroupId === "0" && shopid === "0")
                    ? userAccountRights.filter(
                      (userAccount: UserAccountRight) =>
                        userAccount.level !== "Owner" &&
                        userAccount.level !== "Employee" &&
                        userAccount.level !== "Manager"
                      )

                    // เลือกกลุ่มผู้ใช้งาน ไม่ระบุร้านค้า
                    : ((shopid === "0")
                      ? userAccountRights.filter(
                        (userAccount: UserAccountRight) =>
                          userAccount.level !== "Admin" &&
                          userAccount.level !== "Employee" &&
                          userAccount.level !== "Manager"
                        )
                      : (userAccountRights.filter(
                        (userAccount: UserAccountRight) =>
                          userAccount.level !== "Admin" && 
                          userAccount.level !== "Owner"
                      ))
                    )

                  // filter ตามสิทธิ์ users
                  // ไม่ใช่ Admin
                  .filter(
                    (userAccount: UserAccountRight) =>
                      leveluser === "Admin" ||
                      (userAccount.level !== "Admin" && leveluser !== "Admin")
                  ))
                  // ไม่ใช่ Owner
                  .filter(
                    (userAccount: UserAccountRight) =>
                      leveluser === "Admin" || leveluser === "Owner" ||
                      (userAccount.level !== "Owner" && leveluser !== "Owner")
                  )

                  .map((userAccount: UserAccountRight) => (

                    <option key={userAccount.level} value={userAccount.level}>
                      {userAccount.level}
                    </option>

                  ))
                }
              </select>
            </div>
          </div>

          <div className="mt-2">
            <button className="btn mr-2" onClick={handleEditSave}>
              <i className="fa-solid fa-save mr-2"></i>
              บันทึก
            </button>
          </div>
        </div>
      </ModalXL>

      {/* สร้าง */}
      <ModalXL
        title="เพิ่มบัญชีผู้ใช้"
        isOpen={isOpenCreate}
        onClose={handleCloseModal}
        className="max-h-[660px] md:max-h-[440px] w-[350px]  md:w-[700px]"
      >
        <div className="flex flex-col gap-2">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-2">

            {leveluser === "Admin" && (
              <div>
                <div>กลุ่มบัญชีผู้ใช้ </div>

                <select
                  value={ugroupId}
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                  onChange={(e) => {

                    if(e.target.value == "0"){

                      setUgroupId(e.target.value)
                      setShopid(e.target.value)
                      setLevel("Admin")

                    }else{

                      setLevel("Owner");
                      setUgroupId(e.target.value)
                    }

                  }}
                >
                  <option value="0">ไม่ระบุกลุ่มบัญชีผู้ใช้</option>
                  {Array.isArray(usergroups) && usergroups.length > 0 ? (
                    usergroups.map((usergroup: UserGroup) => (
                      <option
                        key={usergroup.ugroupid}
                        value={usergroup.ugroupid}
                      >
                        {usergroup.ugroupname}
                      </option>
                    ))
                  ) : null}
                </select>
              </div>
            )}

            {/* {createugroup && (
                <div>

                  <div className='text-opacity-30'>ตั้งชื่อกลุ่มบัญชีผู้ใช้</div>
                  <input type='text' value={ugroupname} onChange={(e) => setGroupname(e.target.value)}></input>
                  
                  <div>รายละเอียดสิทธิพิเศษกลุ่ม</div>
                  <input type='text' value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)}></input>
    
                  <div>หมายเหตุ</div>
                  <input type='text' value={ugroupremark} onChange={(e) => setGroupremark(e.target.value)}></input>
                
                </div>
              )} */}

            {(leveluser === "Admin" || leveluser === "Owner") && (
              <div>
                <div>ร้าน</div>
                <select
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                  value={shopid}
                  onChange={(e) => {
                    
                    if(e.target.value == "0"){
                      setShopid(e.target.value)
                      setLevel("Owner")
                    }else{
                      setShopid(e.target.value)
                      setLevel("Employee")
                    }
                  }}
                >
                  <option value="0">ไม่ระบุร้านค้า</option>
                  {Array.isArray(shops) && shops.length > 0 ? (
                    shops
                      .filter((shop) => shop.ugroupid === ugroupId)
                      .map((shop: Shop) => (
                        <option key={shop.shopid} value={shop.shopid}>
                          {shop.shopnameth}
                        </option>
                      ))
                  ) : null}
                </select>
              </div>
            )}

            <div>
              <div>ชื่อ นามสกุล <span className="text-red-500">*</span></div>
              <input
                placeholder="กรุณากรอกชื่อ นามสกุล"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <div>อีเมล์ (ใช้สำหรับการรีเซ็ตรหัสผ่านใหม่) <span className="text-red-500">*</span></div>
              <input
                placeholder="กรุณากรอกอีเมล์"
                type="email"
                value={uinfoemail}
                onChange={(e) => setUinfoemail(e.target.value)}
              />
            </div>

            <div>
              <div>ชื่อบัญชีผู้ใช้ <span className="text-red-500">*</span></div>
              <input
                type="text"
                placeholder="กรุณากรอกชื่อบัญชีผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <div>รหัสผ่าน <span className="text-red-500">*</span></div>
              <div className="relative">
                <input
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className="w-full p-2 border border-[#2B5F60] rounded-md"
                  type={isPasswordVisible ? "text" : "password"} // Toggle between text and password
                  value={userpassword}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibility
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {isPasswordVisible ? (
                    <i className="fa-solid fa-eye-slash"></i> // Eye-slash icon for hidden
                  ) : (
                    <i className="fa-solid fa-eye"></i> // Eye icon for visible
                  )}
                </button>
              </div>
            </div>

            <div>
              <div>สิทธิ์ใช้งาน <span className="text-red-500">*</span></div>
              {/* <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} /> */}

              <select
                className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {
                  // ไม่ระบุกลุ่มผู้ใช้งาน ไม่ระบุร้านค้า
                  ((ugroupId === "0" && shopid === "0")
                    ? userAccountRights.filter(
                      (userAccount: UserAccountRight) =>
                        userAccount.level !== "Owner" &&
                        userAccount.level !== "Employee" &&
                        userAccount.level !== "Manager"
                      )

                    // เลือกกลุ่มผู้ใช้งาน ไม่ระบุร้านค้า
                    : ((shopid === "0")
                      ? userAccountRights.filter(
                        (userAccount: UserAccountRight) =>
                          userAccount.level !== "Admin" &&
                          userAccount.level !== "Employee" &&
                          userAccount.level !== "Manager"
                        )
                      : (userAccountRights.filter(
                        (userAccount: UserAccountRight) =>
                          userAccount.level !== "Admin" && 
                          userAccount.level !== "Owner"
                      ))
                    )

                  // filter ตามสิทธิ์ users
                  // ไม่ใช่ Admin
                  .filter(
                    (userAccount: UserAccountRight) =>
                      leveluser === "Admin" ||
                      (userAccount.level !== "Admin" && leveluser !== "Admin")
                  ))
                  // ไม่ใช่ Owner
                  .filter(
                    (userAccount: UserAccountRight) =>
                      leveluser === "Admin" || leveluser === "Owner" ||
                      (userAccount.level !== "Owner" && leveluser !== "Owner")
                  )

                  .map((userAccount: UserAccountRight) => (

                    <option key={userAccount.level} value={userAccount.level}>
                      {userAccount.level}
                    </option>

                  ))
                
                  // : (
                  //   <option value="">ไม่มีข้อมูลสิทธิ์ใช้งาน</option> // Fallback if shops array is empty
                  // )
                }
              </select>
            </div>
          </div>

          <div className="mt-2 border-t-2 border-gray-300 pt-2">
            <button className="btn mr-2" onClick={handleCreate}>
              <i className="fa-solid fa-save mr-2"></i>
              เพิ่ม
            </button>
          </div>
        </div>
      </ModalXL>

      {/* import export */}
      <ModalXL
        title="จัดการข้อมูลบัญชีผู้ใช้"
        isOpen={isOpenDataManagement}
        onClose={handleCloseModal}
        className="max-h-[600px] md:max-h-[800px]"
      >
        <div className="flex flex-col w-[320px] md:w-[550px] md:gap-x-4 gap-y-2 my-2">
            
          {/* Export */}
          <div>
            <p>ส่งออกข้อมูลบัญชีผู้ใช้เป็นรูปแบบ CSV</p>

            <div className='flex flex-col md:flex-row mt-2 gap-y-2 md:gap-x-4'>

              {leveluser === "Admin" && (
                <div>
                  {/* <div>กลุ่มบัญชีผู้ใช้ </div> */}

                  <select
                    className="w-[200px]  h-[42px] border border-[#2B5F60] rounded-md p-2"
                    value={groupuseridExport}
                    onChange={(e) => setGroupuseridExport(e.target.value)}
                  >
                    {Array.isArray(usergroups) && usergroups.length > 0 ? 
                      (<>
                        {leveluser === "Admin" && <option value="0">ผู้ดูแลระบบ</option>}
                        <option value="">กลุ่มบัญชีผู้ใช้ทั้งหมด</option>
                        {(
                          usergroups.map((usergroup: UserGroup) => (
                            <option
                              key={usergroup.ugroupid}
                              value={usergroup.ugroupid}
                            >
                              {usergroup.ugroupname}
                            </option>
                          ))
                        )}
                      </>
                      ) : (
                        <option value="">ไม่มีข้อมูลกลุ่มบัญชีผู้ใช้</option> // Fallback if group array is empty
                      )
                    }
                  </select>
                </div>
              )}

              {(leveluser === "Admin" || leveluser === "Owner") && (
                <div>
                  {/* <div>ร้าน</div> */}
                  <select
                    className="w-[200px] h-[42px] border border-[#2B5F60] rounded-md p-2"
                    value={shopidExport}
                    onChange={(e) => setShopidExport(e.target.value)}
                  >
                    {Array.isArray(shops) && shops.length > 0 ? (
                      <>
                        
                        <option value="">ร้านค้าทั้งหมด</option>
                        {shops
                        .filter((shop) => shop.ugroupid === groupuseridExport)
                        .map((shop: Shop) => (
                          <option key={shop.shopid} value={shop.shopid}>
                            {shop.shopnameth}
                          </option>
                        ))}

                      </>
                    ) : (
                      <option value="">ไม่มีข้อมูลร้านค้า</option> // Fallback if shops array is empty
                    )}
                  </select>
                </div>
              )}


            </div>

            <button 
              className='btn w-[150px] h-[40px] p-1 mt-2'
              onClick={() => handleExportCSV()}
            >

              <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> 
              <span className='text-[16px]'>Export CSV</span>

            </button>
          </div>

          <hr className='text-5xl my-2'/>

          {/* import */}
          <div>
              <p>นำเข้าข้อมูลบัญชีผู้ใช้เป็นรูปแบบ CSV</p>

              <div className='flex flex-col md:flex-row mt-2 gap-y-2  md:gap-x-4'>

                {leveluser === "Admin" && (
                <div>
                  {/* <div>กลุ่มบัญชีผู้ใช้ </div> */}

                  <select
                    className="w-[200px] h-[42px] border border-[#2B5F60] rounded-md p-2"
                    value={groupuseridImport}
                    onChange={(e) => setGroupuseridImport(e.target.value)}
                  >
                    {leveluser === "Admin" && <option value="0">ผู้ดูแลระบบ</option>}
                    {Array.isArray(usergroups) && usergroups.length > 0 ? (
                      usergroups.map((usergroup: UserGroup) => (
                        <option
                          key={usergroup.ugroupid}
                          value={usergroup.ugroupid}
                        >
                          {usergroup.ugroupname}
                        </option>
                      ))
                    ) : (
                      <option value="">ไม่มีข้อมูลกลุ่มบัญชีผู้ใช้</option> // Fallback if group array is empty
                    )}
                  </select>
                </div>
              )}

              {/* {createugroup && (
                  <div>

                    <div className='text-opacity-30'>ตั้งชื่อกลุ่มบัญชีผู้ใช้</div>
                    <input type='text' value={ugroupname} onChange={(e) => setGroupname(e.target.value)}></input>
                    
                    <div>รายละเอียดสิทธิพิเศษกลุ่ม</div>
                    <input type='text' value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)}></input>
      
                    <div>หมายเหตุ</div>
                    <input type='text' value={ugroupremark} onChange={(e) => setGroupremark(e.target.value)}></input>
                  
                  </div>
                )} */}

              {(leveluser === "Admin" || leveluser === "Owner") && (
                <div>
                  {/* <div>ร้าน</div> */}
                  <select
                    className="w-[200px] h-[42px] border border-[#2B5F60] rounded-md p-2"
                    value={shopidImport}
                    onChange={(e) => setShopidImport(e.target.value)}
                  >
                    <option value="0">ไม่ระบุร้านค้า</option>
                    {Array.isArray(shops) && shops.length > 0 ? (
                      shops
                        .filter((shop) => shop.ugroupid === groupuseridImport)
                        .map((shop: Shop) => (
                          <option key={shop.shopid} value={shop.shopid}>
                            {shop.shopnameth}
                          </option>
                        ))
                    ) : (
                      <option value="">ไม่มีข้อมูลร้านค้า</option> // Fallback if shops array is empty
                    )}
                  </select>
                </div>
              )}
                </div>

              <input 
                className='w-full p-1 mt-2 border-[#009f4d]' 
                type="file" 
                accept=".csv" 
                onChange={e => {
                  if (e.target.files?.[0]) setImportFile(e.target.files[0]);
                }}
              />

            {/* <div className="w-full mt-2 border-t-2 border-gray-300 pt-2 flex flex-row justify-start items-center"> */}
              <button className="btn mt-2 mr-2" 
                onClick={handleImportCSV}
              >
                <i className="fa-solid fa-file-import mr-2"></i>
                Import CSV 
              </button>
            {/* </div> */}
          </div>

        </div>

      </ModalXL>

    </div>
  );
}
