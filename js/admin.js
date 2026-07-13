function showAdminPage(page){
  document.querySelectorAll(".admin-page").forEach(section => section.classList.remove("active"));
  document.querySelectorAll(".nav-btn[data-page]").forEach(button => button.classList.remove("active"));

  document.getElementById(`page-${page}`).classList.add("active");
  document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add("active");
}

function renderDashboard(){
  const companies = visibleCompanies();
  const reports = companies.reduce((sum, company) => sum + (company.reports || []).length, 0);
  const published = companies.reduce((sum, company) => sum + publishedReports(company).length, 0);

  document.getElementById("statCompanies").textContent = companies.length;
  document.getElementById("statUsers").textContent = APP_DATA.users.length;
  document.getElementById("statReports").textContent = reports;
  document.getElementById("statPublished").textContent = published;
}

function renderAllAdmin(){
  renderDashboard();
  renderCompanyTable();
  renderRoleOptions();
  renderUserCompanyChecks();
  renderUserTable();
  renderReportCompanyOptions();
  renderReportTable();
  renderRoleCards();
  applyPermissions();
}
