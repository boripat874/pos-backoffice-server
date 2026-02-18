module.exports = {
  apps: [
    {
      name: "POS-backofficeWeb", // ชื่อแอปพลิเคชันที่คุณต้องการให้ PM2 จัดการ
      script: "./server.js", // คำสั่งที่จะรัน (สามารถเป็น 'npm' หรือ 'yarn')
      watch: true,
      instances  : 1,
      args: "", // อาร์กิวเมนต์ที่ส่งไปยัง script (ในที่นี้คือ 'start' เพื่อรัน Production build ของ Next.js)
      cwd: "./", // working directory ของแอปพลิเคชัน
      env: {
        PORT: 3001, // กำหนด environment variable PORT เป็น 8080
        NODE_ENV: "production", // กำหนด environment เป็น production
      },
      // (ตัวเลือกอื่นๆ เช่น instances, autorestart, watch, logs)
    },
  ],
};
