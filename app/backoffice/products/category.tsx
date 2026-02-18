"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
// import Modal from "@/app/modal";
// import ModalXL from "@/app/modalW-Auto";
// import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { useRouter } from "next/navigation";
import Selectshop  from '@/app/components/selectshop';
import ModalWAuto  from '@/app/modalW-Auto';
// import { AiOutlineProduct } from "react-icons/ai";
// import { set } from 'date-fns';

export interface GategoryProductPageProps {
  // params: { shopid_: string,className?: string };
  shopid_: string;
  className?: string;
  
}

export default function GategoryProductPage({shopid_,className}: GategoryProductPageProps) {

  interface Category {
    CgtyId: string;
    productCgtyId: string;
    categoryname: string;
    details: string;
  }

  // ใช้สําหรับเก็บข้อมูลร้านค้า
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
  }

  const router = useRouter();
  
  const [isCategoryCreate, setIsCategoryCreate] = useState(false);
  const [isOpenCategoryEdit, setIsOpenCategoryEdit] = useState(false);

  // const [userid, setUserid] = useState("");

  const [search, setSearch] = useState(""); // เก็บคำค้นหา

  const [shops, setShops] = useState<Shop[]>([]); // ใช้สําหรับเก็บข้อมูลร้านค้า

  const [shopid, setShopid] = useState(shopid_ || "");

  const [category ,setCategory] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryname, setCategoryname] = useState("");
  const [details, setDetails] = useState("");

  const [level, setLevel] = useState("");

  const [date, setDate] = useState("-");

  const shopidRef = useRef(shopid);
  // const searchRef = useRef(search);

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

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };
      // console.log("shopid ==>>",shopid);

      // ตรวจสอบการเข้าสู่ระบบ
      await axios
        .get(`${config.apiUrl}/backoffice/checklogin`, {
          headers: headers,
        })
        .then((res) => {
          if (res.status == 200) {
            setLevel(res.data.level);
          } else if (res.status == 401) {
            Swal.fire({
              icon: "warning",
              title: "เข้าสู่ระบบ",
              text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
              showCancelButton: true,
              timer: 1500,
            });

            localStorage.removeItem("token");
            router.push("/");
          } else {
            localStorage.removeItem("token");
            router.push("/");
          }
        });

      await axios.get(`${config.apiUrl}/backoffice/productshoplist`, {
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
      }).then(async(response)=>{

        const shopslist = response.data.result;

        setShopid(shopid_ || "");
        shopidRef.current = shopid_ || "";
        setShops(shopslist);

        await axios.post(`${config.apiUrl}/backoffice/productcategorylist`, 
          {
            "shopid": (shopid_ || ""),
          },
          {headers},
          ).then((response)=>{
            setCategory(response.data.result);

            if(response.data.result.length > 0){
              setCategoryId(response.data.result[0].CgtyId || "");
            }
            
          })
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
      const shopidfetch = shopidRef.current;

      await axios.get(`${config.apiUrl}/backoffice/productshoplist`, {
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
      }).then(async(response)=>{

        const shopslist = response.data.result;

        setShops(shopslist); 

      })
 
      await axios.post(`${config.apiUrl}/backoffice/productcategorylist`, 
        {
          shopid: shopidfetch,
        },
        {
          params: {
            search: search,
          },
          headers: {
            'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
            'X-API-KEY': config.apiKey,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
      }).then((response)=>{
        setCategory(response.data.result);
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

  const hadleOpenCategoryCreate = async () => {
    setIsCategoryCreate(true);
    setIsOpenCategoryEdit(false);
    handleClear();
  }

  const handleCategoryEdit = async (categoryId_: string) => {

    const categorys_: Category | undefined = category.find((cty: Category) => cty.CgtyId === categoryId_);
    
        if (categorys_) {
    
            setCategoryId(categorys_.CgtyId ?? '');
            setCategoryname(categorys_.categoryname ?? '');
            setDetails(categorys_.details ?? '');
    
            handleOpenCategoryEdit();
        } else {
            // Handle the case where no shop is found
            // console.error(`Shop with ID ${shopid} not found.`);
            // Or show a user-friendly error message:
            Swal.fire({
                icon: 'error',
                title: 'User Not Found',
                text: `User with CategoryId ${categoryId_} does not exist.`,
            });
        }
      
  }

  const handleOpenCategoryEdit = async () => {
    setIsOpenCategoryEdit(true);
    setIsCategoryCreate(false);
  }

  // close modal
  const handleCloseModal = () => {
        setIsCategoryCreate(false);
        setIsOpenCategoryEdit(false);
  }

  // Clear data modal
  const handleClear = () => {


    setCategoryId('');
    setCategoryname('');
    setDetails('');
  }

  const handleCategoryCreate = async () => {
    try {

      if(categoryname === '' || categoryname === null ){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อหมวดหมู่",
          text: "กรุณากรอกชื่อหมวดหมู่สินค้า",
          timer: 2000,
        });
        return;
      }
      // let uuid = uuidv4();
      // console.log(shopid, ugroupId, username, userpassword, name, level);
      const payload = {
        shopid: shopid,
        categoryname: categoryname,
        details: details
      }
  
    await axios.post(`${config.apiUrl}/backoffice/productcategorycreate`, payload,
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

  const handleUCategoryEditSave = async () => {
    try {

      if(categoryname === '' || categoryname === null ){
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกชื่อหมวดหมู่",
          text: "กรุณากรอกชื่อหมวดหมู่สินค้า",
          timer: 2000,
        });
        return;
      }

      const payload  = {
        CgtyId: categoryId,
        categoryname: categoryname,
        details: details
      
      }

    await axios.put(`${config.apiUrl}/backoffice/productcategoryupdate`, payload,
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

const handleCategoryDelete = async (categoryId: string) => {

    try {

      const result = Swal.fire({
        title: 'ลบข้อมูลหมวดหมู่สินค้า!',
        text: 'คุณต้องการลบหมวดหมู่สินค้านี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก'
      })

      if ((await result).isConfirmed) {

          // console.log(productid);
    
        await axios.post(`${config.apiUrl}/backoffice/productcategorydelete`,
          {CgtyId: categoryId},
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

 // animation load
 if (isLoading) {
  return <LoadingSpinner />;
}

  return (

    <div className={`w-[374px] md:min-w-full ${className}`}>

      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-2xl xl:text-4xl pt-4 font-bold">สินค้า</p>
          <p className="text-md pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />


      {/* content table */}
      <div className="w-full mt-2 overflow-auto">

        <div className="w-[1325px] xl:w-full bg-white p-4 rounded-lg shadow-sm">

          {/* header table */}
          <div className="flex flex-row justify-between items-center text-white">
            <div className="flex flex-row justify-between items-center p-4">
              <p className="text-lg xl:text-2xl font-bold text-black">
                หมวดหมู่สินค้า
              </p>
            </div>

            {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

            <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-6">

              {/* select shop */}
              {/* {level === "Admin" ||
                (level === "Owner" && (

                  <Selectshop
                    shopid={shopid}
                    shopslist={shops}
                    className='w-[200px]  xl:w-[180px]'
                    onChange={(value) => {
                      setShopid(value);
                      shopidRef.current = value;
                      fetchData();
                    }}
                  />
                ))} */}

              {/* <button
                className="btn w-[170px] flex flex-row justify-center items-center gap-1"
                onClick={() => router.push(`/backoffice/products`)}
              >
                <AiOutlineProduct size={20} /> จัดการสินค้า
              </button> */}

              <button
                className="btn w-[200px]  "
                onClick={hadleOpenCategoryCreate}
              >
                <i className="fa-solid fa-plus text-sm xl:text-md"></i>
                {"  "}
                <span className="">
                  เพิ่มหมวดหมู่สินค้า
                </span>
              </button>

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
          <div className="w-full overflow-y-auto">
            
            <table className="text-[16px] p-4 table-auto w-full text-center">
              <thead className="border-b border-[#2B5F60] bg-white sticky top-0">
                <tr>
                  <th className="h-12 w-[200px]">หมวดหมู่สินค้า</th>
                  <th className="h-12 w-[300px]">รายละเอียด</th>
                  {/* <th className='h-12 w-[150px]'>หมายเหตุ</th> */}
                  <th className="h-12 w-[100px]">ดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(category) && category.length > 0 ? (
                  category.map((category: Category) => (
                    <tr
                      key={category.CgtyId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 w-[200px]">{category.categoryname}</td>
                      <td className="h-12 w-[300px]">{category.details}</td>
                      {/* <td className='h-12 w-[100px]'>{usergroup.ugroupremark}</td> */}

                      {/* <td className='h-12 w-[100px]'>฿ {getRandomInt(100,3000).toFixed(2).toLocaleString()}</td>
                      <td className='h-12 w-[100px]'>{getRandomInt(100,1000)}</td> */}
                      <td className="h-12">
                        <div className="flex justify-center items-center">
                          <button
                            className="btn-edit pt-[1px] mr-1 xl:mr-2"
                            onClick={() => handleCategoryEdit(category.CgtyId)}
                          >
                            <i className="fa-solid fa-edit text-[12px]"></i>
                          </button>

                          <button
                            className="btn-delete flex flex-row justify-center items-center"
                            onClick={() => handleCategoryDelete(category.CgtyId)}
                          >
                            <i className="fa-solid fa-trash pt-[1px] text-[12px]"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-[16px] opacity-60"
                    >
                      ไม่พบข้อมูลกลุ่มบัญชีผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* สร้างหมวดหมู่สินค้า */}
      <ModalWAuto
        title="สร้างหมวดหมู่สินค้า"
        isOpen={isCategoryCreate}
        onClose={handleCloseModal}
        className=" h-[300px]"
      >
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="w-[280px] md:w-[400px] flex flex-col gap-2">
            <div>ชื่อหมวดหมู่สินค้า <span className="text-red-500">*</span></div>
            <input
              type="text"
              placeholder="กรุณากรอกชื่อหมวดหมู่สินค้า"
              value={categoryname}
              onChange={(e) => setCategoryname(e.target.value)}
            />

            {/* <div>สิทธิพิเศษ</div>
                <input type="text" value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)} /> */}

            <div>รายละเอียด</div>
            <input
              type="text"
              placeholder="กรุณากรอกรายละเอียด"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            <div className="flex flex-row">
              <button
                className="btn mr-2 mt-2 w-[120px]"
                onClick={handleCategoryCreate}
              >
                <i className="fa-solid fa-plus mr-2"></i>
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      </ModalWAuto>

      {/* แก้ไขกลุ่มบัญชีผู้ใช้ */}
      <ModalWAuto
        title="แก้ไขกลุ่มบัญชีผู้ใช้"
        isOpen={isOpenCategoryEdit}
        onClose={handleCloseModal}
      className=" h-[300px]"
      >
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="w-[280px] md:w-[400px] flex flex-col gap-2">
            <div>ชื่อหมวดหมู่สินค้า <span className="text-red-500">*</span></div>
            <input
              type="text"
              placeholder="กรุณากรอกชื่อหมวดหมู่สินค้า"
              value={categoryname}
              onChange={(e) => setCategoryname(e.target.value)}
            />

            <div>รายละเอียด</div>
            <input
              type="text"
              placeholder="กรุณากรอกรายละเอียด"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            {/* <div>สิทธิพิเศษ</div>
                <input type="text" value={ugroupprivilege} onChange={(e) => setGroupprivilege(e.target.value)} />

                <div>หมายเหตุ</div>
                <input type="text" value={ugroupremark} onChange={(e) => setGroupremark(e.target.value)} /> */}

            <div className="flex flex-row">
              <button
                className="btn mr-2 mt-2 w-[120px]"
                onClick={handleUCategoryEditSave}
              >
                <i className="fa-solid fa-save mr-2"></i>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </ModalWAuto>
    </div>
  );
}

