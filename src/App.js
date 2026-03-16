/* eslint-disable */
import { useState } from "react";
// ── ЦВЕТА И ШРИФТ ─────────────────────────────────────────────────────────────
const B = "#007AFF", G = "#34C759", R = "#FF3B30", O = "#FF9500";
const g1="#F2F2F7", g2="#E5E5EA", g3="#C7C7CC", g4="#8E8E93";
const BG="#F2F2F7", WH="#FFF", SEP="rgba(60,60,67,0.12)";
const sf = { fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" };
const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октconst WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)} ч ${m%60 ? m%60+" мин":""}` : `${m} мин`;
// ── ДАННЫЕ ────────────────────────────────────────────────────────────────────
const USERS = [
 { id:"admin1", role:"admin", name:"Администратор", initials:"AD", color:R, lo { id:"ast1", role:"assistant", name:"Мария Кузнецова", initials:"МК", color:B, lo { id:"ast2", role:"assistant", name:"Иван Смирнов", initials:"ИС", color:"#AF52DE",lo { id:"mgr1", role:"manager", name:"Алексей Морозов", initials:"АМ", color:B, lo info:"CEO · ООО Горизонт",
 about:"Предпочитает краткие отчёты. Рабочее время 9:00–18:00. Срочные вопросы — только Wh likes:"Быстрое выполнение, инициативность, чёткие отчёты",
 dislikes:"Опоздания, лишние звонки, размытые ответы",
 accesses:[{icon:" ",label:"Gmail",val:"alex@gorizo.ru / G@2024!"},{icon:" ",label:"CRM" files:[{name:"Устав.pdf",size:"2.4 МБ",icon:" "},{name:"Реквизиты.docx",size:"180 КБ",ic },
 { id:"mgr2", role:"manager", name:"Светлана Петрова", initials:"СП", color:G, lo info:"COO · Альфа Групп",
 about:"Любит детальные отчёты. Созвоны только по записи. Telegram предпочтительнее.",
 likes:"Детализация, пунктуальность", dislikes:"Неожиданные звонки",
 accesses:[{icon:" ",label:"Email",val:"s.petrova@alfa.ru"}], files:[]
 },
 { id:"mgr3", role:"manager", name:"Дмитрий Волков", initials:"ДВ", color:O, lo info:"Директор · Волна Медиа",
 about:"Работает до 21:00. Любит голосовые сообщения. Оперативно в WhatsApp.",
 likes:"Скорость, краткость", dislikes:"Длинные письма",
 accesses:[], files:[{name:"Бриф.pdf",size:"1.1 МБ",icon:" "}]
 },
 { id:"mgr4", role:"manager", name:"Анна Белова", initials:"АБ", color:"#FF2D55",lo info:"HR-директор · Старт",
 about:"Рабочее время 10:00–19:00.", likes:"Точность", dislikes:"Опоздания", accesses:[],  },
];
const INIT_TASKS = {
 mgr1:[
 {id:1,title:"Найти поставщика упаковки", desc:"Минимум 3 предложения с ценами", deadlin {id:2,title:"Подготовить КП для Горизонт", desc:"КП для ООО Горизонт", deadli {id:3,title:"Записать машину на техосмотр",desc:"Audi A6, А123ВС, любая СТО", deadli ],
 mgr2:[
 {id:4,title:"Анализ конкурентов", desc:"5 конкурентов по ценам", deadli {id:5,title:"Забронировать отель Москва", desc:"5–7 апреля, центр, до 8000₽/ночь",deadli ],
 mgr3:[
 {id:6,title:"Подготовить презентацию", desc:"15 слайдов для инвесторов", deadli ],
 mgr4:[
 {id:7,title:"Собрать резюме кандидатов", desc:"На позицию Middle Developer", deadli ],
};
const INIT_MSGS = {
 mgr1:[
 {id:1,from:"manager", text:"Привет! Когда будет КП?", time:"09:15",files:[]},
 {id:2,from:"assistant",text:"Сегодня к 17:00 пришлю!", time:"09:18",files:[]},
 {id:3,from:"manager", text:"Отлично, жду ", time:"09:20",files:[]},
 ],
 mgr2:[
 {id:1,from:"assistant",text:"Начала работу над анализом.", time:"10:00",files:[]},
 {id:2,from:"manager", text:"Хорошо. Нужно до пятницы.", time:"10:15",files:[]},
 ],
 mgr3:[
 {id:1,from:"manager", text:"Презентация готова?", time:"11:30",files:[]},
 {id:2,from:"assistant",text:"8 из 15 слайдов готово.", time:"11:35",files:[]},
 ],
 mgr4:[],
};
const INIT_EVENTS = {
 mgr1:[
 {id:1,date:"2026-03-10",time:"10:00",title:"Встреча с инвесторами",type:"meeting", by:"ma {id:2,date:"2026-03-12",time:"14:00",title:"Звонок с поставщиком", type:"call", by:"as {id:3,date:"2026-03-07",time:"11:00",title:"Встреча с командой", type:"meeting", by:"as ],
 mgr2:[{id:1,date:"2026-03-09",time:"15:00",title:"Созвон по анализу", type:"call", b mgr3:[{id:1,date:"2026-03-10",time:"09:00",title:"Дедлайн — презентация", type:"deadline",b mgr4:[],
};
const EVT={meeting:{l:"Встреча",i:" ",c:B},call:{l:"Звонок",i:" ",c:G},deadline:{l:"Дедлайнconst PR ={high:{l:"Высокий",c:R},medium:{l:"Средний",c:O},low:{l:"Низкий",c:G}};
const ST ={
 new: {l:"Новая", i:" ",c:O,bg:"rgba(255,149,0,0.08)", bd:"rgba(255,149,0,0.25 in_progress:{l:"В процессе",i:" ", c:B,bg:"rgba(0,122,255,0.08)", bd:"rgba(0,122,255,0.25) done: {l:"Готово", i:" ",c:G,bg:"rgba(52,199,89,0.08)", bd:"rgba(52,199,89,0.25 problem: {l:"Помощь", i:" ",c:R,bg:"rgba(255,59,48,0.08)", bd:"rgba(255,59,48,0.25};
// ── МАЛЕНЬКИЕ КОМПОНЕНТЫ ──────────────────────────────────────────────────────
function Av({u, size=40}) {
 return (
 <div style={{width:size,height:size,borderRadius:"50%",
 background:`${u.color}18`,color:u.color,
 display:"flex",alignItems:"center",justifyContent:"center",
 fontSize:size*0.33,fontWeight:800,...sf,flexShrink:0}}>
 {u.initials}
 </div>
 );
}
function Chip({label, icon, color, bg, border}) {
 return (
 <div style={{background:bg,border:`1.5px solid ${border}`,borderRadius:18,
 padding:"4px 10px",display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
 <span style={{fontSize:11}}>{icon}</span>
 <span style={{...sf,fontSize:11,fontWeight:600,color}}>{label}</span>
 </div>
 );
}
// ── ЭКРАН ВХОДА ───────────────────────────────────────────────────────────────
function LoginScreen({onLogin, users}) {
 const [login, setLogin] = useState("");
 const [pw, setPw] = useState("");
 const [err, setErr] = useState("");
 const [busy, setBusy] = useState(false);
 function doLogin() {
 if (!login.trim() || !pw) { setErr("Введите логин и пароль"); return; }
 setBusy(true); setErr("");
 setTimeout(() => {
 const u = users.find(x => x.login === login.trim().toLowerCase() && x.pw === pw);
 if (u) { onLogin(u); }
 else { setErr("Неверный логин или пароль"); setBusy(false); }
 }, 400);
 }
 return (
 <div style={{height:"100%",display:"flex",flexDirection:"column",
 alignItems:"center",justifyContent:"center",padding:"0 32px",background:BG}}>
 {/* Логотип */}
 <div style={{width:76,height:76,borderRadius:24,
 background:"linear-gradient(145deg,#007AFF,#0051D5)",
 display:"flex",alignItems:"center",justifyContent:"center",
 marginBottom:20,boxShadow:"0 10px 32px rgba(0,122,255,0.38)"}}>
 <span style={{fontSize:36,color:"#fff"}}>✦</span>
 </div>
 <div style={{...sf,fontSize:28,fontWeight:800,marginBottom:6,letterSpacing:-0.7}}>
 Мой Ассистент
 </div>
 <div style={{...sf,fontSize:14,color:g4,marginBottom:36,textAlign:"center",lineHeight:1 Ваш персональный помощник
 </div>
 {/* Поля ввода */}
 <div style={{width:"100%",background:WH,borderRadius:20,overflow:"hidden",
 boxShadow:"0 2px 20px rgba(0,0,0,0.08)",marginBottom:14}}>
 <div style={{padding:"15px 20px",borderBottom:`0.5px solid ${SEP}`}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.6,marginBottom:7}}>Логин</div>
 <input
 value={login}
 onChange={e => setLogin(e.target.value)}
 onKeyDown={e => e.key==="Enter" && doLogin()}
 placeholder="Введите ваш логин"
 autoCapitalize="none"
 autoCorrect="off"
 style={{...sf,width:"100%",background:"transparent",border:"none",
 fontSize:17,color:"#000",outline:"none",boxSizing:"border-box"}}
 />
 </div>
 <div style={{padding:"15px 20px"}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.6,marginBottom:7}}>Пароль</div>
 <input
 type="password"
 value={pw}
 onChange={e => setPw(e.target.value)}
 onKeyDown={e => e.key==="Enter" && doLogin()}
 placeholder="Введите ваш пароль"
 style={{...sf,width:"100%",background:"transparent",border:"none",
 fontSize:17,color:"#000",outline:"none",boxSizing:"border-box"}}
 />
 </div>
 </div>
 {err && (
 <div style={{...sf,width:"100%",background:"rgba(255,59,48,0.08)",
 border:"1.5px solid rgba(255,59,48,0.25)",borderRadius:14,
 padding:"12px 18px",marginBottom:14,fontSize:14,color:R,textAlign:"center"}}>
 {err}
 </div>
 )}
 <button
 onClick={doLogin}
 disabled={busy}
 style={{...sf,background:busy?`${B}99`:B,color:"#fff",border:"none",borderRadius:18,
 padding:"17px",fontSize:17,fontWeight:700,cursor:busy?"default":"pointer",width:"10 boxShadow:"0 6px 20px rgba(0,122,255,0.35)",transition:"all .2s",marginBottom:20}}>
 {busy ? "Вход…" : "Войти"}
 </button>
 <div style={{...sf,fontSize:12,color:g3,textAlign:"center"}}>
 Логин и пароль выдаёт администратор
 </div>
 </div>
 );
}
// ── КАЛЕНДАРЬ ─────────────────────────────────────────────────────────────────
function CalendarBlock({events, setEvents, mgrId, role}) {
 const [yr, setYr] = useState(2026);
 const [mo, setMo] = useState(2);
 const [sel, setSel] = useState(7);
 const [adding, setAdding] = useState(false);
 const [form, setForm] = useState({title:"",time:"",type:"meeting"});
 const evts = events[mgrId] || [];
 const off = (() => { const d = new Date(yr,mo,1).getDay(); return d===0?6:d-1; })();
 const dim = new Date(yr,mo+1,0).getDate();
 const cells = [...Array(off).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];
 while (cells.length % 7 !== 0) cells.push(null);
 const ds = d => `${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
 const dayE = d => evts.filter(e => e.date === ds(d));
 const selE = sel ? dayE(sel) : [];
 const prevMo = () => mo===0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1);
 const nextMo = () => mo===11 ? (setMo(0), setYr(y=>y+1)) : setMo(m=>m+1);
 function addEvent() {
 if (!form.title) return;
 const ev = {id:Date.now(), date:ds(sel), time:form.time||"00:00", title:form.title, type: setEvents(p => ({...p, [mgrId]: [...(p[mgrId]||[]), ev]}));
 setForm({title:"",time:"",type:"meeting"});
 setAdding(false);
 }
 function delEvent(id) {
 setEvents(p => ({...p, [mgrId]: (p[mgrId]||[]).filter(e=>e.id!==id)}));
 }
 return (
 <div>
 {/* Навигация по месяцу */}
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBo <button onClick={prevMo} style={{background:"none",border:"none",cursor:"pointer",fon <div style={{...sf,fontSize:16,fontWeight:700}}>{MONTHS[mo]} {yr}</div>
 <button onClick={nextMo} style={{background:"none",border:"none",cursor:"pointer",fon </div>
 {/* Дни недели */}
 <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:2}}>
 {WD.map(d=>(
 <div key={d} style={{...sf,textAlign:"center",fontSize:11,color:g4,fontWeight:600,p ))}
 </div>
 {/* Числа */}
 <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:14}} {cells.map((d,i) => {
 const de = d ? dayE(d) : [];
 const isTod = d===7 && mo===2 && yr===2026;
 const isSel = d===sel;
 return (
 <div key={i} onClick={() => d && setSel(d)}
 style={{textAlign:"center",padding:"5px 2px",borderRadius:10,cursor:d?"pointer" background: isSel ? B : isTod ? "rgba(0,122,255,0.10)" : "transparent"}}>
 {d && <>
 <div style={{...sf,fontSize:15,fontWeight:isSel||isTod?700:400,
 color: isSel?"#fff" : isTod?B : "#000"}}>{d}</div>
 <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2}}>
 {de.slice(0,3).map((e,j)=>(
 <div key={j} style={{width:4,height:4,borderRadius:"50%",
 background: isSel?"rgba(255,255,255,0.7)" : (EVT[e.type]?.c || B)}}/>
 ))}
 </div>
 </>}
 </div>
 );
 })}
 </div>
 {/* События выбранного дня */}
 {sel && <>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin <div style={{...sf,fontSize:14,fontWeight:700}}>{sel} {MONTHS[mo]}</div>
 <button onClick={()=>setAdding(true)}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:10,
 padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
 + Событие
 </button>
 </div>
 {selE.length===0 && (
 <div style={{...sf,fontSize:13,color:g4,textAlign:"center",padding:"10px 0"}}>Событ )}
 {selE.map(e => {
 const t = EVT[e.type] || EVT.meeting;
 return (
 <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,
 padding:"9px 12px",background:g1,borderRadius:12,marginBottom:6,
 borderLeft:`3px solid ${t.c}`}}>
 <span style={{fontSize:18}}>{t.i}</span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:14,fontWeight:600}}>{e.title}</div>
 <div style={{...sf,fontSize:11,color:g4}}>{e.time} · {e.by==="manager"?"Вы":" </div>
 <button onClick={()=>delEvent(e.id)}
 style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:g4 </div>
 );
 })}
 {/* Форма добавления */}
 {adding && (
 <div style={{background:g1,borderRadius:14,padding:12,marginTop:8}}>
 <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
 placeholder="Название события"
 style={{...sf,width:"100%",background:WH,border:"none",borderRadius:10,
 padding:"10px 12px",fontSize:15,outline:"none",marginBottom:8,boxSizing:"bord <div style={{display:"flex",gap:8,marginBottom:8}}>
 <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.targe style={{...sf,flex:1,background:WH,border:"none",borderRadius:10,padding:"10p <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
 style={{...sf,flex:1,background:WH,border:"none",borderRadius:10,padding:"10p {Object.entries(EVT).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
 </select>
 </div>
 <div style={{display:"flex",gap:8}}>
 <button onClick={addEvent}
 style={{...sf,flex:1,background:B,color:"#fff",border:"none",borderRadius:10,
 padding:"10px",cursor:"pointer",fontSize:14,fontWeight:600}}>Добавить</butt <button onClick={()=>setAdding(false)}
 style={{...sf,background:WH,border:"none",borderRadius:10,
 padding:"10px 14px",cursor:"pointer",fontSize:14,color:g4}}>Отмена</button>
 </div>
 </div>
 )}
 </>}
 </div>
 );
}
// ── ПРОФИЛЬ РУКОВОДИТЕЛЯ ──────────────────────────────────────────────────────
const ACCESS_ICONS = [" "," "," "," "," "," "," "," "," "," "];
function ProfileBlock({mgr, setUsers, canEdit, isNewAssistant, onAcknowledge}) {
 const [editing, setEditing] = useState(false);
 const [about, setAbout] = useState(mgr.about || "");
 const [likes, setLikes] = useState(mgr.likes || "");
 const [dislike, setDislike] = useState(mgr.dislikes || "");
 const [accesses, setAccesses] = useState(mgr.accesses || []);
 const [files, setFiles] = useState(mgr.files || []);
 const [addingAcc, setAddingAcc] = useState(false);
 const [accForm, setAccForm] = useState({icon:" ",label:"",val:""});
 const [copied, setCopied] = useState(null);
 function save() {
 setUsers(p => p.map(u => u.id===mgr.id ? {...u,about,likes,dislikes:dislike,accesses,file setEditing(false);
 }
 function addAccess() {
 if (!accForm.label || !accForm.val) return;
 const updated = [...accesses, {...accForm}];
 setAccesses(updated);
 setUsers(p => p.map(u => u.id===mgr.id ? {...u,accesses:updated} : u));
 setAccForm({icon:" ",label:"",val:""});
 setAddingAcc(false);
 }
 function delAccess(i) {
 const updated = accesses.filter((_,idx)=>idx!==i);
 setAccesses(updated);
 setUsers(p => p.map(u => u.id===mgr.id ? {...u,accesses:updated} : u));
 }
 function copyAcc(val, i) {
 setCopied(i);
 setTimeout(()=>setCopied(null),2000);
 }
 const inp = {...sf,width:"100%",background:WH,border:"none",borderRadius:10,
 padding:"10px 12px",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8};
 // ── Баннер замены ассистента ──
 if (isNewAssistant) {
 return (
 <div style={{padding:"8px 0"}}>
 <div style={{background:"linear-gradient(135deg,rgba(0,122,255,0.08),rgba(0,122,255,0 border:"2px solid rgba(0,122,255,0.2)",borderRadius:20,padding:"20px 18px",marginBo textAlign:"center"}}>
 <div style={{fontSize:48,marginBottom:10}}> </div>
 <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:6}}>Новый клиент!</div>
 <div style={{...sf,fontSize:14,color:"#3C3C43",lineHeight:1.6,marginBottom:16}}>
 Прочитай профиль руководителя внимательно — пойми кто он, что любит, как работает </div>
 <div style={{background:WH,borderRadius:14,padding:"12px 14px",marginBottom:16,text <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
 <Av u={mgr} size={44}/>
 <div>
 <div style={{...sf,fontSize:16,fontWeight:700}}>{mgr.name}</div>
 <div style={{...sf,fontSize:12,color:g4}}>{mgr.info}</div>
 </div>
 </div>
 {mgr.about && <div style={{...sf,fontSize:13,color:"#3C3C43",lineHeight:1.5}}>{mg </div>
 <button onClick={onAcknowledge}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:16,
 padding:"14px",fontSize:16,fontWeight:700,cursor:"pointer",width:"100%",
 boxShadow:"0 4px 16px rgba(0,122,255,0.3)"}}>
 ✓ Ознакомился, начинаю работу
 </button>
 </div>
 </div>
 );
 }
 return (
 <div>
 {/* Шапка */}
 <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
 <Av u={mgr} size={56}/>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:19,fontWeight:700,letterSpacing:-0.4}}>{mgr.name}</div>
 <div style={{...sf,fontSize:13,color:g4}}>{mgr.info}</div>
 </div>
 {canEdit && (
 <button onClick={editing?save:()=>setEditing(true)}
 style={{...sf,background:editing?B:g1,color:editing?"#fff":B,
 border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:13,f {editing?"Сохранить":"Изменить"}
 </button>
 )}
 </div>
 {/* Видео */}
 <div style={{background:"#0a0a1a",borderRadius:14,height:108,display:"flex",
 alignItems:"center",justifyContent:"center",marginBottom:12,position:"relative",overf <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,12 <div style={{position:"relative",textAlign:"center"}}>
 <div style={{fontSize:32,marginBottom:3}}> </div>
 <div style={{...sf,fontSize:12,color:"rgba(255,255,255,0.75)"}}>Видео о руководител </div>
 {canEdit && (
 <button style={{position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,0 border:"1.5px dashed rgba(255,255,255,0.3)",borderRadius:8,padding:"4px 9px",
 cursor:"pointer",...sf,fontSize:11,color:"rgba(255,255,255,0.7)"}}>
 + Прикрепить
 </button>
 )}
 </div>
 {/* Описание */}
 {editing
 ? <textarea value={about} onChange={e=>setAbout(e.target.value)}
 style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
 padding:"10px 12px",fontSize:14,outline:"none",resize:"none",
 boxSizing:"border-box",lineHeight:1.5,minHeight:68,marginBottom:10}}/>
 : <div style={{...sf,fontSize:14,color:"#3C3C43",lineHeight:1.6,marginBottom:12}}>
 {about || <span style={{color:g4}}>Информация не заполнена</span>}
 </div>
 }
 {/* Нравится / не нравится */}
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
 <div style={{background:"rgba(52,199,89,0.08)",border:"1.5px solid rgba(52,199,89,0.2 <div style={{...sf,fontSize:11,color:G,fontWeight:700,textTransform:"uppercase",let
 {editing
 ? <textarea value={likes} onChange={e=>setLikes(e.target.value)}
 style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:13 outline:"none",resize:"none",lineHeight:1.4,boxSizing:"border-box",color:"# : <div style={{...sf,fontSize:13,lineHeight:1.4}}>{likes||"—"}</div>}
 </div>
 <div style={{background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.1 <div style={{...sf,fontSize:11,color:R,fontWeight:700,textTransform:"uppercase",let {editing
 ? <textarea value={dislike} onChange={e=>setDislike(e.target.value)}
 style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:13 outline:"none",resize:"none",lineHeight:1.4,boxSizing:"border-box",color:"# : <div style={{...sf,fontSize:13,lineHeight:1.4}}>{dislike||"—"}</div>}
 </div>
 </div>
 {/* ── ДОСТУПЫ — редактируются ассистентом ── */}
 <div style={{background:g1,borderRadius:14,padding:"12px 14px",marginBottom:10}}>
 <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}> Доступы и пароли</ {accesses.length===0 && !addingAcc && (
 <div style={{...sf,fontSize:13,color:g4,marginBottom:8}}>Нет доступов</div>
 )}
 {accesses.map((a,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:10,
 padding:"9px 0",borderBottom:`0.5px solid ${SEP}`}}>
 <span style={{fontSize:20}}>{a.icon}</span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600}}>{a.label}</div>
 <div style={{...sf,fontSize:13,fontFamily:"monospace",letterSpacing:0.2}}>{a.va </div>
 <button onClick={()=>copyAcc(a.val,i)}
 style={{background:copied===i?G:WH,border:"none",borderRadius:7,
 padding:"4px 8px",cursor:"pointer",...sf,fontSize:11,
 color:copied===i?"#fff":B,transition:"all .2s",flexShrink:0}}>
 {copied===i?"✓":" "}
 </button>
 {canEdit && (
 <button onClick={()=>delAccess(i)}
 style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:g4 )}
 </div>
 ))}
 {/* Форма добавления доступа */}
 {addingAcc && (
 <div style={{background:WH,borderRadius:12,padding:12,marginTop:8}}>
 <div style={{...sf,fontSize:12,color:g4,fontWeight:600,textTransform:"uppercase", <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
 {ACCESS_ICONS.map(ic=>(
 <button key={ic} onClick={()=>setAccForm({...accForm,icon:ic})}
 style={{fontSize:22,background:accForm.icon===ic?`${B}15`:"transparent",
 border:`1.5px solid ${accForm.icon===ic?B:"transparent"}`,
 borderRadius:8,padding:"4px 6px",cursor:"pointer"}}>
 {ic}
 </button>
 ))}
 </div>
 <input value={accForm.label} onChange={e=>setAccForm({...accForm,label:e.target.v placeholder="Название (напр. Gmail)" style={inp}/>
 <input value={accForm.val} onChange={e=>setAccForm({...accForm,val:e.target.value placeholder="Логин / пароль / ссылка" style={inp}/>
 <div style={{display:"flex",gap:8}}>
 <button onClick={addAccess} disabled={!accForm.label||!accForm.val}
 style={{...sf,flex:1,background:(!accForm.label||!accForm.val)?g2:B,
 color:(!accForm.label||!accForm.val)?g3:"#fff",border:"none",borderRadius:1 padding:"10px",cursor:"pointer",fontSize:14,fontWeight:600}}>
 Добавить
 </button>
 <button onClick={()=>setAddingAcc(false)}
 style={{...sf,background:g1,border:"none",borderRadius:10,
 padding:"10px 14px",cursor:"pointer",fontSize:14,color:g4}}>
 Отмена
 </button>
 </div>
 </div>
 )}
 {canEdit && !addingAcc && (
 <button onClick={()=>setAddingAcc(true)}
 style={{...sf,width:"100%",background:"transparent",
 border:"1.5px dashed rgba(0,122,255,0.3)",borderRadius:10,
 padding:"8px",marginTop:8,cursor:"pointer",fontSize:13,color:B,fontWeight:600}} + Добавить доступ
 </button>
 )}
 </div>
 {/* Файлы */}
 <div style={{background:g1,borderRadius:14,padding:"12px 14px"}}>
 <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}> Файлы</div>
 {files.length===0 && <div style={{...sf,fontSize:13,color:g4,marginBottom:8}}>Нет фай {files.map((f,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:10,
 padding:"7px 0",borderBottom:`0.5px solid ${SEP}`}}>
 <span style={{fontSize:20}}>{f.icon}</span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:13,fontWeight:500}}>{f.name}</div>
 <div style={{...sf,fontSize:11,color:g4}}>{f.size}</div>
 </div>
 <span style={{fontSize:16,cursor:"pointer"}}> </span>
 {canEdit && (
 <button onClick={()=>{const u=[...files];u.splice(i,1);setFiles(u);setUsers(p=> style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:g4 )}
 </div>
 ))}
 {canEdit && (
 <button onClick={()=>{const f={name:"новый_файл.pdf",size:"—",icon:" "};const u=[. style={{...sf,width:"100%",background:"transparent",
 border:"1.5px dashed rgba(0,122,255,0.3)",borderRadius:10,
 padding:"8px",marginTop:8,cursor:"pointer",fontSize:13,color:B,fontWeight:600}} Прикрепить файл
 </button>
 )}
 </div>
 </div>
 );
}
// ── ЧАТ ───────────────────────────────────────────────────────────────────────
function ChatBlock({messages, setMessages, mgrId, myRole, peer, onSend}) {
 const [text, setText] = useState("");
 const [attached, setAttached]= useState(null);
 const list = messages[mgrId] || [];
 function send() {
 if (!text.trim() && !attached) return;
 const msg = {
 id: Date.now(),
 from: myRole,
 text,
 time: new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),
 files: attached ? [{name:attached}] : [],
 };
 setMessages(p => ({...p, [mgrId]: [...(p[mgrId]||[]), msg]}));
 if (onSend) onSend(); // уведомить ассистента о новом сообщении
 setText(""); setAttached(null);
 }
 return (
 <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
 {/* Имя собеседника */}
 <div style={{padding:"10px 14px",background:WH,borderBottom:`0.5px solid ${SEP}`,
 display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
 <Av u={peer} size={36}/>
 <div>
 <div style={{...sf,fontSize:14,fontWeight:700}}>{peer.name}</div>
 <div style={{...sf,fontSize:11,color:g4}}>онлайн</div>
 </div>
 </div>
 {/* Сообщения */}
 <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:" {list.length===0 && (
 <div style={{textAlign:"center",padding:"30px 0",...sf,fontSize:14,color:g4}}>Начни )}
 {list.map(m => {
 const isMe = m.from === myRole;
 return (
 <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start <div style={{maxWidth:"78%",padding:"9px 13px",
 borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
 background: isMe ? B : "#E9E9EB"}}>
 {(m.files||[]).map((f,i)=>(
 <div key={i} style={{...sf,background:isMe?"rgba(255,255,255,0.2)":"rgba(0, borderRadius:8,padding:"4px 10px",marginBottom:5,fontSize:13,
 color:isMe?"#fff":B,display:"flex",alignItems:"center",gap:5}}>
 {f.name}
 </div>
 ))}
 {m.text && (
 <div style={{...sf,fontSize:15,color:isMe?"#fff":"#000",lineHeight:1.4}}>{m )}
 <div style={{...sf,fontSize:10,marginTop:3,textAlign:"right",
 color:isMe?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.35)"}}>{m.time}</div>
 </div>
 </div>
 );
 })}
 </div>
 {/* Прикреплённый файл */}
 {attached && (
 <div style={{padding:"5px 14px",display:"flex",alignItems:"center",gap:8,
 background:WH,borderTop:`0.5px solid ${SEP}`}}>
 <span style={{...sf,background:g1,borderRadius:8,padding:"4px 10px",fontSize:12,col
 <button onClick={()=>setAttached(null)}
 style={{background:"none",border:"none",cursor:"pointer",color:g4,fontSize:16}}>✕ </div>
 )}
 {/* Ввод */}
 <div style={{display:"flex",gap:8,padding:"10px 14px 14px",
 background:WH,borderTop:`0.5px solid ${SEP}`,flexShrink:0}}>
 <button onClick={()=>setAttached("файл.pdf")}
 style={{width:40,height:40,background:g1,border:"none",borderRadius:12,
 cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"c
 </button>
 <textarea
 value={text}
 onChange={e=>setText(e.target.value)}
 onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
 placeholder="Сообщение…"
 style={{...sf,flex:1,background:g1,border:"none",borderRadius:18,
 padding:"10px 13px",fontSize:15,outline:"none",resize:"none",
 height:40,lineHeight:"20px",boxSizing:"border-box"}}
 />
 <button onClick={send}
 style={{width:40,height:40,background:B,border:"none",borderRadius:20,
 cursor:"pointer",color:"#fff",fontSize:18,display:"flex",
 alignItems:"center",justifyContent:"center",flexShrink:0}}>
 ↑
 </button>
 </div>
 </div>
 );
}
// ── ЗАДАЧИ ────────────────────────────────────────────────────────────────────
function TasksBlock({tasks, setTasks, mgrId, myRole, onNewTask}) {
 const [openId, setOpenId] = useState(null);
 const [filter, setFilter] = useState("all");
 const [adding, setAdding] = useState(false);
 const [form, setForm] = useState({title:"",desc:"",deadline:"",priority:"medium",er:" const [rateId, setRateId] = useState(null);
 const [star, setStar] = useState(0);
 const [comment, setComment] = useState("");
 const list = tasks[mgrId] || [];
 const counts = {
 all: list.filter(t=>t.status!=="done").length,
 in_progress:list.filter(t=>t.status==="in_progress").length,
 problem: list.filter(t=>t.status==="problem").length,
 done: list.filter(t=>t.status==="done").length,
 };
 const shown = filter==="all" ? list.filter(t=>t.status!=="done")
 : filter==="done" ? list.filter(t=>t.status==="done")
 : list.filter(t=>t.status===filter);
 function upd(id, patch) {
 setTasks(p => ({...p, [mgrId]: (p[mgrId]||[]).map(t => t.id===id ? {...t,...patch} : t)}) }
 function addTask() {
 if (!form.title || !form.deadline || !form.er) return;
 const t = {id:Date.now(), title:form.title, desc:form.desc, deadline:form.deadline,
 priority:form.priority, er:form.er, status:"new",
 rating:null, rc:null, saved:null, files:[]};
 setTasks(p => ({...p, [mgrId]: [...(p[mgrId]||[]), t]}));
 if (onNewTask) onNewTask();
 setForm({title:"",desc:"",deadline:"",priority:"medium",er:""});
 setAdding(false);
 }
 const filters = [["all","Активные"],["in_progress","В работе"],["problem","Помощь"],["done" return (
 <div>
 {/* Фильтры */}
 <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
 {filters.map(([k,l]) => (
 <button key={k} onClick={()=>setFilter(k)}
 style={{...sf,padding:"6px 13px",borderRadius:18,cursor:"pointer",fontSize:13,
 fontWeight:filter===k?700:500,
 background:filter===k?`${B}14`:WH,
 color:filter===k?B:g4,
 border:`1.5px solid ${filter===k?`${B}35`:"transparent"}`,
 whiteSpace:"nowrap",flexShrink:0}}>
 {l}{counts[k]>0?` (${counts[k]})`:""}
 </button>
 ))}
 </div>
 {/* Кнопка добавить (только руководитель) */}
 {myRole==="manager" && (
 <button onClick={()=>setAdding(true)}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:14,
 padding:"13px",fontSize:16,fontWeight:600,cursor:"pointer",width:"100%",
 marginBottom:12,boxShadow:"0 4px 14px rgba(0,122,255,0.3)"}}>
 + Поставить задачу
 </button>
 )}
 {shown.length===0 && (
 <div style={{textAlign:"center",padding:"40px 0"}}>
 <div style={{fontSize:44}}> </div>
 <div style={{...sf,fontSize:15,color:g4,marginTop:8}}>Задач нет</div>
 </div>
 )}
 {/* Список задач */}
 {shown.map(t => {
 const s = ST[t.status];
 const isOpen = openId===t.id;
 const prColor = t.priority==="high"?R : t.priority==="medium"?O : G;
 return (
 <div key={t.id} style={{background:WH,borderRadius:18,marginBottom:10,
 overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
 <div style={{height:3,background:prColor}}/>
 {/* Заголовок задачи */}
 <div style={{padding:"13px 15px",cursor:"pointer"}} onClick={()=>setOpenId(isOpen <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-sta <div style={{...sf,fontSize:16,fontWeight:600,flex:1,letterSpacing:-0.2}}>{t. <Chip label={s.l} icon={s.i} color={s.c} bg={s.bg} border={s.bd}/>
 </div>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"} <span style={{...sf,fontSize:12,color:g4}}> {t.deadline}</span>
 {t.rating && (
 <div style={{display:"flex",gap:1}}>
 {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:12,color:n<=t.rating?" </div>
 )}
 <span style={{...sf,fontSize:11,color:isOpen?B:g4,fontWeight:isOpen?600:400}} {isOpen?"Скрыть ▲":"Подробнее ▼"}
 </span>
 </div>
 </div>
 {/* Детали задачи */}
 {isOpen && (
 <div style={{padding:"0 15px 15px",borderTop:`0.5px solid ${SEP}`}}>
 <div style={{paddingTop:12}}>
 {t.desc && <div style={{...sf,fontSize:14,color:"#3C3C43",lineHeight:1.5,ma <div style={{background:"rgba(0,122,255,0.06)",borderRadius:10,padding:"9px <span style={{...sf,fontSize:12,color:B,fontWeight:600}}>Ожидаемый резуль <span style={{...sf,fontSize:13,color:"#3C3C43"}}>{t.er}</span>
 </div>
 <button style={{...sf,background:"none",border:`1.5px solid ${g2}`,borderRa padding:"7px 13px",fontSize:13,color:g4,cursor:"pointer",
 marginBottom:12,display:"flex",alignItems:"center",gap:5}}>
 Прикрепить файл
 </button>
 {/* Оценка — для руководителя */}
 {myRole==="manager" && t.status==="done" && (
 rateId===t.id ? (
 <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}>Оцени <div style={{display:"flex",justifyContent:"center",gap:6,marginBotto {[1,2,3,4,5].map(n=>(
 <button key={n} onClick={()=>setStar(n)}
 style={{fontSize:32,background:"none",border:"none",cursor:"poi color:n<=star?"#FF9500":"#E5E5EA",
 transform:n<=star?"scale(1.12)":"scale(1)",transition:"all .1 ))}
 </div>
 {star>0 && <div style={{...sf,fontSize:13,color:O,textAlign:"center", {[""," Плохо"," Нормально"," Хорошо"," Отлично"," Супер! </div>}
 <textarea value={comment} onChange={e=>setComment(e.target.value)}
 placeholder="Комментарий…" rows={2}
 style={{...sf,width:"100%",background:g1,border:"none",borderRadius padding:"9px 12px",fontSize:14,outline:"none",resize:"none",
 boxSizing:"border-box",marginBottom:10}}/>
 <div style={{display:"flex",gap:8}}>
 <button
 onClick={()=>{upd(t.id,{rating:star,rc:comment});setRateId(null); disabled={!star}
 style={{...sf,flex:1,background:star?O:g2,color:star?"#fff":g3,
 border:"none",borderRadius:10,padding:"11px",cursor:"pointer",f Сохранить
 </button>
 <button onClick={()=>setRateId(null)}
 style={{...sf,background:g1,border:"none",borderRadius:10,
 padding:"11px 14px",cursor:"pointer",fontSize:14,color:g4}}>
 Отмена
 </button>
 </div>
 </div>
 ) : t.rating ? (
 <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba <div style={{display:"flex",justifyContent:"space-between",alignItems <div>
 <div style={{display:"flex",gap:1,marginBottom:3}}>
 {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,color:n<= </div>
 {t.rc && <div style={{...sf,fontSize:12,color:g4,fontStyle:"itali </div>
 <button onClick={()=>{setRateId(t.id);setStar(t.rating);setComment( style={{...sf,fontSize:12,color:B,background:"none",border:"none" Изменить
 </button>
 </div>
 </div>
 ) : (
 <button onClick={()=>setRateId(t.id)}
 style={{...sf,background:"rgba(255,149,0,0.08)",border:"1.5px solid r borderRadius:10,padding:"11px",width:"100%",cursor:"pointer",fontSi Оценить работу
 </button>
 )
 )}
 {/* Оценка видна ассистенту */}
 {myRole==="assistant" && t.status==="done" && t.rating && (
 <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(2 <div style={{...sf,fontSize:12,color:g4,marginBottom:4}}>Оценка руковод <div style={{display:"flex",gap:2,marginBottom:3}}>
 {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,color:n<=t.rati </div>
 {t.rc && <div style={{...sf,fontSize:13,color:g4,fontStyle:"italic"}}>" </div>
 )}
 {/* Кнопки ассистента */}
 {myRole==="assistant" && t.status==="new" && (
 <button onClick={()=>upd(t.id,{status:"in_progress"})}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:10,
 padding:"11px",width:"100%",cursor:"pointer",fontSize:14,fontWeight:6 Взять в работу
 </button>
 )}
 {myRole==="assistant" && t.status==="in_progress" && (
 <div>
 {/* Поле результата */}
 <div style={{marginBottom:10}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>
 Результат работы
 </div>
 <textarea
 value={t.result||""}
 onChange={e=>upd(t.id,{result:e.target.value})}
 placeholder="Опиши что сделано, добавь ссылки или детали…"
 rows={3}
 style={{...sf,width:"100%",background:g1,border:"none",borderRadius padding:"11px 13px",fontSize:14,outline:"none",resize:"none",
 boxSizing:"border-box",lineHeight:1.5}}
 />
 </div>
 <div style={{display:"flex",gap:8}}>
 <button onClick={()=>upd(t.id,{status:"done"})}
 style={{...sf,flex:1,background:G,color:"#fff",border:"none",border padding:"11px",cursor:"pointer",fontSize:14,fontWeight:600}}>✓ Го <button onClick={()=>upd(t.id,{status:"problem"})}
 style={{...sf,flex:1,background:R,color:"#fff",border:"none",border padding:"11px",cursor:"pointer",fontSize:14,fontWeight:600}}> П </div>
 </div>
 )}
 {/* Результат виден всем когда задача выполнена */}
 {t.status==="done" && t.result && (
 <div style={{background:"rgba(52,199,89,0.07)",border:"1.5px solid rgba(5 borderRadius:12,padding:"11px 13px",marginTop:8}}>
 <div style={{...sf,fontSize:11,color:G,fontWeight:700,
 textTransform:"uppercase",letterSpacing:0.4,marginBottom:5}}>
 Результат ассистента
 </div>
 <div style={{...sf,fontSize:14,color:"#000",lineHeight:1.5}}>{t.result} </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
 })}
 {/* Форма новой задачи */}
 {adding && (
 <div style={{background:WH,borderRadius:18,padding:16,boxShadow:"0 2px 16px rgba(0,0, <div style={{...sf,fontSize:17,fontWeight:700,marginBottom:14}}>Новая задача</div>
 {[["Задача *","title","Что нужно сделать?"],["Ожидаемый результат *","er","Что долж <div key={k} style={{marginBottom:10}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} plac style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
 padding:"11px 13px",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
 </div>
 ))}
 <div style={{marginBottom:10}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}
 placeholder="Дополнительная информация…" rows={2}
 style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
 padding:"11px 13px",fontSize:14,outline:"none",resize:"none",boxSizing:"borde </div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
 <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
 padding:"11px 10px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
 </div>
 <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase <div style={{display:"flex",gap:5}}>
 {[["low"," "],["medium"," "],["high"," "]].map(([p,ic])=>(
 <button key={p} onClick={()=>setForm({...form,priority:p})}
 style={{flex:1,background:form.priority===p?`${PR[p].c}15`:g1,
 border:`1.5px solid ${form.priority===p?PR[p].c:"transparent"}`,
 borderRadius:10,padding:"9px 4px",cursor:"pointer",fontSize:18,textAlig {ic}
 </button>
 ))}
 </div>
 </div>
 </div>
 <button style={{...sf,background:"none",border:`1.5px solid ${g2}`,borderRadius:10,
 padding:"7px 13px",fontSize:13,color:g4,cursor:"pointer",
 marginBottom:12,display:"flex",alignItems:"center",gap:5}}>
 Прикрепить файл
 </button>
 <div style={{display:"flex",gap:8}}>
 <button onClick={addTask}
 disabled={!form.title||!form.deadline||!form.er}
 style={{...sf,flex:1,
 background:(!form.title||!form.deadline||!form.er)?g2:B,
 color:(!form.title||!form.deadline||!form.er)?g3:"#fff",
 border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:600,curso Поставить задачу
 </button>
 <button onClick={()=>setAdding(false)}
 style={{...sf,background:g1,border:"none",borderRadius:12,
 padding:"13px 16px",fontSize:15,fontWeight:600,cursor:"pointer",color:g4}}>
 Отмена
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
// ── ИТОГИ НЕДЕЛИ ─────────────────────────────────────────────────────────────
function WeeklyReport({tasks, weekSaved, mgrName}) {
 const [sent, setSent] = useState(false);
 const hrs = Math.floor(weekSaved/60);
 const mins = weekSaved % 60;
 const savedStr = weekSaved===0 ? "" : hrs>0 ? `${hrs} ч ${mins>0?mins+" мин":""}` : `${mins if (sent) {
 return (
 <div style={{background:"rgba(52,199,89,0.08)",border:"1.5px solid rgba(52,199,89,0.25) borderRadius:18,padding:"16px 18px",marginBottom:14,textAlign:"center"}}>
 <div style={{fontSize:32,marginBottom:6}}> </div>
 <div style={{...sf,fontSize:15,fontWeight:700,color:G,marginBottom:3}}>Отчёт отправле <div style={{...sf,fontSize:13,color:g4}}>Клиент получил итоги недели</div>
 </div>
 );
 }
 return (
 <div style={{background:WH,borderRadius:18,overflow:"hidden",
 boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:14}}>
 <div style={{background:"linear-gradient(135deg,rgba(52,199,89,0.12),rgba(52,199,89,0.0 padding:"14px 16px",borderBottom:`0.5px solid rgba(52,199,89,0.2)`}}>
 <div style={{display:"flex",alignItems:"center",gap:8}}>
 <span style={{fontSize:20}}> </span>
 <div style={{...sf,fontSize:15,fontWeight:700}}>Итоги этой недели</div>
 <div style={{marginLeft:"auto",background:"rgba(52,199,89,0.15)",borderRadius:8,
 padding:"3px 9px",...sf,fontSize:11,color:G,fontWeight:700}}>
 {tasks.length} задач
 </div>
 </div>
 </div>
 <div style={{padding:"12px 16px"}}>
 {/* Список выполненных задач */}
 {tasks.slice(0,4).map((t,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",
 borderBottom:i<Math.min(tasks.length,4)-1?`0.5px solid ${SEP}`:"none"}}>
 <span style={{fontSize:14,color:G}}>✓</span>
 <div style={{flex:1,...sf,fontSize:13,color:"#000",lineHeight:1.3}}>{t.title}</di {t.saved && <span style={{...sf,fontSize:11,color:g4,flexShrink:0}}>{fmtMin(t.sav </div>
 ))}
 {tasks.length > 4 && (
 <div style={{...sf,fontSize:12,color:g4,padding:"6px 0"}}>+{tasks.length-4} ещё…</d )}
 {/* Итоговая строка */}
 {weekSaved > 0 && (
 <div style={{background:"rgba(52,199,89,0.07)",borderRadius:12,padding:"10px 12px", display:"flex",alignItems:"center",gap:10}}>
 <span style={{fontSize:20}}> </span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:12,color:g4}}>Сэкономлено за неделю</div>
 <div style={{...sf,fontSize:16,fontWeight:700,color:G}}>{savedStr}</div>
 </div>
 </div>
 )}
 {/* Кнопка отправить клиенту */}
 <button onClick={()=>setSent(true)}
 style={{...sf,background:G,color:"#fff",border:"none",borderRadius:14,
 padding:"13px",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",
 marginTop:12,boxShadow:"0 4px 14px rgba(52,199,89,0.35)"}}>
 Отправить итоги клиенту
 </button>
 </div>
 </div>
 );
}
// ── ИТОГИ НЕДЕЛИ (вид клиента) ────────────────────────────────────────────────
function WeeklyReportClient({tasks, totalSaved}) {
 const [dismissed, setDismissed] = useState(false);
 if (dismissed || tasks.filter(t=>t.status==="done").length===0) return null;
 const done = tasks.filter(t=>t.status==="done");
 const weekTasks = done.slice(-5);
 const weekSaved = weekTasks.reduce((s,t)=>s+(t.saved||0),0);
 const hrs = Math.floor(weekSaved/60);
 const mins = weekSaved%60;
 const savedStr = weekSaved===0?"":hrs>0?`${hrs} ч ${mins>0?mins+" мин":""}`:`${mins} мин`;
 return (
 <div style={{background:"linear-gradient(135deg,rgba(52,199,89,0.10),rgba(0,122,255,0.06) border:"1.5px solid rgba(52,199,89,0.25)",borderRadius:20,padding:"16px 18px",marginBot
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBo <div style={{display:"flex",alignItems:"center",gap:8}}>
 <span style={{fontSize:22}}> </span>
 <div style={{...sf,fontSize:15,fontWeight:700}}>Итоги недели от ассистента</div>
 </div>
 <button onClick={()=>setDismissed(true)}
 style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:g4}}>✕</ </div>
 <div style={{display:"flex",gap:10,marginBottom:12}}>
 <div style={{flex:1,background:WH,borderRadius:14,padding:"12px",textAlign:"center",
 boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
 <div style={{...sf,fontSize:28,fontWeight:800,color:B,letterSpacing:-1}}>{weekTasks <div style={{...sf,fontSize:11,color:g4,marginTop:2}}>задач\nвыполнено</div>
 </div>
 {weekSaved>0 && <div style={{flex:1,background:WH,borderRadius:14,padding:"12px",text boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
 <div style={{...sf,fontSize:weekSaved>=60?24:28,fontWeight:800,color:G,letterSpacin <div style={{...sf,fontSize:11,color:g4,marginTop:2}}>сэкономлено</div>
 </div>}
 </div>
 {weekTasks.map((t,i)=>(
 <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",
 borderBottom:i<weekTasks.length-1?`0.5px solid ${SEP}`:"none"}}>
 <span style={{color:G,fontSize:13}}>✓</span>
 <span style={{...sf,fontSize:13,flex:1}}>{t.title}</span>
 {t.rating && <div style={{display:"flex",gap:1}}>
 {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:10,color:n<=t.rating?"#FF9500" </div>}
 </div>
 ))}
 </div>
 );
}
// ── АДМИН-ПАНЕЛЬ ─────────────────────────────────────────────────────────────
const COLORS_LIST = ["#007AFF","#34C759","#FF9500","#AF52DE","#FF2D55","#5AC8FA","#FF6B35","#function AdminPanel({users, setUsers, tasks}) {
 const [tab, setTab] = useState("clients");
 const [modal, setModal] = useState(null); // "add_client"|"edit_client"|"add_ast"|"edit_a const [sel, setSel] = useState(null);
 const [form, setForm] = useState({});
 const [copied, setCopied] = useState(null);
 const assistants = users.filter(u => u.role==="assistant");
 const managers = users.filter(u => u.role==="manager");
 // ── helpers ──
 function genInitials(name) {
 return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");
 }
 function openAddClient() {
 setForm({name:"",login:"",pw:"",color:COLORS_LIST[0],astId:assistants[0]?.id||"",subDays: setSel(null); setModal("edit_client");
 }
 function openEditClient(u) {
 setForm({name:u.name,login:u.login,pw:u.pw,color:u.color,astId:u.astId||"",subDays:String setSel(u); setModal("edit_client");
 }
 function saveClient() {
 if (!form.name||!form.login||!form.pw) return;
 const initials = genInitials(form.name);
 const sub = parseInt(form.subDays)||30;
 if (sel) {
 // переназначение ассистента
 if (form.astId !== sel.astId) {
 setUsers(p => p.map(u => {
 if (u.id===sel.astId) return {...u, clients:(u.clients||[]).filter(c=>c!==sel.id)};
 if (u.id===form.astId) return {...u, clients:[...(u.clients||[]), sel.id]};
 return u;
 }));
 }
 setUsers(p => p.map(u => u.id===sel.id ? {...u,...form,initials,subDays:sub} : u));
 } else {
 const id = "mgr"+Date.now();
 const nu = {id,role:"manager",initials,...form,subDays:sub,
 info:"",about:"",likes:"",dislikes:"",accesses:[],files:[]};
 setUsers(p => [...p, nu]);
 if (form.astId) setUsers(p => p.map(u => u.id===form.astId ? {...u,clients:[...(u.clien }
 setModal(null);
 }
 function openAddAst() {
 setForm({name:"",login:"",pw:"",color:COLORS_LIST[1]});
 setSel(null); setModal("edit_ast");
 }
 function openEditAst(u) {
 setForm({name:u.name,login:u.login,pw:u.pw,color:u.color});
 setSel(u); setModal("edit_ast");
 }
 function saveAst() {
 if (!form.name||!form.login||!form.pw) return;
 const initials = genInitials(form.name);
 if (sel) {
 setUsers(p => p.map(u => u.id===sel.id ? {...u,...form,initials} : u));
 } else {
 const id = "ast"+Date.now();
 setUsers(p => [...p, {id,role:"assistant",initials,...form,clients:[],active:true}]);
 }
 setModal(null);
 }
 function reassign(mgrId, newAstId) {
 const mgr = users.find(u=>u.id===mgrId);
 if (!mgr || mgr.astId===newAstId) return;
 setUsers(p => p.map(u => {
 if (u.id===mgr.astId) return {...u, clients:(u.clients||[]).filter(c=>c!==mgrId)};
 if (u.id===newAstId) return {...u, clients:[...(u.clients||[]), mgrId]};
 return u;
 }));
 setUsers(p => p.map(u => u.id===mgrId ? {...u,astId:newAstId} : u));
 }
 function toggleActive(id) {
 setUsers(p => p.map(u => u.id===id ? {...u,active:u.active===false} : u));
 }
 function copyCredentials(u) {
 setCopied(u.id);
 setTimeout(()=>setCopied(null), 2000);
 }
 // КПИ
 function kpi(ast) {
 const allTasks = managers.filter(m=>m.astId===ast.id).flatMap(m=>tasks[m.id]||[]);
 const rated = allTasks.filter(t=>t.rating);
 const byStars = [5,4,3,2,1].map(s=>({s, n:rated.filter(t=>t.rating===s).length}));
 const avg = rated.length ? (rated.reduce((a,t)=>a+t.rating,0)/rated.length).toFixed(1) :  return {rated, byStars, avg, total:allTasks.length};
 }
 // ── Notifications ──
 const allTasks = Object.values(tasks).flat();
 const notifs = [
 ...managers.filter(m=>m.subDays<=7).map(m=>({text:` Подписка заканчивается: ${m.name}  ...allTasks.filter(t=>t.status==="problem").slice(0,2).map(t=>({text:` Нужна помощь: «$ ...managers.filter(m=>{
 const ast=users.find(u=>u.id===m.astId);
 return !ast;
 }).map(m=>({text:` Нет ассистента: ${m.name}`, c:R})),
 ];
 // ── INPUT style ──
 const inp = {...sf,width:"100%",background:g1,border:"none",borderRadius:12,
 padding:"12px 14px",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12};
 const TABS_ADM = [["clients"," Клиенты"],["assistants"," Ассистенты"],["kpi"," КПИ"] return (
 <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
 {/* Вкладки */}
 <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",flexShrink: {TABS_ADM.map(([k,l])=>(
 <button key={k} onClick={()=>setTab(k)}
 style={{...sf,flex:1,background:"transparent",border:"none",
 borderBottom:tab===k?`2.5px solid ${B}`:"2.5px solid transparent",
 padding:"11px 4px",cursor:"pointer",color:tab===k?B:g4,
 fontWeight:tab===k?700:500,fontSize:13}}>
 {l}{k==="notif"&&notifs.length>0?` (${notifs.length})`:""}
 </button>
 ))}
 </div>
 <div style={{flex:1,overflowY:"auto",padding:14}}>
 {/* ── КЛИЕНТЫ ── */}
 {tab==="clients" && <>
 <button onClick={openAddClient}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:14,
 padding:"13px",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",
 marginBottom:14,boxShadow:"0 4px 14px rgba(0,122,255,0.3)"}}>
 + Добавить клиента
 </button>
 {managers.map(mgr => {
 const ast = users.find(u=>u.id===mgr.astId);
 return (
 <div key={mgr.id} style={{background:WH,borderRadius:18,marginBottom:12,
 overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
 <div style={{height:3,background:mgr.color}}/>
 <div style={{padding:"14px 16px"}}>
 {/* Шапка */}
 <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
 <Av u={mgr} size={44}/>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:16,fontWeight:700}}>{mgr.name}</div>
 <div style={{...sf,fontSize:12,color:g4}}>
 {ast ? <span style={{color:ast.color,fontWeight:600}}> {ast.name}</ {" · "}<span style={{color:mgr.subDays<=7?R:mgr.subDays<=14?O:G,fontW </div>
 </div>
 <button onClick={()=>openEditClient(mgr)}
 style={{...sf,background:g1,border:"none",borderRadius:10,
 padding:"6px 12px",cursor:"pointer",fontSize:13,color:B,fontWeight:60 Изменить
 </button>
 </div>
 {/* Назначить ассистента */}
 {assistants.length>0 && (
 <div style={{marginBottom:12}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.4,marginBottom:7}}>
 Назначить ассистента
 </div>
 <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
 {assistants.map(a=>(
 <button key={a.id} onClick={()=>reassign(mgr.id,a.id)}
 style={{...sf,background:mgr.astId===a.id?`${a.color}14`:g1,
 border:`1.5px solid ${mgr.astId===a.id?a.color:"transparent"}`,
 borderRadius:12,padding:"7px 14px",cursor:"pointer",fontSize:13 color:mgr.astId===a.id?a.color:g4,fontWeight:mgr.astId===a.id?7 {a.name.split(" ")[0]}
 {mgr.astId===a.id && " ✓"}
 </button>
 ))}
 </div>
 </div>
 )}
 {/* Логин/пароль */}
 <div style={{background:g1,borderRadius:12,padding:"10px 14px"}}>
 <div style={{display:"flex",justifyContent:"space-between",marginBottom:8 <span style={{...sf,fontSize:13}}><span style={{color:g4}}>Логин: </spa <span style={{...sf,fontSize:13}}><span style={{color:g4}}>Пароль: </sp </div>
 <button onClick={()=>copyCredentials(mgr)}
 style={{...sf,background:copied===mgr.id?G:B,color:"#fff",border:"none" borderRadius:10,padding:"9px",cursor:"pointer",fontSize:13,
 fontWeight:600,width:"100%",transition:"background .2s"}}>
 {copied===mgr.id?"✓ Скопировано!":" Скопировать и отправить"}
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </>}
 {/* ── АССИСТЕНТЫ ── */}
 {tab==="assistants" && <>
 <button onClick={openAddAst}
 style={{...sf,background:B,color:"#fff",border:"none",borderRadius:14,
 padding:"13px",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",
 marginBottom:14,boxShadow:"0 4px 14px rgba(0,122,255,0.3)"}}>
 + Добавить ассистента
 </button>
 {assistants.map(ast => {
 const clients = managers.filter(m=>m.astId===ast.id);
 const isActive = ast.active !== false;
 return (
 <div key={ast.id} style={{background:WH,borderRadius:18,marginBottom:12,
 overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",opacity:isActive?1:0 <div style={{height:3,background:isActive?ast.color:g3}}/>
 <div style={{padding:"14px 16px"}}>
 <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
 <Av u={ast} size={44}/>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:16,fontWeight:700}}>
 {ast.name}
 {!isActive && <span style={{...sf,fontSize:11,color:R,marginLeft:8,fo </div>
 <div style={{...sf,fontSize:12,color:g4}}>{clients.length} клиентов</di </div>
 <button onClick={()=>openEditAst(ast)}
 style={{...sf,background:g1,border:"none",borderRadius:10,
 padding:"6px 12px",cursor:"pointer",fontSize:13,color:B,fontWeight:60 Изменить
 </button>
 </div>
 {/* Клиенты ассистента */}
 {clients.length>0 && (
 <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
 {clients.map(c=>(
 <span key={c.id} style={{...sf,background:`${c.color}12`,
 border:`1.5px solid ${c.color}25`,borderRadius:10,
 padding:"3px 10px",fontSize:12,color:c.color,fontWeight:600}}>
 {c.name.split(" ")[0]}
 </span>
 ))}
 </div>
 )}
 <div style={{display:"flex",gap:8}}>
 <button onClick={()=>copyCredentials(ast)}
 style={{...sf,flex:1,background:copied===ast.id?G:g1,
 color:copied===ast.id?"#fff":B,border:"none",borderRadius:10,
 padding:"9px",cursor:"pointer",fontSize:13,fontWeight:600,transition: {copied===ast.id?"✓ Скопировано":" Данные для входа"}
 </button>
 <button onClick={()=>toggleActive(ast.id)}
 style={{...sf,background:isActive?"rgba(255,59,48,0.08)":"rgba(52,199,8 color:isActive?R:G,border:"none",borderRadius:10,
 padding:"9px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
 {isActive?"Деактив.":"Активировать"}
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </>}
 {/* ── КПИ ── */}
 {tab==="kpi" && <>
 <div style={{...sf,fontSize:13,color:g4,marginBottom:14,lineHeight:1.5}}>
 Рейтинг ассистентов по оценкам руководителей (★ 1–5)
 </div>
 {assistants.map(ast => {
 const {rated, byStars, avg, total} = kpi(ast);
 const isActive = ast.active !== false;
 return (
 <div key={ast.id} style={{background:WH,borderRadius:18,marginBottom:12,
 overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
 <div style={{height:3,background:isActive?ast.color:g3}}/>
 <div style={{padding:"16px 18px"}}>
 <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
 <Av u={ast} size={44}/>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:16,fontWeight:700}}>{ast.name}</div>
 <div style={{...sf,fontSize:12,color:g4}}>{total} задач · {rated.length </div>
 <div style={{textAlign:"right"}}>
 <div style={{...sf,fontSize:22,fontWeight:700,color:O}}>
 {avg ? `★ ${avg}` : "—"}
 </div>
 <div style={{...sf,fontSize:10,color:g4}}>средняя</div>
 </div>
 </div>
 {rated.length===0
 ? <div style={{...sf,fontSize:13,color:g4,textAlign:"center",padding:"8px : <div style={{background:g1,borderRadius:12,padding:"10px 12px"}}>
 {byStars.map(({s,n})=>{
 const pct = rated.length ? Math.round(n/rated.length*100) : 0;
 const icon=[""," "," "," "," "," "][s];
 return (
 <div key={s} style={{display:"flex",alignItems:"center",gap:8,pad <span style={{fontSize:14,width:20}}>{icon}</span>
 <div style={{display:"flex",gap:1,width:60}}>
 {[1,2,3,4,5].map(x=><span key={x} style={{fontSize:10,color:x </div>
 <div style={{flex:1,background:g2,borderRadius:4,height:5,overf <div style={{height:"100%",width:`${pct}%`,background:"#FF950 </div>
 <span style={{...sf,fontSize:12,color:g4,width:14,textAlign:"ri </div>
 );
 })}
 </div>
 }
 </div>
 </div>
 );
 })}
 </>}
 {/* ── УВЕДОМЛЕНИЯ ── */}
 {tab==="notif" && <>
 <div style={{...sf,fontSize:13,color:g4,marginBottom:14}}>Требуют внимания</div>
 {notifs.length===0
 ? <div style={{textAlign:"center",padding:"40px 0"}}>
 <div style={{fontSize:44}}> </div>
 <div style={{...sf,fontSize:15,color:g4,marginTop:8}}>Всё в порядке</div>
 </div>
 : notifs.map((n,i)=>(
 <div key={i} style={{background:WH,borderRadius:14,padding:"13px 16px",margin borderLeft:`3px solid ${n.c}`,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
 <div style={{...sf,fontSize:14,color:"#000",lineHeight:1.4}}>{n.text}</div>
 </div>
 ))
 }
 {/* Сводная статистика */}
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",
 letterSpacing:0.4,marginTop:16,marginBottom:10}}>Общая статистика</div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
 {[
 {v:managers.length, l:"Клиентов", c:B, bg:`${B}0e`, i:" "},
 {v:assistants.length, l:"Ассистентов",c:G, bg:`${G}0e`, i:" "},
 {v:Object.values(tasks).flat().length, l:"Всего задач",c:O, bg:`${O}0e`, i:" " {v:Object.values(tasks).flat().filter(t=>t.status==="done").length, l:"Выполнен ].map((m,i)=>(
 <div key={i} style={{background:m.bg,borderRadius:14,padding:"12px",display:"fl <span style={{fontSize:22}}>{m.i}</span>
 <div><div style={{...sf,fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div><di </div>
 ))}
 </div>
 </>}
 </div>
 {/* ── МОДАЛКА: клиент ── */}
 {(modal==="edit_client") && (
 <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
 display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
 <div style={{background:WH,borderRadius:"24px 24px 0 0",padding:"12px 22px 44px",
 width:370,maxHeight:"90vh",overflowY:"auto"}}>
 <div style={{width:40,height:4,background:g2,borderRadius:2,margin:"10px auto 20p <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:18}}>
 {sel?"Изменить клиента":"Новый клиент"}
 </div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} pla <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:0}} <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"upperca <input value={form.login} onChange={e=>setForm({...form,login:e.target.value. </div>
 <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"upperca <input value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} pla </div>
 </div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <input type="number" value={form.subDays} onChange={e=>setForm({...form,subDays:e {assistants.length>0 && <>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
 {assistants.map(a=>(
 <button key={a.id} onClick={()=>setForm({...form,astId:a.id})}
 style={{...sf,background:form.astId===a.id?`${a.color}14`:g1,
 border:`1.5px solid ${form.astId===a.id?a.color:"transparent"}`,
 borderRadius:12,padding:"8px 16px",cursor:"pointer",fontSize:14,
 color:form.astId===a.id?a.color:"#000",fontWeight:form.astId===a.id?700 {a.name}
 </button>
 ))}
 </div>
 </>}
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <div style={{display:"flex",gap:10,marginBottom:22}}>
 {COLORS_LIST.map(col=>(
 <button key={col} onClick={()=>setForm({...form,color:col})}
 style={{width:34,height:34,borderRadius:"50%",background:col,border:"none", boxShadow:form.color===col?`0 0 0 3px white, 0 0 0 5px ${col}`:"none",tra ))}
 </div>
 <div style={{display:"flex",gap:10}}>
 <button onClick={saveClient} disabled={!form.name||!form.login||!form.pw}
 style={{...sf,flex:1,background:(!form.name||!form.login||!form.pw)?g2:B,
 color:(!form.name||!form.login||!form.pw)?g3:"#fff",border:"none",borderRad padding:"14px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
 {sel?"Сохранить":"Создать"}
 </button>
 <button onClick={()=>setModal(null)}
 style={{...sf,background:g1,border:"none",borderRadius:14,padding:"14px 18px" fontSize:15,fontWeight:600,cursor:"pointer",color:g4}}>
 Отмена
 </button>
 </div>
 </div>
 </div>
 )}
 {/* ── МОДАЛКА: ассистент ── */}
 {(modal==="edit_ast") && (
 <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
 display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
 <div style={{background:WH,borderRadius:"24px 24px 0 0",padding:"12px 22px 44px",
 width:370,maxHeight:"85vh",overflowY:"auto"}}>
 <div style={{width:40,height:4,background:g2,borderRadius:2,margin:"10px auto 20p <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:18}}>
 {sel?"Изменить ассистента":"Новый ассистент"}
 </div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} pla <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"upperca <input value={form.login} onChange={e=>setForm({...form,login:e.target.value. </div>
 <div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"upperca <input value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} pla </div>
 </div>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase", <div style={{display:"flex",gap:10,marginBottom:22}}>
 {COLORS_LIST.map(col=>(
 <button key={col} onClick={()=>setForm({...form,color:col})}
 style={{width:34,height:34,borderRadius:"50%",background:col,border:"none", boxShadow:form.color===col?`0 0 0 3px white, 0 0 0 5px ${col}`:"none",tra ))}
 </div>
 <div style={{display:"flex",gap:10}}>
 <button onClick={saveAst} disabled={!form.name||!form.login||!form.pw}
 style={{...sf,flex:1,background:(!form.name||!form.login||!form.pw)?g2:B,
 color:(!form.name||!form.login||!form.pw)?g3:"#fff",border:"none",borderRad padding:"14px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
 {sel?"Сохранить":"Создать"}
 </button>
 <button onClick={()=>setModal(null)}
 style={{...sf,background:g1,border:"none",borderRadius:14,padding:"14px 18px" fontSize:15,fontWeight:600,cursor:"pointer",color:g4}}>
 Отмена
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
// ── ГЛАВНОЕ ПРИЛОЖЕНИЕ ────────────────────────────────────────────────────────
export default function App() {
 const [users, setUsersState] = useState(USERS);
 const [tasks, setTasks] = useState(INIT_TASKS);
 const [msgs, setMsgs] = useState(INIT_MSGS);
 const [events, setEvents] = useState(INIT_EVENTS);
 const [me, setMe] = useState(null);
 const [tab, setTab] = useState("home");
 const [curMgr, setCurMgr] = useState(null);
 const [chatMgr, setChatMgr] = useState(null);
 const [acknowledged, setAcknowledged]= useState({});
 // unreadMsgs: {mgrId: true} — есть непрочитанные от клиента
 // newTasks: {mgrId: count} — новые задачи ожидают ассистента
 const [unreadMsgs, setUnreadMsgs] = useState({});
 const [newTasksNotif,setNewTasksNotif]= useState({mgr1:1, mgr3:1}); // демо: у mgr1 и mgr3  const setUsers = fn => setUsersState(p => fn(p));
 function doLogin(u) {
 setMe(u); setTab("home");
 if (u.role==="assistant") {
 const first = (u.clients||[])[0] || null;
 setCurMgr(first); setChatMgr(first);
 }
 }
 function doLogout() { setMe(null); }
 // ── Не залогинен — показываем экран входа ────────────────────────────────
 if (!me) {
 return (
 <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center", <div style={{width:390,height:844,borderRadius:52,overflow:"hidden",
 border:"10px solid #3A3A3C",boxShadow:"0 40px 100px rgba(0,0,0,0.6)"}}>
 <LoginScreen onLogin={doLogin} users={users}/>
 </div>
 </div>
 );
 }
 // ── Залогинен ─────────────────────────────────────────────────────────────
 const isAdmin = me.role==="admin";
 const isMgr = me.role==="manager";
 const isAst = me.role==="assistant";
 const astClients = isAst ? users.filter(u => u.role==="manager" && (me.clients||[]).include const activeMgrId = isMgr ? me.id : curMgr;
 const activeChatId = isMgr ? me.id : chatMgr;
 const activeMgrObj = users.find(u => u.id===activeMgrId) || null;
 const activeChatObj = users.find(u => u.id===activeChatId) || null;
 // Для чата: у руководителя собеседник — его ассистент
 const mgrPeer = isMgr ? users.find(u => u.id===me.astId) || null : null;
 const roleColor = isMgr?B : isAst?G : R;
 const roleLabel = isMgr?` ${me.name}` : isAst?` ${me.name}` : " Администратор";
 // Клиент видит 4 вкладки включая профиль, ассистент — 3
 const TABS = isMgr
 ? [{k:"home",i:" ",l:"Главная"},{k:"tasks",i:" ",l:"Задачи"},{k:"chat",i:" ",l:"Чат"} : [{k:"home",i:" ",l:"Главная"},{k:"tasks",i:" ",l:"Задачи"},{k:"chat",i:" ",l:"Чат"} return (
 <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",ba <div style={{width:390,height:844,borderRadius:52,overflow:"hidden",
 border:"10px solid #3A3A3C",boxShadow:"0 40px 100px rgba(0,0,0,0.6)",
 display:"flex",flexDirection:"column",background:BG,position:"relative"}}>
 {/* Нотч */}
 <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
 width:130,height:28,background:"#3A3A3C",borderRadius:"0 0 18px 18px",zIndex:30}}/>
 {/* Хэдер */}
 <div style={{background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",
 borderBottom:`0.5px solid ${SEP}`,padding:"38px 18px 12px",
 display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:20}}>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:17,fontWeight:700,letterSpacing:-0.3}}>
 {isAdmin?"Управление" : tab==="home"?"Главная" : tab==="tasks"?"Задачи" : tab== </div>
 <div style={{...sf,fontSize:12,color:roleColor,fontWeight:500}}>{roleLabel}</div>
 </div>
 {!isAdmin && <div style={{...sf,fontSize:12,fontWeight:600,color:g4,background:g1,b <button onClick={doLogout}
 style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color: Выйти
 </button>
 </div>
 {/* Вкладки клиентов у ассистента (главная + задачи) */}
 {isAst && tab!=="chat" && astClients.length>0 && (
 <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",overflo {astClients.map(c => {
 const nw = (tasks[c.id]||[]).filter(t=>t.status==="new").length;
 const pr = (tasks[c.id]||[]).filter(t=>t.status==="problem").length;
 return (
 <button key={c.id} onClick={()=>setCurMgr(c.id)}
 style={{...sf,background:"transparent",border:"none",
 borderBottom: curMgr===c.id?`2.5px solid ${c.color}`:"2.5px solid transpa padding:"10px 14px",cursor:"pointer",color:curMgr===c.id?c.color:g4,
 fontWeight:curMgr===c.id?700:400,fontSize:14,
 display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0 {c.name.split(" ")[0]}
 {nw>0 && <span style={{background:B,color:"#fff",borderRadius:8,padding:"1p {pr>0 && <span style={{background:R,color:"#fff",borderRadius:8,padding:"1p </button>
 );
 })}
 </div>
 )}
 {/* Контент */}
 <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
 {/* ── АДМИН ── */}
 {isAdmin && <AdminPanel users={users} setUsers={setUsers} tasks={tasks}/>}
 {/* ── КЛИЕНТ / АССИСТЕНТ — ГЛАВНАЯ ── */}
 {!isAdmin && tab==="home" && (
 <div style={{padding:16}}>
 {/* ══ КЛИЕНТ: упрощённая главная ══ */}
 {isMgr && (() => {
 const mgrTasks = tasks[me.id] || [];
 const totalSaved = mgrTasks.reduce((s,t)=>s+(t.saved||0),0);
 const hrs = Math.floor(totalSaved/60);
 const mins = totalSaved % 60;
 const doneCnt = mgrTasks.filter(t=>t.status==="done").length;
 const activeTasks= mgrTasks.filter(t=>t.status==="in_progress"||t.status==="n const nextEvent = (events[me.id]||[]).sort((a,b)=>a.date>b.date?1:-1)[0];
 return (
 <div>
 {/* ГЕРОЙ — экономия */}
 <div style={{background:"linear-gradient(135deg,#007AFF,#0051D5)",borderR padding:"22px 20px",marginBottom:14,boxShadow:"0 8px 28px rgba(0,122,25 position:"relative",overflow:"hidden"}}>
 <div style={{position:"absolute",top:-20,right:-20,width:100,height:100 borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
 <div style={{position:"absolute",bottom:-30,right:20,width:70,height:70 borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
 <div style={{...sf,fontSize:12,color:"rgba(255,255,255,0.7)",
 fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBott Сэкономлено вашего времени
 </div>
 {totalSaved===0
 ? <div style={{...sf,fontSize:32,fontWeight:800,color:"#fff",letterSp Первые задачи…
 </div>
 : <div style={{marginBottom:4}}>
 {hrs>0 && <span style={{...sf,fontSize:52,fontWeight:800,color:"# {hrs>0 && <span style={{...sf,fontSize:22,color:"rgba(255,255,255 {mins>0 && <span style={{...sf,fontSize:hrs>0?36:52,fontWeight:80 {mins>0 && <span style={{...sf,fontSize:22,color:"rgba(255,255,25 </div>
 }
 <div style={{...sf,fontSize:13,color:"rgba(255,255,255,0.6)"}}>
 за всё время · {doneCnt} задач выполнено
 </div>
 </div>
 {/* Активные задачи — что сейчас делает ассистент */}
 <div style={{background:WH,borderRadius:18,padding:"14px 16px",marginBott boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"
 <div style={{...sf,fontSize:15,fontWeight:700}}> Сейчас в работе</d <button onClick={()=>setTab("tasks")}
 style={{...sf,background:`${B}10`,border:"none",borderRadius:10,
 padding:"5px 12px",cursor:"pointer",fontSize:12,color:B,fontWeigh Все задачи →
 </button>
 </div>
 {activeTasks.length===0
 ? <div style={{...sf,fontSize:14,color:g4,textAlign:"center",padding: Нет активных задач
 </div>
 : activeTasks.slice(0,3).map((t,i)=>{
 const s=ST[t.status];
 return (
 <div key={i} style={{display:"flex",alignItems:"center",gap:10,
 padding:"9px 0",borderBottom:i<Math.min(activeTasks.length,3) <div style={{width:36,height:36,borderRadius:10,
 background:s.bg,border:`1.5px solid ${s.bd}`,
 display:"flex",alignItems:"center",justifyContent:"center",
 fontSize:16,flexShrink:0}}>
 {s.i}
 </div>
 <div style={{flex:1,minWidth:0}}>
 <div style={{...sf,fontSize:14,fontWeight:600,
 overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"now {t.title}
 </div>
 <div style={{...sf,fontSize:11,color:g4}}>до {t.deadline}</ </div>
 <div style={{...sf,fontSize:11,fontWeight:600,color:s.c,flexS </div>
 );
 })
 }
 </div>
 {/* Ближайшее событие */}
 {nextEvent && (() => {
 const et = EVT[nextEvent.type]||EVT.meeting;
 return (
 <div style={{background:WH,borderRadius:18,padding:"14px 16px",margin boxShadow:"0 1px 8px rgba(0,0,0,0.06)",
 borderLeft:`4px solid ${et.c}`}}>
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>
 Ближайшее событие
 </div>
 <div style={{display:"flex",alignItems:"center",gap:10}}>
 <span style={{fontSize:24}}>{et.i}</span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:15,fontWeight:700}}>{nextEvent.titl <div style={{...sf,fontSize:12,color:g4}}>{nextEvent.date} · {n </div>
 <button onClick={()=>setTab("home_cal")}
 style={{...sf,background:`${et.c}12`,border:"none",borderRadius padding:"6px 12px",cursor:"pointer",fontSize:12,color:et.c,fo Календарь
 </button>
 </div>
 </div>
 );
 })()}
 {/* Подписка — только если скоро истекает */}
 {me.subDays <= 14 && (
 <div style={{background:me.subDays<=7?"rgba(255,59,48,0.08)":"rgba(255, border:`1.5px solid ${me.subDays<=7?"rgba(255,59,48,0.25)":"rgba(255, borderRadius:16,padding:"13px 16px",marginBottom:14,
 display:"flex",alignItems:"center",gap:12}}>
 <span style={{fontSize:22}}>{me.subDays<=7?" ":" "}</span>
 <div style={{flex:1}}>
 <div style={{...sf,fontSize:14,fontWeight:700,
 color:me.subDays<=7?R:O}}>
 {me.subDays<=7?"Подписка заканчивается!":"Подписка скоро закончит </div>
 <div style={{...sf,fontSize:12,color:g4}}>Осталось {me.subDays} дне </div>
 </div>
 )}
 </div>
 );
 })()}
 {/* Отчёт недели — АССИСТЕНТ может отправить клиенту */}
 {isAst && activeMgrId && (() => {
 const mgrTasks = tasks[activeMgrId] || [];
 const weekTasks = mgrTasks.filter(t=>t.status==="done").slice(-5);
 const weekSaved = weekTasks.reduce((s,t)=>s+(t.saved||0),0);
 return weekTasks.length > 0
 ? <WeeklyReport tasks={weekTasks} weekSaved={weekSaved} mgrName={activeMgrO : null;
 })()}
 {/* Календарь */}
 <div style={{background:WH,borderRadius:20,padding:16,marginBottom:14,boxShadow <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}> Календарь< {activeMgrId
 ? <CalendarBlock events={events} setEvents={setEvents} mgrId={activeMgrId}  : <div style={{...sf,fontSize:14,color:g4,textAlign:"center",padding:"20px  }
 </div>
 {/* Профиль — только для ассистента на главной */}
 {isAst && activeMgrObj && (
 <div style={{background:WH,borderRadius:20,padding:16,boxShadow:"0 1px 8px rg <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}> Профиль  <ProfileBlock
 mgr={activeMgrObj}
 setUsers={setUsers}
 canEdit={true}
 isNewAssistant={isAst && !acknowledged[activeMgrId]}
 onAcknowledge={()=>setAcknowledged(p=>({...p,[activeMgrId]:true}))}
 />
 </div>
 )}
 </div>
 )}
 {/* ── ПРОФИЛЬ (только клиент) ── */}
 {!isAdmin && tab==="profile" && isMgr && (() => {
 const mgrTasks = tasks[me.id] || [];
 const totalSaved= mgrTasks.reduce((s,t)=>s+(t.saved||0),0);
 const rated = mgrTasks.filter(t=>t.rating);
 const avgRating = rated.length?(rated.reduce((s,t)=>s+t.rating,0)/rated.length).t return (
 <div style={{padding:16}}>
 {/* Метрики */}
 <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
 textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}> Статистика <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBot {[
 {v:mgrTasks.length, l:"задач\nпоручено", c:B, bg:"rgb {v:fmtMin(totalSaved)||"0 мин", l:"сэкономлено", c:G, bg:"rgb {v:avgRating?`★ ${avgRating}`:"—", l:"средняя\nоценка", c:O, bg:"rgb ].map((m,i)=>(
 <div key={i} style={{background:m.bg,borderRadius:16,padding:"12px 6px",t <div style={{fontSize:18,marginBottom:2}}>{m.i}</div>
 <div style={{...sf,fontSize:i===1?13:18,fontWeight:700,color:m.c,letter <div style={{...sf,fontSize:9,color:g4,fontWeight:500,marginTop:3,lineH </div>
 ))}
 </div>
 {/* Профиль */}
 <div style={{background:WH,borderRadius:20,padding:16,boxShadow:"0 1px 8px rg <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}> Мой проф <ProfileBlock
 mgr={users.find(u=>u.id===me.id)}
 setUsers={setUsers}
 canEdit={false}
 isNewAssistant={false}
 onAcknowledge={null}
 />
 </div>
 </div>
 );
 })()}
 {/* ── ЗАДАЧИ ── */}
 {!isAdmin && tab==="tasks" && (
 <div style={{padding:16}}>
 {/* Уведомление о новой задаче (только ассистенту) */}
 {isAst && activeMgrId && (newTasksNotif[activeMgrId]||0) > 0 && (
 <div style={{background:"linear-gradient(135deg,rgba(0,122,255,0.10),rgba(0,1 border:"1.5px solid rgba(0,122,255,0.25)",borderRadius:16,
 padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap: <div style={{width:40,height:40,borderRadius:12,background:`${B}18`,
 display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fl <div style={{flex:1}}>
 <div style={{...sf,fontSize:14,fontWeight:700,color:B}}>
 {newTasksNotif[activeMgrId]} новая задача!
 </div>
 <div style={{...sf,fontSize:12,color:g4}}>
 {activeMgrObj?.name} поставил(а) новую задачу
 </div>
 </div>
 <button onClick={()=>setNewTasksNotif(p=>({...p,[activeMgrId]:0}))}
 style={{background:"none",border:"none",cursor:"pointer",fontSize:18,colo </div>
 )}
 {activeMgrId
 ? <TasksBlock tasks={tasks} setTasks={setTasks} mgrId={activeMgrId} myRole={m onNewTask={isMgr ? ()=>setNewTasksNotif(p=>({...p,[activeMgrId]:(p[active : <div style={{textAlign:"center",padding:"60px 0",...sf,color:g4}}>Выберите  }
 </div>
 )}
 {/* ── ЧАТ ── */}
 {!isAdmin && tab==="chat" && (
 <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
 {/* Вкладки клиентов у ассистента в чате — с красным бейджем */}
 {isAst && astClients.length>0 && (
 <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",o {astClients.map(c=>{
 const hasUnread = unreadMsgs[c.id];
 return (
 <button key={c.id}
 onClick={()=>{ setChatMgr(c.id); setUnreadMsgs(p=>({...p,[c.id]:false style={{...sf,background:"transparent",border:"none",
 borderBottom:chatMgr===c.id?`2.5px solid ${c.color}`:"2.5px solid t padding:"10px 14px",cursor:"pointer",color:chatMgr===c.id?c.color:g fontWeight:chatMgr===c.id?700:400,fontSize:14,
 whiteSpace:"nowrap",flexShrink:0,
 display:"flex",alignItems:"center",gap:5,position:"relative"}}>
 {c.name.split(" ")[0]}
 {hasUnread && (
 <span style={{width:8,height:8,borderRadius:"50%",background:R,flex boxShadow:`0 0 0 2px ${WH}`}}/>
 )}
 </button>
 );
 })}
 </div>
 )}
 {isMgr && mgrPeer && (
 <ChatBlock messages={msgs} setMessages={setMsgs}
 mgrId={me.id} myRole="manager" peer={mgrPeer}
 onSend={()=>setUnreadMsgs(p=>({...p,[me.id]:true}))}/>
 )}
 {isAst && activeChatObj && (
 <ChatBlock messages={msgs} setMessages={setMsgs}
 mgrId={activeChatId} myRole="assistant" peer={activeChatObj}
 onSend={null}/>
 )}
 {isAst && !activeChatObj && (
 <div style={{textAlign:"center",padding:"60px 0",...sf,color:g4}}>Выберите кл )}
 </div>
 )}
 </div>
 {/* Нижняя навигация */}
 {!isAdmin && (
 <div style={{background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",
 borderTop:`0.5px solid ${SEP}`,display:"flex",flexShrink:0,paddingBottom:8}}>
 {TABS.map(t=>{
 // Красная точка на чате — есть непрочитанные от клиента (только у ассистента)
 const hasUnreadChat = isAst && t.k==="chat" && Object.values(unreadMsgs).some(v // Красная точка на задачах — есть новые задачи (только у ассистента)
 const hasNewTask = isAst && t.k==="tasks" && Object.values(newTasksNotif).so return (
 <button key={t.k} onClick={()=>setTab(t.k)}
 style={{...sf,flex:1,background:"transparent",border:"none",cursor:"pointer padding:"9px 4px 5px",display:"flex",flexDirection:"column",alignItems:"c position:"relative"}}>
 <span style={{fontSize:22,position:"relative"}}>
 {t.i}
 {(hasUnreadChat||hasNewTask) && (
 <span style={{position:"absolute",top:-2,right:-4,width:9,height:9,
 borderRadius:"50%",background:R,border:`2px solid ${WH}`}}/>
 )}
 </span>
 <span style={{fontSize:10,fontWeight:tab===t.k?700:400,color:tab===t.k?B:g4 </button>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}
