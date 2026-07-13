function renderUserCompanyChecks(selectedIds = []){
  const container = document.getElementById("userCompanies");
  container.innerHTML = "";

  visibleCompanies().forEach(company => {
    const label = document.createElement("label");
    label.className = "check-item";
    label.innerHTML = `
      <input type="checkbox" value="${escapeHtml(company.id)}" ${selectedIds.includes(company.id) ? "checked" : ""}>
      ${escapeHtml(company.name)}
    `;
    container.appendChild(label);
  });
}

function selectedUserCompanyIds(){
  return [...document.querySelectorAll("#userCompanies input:checked")]
    .map(input => input.value);
}

function renderUserTable(){
  const body = document.getElementById("userTable");
  body.innerHTML = "";

  const users = isSystemAdmin()
    ? APP_DATA.users
    : APP_DATA.users.filter(user =>
        user.role !== "system_admin" &&
        (user.companyIds || []).some(id => allowedCompanyIds().includes(id))
      );

  users.forEach(user => {
    const companyNames = (user.companyIds || [])
      .map(id => APP_DATA.companies.find(company => company.id === id)?.shortName)
      .filter(Boolean)
      .join(", ");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${escapeHtml(user.name)}</strong><br><small>${escapeHtml(user.email)}</small></td>
      <td><span class="role-chip">${escapeHtml(roleInfo(user.role).label)}</span></td>
      <td>${escapeHtml(companyNames || "-")}</td>
      <td>
        <button class="action-btn edit">Düzenle</button>
        ${user.role !== "system_admin" ? '<button class="action-btn danger delete">Sil</button>' : ""}
      </td>
    `;

    row.querySelector(".edit").onclick = () => editUser(user.email);
    const deleteButton = row.querySelector(".delete");
    if (deleteButton) deleteButton.onclick = () => deleteUser(user.email);

    body.appendChild(row);
  });
}

function clearUserForm(){
  document.getElementById("editingUserEmail").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userEmail").disabled = false;
  document.getElementById("userPassword").value = "";
  document.getElementById("userRole").value = "viewer";
  document.getElementById("userFormTitle").textContent = "Yeni Kullanıcı";

  renderUserCompanyChecks([]);
  updateRoleHelp();
}

function editUser(email){
  if (!can("users")) return;

  const user = APP_DATA.users.find(item => item.email === email);
  if (!user) return;

  document.getElementById("editingUserEmail").value = user.email;
  document.getElementById("userName").value = user.name || "";
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userEmail").disabled = true;
  document.getElementById("userPassword").value = "";
  document.getElementById("userRole").value = user.role;
  document.getElementById("userFormTitle").textContent = "Kullanıcıyı Düzenle";

  renderUserCompanyChecks(user.companyIds || []);
  updateRoleHelp();
}

function saveUser(){
  if (!can("users")) return alert("Bu işlem için yetkiniz yok.");

  const editingEmail = document.getElementById("editingUserEmail").value;
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  const password = document.getElementById("userPassword").value;
  const role = document.getElementById("userRole").value;
  const companyIds = selectedUserCompanyIds();

  if (!name || !email) return alert("Ad soyad ve e-posta zorunludur.");
  if (!isSystemAdmin() && role === "system_admin") return alert("Bu rolü atama yetkiniz yok.");

  if (editingEmail){
    const user = APP_DATA.users.find(item => item.email === editingEmail);
    if (!user) return;

    user.name = name;
    user.role = role;
    user.companyIds = companyIds;

    if (password){
      if (password.length < 6) return alert("Şifre en az 6 karakter olmalıdır.");
      user.password = password;
    }
  }else{
    if (password.length < 6) return alert("Geçici şifre en az 6 karakter olmalıdır.");
    if (APP_DATA.users.some(user => user.email === email)) return alert("Bu e-posta zaten kayıtlı.");

    APP_DATA.users.push({name, email, password, role, companyIds});
  }

  saveData();
  clearUserForm();
  renderAllAdmin();
}

function deleteUser(email){
  if (!can("users")) return alert("Bu işlem için yetkiniz yok.");

  const user = APP_DATA.users.find(item => item.email === email);
  if (!user || user.role === "system_admin") return;
  if (!confirm(`${user.name} silinsin mi?`)) return;

  APP_DATA.users = APP_DATA.users.filter(item => item.email !== email);
  saveData();
  renderAllAdmin();
}
