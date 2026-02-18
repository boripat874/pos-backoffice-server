"use client"

import { useEffect, useState } from 'react'

import DashboardOverview from './overview';
import DashboardShopdetail from './shopdetail';
import axios from "axios";
import { config } from "@/app/lib/config";


export default function Dashboard() {

  const [level, setLevel] = useState<string>("");
  const [shopId, setShopId] = useState<string>("");
  // const [ugroupid, setGroupId] = useState<string>("");
  
  useEffect(() => {

    const fetchLevel = async () => {

      const headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': config.apiKey,
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      };

      const db_User = await axios.get(`${config.apiUrl}/backoffice/checklogin`, {headers});

      setLevel(db_User.data.level);
      setShopId(db_User.data.shopid);
      // setGroupId(db_User.data.ugroupid);

    };

    fetchLevel();
    
  }, []);
  

  return (
    <>
      {level !== "" && (
        <>
          {level === "Admin" || level === "Owner" ? (
            <DashboardOverview/>
            // <></>
          ) : (
            <DashboardShopdetail params={{shopid_detail: shopId}} />
            // <></>
          )}
        </>
      )}
    </>
  );
}