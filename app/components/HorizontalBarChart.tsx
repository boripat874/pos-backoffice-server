"use client"; // ต้องอยู่บนสุดของไฟล์ เพื่อให้มั่นใจว่าคอมโพเนนต์ถูกเรนเดอร์ฝั่งไคลเอ็นต์

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // นำเข้าปลั๊กอิน datalabels

// ลงทะเบียนองค์ประกอบและปลั๊กอินที่จำเป็นของ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // ลงทะเบียนปลั๊กอิน datalabels
);

// กำหนดข้อมูลสำหรับแผนภูมิ
// const labels = [
//   'ก๋วยเตี๋ยวทะเลรวม',
//   'ผัดฉ่าทะเลเครื่องเต็ม',
//   'ก๋วยเตี๋ยวเนื้อซุปเปื่อยเนื้อน้อย',
//   'ก๋วยเตี๋ยวเนื้อซุปเปื่อยเนื้อกลาง',
//   'ก๋วยเตี๋ยวเนื้อซุปเปื่อยเนื้อมาก',
//   'ก๋วยเตี๋ยวเพื่อสุขภาพ',
//   'ข้าวผัดกะเพราเนื้อ',
// ];

interface ProductSelllist{
  productid: string;
  productnameth: string;
  totalitem: number;
}

const backgroundColor = ['#005670', '#00205b', '#009f4d', '#fe5000', '#e4002b', '#da1884', '#a51890'];

const computedBarThickness = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  if (width < 400) return 10;
  else if (width < 768) return 15;
  return 20;
};

const computedPadding = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  if (width < 400) return { top: 10, bottom: 10, left: 5, right: 5 };
  else if (width < 768) return { top: 20, bottom: 20, left: 10, right: 10 };
  return { top: 30, bottom: 30, left: 20, right: 20 };
};

const computedBarSpacing = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  if (width < 400) return 0.5;       // For small screens, use a lower percentage (more gap)
  else if (width < 768) return 0.7;    // Medium screens
  return 0.9;                        // Larger screens get a higher percentage (less gap)
};

const data = (productsellslist: ProductSelllist[]) => {

  const labels = productsellslist.map((product) => product.productnameth);
  const dataValues = productsellslist.map((product) => product.totalitem);

  // Cycle through backgroundColors for each product
  const bgcolor = productsellslist.map((product, index) => backgroundColor[index % backgroundColor.length]);
  // console.log("data",data);
  // console.log("labels",labels);

  return{

    labels,
    datasets: [
      {
        label: 'ยอดขายสินค้า', // ป้ายกำกับนี้จะถูกซ่อนตามภาพตัวอย่าง
        data: dataValues,
        backgroundColor: bgcolor, // สีเขียวอมฟ้าตามภาพตัวอย่าง [6, 7]
        borderColor: 'transparent', // ไม่มีเส้นขอบ
        borderWidth: 0, // ความกว้างของเส้นขอบเป็น 0
        barThickness: computedBarThickness(),
        categoryPercentage: computedBarSpacing(),
        borderRadius: 0, // ไม่มีมุมโค้งมน
      },
    ],
  };

};



// กำหนดตัวเลือกการกำหนดค่าสำหรับแผนภูมิ
export const options = {
  indexAxis: "y" as const, // กำหนดให้เป็นกราฟแท่งแนวนอน [4, 5]
  responsive: true, // ทำให้แผนภูมิปรับขนาดตามคอนเทนเนอร์ [15, 16]
  maintainAspectRatio: false, // อนุญาตให้แผนภูมิปรับความสูงได้อย่างอิสระ [15, 16]
  layout: {
    padding: computedPadding(),
  },
  plugins: {
    legend: {
      display: false, // ซ่อนคำอธิบายแผนภูมิ [11, 12, 13]
    },
    title: {
      display: false, // ซ่อนชื่อแผนภูมิหลัก [13, 14]
      text: "กราฟคะแนนความนิยมเมนูอาหาร", // ชื่อแผนภูมิ (หากต้องการแสดง)
    },
    datalabels: {
      color: "black", // สีของป้ายกำกับข้อมูล
      anchor: "end" as const, // จัดตำแหน่งป้ายกำกับที่ปลายแท่งกราฟ [3]
      align: "end" as const, // จัดแนวป้ายกำกับให้ตรงกับปลายแท่งกราฟ [3]
      offset: 8, // ปรับระยะห่างเล็กน้อยจากปลายแท่งกราฟ [8]
      formatter: function (value: number) {
        return value.toFixed(0); // จัดรูปแบบค่าเป็นทศนิยม 2 ตำแหน่ง [3]
      },
      font(context: any) {
        const chartWidth = context.chart.width;
        let size = 12; // default size
        if (chartWidth < 400) size = 8;
        else if (chartWidth < 768) size = 10;
        return { size, weight: "bold" as const };
      },
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      position: "top" as const,
      min: 0,
      max: 100, // กำหนดช่วงแกน X จาก 0 ถึง 100
      grid: {
        display: true, // แสดงเส้นกริดแนวตั้ง
        color: "rgba(0, 0, 0, 0.1)", // สีของเส้นกริด
        lineWidth: 1, // ความกว้างของเส้นกริด
        borderDash: [5, 5], // ทำให้เส้นกริดเป็นเส้นประ [9, 10]
      },
      ticks: {
        color: "black", // สีของป้ายกำกับตัวเลขบนแกน X
        font(context: any) {
          const chartWidth = context.chart.width;
          let size = 12;
          if (chartWidth < 400) size = 8;
          else if (chartWidth < 768) size = 10;
          return { size };
        },
      },
    },
    y: {
      grid: {
        display: true, // ซ่อนเส้นกริดแนวนอน [9, 10]
        drawTicks: false, // ซ่อนเครื่องหมายขีดบนแกน Y [9, 10]
      },
      ticks: {
        color: "black", // สีของป้ายกำกับหมวดหมู่บนแกน Y
        font(context: any) {
          const chartWidth = context.chart.width;
          let size = 12;
          if (chartWidth < 400) size = 8;
          else if (chartWidth < 768) size = 10;
          return { size };
        },
      },
    },
  },
};

// interface HorizontalBarChartProps {
//   // สามารถเพิ่ม props ได้หากต้องการให้แผนภูมิมีความยืดหยุ่นมากขึ้น
//   labels: string[];
// }

interface datalist {
  productsellslist: ProductSelllist[];
}

export function HorizontalBarChart({productsellslist}: datalist) {
  // กำหนดความสูงอัตโนมัติ: อย่างน้อย 200px หรือ 40px ต่อ 1 รายการ
  const barHeight = 60;
  const minHeight = 200;
  const chartHeight = Math.max(productsellslist.length * barHeight, minHeight);

  return (
    <div style={{ height: chartHeight, width: '100%' }}>
      <Bar options={options} data={data(productsellslist)} />
    </div> 
  );

}