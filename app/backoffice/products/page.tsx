"use client"

import React, { useEffect, useState , useCallback , useRef } from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
// import Modal from "@/app/modal";
import ModalWauto  from '@/app/modalW-Auto';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from "../../components/LoadingSpinner"
import { format, set } from 'date-fns';
// import { useRouter } from "next/navigation";
import Image from 'next/image';
import { BiCategoryAlt } from "react-icons/bi";
import GategoryProductPage from './category'
import Selectshop  from '@/app/components/selectshop';
import Papa from "papaparse";
import escapeCSV from '@/app/components/escapeCSV';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
// import { Result } from 'postcss';

export default function ProductsPage() {

  // const router = useRouter();

  interface Promotion {
    promotionid: string;
    typepromotions: string;
    promoname: string;
    datepromostart: number;
    datepromoend: string;
    discount: number;
    productid: string;
    initial: string;
  }

  // ใช้สําหรับเก็บข้อมูลสินค้า
  interface Product {
    productid: string;
    shopid: string;
    productnameth: string
    productnameeng: string;
    productdatath: string;
    productdataeng: string;
    productprice: number;
    productimage: string;
    productCgtyId: string;
    productremain: number;
    update_PRemain: string;
    promotion: Array<Promotion>;
    additional: [string];
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

  // ใช้สําหรับเก็บข้อมูลสินค้า
  interface Category {
    productCgtyId: string;
    categoryname: string;
  }

  const [importFile, setImportFile] = useState<File | null>(null);
  const colorPromotions = ["#fe5000", "#009f4d", "#0077c8"];
 
  const [level, setLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true); // ใช้สําหรับตรวจสอบการโหลดข้อมูล
  const [date, setDate] = useState('-'); // ใช้สําหรับเก็บวันที่ปัจจุบัน
  
  const [products, setProducts] = useState<Product[]>([]); // ใช้สําหรับเก็บข้อมูลสินค้า
  const [shops, setShops] = useState<Shop[]>([]); // ใช้สําหรับเก็บข้อมูลร้านค้า

  const [isOpen, setIsOpen] = useState(false); // ใช้สําหรับเปิด/ปิด Modal
  const [isOpenCreate, setIsOpenCreate] = useState(false); // ใช้สําหรับเปิด/ปิด Modal
  const [isOpentreasury, setIsOpentreasury] = useState(false);
  const [isOpenDataManagement, setIsOpenDataManagement] = useState(false);

  const [shopid, setShopid] = useState(""); // 
  
  const [productid, setProductid] = useState(""); // 
  const [productnameth, setProductnameth] = useState(""); //
  const [productnameeng, setProductnameeng] = useState("");
  const [productdatath, setProductdatath] = useState("");
  const [productdataeng, setProductdataeng] = useState("");
  const [productprice, setProductprice] = useState(0);
  const [image, setImage] = useState<File | null>(null); // สร้าง state สำหรับเก็บไฟล์รูปภาพ
  const [imagePath, setImagePath] = useState('');
  const [productremain, setProductremain] = useState(0); // เก็บจำนวนคงเหลือ
  const [update_PRemain, setUpdate_PRemain] = useState("-");
  const [additional, setAdditional] = useState<string[]>([]);

  const [search, setSearch] = useState(""); // เก็บคำค้นหา
  const [categorylist, setCategorylist] = useState<Category[]>([]);
  const [categoryid, setCategoryid] = useState(""); 
  const [productCgtyId, setProductCgtyId] = useState("0");
  
  // const [shopidExport, setShopidExport] = useState("");
  // const [shopidImport, setShopidImport] = useState("");
  const [productCgtyIdExport, setProductCgtyIdExport] = useState("0");
  const [productCgtyIdImport, setProductCgtyIdImport] = useState("0");

  const [gategoryPage, setGategoryPage] = useState(false);

  const shopidRef = useRef(shopid); 
  const searchRef = useRef(search);
  // const [uomtext, setUomtext] = useState("จาน");

  useEffect(() => {
  
    fetchDataFirst(); // เรียกใช้ฟังก์ชัน fetchDataFirst เมื่อ component ถูก mount

    const datenow = " "+new Date().toLocaleString('th-TH', {
      hour12: false,
      weekday: 'long',
      month: 'long',
      year: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
    });

    setDate(datenow+" น.");
    
    const intervalId = setInterval(() => {

      const datenow = " "+new Date().toLocaleString('th-TH', {
        hour12: false,
        weekday: 'long',
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
      });

      setDate(datenow+" น.");
    }, 1000); // อัปเดตทุก 1 วินาที

    return () => {
      clearInterval(intervalId);
    } 
  }, []);

    // เริ่มแรก
    // Wrap fetchDataFirst in useCallback
    const fetchDataFirst = useCallback(async () => {
      setIsLoading(true);
      try {

        const headers = {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        };

        // ตรวจสอบการเข้าสู่ระบบ
        await axios
          .get(`${config.apiUrl}/backoffice/checklogin`, {
            headers: headers,
          })
          .then((res) => {
            if (res.status == 200) {
              setLevel(res.data.level);
            }
          });

        const responseshop = await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {
          headers
        });

        const shopData = responseshop.data.result;
        setShops(shopData);

        if (shopData && shopData.length > 0) {

          await axios.post(`${config.apiUrl}/backoffice/productcategorylist`,
            { shopid: shopData[0].shopid } ,
            {headers}
          )
          .then(async(result)=>{

            const categoryData = result.data.result;
            // if(result.data.result.length > 0){
            //   // const categoryid = categoryData[0].productCgtyId || "";
            //   setCategoryid(result.data.result[0].productCgtyId);
            // }else{
            //   setCategoryid('');
            // }

            setCategorylist(categoryData);

            const firstShopId = shopData[0].shopid;
            setShopid(firstShopId);
            // setShopidExport(firstShopId);
            // setShopidImport(firstShopId);

            shopidRef.current = firstShopId;
  
            const productlistResponse = await axios.post(`${config.apiUrl}/backoffice/productlist`,
              { shopid: firstShopId},
              {
                params: { search: "" }, // Initial search is empty for fetchDataFirst
                headers: {
                  'Content-Type': 'application/json',
                  'X-API-KEY': config.apiKey,
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
              }
            );
  
            const initialProducts = productlistResponse.data.result;
            if (initialProducts) {
              const updatedProducts: Product[] = [...initialProducts];
              for (let i = 0; i < updatedProducts.length; i++) {
                const element = updatedProducts[i];
                const productsDetailResponse = await axios.post(
                  `${config.apiUrl}/backoffice/productdetail`,
                  { productid: element.productid },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'X-API-KEY': config.apiKey, // Specific API key for productdetail
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                  }
                );

                const str = productsDetailResponse.data.additional || "";
                
                if(str !== "" || str !== null || str !== undefined){
                  const arr = str
                  .split('#')
                  .filter(Boolean)
                  .map((item: string) => `#${item}`);
                  
                  productsDetailResponse.data.additional = arr;
                }
                // console.log(productsDetailResponse.data.additional)
                updatedProducts[i] = productsDetailResponse.data;


              }
              setProducts(updatedProducts);
            } else {
              setProducts([]);
            }
          })

        } else {
          setProducts([]);
          setShopid("");
          // setCategoryid("");
          // setCategorylist([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          Swal.fire({
              icon: 'error',
              title: 'ผิดพลาด',
              text: `fetchDataFirst: ${err.message}`,
          });
        } else {
          Swal.fire({
              icon: 'error',
              title: 'ผิดพลาด',
              text: 'fetchDataFirst: เกิดข้อผิดพลาดที่ไม่รู้จัก',
          });
        }
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, []);
    
    const fetchData = useCallback(async () => {

      if (!shopid) {
        return;
      }

      setIsLoading(true);

      try {

        const shopidR = shopidRef.current;
        const searchR = searchRef.current;


        const headers = {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        const responseshop = await axios.get(`${config.apiUrl}/backoffice/headerdatashopslist`, {
          headers
        });

        const shopData = responseshop.data.result;
        setShops(shopData);

        await axios.post(`${config.apiUrl}/backoffice/productcategorylist`,
            { shopid: shopidR } ,
            {headers}
          )
          .then(async(result)=>{

            const categoryData = result.data.result;

            setCategorylist(categoryData);
            setCategoryid(categoryid);
            
            const productlistResponse = await axios.post(`${config.apiUrl}/backoffice/productlist`,
              { shopid: shopidR },
              {
                params: { search: searchR },
                headers
              },
            );

            const productsFromList = productlistResponse.data.result;
            if (productsFromList) {
              const updatedProducts: Product[] = [...productsFromList];
              for (let i = 0; i < updatedProducts.length; i++) {
                  const element = updatedProducts[i];
                  const productsDetailResponse = await axios.post(
                      `${config.apiUrl}/backoffice/productdetail`,
                      {productid: element.productid },
                      {headers}
                  );

                  const str = productsDetailResponse.data.additional || "";
                
                  if(str !== "" || str !== null || str !== undefined){
                    const arr = str
                    .split('#')
                    .filter(Boolean)
                    .map((item: string) => `#${item}`);
                    
                    productsDetailResponse.data.additional = arr;
                  }

                  updatedProducts[i] = productsDetailResponse.data;
              }

              setProducts(updatedProducts);
            } else {
              setProducts([]);
            }

          })
          
      } catch (err: unknown) {
        if (err instanceof Error) {
          Swal.fire({
              icon: 'error',
              title: 'ผิดพลาด',
              text: `fetchData: ${err.message}`,
          });
        } else {
          Swal.fire({
              icon: 'error',
              title: 'ผิดพลาด',
              text: 'fetchData: เกิดข้อผิดพลาดที่ไม่รู้จัก',
          });
        }
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, [search, shopid, config.apiUrl, config.apiKey, setProducts]);

    // เลือก shop
    // const productlist = useCallback(async (selectedShopId: string) => {
    //   setIsLoading(true);
    //   setShopid(selectedShopId);
    //   try {

    //     // const shopidref_ = 

    //     const headers = {
    //       'Content-Type': 'application/json',
    //       'X-API-KEY': config.apiKey,
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     };


    //     // await axios.post(`${config.apiUrl}/backoffice/productcategorylist`,
    //     //     { shopid: selectedShopId } ,
    //     //     {headers}
    //     //   )
    //     //   .then(async(result)=>{

    //     //     const categoryData = result.data.result;

    //     //     if(result.data.result.length > 0){
    //     //       setCategoryid(result.data.result[0].productCgtyId);
    //     //     }else{
    //     //       setCategoryid('');
    //     //     }

    //     //     setCategorylist(categoryData);
    //     //   })


    //     const productlistResponse = await axios.post(`${config.apiUrl}/backoffice/productlist`,
    //       { shopid: selectedShopId },
    //       {headers},
    //     );



    //     const productsFromList = productlistResponse.data.result;
    //     if (productsFromList) {
    //       const updatedProducts: Product[] = [...productsFromList];
    //       for (let i = 0; i < updatedProducts.length; i++) {
    //           const element = updatedProducts[i];
    //           const productsDetailResponse = await axios.post(
    //               `${config.apiUrl}/backoffice/productdetail`,
    //               { productid: element.productid },
    //               {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'X-API-KEY': config.apiKey, // Specific API key for productdetail
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                 },
    //               }
    //           );
    //           updatedProducts[i] = productsDetailResponse.data;
    //       }
    //       // console.log(updatedProducts);
    //       setProducts(updatedProducts);
    //     } else {
    //       setProducts([]);
    //     }
    //   } catch (err: unknown) {
    //     if (err instanceof Error) {
    //       Swal.fire({
    //           icon: 'error',
    //           title: 'ผิดพลาด',
    //           text: `productlist: ${err.message}`,
    //       });
    //     } else {
    //       Swal.fire({
    //           icon: 'error',
    //           title: 'ผิดพลาด',
    //           text: 'productlist: เกิดข้อผิดพลาดที่ไม่รู้จัก',
    //       });
    //     }
    //     setProducts([]);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }, [config.apiUrl, config.apiKey, setShopid, setProducts]);

    const handleOpenModal = () => {
      setIsOpen(true);
    }
  
    const handleCloseModal = () => {
      setIsOpen(false);
      setIsOpenCreate(false);
      setIsOpentreasury(false);
      setIsOpenDataManagement(false);
    }
    
    const handleEdit = (productid: string) => {
      
      const product:Product | undefined= products.find((product: Product) => product.productid === productid);
      
      if (product) {

        setProductid(product.productid ?? '');
        setShopid(product.shopid ?? '');
        setProductnameth(product.productnameth ?? '');
        setProductnameeng(product.productnameeng ?? '');
        setProductdatath(product.productdatath ?? '');
        setProductdataeng(product.productdataeng ?? '');
        setProductprice(product.productprice ?? 0);
        // setUomtext(product.shopexpiredate ?? '');
        setProductCgtyId(product.productCgtyId ?? '0');
        setImagePath(product.productimage ?? '');
        setAdditional(product.additional ?? []);
        // setCategoryid(product.productCgtyId ?? '');
        
        handleOpenModal();
      }
    }

    const handleEdittreasury = (productid: string) => {

      const product:Product | undefined= products.find((product: Product) => product.productid === productid);
      
      if (product) {

        setProductid(product.productid ?? '');
        setShopid(product.shopid ?? '');
        setProductnameth(product.productnameth ?? '');
        setProductnameeng(product.productnameeng ?? '');
        setProductdatath(product.productdatath ?? '');
        setProductdataeng(product.productdataeng ?? '');
        setProductprice(product.productprice ?? 0);
        // setUomtext(product.shopexpiredate ?? '');
        setProductCgtyId(product.productCgtyId ?? '0');
        setImagePath(product.productimage ?? '');
        setProductremain(product.productremain ?? 0);
        setUpdate_PRemain(product.update_PRemain ?? '-');
        // setCategoryid(product.productCgtyId ?? '');
        
      }

      setIsOpentreasury(true);
    }
    
    const handleEditSave = async () => {

      try {

        const payload = {
          productid: productid,
          shopid: shopid, 
          productnameth: productnameth,
          productnameeng: productnameeng,
          productdatath: productdatath,
          productdataeng: productdataeng,
          productprice: productprice,
          productimage: image || null, // ส่งค่า image ที่เลือกใน state
          productimageold: imagePath, // ส่งค่า image ที่เลือกใน state
          productCgtyId: productCgtyId,
          additional: additional.join(''), // ได้ string ที่ต่อกันหมด
          // productCgtyId: categoryid
        }

        const payloadZoo = {
          nameTh: productnameth,
          nameEn: productnameeng,
          detailTh: productdatath,
          detailEn: productdataeng,
          price: productprice,
          // status: "ACTIVE"
        }

        await axios.put(`${config.apiUrlZoo}/foods/${productid}`,payloadZoo,
          {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': `${config.apiZookey}`,
          },
        })
        
        await axios.put(`${config.apiUrl}/backoffice/productupdate`, payload,
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
      })
      // if (id === 0) {
        //     // เพิ่มรายการ
        //     await axios.post(`${config.apiUrl}/buy/create`, payload);
        // } else {
          //     // แก้ไขรายการ
          //     await axios.put(`${config.apiUrl}/buy/update/${id}`, payload);
          //     setId(0);
          // }
          handleCloseModal();
          // productlist(shopid);
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
    
    const handleOpenCreate = () => {

      handleClear();

      if(categorylist.length > 0){
        setProductCgtyId(categorylist[0].productCgtyId);
        
      }else{
        setProductCgtyId('0');
      }
      setIsOpenCreate(true);
    }

    const handleCreate = async () => {

      try {

        if (productnameth === '' || productnameth ===null){
          Swal.fire({
            icon: "warning",
            title: "กรุณากรอกชื่อสินค้าภาษาไทย",
            text: "กรุณากรอกข้อมูลให้ถูกต้อง",
          });
          return;
        }else if(productnameeng === '' || productnameeng === null){
          Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกชื่อสินค้าภาษาอังกฤษ',
            text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
          });
          return;
        }

        const uuid = uuidv4()

        const payloadZoo = {
          productId: uuid,
          posShopId: shopid, 
          nameTh: productnameth,
          nameEn: productnameeng,
          detailTh: productdatath,
          detailEn: productdataeng,
          price: productprice,
          
          // status: "ACTIVE"
        }

        const payload = {
          productid: uuid,
          shopid: shopid, 
          productnameth: productnameth,
          productnameeng: productnameeng,
          productdatath: productdatath,
          productdataeng: productdataeng,
          productprice: productprice,
          productimage: image,
          productCgtyId: productCgtyId,
          additional: additional.join(''), // ได้ string ที่ต่อกันหมด
          // productCgtyId: categoryid
        }


        await axios.post(`${config.apiUrlZoo}/foods`, payloadZoo,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': `${config.apiZookey}`,
          },
        })

        await axios.post(`${config.apiUrl}/backoffice/productcreate`, payload,
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
        })

        handleCloseModal();
        // productlist(shopid);
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

    const handleDelete = async () => {

      // แสดงกล่องข้อความยืนยันก่อนลบ
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#2B5F60',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
      });
  
      // หากผู้ใช้กดยืนยัน
      if (result.isConfirmed) {
        
        try {
          const payload = {
            productid: productid
          }
        // console.log(productid);
  
        await axios.delete(`${config.apiUrlZoo}/foods/${productid}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': `${config.apiZookey}`
          },
        })
  
        await axios.delete(`${config.apiUrl}/backoffice/productdelete`,
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
        // productlist(shopid);
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
    }
    const handleClear = () => {
      // setProductid('');
      // setShopid('');
      setAdditional([]);
      setProductnameth('');
      setProductnameeng('');
      setProductdatath('');
      setProductdataeng('');
      setProductprice(0);
      setImage(null); // รีเซ็ตค่า Image เป็น nulls
      setProductCgtyId('0');
      // setCategoryid('');
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]); // เก็บไฟล์รูปภาพใน state
      }
    };

    const Edittreasurysave = async () => {

      try {

        const headers = {

          'Content-Type': 'application/json', // ตัวอย่าง header Content-Type
          'X-API-KEY': config.apiKey, // ตัวอย่าง header Authorization
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          // เพิ่ม header อื่นๆ ตามต้องการ
        }

        const payload = {
          productid: productid,
          productremain: productremain
        }

        await axios.put(`${config.apiUrl}/backoffice/productupdatestock`, 
          payload,
          {headers},
        ).then(async () => {

          Swal.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลเรียบร้อย',
            text: 'ข้อมูลถูกเพิ่มเรียบร้อย',
            timer: 2000
          });
          
          fetchData();
          handleCloseModal();

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
          })
        }
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

      setIsLoading(false);

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
            "ชื่อสินค้าภาษาไทย", 
            "ชื่อสินค้าภาษาอังกฤษ",
            "ข้อมูลสินค้าภาษาไทย",
            "ข้อมูลสินค้าภาษาอังกฤษ",
            "ราคา",
            "จํานวนคงเหลือ",
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

          // 4. ชื่อสินค้าภาษาไทย ภาษาอังกฤษต้องไม่ว่าง
          const invalidRows = data.filter(
            (row) =>
              !row["ชื่อสินค้าภาษาไทย"]?.trim() ||
              !row["ชื่อสินค้าภาษาอังกฤษ"]?.trim() ||
              !row["ราคา"]?.trim() ||
              !row["จํานวนคงเหลือ"]?.trim()

          );
          if (invalidRows.length > 0) {
            Swal.fire({
              icon: "error",
              title: "ข้อมูลไม่ครบถ้วน",
              text: "ชื่อสินค้าภาษาไทย,ภาษาอังกฤษ,ราคา,จํานวนคงเหลือ จะต้องไม่ว่าง",
            });
            setIsLoading(false);
            return;
          }
          // console.log(data);

          const payload = data.map((row) => ({
            productnameth: row["ชื่อสินค้าภาษาไทย"],
            productnameeng: row["ชื่อสินค้าภาษาอังกฤษ"],
            productdatath: row["ข้อมูลสินค้าภาษาไทย"],
            productdataeng: row["ข้อมูลสินค้าภาษาอังกฤษ"],
            productprice: row["ราคา"],
            productremain: row["จํานวนคงเหลือ"],
            shopid: shopid,
            productCgtyId: productCgtyIdImport,
          }))

          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "X-API-KEY": config.apiKey,
          };

          await axios.post(`${config.apiUrl}/backoffice/importproducts`, {
            shopid: shopid,
            products: payload
          }, {
            headers
          })

          fetchData();
          setIsLoading(false);

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
          setIsLoading(false);
        },
      });
    };

    // ฟังก์ชันสำหรับ Export CSV
    const handleExportCSV = async() => {

      try {
        
        setIsLoading(true);

        const shopidE = shopid;
        const shopnameE = shops.filter((shop: Shop) => shop.shopid === shopid)[0].shopnameth;
        
        // console.log(productCgtyIdExport);

        const categoryidE = categorylist.length > 0 ? 
          categorylist.filter((category: Category) => category.productCgtyId === productCgtyIdExport)[0]?.productCgtyId || "0"
          : "0";

        const categorynameE = categorylist.length > 0 ? 
          categorylist.filter((category: Category) => category.productCgtyId === productCgtyIdExport)[0]?.categoryname || "สินค้าไม่มีหมวดหมู่"
          : "สินค้าไม่มีหมวดหมู่"; 

        const headers = {
          'Content-Type': 'application/json',
          'X-API-KEY': config.apiKey,
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        };

        await axios.post(`${config.apiUrl}/backoffice/exportproducts`, { shopid: shopidE, productCgtyId: categoryidE }, { headers: headers })
          .then(async(response) => {
            
            const productExport: Product[] = [];

            if (response.data.result.length > 0 ) {
              productExport.push(...response.data.result);
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            if (!productExport || productExport.length === 0) {
              Swal.fire({
                icon: 'info',
                title: 'ไม่มีข้อมูล',
                text: 'ไม่มีข้อมูลสินค้าสำหรับส่งออก',
                timer: 2000
              });

              setIsLoading(false);
              return;
            }
        
            const headersCSV = [
              'ชื่อสินค้าภาษาไทย', 
              'ชื่อสินค้าภาษาอังกฤษ', 
              'ข้อมูลสินค้าภาษาไทย', 
              'ข้อมูลสินค้าภาษาอังกฤษ',
              'ราคา',
              'จํานวนคงเหลือ'
            ];
            
            const rows = productExport.map((productE) => [
              escapeCSV(productE.productnameth),
              escapeCSV(productE.productnameeng),
              escapeCSV(productE.productdatath),
              escapeCSV(productE.productdataeng),
              escapeCSV(productE.productprice),
              escapeCSV(productE.productremain)
            ]);
        
            const csvContent = [
              headersCSV.join(','),
              ...rows.map(row => row.join(',')),
            ].join('\n');
        
            const dateStr = format(new Date(), 'yyyy-MM-dd'); // YYYY-MM-DD
            downloadCSV(csvContent, `${shopnameE}_${categorynameE},_${dateStr}.csv`);

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
        // Swal.fire({
        //   icon: 'error',
        //   title: 'ไม่สามารถโหลดข้อมูลได้',
        //   text: error,
        // });
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

    if(gategoryPage){
      return (
        <div className="relative flex flex-col gap-4 ">
      
          <button
            onClick={() => {
              setGategoryPage(false);
              fetchData();
            }}
            className="absolute  self-start mt-2 px-4 py-2 bg-[#009f4d] text-white rounded-md hover:border-[#3DA48F] hover:bg-[#3DA48F] transition-colors"
          >
            &larr; กลับไปที่หน้าสินค้า
          </button>

          <GategoryProductPage  
          // params={
          //   {
          //     className: "absolute top-10 w-full",
          //     shopid_ : shopid
          //   }
          // }
          shopid_= {shopid}
          className='mt-10 w-full'
          />

        </div>
      )
    }

    const totalprice = (product: Product) => {
      let totalDiscount = product.promotion.reduce((total, promo) => total + Number(promo.discount),0 ) ;

      if (totalDiscount > 100) {

        totalDiscount = 100;

      }

      const totalDiscountPercentage = (Number(product.productprice) * (100 - totalDiscount))/100 ;

      return totalDiscountPercentage.toFixed(2).toLocaleString()
    }


    
    return (
      <div className="flex flex-col">
        {/* header */}
        <div className="text-black">
          <p className="text-xl md:text-2xl xl:text-4xl  pt-4 font-bold ">
            สินค้า
          </p>
          <p className="text-xs md:text-md xl:text-lg pt-2">{date}</p>
        </div>

        {/* เส้นคั่น */}
        <hr className="w-full mt-2 border-t-3 border-[#2B5F60]" />

        {/* table content */}
        <div className="w-full mt-2 px-4 rounded-lg overflow-auto">

          {/* header content */}
          <div className="flex flex-col xl:flex-row items-start xl:justify-between xl:items-center mb-2">
            {/* title */}
            <div className="flex flex-row justify-between items-center ">
              <p className="text-lg xl:text-2xl font-bold text-black">
                จัดการสินค้า
              </p>
            </div>

            <div className="text-[14px] xl:text-[16px] mt-2 grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-row xl:justify-between xl:items-center gap-2 xl:gap-4">
              {/* <div className="w-[200px] h-[40px] bg-[#a51890] text-black shadow-lg rounded-md flex flex-row justify-center items-center">
                <p className="text-white">โปรโมชั่นต้อนรับปีใหม่</p>
              </div> */}

              {/* select shop */}
              {level === "Owner" && (
                <Selectshop
                  shopid={shopid}
                  shopslist={shops}
                  className="w-[220px]"
                  onChange={(value) => {
                    setShopid(value);
                    shopidRef.current = value;
                    fetchData();
                  }}
                />
              )}

              {/* select category */}
              <div className="relative">
                {/* <p className="absolute -top-6 left-1 text-black">
                  หมวดหมู่สินค้า
                </p> */}
                <select
                  className="text-[14px] xl:text-[16px] w-[220px] h-[40px] xl:w-[180px] xl:h-[40px]
                  p-2 rounded-md border-solid border text-black border-[#009f4d] border-opacity-50 overflow-x-hedden"
                  value={categoryid}
                  onChange={(e) => {
                    setCategoryid(e.target.value);
                  }}
                >
                  <option value="">ทั้งหมด</option>
                  {Array.isArray(categorylist) && categorylist.length > 0
                    ? categorylist.map((category: Category) => (
                        <option
                          className=""
                          key={category.productCgtyId}
                          value={category.productCgtyId}
                        >
                          {category.categoryname}
                        </option>
                      ))
                    : null}
                  <option value="0">สินค้าไม่มีหมวดหมู่</option>
                </select>
              </div>

              {/* Category product */}
              {level !== "Employee" && (
                <button
                  className="btn w-[220px] xl:w-[220px] h-[40px] text-white rounded-md
                  flex flex-row justify-center items-center gap-1
                  "
                  onClick={() => setGategoryPage(true)} // ไปที่หน้าจัดการหมวดหมู่สินค้า
                >
                  <BiCategoryAlt
                    size={20}
                    className=" w-[16px] h-[16px] xl:w-[20px] xl:h-[20px]"
                  />
                  <span className="text-[14px] xl:text-[16px]">จัดการหมวดหมู่สินค้า</span>
                </button>
              )}

              {level !== "Employee" && (
                <button
                  className="btn w-[220px] xl:w-[220px] h-[40px] text-white rounded-md
                  flex flex-row justify-center items-center gap-x-2
                  "
                  onClick={() => setIsOpenDataManagement(true)} // ไปที่หน้าจัดการหมวดหมู่สินค้า
                >
                  <i className=" fa-solid fa-database "></i>
                  <span className="">จัดการข้อมูลสินค้า</span>
                </button>
              )}

              {/* ค้นหา */}
              <div className="relative md:col-span-2 ">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  placeholder="Search for Product..."
                  className=" md:w-full xl:w-[300px] p-2 pl-10 rounded-lg border bg-[#F6F4F4] border-[#009f4d] text-black focus:outline-none focus:ring-2 focus:ring-[#009f4d]"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchRef.current = e.target.value;
                  }} // อัปเดตคำค้นหาใน State
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchData(); // ค้นหาเมื่อกด Enter
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* content product */}
          <div className="h-auto mb-4 overflow-x-auto gap-x-auto gap-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-6 mt-[20px]">
            {/* ${level !== "Employee" ? "h-[300px] md:h-[260px] xl:h-[300px]" : "h-[240px] md:h-[200px] xl:h-[240px] pb-3"} */}

            {/* เพิ่มสินค้า */}
            {level !== "Employee" && (
              <div className="min-w-[160px] md:min-w-[150px] h-[300px] md:h-[260px] xl:h-[300px] bg-white border-dashed border-2 border-[#009f4d] border-opacity-50 rounded-xl  flex flex-col items-center">
                <button
                  className="w-full h-full text-[#009f4d]  bg-[#84bd00] bg-opacity-20"
                  onClick={handleOpenCreate}
                >
                  <i className="fa-solid fa-plus py-4"></i>
                  <p className="text-[16px]">เพิ่มสินค้า</p>
                </button>
              </div>
            )}

            {/* รายการสินค้า */}
            {/* {Array.isArray(products) && products.filter((product: Product) => product.productCgtyId === categoryid).length > 0 ? ( */}
            {Array.isArray(products) && products.length > 0 ? (
              products
                .filter((product: Product) => {
                  if (categoryid === "") {
                    // "ทั้งหมด" (All categories)
                    return true; // Include all products
                  }
                  // For a specific category, or "สินค้าไม่มีหมวดหมู่" (where categoryid is "0")
                  // This assumes product.productCgtyId will be "0" for products with no category.
                  return product.productCgtyId === categoryid;
                })
                .map((product: Product) => (
                  <div
                    key={product.productid}
                    className={`relative 
                      min-w-[150px] ${
                        level !== "Employee"
                          ? "h-[300px] md:h-[260px] xl:h-[300px]"
                          : "h-[240px] md:h-[200px] xl:h-[240px] pb-3"
                      } 
                    bg-white rounded-xl border-solid border border-black 
                    flex flex-col items-center justify-between`}
                  >
                    <div className="relative w-full">
                      <Image
                        className="object-cover w-full h-[160px] md:h-[140px] xl:h-[160px] rounded-t-xl"
                        width={260}
                        height={160}
                        alt="product"
                        src={
                          product.productimage
                            ? `${config.apiUrlImage}/${product.productimage}`
                            : "https://placehold.co/260x160"
                        }
                      />

                      <div className="absolute w-[140px] h-[40px] top-3 left-0  bg-opacity-80 bg-white rounded-br-lg rounded-tr-lg p-1 flex justify-start items-center">
                        <p className="text-black text-sm xl:text-[16px]">
                          คงเหลือ:{" "}
                          {Number(product.productremain).toLocaleString()}
                        </p>
                      </div>

                      {product.promotion && product.promotion.length > 0 && (
                        <>
                          <div className="absolute w-[80px] h-[30px] md:w-[100px] xl:h-[40px] top-3 -right-0 rounded-bl-lg rounded-tl-lg p-1 bg-[#e4002b] bg-opacity-85 shadow flex justify-center items-center">
                            <p className="text-white text-sm xl:text-lg">
                              ลด{" "}
                              {`${
                                product.promotion.reduce(
                                  (total, promo) =>
                                    total + Number(promo.discount),
                                  0
                                ) > 100
                                  ? 100
                                  : product.promotion.reduce(
                                      (total, promo) =>
                                        total + Number(promo.discount),
                                      0
                                    )
                              }`}
                              %
                            </p>
                          </div>

                          <div className="absolute bottom-0 left-0">
                            {Array.isArray(products) && products.length > 0 ? (
                              <div className="min-w-[150px] h-[20px] xl:h-[25px] flex flex-row ">
                                {product.promotion.map(
                                  (promo: Promotion, index: number) => {
                                    if (index > 2) return null;

                                    return (
                                      <div
                                        key={promo.promotionid}
                                        className={`flex items-center w-[87px] h-full pl-1 pr-1 bg-[${colorPromotions[index]}] bg-opacity-90 shadow overflow-y-hidden overflow-scroll no-scrollbar`}
                                      >
                                        <p className="text-white text-[10px] xl:text-xs">
                                          {promo.initial}
                                        </p>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="">
                      <div className="pt-2 flex flex-col justify-center items-center text-black">
                        <p className="text-sm xl:text-md">
                          {product.productnameth.length > 30
                            ? product.productnameth.substring(0, 30) + "..."
                            : product.productnameth || ""}
                        </p>
                        <div className="flex flex-row justify-center items-center gap-x-3">
                          {product.promotion &&
                            product.promotion.length > 0 && (
                              <p className="line-through text-sm">
                                ฿ {product.productprice}
                              </p>
                            )}
                          <p className="text-md">
                            ฿{" "}
                            {/* {Number(product.productprice)
                              .toFixed(2)
                              .toLocaleString()} */}
                            {product.promotion &&
                            product.promotion.length > 0 ? (
                              <>{`${totalprice(product)}`}</>
                            ) : (
                              product.productprice
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {level !== "Employee" && (
                      <div className="w-full pt-2 flex justify-center items-center">
                        <button
                          className="w-full h-[55px] text-black  bg-[#84bd00] bg-opacity-30 p-3 rounded-bl-lg"
                          onClick={() => handleEdit(product.productid)}
                        >
                          <i className="fa-solid fa-pen pr-2 text-sm xl:text-lg"></i>
                          <span className="text-sm xl:text-md">แก้ไข</span>
                        </button>

                        <button
                          className="w-full h-[55px] text-black  bg-[#84bd00] bg-opacity-30 p-3 rounded-br-lg"
                          onClick={() => handleEdittreasury(product.productid)}
                        >
                          <i className="fa-solid fa-box pr-2 text-sm xl:text-lg"></i>
                          <span className="text-sm xl:text-md">แก้ไขคลัง</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div
                className={`min-w-[150px] xl:min-w-[260px] h-[300px] ${
                  level !== "Employee"
                    ? "h-[300px] md:h-[260px] xl:h-[300px]"
                    : "h-[240px] md:h-[200px] xl:h-[240px] pb-3"
                } pt-4 bg-white rounded-xl border-solid border-2 border-[#009f4d] border-opacity-60  flex flex-col justify-center items-center gap-4`}
              >
                <p className="text-[16px] font-bold text-black  opacity-60">
                  ไม่มีข้อมูลสินค้า
                </p>
                <p className="text-[14px] text-black  opacity-60">
                  กรุณาเพิ่มข้อมูลสินค้า
                </p>
              </div>
            )}
          </div>
        </div>

        {/* แก้ไข */}
        <ModalWauto
          title="แก้ไขสินค้า"
          isOpen={isOpen}
          onClose={handleCloseModal}
          className="max-h-[800px] md:max-h-[800px]"
        >
          <div className="flex flex-col md:w-[550px] xl:w-[700px] max-h-[650px] md:max-h-[650px]">
            <div className="overflow-y-auto max-h-[650px] md:max-h-[650px] grid grid-cols-1 md:grid-cols-2 justify-between gap-x-4 gap-y-2">
              {/* <div>
                <div>หมวดหมู่สินค้า</div>
                <select
                  value={categoryid}
                  onChange={(e) => setCategoryid(e.target.value)}
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                >
                  {categorylist.map((category) => (
                    <option
                      key={category.productCgtyId}
                      value={category.productCgtyId}
                    >
                      {category.categoryname}
                    </option>
                  ))}
                </select>
              </div> */}

              <input
                type="text"
                value={productid}
                onChange={(e) => setProductid(e.target.value)}
                hidden
              />

              {/* <div>ShopID</div> */}
              {/* <input type="text" value={shopid} onChange={(e) => setShopid(e.target.value)} hidden/> */}

              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                hidden
              />

              <div>
                <div>รูปภาพสินค้า</div>
                <input
                  type="file"
                  accept=".png, .jpg"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <div>หมวดหมู่สินค้า</div>
                <select
                  value={productCgtyId}
                  onChange={(e) => setProductCgtyId(e.target.value)}
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                >
                  {Array.isArray(categorylist) && categorylist.length > 0
                    ? categorylist.map((category) => (
                        <option
                          key={category.productCgtyId}
                          value={category.productCgtyId}
                        >
                          {category.categoryname}
                        </option>
                      ))
                    : null}
                  <option value="0">สินค้าไม่มีหมวดหมู่</option>
                </select>
              </div>

              <div>
                <div>
                  ชื่อภาษาไทย <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่อภาษาไทย"
                  value={productnameth}
                  onChange={(e) => setProductnameth(e.target.value)}
                />
              </div>

              <div>
                <div>
                  ชื่อภาษาอังกฤษ <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่อภาษาอังกฤษ"
                  value={productnameeng}
                  onChange={(e) => setProductnameeng(e.target.value)}
                />
              </div>

              <div>
                <div>ข้อมูลสินค้าภาษาไทย</div>
                <input
                  type="text"
                  placeholder="กรุณากรอกข้อมูลสินค้าภาษาไทย"
                  value={productdatath}
                  onChange={(e) => setProductdatath(e.target.value)}
                />
              </div>

              <div>
                <div>ข้อมูลสินค้าภาษาอังกฤษ </div>
                <input
                  type="text"
                  placeholder="กรุณากรอกข้อมูลสินค้าภาษาอังกฤษ"
                  value={productdataeng}
                  onChange={(e) => setProductdataeng(e.target.value)}
                />
              </div>

              <div>
                <div>
                  ราคา <span className="text-red-500">*</span>
                </div>
                <input
                  type="number"
                  placeholder="กรุณากรอกราคา"
                  value={productprice}
                  onChange={(e) => setProductprice(Number(e.target.value))}
                />
              </div>

              <div>
                <div>ตัวเลือกเพิ่มเติม</div>
              
                <Stack
                  spacing={0}

                  sx={{
                    width: "100%",
                    border: "1px solid black",
                    borderRadius: "5px",
                    padding: "0px",
                    // backgroundColor: "white",
                    // borderBottom: "none",
                    // border: "0px solid #009f4d",/

                    // ":hover": {
                    //   // borderBottom: "none",
                    // },
                  }}
                >
                  <Autocomplete
                    sx={{
                      borderRadius: "5px",
                      padding: "0px",
                      borderBottom: "none",
                      backgroundColor: "white",
                      // border: "0px",

                      ":hover": {
                        backgroundColor: "white",
                      },

                      "& .MuiInputBase-root": {
                        padding: "0px",
                        borderRadius: "5px",
                        // minHeight: "40px",
                        backgroundColor: "white",
                        borderBottom: "none",

                        "& .MuiAutocomplete-input": {
                          paddingX: "12px",
                          paddingY: "2px",
                          borderRadius: "5px",
                          minHeight: "35px",
                        },
                        // .css-1mb1do-MuiInputBase-root-MuiFilledInput-root::after
                      }

                    }}
                    multiple
                    id="tags-filled"
                    options={[]}
                    value={additional ?? []}
                    onChange={(_, value) => setAdditional(value.map((v) => v.startsWith('#') ? v : `#${v}`))}
                    freeSolo
                    renderValue={(value: string[], getItemProps) =>
                      value.map((option: string, index: number) => {
                        // console.log(additional)
                        const { key, ...itemProps } = getItemProps({index});

                        return (
                          <Chip
                            variant="outlined"
                            label={option}
                            key={key}
                            {...itemProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (

                      <TextField
                        {...params}
                        sx={{
                          padding: "0px",
                          // borderBottom: "1px solid #2B5F60",
                          borderBottom: "none",
                          borderRadius: "5px",
                          // backgroundColor: "white",

                          ":hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },

                          "& .MuiFilledInput-root::after":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::after:hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::before":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::before:hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },

                          // "& .MuiInputBase-input::placeholder": {
                          //   fontSize: "16px", // ขนาด placeholder ที่ต้องการ
                          //   color: "#bdbdbd",
                          //   opacity: 1,
                          // },
                        }}
                        variant="filled"
                        // label="freeSolo"
                        placeholder="กรุณากรอกข้อมูลแล้วกด Enter"
                      />
                    )}
                  />
                </Stack>

              </div>

              {/* <div>หน่วย</div>
            <input type="text" value={uomtext} onChange={(e) => setUomtext(e.target.value)} /> */}
            </div>
            <div className="w-full mt-2 border-t-2 border-gray-300 pt-2 flex flex-row justify-start items-center">
              <button className="btn mr-2" onClick={handleEditSave}>
                <i className="fa-solid fa-save mr-2"></i>
                บันทึก
              </button>

              <button
                className=" flex flex-row justify-center items-center bg-red-500 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg"
                onClick={handleDelete}
              >
                <div>
                  <i className="fa-solid fa-trash mr-2"></i>
                </div>
                <span>ลบข้อมูล</span>
              </button>
            </div>
          </div>
        </ModalWauto>

        {/* สร้าง */}
        <ModalWauto
          title="เพิ่มสินค้า"
          isOpen={isOpenCreate}
          onClose={handleCloseModal}
          className="max-h-[600px] md:max-h-[800px]"
        >
          <div className="flex flex-col md:w-[550px] xl:w-[700px] max-h-[650px] md:max-h-[650px]">
            <div className="overflow-y-auto max-h-[650px] md:max-h-[650px] grid grid-cols-1 md:grid-cols-2 justify-between gap-x-4 gap-y-2">
              {/* <div>
                <div>หมวดหมู่สินค้า</div>
                <select
                  value={categoryid}
                  onChange={(e) => setCategoryid(e.target.value)}
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                >
                  {categorylist.map((category) => (
                    <option
                      key={category.productCgtyId}
                      value={category.productCgtyId}
                    >
                      {category.categoryname}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* รูปภาพสินค้า */}
              <div>
                <div>รูปภาพสินค้า</div>
                <input
                  type="file"
                  accept=".png, .jpg"
                  onChange={handleFileChange}
                />{" "}
                {/* อนุญาตเฉพาะไฟล์รูปภาพ */}
              </div>

              {/*  หมวดหมู่สินค้า */}
              <div>
                <div>หมวดหมู่สินค้า</div>
                <select
                  value={productCgtyId}
                  onChange={(e) => setProductCgtyId(e.target.value)}
                  className="w-full h-[42px] border border-[#2B5F60] rounded-md p-2"
                >
                  {Array.isArray(categorylist) && categorylist.length > 0
                    ? categorylist.map((category) => (
                        <option
                          key={category.productCgtyId}
                          value={category.productCgtyId}
                        >
                          {category.categoryname}
                        </option>
                      ))
                    : null}
                  <option value="0">สินค้าไม่มีหมวดหมู่</option>
                </select>
              </div>

              <div>
                <div>
                  ชื่อภาษาไทย <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่อสินค้าภาษาไทย"
                  value={productnameth}
                  onChange={(e) => setProductnameth(e.target.value)}
                />
              </div>

              <div>
                <div>
                  ชื่อภาษาอังกฤษ <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่อสินค้าภาษาอังกฤษ"
                  value={productnameeng}
                  onChange={(e) => setProductnameeng(e.target.value)}
                />
              </div>

              <div>
                <div>ข้อมูลสินค้าภาษาไทย</div>
                <input
                  type="text"
                  placeholder="กรุณากรอกข้อมูลสินค้าภาษาไทย"
                  value={productdatath}
                  onChange={(e) => setProductdatath(e.target.value)}
                />
              </div>

              <div>
                <div>ข้อมูลสินค้าภาษาอังกฤษ</div>
                <input
                  type="text"
                  placeholder="กรุณากรอกข้อมูลสินค้าภาษาอังกฤษ"
                  value={productdataeng}
                  onChange={(e) => setProductdataeng(e.target.value)}
                />
              </div>

              <div>
                <div>
                  ราคา <span className="text-red-500">*</span>
                </div>
                <input
                  type="number"
                  placeholder="กรุณากรอกราคา"
                  value={productprice}
                  onChange={(e) => setProductprice(Number(e.target.value))}
                />
              </div>

              
              <div>
                <div>ตัวเลือกเพิ่มเติม</div>
                {/* <input
                  type="number"
                  placeholder="กรุณากรอกราคา"
                  value={productprice}
                  onChange={(e) => setProductprice(Number(e.target.value))}
                /> */}
                
                <Stack
                  spacing={0}

                  sx={{
                    width: "100%",
                    border: "1px solid black",
                    borderRadius: "5px",
                    padding: "0px",
                    // backgroundColor: "white",
                    // borderBottom: "none",
                    // border: "0px solid #009f4d",/

                    // ":hover": {
                    //   // borderBottom: "none",
                    // },
                  }}
                >
                  <Autocomplete
                    sx={{
                      borderRadius: "5px",
                      padding: "0px",
                      borderBottom: "none",
                      backgroundColor: "white",
                      // border: "0px",

                      ":hover": {
                        backgroundColor: "white",
                      },

                      "& .MuiInputBase-root": {
                        padding: "0px",
                        borderRadius: "5px",
                        // minHeight: "40px",
                        backgroundColor: "white",
                        borderBottom: "none",

                        "& .MuiAutocomplete-input": {
                          paddingX: "12px",
                          paddingY: "2px",
                          borderRadius: "5px",
                          minHeight: "35px",
                        },
                        // .css-1mb1do-MuiInputBase-root-MuiFilledInput-root::after
                      }

                    }}
                    multiple
                    id="tags-filled"
                    options={[]}
                    value={additional ?? []}
                    onChange={(_, value) => setAdditional(value.map((v) => v.startsWith('#') ? v : `#${v}`))}
                    freeSolo
                    renderValue={(value: string[], getItemProps) =>
                      value.map((option: string, index: number) => {
                        // console.log(additional)
                        const { key, ...itemProps } = getItemProps({index});

                        return (
                          <Chip
                            variant="outlined"
                            label={option}
                            key={key}
                            {...itemProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (

                      <TextField
                        {...params}
                        sx={{
                          padding: "0px",
                          // borderBottom: "1px solid #2B5F60",
                          borderBottom: "none",
                          borderRadius: "5px",
                          // backgroundColor: "white",

                          ":hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },

                          "& .MuiFilledInput-root::after":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::after:hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::before":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },
                          "& .MuiFilledInput-root::before:hover":{
                            padding: "0px",
                            borderRadius: "5px",
                            borderBottom: "none",
                            // backgroundColor: "white",
                          },

                          // "& .MuiInputBase-input::placeholder": {
                          //   fontSize: "16px", // ขนาด placeholder ที่ต้องการ
                          //   color: "#bdbdbd",
                          //   opacity: 1,
                          // },
                        }}
                        variant="filled"
                        // label="freeSolo"
                        placeholder="กรุณากรอกข้อมูลแล้วกด Enter"
                      />
                    )}
                  />
                </Stack>

              </div>

              {/* <div>หน่วย</div>
              <input type="text" value={uomtext} onChange={(e) => setUomtext(e.target.value)} /> */}
            </div>
            <div className="mt-2 border-t-2 border-gray-300 pt-2">
              <button className="btn mr-2" onClick={handleCreate}>
                <i className="fa-solid fa-save mr-2"></i>
                เพิ่ม
              </button>
            </div>
          </div>
        </ModalWauto>

        {/* แก้ไขคลัง */}
        <ModalWauto
          title="แก้ไขคลัง"
          isOpen={isOpentreasury}
          onClose={handleCloseModal}
          className="max-h-[800px] md:max-h-[800px]"
        >
          <div className="flex flex-col w-[340px] md:w-[550px] xl:w-[700px] max-h-[650px]  md:max-h-[650px]">
            <div className="overflow-y-auto max-h-[650px] md:max-h-[650px] grid grid-cols-1 md:grid-cols-1 justify-between gap-x-4">
              <label className="mb-2 flex flex-row gap-x-6 pb-5">
                <p>
                  ชื่อสินค้าภาษาไทย:{" "}
                  {productnameth.length > 20
                    ? productnameth.substring(0, 20) + "..."
                    : productnameth}
                </p>
                <p>
                  ชื่อสินค้าภาษาอังกฤษ:{" "}
                  {productnameeng.length > 20
                    ? productnameeng.substring(0, 20) + "..."
                    : productnameeng}
                </p>
              </label>
              <div>
                <div>จำนวนสินค้า</div>
                <input
                  type="number"
                  placeholder="กรุณากรอกจํานวนสินค้า"
                  value={productremain}
                  max={100000}
                  min={0}
                  onChange={(e) => {
                    if (Number(e.target.value) > 100000) {
                      setProductremain(100000);
                    } else if (Number(e.target.value) < 0) {
                      setProductremain(0);
                    } else {
                      setProductremain(Number(e.target.value));
                    }
                  }}
                />
              </div>
              <p className="text-[12px] py-2">
                อัพเดทล่าสุดเมื่อ: {update_PRemain}
              </p>
            </div>
            <div className="w-full mt-2 border-t-2 border-gray-300 pt-2 flex flex-row justify-start items-center">
              <button className="btn mr-2" onClick={Edittreasurysave}>
                <i className="fa-solid fa-save mr-2"></i>
                บันทึก
              </button>
            </div>
          </div>
        </ModalWauto>

        {/* import export */}
        <ModalWauto
          title="จัดการข้อมูลสินค้า"
          isOpen={isOpenDataManagement}
          onClose={handleCloseModal}
          className="max-h-[800px] md:max-h-[800px]"
        >
          <div className="flex flex-col w-[320px] md:w-[550px] md:gap-x-4 gap-y-2 my-4">
            <p>ส่งออกข้อมูลสินค้าเป็นรูปแบบ CSV</p>

            <div className="flex flex-col md:flex-row md:gap-x-4">
              {/* <Selectshop
                shopid={shopidExport}
                shopslist={shops}
                className="w-[220px] mt-2"
                onChange={(value) => {
                  setShopidExport(value);
                }}
              /> */}

              {/* select category */}
              {/* <div className="relative"> */}
              {/* <p className="absolute -top-6 left-1 text-black">
                หมวดหมู่สินค้า
              </p> */}

              <select
                className="mt-2 p-2 text-[16px] w-[220px] xl:w-[220px]
                    rounded-md border-solid border text-black border-[#009f4d] border-opacity-50 overflow-x-hedden"
                value={productCgtyIdExport}
                onChange={(e) => {
                  setProductCgtyIdExport(e.target.value);
                }}
              >
                {Array.isArray(categorylist) && categorylist.length > 0
                  ? categorylist.map((category: Category) => (
                      <option
                        key={category.productCgtyId}
                        value={category.productCgtyId}
                      >
                        {category.categoryname}
                      </option>
                    ))
                  : null}
                <option value="0">สินค้าไม่มีหมวดหมู่</option>
              </select>
              {/* </div> */}
            </div>

            <button
              className="btn w-[150px] h-[40px] p-1 mt-2"
              onClick={() => handleExportCSV()}
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
              <span className="text-[16px]">Export CSV</span>
            </button>

            <hr className="text-5xl my-2" />

            {/* import */}
            <div>
              <p>นำเข้าข้อมูลสินค้าเป็นรูปแบบ CSV</p>

              <div className="flex flex-col md:flex-row md:gap-x-4">
                {/* select shop */}
                {/* <Selectshop
                    shopid={shopidImport}
                    shopslist={shops}
                    className="w-[220px] mt-2"
                    onChange={(value) => {
                      setShopidImport(value);
                    }}
                  /> */}

                {/* select category */}
                {/* <div className="relative"> */}
                {/* <p className="absolute -top-6 left-1 text-black">
                      หมวดหมู่สินค้า
                    </p> */}
                <select
                  className="mt-2 p-2 text-[16px] w-[220px] xl:w-[220px]
                       rounded-md border-solid border text-black border-[#009f4d] border-opacity-50 overflow-x-hedden"
                  value={productCgtyIdImport}
                  onChange={(e) => {
                    setProductCgtyIdImport(e.target.value);
                  }}
                >
                  {Array.isArray(categorylist) && categorylist.length > 0
                    ? categorylist.map((category: Category) => (
                        <option
                          key={category.productCgtyId}
                          value={category.productCgtyId}
                        >
                          {category.categoryname}
                        </option>
                      ))
                    : null}
                  <option value="0">สินค้าไม่มีหมวดหมู่</option>
                </select>
                {/* </div> */}
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
