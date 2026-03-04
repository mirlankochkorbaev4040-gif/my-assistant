/* eslint-disable */
import { useState, useRef, useEffect } from "react";

// ── LOCALSTORAGE: данные сохраняются после перезагрузки ───────────────────────
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : (typeof init === "function" ? init() : init);
    } catch { return typeof init === "function" ? init() : init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ── ДАННЫЕ ────────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0,10);
const past   = d => { const x=new Date(); x.setDate(x.getDate()-d); return x.toISOString().slice(0,10); };
const future = d => { const x=new Date(); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };

const mkInitials = name => name.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");
const COLORS = ["#007AFF","#34C759","#FF9500","#AF52DE","#FF2D55","#5AC8FA","#FF6B00","#30B0C7"];

const INIT_USERS = [
  { id:"admin1", role:"admin",     name:"Администратор", initials:"AD", color:"#FF3B30", login:"admin",     password:"admin123" },
  { id:"ast1",   role:"assistant", name:"Мария Кузнецова", initials:"МК", color:"#007AFF", login:"maria",     password:"maria123", assignedClients:["mgr1","mgr2","mgr3"] },
  { id:"ast2",   role:"assistant", name:"Иван Смирнов",    initials:"ИС", color:"#AF52DE", login:"ivan",      password:"ivan123",  assignedClients:[] },
  { id:"mgr1",   role:"manager",   name:"Алексей Морозов",  initials:"АМ", color:"#007AFF", login:"alex",      password:"alex123",  assistantId:"ast1" },
  { id:"mgr2",   role:"manager",   name:"Светлана Петрова", initials:"СП", color:"#34C759", login:"svetlana",  password:"svet123",  assistantId:"ast1" },
  { id:"mgr3",   role:"manager",   name:"Дмитрий Волков",   initials:"ДВ", color:"#FF9500", login:"dmitry",    password:"dima123",  assistantId:"ast1" },
];

const INIT_TASKS = [
  { id:1, managerId:"mgr1", title:"Найти поставщика упаковки",    desc:"Минимум 3 предложения с ценами",    deadline:past(5),   priority:"high",   expectedResult:"Таблица сравнения",    status:"done",        doneText:"Собрал 5 поставщиков", doneResult:"docs.google.com/compare", doneMinutes:90,  managerMinutes:180, rating:5, ratingComment:"Отлично!",      createdAt:past(7), files:[] },
  { id:2, managerId:"mgr1", title:"Подготовить КП для Горизонт",  desc:"КП для клиента ООО Горизонт",       deadline:past(2),   priority:"high",   expectedResult:"Готовый PDF",          status:"in_progress", doneText:null, doneResult:null, doneMinutes:null, managerMinutes:null, rating:null, ratingComment:null, createdAt:past(4), files:[] },
  { id:3, managerId:"mgr1", title:"Записать машину на техосмотр",  desc:"Audi A6, гос. номер А123ВС",        deadline:future(5), priority:"low",    expectedResult:"Подтверждение записи", status:"new",         doneText:null, doneResult:null, doneMinutes:null, managerMinutes:null, rating:null, ratingComment:null, createdAt:past(1), files:[] },
  { id:4, managerId:"mgr2", title:"Исследовать конкурентов",       desc:"Анализ 5 конкурентов по ценам",     deadline:past(1),   priority:"medium", expectedResult:"Отчёт в Google Docs",  status:"problem",     doneText:null, doneResult:null, doneMinutes:null, managerMinutes:null, rating:null, ratingComment:null, createdAt:past(3), files:[] },
  { id:5, managerId:"mgr2", title:"Забронировать отель в Москве",  desc:"5–7 апреля, центр, до 8 000₽/ночь",deadline:future(10),priority:"medium", expectedResult:"Подтверждение брони",  status:"done",        doneText:"Marriott Tverskaya", doneResult:"booking.com/confirm/12345", doneMinutes:25, managerMinutes:60, rating:4, ratingComment:"Хорошо!", createdAt:past(6), files:[] },
  { id:6, managerId:"mgr3", title:"Подготовить презентацию",       desc:"Для встречи с инвесторами",         deadline:future(3), priority:"high",   expectedResult:"15 слайдов",           status:"in_progress", doneText:null, doneResult:null, doneMinutes:null, managerMinutes:null, rating:null, ratingComment:null, createdAt:past(2), files:[] },
];

const INIT_MSGS    = { mgr1:[{id:1,from:"manager",text:"Когда будет готово КП?",time:"09:15",files:[]},{id:2,from:"assistant",text:"Сегодня к 17:00.",time:"09:18",files:[]}], mgr2:[{id:1,from:"manager",text:"Что с анализом конкурентов?",time:"10:00",files:[]},{id:2,from:"assistant",text:"Работаю над этим.",time:"10:05",files:[]}], mgr3:[] };
const INIT_EVENTS  = { mgr1:[{id:1,title:"Встреча с ООО Горизонт",date:future(2),time:"10:00",type:"meeting",addedBy:"assistant"}], mgr2:[{id:1,title:"Звонок с поставщиком",date:future(3),time:"14:00",type:"meeting",addedBy:"assistant"}], mgr3:[] };

// ── ДИЗАЙН СИСТЕМА Apple iOS ──────────────────────────────────────────────────
const C = { blue:"#007AFF", green:"#34C759", red:"#FF3B30", orange:"#FF9500", purple:"#AF52DE", gray1:"#F2F2F7", gray2:"#E5E5EA", gray3:"#C7C7CC", gray4:"#8E8E93", label:"#000", label2:"#3C3C43", label3:"#8E8E93", bg:"#F2F2F7", card:"#FFFFFF", sep:"rgba(60,60,67,0.12)" };
const sf  = { fontFamily:"-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,sans-serif" };
const nowTime  = () => new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
const fmtH     = m => m>=60?`${Math.floor(m/60)} ч ${m%60>0?m%60+" мин":""}`:` ${m} мин`;
const isOverdue= t => t.deadline<TODAY && t.status!=="done";
const effSt    = t => isOverdue(t)?"overdue":t.status;
const daysLeft = dl=>{ const d=Math.ceil((new Date(dl)-new Date(TODAY))/86400000); return d<0?`просрочено ${Math.abs(d)} дн.`:d===0?"сегодня!":` ${d} дн.`; };

const STATUS   = { new:{label:"Новая",icon:"🕐",color:"#FF9500",bg:"rgba(255,149,0,0.08)",border:"rgba(255,149,0,0.2)"}, in_progress:{label:"В работе",icon:"⚙️",color:"#007AFF",bg:"rgba(0,122,255,0.08)",border:"rgba(0,122,255,0.2)"}, done:{label:"Готово",icon:"✅",color:"#34C759",bg:"rgba(52,199,89,0.08)",border:"rgba(52,199,89,0.2)"}, problem:{label:"Нужна помощь",icon:"❗",color:"#FF3B30",bg:"rgba(255,59,48,0.08)",border:"rgba(255,59,48,0.2)"}, overdue:{label:"Просрочено",icon:"⚠️",color:"#FF3B30",bg:"rgba(255,59,48,0.08)",border:"rgba(255,59,48,0.2)"} };
const PRIORITY = { high:{label:"Высокий",color:"#FF3B30"}, medium:{label:"Средний",color:"#FF9500"}, low:{label:"Низкий",color:"#34C759"} };
const EVT_TYPES= { meeting:{label:"Встреча",icon:"🤝",color:"#007AFF"}, deadline:{label:"Дедлайн",icon:"⏰",color:"#FF3B30"}, personal:{label:"Личное",icon:"👤",color:"#34C759"}, reminder:{label:"Напомин.",icon:"🔔",color:"#FF9500"} };
const MONTHS   = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// ── UI КОМПОНЕНТЫ ─────────────────────────────────────────────────────────────
const Btn = ({ label, color=C.blue, onTap, ghost, full, disabled, small, danger }) => (
  <button onClick={onTap} disabled={disabled} style={{ ...sf, background:ghost?"transparent":disabled?C.gray2:danger?C.red:color, color:ghost?(danger?C.red:color):disabled?C.gray3:"#fff", border:ghost?`1.5px solid ${danger?C.red:color}`:"none", borderRadius:14, padding:small?"8px 14px":"14px 20px", fontSize:small?14:17, fontWeight:600, cursor:disabled?"default":"pointer", width:full?"100%":"auto", letterSpacing:-0.3, opacity:disabled?0.5:1 }}>{label}</button>
);

const Field = ({ placeholder, value, onChange, type="text", multi, rows=3 }) => {
  const s = { ...sf, width:"100%", background:C.gray1, border:"none", borderRadius:12, padding:"13px 16px", fontSize:17, color:C.label, outline:"none", boxSizing:"border-box", resize:multi?"none":undefined, fontFamily:sf.fontFamily };
  return multi ? <textarea {...{placeholder,value,onChange,rows,style:s}}/> : <input {...{placeholder,value,onChange,type,style:s}}/>;
};
const Lbl = ({text}) => <div style={{...sf,fontSize:13,fontWeight:600,color:C.gray4,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6,paddingLeft:2}}>{text}</div>;
const Avatar = ({u,size=40}) => <div style={{width:size,height:size,borderRadius:"50%",background:`${u.color}20`,color:u.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:800,...sf,flexShrink:0}}>{u.initials}</div>;

// ── ЭКРАН ВХОДА ───────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [login,setLogin]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit = () => {
    if(!login||!pw){setErr("Введите логин и пароль");return;}
    setLoading(true); setErr("");
    setTimeout(()=>{
      const u=users.find(u=>u.login===login.trim().toLowerCase()&&u.password===pw);
      if(u) onLogin(u); else{setErr("Неверный логин или пароль");setLoading(false);}
    },500);
  };
  return (
    <div style={{...sf,background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
      <div style={{marginBottom:48,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:22,background:"linear-gradient(145deg,#007AFF,#0051D5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(0,122,255,0.35)"}}>
          <span style={{fontSize:36,color:"#fff"}}>✦</span>
        </div>
        <div style={{fontSize:28,fontWeight:700,color:C.label,letterSpacing:-0.8}}>Мой Ассистент</div>
        <div style={{fontSize:15,color:C.gray4,marginTop:4}}>Войдите в свой аккаунт</div>
      </div>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{background:C.card,borderRadius:20,overflow:"hidden",boxShadow:"0 2px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
          <div style={{padding:"16px 20px",borderBottom:`0.5px solid ${C.sep}`}}>
            <div style={{...sf,fontSize:12,color:C.gray4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Логин</div>
            <input placeholder="Введите логин" value={login} onChange={e=>setLogin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoCapitalize="none" style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:17,color:C.label,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{padding:"16px 20px"}}>
            <div style={{...sf,fontSize:12,color:C.gray4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Пароль</div>
            <input placeholder="Введите пароль" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} type="password" style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:17,color:C.label,outline:"none",boxSizing:"border-box"}}/>
          </div>
        </div>
        {err&&<div style={{...sf,background:"rgba(255,59,48,0.08)",border:"1.5px solid rgba(255,59,48,0.2)",borderRadius:12,padding:"11px 16px",marginBottom:12,fontSize:15,color:C.red,textAlign:"center"}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{...sf,background:C.blue,color:"#fff",border:"none",borderRadius:16,padding:16,fontSize:17,fontWeight:600,cursor:"pointer",width:"100%",letterSpacing:-0.3,boxShadow:"0 4px 20px rgba(0,122,255,0.3)",opacity:loading?0.7:1}}>{loading?"Вход...":"Войти"}</button>

        {/* Демо-подсказки */}
        <div style={{marginTop:28,background:C.card,borderRadius:16,padding:"14px 18px",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
          <div style={{...sf,fontSize:12,color:C.gray4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Демо — попробуйте</div>
          {[
            {label:"👑 Администратор", login:"admin",    pw:"admin123", color:C.red},
            {label:"🧠 Ассистент Мария",login:"maria",   pw:"maria123", color:C.blue},
            {label:"👤 Клиент Алексей", login:"alex",    pw:"alex123",  color:C.blue},
            {label:"👤 Клиент Светлана",login:"svetlana",pw:"svet123",  color:C.green},
            {label:"👤 Клиент Дмитрий", login:"dmitry",  pw:"dima123",  color:C.orange},
          ].map(u=>(
            <button key={u.login} onClick={()=>{setLogin(u.login);setPw(u.pw);setErr("");}} style={{...sf,display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:"8px 0",borderBottom:`0.5px solid ${C.sep}`}}>
              <span style={{fontSize:14,color:C.label}}>{u.label}</span>
              <span style={{fontSize:13,color:u.color,fontWeight:600}}>{u.login} / {u.pw}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ПАНЕЛЬ АДМИНИСТРАТОРА ─────────────────────────────────────────────────────
function AdminPanel({ users, setUsers, onLogout }) {
  const [tab,       setTab]       = useState("clients"); // clients | assistants
  const [showForm,  setShowForm]  = useState(false);
  const [formType,  setFormType]  = useState("manager"); // manager | assistant
  const [editUser,  setEditUser]  = useState(null);
  const [form,      setForm]      = useState({name:"",login:"",password:"",color:COLORS[0],assistantId:""});
  const [copied,    setCopied]    = useState(null);

  const assistants = users.filter(u=>u.role==="assistant");
  const managers   = users.filter(u=>u.role==="manager");

  const openCreate = (type) => {
    setFormType(type); setEditUser(null);
    setForm({name:"",login:"",password:"",color:COLORS[Math.floor(Math.random()*COLORS.length)],assistantId:assistants[0]?.id||""});
    setShowForm(true);
  };
  const openEdit = (u) => {
    setFormType(u.role); setEditUser(u);
    setForm({name:u.name,login:u.login,password:u.password,color:u.color,assistantId:u.assistantId||""});
    setShowForm(true);
  };
  const save = () => {
    if(!form.name||!form.login||!form.password)return;
    const initials = mkInitials(form.name);
    if(editUser){
      setUsers(p=>p.map(u=>u.id===editUser.id?{...u,...form,initials}:u));
    } else {
      const id = `${formType==="manager"?"mgr":"ast"}${Date.now()}`;
      const newUser = {id,role:formType,initials,login:form.login,password:form.password,name:form.name,color:form.color,...(formType==="manager"?{assistantId:form.assistantId}:{assignedClients:[]})};
      setUsers(p=>[...p,newUser]);
      // Обновляем assignedClients у ассистента
      if(formType==="manager"&&form.assistantId){
        setUsers(p=>p.map(u=>u.id===form.assistantId?{...u,assignedClients:[...(u.assignedClients||[]),id]}:u));
      }
    }
    setShowForm(false);
  };
  const deleteUser = (id) => setUsers(p=>p.filter(u=>u.id!==id));
  const copyToClipboard = (text, id) => { navigator.clipboard?.writeText(text); setCopied(id); setTimeout(()=>setCopied(null),2000); };

  return (
    <div style={{...sf,background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"rgba(255,255,255,0.9)",backdropFilter:"blur(20px)",borderBottom:`0.5px solid ${C.sep}`,padding:"0 16px",display:"flex",alignItems:"center",height:56,position:"sticky",top:0,zIndex:100}}>
        <div style={{flex:1}}>
          <div style={{...sf,fontSize:17,fontWeight:700,color:C.label}}>Управление</div>
          <div style={{...sf,fontSize:12,color:C.red}}>👑 Администратор</div>
        </div>
        <button onClick={()=>{if(window.confirm("Сбросить все данные к начальным?")){ const keys=["ba_users","ba_tasks","ba_messages","ba_events","ba_notes"]; keys.forEach(k=>localStorage.removeItem(k)); window.location.reload(); }}} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.red,marginRight:8}}>Сброс</button>
        <button onClick={onLogout} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.gray4}}>Выйти</button>
      </div>

      {/* Tabs */}
      <div style={{background:C.card,borderBottom:`0.5px solid ${C.sep}`,display:"flex"}}>
        {[["clients","👤 Клиенты"],["assistants","🧠 Ассистенты"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,...sf,background:"transparent",border:"none",borderBottom:tab===k?`2px solid ${C.blue}`:"2px solid transparent",padding:"13px 8px",cursor:"pointer",color:tab===k?C.blue:C.gray4,fontWeight:tab===k?700:500,fontSize:15}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{padding:"16px"}}>
        {/* Кнопка создать */}
        <button onClick={()=>openCreate(tab==="clients"?"manager":"assistant")} style={{...sf,background:C.blue,color:"#fff",border:"none",borderRadius:16,padding:"14px 20px",fontSize:16,fontWeight:600,cursor:"pointer",width:"100%",marginBottom:16,boxShadow:"0 4px 16px rgba(0,122,255,0.25)"}}>
          + {tab==="clients"?"Добавить клиента":"Добавить ассистента"}
        </button>

        {/* СПИСОК КЛИЕНТОВ */}
        {tab==="clients" && managers.map(mgr=>{
          const ast = assistants.find(a=>a.id===mgr.assistantId);
          return (
            <div key={mgr.id} style={{background:C.card,borderRadius:18,marginBottom:10,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{height:3,background:mgr.color}}/>
              <div style={{padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <Avatar u={mgr} size={44}/>
                  <div style={{flex:1}}>
                    <div style={{...sf,fontSize:17,fontWeight:700,color:C.label}}>{mgr.name}</div>
                    {ast&&<div style={{...sf,fontSize:13,color:C.gray4}}>Ассистент: {ast.name}</div>}
                  </div>
                  <button onClick={()=>openEdit(mgr)} style={{background:C.gray1,border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",...sf,fontSize:13,color:C.blue,fontWeight:600}}>Изменить</button>
                </div>
                {/* Данные для входа */}
                <div style={{background:C.gray1,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{...sf,fontSize:12,color:C.gray4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Данные для входа</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div><span style={{...sf,fontSize:13,color:C.gray4}}>Логин: </span><span style={{...sf,fontSize:14,fontWeight:700,color:C.label}}>{mgr.login}</span></div>
                    <div><span style={{...sf,fontSize:13,color:C.gray4}}>Пароль: </span><span style={{...sf,fontSize:14,fontWeight:700,color:C.label}}>{mgr.password}</span></div>
                  </div>
                  <button onClick={()=>copyToClipboard(`Логин: ${mgr.login}\nПароль: ${mgr.password}\nСсылка: myassistant.app`, mgr.id)} style={{...sf,background:copied===mgr.id?C.green:C.blue,color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",transition:"background .3s"}}>
                    {copied===mgr.id?"✓ Скопировано!":"📋 Скопировать и отправить клиенту"}
                  </button>
                </div>
                <button onClick={()=>deleteUser(mgr.id)} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.red,marginTop:8,padding:"4px 0"}}>Удалить клиента</button>
              </div>
            </div>
          );
        })}

        {/* СПИСОК АССИСТЕНТОВ */}
        {tab==="assistants" && assistants.map(ast=>{
          const clients = managers.filter(m=>m.assistantId===ast.id);
          return (
            <div key={ast.id} style={{background:C.card,borderRadius:18,marginBottom:10,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{height:3,background:ast.color}}/>
              <div style={{padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <Avatar u={ast} size={44}/>
                  <div style={{flex:1}}>
                    <div style={{...sf,fontSize:17,fontWeight:700,color:C.label}}>{ast.name}</div>
                    <div style={{...sf,fontSize:13,color:C.gray4}}>{clients.length} клиентов</div>
                  </div>
                  <button onClick={()=>openEdit(ast)} style={{background:C.gray1,border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",...sf,fontSize:13,color:C.blue,fontWeight:600}}>Изменить</button>
                </div>
                {clients.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                    {clients.map(c=><div key={c.id} style={{...sf,background:`${c.color}12`,border:`1.5px solid ${c.color}30`,borderRadius:10,padding:"4px 12px",fontSize:13,color:c.color,fontWeight:600}}>{c.name.split(" ")[0]}</div>)}
                  </div>
                )}
                <div style={{background:C.gray1,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{...sf,fontSize:12,color:C.gray4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Данные для входа</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div><span style={{...sf,fontSize:13,color:C.gray4}}>Логин: </span><span style={{...sf,fontSize:14,fontWeight:700,color:C.label}}>{ast.login}</span></div>
                    <div><span style={{...sf,fontSize:13,color:C.gray4}}>Пароль: </span><span style={{...sf,fontSize:14,fontWeight:700,color:C.label}}>{ast.password}</span></div>
                  </div>
                  <button onClick={()=>copyToClipboard(`Логин: ${ast.login}\nПароль: ${ast.password}\nСсылка: myassistant.app`, ast.id)} style={{...sf,background:copied===ast.id?C.green:C.blue,color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",transition:"background .3s"}}>
                    {copied===ast.id?"✓ Скопировано!":"📋 Скопировать данные"}
                  </button>
                </div>
                <button onClick={()=>deleteUser(ast.id)} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.red,marginTop:8,padding:"4px 0"}}>Удалить ассистента</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ФОРМА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",zIndex:400,backdropFilter:"blur(4px)"}} onClick={()=>setShowForm(false)}>
          <div style={{background:C.card,borderRadius:"24px 24px 0 0",padding:"8px 20px 44px",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:5,background:C.gray2,borderRadius:3,margin:"12px auto 20px"}}/>
            <div style={{...sf,fontSize:20,fontWeight:700,marginBottom:20}}>
              {editUser?"Редактировать":"Создать"} {formType==="manager"?"клиента":"ассистента"}
            </div>

            <Lbl text="Имя и фамилия"/>
            <div style={{ marginBottom: 12 }}>
  <Field
    placeholder="Например: Иван Петров"
    value={form.name}
    onChange={e => setForm({ ...form, name: e.target.value })}
  />
</div>
            <Lbl text="Логин (для входа)"/>
            <div style={{marginBottom:12}}><Field placeholder="Например: ivan" value={form.login} onChange={e=>setForm({...form,login:e.target.value.toLowerCase().replace(/\s/g,"")})} /></div>

            <Lbl text="Пароль"/>
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",gap:8}}>
                <Field placeholder="Придумайте пароль" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                <button onClick={()=>setForm({...form,password:Math.random().toString(36).slice(2,10)})} style={{...sf,background:C.gray1,border:"none",borderRadius:12,padding:"0 14px",cursor:"pointer",fontSize:13,color:C.blue,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>Авто</button>
              </div>
            </div>

            {formType==="manager"&&assistants.length>0&&(
              <>
                <Lbl text="Прикрепить к ассистенту"/>
                <div style={{marginBottom:16,display:"flex",flexWrap:"wrap",gap:8}}>
                  {assistants.map(a=>(
                    <button key={a.id} onClick={()=>setForm({...form,assistantId:a.id})} style={{...sf,background:form.assistantId===a.id?`${a.color}15`:C.gray1,border:`1.5px solid ${form.assistantId===a.id?a.color:"transparent"}`,borderRadius:12,padding:"8px 16px",cursor:"pointer",fontSize:14,color:form.assistantId===a.id?a.color:C.label3,fontWeight:form.assistantId===a.id?700:400}}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Lbl text="Цвет"/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setForm({...form,color:c})} style={{width:36,height:36,borderRadius:"50%",background:c,border:form.color===c?`3px solid ${C.label}`:"3px solid transparent",cursor:"pointer"}}/>
              ))}
            </div>

            {!form.name||!form.login||!form.password ? <div style={{...sf,fontSize:13,color:C.red,marginBottom:12}}>Заполните все поля</div> : null}

            <div style={{display:"flex",gap:10}}>
              <Btn label={editUser?"Сохранить":"Создать"} color={C.blue} onTap={save} disabled={!form.name||!form.login||!form.password} full/>
              <Btn label="Отмена" ghost color={C.gray4} onTap={()=>setShowForm(false)}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── УВЕДОМЛЕНИЯ ───────────────────────────────────────────────────────────────
function Bell({ notes, onClear }) {
  const [open,setOpen]=useState(false); const ref=useRef();
  const unread=notes.filter(n=>!n.read).length;
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",position:"relative"}}>
        <span style={{fontSize:22,color:unread>0?C.orange:C.gray4}}>🔔</span>
        {unread>0&&<span style={{position:"absolute",top:0,right:0,background:C.red,color:"#fff",borderRadius:10,minWidth:18,height:18,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",...sf}}>{unread}</span>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:44,width:300,zIndex:500,background:C.card,borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px 10px",display:"flex",justifyContent:"space-between",borderBottom:`0.5px solid ${C.sep}`}}>
            <span style={{...sf,fontSize:16,fontWeight:700}}>Уведомления</span>
            {notes.length>0&&<button onClick={onClear} style={{...sf,fontSize:14,color:C.blue,background:"none",border:"none",cursor:"pointer"}}>Прочитать</button>}
          </div>
          <div style={{maxHeight:320,overflowY:"auto"}}>
            {notes.length===0?<div style={{padding:"28px 18px",textAlign:"center",...sf,color:C.gray4,fontSize:14}}>Всё прочитано</div>
              :notes.map(n=><div key={n.id} style={{padding:"10px 18px",borderBottom:`0.5px solid ${C.sep}`,background:n.read?"transparent":"rgba(0,122,255,0.04)"}}>
                <div style={{...sf,fontSize:14,color:n.read?C.label3:C.label,lineHeight:1.4}}>{n.text}</div>
                <div style={{...sf,fontSize:11,color:C.gray4,marginTop:2}}>{n.time}</div>
              </div>)
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── МЕТРИКИ ───────────────────────────────────────────────────────────────────
function Metrics({ tasks }) {
  const done=tasks.filter(t=>t.status==="done");
  const doneWk=done.filter(t=>t.createdAt>=past(7)).length;
  const savedM=tasks.filter(t=>t.managerMinutes&&t.doneMinutes&&t.managerMinutes>t.doneMinutes).reduce((s,t)=>s+(t.managerMinutes-t.doneMinutes),0);
  const savedH=+(savedM/60).toFixed(1);
  const inTime=done.length>0?Math.round(done.filter(t=>t.deadline>=t.createdAt).length/done.length*100):null;
  const ratings=done.filter(t=>t.rating); const avgR=ratings.length>0?(ratings.reduce((s,t)=>s+t.rating,0)/ratings.length).toFixed(1):null;
  const odCnt=tasks.filter(t=>isOverdue(t)).length;
  const sc=p=>p>=80?C.green:p>=60?C.orange:C.red; const rc=r=>r>=4?C.green:r>=3?C.orange:C.red;
  return (
    <div style={{padding:"20px 16px 4px"}}>
      <div style={{background:"linear-gradient(145deg,#007AFF,#0051D5)",borderRadius:22,padding:"20px 22px",marginBottom:14,boxShadow:"0 8px 28px rgba(0,122,255,0.28)"}}>
        <div style={{...sf,fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600,letterSpacing:0.3,marginBottom:8,textTransform:"uppercase"}}>За 7 дней</div>
        {savedH>0?<><div style={{...sf,fontSize:32,fontWeight:700,color:"#fff",letterSpacing:-1,lineHeight:1.1,marginBottom:4}}>{savedH} часов</div><div style={{...sf,fontSize:14,color:"rgba(255,255,255,0.75)"}}>сэкономлено вашего времени</div></>
          :<><div style={{...sf,fontSize:20,fontWeight:600,color:"#fff",marginBottom:4}}>Оцените задачи</div><div style={{...sf,fontSize:14,color:"rgba(255,255,255,0.7)"}}>чтобы увидеть экономию</div></>}
      </div>
      {odCnt>0&&<div style={{background:"rgba(255,59,48,0.08)",border:"1.5px solid rgba(255,59,48,0.2)",borderRadius:16,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>⚠️</span><div><div style={{...sf,fontSize:15,fontWeight:700,color:C.red}}>{odCnt} задач просрочено</div><div style={{...sf,fontSize:13,color:"rgba(255,59,48,0.8)"}}>Требуют внимания</div></div></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:8}}>
        {[{v:doneWk,l:"задач\nза неделю",c:C.green,bg:"rgba(52,199,89,0.08)",icon:"✅"},{v:inTime!=null?`${inTime}%`:"—",l:"сдано\nв срок",c:inTime==null?C.gray4:sc(inTime),bg:inTime==null?"rgba(142,142,147,0.08)":inTime>=80?"rgba(52,199,89,0.08)":inTime>=60?"rgba(255,149,0,0.08)":"rgba(255,59,48,0.08)",icon:"📅"},{v:avgR||"—",l:"средняя\nоценка",c:avgR==null?C.gray4:rc(parseFloat(avgR)),bg:avgR==null?"rgba(142,142,147,0.08)":avgR>=4?"rgba(52,199,89,0.08)":avgR>=3?"rgba(255,149,0,0.08)":"rgba(255,59,48,0.08)",icon:"⭐"}].map((m,i)=>(
          <div key={i} style={{background:m.bg,borderRadius:18,padding:"13px 8px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{m.icon}</div><div style={{...sf,fontSize:24,fontWeight:700,color:m.c,letterSpacing:-0.5,lineHeight:1}}>{m.v}</div><div style={{...sf,fontSize:10,color:C.gray4,fontWeight:500,marginTop:4,lineHeight:1.3,whiteSpace:"pre-line"}}>{m.l}</div></div>
        ))}
      </div>
    </div>
  );
}

// ── КАРТОЧКА ЗАДАЧИ ───────────────────────────────────────────────────────────
function TaskCard({ task, role, onRate, onStatus, onClose, onAddFile }) {
  const [sc,setSc]=useState(false); const [cf,setCf]=useState({text:"",result:"",minutes:""});
  const [sr,setSr]=useState(false); const [star,setStar]=useState(task.rating||0); const [comment,setComment]=useState(task.ratingComment||""); const [mgrMin,setMgrMin]=useState(task.managerMinutes||"");
  const fileRef=useRef(); const es=effSt(task); const s=STATUS[es]; const od=isOverdue(task); const pr=PRIORITY[task.priority];
  return (
    <div style={{background:C.card,borderRadius:20,marginBottom:10,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
      <div style={{height:3,background:od?C.red:task.priority==="high"?C.red:task.priority==="medium"?C.orange:C.green}}/>
      <div style={{padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{...sf,fontSize:17,fontWeight:600,color:C.label,letterSpacing:-0.3,lineHeight:1.35,marginBottom:4}}>{task.title}</div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{...sf,fontSize:12,color:pr.color,fontWeight:600}}>{pr.label}</span>
              <span style={{...sf,fontSize:12,color:od?C.red:C.gray4,fontWeight:od?700:400}}>{od?`⚠ ${daysLeft(task.deadline)}`:`📅 ${task.deadline} · ${daysLeft(task.deadline)}`}</span>
            </div>
          </div>
          <div style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:20,padding:"5px 11px",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <span style={{fontSize:12}}>{s.icon}</span>
            <span style={{...sf,fontSize:12,fontWeight:600,color:s.color,whiteSpace:"nowrap"}}>{s.label}</span>
          </div>
        </div>
        {task.desc&&<div style={{...sf,fontSize:15,color:C.label3,marginBottom:10,lineHeight:1.5}}>{task.desc}</div>}
        <div style={{background:"rgba(0,122,255,0.06)",borderRadius:12,padding:"9px 14px",marginBottom:12}}><span style={{...sf,fontSize:14,color:C.blue,fontWeight:500}}>Цель: </span><span style={{...sf,fontSize:14,color:C.label2}}>{task.expectedResult}</span></div>
        {task.files?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{task.files.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noreferrer" style={{...sf,display:"flex",alignItems:"center",gap:5,background:C.gray1,borderRadius:10,padding:"5px 12px",fontSize:13,color:C.blue,textDecoration:"none"}}>📎 {f.name}</a>)}</div>}
        <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)onAddFile(task.id,{name:f.name,url:URL.createObjectURL(f)});e.target.value="";}}/>
        <button onClick={()=>fileRef.current.click()} style={{...sf,background:"none",border:`1.5px solid ${C.gray2}`,borderRadius:10,padding:"6px 14px",fontSize:13,color:C.gray4,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:5}}>📎 Прикрепить файл</button>
        {es==="done"&&task.doneText&&<div style={{background:"rgba(52,199,89,0.06)",border:"1.5px solid rgba(52,199,89,0.2)",borderRadius:14,padding:"12px 16px",marginBottom:12}}><div style={{...sf,fontSize:12,fontWeight:700,color:C.green,marginBottom:4,textTransform:"uppercase",letterSpacing:0.3}}>Выполнено</div><div style={{...sf,fontSize:15,color:C.label2,marginBottom:4,lineHeight:1.4}}>{task.doneText}</div>{task.doneResult&&<div style={{...sf,fontSize:13,color:C.blue,marginBottom:4}}>🔗 {task.doneResult}</div>}<div style={{...sf,fontSize:13,color:C.gray4}}>⏱ {fmtH(task.doneMinutes)}</div></div>}
        {role==="manager"&&(task.rating&&!sr?
          <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(255,149,0,0.2)",borderRadius:14,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",gap:2,marginBottom:3}}>{[1,2,3,4,5].map(n=><span key={n} style={{fontSize:20,color:n<=task.rating?"#FF9500":"#E5E5EA"}}>★</span>)}</div>{task.ratingComment&&<div style={{...sf,fontSize:14,color:C.label3,fontStyle:"italic"}}>"{task.ratingComment}"</div>}{task.managerMinutes&&task.doneMinutes&&task.managerMinutes>task.doneMinutes&&<div style={{...sf,fontSize:13,color:C.green,fontWeight:700,marginTop:4}}>Сэкономлено: {fmtH(task.managerMinutes-task.doneMinutes)}</div>}</div><button onClick={()=>setSr(true)} style={{...sf,fontSize:13,color:C.blue,background:"none",border:"none",cursor:"pointer"}}>Изменить</button></div>
          </div>:
          <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(255,149,0,0.2)",borderRadius:16,padding:14}}>
            <div style={{...sf,fontSize:15,fontWeight:700,color:C.label,marginBottom:10}}>Оценить задачу</div>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setStar(n)} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",color:n<=star?"#FF9500":"#E5E5EA",transform:n<=star?"scale(1.1)":"scale(1)",transition:"all .15s"}}>★</button>)}</div>
            {star>0&&<div style={{...sf,fontSize:14,color:C.orange,textAlign:"center",marginBottom:8}}>{["","😕 Плохо","😐 Так себе","🙂 Нормально","😊 Хорошо","🎉 Отлично!"][star]}</div>}
            <div style={{background:C.card,borderRadius:12,padding:"10px 14px",marginBottom:10,border:"1.5px solid rgba(255,149,0,0.15)"}}><div style={{...sf,fontSize:13,fontWeight:600,color:C.label3,marginBottom:6}}>Сколько бы вы потратили сами?</div><div style={{display:"flex",alignItems:"center",gap:8}}><input type="number" placeholder="мин" value={mgrMin} onChange={e=>setMgrMin(e.target.value)} style={{...sf,width:72,background:C.gray1,border:"none",borderRadius:10,padding:"7px 10px",fontSize:15,outline:"none",color:C.label}}/><span style={{...sf,fontSize:13,color:C.gray4}}>минут</span>{mgrMin&&task.doneMinutes&&<span style={{...sf,fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:10,background:parseInt(mgrMin)>task.doneMinutes?"rgba(52,199,89,0.1)":"rgba(255,59,48,0.1)",color:parseInt(mgrMin)>task.doneMinutes?C.green:C.red}}>{parseInt(mgrMin)>task.doneMinutes?`−${fmtH(parseInt(mgrMin)-task.doneMinutes)}`:`+${fmtH(task.doneMinutes-parseInt(mgrMin))}`}</span>}</div></div>
            <Field placeholder="Комментарий (необязательно)" value={comment} onChange={e=>setComment(e.target.value)} multi rows={2}/>
            <div style={{display:"flex",gap:10,marginTop:10}}><Btn label="Сохранить" color={C.orange} onTap={()=>{if(!star)return;onRate(task.id,star,comment,parseInt(mgrMin)||null);setSr(false);}} disabled={!star} full/>{task.rating&&<Btn label="Отмена" ghost color={C.gray4} onTap={()=>setSr(false)}/>}</div>
          </div>
        )}
        {role==="assistant"&&es==="new"&&<Btn label="Взять в работу" color={C.blue} onTap={()=>onStatus(task.id,"in_progress")} full/>}
        {role==="assistant"&&(es==="in_progress"||es==="overdue")&&!sc&&<div style={{display:"flex",gap:10}}><Btn label="✓ Готово" color={C.green} onTap={()=>setSc(true)} full/><Btn label="Помощь" color={C.red} onTap={()=>onStatus(task.id,"problem")} full/></div>}
        {role==="assistant"&&es==="problem"&&<Btn label="Вернуть в работу" color={C.blue} onTap={()=>onStatus(task.id,"in_progress")} full/>}
        {sc&&<div style={{background:C.gray1,borderRadius:16,padding:16,marginTop:12}}><div style={{...sf,fontSize:15,fontWeight:700,color:C.label,marginBottom:12}}>Отчёт о выполнении</div><Lbl text="Что сделано *"/><Field placeholder="Опишите результат..." value={cf.text} onChange={e=>setCf({...cf,text:e.target.value})} multi rows={3}/><div style={{marginTop:8}}><Lbl text="Ссылка"/><Field placeholder="Ссылка, файл..." value={cf.result} onChange={e=>setCf({...cf,result:e.target.value})}/></div><div style={{marginTop:8}}><Lbl text="Сколько минут *"/><Field placeholder="45" value={cf.minutes} onChange={e=>setCf({...cf,minutes:e.target.value})} type="number"/></div><div style={{display:"flex",gap:10,marginTop:12}}><Btn label="Закрыть задачу" color={C.green} onTap={()=>{if(!cf.text||!cf.minutes)return;onClose(task.id,cf);setSc(false);}} disabled={!cf.text||!cf.minutes} full/><Btn label="Отмена" ghost color={C.gray4} onTap={()=>setSc(false)}/></div></div>}
      </div>
    </div>
  );
}

// ── ЧАТ ───────────────────────────────────────────────────────────────────────
function ChatTab({ managerId, role, messages, onSend }) {
  const [text,setText]=useState(""); const [pend,setPend]=useState([]); const bottomRef=useRef(); const fileRef=useRef();
  const msgs=messages[managerId]||[];
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=()=>{if(!text.trim()&&pend.length===0)return;onSend(managerId,text,role,pend);setText("");setPend([]);};
  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",minHeight:340}}>
      <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map(m=>{const isMe=m.from===role;return(
          <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"75%",padding:"10px 14px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isMe?C.blue:"#E9E9EB"}}>
              {m.files?.length>0&&m.files.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noreferrer" style={{...sf,display:"flex",alignItems:"center",gap:5,background:isMe?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.08)",borderRadius:8,padding:"4px 10px",fontSize:13,color:isMe?"#fff":C.blue,textDecoration:"none",marginBottom:4}}>📎 {f.name}</a>)}
              {m.text&&<div style={{...sf,fontSize:16,color:isMe?"#fff":"#000",lineHeight:1.4}}>{m.text}</div>}
              <div style={{...sf,fontSize:11,color:isMe?"rgba(255,255,255,0.55)":"rgba(0,0,0,0.4)",marginTop:3,textAlign:"right"}}>{m.time}</div>
            </div>
          </div>
        );})}
        <div ref={bottomRef}/>
      </div>
      {pend.length>0&&<div style={{padding:"6px 14px",background:C.card,display:"flex",gap:6}}>{pend.map((f,i)=><span key={i} style={{...sf,background:C.gray1,borderRadius:10,padding:"4px 10px",fontSize:13,color:C.blue}}>📎 {f.name}</span>)}</div>}
      <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setPend(p=>[...p,{name:f.name,url:URL.createObjectURL(f)}]);e.target.value="";}}/>
      <div style={{padding:"10px 14px 16px",background:C.card,borderTop:`0.5px solid ${C.sep}`,display:"flex",gap:8,alignItems:"flex-end"}}>
        <button onClick={()=>fileRef.current.click()} style={{background:C.gray1,border:"none",borderRadius:12,width:40,height:40,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>📎</button>
        <textarea placeholder="Сообщение..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} style={{...sf,flex:1,background:C.gray1,border:"none",borderRadius:20,padding:"10px 14px",fontSize:16,color:C.label,outline:"none",resize:"none",height:40,boxSizing:"border-box",lineHeight:"20px"}}/>
        <button onClick={send} style={{background:C.blue,border:"none",borderRadius:20,width:40,height:40,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
      </div>
    </div>
  );
}

// ── НАСТРОЙКИ АССИСТЕНТА (редактирование клиентов) ────────────────────────────
function AssistantSettings({ user, users, setUsers, onClose }) {
  const myClients = users.filter(u=>u.role==="manager"&&u.assistantId===user.id);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const saveName = (id) => {
    if(!editName.trim())return;
    setUsers(p=>p.map(u=>u.id===id?{...u,name:editName,initials:mkInitials(editName)}:u));
    setEditId(null);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",zIndex:400,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:C.card,borderRadius:"24px 24px 0 0",padding:"8px 20px 44px",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:5,background:C.gray2,borderRadius:3,margin:"12px auto 20px"}}/>
        <div style={{...sf,fontSize:20,fontWeight:700,marginBottom:6}}>Мои клиенты</div>
        <div style={{...sf,fontSize:14,color:C.gray4,marginBottom:20}}>Вы можете изменить имя клиента</div>

        {myClients.length===0&&<div style={{...sf,fontSize:15,color:C.gray4,textAlign:"center",padding:"20px 0"}}>Клиентов нет</div>}

        {myClients.map(client=>(
          <div key={client.id} style={{background:C.gray1,borderRadius:16,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:editId===client.id?12:0}}>
              <Avatar u={client} size={40}/>
              <div style={{flex:1}}>
                <div style={{...sf,fontSize:16,fontWeight:600,color:C.label}}>{client.name}</div>
                <div style={{...sf,fontSize:13,color:C.gray4}}>@{client.login}</div>
              </div>
              {editId===client.id
                ?<button onClick={()=>setEditId(null)} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.gray4}}>Отмена</button>
                :<button onClick={()=>{setEditId(client.id);setEditName(client.name);}} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.blue,fontWeight:600}}>Изменить имя</button>
              }
            </div>
            {editId===client.id&&(
              <div style={{display:"flex",gap:8}}>
                <input value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName(client.id)} placeholder="Новое имя" style={{...sf,flex:1,background:C.card,border:`1.5px solid ${C.blue}`,borderRadius:12,padding:"10px 14px",fontSize:16,color:C.label,outline:"none"}}/>
                <Btn label="Сохранить" color={C.blue} onTap={()=>saveName(client.id)} disabled={!editName.trim()}/>
              </div>
            )}
          </div>
        ))}
        <div style={{marginTop:8}}><Btn label="Закрыть" ghost color={C.gray4} onTap={onClose} full/></div>
      </div>
    </div>
  );
}

// ── ГЛАВНОЕ ПРИЛОЖЕНИЕ ────────────────────────────────────────────────────────
export default function App() {
  // Данные сохраняются в localStorage — не пропадают при перезагрузке
  const [users,    setUsers]    = useLocalStorage("ba_users",    INIT_USERS);
  const [tasks,    setTasks]    = useLocalStorage("ba_tasks",    INIT_TASKS);
  const [messages, setMessages] = useLocalStorage("ba_messages", INIT_MSGS);
  const [events,   setEvents]   = useLocalStorage("ba_events",   INIT_EVENTS);
  const [notes,    setNotes]    = useLocalStorage("ba_notes",    []);
  // Сессия — не сохраняем (каждый раз входит заново)
  const [user,     setUser]     = useState(null);
  const [tab,      setTab]      = useState("tasks");
  const [filter,   setFilter]   = useState("all");
  const [showAdd,  setShowAdd]  = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [assTab,   setAssTab]   = useState(null);
  const [form,     setForm]     = useState({title:"",desc:"",deadline:"",priority:"medium",expectedResult:""});

  const addNote = t => setNotes(p=>[{id:Date.now(),text:t,time:nowTime(),read:false},...p]);

  if(!user) return <LoginScreen users={users} onLogin={u=>{setUser(u);if(u.role==="assistant"){const clients=users.filter(c=>c.role==="manager"&&c.assistantId===u.id);setAssTab(clients[0]?.id||null);}}} />;
  if(user.role==="admin") return <AdminPanel users={users} setUsers={setUsers} onLogout={()=>setUser(null)}/>;

  const isManager   = user.role==="manager";
  const isAssistant = user.role==="assistant";

  // Клиенты ассистента (актуальный список из users)
  const myClients = users.filter(u=>u.role==="manager"&&u.assistantId===user.id);
  const curId     = isManager ? user.id : (assTab||myClients[0]?.id);
  const mgr       = users.find(u=>u.id===curId);

  const sTasks = tasks.filter(t=>t.managerId===curId);
  const FILTERS=[{key:"all",label:"Все"},{key:"in_progress",label:"В работе"},{key:"problem",label:"Помощь"},{key:"done",label:"Готово"}];
  const shown  = filter==="all"?sTasks:sTasks.filter(t=>t.status===filter);
  const cnt    = {all:sTasks.length,in_progress:sTasks.filter(t=>t.status==="in_progress").length,problem:sTasks.filter(t=>t.status==="problem").length,done:sTasks.filter(t=>t.status==="done").length};
  const odCnt  = sTasks.filter(t=>isOverdue(t)).length;

  useEffect(()=>{
    if(!curId)return;
    sTasks.filter(t=>isOverdue(t)).forEach(t=>{if(!notes.some(n=>n.text.includes(t.title)&&n.text.includes("Просрочено")))addNote(`⚠ Просрочено: «${t.title}»`);});
  },[tasks,curId]);

  const doAdd=()=>{
    if(!form.title||!form.deadline||!form.expectedResult)return;
    const t={...form,id:Date.now(),managerId:user.id,status:"new",doneText:null,doneResult:null,doneMinutes:null,managerMinutes:null,rating:null,ratingComment:null,createdAt:TODAY,files:[]};
    setTasks(p=>[...p,t]); addNote(`🕐 Новая задача: «${form.title}»`);
    setForm({title:"",desc:"",deadline:"",priority:"medium",expectedResult:""}); setShowAdd(false);
  };

  const TABS=[{key:"tasks",icon:"📋",label:"Задачи"},{key:"chat",icon:"💬",label:"Чат"},{key:"calendar",icon:"📅",label:"Календарь"}];

  return (
    <div style={{...sf,background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto"}}>
      {/* NAV BAR */}
      <div style={{background:"rgba(255,255,255,0.9)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`0.5px solid ${C.sep}`,padding:"0 16px",display:"flex",alignItems:"center",height:56,gap:10,position:"sticky",top:0,zIndex:100}}>
        <div style={{flex:1}}>
          <div style={{...sf,fontSize:17,fontWeight:700,color:C.label,letterSpacing:-0.3}}>{tab==="tasks"?"Задачи":tab==="chat"?"Чат":"Календарь"}</div>
          <div style={{...sf,fontSize:12,color:C.gray4,marginTop:1}}>{user.name}</div>
        </div>
        {isAssistant&&<button onClick={()=>setShowSettings(true)} style={{...sf,background:C.gray1,border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:13,color:C.blue,fontWeight:600}}>👥 Клиенты</button>}
        <Bell notes={notes} onClear={()=>setNotes(p=>p.map(n=>({...n,read:true})))}/>
        <button onClick={()=>{setUser(null);setNotes([]);setTab("tasks");setFilter("all");}} style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.gray4}}>Выйти</button>
      </div>

      {/* АССИСТЕНТ: вкладки клиентов */}
      {isAssistant&&myClients.length>0&&(
        <div style={{background:C.card,borderBottom:`0.5px solid ${C.sep}`,padding:"0 16px",display:"flex",overflowX:"auto"}}>
          {myClients.map(c=>{
            const nw=tasks.filter(t=>t.managerId===c.id&&t.status==="new").length;
            const od=tasks.filter(t=>t.managerId===c.id&&isOverdue(t)).length;
            return(
              <button key={c.id} onClick={()=>{setAssTab(c.id);setFilter("all");}} style={{...sf,background:"transparent",border:"none",borderBottom:curId===c.id?`2px solid ${c.color}`:"2px solid transparent",padding:"11px 12px",cursor:"pointer",color:curId===c.id?c.color:C.gray4,fontWeight:curId===c.id?700:500,fontSize:14,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0}}>
                {c.name.split(" ")[0]}
                {nw>0&&<span style={{background:C.blue,color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{nw}</span>}
                {od>0&&<span style={{background:C.red,color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>⚠{od}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* TAB BAR */}
      <div style={{background:C.card,borderBottom:`0.5px solid ${C.sep}`,display:"flex",position:"sticky",top:56,zIndex:90}}>
        {TABS.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,...sf,background:"transparent",border:"none",borderBottom:tab===t.key?`2px solid ${C.blue}`:"2px solid transparent",padding:"11px 4px",cursor:"pointer",color:tab===t.key?C.blue:C.gray4,fontWeight:tab===t.key?600:400,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><span style={{fontSize:16}}>{t.icon}</span>{t.label}</button>)}
      </div>

      {/* КОНТЕНТ */}
      <div style={{paddingBottom:32}}>
        {tab==="tasks"&&(
          <div>
            {isManager&&<Metrics tasks={sTasks}/>}
            {isAssistant&&mgr&&<div style={{padding:"14px 16px 0"}}><div style={{background:C.card,borderRadius:16,padding:"14px 18px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`4px solid ${mgr.color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}><div><div style={{...sf,fontSize:15,color:mgr.color,fontWeight:700,marginBottom:3}}>Доска — {mgr.name}</div><div style={{...sf,fontSize:13,color:C.gray4}}>{odCnt>0&&<span style={{color:C.red,fontWeight:700}}>{odCnt} просрочено · </span>}{cnt.in_progress} в работе · {cnt.done} готово</div></div><div style={{...sf,fontSize:36,fontWeight:700,color:mgr.color,letterSpacing:-1}}>{cnt.all}</div></div></div>}
            <div style={{padding:"0 16px"}}>
              <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
                {FILTERS.map(({key,label})=>{const n=key==="all"?cnt.all:cnt[key]||0;return<button key={key} onClick={()=>setFilter(key)} style={{...sf,padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:filter===key?700:500,background:filter===key?`${C.blue}12`:C.card,color:filter===key?C.blue:C.gray4,border:`1.5px solid ${filter===key?`${C.blue}40`:"transparent"}`,whiteSpace:"nowrap",flexShrink:0}}>{label}{n>0?` (${n})`:""}</button>;})}
              </div>
              {isManager&&<button onClick={()=>setShowAdd(true)} style={{...sf,background:C.blue,color:"#fff",border:"none",borderRadius:16,padding:"14px 20px",fontSize:17,fontWeight:600,cursor:"pointer",width:"100%",marginBottom:14,boxShadow:"0 4px 16px rgba(0,122,255,0.3)"}}>+ Поставить задачу</button>}
              {shown.length===0?<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:48}}>📭</div><div style={{...sf,fontSize:17,color:C.gray4,marginTop:10}}>Задач нет</div></div>
                :shown.map(t=><TaskCard key={t.id} task={t} role={user.role} onRate={(id,r,c,m)=>setTasks(p=>p.map(t=>t.id===id?{...t,rating:r,ratingComment:c,managerMinutes:m}:t))} onStatus={(id,s)=>{const t=tasks.find(t=>t.id===id);setTasks(p=>p.map(t=>t.id===id?{...t,status:s}:t));if(s==="in_progress")addNote(`⚙ Принято: «${t.title}»`);if(s==="problem")addNote(`❗ Нужна помощь: «${t.title}»`);}} onClose={(id,d)=>{const t=tasks.find(t=>t.id===id);setTasks(p=>p.map(t=>t.id===id?{...t,status:"done",doneText:d.text,doneResult:d.result,doneMinutes:parseInt(d.minutes)}:t));addNote(`✅ Готово: «${t.title}» — оцените работу`);}} onAddFile={(id,f)=>setTasks(p=>p.map(t=>t.id===id?{...t,files:[...(t.files||[]),f]}:t))}/>)}
            </div>
          </div>
        )}
        {tab==="chat"&&mgr&&(
          <div>
            <div style={{padding:"12px 18px",background:C.card,borderBottom:`0.5px solid ${C.sep}`,display:"flex",alignItems:"center",gap:12}}><Avatar u={mgr} size={40}/><div><div style={{...sf,fontSize:15,fontWeight:700,color:C.label}}>{mgr.name}</div><div style={{...sf,fontSize:13,color:C.gray4}}>Чат с ассистентом</div></div></div>
            <ChatTab managerId={curId} role={user.role} messages={messages} onSend={(id,text,from,files)=>{const msg={id:Date.now(),from,text,time:nowTime(),files:files||[]};setMessages(p=>({...p,[id]:[...(p[id]||[]),msg]}));addNote(`💬 Новое сообщение`);}}/>
          </div>
        )}
        {tab==="calendar"&&curId&&(
          <CalendarTab managerId={curId} role={user.role} events={events} onAdd={(id,ev)=>{setEvents(p=>({...p,[id]:[...(p[id]||[]),ev]}));addNote(`📅 Новое событие: «${ev.title}»`);}} onDelete={(id,eid)=>setEvents(p=>({...p,[id]:p[id].filter(e=>e.id!==eid)}))}/>
        )}
      </div>

      {/* НАСТРОЙКИ АССИСТЕНТА */}
      {showSettings&&<AssistantSettings user={user} users={users} setUsers={setUsers} onClose={()=>setShowSettings(false)}/>}

      {/* МОДАЛ НОВОЙ ЗАДАЧИ */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",zIndex:400,backdropFilter:"blur(4px)"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:C.card,borderRadius:"24px 24px 0 0",padding:"8px 20px 44px",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:5,background:C.gray2,borderRadius:3,margin:"12px auto 20px"}}/>
            <div style={{...sf,fontSize:22,fontWeight:700,color:C.label,marginBottom:20,letterSpacing:-0.5}}>Новая задача</div>
            <Lbl text="Название задачи"/><Field placeholder="Например: Забронировать переговорку" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <div style={{marginTop:10}}><Lbl text="Ожидаемый результат"/><Field placeholder="Что должно получиться?" value={form.expectedResult} onChange={e=>setForm({...form,expectedResult:e.target.value})}/></div>
            <div style={{marginTop:10}}><Lbl text="Подробности"/><Field placeholder="Контекст и детали..." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} multi rows={2}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:10}}>
              <div><Lbl text="Срок"/><Field type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
              <div><Lbl text="Важность"/><div style={{display:"flex",gap:6}}>{[["low","🟢"],["medium","🟡"],["high","🔴"]].map(([p,icon])=><button key={p} onClick={()=>setForm({...form,priority:p})} style={{flex:1,...sf,background:form.priority===p?`${PRIORITY[p].color}15`:C.gray1,border:`1.5px solid ${form.priority===p?PRIORITY[p].color:"transparent"}`,borderRadius:12,padding:"10px 4px",cursor:"pointer",fontSize:20,textAlign:"center"}}>{icon}</button>)}</div></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}><Btn label="Отправить задачу" color={C.blue} onTap={doAdd} disabled={!form.title||!form.deadline||!form.expectedResult} full/><Btn label="Отмена" ghost color={C.gray4} onTap={()=>setShowAdd(false)}/></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── КАЛЕНДАРЬ (вынесен отдельно) ──────────────────────────────────────────────
function CalendarTab({ managerId, role, events, onAdd, onDelete }) {
  const td=new Date(); const [yr,setYr]=useState(td.getFullYear()); const [mo,setMo]=useState(td.getMonth()); const [sel,setSel]=useState(null); const [sf2,setSf2]=useState(false); const [form,setForm]=useState({title:"",date:"",time:"",type:"meeting"});
  const myEvs=events[managerId]||[]; const fdow=(()=>{let d=new Date(yr,mo,1).getDay();return d===0?6:d-1;})(); const dim=new Date(yr,mo+1,0).getDate();
  const cells=[...Array(fdow).fill(null),...Array.from({length:dim},(_,i)=>i+1)];
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; const evOn=d=>myEvs.filter(e=>e.date===ds(d));
  return (
    <div style={{paddingBottom:30}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 10px",background:C.card,borderBottom:`0.5px solid ${C.sep}`}}>
        <button onClick={()=>{if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:26,color:C.blue,width:36,height:36}}>‹</button>
        <div style={{...sf,fontSize:17,fontWeight:700,color:C.label}}>{MONTHS[mo]} {yr}</div>
        <button onClick={()=>{if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:26,color:C.blue,width:36,height:36}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:C.card,padding:"4px 8px"}}>{WEEKDAYS.map(d=><div key={d} style={{...sf,textAlign:"center",fontSize:12,fontWeight:700,color:C.gray4,padding:"3px 0"}}>{d}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,padding:"2px 8px 12px",background:C.card}}>
        {cells.map((d,i)=>{if(!d)return<div key={`e${i}`}/>;const evs=evOn(d);const isToday=ds(d)===TODAY;const isSel=sel===d;return<div key={d} onClick={()=>setSel(isSel?null:d)} style={{borderRadius:10,padding:"5px 3px",cursor:"pointer",minHeight:46,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:isSel?C.blue:isToday?"rgba(0,122,255,0.08)":"transparent"}}><span style={{...sf,fontSize:14,fontWeight:isToday||isSel?700:400,color:isSel?"#fff":isToday?C.blue:C.label}}>{d}</span><div style={{display:"flex",gap:2}}>{evs.slice(0,3).map(e=><div key={e.id} style={{width:5,height:5,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.7)":EVT_TYPES[e.type].color}}/>)}</div></div>;})}
      </div>
      {sel&&<div style={{margin:"0 16px 14px",background:C.card,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}><div style={{padding:"12px 18px",borderBottom:`0.5px solid ${C.sep}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{...sf,fontSize:15,fontWeight:700}}>{sel} {MONTHS[mo]}</span><button onClick={()=>{setForm(f=>({...f,date:ds(sel)}));setSf2(true);}} style={{...sf,background:C.blue,color:"#fff",border:"none",borderRadius:10,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Добавить</button></div>{evOn(sel).length===0?<div style={{...sf,padding:"18px",textAlign:"center",color:C.gray4,fontSize:14}}>Нет событий</div>:evOn(sel).map(e=>{const et=EVT_TYPES[e.type];return<div key={e.id} style={{padding:"12px 18px",borderBottom:`0.5px solid ${C.sep}`,display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:10,background:`${et.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{et.icon}</div><div style={{flex:1}}><div style={{...sf,fontSize:15,fontWeight:600,color:C.label}}>{e.title}</div><div style={{...sf,fontSize:13,color:C.gray4}}>{et.label}{e.time?` · ${e.time}`:""}</div></div>{role===e.addedBy&&<button onClick={()=>onDelete(managerId,e.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:C.gray3}}>🗑</button>}</div>;})}
      </div>}
      {!sel&&<div style={{padding:"0 16px 14px"}}><div style={{...sf,fontSize:12,fontWeight:700,color:C.gray4,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Предстоящие события</div>{[...myEvs].sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>e.date>=TODAY).slice(0,4).map(e=>{const et=EVT_TYPES[e.type];return<div key={e.id} style={{background:C.card,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}><div style={{width:40,height:40,borderRadius:12,background:`${et.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{et.icon}</div><div style={{flex:1}}><div style={{...sf,fontSize:15,fontWeight:600,color:C.label}}>{e.title}</div><div style={{...sf,fontSize:13,color:C.gray4}}>{e.date}{e.time?` · ${e.time}`:""}</div></div><span style={{...sf,fontSize:11,padding:"3px 8px",borderRadius:8,background:`${et.color}12`,color:et.color,fontWeight:600}}>{et.label}</span></div>;})}
        {myEvs.filter(e=>e.date>=TODAY).length===0&&<div style={{...sf,padding:20,textAlign:"center",color:C.gray4,fontSize:14,background:C.card,borderRadius:14}}>Нет предстоящих событий</div>}
      </div>}
      <div style={{padding:"0 16px"}}><Btn label="+ Добавить событие" color={C.blue} onTap={()=>setSf2(true)} full/></div>
      {sf2&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",zIndex:400,backdropFilter:"blur(4px)"}} onClick={()=>setSf2(false)}><div style={{background:C.card,borderRadius:"24px 24px 0 0",padding:"8px 20px 44px",width:"100%",maxWidth:430,margin:"0 auto"}} onClick={e=>e.stopPropagation()}><div style={{width:40,height:5,background:C.gray2,borderRadius:3,margin:"12px auto 18px"}}/><div style={{...sf,fontSize:20,fontWeight:700,marginBottom:18}}>Новое событие</div><Lbl text="Название"/><Field placeholder="Встреча с клиентом" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,margin:"10px 0"}}><div><Lbl text="Дата"/><Field type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div><div><Lbl text="Время"/><Field type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div></div><Lbl text="Тип"/><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>{Object.entries(EVT_TYPES).map(([key,val])=><button key={key} onClick={()=>setForm({...form,type:key})} style={{background:form.type===key?`${val.color}15`:C.gray1,border:`2px solid ${form.type===key?val.color:"transparent"}`,borderRadius:14,padding:"10px 4px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:22}}>{val.icon}</div><div style={{...sf,fontSize:10,fontWeight:700,color:form.type===key?val.color:C.gray4,marginTop:4}}>{val.label}</div></button>)}</div><div style={{display:"flex",gap:10}}><Btn label="Сохранить" color={C.blue} onTap={()=>{if(!form.title||!form.date)return;onAdd(managerId,{...form,id:Date.now(),addedBy:role});setSf2(false);setForm({title:"",date:"",time:"",type:"meeting"});}} disabled={!form.title||!form.date} full/><Btn label="Отмена" ghost color={C.gray4} onTap={()=>setSf2(false)}/></div></div></div>}
    </div>
  );
}

