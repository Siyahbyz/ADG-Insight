let PORTAL_VIEW = "home";
let PORTAL_GRID_MODE = "grid";
let SELECTED_COMPANY_ID = null;
let PORTAL_FAVORITES = JSON.parse(localStorage.getItem("adgInsightFavorites") || "[]");
let PORTAL_RECENT = JSON.parse(localStorage.getItem("adgInsightRecent") || "[]");

function selectedCompany(){
  return APP_DATA.companies.find(company => company.id === SELECTED_COMPANY_ID) || null;
}

function selectedCompanyReports(){
  const company = selectedCompany();
  if (!company) return [];

  return (company.reports || [])
    .map((report, index) => ({
      ...report,
      companyId: company.id,
      companyName: company.name,
      companyShortName: company.shortName,
      index,
      key: `${company.id}:${index}`
    }))
    .filter(report => String(report.url || "").trim());
}

function reportType(report){
  const url = String(report.url || "").toLowerCase();
  if (url.includes("powerbi") || url.includes("app.powerbi.com")) return {label:"Power BI",icon:"BI"};
  if (url.endsWith(".pdf")) return {label:"PDF",icon:"PDF"};
  if (url.endsWith(".xlsx") || url.endsWith(".xls") || url.endsWith(".csv")) return {label:"Excel",icon:"XLS"};
  if (url.endsWith(".doc") || url.endsWith(".docx")) return {label:"Word",icon:"DOC"};
  if (url.endsWith(".ppt") || url.endsWith(".pptx")) return {label:"Sunum",icon:"PPT"};
  return {label:"Web",icon:"WEB"};
}

function savePortalPrefs(){
  localStorage.setItem("adgInsightFavorites", JSON.stringify(PORTAL_FAVORITES));
  localStorage.setItem("adgInsightRecent", JSON.stringify(PORTAL_RECENT));
}

function renderPortal(){
  showCompanySelection();
}

function showCompanySelection(){
  SELECTED_COMPANY_ID = null;
  document.getElementById("companySelectionView").classList.remove("hidden");
  document.getElementById("portalDashboard").classList.add("hidden");

  const grid = document.getElementById("companySelectionGrid");
  const companies = visibleCompanies().filter(company => company.active !== false);
  grid.innerHTML = "";

  if (!companies.length){
    grid.innerHTML = '<div class="dashboard-empty">Bu kullanıcı için tanımlı firma bulunmuyor.</div>';
    return;
  }

  companies.forEach(company => {
    const validReports = (company.reports || []).filter(report => String(report.url || "").trim());
    const card = document.createElement("article");
    card.className = "company-select-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const visual = company.logo
      ? `<div class="company-select-logo"><img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.name)} logosu"></div>`
      : `<div class="company-select-fallback" style="background:linear-gradient(145deg,${escapeHtml(company.color || "#19b77d")},#0c7659)">${escapeHtml(company.shortName || company.name.slice(0,3).toUpperCase())}</div>`;

    card.innerHTML = `
      ${visual}
      <div class="company-select-name">${escapeHtml(company.name)}</div>
      <div class="company-select-meta">${validReports.length} yayınlanmış içerik</div>
      <div class="company-select-arrow">→</div>
    `;

    card.onclick = () => openCompanyDashboard(company.id);
    card.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCompanyDashboard(company.id);
      }
    };
    grid.appendChild(card);
  });
}

function openCompanyDashboard(companyId){
  SELECTED_COMPANY_ID = companyId;
  PORTAL_VIEW = "home";

  document.getElementById("companySelectionView").classList.add("hidden");
  document.getElementById("portalDashboard").classList.remove("hidden");

  document.querySelectorAll(".portal-nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.portalView === "home");
  });

  const company = selectedCompany();
  const shortName = company.shortName || company.name.slice(0,3).toUpperCase();

  document.getElementById("selectedCompanyMiniLogo").textContent = shortName;
  document.getElementById("selectedCompanySidebarName").textContent = company.name;
  document.getElementById("selectedCompanyKicker").textContent = shortName + " Dashboard";
  document.getElementById("portalHeroTitle").innerHTML = `${escapeHtml(company.name)}<br>Karar Merkezi`;
  document.getElementById("portalHeroText").textContent =
    "Bu firmaya ait raporları, analizleri ve kurumsal dokümanları tek merkezden yönetin.";

  document.getElementById("portalSearch").value = "";
  renderCompanyProfile();
  renderPortalStats();
  renderPortalContent();
}

function toggleFavorite(key, event){
  event.stopPropagation();

  if (PORTAL_FAVORITES.includes(key)) {
    PORTAL_FAVORITES = PORTAL_FAVORITES.filter(item => item !== key);
  } else {
    PORTAL_FAVORITES.push(key);
  }

  savePortalPrefs();
  renderPortalContent();
}

function openPortalReport(report){
  if (!report || !String(report.url || "").trim()) {
    alert("Bu içerik için geçerli bir bağlantı bulunmuyor.");
    return;
  }

  PORTAL_RECENT = [report.key, ...PORTAL_RECENT.filter(item => item !== report.key)].slice(0, 12);
  savePortalPrefs();

  const opened = window.open(report.url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = report.url;
  }

  renderPortalContent();
}

function renderCompanyProfile(){
  const company = selectedCompany();
  const card = document.getElementById("companyProfileCard");
  if (!company || !card) return;

  const hasInfo = [company.taxNo,company.taxOffice,company.phone,company.email,company.website,company.address]
    .some(value => String(value || "").trim());

  if (!hasInfo) {
    card.classList.add("hidden");
    card.innerHTML = "";
    return;
  }

  const visual = company.logo
    ? `<div class="company-profile-logo"><img src="${escapeHtml(company.logo)}" alt=""></div>`
    : `<div class="company-profile-fallback" style="background:${escapeHtml(company.color || "#19b77d")}">${escapeHtml(company.shortName || company.name.slice(0,3).toUpperCase())}</div>`;

  const items = [
    ["Vergi No", company.taxNo],
    ["Vergi Dairesi", company.taxOffice],
    ["Telefon", company.phone],
    ["E-posta", company.email],
    ["Web Sitesi", company.website],
    ["Adres", company.address]
  ].filter(([,value]) => String(value || "").trim());

  card.innerHTML = `
    <div class="company-profile-head">
      ${visual}
      <div class="company-profile-title">
        <h3>${escapeHtml(company.name)}</h3>
        <p>Kurumsal firma profili</p>
      </div>
    </div>
    <div class="company-profile-grid">
      ${items.map(([label,value]) => {
        const safeValue = escapeHtml(value);
        const content = label === "Web Sitesi"
          ? `<a href="${safeValue}" target="_blank" rel="noopener">${safeValue}</a>`
          : label === "E-posta"
            ? `<a href="mailto:${safeValue}">${safeValue}</a>`
            : label === "Telefon"
              ? `<a href="tel:${safeValue}">${safeValue}</a>`
              : `<strong>${safeValue}</strong>`;
        return `<div class="company-profile-item"><span>${label}</span>${content}</div>`;
      }).join("")}
    </div>
  `;
  card.classList.remove("hidden");
}

function renderPortalStats(){
  const reports = selectedCompanyReports();
  const types = new Set(reports.map(report => reportType(report).label));
  const favoriteCount = reports.filter(report => PORTAL_FAVORITES.includes(report.key)).length;
  const recentCount = reports.filter(report => PORTAL_RECENT.includes(report.key)).length;

  const stats = [
    [reports.length, "Yayınlanmış rapor"],
    [favoriteCount, "Favori içerik"],
    [recentCount, "Son açılan"],
    [types.size, "İçerik türü"]
  ];

  document.getElementById("portalStats").innerHTML = stats.map(([value,label]) =>
    `<div class="portal-stat"><strong>${value}</strong><span>${label}</span></div>`
  ).join("");
}

function filteredPortalReports(){
  const search = String(document.getElementById("portalSearch")?.value || "").trim().toLowerCase();
  let reports = selectedCompanyReports();

  if (search) {
    reports = reports.filter(report =>
      [report.title, report.description, reportType(report).label]
        .some(value => String(value || "").toLowerCase().includes(search))
    );
  }

  if (PORTAL_VIEW === "favorites") {
    reports = reports.filter(report => PORTAL_FAVORITES.includes(report.key));
  } else if (PORTAL_VIEW === "recent") {
    reports = PORTAL_RECENT
      .map(key => reports.find(report => report.key === key))
      .filter(Boolean);
  } else if (PORTAL_VIEW === "home") {
    reports = [...reports].sort((a,b) => {
      const af = PORTAL_FAVORITES.includes(a.key) ? 1 : 0;
      const bf = PORTAL_FAVORITES.includes(b.key) ? 1 : 0;
      return bf - af;
    }).slice(0, 8);
  } else if (PORTAL_VIEW === "library") {
    const libraryItems=selectedCompanyLibrary();
    reports=[...libraryItems,...reports.filter(report=>reportType(report).label!=="Power BI")];
    if(search){
      reports=reports.filter(item=>[item.title,item.description,item.category,item.subcategory,...(item.tags||[])].some(v=>String(v||"").toLowerCase().includes(search)));
    }
  }
  return reports;
}

function renderPortalContent(){
  const titleMap = {
    home:["Genel Bakış","Öne Çıkan Raporlar","En sık kullanılan ve son eklenen içerikler"],
    reports:["Tüm Raporlar","Tüm Raporlar","Firmaya ait tüm rapor ve analizler"],
    favorites:["Favoriler","Favori İçerikler","Hızlı erişim için işaretlediğiniz içerikler"],
    recent:["Son Açılanlar","Son Açılanlar","Yakın zamanda görüntülediğiniz içerikler"],
    library:["Kütüphane","Kurumsal Kütüphane","PDF, Excel, Word ve diğer kurumsal dokümanlar"]
  };

  const [pageTitle,sectionTitle,sectionSubtitle] = titleMap[PORTAL_VIEW] || titleMap.home;
  document.getElementById("portalTitle").textContent = pageTitle;
  document.getElementById("portalSectionTitle").textContent = sectionTitle;
  document.getElementById("portalSectionSubtitle").textContent = sectionSubtitle;
  document.getElementById("portalHero").style.display = PORTAL_VIEW === "home" ? "flex" : "none";

  const grid = document.getElementById("portalContentGrid");
  grid.classList.toggle("list-view", PORTAL_GRID_MODE === "list");
  const reports = filteredPortalReports();

  if (!reports.length) {
    grid.innerHTML = '<div class="dashboard-empty">Bu bölümde gösterilecek içerik bulunmuyor.</div>';
    renderPortalStats();
    return;
  }

  grid.innerHTML = reports.map(report => {
    const type = report.isLibraryItem ? libraryTypeInfo(report.type) : reportType(report);
    const isFavorite = PORTAL_FAVORITES.includes(report.key);

    return `
      <article class="dashboard-card" tabindex="0" role="button" data-key="${escapeHtml(report.key)}">
        <div class="dashboard-card-top">
          <div class="content-icon">${escapeHtml(type.icon)}</div>
          <button class="favorite-btn ${isFavorite ? "active" : ""}" data-favorite="${escapeHtml(report.key)}">★</button>
        </div>
        <div>
          <h4>${escapeHtml(report.title)}</h4>
          <p>${escapeHtml(report.description || "Kurumsal analiz ve karar destek içeriği")}</p>
        </div>
        <div class="dashboard-card-meta">
          <b>${escapeHtml(selectedCompany()?.name || "")}</b>
          <span>${escapeHtml(type.label)}</span>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".dashboard-card").forEach(card => {
    const report = reports.find(item => item.key === card.dataset.key);
    card.onclick = () => openPortalReport(report);
    card.onkeydown = event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPortalReport(report);
      }
    };
  });

  grid.querySelectorAll("[data-favorite]").forEach(button => {
    button.onclick = event => toggleFavorite(button.dataset.favorite, event);
  });

  renderPortalStats();
}

/* Firma yönetimi - kararlı sürümden korundu */
let COMPANY_LOGO_DATA = "";

function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateCompanyLogoPreview(){
  const urlValue = document.getElementById("companyLogo").value.trim();
  const source = COMPANY_LOGO_DATA || urlValue;
  const preview = document.getElementById("companyLogoPreview");

  preview.innerHTML = source
    ? `<img src="${escapeHtml(source)}" alt="Firma logosu">`
    : '<span class="note">Logo önizlemesi</span>';
}

function renderCompanyTable(){
  const body = document.getElementById("companyTable");
  body.innerHTML = "";

  visibleCompanies().forEach(company => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="company-table-name">
          ${company.logo ? `<img class="company-table-logo" src="${escapeHtml(company.logo)}" alt="">` : ""}
          <div><strong>${escapeHtml(company.name)}</strong><br><small>${escapeHtml(company.shortName || "")}</small></div>
        </div>
      </td>
      <td>${(company.reports || []).length}</td>
      <td>
        <button class="action-btn edit">Düzenle</button>
        <button class="action-btn danger delete">Sil</button>
      </td>
    `;

    row.querySelector(".edit").onclick = () => editCompany(company.id);
    row.querySelector(".delete").onclick = () => deleteCompany(company.id);

    body.appendChild(row);
  });
}

function clearCompanyForm(){
  document.getElementById("companyId").value = "";
  document.getElementById("companyName").value = "";
  document.getElementById("companyShortName").value = "";
  document.getElementById("companyColor").value = "#19b77d";
  document.getElementById("companyTaxNo").value = "";
  document.getElementById("companyTaxOffice").value = "";
  document.getElementById("companyPhone").value = "";
  document.getElementById("companyEmail").value = "";
  document.getElementById("companyWebsite").value = "";
  document.getElementById("companyAddress").value = "";
  document.getElementById("companyLogo").value = "";
  document.getElementById("companyLogoFile").value = "";
  COMPANY_LOGO_DATA = "";
  updateCompanyLogoPreview();
  document.getElementById("companyFormTitle").textContent = "Yeni Firma";
}

function editCompany(id){
  if (!can("companies")) return;
  const company = APP_DATA.companies.find(item => item.id === id);
  if (!company) return;

  document.getElementById("companyId").value = company.id;
  document.getElementById("companyName").value = company.name || "";
  document.getElementById("companyShortName").value = company.shortName || "";
  document.getElementById("companyColor").value = company.color || "#19b77d";
  document.getElementById("companyTaxNo").value = company.taxNo || "";
  document.getElementById("companyTaxOffice").value = company.taxOffice || "";
  document.getElementById("companyPhone").value = company.phone || "";
  document.getElementById("companyEmail").value = company.email || "";
  document.getElementById("companyWebsite").value = company.website || "";
  document.getElementById("companyAddress").value = company.address || "";
  document.getElementById("companyLogo").value = company.logo && !String(company.logo).startsWith("data:") ? company.logo : "";
  document.getElementById("companyLogoFile").value = "";
  COMPANY_LOGO_DATA = String(company.logo || "").startsWith("data:") ? company.logo : "";
  updateCompanyLogoPreview();
  document.getElementById("companyFormTitle").textContent = "Firmayı Düzenle";
}

function saveCompany(){
  if (!can("companies")) return alert("Bu işlem için yetkiniz yok.");

  const id = document.getElementById("companyId").value;
  const name = document.getElementById("companyName").value.trim();
  const shortName = document.getElementById("companyShortName").value.trim().toUpperCase();
  const color = document.getElementById("companyColor").value;
  const taxNo = document.getElementById("companyTaxNo").value.trim();
  const taxOffice = document.getElementById("companyTaxOffice").value.trim();
  const phone = document.getElementById("companyPhone").value.trim();
  const email = document.getElementById("companyEmail").value.trim();
  const website = document.getElementById("companyWebsite").value.trim();
  const address = document.getElementById("companyAddress").value.trim();
  const logoUrl = document.getElementById("companyLogo").value.trim();
  const logo = COMPANY_LOGO_DATA || logoUrl;

  if (!name) return alert("Firma adı zorunludur.");

  if (id){
    const company = APP_DATA.companies.find(item => item.id === id);
    company.name = name;
    company.shortName = shortName || name.slice(0, 3).toUpperCase();
    company.color = color;
    company.taxNo = taxNo;
    company.taxOffice = taxOffice;
    company.phone = phone;
    company.email = email;
    company.website = website;
    company.address = address;
    company.logo = logo;
  }else{
    const newId = "c_" + Date.now();

    APP_DATA.companies.push({
      id: newId,
      name,
      shortName: shortName || name.slice(0, 3).toUpperCase(),
      color,
      logo,
      taxNo,
      taxOffice,
      phone,
      email,
      website,
      address,
      active: true,
      reports: []
    });

    APP_DATA.users
      .filter(user => user.role === "system_admin")
      .forEach(user => user.companyIds.push(newId));
  }

  saveData();
  clearCompanyForm();
  renderAllAdmin();
}

function deleteCompany(id){
  if (!can("companies")) return alert("Bu işlem için yetkiniz yok.");

  const company = APP_DATA.companies.find(item => item.id === id);
  if (!company || !confirm(`${company.name} silinsin mi?`)) return;

  APP_DATA.companies = APP_DATA.companies.filter(item => item.id !== id);
  APP_DATA.users.forEach(user => {
    user.companyIds = user.companyIds.filter(companyId => companyId !== id);
  });

  saveData();
  renderAllAdmin();
}

document.getElementById("companyLogo").addEventListener("input", () => {
  if (document.getElementById("companyLogo").value.trim()) {
    COMPANY_LOGO_DATA = "";
    document.getElementById("companyLogoFile").value = "";
  }
  updateCompanyLogoPreview();
});

document.getElementById("companyLogoFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Lütfen bir resim dosyası seçin.");
    event.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Logo dosyası 2 MB'dan küçük olmalıdır.");
    event.target.value = "";
    return;
  }

  try{
    COMPANY_LOGO_DATA = await fileToDataUrl(file);
    document.getElementById("companyLogo").value = "";
    updateCompanyLogoPreview();
  }catch(error){
    console.error(error);
    alert("Logo dosyası okunamadı.");
  }
});
