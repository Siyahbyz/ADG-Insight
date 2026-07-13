function publishedReports(company){
  return (company.reports || []).filter(report => String(report.url || "").trim());
}

function renderReportCompanyOptions(){
  const select = document.getElementById("reportCompany");
  select.innerHTML = "";

  visibleCompanies().forEach(company => {
    const option = document.createElement("option");
    option.value = company.id;
    option.textContent = company.name;
    select.appendChild(option);
  });
}

function renderReportTable(){
  const body = document.getElementById("reportTable");
  body.innerHTML = "";

  visibleCompanies().forEach(company => {
    (company.reports || []).forEach((report, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${escapeHtml(report.title)}</strong><br><small>${escapeHtml(report.description || "")}</small></td>
        <td>${escapeHtml(company.name)}</td>
        <td>${report.url ? "Yayında" : "Taslak"}</td>
        <td>
          <button class="action-btn edit">Düzenle</button>
          <button class="action-btn danger delete">Sil</button>
        </td>
      `;

      row.querySelector(".edit").onclick = () => editReport(company.id, index);
      row.querySelector(".delete").onclick = () => deleteReport(company.id, index);

      body.appendChild(row);
    });
  });
}

function clearReportForm(){
  document.getElementById("reportIndex").value = "";
  document.getElementById("reportTitle").value = "";
  document.getElementById("reportUrl").value = "";
  document.getElementById("reportDescription").value = "";
  document.getElementById("reportFormTitle").textContent = "Yeni Rapor";
}

function editReport(companyId, index){
  if (!can("reports")) return;

  const company = APP_DATA.companies.find(item => item.id === companyId);
  const report = company?.reports?.[index];
  if (!report) return;

  document.getElementById("reportCompany").value = companyId;
  document.getElementById("reportIndex").value = `${companyId}:${index}`;
  document.getElementById("reportTitle").value = report.title || "";
  document.getElementById("reportUrl").value = report.url || "";
  document.getElementById("reportDescription").value = report.description || "";
  document.getElementById("reportFormTitle").textContent = "Raporu Düzenle";
}

function saveReport(){
  if (!can("reports")) return alert("Bu işlem için yetkiniz yok.");

  const companyId = document.getElementById("reportCompany").value;
  const marker = document.getElementById("reportIndex").value;
  const title = document.getElementById("reportTitle").value.trim();
  const url = document.getElementById("reportUrl").value.trim();
  const description = document.getElementById("reportDescription").value.trim();

  if (!companyId || !title) return alert("Firma ve başlık zorunludur.");

  const targetCompany = APP_DATA.companies.find(company => company.id === companyId);
  const reportData = {title, url, description};

  if (marker){
    const [oldCompanyId, oldIndex] = marker.split(":");
    const oldCompany = APP_DATA.companies.find(company => company.id === oldCompanyId);
    oldCompany.reports.splice(Number(oldIndex), 1);
  }

  targetCompany.reports.push(reportData);

  saveData();
  clearReportForm();
  renderAllAdmin();
}

function deleteReport(companyId, index){
  if (!can("reports")) return alert("Bu işlem için yetkiniz yok.");

  const company = APP_DATA.companies.find(item => item.id === companyId);
  const report = company?.reports?.[index];
  if (!report || !confirm(`${report.title} silinsin mi?`)) return;

  company.reports.splice(index, 1);
  saveData();
  renderAllAdmin();
}
