import { redis } from "@/lib/redis";

class CacheService{

 async get<T>(key:string):Promise<T|null>{
  const data=await redis.get(key);
  if(!data)return null;
  return data as T;
 }

 async set(key:string,value:any,ttl=300):Promise<void>{
  await redis.set(key,value,{ex:ttl});
 }

 async del(key:string):Promise<void>{
  await redis.del(key);
 }

 async remember<T>(key:string,callback:()=>Promise<T>,ttl=300):Promise<T>{
  const cached=await this.get<T>(key);
  if(cached)return cached;
  const data=await callback();
  await this.set(key,data,ttl);
  return data;
 }

 async clearPrefix(prefix:string):Promise<void>{
  const keys=await redis.keys(`${prefix}*`);
  if(keys.length>0){
   await redis.del(...keys);
  }
 }

}

export const cacheService=new CacheService();