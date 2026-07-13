function roleInfo(role){
  return APP_DATA.roles[role] || APP_DATA.roles.viewer;
}

function isSystemAdmin(){
  return CURRENT_USER?.role === "system_admin";
}

function can(permission){
  return roleInfo(CURRENT_USER?.role).permissions.includes(permission);
}

function allowedCompanyIds(){
  return isSystemAdmin()
    ? APP_DATA.companies.map(company => company.id)
    : (CURRENT_USER?.companyIds || []);
}

function visibleCompanies(){
  const ids = allowedCompanyIds();
  return APP_DATA.companies.filter(company => ids.includes(company.id));
}

function applyPermissions(){
  document.querySelectorAll(".nav-btn[data-page]").forEach(button => {
    const page = button.dataset.page;
    button.classList.toggle("permission-hidden", !can(page));
  });

  document.getElementById("newCompanyBtn").classList.toggle("hidden", !can("companies"));
  document.getElementById("newUserBtn").classList.toggle("hidden", !can("users"));
  document.getElementById("newReportBtn").classList.toggle("hidden", !can("reports"));
}

function renderRoleOptions(){
  const select = document.getElementById("userRole");
  select.innerHTML = "";

  Object.entries(APP_DATA.roles).forEach(([key, value]) => {
    if (!isSystemAdmin() && key === "system_admin") return;

    const option = document.createElement("option");
    option.value = key;
    option.textContent = value.label;
    select.appendChild(option);
  });

  updateRoleHelp();
}

function updateRoleHelp(){
  const role = document.getElementById("userRole").value || "viewer";
  document.getElementById("roleHelp").textContent = roleInfo(role).description;
}

function renderRoleCards(){
  const container = document.getElementById("roleCards");
  container.innerHTML = "";

  Object.values(APP_DATA.roles).forEach(role => {
    const card = document.createElement("div");
    card.className = "role-card";
    card.innerHTML = `
      <h3>${escapeHtml(role.label)}</h3>
      <p class="note">${escapeHtml(role.description)}</p>
      <ul>${role.permissions.map(item => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Sadece görüntüleme</li>"}</ul>
    `;
    container.appendChild(card);
  });
}
