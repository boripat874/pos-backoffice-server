"use client"

import React, { useEffect, useState, useCallback , useRef } from 'react'
import axios from "axios";
import { config } from "@/app/lib/config";
import Swal from "sweetalert2";
// import Modal from "@/app/modal";
import ModalWauto  from '@/app/modalW-Auto';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from "../../components/LoadingSpinner"
import Image from 'next/image';
import Papa from "papaparse";
import escapeCSV from '@/app/components/escapeCSV';
import { format } from 'date-fns';

// import { useRouter } from "next/navigation";

interface GroupUser {
  ugroupid: string;
  ugroupname: string;
}

interface shopslot{
  shopid: string;
  slotid: string;
  slottimestart: string;
  slottimeend: string;
  status: boolean;
  slotcapacity: number
}

export default function ShopPage() {

  function convertDateToISO(dateStr: string) {
    // รองรับทั้ง 1/1/2021 และ 01/01/2021
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) return dateStr;
    // เติม 0 ข้างหน้าให้ครบ 2 หลัก
    const mm = month.toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const [importFile, setImportFile] = useState<File | null>(null);

  interface Shop {
    shopid: string;
    merid: string;
    shoptype: string
    shopnameth: string;
    shopnameeng: string;
    shopopentime: string;
    shopclosetime: string;
    shopexpiredate: string;
    shopdata1: string;
    shopdata2: string;
    logo?: File | null; // เปลี่ยนเป็น File หรือ null
    shoplogoimage?: string;
    ugroupid: string;
    status?: boolean;
  };

  const shoptypedatalist = [
    { value: "FOOD", label: "อาหาร" },
    { value: "SOUVENIRS", label: "ของฝาก" },
  ];

  const [level, setLevel] = useState('');

  const [uinfologinname, setUinfologinname] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState('-');
  const [shops, setShops] = useState<Shop[]>([]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenSetSlot, setIsOpenSetSlot] = useState(false);
  const [isOpenDataManagement, setIsOpenDataManagement] = useState(false);
  
  const [shopid, setShopid] = useState("");
  const [merid, setMerid] = useState("");
  const [shoptype, setShoptype] = useState("");
  const [shopnameth, setShopnameth] = useState("");
  const [shopnameeng, setShopnameeng] = useState("");
  const [shopopentime, setShopopentime] = useState("08:00");
  const [shopclosetime, setShopclosetime] = useState("17:00");
  const [shopexpiredate, setShopexpiredate] = useState("2021-01-30");
  const [shopdata1, setShopdata1] = useState("");
  const [shopdata2, setShopdata2] = useState("");
  const [logo, setLogo] = useState<File | null>(null); // สร้าง state สำหรับเก็บไฟล์รูปภาพ
  const [imagePath, setImagePath] = useState('');

  const [totalPages, setTotalPages] = useState(1); // จำนวนหน้าทั้งหมด
  // const [shoplistcount, setShoplistcount] = useState(0); // จำนวนข้อมูลทั้งหมด
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน

  const [search, setSearch] = useState(""); // เก็บคำค้นหา
  
  const page = 1; // หน้าปัจจุบัน
  const limit = 10; // หน้าปัจจุบัน
  
  const currentPageRef = useRef(currentPage);
  const currentLimitRef = useRef(limit);
  const currentSearchRef = useRef(search);

  const [groupuserlist, setGroupuserlist] = useState<GroupUser[]>([]);
  const [ugroupid, setUgroupid] = useState("");

  const [slotlist, setSlotlist] = useState<shopslot[]>([]);

  const [ugroupidExport, setugroupidExport] = useState("");
  const [ugroupidImport, setugroupidImport] = useState("");

  const [shoptypeExport, setshoptypeExport] = useState("");
  const [shoptypeImport, setshoptypeImport] = useState("");

  // const [shoplotupdate, setShoplotupdate] = useState<shopslot[]>([]);
  useEffect(() => {

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

    fetchDataFirst(); // เรียกข้อมูลเมื่อ component โหลดครั้งแรก

    // อัปเดตเวลา
    const intervalId = setInterval(() => {
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

  // console.log("setTotalPages >> ",totalPages);
  // ฟังก์ชันสําหรับดึงข้อมูล
  // Wrap fetchData in useCallback
  const fetchDataFirst = async () => {
    try {
        setIsLoading(true);

        const headers = {
            'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }

        await axios.get(`${config.apiUrl}/backoffice/userinfo`, {
          headers
        }).then(async (response) => {
            setUinfologinname(response.data.uinfologinname || '');
            setLevel(response.data.level || '');
            // console.log(response.data);
        });

        const currentPageR = currentPageRef.current;
        const currentLimitR = currentLimitRef.current;
        const currentSearchR = currentSearchRef.current;

        await axios.get(`${config.apiUrl}/backoffice/shoplist`, {
          params: {
            page: currentPageR, // ระบุหน้าที่ต้องการดึงข้อมูล
            limit: currentLimitR, // ระบุจำนวนรายการต่อหน้า
            search: currentSearchR, // ส่งคำค้นหาไปยัง API
          },
          headers
        }).then(async (response) => {

          // console.log(response.data);
          const updatedShops: Shop[] = [...response.data.result]; // สร้างสำเนาของ array

          for (let i = 0; i < updatedShops.length; i++) {

            const element = updatedShops[i];
 
            const productsresponse = await axios.post(
                `${config.apiUrl}/backoffice/shopdetail`,
                { shopid: element.shopid },
                {
                  headers
                }
            );
            updatedShops[i] = productsresponse.data;
          }

          setShops(updatedShops);
          // console.log(response.data);

          // อัปเดตจำนวนหน้าทั้งหมด
          const count = response.data.total; // จำนวนข้อมูลทั้งหมดจาก API
          // setShoplistcount(count); // อัปเดตจำนวนข้อมูลทั้งหมด
          setTotalPages(Math.ceil(count / limit)); // คำนวณจำนวนหน้าทั้งหมด

          await fetchGroupuser(); // ดึงข้อมูลของ group user

          setIsLoading(false);
        });

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
  };

  const fetchData = useCallback(async () => {
    try {
        setIsLoading(true);

        const headers = {
            'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }

        await axios.get(`${config.apiUrl}/backoffice/userinfo`, {
          headers
        }).then(async (response) => {
            setUinfologinname(response.data.uinfologinname || '');
            setLevel(response.data.level || '');
            // console.log(response.data);
        });

        const currentPageR = currentPageRef.current;
        const currentLimitR = currentLimitRef.current;
        const currentSearchR = currentSearchRef.current;

        await axios.get(`${config.apiUrl}/backoffice/shoplist`, {
          params: {
            page: currentPageR, // ระบุหน้าที่ต้องการดึงข้อมูล
            limit: currentLimitR, // ระบุจำนวนรายการต่อหน้า
            search: currentSearchR, // ส่งคำค้นหาไปยัง API
          },
          headers
        }).then(async (response) => {

          // console.log(response.data);
          const updatedShops: Shop[] = [...response.data.result]; // สร้างสำเนาของ array

          for (let i = 0; i < updatedShops.length; i++) {

            const element = updatedShops[i];
 
            const productsresponse = await axios.post(
                `${config.apiUrl}/backoffice/shopdetail`,
                { shopid: element.shopid },
                {
                  headers
                }
            );
            updatedShops[i] = productsresponse.data;
          }

          setShops(updatedShops);
          // console.log(response.data);

          // อัปเดตจำนวนหน้าทั้งหมด
          const count = response.data.total; // จำนวนข้อมูลทั้งหมดจาก API
          // setShoplistcount(count); // อัปเดตจำนวนข้อมูลทั้งหมด
          setTotalPages(Math.ceil(count / limit)); // คำนวณจำนวนหน้าทั้งหมด

          await fetchGroupuser(); // ดึงข้อมูลของ group user

          setIsLoading(false);
        });

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
  }, [search,limit,page]);

  const fetchGroupuser = async () => {

    setIsLoading(true);

    try {

      await axios.get(`${config.apiUrl}/backoffice/groupshoplist`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      }).then(async (response) => {

        setGroupuserlist(response.data.result);
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

  }

  // ฟังก์ชันสําหรับสุ่มเลข
  // function getRandomInt(min: number, max: number) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  // }

  // ฟังก์ชันสําหรับเปิด/ปิด modal
  const handleOpenModal = () => {
    setIsOpen(true);
    setIsOpenCreate(false);
  }

  // ฟังก์ชันสําหรับเปิด/ปิด modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setIsOpenCreate(false);
    setIsOpenSetSlot(false);
    setIsOpenDataManagement(false);
  }

  // ฟังก์ชันสําหรับเปิด/ปิด modal
  const handleEdit = async(shopid: string) => {

    setIsLoading(true);

    await fetchGroupuser(); // ดึงข้อมูลของ group user

    const shop: Shop | undefined = shops.find(
      (shop: Shop) => shop.shopid === shopid
    );

    if (shop) {
      setShopid(shop.shopid ?? "");
      setMerid(shop.merid ?? "");
      setShoptype(shop.shoptype ?? "");
      setShopnameth(shop.shopnameth ?? "");
      setShopnameeng(shop.shopnameeng ?? "");
      setShopopentime(shop.shopopentime ?? "");
      setShopclosetime(shop.shopclosetime ?? "");
      setShopexpiredate(shop.shopexpiredate ?? "");
      setShopdata1(shop.shopdata1 ?? "");
      setShopdata2(shop.shopdata2 ?? "");
      setImagePath(shop.shoplogoimage ?? "");
      setUgroupid(shop.ugroupid ?? "");

      handleOpenModal();
    } else {
      // Handle the case where no shop is found
      console.error(`Shop with ID ${shopid} not found.`);
      // Or show a user-friendly error message:
      // Swal.fire({
      //     icon: 'error',
      //     title: 'Shop Not Found',
      //     text: `Shop with ID ${shopid} does not exist.`,
      // });
    }

    setIsLoading(false);
  };

  // ฟังก์ชันสําหรับบันทึกการแก้ไข
  const handleEditSave = async () => {
    try {

      if(shopnameth === '' || shopnameth === null){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อร้านค้าภาษาไทย",
          text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          timer: 2000
        });
        return;
      }else if(shopnameeng === '' || shopnameeng === null){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อร้านค้าภาษาอังกฤษ",
          text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          timer: 2000
        });
        return; 
      }

      setIsLoading(true);
        const payload:Shop = {
            shopid: shopid,
            merid: merid, 
            shoptype: shoptype,
            shopnameth: shopnameth,
            shopnameeng: shopnameeng,
            shopopentime: shopopentime,
            shopclosetime: shopclosetime,
            shopexpiredate: shopexpiredate,
            shopdata1: shopdata1,
            shopdata2: shopdata2,
            shoplogoimage: imagePath,
            logo: logo || null, // เพิ่มไฟล์รูปภาพใน payload
            ugroupid: ugroupid
        }

        await axios.put(`${config.apiUrl}/backoffice/shopdetailupdate`, payload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-API-KEY': config.apiKey,
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          }
        ).then(async () => {
          Swal.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลเรียบร้อย',
            text: 'ข้อมูลถูกบันทึกเรียบร้อย',
            timer: 2000
          });
        });

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
      setIsLoading(false);
    }
  }

  // ฟังก์ชันสําหรับเปิด modal
  const handleOpenCreate = async() => {


    await fetchGroupuser(); // ดึงข้อมูลของ group user

    await handleClear();

    setIsOpenCreate(true);
  }

  // ฟังก์ชันสําหรับสร้าง shop
  const handleCreate = async () => {
    try {

      if(shopnameth === '' || shopnameth === null){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อร้านค้าภาษาไทย",
          text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          timer: 2000
        });
        return;
      }else if(shopnameeng === '' || shopnameeng === null){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อร้านค้าภาษาอังกฤษ",
          text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          timer: 2000
        });
        return; 
      }
      setIsLoading(true);
      // let uuid = uuidv4();
      // if (!logo) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'ผิดพลาด',
      //     text: 'กรุณาเลือกไฟล์รูปภาพ',
      //   });
      //   return;
      // }

      const payload:Shop = {
        shopid: uuidv4(),
        merid: uuidv4(), 
        shoptype: shoptype,
        shopnameth: shopnameth,
        shopnameeng: shopnameeng,
        shopopentime: shopopentime,
        shopclosetime: shopclosetime,
        shopexpiredate: shopexpiredate,
        shopdata1: shopdata1,
        shopdata2: shopdata2,
        logo: logo, // เพิ่มไฟล์รูปภาพใน payload
        ugroupid: ugroupid
      }

    await axios.post(`${config.apiUrl}/backoffice/shopcreate`, payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
    });

    await handleClear();
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
      setIsLoading(false);
  } 

  // ฟังก์ชันสําหรับลบ
  const handleDelete = async (shopid: string) => {

    // แสดงกล่องข้อความยืนยันก่อนลบ
    const result = await Swal.fire({
      title: 'ยืนยันการลบร้านค้านี้?',
      // text: 'คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้?',
      icon: 'warning',
      input: 'password', // ให้ผู้ใช้กรอกรหัสผ่าน
      inputLabel: 'กรุณาใส่รหัสผ่านสำหรับยืนยันการลบ',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2B5F60',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });

    // หากผู้ใช้กดยืนยัน
    if (result.isConfirmed) {
      setIsLoading(true);
      
      try {

        // const statusconfirm = false;
        
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
  
        const statusconfirm = await axios
          .post(
            `${config.apiUrl}/backoffice/confirmaction`,
            {
              uinfologinname: uinfologinname,
              uinfologinpass: result.value
            },
            {
              headers,
            }
          );
  
        if (statusconfirm.status === 200) {

          const payload = {
            shopid: shopid
          }
            
          await axios.delete(`${config.apiUrl}/backoffice/shopdelete`,
          {
            headers,
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
          Swal.fire('รหัสไม่ถูกต้อง', 'กรุณากรอกรหัสให้ถูกต้อง', 'warning');
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
    }
  }

  // ฟังก์ชันสําหรับล้างข้อความใน modal
  const handleClear = async() => {

    setShoptype('');
    setShopnameth('');
    setShopnameeng('');
    setShopopentime("08:00");
    setShopclosetime('17:00');
    setShopexpiredate("2021-01-30");
    setShopdata1('');
    setShopdata2('');
    setLogo(null); // รีเซ็ตค่า logo เป็น null
    setUgroupid(groupuserlist[0].ugroupid);
  }

  // ฟังก์ชันสําหรับอัพโหลดไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]); // เก็บไฟล์รูปภาพใน state
    }
  };

  const handleSetup = async (shopid: string) => {
      // setIsOpenSetSlot(true);
    fetchslot(shopid);
  }

  const fetchslot = async (shopid: string) => {

    try {
      setIsLoading(true);
      setShopid(shopid);

      const payload = {
        shopid: shopid
      }

      await axios.post(`${config.apiUrl}/backoffice/slotlist`, payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        },
      ).then(async (response) => {
        console.log("slot",response.data);

        setSlotlist(response.data.result);

        setIsOpenSetSlot(true);

      })

    }catch (err: unknown) {
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
  }

  const shopslotsave = async () => {

    try {
      setIsLoading(true);

      const payload = {
        shopid: shopid,
        slotdata: slotlist
      }

      await axios.put(`${config.apiUrl}/backoffice/slotupdate`, payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        },
      ).then(async () => {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลเรียบร้อย',
          text: 'ข้อมูลถูกบันทึกเรียบร้อย',
          timer: 2000
        });
      })

      handleCloseModal();
      fetchData();

    }catch (err: unknown) {
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
  }

  const handleRestore = async (shopid: string) => {

    try {
      const result = await Swal.fire({
        title: 'กู้คืนข้อมูลร้านค้านี้?',
        icon: 'warning',
        input: 'password', // ให้ผู้ใช้กรอกรหัสผ่าน
        inputLabel: 'กรุณาใส่รหัสผ่านสำหรับยืนยันการลบ',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#2B5F60',
        confirmButtonText: 'กู้คืน',
        cancelButtonText: 'ยกเลิก',
      })

      if(result.isConfirmed){

        
        setIsLoading(true);
  
        const headers= {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
  
        const payload = {
          shopid: shopid
        }

        const statusconfirm = await axios
          .post(
            `${config.apiUrl}/backoffice/confirmaction`,
            {
              uinfologinname: uinfologinname,
              uinfologinpass: result.value
            },
            {
              headers,
            }
          );
  
        if (statusconfirm.status === 200) {

          // ดําเนินการเมื่อยืนยันสําเร็จ
          await axios.put(`${config.apiUrl}/backoffice/shoprestore`, payload,
            {
              headers
            },
          ).then(async () => {
            Swal.fire({
              icon: 'success',
              title: 'กู้คืนข้อมูลเรียบร้อย',
              text: '',
              timer: 2000
            });
          })
        }
        
    
        handleCloseModal();
        fetchData();
      }
      }catch (err: unknown) {
        if (err instanceof Error) {
          Swal.fire('รหัสไม่ถูกต้อง', 'กรุณากรอกรหัสให้ถูกต้อง', 'warning');
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
      
    
  }

  // เปิดหน้าต่างสําหรับการจัดการข้อมูล
  const handleOpenDataManagement = async() => {

    setugroupidExport(groupuserlist[0].ugroupid);
    setugroupidImport(groupuserlist[0].ugroupid);

    setshoptypeExport(shoptypedatalist[0].value);
    setshoptypeImport(shoptypedatalist[0].value);

    setIsOpenDataManagement(true);
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
          "ชื่อร้านค้าภาษาไทย", 
          "ชื่อร้านค้าภาษาอังกฤษ",
          "เวลาเปิดร้าน",
          "เวลาปิดร้าน",
          "เวลาหมดอายุ",
          "ข้อมูลร้านค้า 1",
          "ข้อมูลร้านค้า 2"
        ];

        const fileHeaders = results.meta.fields || [];
        const missingHeaders = requiredHeaders.filter(
          (header) => !fileHeaders.includes(header)
        );

        if (missingHeaders.length > 0) {
          Swal.fire({
            icon: "error",
            title: "หัวข้อไม่ถูกต้อง",
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
            title: "ลำดับหัวข้อไม่ถูกต้อง",
            text: `กรุณาเรียงลำดับหัวข้อในไฟล์ CSV ให้ตรงกับ: ${requiredHeaders.join(", ")}`,
          });
          setIsLoading(false);
          return;
        }

        // 4. ข้อมูลต้องไม่ว่าง
        const invalidRows = data.filter(
          (row) =>
            !row["ชื่อร้านค้าภาษาไทย"]?.trim() ||
            !row["ชื่อร้านค้าภาษาอังกฤษ"]?.trim() ||
            !row["เวลาเปิดร้าน"]?.trim() ||
            !row["เวลาปิดร้าน"]?.trim() ||
            !row["เวลาหมดอายุ"]?.trim() 

        );
        if (invalidRows.length > 0) {

          Swal.fire({
            icon: "error",
            title: "ข้อมูลไม่ครบถ้วน",
            text: "ชื่อร้านค้าภาษาไทย,ชื่อร้านค้าภาษาอังกฤษ,เวลาเปิดร้าน,เวลาปิดร้าน,เวลาหมดอายุ, จะต้องไม่ว่าง!",
          });
          setIsLoading(false);
          return;
        }

        // เวลาเปิด/ปิดร้านต้องเป็นรูปแบบ HH:mm หรือ HH:mm:ss
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        const invalidTimeRows = data.filter(
          (row) =>
            !timeRegex.test(row["เวลาเปิดร้าน"].trim()) ||
            !timeRegex.test(row["เวลาปิดร้าน"].trim())
        );
        if (invalidTimeRows.length > 0) {

          Swal.fire({
            icon: "error",
            title: "ข้อมูลไม่ถูกต้อง",
            text: "เวลาเปิด/ปิดร้านต้องเป็นรูปแบบ HH:mm",
          });
          setIsLoading(false);
          return;
        }

        // ตรวจสอบรูปแบบเวลาหมดอายุ
        const expireDateRegex1 = /^\d{4}-\d{2}-\d{2}$/;      // yyyy-mm-dd
        const expireDateRegex2 = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // dd/mm/yyyy หรือ d/m/yyyy

        const invalidExpireRows = data.filter(
          (row) =>
            !row["เวลาหมดอายุ"]?.trim() ||
            (
              !expireDateRegex1.test(row["เวลาหมดอายุ"].trim()) &&
              !expireDateRegex2.test(row["เวลาหมดอายุ"].trim())
            )
        );

        if (invalidExpireRows.length > 0) {
          Swal.fire({
            icon: "error",
            title: "ข้อมูลไม่ถูกต้อง",
            text: "เวลาหมดอายุ ต้องเป็นรูปแบบ yyyy-mm-dd หรือ dd/mm/yyyy",
          });
          setIsLoading(false);
          return;
        }

        // console.log(data);

        // ส่งข้อมูลจากไฟล์ CSV
        const payload = data.map((row) => ({

          ugroupid: ugroupidImport,
          shoptype: shoptypeImport,
          shopnameth: row["ชื่อร้านค้าภาษาไทย"],
          shopnameeng: row["ชื่อร้านค้าภาษาอังกฤษ"],
          shopopentime: row["เวลาเปิดร้าน"],
          shopclosetime: row["เวลาปิดร้าน"],
          shopexpiredate: row["เวลาหมดอายุ"],
          shopdata1: row["ข้อมูลร้านค้า 1"],
          shopdata2: row["ข้อมูลร้านค้า 2"],
          // productCgtyId: productCgtyIdImport,
        }))

        const shopresult = payload.map((shop) => {
          const sopen = format(new Date(`2000-01-01 ${shop.shopopentime}`), 'HH:mm');
          const sclose = format(new Date(`2000-01-01 ${shop.shopclosetime}`), 'HH:mm');
          // const sexpiredate = format(new Date(`${shop.shopexpiredate} 00:00`), 'yyyy-MM-dd');

          shop.shopopentime = sopen;
          shop.shopclosetime = sclose;
          shop.shopexpiredate = convertDateToISO(shop.shopexpiredate);

          return {
            ...shop
          }
        })

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "X-API-KEY": config.apiKey,
        };

        await axios.post(`${config.apiUrl}/backoffice/importshops`, {
          shopid: "0",
          ugroupid: ugroupidImport,
          shops: shopresult
        }, {
          headers
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

        // 5. ถ้าข้อมูลถูกต้อง
        Swal.fire({
          icon: "success",
          title: "นำเข้าข้อมูลสำเร็จ",
          text: `ข้อมูลนำเข้า ${data.length} รายการ`,
          timer: 2000,
        });

      },
      error: () => {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถอ่านไฟล์ CSV ได้",
        });
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
      const ugroupidE = ugroupidExport;
      const shoptypeE = shoptypeExport;

      const groupusernameE = groupuserlist.length > 0 ? 
        groupuserlist.filter((group: GroupUser) => group.ugroupid === ugroupidE)[0]?.ugroupname || "" : "";

      //   : "สินค้าไม่มีหมวดหมู่";
      const shoptypenameE = shoptypedatalist.length > 0 ? 
        shoptypedatalist.filter((shoptype_) => shoptype_.value === shoptypeE)[0]?.label || "" : "";

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      await axios.post(`${config.apiUrl}/backoffice/exportshops`, { ugroupid: ugroupidE, shoptype: shoptypeE }, { headers: headers })
        .then(async(response) => {
          
          const shopsExport: Shop[] = [];

          if (response.data.result.length > 0 ) {
            shopsExport.push(...response.data.result);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!shopsExport || shopsExport.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'ไม่มีข้อมูล',
              text: 'ไม่มีข้อมูลร้านค้าสำหรับส่งออก',
              timer: 2000
            });

            setIsLoading(false);
            return;
          }
      
          const headersCSV = [
            "ชื่อร้านค้าภาษาไทย", 
            "ชื่อร้านค้าภาษาอังกฤษ",
            "เวลาเปิดร้าน",
            "เวลาปิดร้าน",
            "เวลาหมดอายุ",
            "ข้อมูลร้านค้า 1",
            "ข้อมูลร้านค้า 2"
          ];

          const rows = shopsExport.map((shopE) => {

            // console.log(`2000-01-01T${shopE.shopopentime}`);

            const sopen = format(new Date(`2000-01-01 ${shopE.shopopentime}`), 'HH:mm');
            const sclose = format(new Date(`2000-01-01 ${shopE.shopclosetime}`), 'HH:mm');

            shopE.shopopentime = sopen;
            shopE.shopclosetime = sclose;

            return [
              escapeCSV(shopE.shopnameth),
              escapeCSV(shopE.shopnameeng),
              escapeCSV(shopE.shopopentime),
              escapeCSV(shopE.shopclosetime),
              escapeCSV(shopE.shopexpiredate),
              escapeCSV(shopE.shopdata1),
              escapeCSV(shopE.shopdata2)
          ]
          });
      
          const csvContent = [
            headersCSV.join(','),
            ...rows.map(row => row.join(',')),
          ].join('\n');
      
          const dateStr = format(new Date(), 'yyyy-MM-dd'); // YYYY-MM-DD

          downloadCSV(csvContent, `${groupusernameE}_${shoptypenameE},_${dateStr}.csv`);

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

  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // console.log(currentPage);
  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-xl md:text-2xl xl:text-4xl pt-4 font-bold">
            ร้านค้า
          </p>
          <p className="text-xs md:text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* content table shop */}
      <div className="w-full mt-2 mb py-4 px-4 bg-white rounded-lg text-black flex flex-col overflow-auto">
        
        {/* header table */}
        <div className="w-[1325px] xl:w-full flex flex-row justify-between items-center">
          <div className="flex flex-row justify-between items-center p-4">
            <p className="text-lg xl:text-2xl font-bold text-black">
              {" "}
              รายการร้านค้า
            </p>
          </div>

          {/* <div className='p-4'>
            <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
          </div> */}

          <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-6">
            <button
              className="btn h-[40px] w-[150px] xl:w-[150px]"
              onClick={handleOpenCreate}
            >
              <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า
            </button>

            {level !== "Employee" && (
              <button
                className="btn w-[220px] xl:w-[220px] h-[40px] text-white rounded-md
                  flex flex-row justify-center items-center gap-x-2
                  "
                onClick={handleOpenDataManagement} // ไปที่หน้าจัดการหมวดหมู่สินค้า
              >
                <i className="fa-solid fa-database"></i>
                <span className="">จัดการข้อมูลร้านค้า</span>
              </button>
            )}

            {/* ค้นหา */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search for Shop ..."
                className="w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  currentSearchRef.current = e.target.value;
                }} // อัปเดตคำค้นหาใน State
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);

                    fetchData(); // ค้นหาเมื่อกด Enter
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* table */}
        <div className="w-[1325px] xl:w-full overflow-y-auto">
          <table className="text-[16px] table-auto w-full text-center ">
            <thead className="border-b border-[#009f4d] sticky top-0 bg-[#74d2e7] ">
              <tr>
                <th className="h-12 w-[100px]">โลโก้</th>
                <th className="h-12 w-[190px]">ชื่อร้านค้าภาษาไทย</th>
                <th className="h-12 w-[190px]">ชื่อร้านค้าภาษาอังกฤษ</th>
                <th className="h-12 w-[140px]">ประเภทร้านค้า</th>
                <th className="h-12 w-[120px]">เวลาเปิดร้าน</th>
                <th className="h-12 w-[120px]">เวลาปิดร้าน</th>
                <th className="h-12 w-[130px]">เวลาหมดอายุ</th>
                <th className="h-12 w-[100px]">ดำเนินการ</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(shops) && shops.length > 0 ? (
                shops.map((shop: Shop) => (
                  <tr
                    key={shop.shopid}
                    className={`${shop.status ? "" : "text-gray-400 "} border-b border-gray-100 hover:bg-gray-50`}
                  >
                    <td className="h-[48px] min-w-[100px]">
                      <div className=" flex justify-center items-center py-1">
                        
                        <Image
                          src={`${
                            shop.shoplogoimage
                              ? config.apiUrlImage + "/" + shop.shoplogoimage
                              : "https://placehold.co/54x54"
                          }`}
                          className={`h-[38px] w-[38px] xl:h-[45px] xl:w-[48px] rounded-full ${shop.status ? "" : "grayscale"}`}
                          alt="logo"
                          width={30}
                          height={30}
                        />

                      </div>
                    </td>
                    <td className="h-[48px] w-[190px]">{shop.shopnameth}</td>
                    <td className="h-[48px] w-[190px]">{shop.shopnameeng}</td>
                    <td className="h-[48px] w-[140px]">{shop.shoptype}</td>
                    <td className="h-[48px] w-[120px]">{shop.shopopentime}</td>
                    <td className="h-[48px] w-[120px]">{shop.shopclosetime}</td>
                    <td className="h-[48px] w-[130px]">
                      {shop.shopexpiredate}
                    </td>
                    <td className="h-[48px] w-[100px]">
                      <div className="flex justify-center items-center">
                        {shop.status === true ? (
                          <>
                            {/* แก้ไข */}
                            <button
                              className="btn-edit mr-2"
                              onClick={() => handleEdit(shop.shopid)}
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            {level === "Owner" && (
                              <>
                                {/* ตั้งค่า */}
                                <button
                                  className="w-[32px] h-[32px] mr-2 bg-[#84bd00] hover:bg-green-900 text-white px-[5px] xl:px-2 xl:pt-[2px] xl:pb-[5px] rounded-md"
                                  onClick={() => handleSetup(shop.shopid)}
                                >
                                  <Image
                                    src="/icon/shopsetup.svg"
                                    alt="setting"
                                    width={18}
                                    height={18}
                                    className="inline-block w-[16px] h-[16px] xl:w-[18px] xl:h-[18px]"
                                    style={{ transform: "rotate(0deg)" }}
                                  />
                                </button>
                              </>
                            )}

                            {/* ลบ */}
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(shop.shopid)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* กู้คืน */}
                            <button
                              className="w-[32px] h-[32px] text-white text-base px-2 py-1 rounded-md bg-[#84bd00] hover:bg-green-900 mr-2"
                              onClick={() => handleRestore(shop.shopid)}
                            >
                              <i className="fa-solid fa-rotate-left"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-base text-black  opacity-60"
                  >
                    ไม่มีข้อมูลร้านค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {Array.isArray(shops) && shops.length > 0 ? (

          <div className="flex justify-center mt-4 overflow-auto">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`px-4 py-2 mx-1 rounded-lg ${
                  currentPage === index + 1
                    ? "bg-[#3DA48F] text-white" // หน้าปัจจุบัน: พื้นหลังสีเขียวเข้ม ตัวอักษรสีขาว
                    : "bg-white text-black border border-gray-300" // หน้าอื่น: พื้นหลังสีขาว ตัวอักษรสีดำ
                }`}
                onClick={() => {
                  setCurrentPage(index + 1);
                  currentPageRef.current = index + 1;
                  fetchData(); // ดึงข้อมูลหน้าที่เลือก
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* แก้ไข */}
      <ModalWauto
        title="แก้ไขร้านค้า"
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="h-[710px] md:h-[550px]"
      >
        <div className="flex flex-col h-[620px] md:h-[550px]  w-[300px] md:w-[600px] xl:w-[700px]">
          <div className="overflow-y-auto h-[700px] md:h-[400px] grid grid-cols-1 md:grid-cols-2 justify-between gap-x-4 gap-y-1">
            <div>
              <div>
                กลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span>
              </div>
              <select
                className="border border-[#2B5F60] p-2 rounded-md w-full"
                value={ugroupid}
                onChange={(e) => setUgroupid(e.target.value)}
              >
                {Array.isArray(groupuserlist) && groupuserlist.length > 0 ? (
                  groupuserlist.map((groupuser: GroupUser) => (
                    <option key={groupuser.ugroupid} value={groupuser.ugroupid}>
                      {groupuser.ugroupname}
                    </option>
                  ))
                ) : (
                  <option value="">ไม่มีกลุ่มบัญชีผู้ใช้</option>
                )}
              </select>
            </div>

            {/* <div>ShopID</div> */}
            <input
              type="text"
              value={shopid}
              onChange={(e) => setShopid(e.target.value)}
              hidden
            />

            {/* <div>MerID</div> */}
            <input
              type="text"
              value={merid}
              onChange={(e) => setMerid(e.target.value)}
              hidden
            />

            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              hidden
            />

            <div>
              <div>
                <div>โลโก้</div>
                <input
                  type="file"
                  accept=".png, .jpg"
                  onChange={handleFileChange}
                />
                {/* อนุญาตเฉพาะไฟล์รูปภาพ */}
              </div>
            </div>

            <div>
              <div>
                ประเภทร้านค้า <span className="text-red-500">*</span>
              </div>
              {/* <input
                type="text"
                value={shoptype}
                onChange={(e) => setShoptype(e.target.value)}
              /> */}
              <select
                className="border border-[#2B5F60] p-2 rounded-md w-full"
                value={shoptype}
                onChange={(e) => setShoptype(e.target.value)}
              >
                {shoptypedatalist.map((shoptype: any) => (
                  <option key={shoptype.value} value={shoptype.value}>
                    {shoptype.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div>
                ชื่อร้านค้าภาษาไทย <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                placeholder="ชื่อร้านค้าภาษาไทย"
                value={shopnameth}
                onChange={(e) => setShopnameth(e.target.value)}
              />
            </div>

            <div>
              <div>
                ชื่อร้านค้าภาษาอังกฤษ <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                placeholder="ชื่อร้านค้าภาษาอังกฤษ"
                value={shopnameeng}
                onChange={(e) => setShopnameeng(e.target.value)}
              />
            </div>

            <div>
              <div>
                เวลาเปิดร้าน <span className="text-red-500">*</span>
              </div>
              <input
                type="time"
                value={shopopentime}
                onChange={(e) => {
                  setShopopentime(e.target.value);
                }}
              />
            </div>

            <div>
              <div>
                เวลาปิดร้าน <span className="text-red-500">*</span>
              </div>
              <input
                type="time"
                value={shopclosetime}
                onChange={(e) => setShopclosetime(e.target.value)}
              />
            </div>

            <div>
              <div>
                เวลาหมดอายุ <span className="text-red-500">*</span>
              </div>
              <input
                type="date"
                value={shopexpiredate}
                onChange={(e) => {
                  setShopexpiredate(e.target.value);
                }}
              />
            </div>

            <div>
              <div>ข้อมูลร้านค้า 1</div>
              <input
                type="text"
                placeholder="กรุณากรอกข้อมูลร้านค้า 1"
                value={shopdata1}
                onChange={(e) => setShopdata1(e.target.value)}
              />
            </div>

            <div>
              <div>ข้อมูลร้านค้า 2</div>
              <input
                type="text"
                placeholder="กรุณากรอกข้อมูลร้านค้า 2"
                value={shopdata2}
                onChange={(e) => setShopdata2(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 border-t-2 border-gray-300 pt-2">
            <button className="btn" onClick={handleEditSave}>
              <i className="fa-solid fa-save mr-2"></i>
              บันทึก
            </button>
          </div>
        </div>
      </ModalWauto>

      {/* สร้าง */}
      <ModalWauto
        title="เพิ่มร้านค้า"
        isOpen={isOpenCreate}
        onClose={handleCloseModal}
        className="h-[710px] md:h-[550px]"
      >
        <div className="flex flex-col  h-[620px] md:h-[550px]  w-[300px] md:w-[600px] xl:w-[700px] ">
          <div className="overflow-y-auto h-[700px] md:h-[400px] grid grid-cols-1 md:grid-cols-2 justify-between gap-x-4 gap-y-1">
            <div>
              <div>
                กลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span>
              </div>
              <select
                className="border border-[#2B5F60] p-2 rounded-md w-full"
                value={ugroupid}
                onChange={(e) => setUgroupid(e.target.value)}
              >
                {Array.isArray(groupuserlist) && groupuserlist.length > 0 ? (
                  groupuserlist.map((groupuser: GroupUser) => (
                    <option key={groupuser.ugroupid} value={groupuser.ugroupid}>
                      {groupuser.ugroupname}
                    </option>
                  ))
                ) : (
                  <option value="">ไม่มีกลุ่มบัญชีผู้ใช้</option>
                )}
              </select>
            </div>

            <div>
              <div>
                <div>โลโก้</div>
                <input
                  type="file"
                  accept=".png, .jpg"
                  onChange={handleFileChange}
                />
                {/* อนุญาตเฉพาะไฟล์รูปภาพ */}
              </div>
            </div>

            <div>
              <div>
                ประเภทร้านค้า <span className="text-red-500">*</span>
              </div>
              {/* <input
                type="text"
                value={shoptype}
                onChange={(e) => setShoptype(e.target.value)}
              /> */}
              <select
                className="border border-[#2B5F60] p-2 rounded-md w-full"
                value={shoptype}
                onChange={(e) => setShoptype(e.target.value)}
              >
                {shoptypedatalist.map((shoptype: any) => (
                  <option key={shoptype.value} value={shoptype.value}>
                    {shoptype.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div>
                ชื่อร้านค้าภาษาไทย <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                placeholder="กรุณากรอกชื่อร้านค้าภาษาไทย"
                value={shopnameth}
                onChange={(e) => setShopnameth(e.target.value)}
              />
            </div>

            <div>
              <div>
                ชื่อร้านค้าภาษาอังกฤษ <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                placeholder="กรุณากรอกชื่อร้านค้าภาษาอังกฤษ"
                value={shopnameeng}
                onChange={(e) => setShopnameeng(e.target.value)}
              />
            </div>

            <div>
              <div>
                เวลาเปิดร้าน <span className="text-red-500">*</span>
              </div>
              <input
                type="time"
                value={shopopentime}
                onChange={(e) => setShopopentime(e.target.value)}
              />
            </div>

            <div>
              <div>
                เวลาปิดร้าน <span className="text-red-500">*</span>
              </div>
              <input
                type="time"
                value={shopclosetime}
                onChange={(e) => setShopclosetime(e.target.value)}
              />
            </div>

            <div>
              <div>
                เวลาหมดอายุ <span className="text-red-500">*</span>
              </div>
              <input
                type="date"
                value={shopexpiredate}
                onChange={(e) => setShopexpiredate(e.target.value)}
              />
            </div>

            <div>
              <div>ข้อมูลร้านค้า 1</div>
              <input
                type="text"
                placeholder="กรุณากรอกข้อมูลร้านค้า 1"
                value={shopdata1}
                onChange={(e) => setShopdata1(e.target.value)}
              />
            </div>

            <div>
              <div>ข้อมูลร้านค้า 2</div>
              <input
                type="text"
                placeholder="กรุณากรอกข้อมูลร้านค้า 2"
                value={shopdata2}
                onChange={(e) => setShopdata2(e.target.value)}
              />
            </div>
          </div>

          {/* <div>หน่วย</div>
          <input type="text" value={uomtext} onChange={(e) => setUomtext(e.target.value)} /> */}

          <div className="mt-2 border-t-2 border-gray-300 pt-2">
            <button className="btn mr-2" onClick={handleCreate}>
              <i className="fa-solid fa-save mr-2"></i>
              เพิ่ม
            </button>
          </div>
        </div>
      </ModalWauto>

      {/* ตั้งค่าสล็อต */}
      <ModalWauto
        title="ตั้งค่าสล็อต"
        isOpen={isOpenSetSlot}
        onClose={handleCloseModal}
        className="h-[660px] md:h-[810px]"
      >
        {Array.isArray(slotlist) && slotlist.length > 0 ? (
          <div className="w-[300px]  md:w-[600px]">
            <div
              className="w-[100%] h-[510px] md:h-[660px] grid grid-cols-1 md:grid-cols-2 gap-4 
            justify-center items-center overflow-y-auto overflow-x-hidden"
            >
              {slotlist.map((slot: shopslot) => (
                <div
                  key={slot.slotid}
                  className="w-[300px] flex flex-row justify-center items-center gap-4"
                >
                  <input
                    type="checkbox"
                    checked={slot.status}
                    onChange={(e) => {
                      const newStatus = e.target.checked;
                      setSlotlist((prevSlotlist) =>
                        prevSlotlist.map((s) =>
                          s.slotid === slot.slotid
                            ? { ...s, status: newStatus }
                            : s
                        )
                      );
                    }}
                    className="w-4 h-4 border-2 border-[#009f4d] rounded checked:bg-[#009f4d] "
                  />

                  <p className="text-[16px] text-black">
                    {slot.slottimestart} - {slot.slottimeend}
                  </p>
                  <input
                    type="number"
                    min={1}
                    value={slot.slotcapacity}
                    onChange={(e) => {
                      const newCapacity = parseInt(e.target.value, 10);
                      if (!isNaN(newCapacity)) {
                        setSlotlist((prevSlotlist) =>
                          prevSlotlist.map((s) =>
                            s.slotid === slot.slotid
                              ? { ...s, slotcapacity: newCapacity }
                              : s
                          )
                        );
                      }
                    }}
                    className="w-[100px] h-[40px] border-2 text-black border-[#009f4d] rounded"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 border-t-2 border-gray-300 pt-2">
              <button className="btn" onClick={shopslotsave}>
                <i className="fa-solid fa-save mr-2"></i>
                บันทึก
              </button>
            </div>
          </div>
        ) : (
          <div className="col-span-full w-[600px] h-[600px] text-2xl opacity-60 text-black flex justify-center items-center">
            ไม่มีสล็อต
          </div>
        )}
      </ModalWauto>

      {/* import export */}
      <ModalWauto
        title="จัดการข้อมูลร้านค้า"
        isOpen={isOpenDataManagement}
        onClose={handleCloseModal}
        className="max-h-[600px] md:max-h-[800px]"
      >

        <div className="flex flex-col w-[340px] md:w-[550px] md:gap-x-4 gap-y-2 my-4">

          {/* Export */}
          <div>
            <p>ส่งออกข้อมูลร้านค้าเป็นรูปแบบ CSV</p>
            <div className="flex flex-col md:flex-row gap-y-2 md:gap-x-4">

              {/* กลุ่มบัญชีผู้ใช้ */}
              {level === 'Admin' && (

                <div>
                  {/* <div>
                    กลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span>
                  </div> */}
                  <select
                    className="border border-[#2B5F60] p-2 rounded-md w-full"
                    value={ugroupidExport}
                    onChange={(e) => setugroupidExport(e.target.value)}
                  >
                    {Array.isArray(groupuserlist) && groupuserlist.length > 0 ? (
                      groupuserlist.map((groupuser: GroupUser) => (
                        <option key={groupuser.ugroupid} value={groupuser.ugroupid}>
                          {groupuser.ugroupname}
                        </option>
                      ))
                    ) : (
                      <option value="">ไม่มีกลุ่มบัญชีผู้ใช้</option>
                    )}
                  </select>
                </div>
              )}

              {/* ประเภทร้านค้า */}
              <div>
                {/* <div>
                  ประเภทร้านค้า <span className="text-red-500">*</span>
                </div> */}
                {/* <input
                  type="text"
                  value={shoptype}
                  onChange={(e) => setShoptype(e.target.value)}
                /> */}
                <select
                  className="border border-[#2B5F60] p-2 rounded-md w-full"
                  value={shoptypeExport}
                  onChange={(e) => setshoptypeExport(e.target.value)}
                >
                  {shoptypedatalist.map((shoptype: any) => (
                    <option key={shoptype.value} value={shoptype.value}>
                      {shoptype.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn w-[150px] h-[40px] p-1 mt-2"
              onClick={() => handleExportCSV()}
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
              <span className="text-[16px]">Export CSV</span>
            </button>
          </div>

          <hr className="text-5xl my-2" />

          {/* import CSV */}
          <div>
            <p>นำเข้าข้อมูลร้านค้าเป็นรูปแบบ CSV</p>

            <div className="flex flex-col mt-2 md:flex-row gap-y-2 md:gap-x-4">

              {/* กลุ่มบัญชีผู้ใช้ */}
              {level === 'Admin' && (

                <div>
                  {/* <div>
                    กลุ่มบัญชีผู้ใช้ <span className="text-red-500">*</span>
                  </div> */}
                  <select
                    className="border border-[#2B5F60] p-2 rounded-md w-full"
                    value={ugroupidImport}
                    onChange={(e) => setugroupidImport(e.target.value)}
                  >
                    {Array.isArray(groupuserlist) && groupuserlist.length > 0 ? (
                      groupuserlist.map((groupuser: GroupUser) => (
                        <option
                          key={groupuser.ugroupid}
                          value={groupuser.ugroupid}
                        >
                          {groupuser.ugroupname}
                        </option>
                      ))
                    ) : (
                      <option value="">ไม่มีกลุ่มบัญชีผู้ใช้</option>
                    )}
                  </select>
                </div>
              )}

              {/* ประเภทร้านค้า */}
              <div>
                <select
                  className="border border-[#2B5F60] p-2 rounded-md w-full"
                  value={shoptypeImport}
                  onChange={(e) => setshoptypeImport(e.target.value)}
                >
                  {shoptypedatalist.map((shoptype: any) => (
                    <option key={shoptype.value} value={shoptype.value}>
                      {shoptype.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              className="w-full p-1 mt-2 border-[#009f4d]"
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) setImportFile(e.target.files[0]);
              }}
            />

            {/* <div className="w-full mt-2 border-t-2 border-gray-300 pt-2 flex flex-row justify-start items-center"> */}
            <button className="btn mt-4 mr-2" onClick={handleImportCSV}>
              <i className="fa-solid fa-file-import mr-2"></i>
              Import CSV
            </button>
            {/* </div> */}
          </div>
        </div>
      </ModalWauto>
    </div>
  );
}
