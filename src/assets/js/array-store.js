import { storage } from "good-storage";

function innertArray(arr,val,compare){
  const index =arr.findIndex(compare(val))
  if(index>-1) return
  arr.unshift(val)
}

export function save(item,key,compare){
  const items =storage.get(key,[])
  innertArray(items,item,compare)
  return items
}