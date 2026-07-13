function login(email, password){
  return APP_DATA.users.find(user =>
    user.email.toLowerCase() === email.toLowerCase() &&
    user.password === password
  );
}

function showSession(){
  const sessionUser = document.getElementById("sessionUser");
  sessionUser.textContent = `${CURRENT_USER.name} · ${roleInfo(CURRENT_USER.role).label}`;
  sessionUser.classList.remove("hidden");

  document.getElementById("passwordBtn").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
  document.getElementById("adminBtn").classList.toggle("hidden", CURRENT_USER.role === "viewer");
}

function logout(){
  location.reload();
}

function openPasswordModal(){
  document.getElementById("passwordModal").classList.add("active");
}

function closePasswordModal(){
  document.getElementById("passwordModal").classList.remove("active");
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("passwordMessage").textContent = "";
}

function changePassword(){
  const current = document.getElementById("currentPassword").value;
  const next = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  const message = document.getElementById("passwordMessage");

  if (current !== CURRENT_USER.password){
    message.textContent = "Mevcut şifre hatalı.";
    return;
  }

  if (next.length < 6){
    message.textContent = "Yeni şifre en az 6 karakter olmalıdır.";
    return;
  }

  if (next !== confirm){
    message.textContent = "Yeni şifreler aynı değil.";
    return;
  }

  CURRENT_USER.password = next;
  saveData();
  message.textContent = "Şifre değiştirildi.";
  setTimeout(closePasswordModal, 700);
}
