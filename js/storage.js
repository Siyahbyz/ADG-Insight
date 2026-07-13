const STORAGE_KEY = "adgInsightV9";

const DEFAULT_DATA = {
  roles: {
    system_admin: {
      label: "Sistem Yöneticisi",
      description: "Tüm firmaları, kullanıcıları ve raporları yönetebilir.",
      permissions: ["dashboard","companies","users","reports","library","roles","backup"]
    },
    company_admin: {
      label: "Firma Yöneticisi",
      description: "Yetkili olduğu firmaların kullanıcılarını ve raporlarını yönetebilir.",
      permissions: ["dashboard","users","reports","library"]
    },
    analyst: {
      label: "Analist",
      description: "Yetkili olduğu firmaların raporlarını yönetebilir.",
      permissions: ["dashboard","reports","library"]
    },
    viewer: {
      label: "Görüntüleyici",
      description: "Yalnızca raporları görüntüleyebilir.",
      permissions: []
    }
  },
  users: [
    {
      name: "Yönetici",
      email: "demo@adg.com",
      password: "ADG2026",
      role: "system_admin",
      companyIds: ["adg"]
    }
  ],
  companies: [
    {
      id: "adg",
      name: "Anka Danışma Grubu",
      shortName: "ADG",
      color: "#19b77d",
      logo: "",
      taxNo: "",
      taxOffice: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      active: true,
      reports: [],
      library: []
    }
  ]
};

let APP_DATA = loadData();
let CURRENT_USER = null;

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : clone(DEFAULT_DATA);
  }catch(error){
    console.error(error);
    return clone(DEFAULT_DATA);
  }
}

function saveData(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_DATA));
    return true;
  }catch(error){
    alert("Veriler kaydedilemedi. Tarayıcı depolama alanı kapalı veya dolu olabilir.");
    console.error(error);
    return false;
  }
}
