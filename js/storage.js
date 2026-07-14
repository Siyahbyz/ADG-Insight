const KEY="adgInsightV11A";
const ROLES={
  system_admin:{label:"Sistem Yöneticisi",permissions:["companies","users","roles"],description:"Tüm firmaları ve kullanıcıları yönetir."},
  company_admin:{label:"Firma Yöneticisi",permissions:["users"],description:"Yetkili olduğu firmaların kullanıcılarını yönetir."},
  analyst:{label:"Analist",permissions:[],description:"Rapor ve analiz süreçlerinde çalışır."},
  viewer:{label:"Görüntüleyici",permissions:[],description:"Kendisine tanımlı içerikleri görüntüler."}
};
const DEFAULT_DATA={
  companies:[{id:"adg",name:"Anka Danışma Grubu",shortName:"ADG",color:"#19b77d",phone:"",email:"",website:"",address:"",logo:"",reports:[],library:[]}],
  users:[{name:"Yönetici",email:"demo@adg.com",password:"ADG2026",role:"system_admin",companyIds:["adg"]}]
};
function clone(v){return JSON.parse(JSON.stringify(v))}
function loadData(){try{return JSON.parse(localStorage.getItem(KEY))||clone(DEFAULT_DATA)}catch{return clone(DEFAULT_DATA)}}
let DATA=loadData(),CURRENT_USER=null,SELECTED_COMPANY=null;
function saveData(){localStorage.setItem(KEY,JSON.stringify(DATA))}
