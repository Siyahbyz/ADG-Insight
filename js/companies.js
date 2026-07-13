function renderPortal(){
  const grid = document.getElementById("companyGrid");
  grid.innerHTML = "";

  const companies = visibleCompanies().filter(company => company.active !== false);

  if (!companies.length){
    grid.innerHTML = '<div class="panel">Bu kullanıcı için tanımlı firma bulunmuyor.</div>';
    return;
  }

  companies.forEach(company => {
    const card = document.createElement("div");
    card.className = "company-card";
    card.innerHTML = `
      <div class="company-title">${escapeHtml(company.name)}</div>
      <div class="company-meta">${publishedReports(company).length} yayınlanmış rapor</div>
    `;
    card.onclick = () => renderCompanyReports(company);
    grid.appendChild(card);
  });
}

function renderCompanyReports(company){
  const wrap = document.querySelector("#portalScreen .portal-wrap");
  wrap.innerHTML = `
    <div class="page-head">
      <div>
        <div class="kicker">${escapeHtml(company.shortName || "Firma")}</div>
        <h2>${escapeHtml(company.name)}</h2>
      </div>
      <button id="backToCompanies" class="btn">Firmalara Dön</button>
    </div>
    <div id="reportCards" class="card-grid"></div>
  `;

  document.getElementById("backToCompanies").onclick = () => {
    wrap.innerHTML = `
      <div class="page-head">
        <div>
          <div class="kicker">Müşteri Portalı</div>
          <h2>Firma seçiniz</h2>
          <p>Yalnızca hesabınıza tanımlanan firmalar gösterilir.</p>
        </div>
      </div>
      <div id="companyGrid" class="card-grid"></div>
    `;
    renderPortal();
  };

  const cards = document.getElementById("reportCards");
  const reports = publishedReports(company);

  if (!reports.length){
    cards.innerHTML = '<div class="panel">Bu firma için yayınlanmış rapor bulunmuyor.</div>';
    return;
  }

  reports.forEach(report => {
    const card = document.createElement("div");
    card.className = "report-card";
    card.innerHTML = `
      <div class="report-title">${escapeHtml(report.title)}</div>
      <div class="report-meta">${escapeHtml(report.description || "")}</div>
    `;
    card.onclick = () => window.open(report.url, "_blank", "noopener");
    cards.appendChild(card);
  });
}

function renderCompanyTable(){
  const body = document.getElementById("companyTable");
  body.innerHTML = "";

  visibleCompanies().forEach(company => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${escapeHtml(company.name)}</strong><br><small>${escapeHtml(company.shortName || "")}</small></td>
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
  document.getElementById("companyLogo").value = "";
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
  document.getElementById("companyLogo").value = company.logo || "";
  document.getElementById("companyFormTitle").textContent = "Firmayı Düzenle";
}

function saveCompany(){
  if (!can("companies")) return alert("Bu işlem için yetkiniz yok.");

  const id = document.getElementById("companyId").value;
  const name = document.getElementById("companyName").value.trim();
  const shortName = document.getElementById("companyShortName").value.trim().toUpperCase();
  const color = document.getElementById("companyColor").value;
  const logo = document.getElementById("companyLogo").value.trim();

  if (!name) return alert("Firma adı zorunludur.");

  if (id){
    const company = APP_DATA.companies.find(item => item.id === id);
    company.name = name;
    company.shortName = shortName || name.slice(0, 3).toUpperCase();
    company.color = color;
    company.logo = logo;
  }else{
    const newId = "c_" + Date.now();

    APP_DATA.companies.push({
      id: newId,
      name,
      shortName: shortName || name.slice(0, 3).toUpperCase(),
      color,
      logo,
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
