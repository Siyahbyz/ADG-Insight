const $=id=>document.getElementById(id);
let REPORT_VIEW_MODE="grid";
let REPORT_SELECTED_FILE=null;
let REPORT_FAVORITES=JSON.parse(localStorage.getItem("adgInsightV11Favorites")||"[]");
let REPORT_RECENT=JSON.parse(localStorage.getItem("adgInsightV11Recent")||"[]");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function saveReportPrefs(){localStorage.setItem("adgInsightV11Favorites",JSON.stringify(REPORT_FAVORITES));localStorage.setItem("adgInsightV11Recent",JSON.stringify(REPORT_RECENT))}
function reportKey(companyId,reportId){return `${companyId}:${reportId}`}
function reportTypeInfo(type){return ({powerbi:{label:"Power BI",icon:"BI"},web:{label:"Web",icon:"WEB"},pdf:{label:"PDF",icon:"PDF"},excel:{label:"Excel",icon:"XLS"},word:{label:"Word",icon:"DOC"},powerpoint:{label:"Sunum",icon:"PPT"},image:{label:"Görsel",icon:"IMG"},video:{label:"Video",icon:"VID"}})[type]||{label:"Web",icon:"WEB"}}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$(id).classList.add("active")}
function isAdmin(){return CURRENT_USER?.role==="system_admin"}
function visibleCompanies(){return isAdmin()?DATA.companies:DATA.companies.filter(c=>(CURRENT_USER?.companyIds||[]).includes(c.id))}
function setSession(){ $("sessionLabel").textContent=`${CURRENT_USER.name} · ${ROLES[CURRENT_USER.role].label}`; ["sessionLabel","profileBtn","logoutBtn"].forEach(id=>$(id).classList.remove("hidden")); $("adminBtn").classList.toggle("hidden",CURRENT_USER.role==="viewer")}

$("loginForm").onsubmit=e=>{e.preventDefault();const email=$("loginEmail").value.trim().toLowerCase(),pw=$("loginPassword").value;const u=DATA.users.find(x=>x.email.toLowerCase()===email&&x.password===pw);if(!u){$("loginMessage").textContent="E-posta veya şifre hatalı.";return}CURRENT_USER=u;$("loginMessage").textContent="";setSession();renderCompanyCards();showView("companyView")};
$("logoutBtn").onclick=()=>location.reload();
$("changeCompanyBtn").onclick=()=>{SELECTED_COMPANY=null;renderCompanyCards();showView("companyView")};
$("backPortalBtn").onclick=()=>{renderCompanyCards();showView("companyView")};
$("adminBtn").onclick=()=>{if(CURRENT_USER.role==="viewer")return;renderAdmin();showView("adminView")};

function renderCompanyCards(){const wrap=$("companyCards"),items=visibleCompanies();wrap.innerHTML=items.length?"":'<div class="panel">Yetkili firma bulunmuyor.</div>';items.forEach(c=>{const card=document.createElement("article");card.className="company-card";const visual=c.logo?`<div class="logo"><img src="${esc(c.logo)}"></div>`:`<div class="fallback" style="background:${esc(c.color)}">${esc(c.shortName)}</div>`;card.innerHTML=`${visual}<h3>${esc(c.name)}</h3><p>${(c.reports||[]).length} rapor · ${(c.library||[]).length} kütüphane içeriği</p><span class="arrow">→</span>`;card.onclick=()=>openCompany(c.id);wrap.appendChild(card)})}
function openCompany(id){SELECTED_COMPANY=DATA.companies.find(c=>c.id===id);if(!SELECTED_COMPANY)return;$("sideLogo").textContent=SELECTED_COMPANY.shortName;$("sideCompany").textContent=SELECTED_COMPANY.name;$("dashKicker").textContent=`${SELECTED_COMPANY.shortName} Dashboard`;$("dashHero").textContent=`${SELECTED_COMPANY.name} Karar Merkezi`;$("statReports").textContent=(SELECTED_COMPANY.reports||[]).filter(r=>r.active!==false).length;$("statFavorites").textContent=(SELECTED_COMPANY.reports||[]).filter(r=>REPORT_FAVORITES.includes(reportKey(id,r.id))).length;$("statRecent").textContent=(SELECTED_COMPANY.reports||[]).filter(r=>REPORT_RECENT.includes(reportKey(id,r.id))).length;$("statUsers").textContent=DATA.users.filter(u=>(u.companyIds||[]).includes(id)).length;const fields=[["Telefon",SELECTED_COMPANY.phone],["E-posta",SELECTED_COMPANY.email],["Web",SELECTED_COMPANY.website],["Adres",SELECTED_COMPANY.address]].filter(x=>x[1]);$("companyProfile").innerHTML=fields.length?fields.map(([l,v])=>`<div class="profile-item"><span>${l}</span><b>${esc(v)}</b></div>`).join(""):'<div class="profile-item"><span>Bilgi</span><b>Firma profil bilgileri henüz girilmedi.</b></div>';renderPortalReports();showPortalPage("overview");showView("dashboardView")}

document.querySelectorAll(".admin-nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".admin-page").forEach(x=>x.classList.remove("active"));$("admin-"+b.dataset.page).classList.add("active")});
function renderAdmin(){$("adminCompanyCount").textContent=DATA.companies.length;$("adminUserCount").textContent=DATA.users.length;renderCompanyTable();renderUserForm();renderUserTable();renderReportAdminOptions();renderReportTable();renderRoles()}

let logoData="";
function clearCompanyForm(){logoData="";$("companyId").value="";$("companyName").value="";$("companyShort").value="";$("companyColor").value="#19b77d";$("companyPhone").value="";$("companyEmail").value="";$("companyWebsite").value="";$("companyAddress").value="";$("companyLogoUrl").value="";$("companyLogoFile").value="";$("logoPreview").innerHTML="Logo önizlemesi";$("companyFormTitle").textContent="Yeni Firma"}
$("newCompanyBtn").onclick=clearCompanyForm;$("clearCompanyBtn").onclick=clearCompanyForm;
$("companyLogoFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{logoData=r.result;$("companyLogoUrl").value="";$("logoPreview").innerHTML=`<img src="${esc(logoData)}">`};r.readAsDataURL(f)};
$("companyLogoUrl").oninput=()=>{logoData="";const src=$("companyLogoUrl").value.trim();$("logoPreview").innerHTML=src?`<img src="${esc(src)}">`:"Logo önizlemesi"};
$("companyForm").onsubmit=e=>{e.preventDefault();const id=$("companyId").value,name=$("companyName").value.trim();if(!name)return;const data={name,shortName:$("companyShort").value.trim().toUpperCase()||name.slice(0,3).toUpperCase(),color:$("companyColor").value,phone:$("companyPhone").value.trim(),email:$("companyEmail").value.trim(),website:$("companyWebsite").value.trim(),address:$("companyAddress").value.trim(),logo:logoData||$("companyLogoUrl").value.trim()};if(id){Object.assign(DATA.companies.find(c=>c.id===id),data)}else{const nid="c_"+Date.now();DATA.companies.push({id:nid,...data,reports:[],library:[]});DATA.users.filter(u=>u.role==="system_admin").forEach(u=>u.companyIds.push(nid))}saveData();clearCompanyForm();renderAdmin()};
function editCompany(id){const c=DATA.companies.find(x=>x.id===id);$("companyId").value=c.id;$("companyName").value=c.name;$("companyShort").value=c.shortName;$("companyColor").value=c.color;$("companyPhone").value=c.phone||"";$("companyEmail").value=c.email||"";$("companyWebsite").value=c.website||"";$("companyAddress").value=c.address||"";logoData=c.logo?.startsWith("data:")?c.logo:"";$("companyLogoUrl").value=logoData?"":c.logo||"";$("logoPreview").innerHTML=c.logo?`<img src="${esc(c.logo)}">`:"Logo önizlemesi";$("companyFormTitle").textContent="Firmayı Düzenle"}
function deleteCompany(id){const c=DATA.companies.find(x=>x.id===id);if(!confirm(`${c.name} silinsin mi?`))return;DATA.companies=DATA.companies.filter(x=>x.id!==id);DATA.users.forEach(u=>u.companyIds=(u.companyIds||[]).filter(x=>x!==id));saveData();renderAdmin()}
function renderCompanyTable(){$("companyTable").innerHTML=DATA.companies.map(c=>`<tr><td><b>${esc(c.name)}</b><br><small>${esc(c.shortName)}</small></td><td>${esc(c.email||c.phone||"-")}</td><td><button class="action" onclick="editCompany('${c.id}')">Düzenle</button><button class="action danger" onclick="deleteCompany('${c.id}')">Sil</button></td></tr>`).join("")}

function renderUserForm(){const sel=$("userRole");sel.innerHTML=Object.entries(ROLES).filter(([k])=>isAdmin()||k!=="system_admin").map(([k,r])=>`<option value="${k}">${r.label}</option>`).join("");$("userCompanies").innerHTML=visibleCompanies().map(c=>`<label class="check"><input type="checkbox" value="${c.id}"> ${esc(c.name)}</label>`).join("")}
function clearUserForm(){$("editingUser").value="";$("userName").value="";$("userEmail").value="";$("userEmail").disabled=false;$("userPassword").value="";$("userRole").value="viewer";$("userCompanies").querySelectorAll("input").forEach(x=>x.checked=false);$("userFormTitle").textContent="Yeni Kullanıcı"}
$("newUserBtn").onclick=clearUserForm;$("clearUserBtn").onclick=clearUserForm;
$("userForm").onsubmit=e=>{e.preventDefault();const editing=$("editingUser").value,name=$("userName").value.trim(),email=$("userEmail").value.trim().toLowerCase(),password=$("userPassword").value,role=$("userRole").value,companyIds=[...$("userCompanies").querySelectorAll("input:checked")].map(x=>x.value);if(!name||!email)return;if(editing){const u=DATA.users.find(x=>x.email===editing);u.name=name;u.role=role;u.companyIds=companyIds;if(password)u.password=password}else{if(password.length<6)return alert("Şifre en az 6 karakter olmalıdır.");if(DATA.users.some(x=>x.email===email))return alert("E-posta zaten kayıtlı.");DATA.users.push({name,email,password,role,companyIds})}saveData();clearUserForm();renderAdmin()};
function editUser(email){const u=DATA.users.find(x=>x.email===email);$("editingUser").value=u.email;$("userName").value=u.name;$("userEmail").value=u.email;$("userEmail").disabled=true;$("userPassword").value="";$("userRole").value=u.role;$("userCompanies").querySelectorAll("input").forEach(x=>x.checked=u.companyIds.includes(x.value));$("userFormTitle").textContent="Kullanıcıyı Düzenle"}
function deleteUser(email){const u=DATA.users.find(x=>x.email===email);if(u.role==="system_admin")return;if(!confirm(`${u.name} silinsin mi?`))return;DATA.users=DATA.users.filter(x=>x.email!==email);saveData();renderAdmin()}
function renderUserTable(){$("userTable").innerHTML=DATA.users.map(u=>`<tr><td><b>${esc(u.name)}</b><br><small>${esc(u.email)}</small></td><td>${esc(ROLES[u.role].label)}</td><td>${esc((u.companyIds||[]).map(id=>DATA.companies.find(c=>c.id===id)?.shortName).filter(Boolean).join(", ")||"-")}</td><td><button class="action" onclick="editUser('${u.email}')">Düzenle</button>${u.role==="system_admin"?"":`<button class="action danger" onclick="deleteUser('${u.email}')">Sil</button>`}</td></tr>`).join("")}
function renderRoles(){$("roleCards").innerHTML=Object.values(ROLES).map(r=>`<div class="role-card"><h3>${r.label}</h3><p>${r.description}</p><ul>${r.permissions.map(p=>`<li>${p}</li>`).join("")||"<li>Sadece görüntüleme</li>"}</ul></div>`).join("")}

$("profileBtn").onclick=()=>{$("profileName").value=CURRENT_USER.name;$("oldPassword").value="";$("newPassword").value="";$("confirmPassword").value="";$("profileMessage").textContent="";$("profileModal").classList.add("active")};
$("closeProfileBtn").onclick=()=>$("profileModal").classList.remove("active");
$("saveProfileBtn").onclick=()=>{const name=$("profileName").value.trim(),old=$("oldPassword").value,nw=$("newPassword").value,cf=$("confirmPassword").value;CURRENT_USER.name=name||CURRENT_USER.name;if(nw){if(old!==CURRENT_USER.password){$("profileMessage").textContent="Mevcut şifre hatalı.";return}if(nw.length<6||nw!==cf){$("profileMessage").textContent="Yeni şifre en az 6 karakter olmalı ve tekrar ile eşleşmelidir.";return}CURRENT_USER.password=nw}saveData();setSession();$("profileMessage").style.color="#63e4b0";$("profileMessage").textContent="Profil güncellendi.";setTimeout(()=>$("profileModal").classList.remove("active"),700)};
clearCompanyForm();

function activeCompanyReports(){
  if(!SELECTED_COMPANY)return[];
  const q=$("reportSearch").value.trim().toLowerCase(),cat=$("reportCategoryFilter").value,type=$("reportTypeFilter").value;
  return (SELECTED_COMPANY.reports||[]).filter(r=>r.active!==false).filter(r=>{
    if(cat&&r.category!==cat)return false;
    if(type&&r.type!==type)return false;
    if(q&&![r.title,r.description,r.category,reportTypeInfo(r.type).label].some(v=>String(v||"").toLowerCase().includes(q)))return false;
    return true;
  }).sort((a,b)=>(a.order||0)-(b.order||0));
}
function fillReportCategories(){
  const cats=[...new Set((SELECTED_COMPANY?.reports||[]).map(r=>r.category).filter(Boolean))].sort();
  $("reportCategoryFilter").innerHTML='<option value="">Tüm kategoriler</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
}
function reportCardHtml(r){
  const info=reportTypeInfo(r.type),key=reportKey(SELECTED_COMPANY.id,r.id),fav=REPORT_FAVORITES.includes(key);
  return `<article class="report-card" data-report="${esc(r.id)}">
    <div class="report-card-top"><div class="report-icon">${esc(info.icon)}</div><button class="favorite ${fav?"active":""}" data-favorite="${esc(r.id)}">★</button></div>
    <div><h4>${esc(r.title)}</h4><p>${esc(r.description||"Kurumsal rapor")}</p></div>
    <div class="report-meta"><b>${esc(r.category||"Genel")}</b><span>${esc(info.label)}</span></div>
    <div class="report-card-actions"><button class="report-open" data-open="${esc(r.id)}">Aç</button>${r.sourceMode==="file"?`<button class="report-download" data-download="${esc(r.id)}">İndir</button>`:""}</div>
  </article>`;
}
function bindReportCards(container,reports){
  container.querySelectorAll(".report-card").forEach(card=>{
    const report=reports.find(r=>r.id===card.dataset.report);
    card.onclick=()=>openReport(report);
  });
  container.querySelectorAll("[data-favorite]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();toggleReportFavorite(btn.dataset.favorite)});
  container.querySelectorAll("[data-open]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();const report=reports.find(r=>r.id===btn.dataset.open);openReport(report,false)});
  container.querySelectorAll("[data-download]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();const report=reports.find(r=>r.id===btn.dataset.download);openReport(report,true)});
}
function renderReportSet(containerId,reports,limit=null){
  const box=$(containerId),items=limit?reports.slice(0,limit):reports;
  box.classList.toggle("list",REPORT_VIEW_MODE==="list");
  if(!items.length){box.innerHTML='<div class="empty-card">Gösterilecek rapor bulunmuyor.</div>';return}
  box.innerHTML=items.map(reportCardHtml).join("");
  bindReportCards(box,items);
}
function renderPortalReports(){
  if(!SELECTED_COMPANY)return;
  fillReportCategories();
  const reports=activeCompanyReports(),favorites=reports.filter(r=>REPORT_FAVORITES.includes(reportKey(SELECTED_COMPANY.id,r.id))),
  recent=REPORT_RECENT.map(k=>{const [cid,rid]=k.split(":");return cid===SELECTED_COMPANY.id?reports.find(r=>r.id===rid):null}).filter(Boolean);
  const featured=[...favorites,...reports.filter(r=>!favorites.includes(r))];
  renderReportSet("featuredReports",featured,6);
  renderReportSet("allReports",reports);
  renderReportSet("favoriteReports",favorites);
  renderReportSet("recentReports",recent);
  $("statReports").textContent=reports.length;$("statFavorites").textContent=favorites.length;$("statRecent").textContent=recent.length;
}
function toggleReportFavorite(reportId){
  const key=reportKey(SELECTED_COMPANY.id,reportId);
  REPORT_FAVORITES=REPORT_FAVORITES.includes(key)?REPORT_FAVORITES.filter(x=>x!==key):[...REPORT_FAVORITES,key];
  saveReportPrefs();renderPortalReports();
}
async function openReport(report,download=false){
  if(!report)return;
  const key=reportKey(SELECTED_COMPANY.id,report.id);
  REPORT_RECENT=[key,...REPORT_RECENT.filter(x=>x!==key)].slice(0,20);saveReportPrefs();
  if(report.sourceMode==="file"&&report.fileId){
    const stored=await getReportFile(report.fileId);
    if(!stored){alert("Dosya bu tarayıcıda bulunamadı.");renderPortalReports();return}
    const objectUrl=URL.createObjectURL(stored.blob);
    if(download){const a=document.createElement("a");a.href=objectUrl;a.download=report.fileName||stored.name||"dosya";a.click()}
    else window.open(objectUrl,"_blank","noopener");
    setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);renderPortalReports();return;
  }
  if(!String(report.url||"").trim()){alert("Bu rapor için bağlantı veya dosya eklenmemiş.");renderPortalReports();return}
  if(download){const a=document.createElement("a");a.href=report.url;a.target="_blank";a.download="";a.click()}
  else window.open(report.url,"_blank","noopener");
  renderPortalReports();
}
function showPortalPage(page){
  document.querySelectorAll(".portal-nav").forEach(b=>b.classList.toggle("active",b.dataset.portalPage===page));
  document.querySelectorAll(".portal-page").forEach(p=>p.classList.remove("active"));
  $("portal-"+page).classList.add("active");
  $("portalPageTitle").textContent=({overview:"Genel Bakış",reports:"Raporlar",favorites:"Favoriler",recent:"Son Açılanlar"})[page]||"Genel Bakış";
}
document.querySelectorAll(".portal-nav").forEach(b=>b.onclick=()=>showPortalPage(b.dataset.portalPage));
$("showAllReportsBtn").onclick=()=>showPortalPage("reports");
$("reportSearch").oninput=renderPortalReports;$("reportCategoryFilter").onchange=renderPortalReports;$("reportTypeFilter").onchange=renderPortalReports;
$("reportGridBtn").onclick=()=>{REPORT_VIEW_MODE="grid";$("reportGridBtn").classList.add("active");$("reportListBtn").classList.remove("active");renderPortalReports()};
$("reportListBtn").onclick=()=>{REPORT_VIEW_MODE="list";$("reportListBtn").classList.add("active");$("reportGridBtn").classList.remove("active");renderPortalReports()};

function renderReportAdminOptions(){
  const opts=DATA.companies.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
  $("reportCompany").innerHTML=opts;$("adminReportCompanyFilter").innerHTML='<option value="">Tüm firmalar</option>'+opts;
}
function clearReportFileSelection(){REPORT_SELECTED_FILE=null;$("reportFile").value="";$("reportFileInfo").innerHTML='<span class="note">Henüz dosya seçilmedi.</span>'}
function updateReportSourceMode(){const mode=document.querySelector('input[name="reportSourceMode"]:checked').value;$("reportUrlArea").classList.toggle("hidden",mode!=="url");$("reportFileArea").classList.toggle("hidden",mode!=="file")}
function clearReportForm(){$("reportEditKey").value="";$("reportType").value="powerbi";$("reportCategory").value="";$("reportTitle").value="";$("reportDescription").value="";$("reportUrl").value="";$("reportOrder").value="0";$("reportActive").checked=true;document.querySelector('input[name="reportSourceMode"][value="url"]').checked=true;updateReportSourceMode();clearReportFileSelection();$("reportFormTitle").textContent="Yeni Rapor"}
$("newReportBtn").onclick=clearReportForm;$("clearReportBtn").onclick=clearReportForm;
$("reportForm").onsubmit=async e=>{e.preventDefault();const companyId=$("reportCompany").value,key=$("reportEditKey").value,title=$("reportTitle").value.trim();if(!companyId||!title)return;const sourceMode=document.querySelector('input[name="reportSourceMode"]:checked').value;const existingReport=key?DATA.companies.flatMap(c=>c.reports||[]).find(r=>r.id===key.split(":")[1]):null;if(sourceMode==="url"&&!$("reportUrl").value.trim())return alert("Bağlantı adresi zorunludur.");if(sourceMode==="file"&&!REPORT_SELECTED_FILE&&!existingReport?.fileId)return alert("Bir dosya seçin.");const data={id:key?key.split(":")[1]:"rep_"+Date.now(),title,description:$("reportDescription").value.trim(),url:sourceMode==="url"?$("reportUrl").value.trim():"",type:$("reportType").value,category:$("reportCategory").value.trim()||"Genel",order:Number($("reportOrder").value)||0,active:$("reportActive").checked,sourceMode};if(sourceMode==="file"){if(REPORT_SELECTED_FILE){data.fileId="report_file_"+Date.now()+"_"+Math.random().toString(36).slice(2);data.fileName=REPORT_SELECTED_FILE.name;data.fileSize=REPORT_SELECTED_FILE.size;data.fileMime=REPORT_SELECTED_FILE.type;await saveReportFile(data.fileId,REPORT_SELECTED_FILE);if(existingReport?.fileId&&existingReport.fileId!==data.fileId)await deleteReportFile(existingReport.fileId)}else{data.fileId=existingReport.fileId;data.fileName=existingReport.fileName;data.fileSize=existingReport.fileSize;data.fileMime=existingReport.fileMime}}else if(existingReport?.fileId){await deleteReportFile(existingReport.fileId)}DATA.companies.forEach(c=>c.reports=(c.reports||[]).filter(r=>r.id!==data.id));DATA.companies.find(c=>c.id===companyId).reports.push(data);saveData();clearReportForm();renderAdmin()};
function editReport(companyId,reportId){const c=DATA.companies.find(x=>x.id===companyId),r=c?.reports?.find(x=>x.id===reportId);if(!r)return;$("reportEditKey").value=`${companyId}:${reportId}`;$("reportCompany").value=companyId;$("reportType").value=r.type;$("reportCategory").value=r.category;$("reportTitle").value=r.title;$("reportDescription").value=r.description;$("reportUrl").value=r.url||"";$("reportOrder").value=r.order||0;$("reportActive").checked=r.active!==false;document.querySelector(`input[name="reportSourceMode"][value="${r.sourceMode||"url"}"]`).checked=true;updateReportSourceMode();clearReportFileSelection();if(r.fileName)$("reportFileInfo").innerHTML=`<div class="report-file-info"><div class="report-file-icon">${esc(reportTypeInfo(r.type).icon)}</div><div class="report-file-meta"><strong>${esc(r.fileName)}</strong><span>${formatReportFileSize(r.fileSize||0)} · Kayıtlı dosya</span></div></div>`;$("reportFormTitle").textContent="Raporu Düzenle"}
async function deleteReport(companyId,reportId){const c=DATA.companies.find(x=>x.id===companyId),r=c?.reports?.find(x=>x.id===reportId);if(!r||!confirm(`${r.title} silinsin mi?`))return;if(r.fileId)await deleteReportFile(r.fileId);c.reports=c.reports.filter(x=>x.id!==reportId);REPORT_FAVORITES=REPORT_FAVORITES.filter(k=>k!==reportKey(companyId,reportId));REPORT_RECENT=REPORT_RECENT.filter(k=>k!==reportKey(companyId,reportId));saveReportPrefs();saveData();renderAdmin()}
function renderReportTable(){const q=$("adminReportSearch").value.trim().toLowerCase(),filter=$("adminReportCompanyFilter").value;$("reportTable").innerHTML="";DATA.companies.forEach(c=>{if(filter&&c.id!==filter)return;(c.reports||[]).filter(r=>!q||[r.title,r.category,r.description].some(v=>String(v||"").toLowerCase().includes(q))).forEach(r=>{$("reportTable").insertAdjacentHTML("beforeend",`<tr><td><b>${esc(r.title)}</b><br><small>${esc(r.category)}</small></td><td>${esc(c.name)}</td><td>${esc(reportTypeInfo(r.type).label)}</td><td>${r.active!==false?"Aktif":"Pasif"}</td><td><button class="action" onclick="editReport('${c.id}','${r.id}')">Düzenle</button><button class="action danger" onclick="deleteReport('${c.id}','${r.id}')">Sil</button></td></tr>`)})})}
$("adminReportSearch").oninput=renderReportTable;$("adminReportCompanyFilter").onchange=renderReportTable;

/* V11.0-B.1: Portal menüsü için güvenli olay delegasyonu */
document.addEventListener("click", event => {
  const portalButton = event.target.closest("[data-portal-page]");
  if (!portalButton) return;

  event.preventDefault();
  const page = portalButton.dataset.portalPage;
  if (!["overview", "reports", "favorites", "recent"].includes(page)) return;

  showPortalPage(page);
  renderPortalReports();
});

function guessReportTypeFromFile(file){
  const name=String(file?.name||"").toLowerCase();
  if(name.endsWith(".pdf"))return"pdf";if(/\.(xlsx|xls|csv)$/.test(name))return"excel";
  if(/\.(doc|docx)$/.test(name))return"word";if(/\.(ppt|pptx)$/.test(name))return"powerpoint";
  if(/\.(png|jpg|jpeg|webp|svg)$/.test(name))return"image";if(/\.(mp4|webm)$/.test(name))return"video";return"web";
}
function handleReportFile(file){
  if(!file)return;if(file.size>100*1024*1024)return alert("Şimdilik en fazla 100 MB dosya yüklenebilir.");
  REPORT_SELECTED_FILE=file;$("reportType").value=guessReportTypeFromFile(file);
  if(!$("reportTitle").value.trim())$("reportTitle").value=file.name.replace(/\.[^.]+$/,"");
  const info=reportTypeInfo($("reportType").value);
  $("reportFileInfo").innerHTML=`<div class="report-file-info"><div class="report-file-icon">${esc(info.icon)}</div><div class="report-file-meta"><strong>${esc(file.name)}</strong><span>${formatReportFileSize(file.size)} · ${esc(file.type||"Dosya")}</span></div><button id="removeReportFile" type="button" class="report-file-remove">Kaldır</button></div>`;
  $("removeReportFile").onclick=clearReportFileSelection;
}
document.querySelectorAll('input[name="reportSourceMode"]').forEach(r=>r.onchange=updateReportSourceMode);
$("reportFile").onchange=e=>handleReportFile(e.target.files[0]);
["dragenter","dragover"].forEach(evt=>$("reportDropZone").addEventListener(evt,e=>{e.preventDefault();$("reportDropZone").classList.add("dragover")}));
["dragleave","drop"].forEach(evt=>$("reportDropZone").addEventListener(evt,e=>{e.preventDefault();$("reportDropZone").classList.remove("dragover")}));
$("reportDropZone").addEventListener("drop",e=>handleReportFile(e.dataTransfer.files[0]));
updateReportSourceMode();
