'use client';
import { ReactNode,useEffect,useState,useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingScreen } from "@/components/animate/loading-screen";
import { paths } from "@/routes/paths";

type Props={children:ReactNode;};

export default function AuthGuard({children}:Props){
 const {status}=useSession();
 return<>{status==="loading"?<LoadingScreen/>:<Container>{children}</Container>}</>;
}

function Container({children}:Props){
 const router=useRouter();
 const {status}=useSession();
 const [checked,setChecked]=useState(false);

 const check=useCallback(()=>{
  if(status==="unauthenticated") router.replace(`${paths.universal.login}`);
  else setChecked(true);
 },[status,router]);

 useEffect(()=>{check();},[status]);

 if(!checked) return null;
 return<>{children}</>;
}