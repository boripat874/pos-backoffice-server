"use client"

import React, { useEffect, useState, useCallback , useRef} from 'react'
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/lib/config";
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { TbPdf } from "react-icons/tb";
// import { useRouter } from "next/navigation";
// import { format, parseISO } from 'date-fns'; // เพิ่ม parseISO ถ้า timestamp เป็น ISO string
import { format, set } from 'date-fns';
import Carddisplay from '@/app/components/Carddisplay';
import { useRouter } from "next/navigation";
import Selectshop  from '@/app/components/selectshop';
import Selectdate from '@/app/components/selectdate';
import jsPDF from 'jspdf';
// import Image from 'next/image';

// Define interfaces for the report data structures
interface ReportOrder {
  id?: number | string; // Optional ID if available
  ordertimestamp: string;
  shopnameth?: string;
  ordernumber: string;
  ordertotalprice: number;
  vat7pc: number;
  ordertotaldiscount: number;
  orderpricenet: number;
  urlfile: string;
  paymenttype: number;
}

interface Shop {
  shopid: string;
  shopnameth: string;
}

interface Product {
  productid: string;
  productnameth: string;
  productprice: number;
  qty: number;
  totalprice: number;
}

interface receipt{
  ordernumber: string;
  receiptnumber: string;
  paymentType : number;
  receiptcash: number;
  receiptchange: number;
  receiptdiscount: number;
  totalprice: number;
  create_at: string;
  orderid: string;
  products: Array<Product>;
}

// interface ReportProduct {
//   id?: number | string; // Optional ID if available
//   ordertimestamp: string;
//   shopnameth: string;
//   productnameth: string;
//   productprice: number | string;
//   qty: number;
//   totalprice: number | string;
// }


// const receiptOrder =  {
//     ordernumber: 'OID25060100001',
//     receiptnumber: 'RID25060100001',
//     paymentType : 'เงินสด',
//     receiptcash: 200,
//     receiptchange: 10,
//     receiptdiscount: 10,
//     totalprice: 190,
//   }
  
  
export default function Reportorder() {
    
  const [receiptOrder, setReceipt] = useState<receipt>();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const router = useRouter();
  const [level, setLevel] = useState("");

  const [date, setDate] = useState("-");

  // const [reportproducts, setReportproducts] = useState<ReportProduct[]>([]); // Use interface
  
  // const [searchProduct, setSearchProduct] = useState(""); // เก็บคำค้นหา]
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchOrder, setSearchOrder] = useState(""); // เก็บคำค้นหา
  
  const [reportorders, setReportorders] = useState<ReportOrder[]>([]); // Use interface

  const [totalincome, setTotalincome] = useState(0);
  const [totalcreditcard, setTotalcreditcard] = useState(0);
  const [totalpromptpay, setTotalpromptpay] = useState(0);
  const [totalewallet, setTotalewallet] = useState(0);
  const [totalcash, setTotalcash] = useState(0);
  const [totalorder, setTotalorder] = useState(0);
  const [totalproductsell, setTotalproductsell] = useState(0);

  const [shoplist, setShoplist] = useState<Shop[]>([]);
  const [shopid, setShopid] = useState("");

  const [period, setPeriod] = useState("today");
  const [timestart, setTimeStart] = useState( 
    `${new Date().toISOString().split("T")[0]}`
  );
  const [timeend, setTimeEnd] = useState(
    `${new Date().toISOString().split("T")[0]}`
  );

  const orderPaymentType = [
    { value: 1, label: "Credit Card" },
    { value: 2, label: "PromptPay" },
    { value: 3, label: "E-wallet" },
    { value: 4, label: "เงินสด" },
  ];

  const searchRef = useRef(searchOrder); // สร้าง ref เก็บค่า search
  const periodRef = useRef(period); // สร้าง ref เก็บค่า period
  const timestartRef = useRef(timestart); // สร้าง ref เก็บค่า shopid
  const timeendRef = useRef(timeend); // สร้าง ref เก็บค่า shopid
  const shopidRef = useRef(shopid); // สร้าง ref เก็บค่า shopid
  

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
    
        // fetchData(); // เรียกข้อมูลเมื่อ component โหลดครั้งแรก
  
      return () => {
        clearInterval(intervalId);
      }
    
    }, []);

  // Wrap fetchData in useCallback
  const fetchDataFirst = useCallback(async () => {

    setIsLoading(true);

    try {

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

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


      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);

          let shopidref = ""

          if(shoplist.data.result.length > 0){

            setShopid(shoplist.data.result[0].shopid);

            shopidref = shoplist.data.result[0].shopid;

            shopidRef.current = shopidref;


          }
          // .current = shoplist.data.result[0].shopid;

          const paramsOrder = {
            search: searchOrder,
          };

          const params = {
            period: period,
            timestart: timestart,
            timeend: timeend,
          }

          const [

            ordersResponse,
            totalIncomeResponse,
            totalCreditCardResponse,
            totalPromptPayResponse,
            totalEWalletResponse,
            totalCashResponse,
            totalOrderResponse,
            totalProductResponse,
            
          ] = await Promise.all([
            axios.post(`${config.apiUrl}/backoffice/reportorderlist`, 
              { shopid: shopidref},
                {
                  headers,
                  params: paramsOrder,
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalincome`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalcreditcard`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalpromptpay`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalewallet`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalcash`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reporttotalorder`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
            axios.post(`${config.apiUrl}/backoffice/reportproductsell`, 
              { shopid: shopidref},
                {
                  headers,
                  params
              }),
          ]
        );

          setReportorders(ordersResponse.data.result || []); // Ensure it's an array
          setTotalincome(totalIncomeResponse.data.total_income || 0);
          setTotalcreditcard(totalCreditCardResponse.data.total_creditcard || 0);
          setTotalpromptpay(totalPromptPayResponse.data.total_promptpay || 0);
          setTotalewallet(totalEWalletResponse.data.total_ewallet || 0);
          setTotalcash(totalCashResponse.data.total_cash || 0);
          setTotalorder(totalOrderResponse.data.total_order || 0);
          setTotalproductsell(totalProductResponse.data.total_product || 0);

        });

      

    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async () => {

    setIsLoading(true);

    try {

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const shopidref = shopidRef.current;
      const periodref = periodRef.current;
      const timestartref = timestartRef.current;
      const timeendref = timeendRef.current;
      const searchOrder = searchRef.current

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

      await axios
        .get(config.apiUrl + "/backoffice/headerdatashopslist", { headers })
        .then(async (shoplist) => {

          setShoplist(shoplist.data.result);

          const paramstotal = {
            period: periodref,
            timestart: timestartref,
            timeend: timeendref,
          };

          const paramsOrder = {
            search: searchOrder,
            period: periodref,
            timestart: timestartref,
            timeend: timeendref,
          };

          const [

            ordersResponse,
            totalIncomeResponse,
            totalCreditCardResponse,
            totalPromptPayResponse,
            totalEWalletResponse,
            totalCashResponse,
            totalOrderResponse,
            totalProductResponse

          ] = await Promise.all([
            axios.post(
              `${config.apiUrl}/backoffice/reportorderlist`,
              { shopid: shopidref },
              {
                headers,
                params: paramsOrder,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalincome`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalcreditcard`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalpromptpay`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalewallet`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalcash`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reporttotalorder`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
            axios.post(
              `${config.apiUrl}/backoffice/reportproductsell`,
              { shopid: shopidref },
              {
                headers,
                params: paramstotal,
              }
            ),
          ]);

          setReportorders(ordersResponse.data.result || []); // Ensure it's an array
          setTotalincome(totalIncomeResponse.data.total_income || 0);
          setTotalcreditcard(totalCreditCardResponse.data.total_creditcard || 0);
          setTotalpromptpay(totalPromptPayResponse.data.total_promptpay || 0);
          setTotalewallet(totalEWalletResponse.data.total_ewallet || 0);
          setTotalcash(totalCashResponse.data.total_cash || 0);
          setTotalorder(totalOrderResponse.data.total_order || 0);
          setTotalproductsell(totalProductResponse.data.total_product || 0);
        });
    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  }, []);

  const fetchDataOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const paramsOrder = {
        search: searchOrder,
        period: periodRef.current,
        timestart: timestartRef.current,
        timeend: timeendRef.current,
      };

      const [ordersResponse] = await Promise.all([
        axios.post(`${config.apiUrl}/backoffice/reportorderlist`, {
          shopid: shopidRef.current,
        },{
          headers,
          params: paramsOrder,
        }),
      ]);

      setReportorders(ordersResponse.data.result || []); // Ensure it's an array
      // setReportproducts(productsResponse.data.result || []); // Ensure it's an array
    } catch (err: unknown) {
      console.error("Error fetching report data:", err); // Log error for debugging
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
      if (axios.isAxiosError(err)) {
        // Handle Axios-specific errors (e.g., network error, 4xx, 5xx)
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: errorMessage,
      });
    }
    setIsLoading(false);
  }, [searchOrder]);
  
  // --- CSV Export Helper Functions ---

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If the value contains a comma, double quote, or newline, wrap it in double quotes
    // Also, escape any existing double quotes within the value by doubling them
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

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

  const handleExportOrdersCSV = () => {
    if (!reportorders || reportorders.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลรายการบิลให้ส่งออก', 'info');
      return;
    }

    const headers = ['เวลา วันที่', 'หมายเลขบิล','ราคารวม', 'Vat 7%', 'ส่วนลด', 'ราคารวมสุทธิ', 'การชำระ'];
    const rows = reportorders.map((order: ReportOrder) => [
      escapeCSV(order.ordertimestamp),
      escapeCSV(order.ordernumber),
      escapeCSV(order.ordertotalprice),
      escapeCSV(order.vat7pc), // Assuming this is 'ราคารวม'
      escapeCSV(order.ordertotaldiscount),
      escapeCSV(order.orderpricenet),
      escapeCSV(orderPaymentType[order.paymenttype - 1].label) // Assuming this is 'ยอดรวมย่อย'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dateStr = format(new Date(), 'dd-MM-yyyy'); // DD-MM-YYYY
    downloadCSV(csvContent, `order_report_${dateStr}.csv`);
  };

  // --- 2. Function to generate PDF from receiptOrder ---
  const handleGenerateReceiptPdf = async (ordernumber_: string) => {
    
    try {

      setIsLoading(true);

      const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      // --- Load receiptOrder data from the API ---

      await axios.post(`${config.apiUrl}/backoffice/receiptorder`, {

        ordernumber: ordernumber_,

      },{

        headers,

      }).then(async(res) => {
        setReceipt(res.data);
        const receiptOrder = res.data;

        // คำนวณความสูงอัตโนมัติ
        const baseHeight = 90; // ความสูงพื้นฐาน (header, footer ฯลฯ)
        const lineHeight = 5;  // ความสูงแต่ละบรรทัด
        const productLines = receiptOrder?.products?.length || 0;
        const extraHeight = productLines * lineHeight;
        const totalHeight = baseHeight + extraHeight;

        const doc = new jsPDF({
          unit: "mm",
          format: [80, totalHeight], // 80mm กว้าง, 297mm สูง (หรือปรับความสูงตามต้องการ)
        });

        let fontLoaded = false;

        

        // --- Alternative: Load font file at runtime and convert to Base64 ---
        const fontUrl = '/fonts/thsarabunitalic.ttf'; // Path relative to the public folder
        // const boldFontUrl = '/fonts/THSarabunNew-Bold.ttf'; // Example for bold
  
        const response = await fetch(fontUrl);

        if (!response.ok) {
          throw new Error(`ไม่สามารถโหลดไฟล์ฟอนต์ได้: ${response.statusText}`);
        }

        const fontBlob = await response.blob();
  
        // Convert Blob to Base64
        const base64Font = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1]); // Get only the Base64 part
            } else {
              reject(new Error("ไม่สามารถอ่านไฟล์ฟอนต์เป็น Base64 ได้"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(fontBlob);
        });
  
        if (!base64Font) {
          throw new Error("การแปลงฟอนต์เป็น Base64 ล้มเหลว");
        }
  
        // doc.addFileToVFS("/fonts/thsarabunitalic.ttf", base64Font);
        doc.addFont("/fonts/thsarabun.ttf", "Sarabun", "normal");
        doc.addFont("/fonts/thsarabunitalic.ttf", "Sarabun", "italic");
        doc.addFont("/fonts/thsarabunbold.ttf", "Sarabun", "bold");
        doc.addFont("/fonts/thsarabunbolditalic.ttf", "Sarabun", "bolditalic");
  
        doc.setFont("Sarabun", "normal");
        fontLoaded = true;
        
        // --- Content ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 5;
        let yPosition = 20;

  
        doc.setFontSize(18);
        if (fontLoaded) {
          doc.setFont("Sarabun", "normal"); // Use Sarabun for header if loaded
        } else {
          doc.setFont("helvetica", "normal"); // Fallback
        }

        doc.text("ใบเสร็จรับเงินอย่างย่อ", pageWidth / 2, yPosition, { align: 'center' });
        yPosition += lineHeight * 2;


  
        doc.setFontSize(12);
        if (fontLoaded) {
          doc.setFont("Sarabun", "normal"); // Use Sarabun for body text
        } else {
          doc.setFont("helvetica", "normal"); // Fallback
        }

        if (receiptOrder) {
    
          // Date and Time
          const orderDate = new Date(receiptOrder.create_at*1000);
          const formattedOrderDate = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          const formattedOrderTime = `${orderDate.getHours()}:${orderDate.getMinutes()}`;
    
          doc.text(`วันที่: ${formattedOrderDate}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`เวลา: ${formattedOrderTime}`, margin, yPosition);
          yPosition += lineHeight;

          // Order Details
          doc.text(`หมายเลขคำสั่งซื้อ: ${receiptOrder.ordernumber}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`หมายเลขใบเสร็จ: ${receiptOrder.receiptnumber}`, margin, yPosition);
          yPosition += lineHeight+2;
          
          // Financial Details
          const rightAlignX = pageWidth - margin;

          // Product Details
          doc.text("รายการสินค้า", margin, yPosition);
          doc.text(`จำนวน`, rightAlignX-20, yPosition, { align: 'right' });
          doc.text(`ราคารวม`, rightAlignX, yPosition, { align: 'right' });
          yPosition += lineHeight;
    
          receiptOrder.products.forEach((product: any) => {
            // product.productnameth
            const maxLength = 23;
            const productName = product.productnameth.length > maxLength
                ? product.productnameth.slice(0, maxLength) + "..."
                : product.productnameth;

            doc.text(`- ${productName}`, margin, yPosition);
            doc.text(`${product.qty}`, rightAlignX-20, yPosition, { align: 'right' });
            doc.text(`${(product.productprice*product.qty).toFixed(2)}`, rightAlignX, yPosition, { align: 'right' });
            yPosition += lineHeight;

          });
          yPosition += 2;

          // Payment Type
          doc.text(`ประเภทการชำระเงิน: ${orderPaymentType[receiptOrder.paymenttype - 1].label}`, margin, yPosition);
          yPosition += lineHeight * 1.0;
    
    
          doc.text("ยอดชำระ:", margin, yPosition);
          doc.text(`${receiptOrder.receiptcash.toFixed(2)}`, rightAlignX, yPosition, { align: 'right' });
          yPosition += lineHeight;
    
          doc.text("ส่วนลด:", margin, yPosition);
          doc.text(`${receiptOrder.receiptdiscount.toFixed(2)}`, rightAlignX, yPosition, { align: 'right' });
          yPosition += lineHeight;
          
          doc.text("เงินทอน:", margin, yPosition);
          doc.text(`${receiptOrder.receiptchange.toFixed(2)}`, rightAlignX, yPosition, { align: 'right' });
          yPosition += lineHeight * 1.5;
    
    
          // Total
          doc.setFontSize(14);
          if (fontLoaded) {
            // Example: if you loaded a bold variant
            // doc.setFont("Sarabun", "bold");
            doc.setFont("Sarabun", "normal"); // Or just normal if bold not loaded/needed
          } else {
            doc.setFont("helvetica", "bold");
          }
          doc.text("ยอดรวมสุทธิ:", margin, yPosition);
          doc.text(`${receiptOrder.totalprice.toFixed(2)} บาท`, rightAlignX, yPosition, { align: 'right' });
    
          // --- Save the PDF ---
          // doc.save(`receipt_${receiptOrder.receiptnumber}.pdf`);
          // doc.output('dataurlnewwindow', { filename: `receipt_${receiptOrder.receiptnumber}.pdf` }); // Use output for preview
          const pdfDataUri = doc.output('datauristring');
          setPdfPreviewUrl(pdfDataUri);
    
          setIsLoading(false);
    
          setIsPdfModalOpen(true);
        }
      });

      
      setIsLoading(false);
    } catch (error) {

      console.error("Error loading or adding font to jsPDF:", error);
      Swal.fire('ข้อผิดพลาด', `${error instanceof Error ? error.message : String(error)}`, 'error');

    }

    
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfPreviewUrl(null);
  };
  
  // animation load
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="max-w-[1300px] flex flex-row justify-between items-center">
        <div>
          <p className="text-2xl xl:text-4xl pt-4 font-bold text-black">
            รายงาน
          </p>
          <p className="text-md xl:text-lg pt-2 text-black">{date}</p>
        </div>
      </div>

      {/* เส้นคั่น */}
      <hr className="mt-2 border-t-3 border-[#2B5F60]" />

      {/* ตัวเลือกข้อมูล */}
      <div className="w-full h-11 flex flex-row justify-start items-center mt-2 gap-x-4">
        {/* เลือกร้านค้า */}
        {level === "Admin" ||
          (level === "Owner" && (
            <>
              {/* <div>
            <select 
              value={shopid} 
              className="w-[180px] h-[40px] rounded-md border-[#009f4d] px-2 border text-black"
              onChange={async(e) => {
                
                // setShopid(e.target.value)
                // shopidRef.current = shopid
                // fetchData()

                Promise.all([
                  setShopid(e.target.value),
                  (shopidRef.current = e.target.value),
                  fetchData()
                ])
              }} 
              >
              {Array.isArray(shoplist) && shoplist.length > 0 ? (
                shoplist.map((shop: Shop, index: number) => (
                  <option key={index} value={shop.shopid}>{shop.shopnameth}</option>
                ))
              ) : (
                <option value="">ไม่มีร้านค้า</option>
              )}
            </select>
          </div> */}

              <Selectshop
                shopid={shopid}
                shopslist={shoplist}
                onChange={(value) => {
                  setShopid(value);
                  shopidRef.current = value;
                  fetchData();
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
            fetchData();
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

            fetchData();
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
            fetchData();
          }}
        />
      </div>
 
      <div className="w-full grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 mt-2 gap-1 xl:gap-1">
        
        {/* รายได้รวมทั้งหมดจากทุกช่องทาง */}
        <Carddisplay
          label={"รายได้รวมทั้งหมดจาก\nทุกช่องทาง"}
          value={`฿ ${totalincome.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#005670]"
          iconpath={"/icon/money.svg"}
        />

        {/* รายได้รวมทั้งหมดจาก Credit Card */}
        <Carddisplay
          label={"รายได้รวมทั้งหมดจาก\nCredit Card"}
          value={`฿ ${totalcreditcard.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#009f4d]"
          iconpath={"/icon/creait_card.svg"}
        />

        {/* รายได้รวมทั้งหมดจาก PromptPay */}
        <Carddisplay
          label={"รายได้รวมทั้งหมดจาก\nPromptPay"}
          value={`฿ ${totalpromptpay.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#fe5000]"
          iconpath={"/icon/promaptpay.svg"}
        />

        {/* รายได้รวมทั้งหมดจาก E-wallet */}
        <Carddisplay
          label={"รายได้รวมทั้งหมดจาก\nE-wallet"}
          value={`฿ ${totalewallet.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#da1884]"
          iconpath={"/icon/E_wallet.svg"}
        />

        {/* รายได้รวมทั้งหมดจาก เงินสด */}
        <Carddisplay
          label={"รายได้รวมทั้งหมดจาก\nเงินสด"}
          value={`฿ ${totalcash.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#a51890]"
          iconpath={"/icon/cash.svg"}
        />

        {/* บิลที่ขายได้ทั้งหมด */}
        <Carddisplay
          label={"บิลที่ขายได้ทั้งหมด"}
          value={`${totalorder.toLocaleString("en-US")}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#0077c8]"
          iconpath={"/icon/order.svg"}
        />

        {/* สินค้าขายออกทั้งหมดหลายชิ้น */}
        <Carddisplay
          label={"สินค้าขายออกทั้งหมด\nหลายชิ้น"}
          value={`${totalproductsell.toLocaleString("en-US")}`}
          textColor="text-[#FFFFFF]"
          backgroundColor="bg-[#008eaa]"
          iconpath={"/icon/creait_card.svg"}
        />
      </div>

      {/*table */}
      <div className="mt-2 overflow-auto">

        {/* table order */}
        <div className="w-[1325px] xl:w-full mt-0 p-4 rounded-lg bg-white shadow-sm">
          {/* Added w-full, max-w, mx-auto */}
          {/* header table */}
          <div className="w-full flex flex-row justify-between items-start text-white gap-4">

            {/* Responsive flex direction */}
            <div className="p-2">
              <p className="text-lg xl:text-2xl font-bold text-black">
                {" "}
                รายการสั่งซื้อ
              </p>
            </div>

            <div className="p-2 flex flex-row items-start gap-4 sm:gap-6">
              {" "}
              {/* Responsive flex direction and gap */}
              {/* --- Attach onClick handler --- */}
              <button
                className="btn w-[150px] xl:w-[160px]" // Responsive width
                onClick={handleExportOrdersCSV}
                disabled={!reportorders || reportorders.length === 0} // Disable if no data
              >
                <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>{" "}
                <span className="text-[14px] xl:text-[16px]">ส่งออก CSV</span>
              </button>
              <div className="relative">
                {" "}
                {/* Responsive width */}
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"></i>
                <input
                  type="text"
                  placeholder="Search for Order ..."
                  className="text-[14px] xl:text-[16px] w-[300px] p-2 pl-10 rounded-lg border-0 bg-[#F6F4F4] focus:outline-none focus:ring-2 focus:ring-[#2B5F60]"
                  onChange={(e) => setSearchOrder(e.target.value)}
                  value={searchOrder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchDataOrder(); // ค้นหาเมื่อกด Enter
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Allow horizontal scroll on small screens */}
          <div className="w-full overflow-y-auto">
            {" "}
            {/* Set height and vertical scroll on this div */}
            <table className="w-full text-[16px] table-fixed text-center text-black">
              <thead className="border-b border-[#2B5F60] bg-[#74d2e7] sticky top-0 z-5">
                <tr>
                  <th className="h-12 w-[150px] px-2">เวลา วันที่</th>
                  {/* <th className='h-12 w-[120px] px-2'>ร้าน</th> */}
                  <th className="h-12 w-[120px] px-2">หมายเลขบิล</th>
                  <th className="h-12 w-[120px] px-2">ราคารวม</th>
                  <th className="h-12 w-[100px] px-2">Vat 7%</th>
                  <th className="h-12 w-[100px] px-2">ส่วนลด</th>
                  <th className="h-12 w-[130px] px-2">ราคารวมสุทธิ</th>
                  <th className="h-12 w-[130px] px-2">การชำระ</th>
                  <th className="h-12 w-[100px] px-2">บิล</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(reportorders) && reportorders.length > 0 ? (
                  reportorders.map((reportorder: ReportOrder, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="h-12 px-2 truncate">
                        {reportorder.ordertimestamp}
                      </td>
                      {/* <td className='h-12 px-2 truncate'>{`ON${Math.floor(Math.random() * 999999999) + 100000000}`}</td> */}
                      <td className="h-12 px-2 truncate">
                        {reportorder.ordernumber}
                      </td>
                      <td className="h-12 px-2 truncate">
                        {Number(reportorder.ordertotalprice).toFixed(2)}
                      </td>
                      <td className="h-12 px-2 text-center">
                        {Number(reportorder.vat7pc).toFixed(2)}
                      </td>
                      <td className="h-12 px-2 text-center">
                        {Number(reportorder.ordertotaldiscount).toFixed(2)}
                      </td>
                      <td className="h-12 px-2 text-center">
                        {Number(reportorder.orderpricenet).toFixed(2)}
                      </td>
                      <td className="h-12 px-2 text-center">
                        {orderPaymentType[reportorder.paymenttype - 1].label}
                      </td>
                      <td className="h-12 px-2 text-center items-center justify-center flex">
                        <button
                          onClick={() => handleGenerateReceiptPdf(reportorder.ordernumber)}
                          className="w-4 h-4 xl:w-8 xl:h-8 text-white bg-[#e4002b] hover:bg-red-900 rounded-sm xl:rounded-md flex justify-center items-center"
                        >
                          <TbPdf size={25} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-[16px] text-center text-black opacity-60"
                    >
                      ไม่พบข้อมูลรายการบิล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      

      {/* PDF Preview Modal */}
      {isPdfModalOpen && pdfPreviewUrl && (
        <div className="w-full h-full bg-black bg-opacity-70 fixed top-0 left-0 inset-0 flex items-center justify-center z-50">
          <div
            className="w-[90%] h-[95%] max-w-[500px] max-h-[700px] bg-white rounded-lg shadow-xl flex items-center justify-center"
          >
            <div className='relative w-full h-full'>
              <button
                onClick={closePdfModal}
                className="w-7 h-8 rounded-md btn-sm absolute right-4 top-3 text-white bg-red-500 hover:bg-red-900"

                style={{
                  alignSelf: "flex-end",
                  marginBottom: "10px",
                  zIndex: 1051,
                }}
              >
                <span className='text-lg'>✕</span>
              </button>
              {receiptOrder && (
                <a
                  href={pdfPreviewUrl}
                  download={`receipt_${receiptOrder.receiptnumber}.pdf`}
                  className="absolute right-14 top-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800"
                >
              
                ดาวน์โหลด PDF
              </a>

              )}
              <iframe
                src={pdfPreviewUrl}
                className='w-full h-full rounded-lg'
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
