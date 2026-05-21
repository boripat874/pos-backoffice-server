import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors')

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'oatmilk': '#FFFBF5',
        'oxbowteal': '#188875',
        'deepforest': '#134737',
        'burntorange': '#EC6325',
        'earthbrown': '#4F2C1E',
        'safariyellow': '#F7A820',
        'olivedust': '#434437',
        'lessenteal': '#57b4a5',
        'hoverteal': '#ecf7f4',
        'hoveryellow': '#f5cd88',
        'hoverred': '#f58686',
        'lessengray': '#ecebe9',

      },
    },
    screens: {
      'xs': '320px', // เพิ่ม breakpoint xs ขนาด 320px
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1700px', // เพิ่ม breakpoint my-custom ขนาด 900px
    }
  },
  plugins: [],
} satisfies Config;

