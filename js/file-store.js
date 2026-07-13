
const ADG_FILE_DB="adgInsightFiles";
const ADG_FILE_STORE="files";
let ADG_FILE_DB_PROMISE=null;

function openFileDb(){
  if(ADG_FILE_DB_PROMISE)return ADG_FILE_DB_PROMISE;
  ADG_FILE_DB_PROMISE=new Promise((resolve,reject)=>{
    const request=indexedDB.open(ADG_FILE_DB,1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(ADG_FILE_STORE)){
        db.createObjectStore(ADG_FILE_STORE,{keyPath:"id"});
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  return ADG_FILE_DB_PROMISE;
}

async function saveFileBlob(id,file){
  const db=await openFileDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(ADG_FILE_STORE,"readwrite");
    tx.objectStore(ADG_FILE_STORE).put({
      id,
      name:file.name,
      type:file.type,
      size:file.size,
      lastModified:file.lastModified,
      blob:file
    });
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}

async function getFileBlob(id){
  const db=await openFileDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(ADG_FILE_STORE,"readonly");
    const request=tx.objectStore(ADG_FILE_STORE).get(id);
    request.onsuccess=()=>resolve(request.result||null);
    request.onerror=()=>reject(request.error);
  });
}

async function deleteFileBlob(id){
  const db=await openFileDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(ADG_FILE_STORE,"readwrite");
    tx.objectStore(ADG_FILE_STORE).delete(id);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
  });
}

function formatFileSize(bytes){
  if(!Number.isFinite(bytes)||bytes<=0)return"0 KB";
  const units=["B","KB","MB","GB"];
  let size=bytes,index=0;
  while(size>=1024&&index<units.length-1){size/=1024;index++}
  return `${size.toFixed(index===0?0:1)} ${units[index]}`;
}
