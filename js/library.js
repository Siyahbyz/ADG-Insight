
const LIBRARY_TYPE_INFO={
  pdf:{label:"PDF",icon:"PDF"},excel:{label:"Excel",icon:"XLS"},word:{label:"Word",icon:"DOC"},
  powerpoint:{label:"Sunum",icon:"PPT"},image:{label:"Görsel",icon:"IMG"},video:{label:"Video",icon:"VID"},
  zip:{label:"ZIP",icon:"ZIP"},link:{label:"Web",icon:"WEB"},announcement:{label:"Duyuru",icon:"TXT"}
};
let LIBRARY_SELECTED_FILE=null;
let LIBRARY_SELECTED_FOLDER="";
let LIBRARY_EXPLORER_MODE="grid";

function libraryTypeInfo(type){return LIBRARY_TYPE_INFO[type]||LIBRARY_TYPE_INFO.link}
function ensureLibraryArrays(){APP_DATA.companies.forEach(c=>{if(!Array.isArray(c.library))c.library=[]})}

function guessLibraryType(file){
  const name=String(file?.name||"").toLowerCase();
  if(name.endsWith(".pdf"))return"pdf";
  if(/\.(xlsx|xls|csv)$/.test(name))return"excel";
  if(/\.(doc|docx)$/.test(name))return"word";
  if(/\.(ppt|pptx)$/.test(name))return"powerpoint";
  if(/\.(png|jpg|jpeg|webp|svg)$/.test(name))return"image";
  if(/\.(mp4|webm)$/.test(name))return"video";
  if(name.endsWith(".zip"))return"zip";
  return"link";
}

function renderLibraryCompanyOptions(){
  ensureLibraryArrays();
  const opts=visibleCompanies().map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("");
  document.getElementById("libraryCompany").innerHTML=opts||'<option value="">Firma yok</option>';
  document.getElementById("libraryCompanyFilter").innerHTML='<option value="">Tüm firmalar</option>'+opts;
}

function clearLibraryFile(){
  LIBRARY_SELECTED_FILE=null;
  document.getElementById("libraryFile").value="";
  document.getElementById("libraryFileInfo").innerHTML='<span class="note">Henüz dosya seçilmedi.</span>';
}

function renderSelectedFileInfo(file){
  const info=libraryTypeInfo(guessLibraryType(file));
  document.getElementById("libraryFileInfo").innerHTML=`
    <div class="file-info-content">
      <div class="file-info-icon">${escapeHtml(info.icon)}</div>
      <div class="file-info-meta">
        <strong>${escapeHtml(file.name)}</strong>
        <span>${formatFileSize(file.size)} · ${escapeHtml(file.type||"Dosya")}</span>
      </div>
      <button id="removeSelectedLibraryFile" class="file-remove-btn" type="button">Kaldır</button>
    </div>`;
  document.getElementById("removeSelectedLibraryFile").onclick=clearLibraryFile;
}

function clearLibraryForm(){
  document.getElementById("libraryItemId").value="";
  document.getElementById("libraryType").value="pdf";
  ["libraryCategory","librarySubcategory","libraryTitle","libraryDescription","libraryUrl","libraryTags","libraryPublishDate","libraryExpiryDate"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("libraryVersion").value="1.0";
  document.getElementById("libraryActive").checked=true;
  document.getElementById("libraryDownloadable").checked=true;
  document.getElementById("libraryFormTitle").textContent="Yeni İçerik";
  clearLibraryFile();
}

function getLibraryFormData(){
  return{
    id:document.getElementById("libraryItemId").value||"lib_"+Date.now(),
    type:document.getElementById("libraryType").value,
    category:document.getElementById("libraryCategory").value.trim(),
    subcategory:document.getElementById("librarySubcategory").value.trim(),
    version:document.getElementById("libraryVersion").value.trim()||"1.0",
    title:document.getElementById("libraryTitle").value.trim(),
    description:document.getElementById("libraryDescription").value.trim(),
    url:document.getElementById("libraryUrl").value.trim(),
    tags:document.getElementById("libraryTags").value.split(",").map(x=>x.trim()).filter(Boolean),
    publishDate:document.getElementById("libraryPublishDate").value,
    expiryDate:document.getElementById("libraryExpiryDate").value,
    active:document.getElementById("libraryActive").checked,
    downloadable:document.getElementById("libraryDownloadable").checked
  };
}

async function saveLibraryItem(){
  if(!can("library"))return alert("Bu işlem için yetkiniz yok.");
  const companyId=document.getElementById("libraryCompany").value,data=getLibraryFormData();
  if(!companyId||!data.title)return alert("Firma ve başlık zorunludur.");
  if(!data.url&&!LIBRARY_SELECTED_FILE&&!data.description)return alert("Bir dosya, bağlantı veya açıklama ekleyin.");

  const existingCompany=APP_DATA.companies.find(c=>(c.library||[]).some(x=>x.id===data.id));
  const existingItem=existingCompany?.library?.find(x=>x.id===data.id);
  if(existingItem?.fileId&&!LIBRARY_SELECTED_FILE)data.fileId=existingItem.fileId;
  if(existingItem?.fileName&&!LIBRARY_SELECTED_FILE)data.fileName=existingItem.fileName;
  if(existingItem?.fileSize&&!LIBRARY_SELECTED_FILE)data.fileSize=existingItem.fileSize;
  if(existingItem?.fileMime&&!LIBRARY_SELECTED_FILE)data.fileMime=existingItem.fileMime;

  if(LIBRARY_SELECTED_FILE){
    data.fileId="file_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    data.fileName=LIBRARY_SELECTED_FILE.name;
    data.fileSize=LIBRARY_SELECTED_FILE.size;
    data.fileMime=LIBRARY_SELECTED_FILE.type;
    data.type=guessLibraryType(LIBRARY_SELECTED_FILE);
    await saveFileBlob(data.fileId,LIBRARY_SELECTED_FILE);
    if(existingItem?.fileId&&existingItem.fileId!==data.fileId)await deleteFileBlob(existingItem.fileId);
  }

  APP_DATA.companies.forEach(c=>{c.library=(c.library||[]).filter(x=>x.id!==data.id)});
  const company=APP_DATA.companies.find(c=>c.id===companyId);company.library.push(data);
  saveData();clearLibraryForm();renderAllAdmin();
}

async function editLibraryItem(companyId,itemId){
  const c=APP_DATA.companies.find(x=>x.id===companyId),item=c?.library?.find(x=>x.id===itemId);if(!item)return;
  document.getElementById("libraryItemId").value=item.id;
  document.getElementById("libraryCompany").value=companyId;
  document.getElementById("libraryType").value=item.type||"link";
  document.getElementById("libraryCategory").value=item.category||"";
  document.getElementById("librarySubcategory").value=item.subcategory||"";
  document.getElementById("libraryVersion").value=item.version||"1.0";
  document.getElementById("libraryTitle").value=item.title||"";
  document.getElementById("libraryDescription").value=item.description||"";
  document.getElementById("libraryUrl").value=item.url||"";
  document.getElementById("libraryTags").value=(item.tags||[]).join(", ");
  document.getElementById("libraryPublishDate").value=item.publishDate||"";
  document.getElementById("libraryExpiryDate").value=item.expiryDate||"";
  document.getElementById("libraryActive").checked=item.active!==false;
  document.getElementById("libraryDownloadable").checked=item.downloadable!==false;
  document.getElementById("libraryFormTitle").textContent="İçeriği Düzenle";
  clearLibraryFile();
  if(item.fileName){
    document.getElementById("libraryFileInfo").innerHTML=`
      <div class="file-info-content">
        <div class="file-info-icon">${escapeHtml(libraryTypeInfo(item.type).icon)}</div>
        <div class="file-info-meta"><strong>${escapeHtml(item.fileName)}</strong><span>${formatFileSize(item.fileSize||0)} · Kayıtlı dosya</span></div>
      </div>`;
  }
}

async function deleteLibraryItem(companyId,itemId){
  const c=APP_DATA.companies.find(x=>x.id===companyId),item=c?.library?.find(x=>x.id===itemId);
  if(!item||!confirm(`${item.title} silinsin mi?`))return;
  if(item.fileId)await deleteFileBlob(item.fileId);
  c.library=c.library.filter(x=>x.id!==itemId);saveData();renderAllAdmin();
}

function libraryItemsForAdmin(){
  const q=document.getElementById("librarySearch").value.toLowerCase(),
  cf=document.getElementById("libraryCompanyFilter").value,tf=document.getElementById("libraryTypeFilter").value;
  const result=[];
  visibleCompanies().forEach(c=>{
    if(cf&&c.id!==cf)return;
    (c.library||[]).forEach(item=>{
      if(tf&&item.type!==tf)return;
      const hay=[item.title,item.category,item.subcategory,...(item.tags||[])].join(" ").toLowerCase();
      if(q&&!hay.includes(q))return;
      if(LIBRARY_SELECTED_FOLDER&&String(item.category||"")!==LIBRARY_SELECTED_FOLDER)return;
      result.push({...item,companyId:c.id,companyName:c.name});
    });
  });
  return result;
}

function renderLibraryFolders(){
  const list=document.getElementById("libraryFolderList");
  const categories=[...new Set(visibleCompanies().flatMap(c=>(c.library||[]).map(x=>x.category).filter(Boolean)))].sort();
  list.innerHTML=categories.map(cat=>`<button class="library-folder-btn ${LIBRARY_SELECTED_FOLDER===cat?"active":""}" data-folder="${escapeHtml(cat)}">📁 ${escapeHtml(cat)}</button>`).join("");
  document.querySelector('.library-folder-btn[data-folder=""]')?.classList.toggle("active",!LIBRARY_SELECTED_FOLDER);
  list.querySelectorAll("[data-folder]").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".library-folder-btn").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    LIBRARY_SELECTED_FOLDER=btn.dataset.folder;
    renderLibraryExplorer();
  });
}

function renderLibraryTable(){
  ensureLibraryArrays();
  const body=document.getElementById("libraryTable");body.innerHTML="";
  libraryItemsForAdmin().forEach(item=>{
    const info=libraryTypeInfo(item.type),tr=document.createElement("tr");
    tr.innerHTML=`<td><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.category||"Kategorisiz")}${item.version?" · v"+escapeHtml(item.version):""}</small></td><td>${escapeHtml(item.companyName)}</td><td><span class="library-badge">${escapeHtml(info.label)}</span></td><td>${item.active!==false?"Aktif":"Pasif"}</td><td><button class="action-btn edit">Düzenle</button><button class="action-btn danger delete">Sil</button></td>`;
    tr.querySelector(".edit").onclick=()=>editLibraryItem(item.companyId,item.id);
    tr.querySelector(".delete").onclick=()=>deleteLibraryItem(item.companyId,item.id);
    body.appendChild(tr);
  });
  renderLibraryFolders();renderLibraryExplorer();
}

function isExpired(item){
  return item.expiryDate&&new Date(item.expiryDate+"T23:59:59")<new Date();
}

function renderLibraryExplorer(){
  const items=libraryItemsForAdmin(),grid=document.getElementById("libraryExplorerGrid");
  document.getElementById("libraryExplorerTitle").textContent=LIBRARY_SELECTED_FOLDER||"Tüm İçerikler";
  document.getElementById("libraryExplorerCount").textContent=`${items.length} içerik`;
  grid.classList.toggle("list-mode",LIBRARY_EXPLORER_MODE==="list");
  if(!items.length){grid.innerHTML='<div class="dashboard-empty">Bu klasörde içerik bulunmuyor.</div>';return}
  grid.innerHTML=items.map(item=>{
    const info=libraryTypeInfo(item.type);
    return `<article class="library-file-card ${isExpired(item)?"expired":""}" data-company="${escapeHtml(item.companyId)}" data-id="${escapeHtml(item.id)}">
      <div class="library-file-head"><div class="library-file-icon">${escapeHtml(info.icon)}</div><span class="library-badge">${escapeHtml(info.label)}</span></div>
      <div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.description||item.fileName||"Kurumsal içerik")}</p></div>
      <div class="library-file-meta"><span>${escapeHtml(item.companyName)}</span><span>${item.fileSize?formatFileSize(item.fileSize):escapeHtml(item.version||"1.0")}</span></div>
    </article>`;
  }).join("");
  grid.querySelectorAll(".library-file-card").forEach(card=>card.onclick=()=>{
    const company=APP_DATA.companies.find(c=>c.id===card.dataset.company);
    const item=company?.library?.find(x=>x.id===card.dataset.id);
    if(item)showLibraryPreview({...item,companyName:company.name});
  });
}

function showLibraryPreview(item){
  const pane=document.getElementById("libraryPreviewPane"),info=libraryTypeInfo(item.type);
  pane.innerHTML=`<div class="library-preview-head"><div><span class="library-badge">${escapeHtml(info.label)}</span><h3>${escapeHtml(item.title)}</h3><p class="note">${escapeHtml(item.description||"")}</p></div><button id="closeLibraryPreview" class="btn">Kapat</button></div>
  <div class="library-preview-details">
    <div class="library-preview-detail"><span>Firma</span><strong>${escapeHtml(item.companyName||"")}</strong></div>
    <div class="library-preview-detail"><span>Kategori</span><strong>${escapeHtml(item.category||"-")}</strong></div>
    <div class="library-preview-detail"><span>Versiyon</span><strong>${escapeHtml(item.version||"1.0")}</strong></div>
    <div class="library-preview-detail"><span>Dosya</span><strong>${escapeHtml(item.fileName||item.url||"-")}</strong></div>
    <div class="library-preview-detail"><span>Boyut</span><strong>${item.fileSize?formatFileSize(item.fileSize):"-"}</strong></div>
    <div class="library-preview-detail"><span>Geçerlilik</span><strong>${escapeHtml(item.expiryDate||"-")}</strong></div>
  </div>
  <div class="library-preview-actions"><button id="openLibraryPreviewItem" class="btn btn-primary">Aç</button>${item.downloadable!==false?'<button id="downloadLibraryPreviewItem" class="btn">İndir</button>':""}</div>`;
  pane.classList.remove("hidden");
  document.getElementById("closeLibraryPreview").onclick=()=>pane.classList.add("hidden");
  document.getElementById("openLibraryPreviewItem").onclick=()=>openLibraryItem(item,false);
  document.getElementById("downloadLibraryPreviewItem")?.addEventListener("click",()=>openLibraryItem(item,true));
}

async function openLibraryItem(item,download=false){
  if(item.type==="announcement"){alert(`${item.title}\n\n${item.description||""}`);return}
  if(item.fileId){
    const stored=await getFileBlob(item.fileId);
    if(!stored)return alert("Dosya bu tarayıcıda bulunamadı.");
    const url=URL.createObjectURL(stored.blob);
    if(download){
      const a=document.createElement("a");a.href=url;a.download=item.fileName||stored.name||"dosya";a.click();
    }else window.open(url,"_blank","noopener");
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    return;
  }
  if(item.url){
    if(download){const a=document.createElement("a");a.href=item.url;a.download="";a.target="_blank";a.click()}
    else window.open(item.url,"_blank","noopener");
    return;
  }
  alert("Açılacak dosya veya bağlantı bulunmuyor.");
}

function selectedCompanyLibrary(){
  const c=selectedCompany();if(!c)return[];
  return(c.library||[]).filter(x=>x.active!==false).map(x=>({...x,key:`library:${c.id}:${x.id}`,companyId:c.id,companyName:c.name,isLibraryItem:true}));
}

document.getElementById("libraryFile").onchange=event=>{
  const file=event.target.files[0];if(!file)return;
  if(file.size>50*1024*1024){alert("Şimdilik en fazla 50 MB dosya yüklenebilir.");event.target.value="";return}
  LIBRARY_SELECTED_FILE=file;
  document.getElementById("libraryType").value=guessLibraryType(file);
  if(!document.getElementById("libraryTitle").value.trim())document.getElementById("libraryTitle").value=file.name.replace(/\.[^.]+$/,"");
  renderSelectedFileInfo(file);
};
document.getElementById("newLibraryItemBtn").onclick=clearLibraryForm;
document.getElementById("clearLibraryItemBtn").onclick=clearLibraryForm;
document.getElementById("saveLibraryItemBtn").onclick=saveLibraryItem;
document.getElementById("librarySearch").oninput=renderLibraryTable;
document.getElementById("libraryCompanyFilter").onchange=renderLibraryTable;
document.getElementById("libraryTypeFilter").onchange=renderLibraryTable;
document.querySelector('.library-folder-btn[data-folder=""]').onclick=()=>{
  document.querySelectorAll(".library-folder-btn").forEach(x=>x.classList.remove("active"));
  document.querySelector('.library-folder-btn[data-folder=""]').classList.add("active");
  LIBRARY_SELECTED_FOLDER="";renderLibraryExplorer();
};
document.getElementById("libraryGridModeBtn").onclick=()=>{
  LIBRARY_EXPLORER_MODE="grid";document.getElementById("libraryGridModeBtn").classList.add("active");document.getElementById("libraryListModeBtn").classList.remove("active");renderLibraryExplorer();
};
document.getElementById("libraryListModeBtn").onclick=()=>{
  LIBRARY_EXPLORER_MODE="list";document.getElementById("libraryListModeBtn").classList.add("active");document.getElementById("libraryGridModeBtn").classList.remove("active");renderLibraryExplorer();
};
