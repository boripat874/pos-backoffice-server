"use client"

// import Modal from '@/app/modal';

import ModalWauto  from '@/app/modalW-Auto';
// import { set } from 'date-fns';
import React, { useEffect, useState, useCallback , useRef} from 'react'
import Swal from "sweetalert2";
import { config } from "@/app/lib/config";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner"

import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Selectshop  from '@/app/components/selectshop';
import Selectdate from '@/app/components/selectdate';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export default function Promotions() {

  interface Promotion {
    datepromotion: string;
    promoid: string;
    typepromotions: string;
    promoname: string;
    shopid: string;
    productid: string;
    discount: number;
    datepromostart: string;
    datepromoend: string;
    promoremark: string;
    status: string;
  }

  interface Shop {
    shopid: string;
    shopnameth: string;
  }
  interface Product {
    productid: string;
    productnameth: string;
  }

  // interface Category{
  //   CgtyId: string;
  //   productCgtyId: string;
  //   shopid: string;
  //   categorynameth: string;
  //   details: string;
  // }

  const today = new Date().toISOString().split('T')[0];

  const tomorrowDate = new Date(today);// Create a copy of today's date
  tomorrowDate.setDate(tomorrowDate.getDate() + 1); // Set the day to tomorrow
  const tomorrow = tomorrowDate.toISOString().split('T')[0]; // Tomorrow as YYYY-MM-DD

  const [date, setDate] = useState("-");
  const [isOpen, setIsOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const typepromotionsList = [
    { value: "ลดทั้งร้าน", label: "ลดทั้งร้าน" },
    { value: "ส่วนลดสินค้า", label: "ส่วนลดสินค้า" },
  ]; 

  const [typepromotions, setTypepromotions] = useState(
    typepromotionsList[0].value
  );
  
  const [promoid, setPromoid] = useState("");
  const [promotionname, setPromotionname] = useState("");
  const [shops,setShops] = useState("");
  const [shopslist,setshopslist] = useState<Shop[]>([]);

  // const [shopid, setShopid] = useState("");
  const [product,setProduct] = useState("");
  const [products,setProducts] = useState<Product[]>([]);
  const [discount, setDiscount] = useState(0);
  const [promotionstart, setPromotionstart] = useState(today);
  const [promotionend, setPromotionend] = useState(tomorrow);
  const [promotiondetail, setPromotiondetail] = useState("");
  const [initial, setInitial] = useState("");
  const [productidlist, setProductidlist] = useState<Product[]>([]);
  
  const [promotionslist, setPromotionslist] = useState<Promotion[]>([]);

  const [totalPages, setTotalPages] = useState(0); // จำนวนหน้าทั้งหมด
  // const [count, setCount] = useState(0); // จำนวนข้อมูลทั้งหมด
  const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
  // const page = 1; // หน้าปัจจุบัน
  const limit = 12; // หน้าปัจจุบัน

  
  const [isLoading, setIsLoading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("today");
  const [timestart, setTimeStart] = useState(`${new Date().toISOString().split('T')[0]}`);
  const [timeend, setTimeEnd] = useState(`${new Date().toISOString().split('T')[0]}`);

  const [level, setLevel] = useState("");

  const shopidRef = useRef(shops); // สร้าง ref เก็บค่า shopid
  const periodRef = useRef(period); // สร้าง ref เก็บค่า period
  const timestartRef = useRef(timestart); // สร้าง ref เก็บค่า shopid
  const timeendRef = useRef(timeend); // สร้าง ref เก็บค่า shopid
  const searchRef = useRef(search); // สร้าง ref เก็บค่า shopid

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
    }
  
  }, []);

  const fetchDataFirst = useCallback(async () => {

    setIsLoading(true);

    
    try {
      
      const headers = {

        'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
        'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        // เพิ่ม header อื่นๆ ตามต้องการ

      };

      await axios.get(`${config.apiUrl}/backoffice/checklogin`, {

        headers,
      }).then(async(response) => {

        setLevel(response.data.level);

      });

      await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {

        headers,
      }).then(async(response) => {

        setshopslist(response.data.result);
        setShops(response.data.result[0].shopid);
        shopidRef.current = response.data.result[0].shopid;

        // await axios.post(`${config.apiUrl}/backoffice/promotionproductslist`, 
        //   {
        //     shopid: response.data.result[0].shopid
        //   },
        //   {
  
        //   headers,
  
        // }).then((response) => {
        //   setProducts(response.data.result);
        // });
  
        await axios.post(`${config.apiUrl}/backoffice/promotionslist`, 
          {
          
            shopid: response.data.result[0].shopid,
            
          },{
              params: {
              page: currentPage, // ระบุหน้าที่ต้องการดึงข้อมูล
              limit: limit, // ระบุจำนวนรายการต่อหน้า
              search: search, // ส่งคำค้นหาไปยัง API
            },
            headers,
          }).then((response) => {
            setPromotionslist(response.data.result);
    
            // อัปเดตจำนวนหน้าทั้งหมด
            const count = Number(response.data.total); // จำนวนข้อมูลทั้งหมดจาก API
            // setCount(count); // อัปเดตจำนวนข้อมูลทั้งหมด
            setTotalPages(Math.ceil(count / limit)); // คำนวณจำนวนหน้าทั้งหมด
    
            // setIsLoading(false);
          });
      });

    } catch (error) {
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
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    try {

      const searchR = searchRef.current;
      const periodR = periodRef.current;
      const timestartR = timestartRef.current;
      const timeendR = timeendRef.current;
      const shopidR = shopidRef.current;


      const headers = {

        'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
        'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        // เพิ่ม header อื่นๆ ตามต้องการ

      };

      await axios.post(`${config.apiUrl}/backoffice/promotionslist`, {
        shopid: shopidR,
      },{
        params: {
          page: page, // ระบุหน้าที่ต้องการดึงข้อมูล
          limit: limit, // ระบุจำนวนรายการต่อหน้า
          search: searchR,
          period: periodR,
          date_start: timestartR,
          date_end: timeendR,
        },
        headers,
      }).then((response) => {
        setPromotionslist(response.data.result);

        // อัปเดตจำนวนหน้าทั้งหมด
        const count = Number(response.data.total); // จำนวนข้อมูลทั้งหมดจาก API
        // setCount(count); // อัปเดตจำนวนข้อมูลทั้งหมด
        setTotalPages(Math.ceil(count / limit)); // คำนวณจำนวนหน้าทั้งหมด
      });

      await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {

        headers,
      }).then(async(response) => {

        setshopslist(response.data.result);
        // setShop(response.data.result[0].shopid);

        // await axios.post(`${config.apiUrl}/backoffice/promotionproductslist`, 
        //   {
        //     shopid: shopidR
        //   },
        //   {
  
        //   headers,
  
        // }).then((response) => {
        //   setProducts(response.data.result);
        // });
  
      });


    } catch (error) {
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
    setIsLoading(false);
  }, [search]);

  // add
  const handleAdd = async() => {

    try {
      const payload = {
        promotionname: promotionname, 
        typepromotions: typepromotions,
        shopid: shopidRef.current,
        productid: product,
        discount: discount,
        promotionstart: promotionstart,
        promotionend: promotionend,
        promotiondetail: promotiondetail,
        initial: initial,
        productidlist: productidlist
      }

      await axios.post(`${config.apiUrl}/backoffice/promotioncreate`, payload, {
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          // เพิ่ม header อื่นๆ ตามต้องการ
        },
      }).then(async() => {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: 'เพิ่มโปรโมชั่นสําเร็จ',
              timer: 2000
            });

            setIsOpen(false);
            fetchData(currentPage,limit);

          }).catch((error) => {
            if (error instanceof Error) {
              Swal.fire({
                  icon: 'error',
                  title: 'ผิดพลาด',
                  text: error.message,
              });
            } 
          })

    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: error.message,
        });
      } 
      }
  }

  // edit
  const handleEditSave = async() => {

    try {

      const payload = {
        promoid: promoid,
        promotionname: promotionname,
        typepromotions: typepromotions,
        shopid: shopidRef.current,
        productid: product,
        discount: discount,
        promotionstart: promotionstart,
        promotionend: promotionend,
        promotiondetail: promotiondetail,
        initial: initial,
        productidlist: productidlist,
      }
      
      await axios.put(`${config.apiUrl}/backoffice/promotionupdate`, payload, {
        headers: {
          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          // เพิ่ม header อื่นๆ ตามต้องการ
        },
      }).then(async() => {

        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'เพิ่มข้อมูลสำเร็จ',
          timer: 2000
        });

        setIsEditOpen(false);
        fetchData(currentPage,limit);
      })

    } catch (error) {
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
    setIsOpen(false);
  }

  // delete
  const handleDelete = async (id: string) => {
    try {
      Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่นนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ลบ',
      }).then(async (result) => {

        if (result.isConfirmed) {
          await axios
            .post(
              `${config.apiUrl}/backoffice/promotiondelete`,
              {
                promoid: id,
              },
              {
                headers: {
                  "Content-Type": "application/json", // ตัวอย่าง header Content-Type
                  "X-API-KEY": config.apiKey, // ตัวอย่าง header Authorization
                  Authorization: "Bearer " + localStorage.getItem("token"),
                  // เพิ่ม header อื่นๆ ตามต้องการ
                },
              }
            )
            .then(async () => {
              Swal.fire({
                icon: "success",
                title: "สำเร็จ",
                text: "ลบข้อมูลสำเร็จ",
                timer: 2000,
              });

              fetchData(currentPage, limit);
            });
        }
      });
          

    } catch (error) {
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
  }

  // close modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setIsEditOpen(false);
  };

  const OpenmodalCreate = async() => {
    setIsLoading(true);
    Clearmodal();

    try {

      const shopidR = shopidRef.current;

      const headers = {

        'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
        'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        // เพิ่ม header อื่นๆ ตามต้องการ
      };

      await axios.post(`${config.apiUrl}/backoffice/promotionproductslist`, 
      {
        shopid: shopidR
      },
      {headers}).then((response) => {
        setProducts(response.data.result);
      });

      
    } catch (error) {
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
    // setShop(shopidRef.current);
    setIsLoading(false);
    setIsOpen(true);
  };
  
  const OpenmodalEdit = async(id: string) => {
    setIsLoading(true);

    try {
      const shopidR = shopidRef.current;

      const headers = {

        'Content-Type': 'application/json', // ตัวอย่าง header Content-Type 
        'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        // เพิ่ม header อื่นๆ ตามต้องการ
      };

      await axios.post(`${config.apiUrl}/backoffice/promotiondetail`, 
      {
        promoid: id
      },
      {headers}).then((response) => {

        // console.log(response.data);
        setPromotionname(response.data.promoname);
        setProduct(response.data.productid);
        setDiscount(response.data.discount);
        setPromotionstart(response.data.datepromostart);
        setPromotionend(response.data.datepromoend);
        setPromotiondetail(response.data.promoremark);
        setInitial(response.data.initial);
        setProductidlist(response.data.productidlist);
        setTypepromotions(response.data.typepromotions);

      })

      await axios.post(`${config.apiUrl}/backoffice/promotionproductslist`, 
      {
        shopid: shopidR
      },
      {headers}).then((response) => {
        setProducts(response.data.result);
      });


      const promotion = promotionslist.find((promotion: Promotion) => promotion.promoid === id);

      if (promotion) {
        setPromoid(promotion.promoid ?? '');
        setTypepromotions(promotion.typepromotions ?? '');
        setPromotionname(promotion.promoname ?? '');
        // setShopid(promotion.shopid ?? '');
        setProduct(promotion.productid ?? '');
        setDiscount(promotion.discount ?? 0);
        setPromotionstart(promotion.datepromostart ?? today);
        setPromotionend(promotion.datepromoend ?? tomorrow);
        setPromotiondetail(promotion.promoremark ?? '');
      }
    } catch (error) {
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


    

    setIsLoading(false);
    setIsEditOpen(true);
  };

  const Clearmodal = () => {
    setPromotionname("");
    setTypepromotions(typepromotionsList[0].value);
    // setShops("");
    setProduct("");
    setDiscount(0);
    setPromotionstart(today);
    setPromotionend(tomorrow);
    setPromotiondetail("");
    setInitial("");
    setProductidlist([]);
  }

   // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }


  return (
    // <div className="w-[374px] md:w-[700px] xl:w-full  flex flex-col">
    <div className=" flex flex-col ">
      {/* header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-xl md:text-2xl xl:text-4xl pt-4 font-bold">
            โปรโมชั่น
          </p>
          <p className="text-xs md:text-md xl:text-lg pt-2">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
      <div className="w-full flex flex-col md:flex-row justify-start items-start mt-2 gap-x-2 xl:gap-x-4 gap-y-2 xl:gap-y-0">
        {/* เลือกร้านค้า */}
        {level === "admin" ||
          (level === "Owner" && (
            <>
              <Selectshop
                shopid={shops}
                shopslist={shopslist}
                onChange={(value) => {
                  setShops(value);
                  shopidRef.current = value;
                  fetchData(currentPage, limit);
                }}
              />
            </>
          ))}

        {/* เลือกช่วงเวลา */}
        <Selectdate
          period={period}
          timestart={timestart}
          timeend={timeend}
          periodRef={periodRef}
          onChangePeriod={(value) => {
            setPeriod(value);
            periodRef.current = value;
            fetchData(currentPage, limit);
          }}
          onChangeTimestart={(value) => {
            const newStartDateString = value;
            setTimeStart(newStartDateString);
            timestartRef.current = newStartDateString;

            // Convert to Date objects for comparison
            const newStartDate = new Date(newStartDateString);
            const currentEndDate = new Date(timeend);
            if (newStartDate > currentEndDate) {
              setTimeEnd(newStartDateString); // Set timeend to the new timestart
              timeendRef.current = newStartDateString;
            }

            fetchData(currentPage, limit);
          }}
          onChangeTimeend={(value) => {
            const newEndDateString = value;
            // Convert to Date objects for comparison
            const newEndDate = new Date(newEndDateString);
            const currentStartDate = new Date(timestart);
            if (newEndDate < currentStartDate) {
              setTimeEnd(timestart); // Set timeend to the current timestart
              timeendRef.current = timestart;
            } else {
              setTimeEnd(newEndDateString);
              timeendRef.current = newEndDateString;
            }
            fetchData(currentPage, limit);
          }}
        />
      </div>

      {/* <div className='w-full flex flex-1 h-[1000px] my-3 bg-black'>
        {" "}
      </div> */}

      {/*table */}
      {/* <div className=" min-w-[374px] md:w-[700px] mt-2 xl:min-w-full overflow-auto"> */}
      <div className="mt-2 overflow-auto">
        {/* Promotions */}
        <div className="w-[1325px] xl:w-full mt-0 bg-white p-4 rounded-lg shadow-sm flex flex-col">
          {/* header table */}
          <div className="w-full flex flex-row justify-between items-center">
            <div className="flex flex-row justify-between items-center p-4">
              <p className="text-lg xl:text-2xl font-bold text-black">
                {" "}
                รายการโปรโมชั่น
              </p>
            </div>

            {/* <div className='p-4'>
                <button className='btn' onClick={handleOpenCreate}> <i className="fa-solid fa-plus"></i> เพิ่มร้านค้า</button>
              </div> */}

            <div className="text-[14px] xl:text-[16px] p-4 flex items-center gap-6">
              {level !== "Employee" && (
                <button
                  className="btn w-[140px] xl:w-[170px]"
                  onClick={OpenmodalCreate}
                >
                  <i className="fa-solid fa-plus"></i> เพิ่มโปรโมชั่น
                </button>
              )}

              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Search for Promotions..."
                  className="w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] text-black focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchRef.current = e.target.value;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchData(currentPage, limit);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* content table */}
          <div className="w-full  overflow-y-auto">
            <table className="p-2 xl:p-4 w-full text-center text-black ">
              <thead className="border-b border-[#2B5F60] bg-[#74d2e7] sticky top-0">
                <tr>
                  <th className="h-12 w-[130px]">วันที่ สร้าง/แก้ไข ล่าสุด</th>

                  <th className="h-12 w-[150px]">ชื่อโปรโมชั่น</th>
                  <th className="h-12 w-[90px]">ราคาลด %</th>
                  <th className="h-12 w-[90px]">วันที่เริ่ม</th>
                  <th className="h-12 w-[90px]">วันที่สิ้นสุด</th>
                  <th className="h-12 w-[140px]">รายละเอียด</th>
                  <th className="h-12 w-[90px]">สถานะ</th>
                  {level !== "Employee" && (
                    <th className="h-12 w-[90px]">ดำเนินการ</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {promotionslist && promotionslist.length > 0 ? (
                  promotionslist.map((promotion: Promotion) => (
                    <tr
                      key={promotion.promoid}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 w-[130px]">
                        {promotion.datepromotion}
                      </td>
                      <td className="h-12 w-[90px]">{promotion.promoname}</td>
                      <td className="h-12 w-[90px]">{promotion.discount}</td>
                      <td className="h-12 w-[90px]">
                        {promotion.datepromostart}
                      </td>
                      <td className="h-12 w-[90px]">
                        {promotion.datepromoend}
                      </td>
                      <td className="h-12 w-[90px]">{promotion.promoremark}</td>
                      <td className="h-12 w-[90px]">{promotion.status}</td>

                      {level !== "Employee" && (
                        <td className="h-12 w-[90px]">
                          <button
                            className="btn-edit mr-2"
                            onClick={() => OpenmodalEdit(promotion.promoid)}
                          >
                            <i className="fa-solid fa-edit"></i>
                          </button>

                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(promotion.promoid)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-center text-[16px] text-black  opacity-60"
                    >
                      ไม่มีข้อมูลโปรโมชั่น
                    </td>
                  </tr>
                )}

                {/* )): null} */}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {promotionslist && promotionslist.length > 0 ? (

            <div className="flex justify-center mt-4">
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
                    fetchData(index + 1, limit); // ดึงข้อมูลหน้าที่เลือก
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          ): null}
        </div>
      </div>

      {/* สร้าง */}
      <ModalWauto
        title="เพิ่มโปรโมชั่น"
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="w-[350px] md:w-[580px] xl:w-[800px] max-h-[800px] md:max-h-[500px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[800px] md:max-h-[420px] overflow-y-auto">
          {/* <div>ร้าน</div>
            <input type="text" value={shopnameth} onChange={(e) => setShopnameth(e.target.value)} />
  
            <div>ชื่อ นามสกุล</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
  
            <div>User</div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

            <div>Password</div>
            <input type="text" value={userpassword} onChange={(e) => setPassword(e.target.value)} />
  
            <div>สิทธิ์ใช้งาน</div>
            <input type="time" value={level} onChange={(e) => setLevel(e.target.value)} />
              */}

          <div>
            <div>ชื่อโปรโมชั่น</div>
            <input
              type="text"
              value={promotionname}
              className=""
              onChange={(e) => setPromotionname(e.target.value)}
            />
          </div>

          <div>
            <div>ชื่อย่อ (ใช้สำหรับแสดงหน้าสินค้า)</div>
            <input
              type="text"
              value={initial}
              className=""
              onChange={(e) => setInitial(e.target.value)}
            />
          </div>
          {/* <div>
              <div>ร้านค้า</div>
              <select
                className="w-full h-[56px] p-2 border border-[#2B5F60] rounded-md text-black"
                defaultValue={shopid}
                onChange={(e) => {
                  setShopid(e.target.value);

                }}
              >
                {shopslist.map((shop: Shop) => (
                  <option key={shop.shopid} value={shop.shopid}>
                    {shop.shopnameth}
                  </option>
                ))}
              </select>

            </div> */}

          <div>
            <div>รูปแบบโปรโมชั่น</div>
            {/* <input type="text" value={typepromotions} onChange={(e) => setTypepromotions(e.target.value)} />
             */}
            <select
              className="w-full p-2 border border-[#2B5F60] rounded-md text-black"
              defaultValue={typepromotionsList[0].value}
              onChange={(e) => {
                setTypepromotions(e.target.value);
              }}
            >
              {typepromotionsList.map((typepromotions) => (
                <option key={typepromotions.value} value={typepromotions.value}>
                  {typepromotions.label}
                </option>
              ))}
            </select>
          </div>

          {typepromotions === "ส่วนลดสินค้า" && (
            <div>
              <div>เลือกสินค้า</div>
              {/* <select
                  className="w-full h-[56px] p-2 border border-[#2B5F60] rounded-md"
                  name="products"
                  defaultValue={product}
                  id="products"
                  onChange={(e) => setProduct(e.target.value)}
                >
                  {products.map((product: Product) => (
                    <option key={product.productid} value={product.productid}>
                      {product.productnameth}
                    </option>
                  ))}
                </select> */}

              <Autocomplete

                sx={{
                  width: "100%",
                  border: "1px solid #2B5F60",
                  borderRadius: "5px",
                  padding: "0px 0px",
                  "& .MuiOutlinedInput-root": {
                    padding: "0px",
                    minHeight: "39px",
                    "& .MuiAutocomplete-input": {
                      paddingX: "12px",
                      paddingY: "2px",
                      borderRadius: "5px",
                    },
                  },
                }}

                multiple
                id="checkboxes-tags-add"
                options={products}
                value={productidlist}
                isOptionEqualToValue={(option, value) =>
                  option.productid === value.productid
                }
                limitTags={1}
                disableCloseOnSelect
                getOptionLabel={(option) => option.productnameth}
                onChange={(event, newValue) => {
                  // console.log(value);
                  setProductidlist(newValue);
                }}
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  // console.log(option);

                  return (
                    <li key={key} {...optionProps}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 10 }}
                        checked={selected}
                      />

                      {option.productnameth}
                    </li>
                  );
                }}
                // style={{ height: 500 }}
                renderInput={(params) => (
                  <TextField className="" {...params} placeholder="สินค้า" />
                )}
              />
            </div>
          )}

          <div>
            <div>ราคาลด %</div>
            <input
              type="number"
              value={discount}
              max={100}
              min={0}
              className="w-full rounded-md"
              // placeholder="0"
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div>
            <div>วันที่เริ่ม</div>
            <input
              type="date"
              value={promotionstart}
              className="text-black"
              onChange={(e) => setPromotionstart(e.target.value)}
            />
          </div>

          <div>
            <div>วันที่สิ้นสุด</div>
            <input
              type="date"
              value={promotionend}
              className="text-black"
              onChange={(e) => setPromotionend(e.target.value)}
            />
          </div>

          <div>
            <div>รายละเอียด</div>
            <input
              type="text"
              value={promotiondetail}
              onChange={(e) => setPromotiondetail(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-2 border-t-2 border-gray-300 pt-2">
          <button className="btn" onClick={handleAdd}>
            <i className="fa-solid fa-plus mr-2"></i>
            เพิ่ม
          </button>
        </div>
      </ModalWauto>

      {/* แก้ไข */}
      <ModalWauto
        title="แก้ไขโปรโมชั่น"
        isOpen={isEditOpen}
        onClose={handleCloseModal}
        className="w-[350px] md:w-[580px] xl:w-[800px] md:max-h-[800px] z-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[800px] md:max-h-[650px] overflow-y-auto">
          <div>
            <div>ชื่อโปรโมชั่น</div>
            <input
              type="text"
              className=""
              value={promotionname}
              onChange={(e) => setPromotionname(e.target.value)}
            />
          </div>

          <div>
            <div>ชื่อย่อ (ใช้สำหรับแสดงหน้าสินค้า)</div>
            <input
              type="text"
              value={initial}
              className=""
              onChange={(e) => setInitial(e.target.value)}
            />
          </div>
          {/* <div>
            <div>ร้านค้า</div>
            <select
              className="w-full h-[56px] p-2 border border-[#2B5F60] rounded-md"
              value={shopid}
              onChange={(e) => setShopid(e.target.value)}
            >
              {shopslist.map((shop: Shop) => (
                <option key={shop.shopid} value={shop.shopid}>
                  {shop.shopnameth}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <div>รูปแบบโปรโมชั่น</div>
            {/* <input type="text" value={typepromotions} onChange={(e) => setTypepromotions(e.target.value)} />
             */}
            <select
              className="w-full p-2 border border-[#2B5F60] rounded-md"
              name="typepromotions"
              value={typepromotions}
              onChange={(e) => {
                setTypepromotions(e.target.value);
              }}
              id="typepromotions"
            >
              {typepromotionsList.map((typepromotions) => (
                <option key={typepromotions.value} value={typepromotions.value}>
                  {typepromotions.label}
                </option>
              ))}
            </select>
          </div>

          {typepromotions === "ส่วนลดสินค้า" && (
            <div>
              <div>เลือกสินค้า</div>
              {/* <select
                className="w-full h-[56px] p-2 border border-[#2B5F60] rounded-md"
                name="products"
                value={product}
                id="products"
                onChange={(e) => setProduct(e.target.value)}
              >
                {products.map((product: Product) => (
                  <option key={product.productid} value={product.productid}>
                    {product.productnameth}
                  </option>
                ))}
              </select> */}

              <Autocomplete
                sx={{
                  width: "100%",
                  border: "1px solid #2B5F60",
                  borderRadius: "5px",
                  padding: "0px 0px",
                  "& .MuiOutlinedInput-root": {
                    padding: "0px",
                    minHeight: "39px",
                    "& .MuiAutocomplete-input": {
                      paddingX: "12px",
                      paddingY: "2px",
                    },
                  },
                }}
                multiple
                id="checkboxes-tags-edit"
                options={products}
                value={productidlist}
                isOptionEqualToValue={(option, value) =>
                  option.productid === value.productid
                }
                limitTags={1}
                disableCloseOnSelect
                getOptionLabel={(option) => option.productnameth}
                onChange={(event, newValue) => {
                  // console.log(value);
                  setProductidlist(newValue);
                }}
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  // console.log(option);

                  return (
                    <li key={key} {...optionProps}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 10 }}
                        checked={selected}
                      />

                      {option.productnameth}
                    </li>
                  );
                }}
                // style={{ height: 500 }}
                renderInput={(params) => (
                  <TextField className="" {...params} placeholder="สินค้า" />
                )}
              />
            </div>
          )}

          <div>
            <div>ราคาลด %</div>
            <input
              type="number"
              value={discount}
              max={100}
              min={0}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div>
            <div>วันที่เริ่ม</div>
            <input
              type="date"
              value={promotionstart}
              onChange={(e) => setPromotionstart(e.target.value)}
            />
          </div>

          <div>
            <div>วันที่สิ้นสุด</div>
            <input
              type="date"
              value={promotionend}
              onChange={(e) => setPromotionend(e.target.value)}
            />
          </div>

          <div>
            <div>รายละเอียด</div>
            <input
              type="text"
              value={promotiondetail}
              onChange={(e) => setPromotiondetail(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-2 border-t-2 border-gray-300 pt-2">
          <button className="btn" onClick={handleEditSave}>
            <i className="fa-solid fa-save mr-2"></i>
            บันทึก
          </button>
        </div>
      </ModalWauto>
    </div>
  );
}
