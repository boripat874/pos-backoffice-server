const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'front/thsarabunbolditalic.ttf'); // เปลี่ยน path เป็นไฟล์ Sarabun Regular ของคุณ
const fontBase64 = fs.readFileSync(fontPath, { encoding: 'base64' });

// กำหนดชื่อไฟล์ที่จะบันทึก Base64 string
const outputFilePath = path.join(__dirname, 'front/thsarabunbolditalic.base64.txt');

// บันทึก Base64 string ลงในไฟล์
fs.writeFileSync(outputFilePath, fontBase64);

console.log(`Base64 string ของฟอนต์ Sarabun Regular ถูกบันทึกที่: ${outputFilePath}`);