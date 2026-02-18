
import axios from "axios";
import { config } from "@/app/lib/config";
import Swal from "sweetalert2";

export const getLevel = async() => {

    let leveluser = "Employee"

    try {
        const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.apiKey,
        Authorization: "Bearer " + localStorage.getItem("token"),
        };

        await axios
        .get(`${config.apiUrl}/backoffice/checklogin`, {
            headers: headers,
        })
        
        .then((res) => {

            if (res.status == 200) {

            leveluser = res.data.level

            } 
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

  return leveluser
}; // Include search in the dependency array