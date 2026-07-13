function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[character]));
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const user = login(email, password);

  if (!user){
    document.getElementById("loginMessage").textContent = "E-posta veya şifre hatalı.";
    return;
  }

  CURRENT_USER = user;
  document.getElementById("loginMessage").textContent = "";
  showSession();
  renderPortal();
  showScreen("portalScreen");
});

document.getElementById("logoutBtn").onclick = logout;
document.getElementById("passwordBtn").onclick = openPasswordModal;
document.getElementById("closePasswordBtn").onclick = closePasswordModal;
document.getElementById("savePasswordBtn").onclick = changePassword;

document.getElementById("adminBtn").onclick = () => {
  if (CURRENT_USER.role === "viewer") return;
  renderAllAdmin();
  showScreen("adminScreen");
};

document.getElementById("portalReturnBtn").onclick = () => {
  renderPortal();
  showScreen("portalScreen");
};

document.querySelectorAll(".nav-btn[data-page]").forEach(button => {
  button.onclick = () => {
    if (button.classList.contains("permission-hidden")) return;
    showAdminPage(button.dataset.page);
  };
});

document.getElementById("newCompanyBtn").onclick = clearCompanyForm;
document.getElementById("clearCompanyBtn").onclick = clearCompanyForm;
document.getElementById("saveCompanyBtn").onclick = saveCompany;

document.getElementById("newUserBtn").onclick = clearUserForm;
document.getElementById("clearUserBtn").onclick = clearUserForm;
document.getElementById("saveUserBtn").onclick = saveUser;
document.getElementById("userRole").onchange = updateRoleHelp;

document.getElementById("newReportBtn").onclick = clearReportForm;
document.getElementById("clearReportBtn").onclick = clearReportForm;
document.getElementById("saveReportBtn").onclick = saveReport;

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(APP_DATA, null, 2)], {type:"application/json"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "adg-insight-yedek.json";
  link.click();
  URL.revokeObjectURL(link.href);
};

document.getElementById("importBtn").onclick = async () => {
  const file = document.getElementById("importFile").files[0];
  if (!file) return alert("Bir yedek dosyası seçin.");

  try{
    const data = JSON.parse(await file.text());
    if (!data.users || !data.companies || !data.roles) throw new Error("Geçersiz veri");
    APP_DATA = data;
    saveData();
    renderAllAdmin();
    alert("Yedek yüklendi.");
  }catch(error){
    alert("Geçersiz yedek dosyası.");
  }
};

clearCompanyForm();
renderRoleOptions();
clearUserForm();
clearReportForm();
