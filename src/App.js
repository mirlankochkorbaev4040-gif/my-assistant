/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";
 
// UUID генератор для совместимости с Supabase
function genId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
 
// ── SUPABASE через fetch (без библиотеки) ─────────────────────────────────────
const SUPA_URL = "https://hngwpbfgaiuwnxhzxdxp.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZ3dwYmZnYWl1d254aHp4ZHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjgzNDQsImV4cCI6MjA4ODQ0NDM0NH0.YTAb-CjVIAeBMaoYzL1jrB_xZ7zdV6EMd-iGUMCohGo";
 
const headers = {
  "Content-Type": "application/json",
  "apikey": SUPA_KEY,
  "Authorization": `Bearer ${SUPA_KEY}`,
  "Prefer": "return=representation",
};
 
const db = {
  async select(table) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*`, { headers });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async upsert(table, row) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE", headers,
    });
    if (!r.ok) throw new Error(await r.text());
  },
};
 
// helpers: db row → app object
function rowToUser(r) {
  return {
    id: r.id, role: r.role, name: r.name, initials: r.initials,
    color: r.color, login: r.login, pw: r.pw,
    clients: r.clients || [],
    astId: r.ast_id || null,
    subDays: r.sub_days ?? 30,
    ratePerClient: r.rate_per_client ?? 90000,
    info: r.info || "", about: r.about || "",
    likes: r.likes || "", dislikes: r.dislikes || "",
    accesses: r.accesses || [], files: r.files || [],
    active: r.active !== false,
  };
}
function rowToTask(r) {
  return {
    id: r.id, title: r.title, desc: r.description || "",
    deadline: r.deadline, priority: r.priority || "medium",
    er: r.er || "", status: r.status || "new",
    rating: r.rating || null, rc: r.rc || null,
    saved: r.saved || null, result: r.result || "",
    helpComment: r.help_comment || "",
    mgrReply: r.mgr_reply || "",
    files: r.files || [],
    photo: r.photo || null,
    link: r.link || null,
    resultPhoto: r.result_photo || null,
    resultLink: r.result_link || null,
  };
}
function rowToMsg(r) {
  return { id: r.id, from: r.from_role, text: r.text, time: r.time, files: r.files || [] };
}
function rowToEvent(r) {
  return { id: r.id, date: r.date, time: r.time, title: r.title, type: r.type, by: r.by_role };
}
 
// ── ЦВЕТА И ШРИФТ ─────────────────────────────────────────────────────────────
const B = "#007AFF", G = "#34C759", R = "#FF3B30", O = "#FF9500";
const g1="#F2F2F7", g2="#E5E5EA", g3="#C7C7CC", g4="#8E8E93";
const BG="#F2F2F7", WH="#FFF", SEP="rgba(60,60,67,0.12)";
const sf = { fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" };
 
const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)} ч ${m%60 ? m%60+" мин":""}` : `${m} мин`;
 
// данные берутся из Supabase
 
const EVT={meeting:{l:"Встреча",i:"🤝",c:B},call:{l:"Звонок",i:"📞",c:G},deadline:{l:"Дедлайн",i:"⏰",c:R},reminder:{l:"Напоминание",i:"🔔",c:O}};
const PR ={high:{l:"Высокий",c:R},medium:{l:"Средний",c:O},low:{l:"Низкий",c:G}};
const ST ={
  new:        {l:"Новая",      i:"🕐",c:O,bg:"rgba(255,149,0,0.08)",  bd:"rgba(255,149,0,0.25)"},
  in_progress:{l:"В процессе",i:"⚙️", c:B,bg:"rgba(0,122,255,0.08)", bd:"rgba(0,122,255,0.25)"},
  done:       {l:"Готово",     i:"✅",c:G,bg:"rgba(52,199,89,0.08)",  bd:"rgba(52,199,89,0.25)"},
  problem:    {l:"Помощь",     i:"❗",c:R,bg:"rgba(255,59,48,0.08)",  bd:"rgba(255,59,48,0.25)"},
};
 
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
  const [pw,    setPw]    = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);
 
  function doLogin() {
    if (!login.trim() || !pw) { setErr("Введите логин и пароль"); return; }
    setBusy(true); setErr("");
    setTimeout(() => {
      const u = users.find(x => x.login === login.trim().toLowerCase() && x.pw === pw);
      if (u) { onLogin(u); }
      else   { setErr("Неверный логин или пароль"); setBusy(false); }
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
      <div style={{...sf,fontSize:14,color:g4,marginBottom:36,textAlign:"center",lineHeight:1.5}}>
        Ваш персональный помощник
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
          padding:"17px",fontSize:17,fontWeight:700,cursor:busy?"default":"pointer",width:"100%",
          boxShadow:"0 6px 20px rgba(0,122,255,0.35)",transition:"all .2s",marginBottom:20}}>
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
  const [yr,  setYr]      = useState(2026);
  const [mo,  setMo]      = useState(2);
  const [sel, setSel]     = useState(7);
  const [adding, setAdding] = useState(false);
  const [form, setForm]   = useState({title:"",time:"",type:"meeting"});
 
  const evts = events[mgrId] || [];
  const off  = (() => { const d = new Date(yr,mo,1).getDay(); return d===0?6:d-1; })();
  const dim  = new Date(yr,mo+1,0).getDate();
  const cells = [...Array(off).fill(null), ...Array.from({length:dim},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);
 
  const ds    = d => `${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dayE  = d => evts.filter(e => e.date === ds(d));
  const selE  = sel ? dayE(sel) : [];
 
  const prevMo = () => mo===0 ? (setMo(11), setYr(y=>y-1)) : setMo(m=>m-1);
  const nextMo = () => mo===11 ? (setMo(0),  setYr(y=>y+1)) : setMo(m=>m+1);
 
  function addEvent() {
    if (!form.title) return;
    const ev = {id:genId(), date:ds(sel), time:form.time||"00:00", title:form.title, type:form.type, by:role};
    setEvents(p => ({...p, [mgrId]: [...(p[mgrId]||[]), ev]}));
    setForm({title:"",time:"",type:"meeting"});
    setAdding(false);
  }
  function delEvent(id) {
    setEvents(p => ({...p, [mgrId]: (p[mgrId]||[]).filter(e=>e.id!==id)}));
  }
 
  return (
    <div>
      {/* Навигация по месяцу */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={prevMo} style={{background:"none",border:"none",cursor:"pointer",fontSize:24,color:B,lineHeight:1}}>‹</button>
        <div style={{...sf,fontSize:16,fontWeight:700}}>{MONTHS[mo]} {yr}</div>
        <button onClick={nextMo} style={{background:"none",border:"none",cursor:"pointer",fontSize:24,color:B,lineHeight:1}}>›</button>
      </div>
 
      {/* Дни недели */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:2}}>
        {WD.map(d=>(
          <div key={d} style={{...sf,textAlign:"center",fontSize:11,color:g4,fontWeight:600,padding:"3px 0"}}>{d}</div>
        ))}
      </div>
 
      {/* Числа */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:14}}>
        {cells.map((d,i) => {
          const de = d ? dayE(d) : [];
          const isTod = d===7 && mo===2 && yr===2026;
          const isSel = d===sel;
          return (
            <div key={i} onClick={() => d && setSel(d)}
              style={{textAlign:"center",padding:"5px 2px",borderRadius:10,cursor:d?"pointer":"default",
                background: isSel ? B : isTod ? "rgba(0,122,255,0.10)" : "transparent"}}>
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{...sf,fontSize:14,fontWeight:700}}>{sel} {MONTHS[mo]}</div>
          <button onClick={()=>setAdding(true)}
            style={{...sf,background:B,color:"#fff",border:"none",borderRadius:10,
              padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            + Событие
          </button>
        </div>
 
        {selE.length===0 && (
          <div style={{...sf,fontSize:13,color:g4,textAlign:"center",padding:"10px 0"}}>Событий нет</div>
        )}
        {selE.map(e => {
          const t = EVT[e.type] || EVT.meeting;
          return (
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"9px 12px",background:g1,borderRadius:12,marginBottom:6,
              borderLeft:`3px solid ${t.c}`}}>
              <span style={{fontSize:18}}>{t.i}</span>
              <div style={{flex:1}}>
                <div style={{...sf,fontSize:14,fontWeight:600}}>{e.title}</div>
                <div style={{...sf,fontSize:11,color:g4}}>{e.time} · {e.by==="manager"?"Вы":"Ассистент"}</div>
              </div>
              <button onClick={()=>delEvent(e.id)}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:g4}}>✕</button>
            </div>
          );
        })}
 
        {/* Форма добавления */}
        {adding && (
          <div style={{background:g1,borderRadius:14,padding:12,marginTop:8}}>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="Название события"
              style={{...sf,width:"100%",background:WH,border:"none",borderRadius:10,
                padding:"10px 12px",fontSize:15,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}
                style={{...sf,flex:1,background:WH,border:"none",borderRadius:10,padding:"10px 12px",fontSize:14,outline:"none"}}/>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                style={{...sf,flex:1,background:WH,border:"none",borderRadius:10,padding:"10px 12px",fontSize:14,outline:"none"}}>
                {Object.entries(EVT).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addEvent}
                style={{...sf,flex:1,background:B,color:"#fff",border:"none",borderRadius:10,
                  padding:"10px",cursor:"pointer",fontSize:14,fontWeight:600}}>Добавить</button>
              <button onClick={()=>setAdding(false)}
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
const ACCESS_ICONS = ["📧","💼","🔑","📊","💳","🌐","📱","🗂️","☁️","🛒"];
 
function ProfileBlock({mgr, setUsers, canEdit, isNewAssistant, onAcknowledge}) {
  const [editing,    setEditing]    = useState(false);
  const [about,      setAbout]      = useState(mgr.about    || "");
  const [likes,      setLikes]      = useState(mgr.likes    || "");
  const [dislike,    setDislike]    = useState(mgr.dislikes || "");
  const [accesses,   setAccesses]   = useState(mgr.accesses || []);
  const [files,      setFiles]      = useState(mgr.files    || []);
  const [addingAcc,  setAddingAcc]  = useState(false);
  const [accForm,    setAccForm]    = useState({icon:"📧",label:"",val:""});
  const [copied,     setCopied]     = useState(null);
 
  function save() {
    setUsers(p => p.map(u => u.id===mgr.id ? {...u,about,likes,dislikes:dislike,accesses,files} : u));
    setEditing(false);
  }
  function addAccess() {
    if (!accForm.label || !accForm.val) return;
    const updated = [...accesses, {...accForm}];
    setAccesses(updated);
    setUsers(p => p.map(u => u.id===mgr.id ? {...u,accesses:updated} : u));
    setAccForm({icon:"📧",label:"",val:""});
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
        <div style={{background:"linear-gradient(135deg,rgba(0,122,255,0.08),rgba(0,122,255,0.03))",
          border:"2px solid rgba(0,122,255,0.2)",borderRadius:20,padding:"20px 18px",marginBottom:16,
          textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:10}}>👋</div>
          <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:6}}>Новый клиент!</div>
          <div style={{...sf,fontSize:14,color:"#3C3C43",lineHeight:1.6,marginBottom:16}}>
            Прочитай профиль руководителя внимательно — пойми кто он, что любит, как работает. Твоя задача — продолжить работу так, чтобы клиент ничего не заметил.
          </div>
          <div style={{background:WH,borderRadius:14,padding:"12px 14px",marginBottom:16,textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Av u={mgr} size={44}/>
              <div>
                <div style={{...sf,fontSize:16,fontWeight:700}}>{mgr.name}</div>
                <div style={{...sf,fontSize:12,color:g4}}>{mgr.info}</div>
              </div>
            </div>
            {mgr.about && <div style={{...sf,fontSize:13,color:"#3C3C43",lineHeight:1.5}}>{mgr.about}</div>}
          </div>
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
              border:"none",borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            {editing?"Сохранить":"Изменить"}
          </button>
        )}
      </div>
 
      {/* Видео */}
      <div style={{background:"#0a0a1a",borderRadius:14,height:108,display:"flex",
        alignItems:"center",justifyContent:"center",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,122,255,0.25),rgba(0,50,180,0.2))"}}/>
        <div style={{position:"relative",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:3}}>▶️</div>
          <div style={{...sf,fontSize:12,color:"rgba(255,255,255,0.75)"}}>Видео о руководителе</div>
        </div>
        {canEdit && (
          <button style={{position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,0.12)",
            border:"1.5px dashed rgba(255,255,255,0.3)",borderRadius:8,padding:"4px 9px",
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
        <div style={{background:"rgba(52,199,89,0.08)",border:"1.5px solid rgba(52,199,89,0.2)",borderRadius:14,padding:12}}>
          <div style={{...sf,fontSize:11,color:G,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>👍 Нравится</div>
          {editing
            ? <textarea value={likes} onChange={e=>setLikes(e.target.value)}
                style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:13,
                  outline:"none",resize:"none",lineHeight:1.4,boxSizing:"border-box",color:"#000"}}/>
            : <div style={{...sf,fontSize:13,lineHeight:1.4}}>{likes||"—"}</div>}
        </div>
        <div style={{background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.15)",borderRadius:14,padding:12}}>
          <div style={{...sf,fontSize:11,color:R,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>👎 Не нравится</div>
          {editing
            ? <textarea value={dislike} onChange={e=>setDislike(e.target.value)}
                style={{...sf,width:"100%",background:"transparent",border:"none",fontSize:13,
                  outline:"none",resize:"none",lineHeight:1.4,boxSizing:"border-box",color:"#000"}}/>
            : <div style={{...sf,fontSize:13,lineHeight:1.4}}>{dislike||"—"}</div>}
        </div>
      </div>
 
      {/* ── ДОСТУПЫ — редактируются ассистентом ── */}
      <div style={{background:g1,borderRadius:14,padding:"12px 14px",marginBottom:10}}>
        <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}>🔐 Доступы и пароли</div>
 
        {accesses.length===0 && !addingAcc && (
          <div style={{...sf,fontSize:13,color:g4,marginBottom:8}}>Нет доступов</div>
        )}
        {accesses.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,
            padding:"9px 0",borderBottom:`0.5px solid ${SEP}`}}>
            <span style={{fontSize:20}}>{a.icon}</span>
            <div style={{flex:1}}>
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600}}>{a.label}</div>
              <div style={{...sf,fontSize:13,fontFamily:"monospace",letterSpacing:0.2}}>{a.val}</div>
            </div>
            <button onClick={()=>copyAcc(a.val,i)}
              style={{background:copied===i?G:WH,border:"none",borderRadius:7,
                padding:"4px 8px",cursor:"pointer",...sf,fontSize:11,
                color:copied===i?"#fff":B,transition:"all .2s",flexShrink:0}}>
              {copied===i?"✓":"📋"}
            </button>
            {canEdit && (
              <button onClick={()=>delAccess(i)}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:g4,flexShrink:0}}>✕</button>
            )}
          </div>
        ))}
 
        {/* Форма добавления доступа */}
        {addingAcc && (
          <div style={{background:WH,borderRadius:12,padding:12,marginTop:8}}>
            <div style={{...sf,fontSize:12,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Иконка</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {ACCESS_ICONS.map(ic=>(
                <button key={ic} onClick={()=>setAccForm({...accForm,icon:ic})}
                  style={{fontSize:22,background:accForm.icon===ic?`${B}15`:"transparent",
                    border:`1.5px solid ${accForm.icon===ic?B:"transparent"}`,
                    borderRadius:8,padding:"4px 6px",cursor:"pointer"}}>
                  {ic}
                </button>
              ))}
            </div>
            <input value={accForm.label} onChange={e=>setAccForm({...accForm,label:e.target.value})}
              placeholder="Название (напр. Gmail)" style={inp}/>
            <input value={accForm.val} onChange={e=>setAccForm({...accForm,val:e.target.value})}
              placeholder="Логин / пароль / ссылка" style={inp}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addAccess} disabled={!accForm.label||!accForm.val}
                style={{...sf,flex:1,background:(!accForm.label||!accForm.val)?g2:B,
                  color:(!accForm.label||!accForm.val)?g3:"#fff",border:"none",borderRadius:10,
                  padding:"10px",cursor:"pointer",fontSize:14,fontWeight:600}}>
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
              padding:"8px",marginTop:8,cursor:"pointer",fontSize:13,color:B,fontWeight:600}}>
            + Добавить доступ
          </button>
        )}
      </div>
 
      {/* Файлы */}
      <div style={{background:g1,borderRadius:14,padding:"12px 14px"}}>
        <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}>📎 Файлы</div>
        {files.length===0 && <div style={{...sf,fontSize:13,color:g4,marginBottom:8}}>Нет файлов</div>}
        {files.map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,
            padding:"7px 0",borderBottom:`0.5px solid ${SEP}`}}>
            <span style={{fontSize:20}}>{f.icon}</span>
            <div style={{flex:1}}>
              <div style={{...sf,fontSize:13,fontWeight:500}}>{f.name}</div>
              <div style={{...sf,fontSize:11,color:g4}}>{f.size}</div>
            </div>
            <span style={{fontSize:16,cursor:"pointer"}}>⬇️</span>
            {canEdit && (
              <button onClick={()=>{const u=[...files];u.splice(i,1);setFiles(u);setUsers(p=>p.map(x=>x.id===mgr.id?{...x,files:u}:x));}}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:g4}}>✕</button>
            )}
          </div>
        ))}
        {canEdit && (
          <button onClick={()=>{const f={name:"новый_файл.pdf",size:"—",icon:"📄"};const u=[...files,f];setFiles(u);setUsers(p=>p.map(x=>x.id===mgr.id?{...x,files:u}:x));}}
            style={{...sf,width:"100%",background:"transparent",
              border:"1.5px dashed rgba(0,122,255,0.3)",borderRadius:10,
              padding:"8px",marginTop:8,cursor:"pointer",fontSize:13,color:B,fontWeight:600}}>
            📎 Прикрепить файл
          </button>
        )}
      </div>
    </div>
  );
}
 
// ── ЧАТ ───────────────────────────────────────────────────────────────────────
function ChatBlock({messages, setMessages, mgrId, myRole, peer, onSend}) {
  const [text,     setText]    = useState("");
  const [attached, setAttached]= useState(null);
 
  const list = messages[mgrId] || [];
 
  function send() {
    if (!text.trim() && !attached) return;
    const msg = {
      id: genId(),
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
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:6}}>
        {list.length===0 && (
          <div style={{textAlign:"center",padding:"30px 0",...sf,fontSize:14,color:g4}}>Начните диалог</div>
        )}
        {list.map(m => {
          const isMe = m.from === myRole;
          return (
            <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"78%",padding:"9px 13px",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isMe ? B : "#E9E9EB"}}>
                {(m.files||[]).map((f,i)=>(
                  <div key={i} style={{...sf,background:isMe?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.07)",
                    borderRadius:8,padding:"4px 10px",marginBottom:5,fontSize:13,
                    color:isMe?"#fff":B,display:"flex",alignItems:"center",gap:5}}>
                    📎 {f.name}
                  </div>
                ))}
                {m.text && (
                  <div style={{...sf,fontSize:15,color:isMe?"#fff":"#000",lineHeight:1.4}}>{m.text}</div>
                )}
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
          <span style={{...sf,background:g1,borderRadius:8,padding:"4px 10px",fontSize:12,color:B}}>📎 {attached}</span>
          <button onClick={()=>setAttached(null)}
            style={{background:"none",border:"none",cursor:"pointer",color:g4,fontSize:16}}>✕</button>
        </div>
      )}
 
      {/* Ввод */}
      <div style={{display:"flex",gap:8,padding:"10px 14px 14px",
        background:WH,borderTop:`0.5px solid ${SEP}`,flexShrink:0}}>
        <button onClick={()=>setAttached("файл.pdf")}
          style={{width:40,height:40,background:g1,border:"none",borderRadius:12,
            cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          📎
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
 
// ── AI ПРОВЕРКА ЗАДАЧИ ────────────────────────────────────────────────────────
function AiCheck({task, onDone}) {
  const [result,   setResult]   = useState(task.result||"");
  const [checking, setChecking] = useState(false);
  const [review,   setReview]   = useState(null);
  const [aiPlan,   setAiPlan]   = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
 
  // Синхронизируем result с task.result
  useState(() => { setResult(task.result||""); }, [task.result]);
 
  async function loadPlan() {
    if (aiPlan) return;
    setPlanLoading(true);
    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{role:"user", content:
            `Ты опытный бизнес-ассистент. Составь краткий план выполнения задачи для помощника руководителя.
 
Задача: ${task.title}
Описание: ${task.desc}
Ожидаемый результат: ${task.er}
 
Ответь ТОЛЬКО JSON (без markdown):
{"steps":[{"n":1,"text":"шаг","time":"15 мин"},...],"warning":"главная ошибка которую надо избежать","tip":"главный совет"}`
          }]
        })
      });
      const data = await resp.json();
      const text = (data.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      setAiPlan(JSON.parse(text));
    } catch(e) { setAiPlan({steps:[],warning:"",tip:"Не удалось загрузить план"}) }
    setPlanLoading(false);
  }
 
  async function checkWithAI() {
    if (!result.trim()) return;
    setChecking(true); setReview(null);
    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{role:"user", content:
            `Ты строгий но справедливый проверяющий качества работы ассистента.
 
Задача: ${task.title}
Описание: ${task.desc}
Ожидаемый результат: ${task.er}
 
Результат ассистента:
${result}
 
Проверь качество и ответь ТОЛЬКО JSON (без markdown):
{"score":число 0-100,"verdict":"отлично"|"хорошо"|"частично"|"плохо","summary":"один вывод","checks":[{"label":"что проверялось","ok":true,"comment":"пояснение"}],"recommendation":"конкретный совет или пустая строка"}`
          }]
        })
      });
      const data = await resp.json();
      const text = (data.content?.[0]?.text||"").replace(/```json|```/g,"").trim();
      setReview(JSON.parse(text));
    } catch(e) {
      setReview({score:0,verdict:"ошибка",summary:"Не удалось проверить. Попробуйте ещё раз.",checks:[],recommendation:""});
    }
    setChecking(false);
  }
 
  const VC = {
    отлично:  {c:G, bg:"rgba(52,199,89,0.10)",  i:"🎉", l:"Отлично!"},
    хорошо:   {c:B, bg:"rgba(0,122,255,0.10)",  i:"✅", l:"Хорошо"},
    частично: {c:O, bg:"rgba(255,149,0,0.10)",  i:"⚠️", l:"Частично"},
    плохо:    {c:R, bg:"rgba(255,59,48,0.10)",  i:"❌", l:"Нужно доработать"},
    ошибка:   {c:R, bg:"rgba(255,59,48,0.10)",  i:"⚠️", l:"Ошибка"},
  };
  const vc = review ? (VC[review.verdict]||VC.ошибка) : null;
 
  return (
    <div style={{marginBottom:10}}>
      {/* AI План */}
      {!aiPlan && !planLoading && (
        <button onClick={loadPlan}
          style={{...sf,width:"100%",background:"rgba(0,122,255,0.08)",
            border:"1.5px solid rgba(0,122,255,0.2)",borderRadius:12,padding:"11px",
            fontSize:14,color:B,fontWeight:600,cursor:"pointer",marginBottom:8}}>
          🧠 Получить AI план выполнения
        </button>
      )}
      {planLoading && (
        <div style={{...sf,fontSize:13,color:g4,textAlign:"center",padding:"10px 0",marginBottom:8}}>
          🧠 AI составляет план…
        </div>
      )}
      {aiPlan && (
        <div style={{background:"rgba(0,122,255,0.04)",border:"1.5px solid rgba(0,122,255,0.15)",
          borderRadius:14,padding:"12px 14px",marginBottom:10}}>
          <div style={{...sf,fontSize:12,color:B,fontWeight:700,marginBottom:8}}>🧠 AI ПЛАН ВЫПОЛНЕНИЯ</div>
          {aiPlan.steps.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
              <div style={{width:22,height:22,borderRadius:6,background:B,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,flexShrink:0}}>{s.n}</div>
              <div style={{flex:1}}>
                <div style={{...sf,fontSize:13,color:"#1c1c1e"}}>{s.text}</div>
                <div style={{...sf,fontSize:11,color:g4}}>{s.time}</div>
              </div>
            </div>
          ))}
          {aiPlan.warning && (
            <div style={{background:"rgba(255,59,48,0.07)",borderRadius:10,padding:"8px 10px",marginTop:8}}>
              <span style={{...sf,fontSize:12,color:R,fontWeight:600}}>⚠️ Избегать: </span>
              <span style={{...sf,fontSize:12,color:"#3c3c43"}}>{aiPlan.warning}</span>
            </div>
          )}
          {aiPlan.tip && (
            <div style={{background:"rgba(52,199,89,0.07)",borderRadius:10,padding:"8px 10px",marginTop:6}}>
              <span style={{...sf,fontSize:12,color:G,fontWeight:600}}>💡 Совет: </span>
              <span style={{...sf,fontSize:12,color:"#3c3c43"}}>{aiPlan.tip}</span>
            </div>
          )}
        </div>
      )}
 
      {/* Результат */}
      <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
        textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>
        📝 Мой результат
      </div>
      <textarea
        value={result}
        onChange={e=>setResult(e.target.value)}
        placeholder="Опиши что сделано, добавь ссылки или детали…"
        rows={3}
        style={{...sf,width:"100%",background:g1,border:"none",borderRadius:12,
          padding:"11px 13px",fontSize:14,outline:"none",resize:"none",
          boxSizing:"border-box",lineHeight:1.5,marginBottom:8}}
      />
 
      {/* AI проверка */}
      {!review && (
        <div style={{display:"flex",gap:8}}>
          <button onClick={checkWithAI} disabled={!result.trim()||checking}
            style={{...sf,flex:1,background:!result.trim()||checking?g2:B,
              color:!result.trim()||checking?g3:"#fff",border:"none",borderRadius:12,
              padding:"11px",fontSize:14,fontWeight:600,
              cursor:result.trim()&&!checking?"pointer":"default"}}>
            {checking?"🤖 Проверяю…":"🔍 Проверить через AI"}
          </button>
          <button onClick={()=>onDone(result)}
            style={{...sf,background:"none",border:`1.5px solid ${g2}`,borderRadius:12,
              padding:"11px 14px",fontSize:12,color:g4,cursor:"pointer"}}>
            Без проверки
          </button>
        </div>
      )}
 
      {/* Результат проверки */}
      {review && vc && (
        <div>
          <div style={{background:vc.bg,border:`1.5px solid ${vc.c}30`,borderRadius:14,
            padding:"14px 16px",marginBottom:8,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:6}}>{vc.i}</div>
            <div style={{...sf,fontSize:17,fontWeight:800,color:vc.c,marginBottom:4}}>{vc.l}</div>
            <div style={{...sf,fontSize:13,color:"#3c3c43",lineHeight:1.5,marginBottom:12}}>{review.summary}</div>
            <div style={{background:"#E5E5EA",borderRadius:6,height:7,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${review.score}%`,
                background:`linear-gradient(90deg,${vc.c}88,${vc.c})`,borderRadius:6}}/>
            </div>
            <div style={{...sf,fontSize:11,color:vc.c,fontWeight:700,marginTop:4}}>{review.score}%</div>
          </div>
          {review.checks?.length>0 && (
            <div style={{background:WH,borderRadius:14,padding:"10px 14px",marginBottom:8,
              boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
              {review.checks.map((c,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"7px 0",
                  borderBottom:i<review.checks.length-1?`0.5px solid ${SEP}`:"none"}}>
                  <span style={{fontSize:14}}>{c.ok?"✅":"❌"}</span>
                  <div>
                    <div style={{...sf,fontSize:13,fontWeight:600}}>{c.label}</div>
                    <div style={{...sf,fontSize:12,color:g4}}>{c.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {review.recommendation && (
            <div style={{background:"rgba(255,149,0,0.08)",border:"1.5px solid rgba(255,149,0,0.25)",
              borderRadius:12,padding:"10px 13px",marginBottom:8}}>
              <div style={{...sf,fontSize:12,color:O,fontWeight:700,marginBottom:3}}>💡 Рекомендация</div>
              <div style={{...sf,fontSize:13,color:"#3c3c43"}}>{review.recommendation}</div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setReview(null)}
              style={{...sf,flex:1,background:WH,border:`1.5px solid ${g2}`,borderRadius:12,
                padding:"11px",fontSize:14,fontWeight:600,cursor:"pointer",color:"#000"}}>
              ✏️ Изменить
            </button>
            <button onClick={onDone}
              style={{...sf,flex:1,background:review.score>=70?G:O,color:"#fff",border:"none",
                borderRadius:12,padding:"11px",fontSize:14,fontWeight:600,cursor:"pointer",
                boxShadow:`0 4px 12px ${review.score>=70?"rgba(52,199,89,0.35)":"rgba(255,149,0,0.35)"}`}}>
              {review.score>=70?"✅ Отправить":"🔄 Доработать"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ── ЗАДАЧИ ────────────────────────────────────────────────────────────────────
// ── ПРОЦЕДУРА ПОМОЩИ: форма запроса (ассистент в процессе) ──────────────────
function AstHelpForm({onSend, onCancel}) {
  const [comment, setComment] = useState("");
  return (
    <div style={{background:"rgba(255,59,48,0.04)",border:"1.5px solid rgba(255,59,48,0.18)",borderRadius:14,padding:"13px 15px",marginTop:10}}>
      <div style={{...sf,fontSize:13,fontWeight:700,color:R,marginBottom:8}}>❗ Запрос помощи руководителя</div>
      <div style={{...sf,fontSize:12,color:g4,marginBottom:10}}>Опиши проблему — руководитель получит уведомление и ответит</div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)}
        placeholder="Например: не могу найти реквизиты поставщика, сайт не работает…"
        rows={3}
        style={{...sf,width:"100%",background:WH,border:"1px solid rgba(255,59,48,0.2)",
          borderRadius:10,padding:"10px 12px",fontSize:14,outline:"none",resize:"none",
          boxSizing:"border-box",lineHeight:1.5,marginBottom:10}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{if(comment.trim())onSend(comment);}}
          disabled={!comment.trim()}
          style={{...sf,flex:2,background:comment.trim()?R:g2,color:comment.trim()?"#fff":g3,
            border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:comment.trim()?"pointer":"default"}}>
          📤 Отправить руководителю
        </button>
        <button onClick={onCancel}
          style={{...sf,flex:1,background:"none",border:`1.5px solid ${g2}`,borderRadius:12,padding:"12px 8px",fontSize:12,color:g4,cursor:"pointer"}}>
          Отмена
        </button>
      </div>
    </div>
  );
}
 
// ── ПРОЦЕДУРА ПОМОЩИ: статус ожидания / ответ получен (ассистент) ────────────
function AstHelpStatus({task, onRecall, onContinue}) {
  if (task.mgrReply) {
    return (
      <div style={{marginTop:10}}>
        <div style={{background:"rgba(52,199,89,0.07)",border:"1.5px solid rgba(52,199,89,0.25)",borderRadius:14,padding:"13px 15px"}}>
          <div style={{...sf,fontSize:11,color:G,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}>✅ Руководитель ответил</div>
          <div style={{background:"rgba(0,0,0,0.04)",borderRadius:10,padding:"9px 12px",marginBottom:8}}>
            <div style={{...sf,fontSize:11,color:g4,marginBottom:3}}>Твой вопрос:</div>
            <div style={{...sf,fontSize:13,color:"#3c3c43"}}>{task.helpComment}</div>
          </div>
          <div style={{background:WH,borderRadius:10,padding:"10px 12px",border:"1px solid rgba(52,199,89,0.2)"}}>
            <div style={{...sf,fontSize:11,color:G,fontWeight:600,marginBottom:4}}>Ответ и правки:</div>
            <div style={{...sf,fontSize:14,color:"#1c1c1e",lineHeight:1.5}}>{task.mgrReply}</div>
          </div>
        </div>
        <button onClick={onContinue}
          style={{...sf,width:"100%",background:"rgba(0,122,255,0.08)",border:"1.5px solid rgba(0,122,255,0.22)",
            borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,color:B,cursor:"pointer",marginTop:8}}>
          ⚡ Продолжить работу над задачей
        </button>
      </div>
    );
  }
  return (
    <div style={{marginTop:10}}>
      <div style={{background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.2)",borderRadius:14,padding:"13px 15px"}}>
        <div style={{...sf,fontSize:11,color:R,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,marginBottom:8}}>❗ Запрос отправлен руководителю</div>
        <div style={{background:"rgba(255,59,48,0.04)",borderRadius:10,padding:"9px 12px",marginBottom:8}}>
          <div style={{...sf,fontSize:13,color:"#3c3c43",lineHeight:1.5}}>{task.helpComment}</div>
        </div>
        <div style={{...sf,fontSize:12,color:g4}}>⏳ Ожидаем ответа руководителя…</div>
      </div>
      <button onClick={onRecall}
        style={{...sf,width:"100%",background:"none",border:`1.5px solid ${g2}`,
          borderRadius:12,padding:"11px",fontSize:13,color:g4,cursor:"pointer",marginTop:8}}>
        ↩️ Отозвать запрос
      </button>
    </div>
  );
}
 
// ── ПРОЦЕДУРА ПОМОЩИ: ответ руководителя ────────────────────────────────────
function MgrHelpReply({task, onReply}) {
  const [reply, setReply] = useState(task.mgrReply||"");
  const [sent, setSent] = useState(!!task.mgrReply);
  if (sent) {
    return (
      <div style={{background:"rgba(52,199,89,0.07)",border:"1.5px solid rgba(52,199,89,0.2)",borderRadius:14,padding:"13px 15px",marginTop:10}}>
        <div style={{...sf,fontSize:11,color:G,fontWeight:700,marginBottom:6}}>✅ Ответ отправлен ассистенту</div>
        <div style={{...sf,fontSize:13,color:"#3c3c43",lineHeight:1.5}}>{reply}</div>
        <button onClick={()=>setSent(false)} style={{...sf,fontSize:12,color:B,background:"none",border:"none",cursor:"pointer",marginTop:8,display:"block"}}>Изменить</button>
      </div>
    );
  }
  return (
    <div style={{background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.2)",borderRadius:14,padding:"13px 15px",marginTop:10}}>
      <div style={{...sf,fontSize:13,fontWeight:700,color:R,marginBottom:10}}>❗ Ассистент просит помощи</div>
      <div style={{background:WH,borderRadius:10,padding:"10px 12px",marginBottom:10,border:"1px solid rgba(255,59,48,0.15)"}}>
        <div style={{...sf,fontSize:11,color:g4,marginBottom:3}}>Вопрос / проблема:</div>
        <div style={{...sf,fontSize:14,color:"#1c1c1e",lineHeight:1.5}}>{task.helpComment}</div>
      </div>
      <div style={{...sf,fontSize:12,color:g4,marginBottom:8}}>Напишите правки — задача вернётся в работу у ассистента</div>
      <textarea value={reply} onChange={e=>setReply(e.target.value)}
        placeholder="Ответ на вопрос или правки…" rows={3}
        style={{...sf,width:"100%",background:WH,border:"1px solid rgba(0,122,255,0.2)",
          borderRadius:10,padding:"10px 12px",fontSize:14,outline:"none",resize:"none",
          boxSizing:"border-box",lineHeight:1.5,marginBottom:10}}/>
      <button onClick={()=>{if(!reply.trim())return;onReply(reply);setSent(true);}}
        disabled={!reply.trim()}
        style={{...sf,width:"100%",background:reply.trim()?B:g2,color:reply.trim()?"#fff":g3,
          border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,
          cursor:reply.trim()?"pointer":"default",
          boxShadow:reply.trim()?"0 4px 14px rgba(0,122,255,0.3)":"none"}}>
        ✅ Отправить ответ ассистенту
      </button>
    </div>
  );
}
 
function TasksBlock({tasks, setTasks, mgrId, myRole, onNewTask}) {
  const [openId,  setOpenId]  = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({title:"",desc:"",deadline:"",priority:"medium",er:"",photo:null,link:""});
  const [rateId,  setRateId]  = useState(null);
  const [star,    setStar]    = useState(0);
  const [comment, setComment] = useState("");
  const [askHelpId, setAskHelpId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
 
  const list = tasks[mgrId] || [];
  const counts = {
    all:        list.filter(t=>t.status!=="done").length,
    in_progress:list.filter(t=>t.status==="in_progress").length,
    problem:    list.filter(t=>t.status==="problem").length,
    done:       list.filter(t=>t.status==="done").length,
  };
  const shown = filter==="all"  ? list.filter(t=>t.status!=="done")
              : filter==="done" ? list.filter(t=>t.status==="done")
              : list.filter(t=>t.status===filter);
 
  function upd(id, patch) {
    setTasks(p => ({...p, [mgrId]: (p[mgrId]||[]).map(t => t.id===id ? {...t,...patch} : t)}));
  }
  function deleteTask(id) {
    setConfirmDelete(id); // показываем встроенный confirm вместо window.confirm
  }
  function confirmDeleteTask(id) {
    setTasks(p => ({...p, [mgrId]: (p[mgrId]||[]).filter(t => t.id !== id)}));
    fetch(`${SUPA_URL}/rest/v1/tasks?id=eq.${id}`, {method:"DELETE", headers:{
      "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`
    }}).catch(e => console.error(e));
    setOpenId(null);
    setConfirmDelete(null);
  }
  function addTask() {
    if (!form.title || !form.deadline) return;
    const t = {id:genId(), title:form.title, desc:form.desc, deadline:form.deadline,
               priority:form.priority, er:form.er, status:"new",
               photo:form.photo||null, link:form.link||null,
               rating:null, rc:null, saved:null, files:[]};
    setTasks(p => ({...p, [mgrId]: [...(p[mgrId]||[]), t]}));
    if (onNewTask) onNewTask();
    setForm({title:"",desc:"",deadline:"",priority:"medium",er:"",photo:null,link:""});
    setAdding(false);
  }
 
  const filters = [["all","Активные"],["in_progress","В работе"],["problem","Помощь"],["done","Отчёты"]];
 
  return (
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
          <div style={{fontSize:44}}>📭</div>
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
            <div style={{padding:"13px 15px",cursor:"pointer"}} onClick={()=>setOpenId(isOpen?null:t.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                <div style={{...sf,fontSize:16,fontWeight:600,flex:1,letterSpacing:-0.2}}>{t.title}</div>
                <Chip label={s.l} icon={s.i} color={s.c} bg={s.bg} border={s.bd}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{...sf,fontSize:12,color:g4}}>📅 {t.deadline}</span>
                {t.rating && (
                  <div style={{display:"flex",gap:1}}>
                    {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:12,color:n<=t.rating?"#FF9500":"#E5E5EA"}}>★</span>)}
                  </div>
                )}
                <span style={{...sf,fontSize:11,color:isOpen?B:g4,fontWeight:isOpen?600:400}}>
                  {isOpen?"Скрыть ▲":"Подробнее ▼"}
                </span>
              </div>
            </div>
 
            {/* Детали задачи */}
            {isOpen && (
              <div style={{padding:"0 15px 15px",borderTop:`0.5px solid ${SEP}`}}>
                <div style={{paddingTop:12}}>
                  {t.desc && <div style={{...sf,fontSize:14,color:"#3C3C43",lineHeight:1.5,marginBottom:10}}>{t.desc}</div>}
                  <div style={{background:"rgba(0,122,255,0.06)",borderRadius:10,padding:"9px 12px",marginBottom:12}}>
                    <span style={{...sf,fontSize:12,color:B,fontWeight:600}}>Ожидаемый результат: </span>
                    <span style={{...sf,fontSize:13,color:"#3C3C43"}}>{t.er}</span>
                  </div>
                  {/* Показываем вложения из задачи */}
                  {(t.photo || t.link) && (
                    <div style={{marginBottom:12}}>
                      {t.photo && (
                        <img src={t.photo} alt="вложение"
                          style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:12,marginBottom:8,cursor:"pointer"}}
                          onClick={()=>window.open(t.photo)}/>
                      )}
                      {t.link && (
                        <a href={t.link.startsWith("http")?t.link:"https://"+t.link}
                          target="_blank" rel="noreferrer"
                          style={{...sf,display:"flex",alignItems:"center",gap:8,
                            background:"rgba(0,122,255,0.06)",border:"1.5px solid rgba(0,122,255,0.15)",
                            borderRadius:10,padding:"10px 13px",fontSize:13,color:B,fontWeight:600,textDecoration:"none"}}>
                          🔗 {t.link.length>40?t.link.slice(0,40)+"…":t.link}
                        </a>
                      )}
                    </div>
                  )}
 
                  {/* Ассистент — прикрепить фото/ссылку к результату */}
                  {myRole==="assistant" && t.status!=="done" && (
                    <div style={{marginBottom:12}}>
                      <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                        textTransform:"uppercase",marginBottom:6}}>Прикрепить к результату</div>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <label style={{...sf,flex:1,background:t.resultPhoto?"rgba(52,199,89,0.08)":g1,
                          border:`1.5px solid ${t.resultPhoto?G:"transparent"}`,
                          borderRadius:10,padding:"8px",cursor:"pointer",fontSize:13,
                          color:t.resultPhoto?G:g4,fontWeight:600,textAlign:"center",display:"block"}}>
                          {t.resultPhoto?"✅ Фото":"📷 Фото"}
                          <input type="file" accept="image/*" style={{display:"none"}}
                            onChange={e=>{
                              const file = e.target.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => upd(t.id,{resultPhoto:ev.target.result});
                              reader.readAsDataURL(file);
                            }}/>
                        </label>
                        {t.resultPhoto && (
                          <button onClick={()=>upd(t.id,{resultPhoto:null})}
                            style={{...sf,background:"rgba(255,59,48,0.08)",border:"none",
                              borderRadius:10,padding:"8px 12px",fontSize:13,color:R,cursor:"pointer",fontWeight:600}}>
                            ✕
                          </button>
                        )}
                      </div>
                      {t.resultPhoto && (
                        <img src={t.resultPhoto} alt="результат"
                          style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:10,marginBottom:8}}/>
                      )}
                      <input defaultValue={t.resultLink||""}
                        onBlur={e=>upd(t.id,{resultLink:e.target.value})}
                        placeholder="🔗 Ссылка на результат"
                        style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                          padding:"10px 13px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  )}
 
                  {/* Менеджер видит вложения результата */}
                  {myRole==="manager" && (t.resultPhoto||t.resultLink) && (
                    <div style={{marginBottom:12}}>
                      <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                        textTransform:"uppercase",marginBottom:6}}>Вложения к результату</div>
                      {t.resultPhoto && (
                        <img src={t.resultPhoto} alt="результат"
                          style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:12,marginBottom:8,cursor:"pointer"}}
                          onClick={()=>window.open(t.resultPhoto)}/>
                      )}
                      {t.resultLink && (
                        <a href={t.resultLink.startsWith("http")?t.resultLink:"https://"+t.resultLink}
                          target="_blank" rel="noreferrer"
                          style={{...sf,display:"flex",alignItems:"center",gap:8,
                            background:"rgba(52,199,89,0.06)",border:"1.5px solid rgba(52,199,89,0.2)",
                            borderRadius:10,padding:"10px 13px",fontSize:13,color:G,fontWeight:600,textDecoration:"none"}}>
                          🔗 {t.resultLink.length>40?t.resultLink.slice(0,40)+"…":t.resultLink}
                        </a>
                      )}
                    </div>
                  )}
 
                  {/* Удалить задачу — только руководитель */}
                  {myRole==="manager" && (
                    confirmDelete===t.id ? (
                      <div style={{background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.25)",
                        borderRadius:12,padding:"13px",marginBottom:12}}>
                        <div style={{...sf,fontSize:14,fontWeight:600,color:"#FF3B30",marginBottom:10}}>
                          Удалить задачу?
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>confirmDeleteTask(t.id)}
                            style={{...sf,flex:1,background:"#FF3B30",color:"#fff",border:"none",
                              borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                            Да, удалить
                          </button>
                          <button onClick={()=>setConfirmDelete(null)}
                            style={{...sf,flex:1,background:"#F1F5F9",color:"#64748B",border:"none",
                              borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={()=>deleteTask(t.id)}
                        style={{...sf,background:"rgba(255,59,48,0.06)",border:"1.5px solid rgba(255,59,48,0.2)",
                          borderRadius:10,padding:"9px 13px",fontSize:13,color:"#FF3B30",cursor:"pointer",
                          width:"100%",marginBottom:12,fontWeight:600}}>
                        🗑 Удалить задачу
                      </button>
                    )
                  )}
 
                  {/* Оценка — для руководителя */}
                  {myRole==="manager" && t.status==="done" && (
                    rateId===t.id ? (
                      <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(255,149,0,0.2)",borderRadius:14,padding:13}}>
                        <div style={{...sf,fontSize:13,fontWeight:700,marginBottom:10}}>Оценить работу</div>
                        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8}}>
                          {[1,2,3,4,5].map(n=>(
                            <button key={n} onClick={()=>setStar(n)}
                              style={{fontSize:32,background:"none",border:"none",cursor:"pointer",
                                color:n<=star?"#FF9500":"#E5E5EA",
                                transform:n<=star?"scale(1.12)":"scale(1)",transition:"all .12s"}}>★</button>
                          ))}
                        </div>
                        {star>0 && <div style={{...sf,fontSize:13,color:O,textAlign:"center",marginBottom:8}}>
                          {["","😕 Плохо","😐 Нормально","🙂 Хорошо","😊 Отлично","🎉 Супер!"][star]}
                        </div>}
                        <textarea value={comment} onChange={e=>setComment(e.target.value)}
                          placeholder="Комментарий…" rows={2}
                          style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                            padding:"9px 12px",fontSize:14,outline:"none",resize:"none",
                            boxSizing:"border-box",marginBottom:10}}/>
                        <div style={{display:"flex",gap:8}}>
                          <button
                            onClick={()=>{upd(t.id,{rating:star,rc:comment});setRateId(null);setStar(0);setComment("");}}
                            disabled={!star}
                            style={{...sf,flex:1,background:star?O:g2,color:star?"#fff":g3,
                              border:"none",borderRadius:10,padding:"11px",cursor:"pointer",fontSize:14,fontWeight:600}}>
                            Сохранить
                          </button>
                          <button onClick={()=>setRateId(null)}
                            style={{...sf,background:g1,border:"none",borderRadius:10,
                              padding:"11px 14px",cursor:"pointer",fontSize:14,color:g4}}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : t.rating ? (
                      <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(255,149,0,0.2)",borderRadius:12,padding:"11px 13px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{display:"flex",gap:1,marginBottom:3}}>
                              {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,color:n<=t.rating?"#FF9500":"#E5E5EA"}}>★</span>)}
                            </div>
                            {t.rc && <div style={{...sf,fontSize:12,color:g4,fontStyle:"italic"}}>"{t.rc}"</div>}
                          </div>
                          <button onClick={()=>{setRateId(t.id);setStar(t.rating);setComment(t.rc||"");}}
                            style={{...sf,fontSize:12,color:B,background:"none",border:"none",cursor:"pointer"}}>
                            Изменить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={()=>setRateId(t.id)}
                        style={{...sf,background:"rgba(255,149,0,0.08)",border:"1.5px solid rgba(255,149,0,0.2)",
                          borderRadius:10,padding:"11px",width:"100%",cursor:"pointer",fontSize:14,color:O,fontWeight:600}}>
                        ⭐ Оценить работу
                      </button>
                    )
                  )}
 
                  {/* Оценка видна ассистенту */}
                  {myRole==="assistant" && t.status==="done" && t.rating && (
                    <div style={{background:"rgba(255,149,0,0.06)",border:"1.5px solid rgba(255,149,0,0.2)",borderRadius:12,padding:"10px 13px"}}>
                      <div style={{...sf,fontSize:12,color:g4,marginBottom:4}}>Оценка руководителя</div>
                      <div style={{display:"flex",gap:2,marginBottom:3}}>
                        {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,color:n<=t.rating?"#FF9500":"#E5E5EA"}}>★</span>)}
                      </div>
                      {t.rc && <div style={{...sf,fontSize:13,color:g4,fontStyle:"italic"}}>"{t.rc}"</div>}
                    </div>
                  )}
 
                  {/* Кнопки ассистента */}
                  {myRole==="assistant" && t.status==="new" && (
                    <button onClick={()=>upd(t.id,{status:"in_progress"})}
                      style={{...sf,background:B,color:"#fff",border:"none",borderRadius:10,
                        padding:"11px",width:"100%",cursor:"pointer",fontSize:14,fontWeight:600}}>
                      Взять в работу
                    </button>
                  )}
                  {myRole==="assistant" && t.status==="in_progress" && (
                    <div>
                      <AiCheck task={t} onDone={(result)=>upd(t.id,{status:"done",result:result||t.result})}/>
                      {askHelpId===t.id ? (
                        <AstHelpForm
                          onSend={c=>{upd(t.id,{status:"problem",helpComment:c,mgrReply:""});setAskHelpId(null);setOpenId(null);}}
                          onCancel={()=>setAskHelpId(null)}/>
                      ) : (
                        <button onClick={()=>setAskHelpId(t.id)}
                          style={{...sf,width:"100%",background:"rgba(255,59,48,0.06)",
                            border:"1.5px solid rgba(255,59,48,0.18)",borderRadius:10,
                            padding:"10px",cursor:"pointer",fontSize:13,color:R,fontWeight:600,marginTop:8}}>
                          ❗ Нужна помощь руководителя
                        </button>
                      )}
                    </div>
                  )}
                  {/* Ассистент: статус problem */}
                  {myRole==="assistant" && t.status==="problem" && (
                    <AstHelpStatus task={t}
                      onRecall={()=>upd(t.id,{status:"in_progress",helpComment:"",mgrReply:""})}
                      onContinue={()=>upd(t.id,{status:"in_progress",helpComment:"",mgrReply:""})}/>
                  )}
                  {/* Руководитель: видит запрос помощи */}
                  {myRole==="manager" && t.status==="problem" && (
                    <MgrHelpReply task={t} onReply={reply=>upd(t.id,{mgrReply:reply})}/>
                  )}
                  {/* Результат виден всем когда задача выполнена */}
                  {t.status==="done" && t.result && (
                    <div style={{background:"rgba(52,199,89,0.07)",border:"1.5px solid rgba(52,199,89,0.2)",
                      borderRadius:12,padding:"11px 13px",marginTop:8}}>
                      <div style={{...sf,fontSize:11,color:G,fontWeight:700,
                        textTransform:"uppercase",letterSpacing:0.4,marginBottom:5}}>
                        📋 Результат ассистента
                      </div>
                      <div style={{...sf,fontSize:14,color:"#000",lineHeight:1.5}}>{t.result}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
 
      {/* Форма новой задачи */}
      {adding && (
        <div style={{background:WH,borderRadius:18,padding:16,boxShadow:"0 2px 16px rgba(0,0,0,0.10)"}}>
          <div style={{...sf,fontSize:17,fontWeight:700,marginBottom:14}}>Новая задача</div>
          {[["Задача *","title","Что нужно сделать?"],["Ожидаемый результат","er","Что должно получиться? (необязательно)"]].map(([lbl,k,ph])=>(
            <div key={k} style={{marginBottom:10}}>
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>{lbl}</div>
              <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph}
                style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                  padding:"11px 13px",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
          <div style={{marginBottom:10}}>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Детали</div>
            <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}
              placeholder="Дополнительная информация…" rows={2}
              style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                padding:"11px 13px",fontSize:14,outline:"none",resize:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Дедлайн *</div>
              <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}
                style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                  padding:"11px 10px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Важность</div>
              <div style={{display:"flex",gap:5}}>
                {[["low","🟢"],["medium","🟡"],["high","🔴"]].map(([p,ic])=>(
                  <button key={p} onClick={()=>setForm({...form,priority:p})}
                    style={{flex:1,background:form.priority===p?`${PR[p].c}15`:g1,
                      border:`1.5px solid ${form.priority===p?PR[p].c:"transparent"}`,
                      borderRadius:10,padding:"9px 4px",cursor:"pointer",fontSize:18,textAlign:"center"}}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Прикрепить фото */}
          <div style={{marginBottom:10}}>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Вложения</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <label style={{...sf,flex:1,background:form.photo?"rgba(52,199,89,0.08)":g1,
                border:`1.5px solid ${form.photo?G:"transparent"}`,
                borderRadius:10,padding:"9px",cursor:"pointer",fontSize:13,
                color:form.photo?G:g4,fontWeight:600,textAlign:"center",display:"block"}}>
                {form.photo?"✅ Фото":"📷 Фото"}
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setForm(f=>({...f,photo:ev.target.result}));
                    reader.readAsDataURL(file);
                  }}/>
              </label>
              {form.photo && (
                <button onClick={()=>setForm(f=>({...f,photo:null}))}
                  style={{...sf,background:"rgba(255,59,48,0.08)",border:"none",
                    borderRadius:10,padding:"9px 12px",fontSize:13,color:R,cursor:"pointer",fontWeight:600}}>
                  ✕
                </button>
              )}
            </div>
            {form.photo && (
              <img src={form.photo} alt="preview"
                style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:10,marginBottom:8}}/>
            )}
            <input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))}
              placeholder="🔗 Вставьте ссылку (необязательно)"
              style={{...sf,width:"100%",background:g1,border:"none",borderRadius:10,
                padding:"11px 13px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addTask}
              disabled={!form.title||!form.deadline}
              style={{...sf,flex:1,
                background:(!form.title||!form.deadline)?g2:B,
                color:(!form.title||!form.deadline)?g3:"#fff",
                border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
              Поставить задачу
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
  const hrs  = Math.floor(weekSaved/60);
  const mins = weekSaved % 60;
  const savedStr = weekSaved===0 ? "" : hrs>0 ? `${hrs} ч ${mins>0?mins+" мин":""}` : `${mins} мин`;
 
  if (sent) {
    return (
      <div style={{background:"rgba(52,199,89,0.08)",border:"1.5px solid rgba(52,199,89,0.25)",
        borderRadius:18,padding:"16px 18px",marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:6}}>✅</div>
        <div style={{...sf,fontSize:15,fontWeight:700,color:G,marginBottom:3}}>Отчёт отправлен!</div>
        <div style={{...sf,fontSize:13,color:g4}}>Клиент получил итоги недели</div>
      </div>
    );
  }
 
  return (
    <div style={{background:WH,borderRadius:18,overflow:"hidden",
      boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:14}}>
      <div style={{background:"linear-gradient(135deg,rgba(52,199,89,0.12),rgba(52,199,89,0.04))",
        padding:"14px 16px",borderBottom:`0.5px solid rgba(52,199,89,0.2)`}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>📊</span>
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
            <div style={{flex:1,...sf,fontSize:13,color:"#000",lineHeight:1.3}}>{t.title}</div>
            {t.saved && <span style={{...sf,fontSize:11,color:g4,flexShrink:0}}>{fmtMin(t.saved)}</span>}
          </div>
        ))}
        {tasks.length > 4 && (
          <div style={{...sf,fontSize:12,color:g4,padding:"6px 0"}}>+{tasks.length-4} ещё…</div>
        )}
 
        {/* Итоговая строка */}
        {weekSaved > 0 && (
          <div style={{background:"rgba(52,199,89,0.07)",borderRadius:12,padding:"10px 12px",marginTop:10,
            display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>⏱</span>
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
          📤 Отправить итоги клиенту
        </button>
      </div>
    </div>
  );
}
 
// ── ИТОГИ НЕДЕЛИ (вид клиента) ────────────────────────────────────────────────
function WeeklyReportClient({tasks, totalSaved}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || tasks.filter(t=>t.status==="done").length===0) return null;
 
  const done      = tasks.filter(t=>t.status==="done");
  const weekTasks = done.slice(-5);
  const weekSaved = weekTasks.reduce((s,t)=>s+(t.saved||0),0);
  const hrs  = Math.floor(weekSaved/60);
  const mins = weekSaved%60;
  const savedStr = weekSaved===0?"":hrs>0?`${hrs} ч ${mins>0?mins+" мин":""}`:`${mins} мин`;
 
  return (
    <div style={{background:"linear-gradient(135deg,rgba(52,199,89,0.10),rgba(0,122,255,0.06))",
      border:"1.5px solid rgba(52,199,89,0.25)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>📊</span>
          <div style={{...sf,fontSize:15,fontWeight:700}}>Итоги недели от ассистента</div>
        </div>
        <button onClick={()=>setDismissed(true)}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:g4}}>✕</button>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:12}}>
        <div style={{flex:1,background:WH,borderRadius:14,padding:"12px",textAlign:"center",
          boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
          <div style={{...sf,fontSize:28,fontWeight:800,color:B,letterSpacing:-1}}>{weekTasks.length}</div>
          <div style={{...sf,fontSize:11,color:g4,marginTop:2}}>задач\nвыполнено</div>
        </div>
        {weekSaved>0 && <div style={{flex:1,background:WH,borderRadius:14,padding:"12px",textAlign:"center",
          boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
          <div style={{...sf,fontSize:weekSaved>=60?24:28,fontWeight:800,color:G,letterSpacing:-0.5,lineHeight:1.1}}>{savedStr}</div>
          <div style={{...sf,fontSize:11,color:g4,marginTop:2}}>сэкономлено</div>
        </div>}
      </div>
      {weekTasks.map((t,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",
          borderBottom:i<weekTasks.length-1?`0.5px solid ${SEP}`:"none"}}>
          <span style={{color:G,fontSize:13}}>✓</span>
          <span style={{...sf,fontSize:13,flex:1}}>{t.title}</span>
          {t.rating && <div style={{display:"flex",gap:1}}>
            {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:10,color:n<=t.rating?"#FF9500":"#E5E5EA"}}>★</span>)}
          </div>}
        </div>
      ))}
    </div>
  );
}
 
// ── АДМИН-ПАНЕЛЬ ─────────────────────────────────────────────────────────────
const COLORS_LIST = ["#007AFF","#34C759","#FF9500","#AF52DE","#FF2D55","#5AC8FA","#FF6B35","#30D158"];
 
function AdminPanel({users, setUsers, tasks, onDeleteUser}) {
  const [tab,    setTab]    = useState("clients");
  const [modal,  setModal]  = useState(null); // "add_client"|"edit_client"|"add_ast"|"edit_ast"
  const [sel,    setSel]    = useState(null);
  const [form,   setForm]   = useState({});
  const [copied, setCopied] = useState(null);
  const [pwForm, setPwForm] = useState({cur:"", next:"", next2:""});
  const [replaceModal, setReplaceModal] = useState(null); // astId которого заменяем
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null); // {id, name, role}
 
  function deleteUserLocal(id) {
    if (onDeleteUser) onDeleteUser(id);
    setConfirmDeleteUser(null);
  }
  const [pwMsg,  setPwMsg]  = useState("");
 
  const assistants = users.filter(u => u.role==="assistant");
  const managers   = users.filter(u => u.role==="manager");
 
  // ── helpers ──
  function genInitials(name) {
    return name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");
  }
  function openAddClient() {
    setForm({name:"",login:"",pw:"",color:COLORS_LIST[0],astId:assistants[0]?.id||"",subDays:"30"});
    setSel(null); setModal("edit_client");
  }
  function openEditClient(u) {
    setForm({name:u.name,login:u.login,pw:u.pw,color:u.color,astId:u.astId||"",subDays:String(u.subDays||30)});
    setSel(u); setModal("edit_client");
  }
  function saveClient() {
    if (!form.name||!form.login||!form.pw) return;
    const initials = genInitials(form.name);
    const sub = parseInt(form.subDays)||30;
    if (sel) {
      // Всё в одном setUsers вызове — атомарно
      setUsers(p => p.map(u => {
        if (u.id === sel.id) return {...u, ...form, initials, subDays:sub};
        if (form.astId !== sel.astId) {
          if (u.id === sel.astId) return {...u, clients:(u.clients||[]).filter(c=>c!==sel.id)};
          if (u.id === form.astId) return {...u, clients:[...(u.clients||[]), sel.id]};
        }
        return u;
      }));
    } else {
      const id = genId();
      const nu = {id, role:"manager", initials, ...form, subDays:sub,
        info:"", about:"", likes:"", dislikes:"", accesses:[], files:[], active:true};
      // Один setUsers вызов: добавляем клиента И обновляем ассистента
      setUsers(p => {
        const withNew = [...p, nu];
        if (!form.astId) return withNew;
        return withNew.map(u => u.id===form.astId ? {...u, clients:[...(u.clients||[]), id]} : u);
      });
    }
    setModal(null);
  }
  function openAddAst() {
    setForm({name:"",login:"",pw:"",color:COLORS_LIST[1],ratePerClient:"90000"});
    setSel(null); setModal("edit_ast");
  }
  function openEditAst(u) {
    setForm({name:u.name,login:u.login,pw:u.pw,color:u.color,ratePerClient:String(u.ratePerClient||90000)});
    setSel(u); setModal("edit_ast");
  }
  function saveAst() {
    if (!form.name||!form.login||!form.pw) return;
    const initials = genInitials(form.name);
    const rate = parseInt(form.ratePerClient) || 90000;
    if (sel) {
      setUsers(p => p.map(u => u.id===sel.id ? {...u,...form,initials,ratePerClient:rate} : u));
    } else {
      const id = genId();
      setUsers(p => [...p, {id,role:"assistant",initials,...form,ratePerClient:rate,clients:[],active:true}]);
    }
    setModal(null);
  }
  function reassign(mgrId, newAstId) {
    const mgr = users.find(u=>u.id===mgrId);
    if (!mgr || mgr.astId===newAstId) return;
    // Атомарно: всё в одном вызове
    setUsers(p => p.map(u => {
      if (u.id===mgr.astId) return {...u, clients:(u.clients||[]).filter(c=>c!==mgrId)};
      if (u.id===newAstId)  return {...u, clients:[...(u.clients||[]), mgrId]};
      if (u.id===mgrId)     return {...u, astId:newAstId};
      return u;
    }));
  }
 
  function replaceAssistant(oldAstId, newAstId) {
    // Переводим ВСЕХ клиентов от старого ассистента к новому за один вызов
    const oldClients = managers.filter(m => m.astId === oldAstId).map(m => m.id);
    if (oldClients.length === 0 || oldAstId === newAstId) return;
    setUsers(p => p.map(u => {
      if (u.id === oldAstId) return {...u, clients: []};
      if (u.id === newAstId) return {...u, clients: [...new Set([...(u.clients||[]), ...oldClients])]};
      if (oldClients.includes(u.id)) return {...u, astId: newAstId};
      return u;
    }));
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
    const avg = rated.length ? (rated.reduce((a,t)=>a+t.rating,0)/rated.length).toFixed(1) : null;
    return {rated, byStars, avg, total:allTasks.length};
  }
 
  // ── Notifications ──
  const allTasks = Object.values(tasks).flat();
  const notifs = [
    ...managers.filter(m=>m.subDays<=7).map(m=>({text:`⏰ Подписка заканчивается: ${m.name} (${m.subDays} дн.)`, c:O})),
    ...allTasks.filter(t=>t.status==="problem").slice(0,2).map(t=>({text:`❗ Нужна помощь: «${t.title}»`, c:R})),
    ...managers.filter(m=>{
      const ast=users.find(u=>u.id===m.astId);
      return !ast;
    }).map(m=>({text:`⚠️ Нет ассистента: ${m.name}`, c:R})),
  ];
 
  // ── INPUT style ──
  const inp = {...sf,width:"100%",background:g1,border:"none",borderRadius:12,
    padding:"12px 14px",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12};
 
  const TABS_ADM = [["clients","👤 Клиенты"],["assistants","🧠 Ассистенты"],["kpi","📊 КПИ"],["notif","🔔"],["settings","⚙️"]];
 
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      {/* Вкладки */}
      <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",flexShrink:0}}>
        {TABS_ADM.map(([k,l])=>(
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
                        {ast ? <span style={{color:ast.color,fontWeight:600}}>🧠 {ast.name}</span> : <span style={{color:R}}>Нет ассистента</span>}
                        {" · "}<span style={{color:mgr.subDays<=7?R:mgr.subDays<=14?O:G,fontWeight:600}}>{mgr.subDays} дн.</span>
                      </div>
                    </div>
                    <button onClick={()=>openEditClient(mgr)}
                      style={{...sf,background:g1,border:"none",borderRadius:10,
                        padding:"6px 12px",cursor:"pointer",fontSize:13,color:B,fontWeight:600}}>
                      Изменить
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
                              borderRadius:12,padding:"7px 14px",cursor:"pointer",fontSize:13,
                              color:mgr.astId===a.id?a.color:g4,fontWeight:mgr.astId===a.id?700:400}}>
                            {a.name.split(" ")[0]}
                            {mgr.astId===a.id && " ✓"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Логин/пароль */}
                  <div style={{background:g1,borderRadius:12,padding:"10px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{...sf,fontSize:13}}><span style={{color:g4}}>Логин: </span><b>{mgr.login}</b></span>
                      <span style={{...sf,fontSize:13}}><span style={{color:g4}}>Пароль: </span><b>{mgr.pw}</b></span>
                    </div>
                    <button onClick={()=>copyCredentials(mgr)}
                      style={{...sf,background:copied===mgr.id?G:B,color:"#fff",border:"none",
                        borderRadius:10,padding:"9px",cursor:"pointer",fontSize:13,
                        fontWeight:600,width:"100%",transition:"background .2s"}}>
                      {copied===mgr.id?"✓ Скопировано!":"📋 Скопировать и отправить"}
                    </button>
                    <button onClick={()=>setConfirmDeleteUser({id:mgr.id,name:mgr.name,role:"клиента"})}
                      style={{...sf,width:"100%",marginTop:8,
                        background:"rgba(255,59,48,0.07)",
                        border:"1.5px solid rgba(255,59,48,0.2)",
                        borderRadius:10,padding:"10px",cursor:"pointer",
                        fontSize:13,color:R,fontWeight:600}}>
                      🗑 Удалить клиента
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
                overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",opacity:isActive?1:0.55}}>
                <div style={{height:3,background:isActive?ast.color:g3}}/>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <Av u={ast} size={44}/>
                    <div style={{flex:1}}>
                      <div style={{...sf,fontSize:16,fontWeight:700}}>
                        {ast.name}
                        {!isActive && <span style={{...sf,fontSize:11,color:R,marginLeft:8,fontWeight:500}}>● Неактивен</span>}
                      </div>
                      <div style={{...sf,fontSize:12,color:g4}}>{clients.length} клиентов</div>
                    </div>
                    <button onClick={()=>openEditAst(ast)}
                      style={{...sf,background:g1,border:"none",borderRadius:10,
                        padding:"6px 12px",cursor:"pointer",fontSize:13,color:B,fontWeight:600}}>
                      Изменить
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
                        padding:"9px",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .2s"}}>
                      {copied===ast.id?"✓ Скопировано":"📋 Данные для входа"}
                    </button>
                    <button onClick={()=>toggleActive(ast.id)}
                      style={{...sf,background:isActive?"rgba(255,59,48,0.08)":"rgba(52,199,89,0.08)",
                        color:isActive?R:G,border:"none",borderRadius:10,
                        padding:"9px 12px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                      {isActive?"Деактив.":"Активировать"}
                    </button>
                  </div>
                  {/* Кнопка замены — только если есть клиенты */}
                  {clients.length > 0 && (
                    <button onClick={()=>setReplaceModal(ast.id)}
                      style={{...sf,width:"100%",marginTop:8,
                        background:"rgba(255,149,0,0.08)",
                        border:"1.5px solid rgba(255,149,0,0.25)",
                        borderRadius:10,padding:"10px",cursor:"pointer",
                        fontSize:13,color:O,fontWeight:700}}>
                      ⚡ Заменить ассистента ({clients.length} клиентов)
                    </button>
                  )}
                  <button onClick={()=>setConfirmDeleteUser({id:ast.id,name:ast.name,role:"ассистента"})}
                    style={{...sf,width:"100%",marginTop:8,background:"rgba(255,59,48,0.07)",
                      border:"1.5px solid rgba(255,59,48,0.2)",borderRadius:10,padding:"10px",
                      cursor:"pointer",fontSize:13,color:R,fontWeight:600}}>
                    🗑 Удалить ассистента
                  </button>
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
                      <div style={{...sf,fontSize:12,color:g4}}>{total} задач · {rated.length} оценено</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{...sf,fontSize:22,fontWeight:700,color:O}}>
                        {avg ? `★ ${avg}` : "—"}
                      </div>
                      <div style={{...sf,fontSize:10,color:g4}}>средняя</div>
                    </div>
                  </div>
                  {rated.length===0
                    ? <div style={{...sf,fontSize:13,color:g4,textAlign:"center",padding:"8px 0"}}>Нет оценок</div>
                    : <div style={{background:g1,borderRadius:12,padding:"10px 12px"}}>
                        {byStars.map(({s,n})=>{
                          const pct = rated.length ? Math.round(n/rated.length*100) : 0;
                          const icon=["","😕","😐","🙂","😊","🌟"][s];
                          return (
                            <div key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
                              <span style={{fontSize:14,width:20}}>{icon}</span>
                              <div style={{display:"flex",gap:1,width:60}}>
                                {[1,2,3,4,5].map(x=><span key={x} style={{fontSize:10,color:x<=s?"#FF9500":"#E5E5EA"}}>★</span>)}
                              </div>
                              <div style={{flex:1,background:g2,borderRadius:4,height:5,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:"#FF9500",borderRadius:4}}/>
                              </div>
                              <span style={{...sf,fontSize:12,color:g4,width:14,textAlign:"right"}}>{n}</span>
                            </div>
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
                <div style={{fontSize:44}}>✅</div>
                <div style={{...sf,fontSize:15,color:g4,marginTop:8}}>Всё в порядке</div>
              </div>
            : notifs.map((n,i)=>(
                <div key={i} style={{background:WH,borderRadius:14,padding:"13px 16px",marginBottom:8,
                  borderLeft:`3px solid ${n.c}`,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                  <div style={{...sf,fontSize:14,color:"#000",lineHeight:1.4}}>{n.text}</div>
                </div>
              ))
          }
          {/* Сводная статистика */}
          <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",
            letterSpacing:0.4,marginTop:16,marginBottom:10}}>Общая статистика</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {v:managers.length,   l:"Клиентов",   c:B, bg:`${B}0e`, i:"👤"},
              {v:assistants.length, l:"Ассистентов",c:G, bg:`${G}0e`, i:"🧠"},
              {v:Object.values(tasks).flat().length, l:"Всего задач",c:O, bg:`${O}0e`, i:"📋"},
              {v:Object.values(tasks).flat().filter(t=>t.status==="done").length, l:"Выполнено",c:G, bg:`${G}0e`, i:"✅"},
            ].map((m,i)=>(
              <div key={i} style={{background:m.bg,borderRadius:14,padding:"12px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{m.i}</span>
                <div><div style={{...sf,fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div><div style={{...sf,fontSize:11,color:g4}}>{m.l}</div></div>
              </div>
            ))}
          </div>
        </>}
 
        {tab==="settings" && <>
          <div style={{...sf,fontSize:16,fontWeight:700,marginBottom:20}}>⚙️ Настройки администратора</div>
 
          <div style={{background:WH,borderRadius:16,padding:"16px 18px",
            boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginBottom:14}}>
            <div style={{...sf,fontSize:14,fontWeight:700,marginBottom:16}}>🔑 Сменить пароль</div>
 
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Текущий пароль</div>
            <input type="password" value={pwForm.cur}
              onChange={e=>setPwForm({...pwForm,cur:e.target.value})}
              placeholder="Текущий пароль" style={{...inp,marginBottom:12}}/>
 
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Новый пароль</div>
            <input type="password" value={pwForm.next}
              onChange={e=>setPwForm({...pwForm,next:e.target.value})}
              placeholder="Минимум 4 символа" style={{...inp,marginBottom:12}}/>
 
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Повторите новый пароль</div>
            <input type="password" value={pwForm.next2}
              onChange={e=>setPwForm({...pwForm,next2:e.target.value})}
              placeholder="Повторите пароль" style={{...inp,marginBottom:12}}/>
 
            {pwMsg && (
              <div style={{...sf,fontSize:13,borderRadius:10,padding:"10px 13px",marginBottom:12,
                background:pwMsg.startsWith("✅")?"rgba(52,199,89,0.1)":"rgba(255,59,48,0.08)",
                color:pwMsg.startsWith("✅")?"#34C759":"#FF3B30",fontWeight:600}}>
                {pwMsg}
              </div>
            )}
 
            <button onClick={()=>{
              const admin = users.find(u=>u.role==="admin");
              if (!admin) { setPwMsg("❌ Администратор не найден"); return; }
              if (!pwForm.cur) { setPwMsg("❌ Введите текущий пароль"); return; }
              if (pwForm.cur !== admin.pw) { setPwMsg("❌ Неверный текущий пароль"); return; }
              if (pwForm.next.length < 4) { setPwMsg("❌ Пароль слишком короткий (мин. 4 символа)"); return; }
              if (pwForm.next !== pwForm.next2) { setPwMsg("❌ Пароли не совпадают"); return; }
              setUsers(p => p.map(u => u.role==="admin" ? {...u, pw: pwForm.next} : u));
              setPwMsg("✅ Пароль успешно изменён");
              setPwForm({cur:"",next:"",next2:""});
              setTimeout(()=>setPwMsg(""), 4000);
            }} style={{...sf,background:B,color:"#fff",border:"none",borderRadius:12,
              padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",
              boxShadow:"0 4px 14px rgba(0,122,255,0.3)"}}>
              Сохранить новый пароль
            </button>
          </div>
        </>}
      </div>
 
      {/* ── МОДАЛКА: удаление пользователя ── */}
      {confirmDeleteUser && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:20}}>
          <div style={{background:WH,borderRadius:20,padding:28,width:"100%",maxWidth:340,textAlign:"center",
            boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:48,marginBottom:12}}>🗑</div>
            <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:8}}>Удалить {confirmDeleteUser.role}?</div>
            <div style={{...sf,fontSize:14,color:g4,marginBottom:24,lineHeight:1.5}}>
              <b style={{color:"#000"}}>{confirmDeleteUser.name}</b> будет удалён(а) из системы. Это действие нельзя отменить.
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmDeleteUser(null)}
                style={{...sf,flex:1,background:g1,border:"none",borderRadius:12,
                  padding:"13px",fontSize:14,color:g4,cursor:"pointer",fontWeight:600}}>
                Отмена
              </button>
              <button onClick={()=>deleteUserLocal(confirmDeleteUser.id)}
                style={{...sf,flex:1,background:R,border:"none",borderRadius:12,
                  padding:"13px",fontSize:14,color:"#fff",cursor:"pointer",fontWeight:700}}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ── МОДАЛКА: замена ассистента ── */}
      {replaceModal && (() => {
        const modalAstId = replaceModal?.astId || replaceModal;
        const oldAst = users.find(u => u.id === modalAstId);
        const oldClients = managers.filter(m => m.astId === modalAstId);
        const otherAsts = assistants.filter(a => a.id !== modalAstId);
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}
            onClick={()=>setReplaceModal(null)}>
            <div style={{background:WH,borderRadius:"24px 24px 0 0",padding:"12px 22px 44px",
              width:370,maxHeight:"85vh",overflowY:"auto"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{width:40,height:4,background:g2,borderRadius:2,margin:"10px auto 20px"}}/>
 
              {/* Заголовок */}
              <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:4}}>⚡ Заменить ассистента</div>
              <div style={{...sf,fontSize:13,color:g4,marginBottom:16,lineHeight:1.5}}>
                Все клиенты и задачи <b>{oldAst?.name}</b> перейдут к новому ассистенту
              </div>
 
              {/* Клиенты — кликабельные для одиночной замены */}
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>
                Клиентов: {oldClients.length}
              </div>
              <div style={{...sf,fontSize:12,color:g4,marginBottom:10,lineHeight:1.4}}>
                Нажмите на клиента чтобы перевести только его, или выберите ассистента чтобы перевести всех
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {oldClients.map(cl => (
                  <button key={cl.id}
                    onClick={()=>setReplaceModal(prev => ({
                      astId: prev?.astId || prev,
                      single: prev?.single===cl.id ? null : cl.id
                    }))}
                    style={{...sf,
                      background:replaceModal?.single===cl.id?`${cl.color}22`:`${cl.color}10`,
                      border:`1.5px solid ${replaceModal?.single===cl.id?cl.color:`${cl.color}30`}`,
                      borderRadius:10,padding:"5px 12px",fontSize:12,
                      color:cl.color,fontWeight:700,cursor:"pointer"}}>
                    {cl.name.split(" ")[0]}{replaceModal?.single===cl.id?" ✓":""}
                  </button>
                ))}
              </div>
 
              {/* Режим — один или все */}
              {replaceModal?.single ? (
                <div style={{...sf,fontSize:12,background:"rgba(255,149,0,0.08)",
                  border:"1.5px solid rgba(255,149,0,0.25)",borderRadius:10,
                  padding:"9px 12px",color:O,marginBottom:14,fontWeight:600}}>
                  ⚡ Переводим только: {oldClients.find(cl=>cl.id===replaceModal.single)?.name}
                </div>
              ) : (
                <div style={{...sf,fontSize:12,background:"rgba(0,122,255,0.06)",
                  border:"1.5px solid rgba(0,122,255,0.15)",borderRadius:10,
                  padding:"9px 12px",color:B,marginBottom:14,fontWeight:600}}>
                  📋 Все {oldClients.length} клиентов перейдут к выбранному ассистенту
                </div>
              )}
 
              {/* Выбор нового ассистента */}
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}>
                Выберите нового ассистента
              </div>
              {otherAsts.length === 0 ? (
                <div style={{...sf,fontSize:14,color:g4,textAlign:"center",padding:"20px 0"}}>
                  Нет других ассистентов
                </div>
              ) : (
                otherAsts.map(ast => (
                  <button key={ast.id}
                    onClick={()=>{
                      const oldId = replaceModal?.astId || replaceModal;
                      const singleId = replaceModal?.single;
                      if (singleId) {
                        reassign(singleId, ast.id);
                      } else {
                        replaceAssistant(oldId, ast.id);
                      }
                      setReplaceModal(null);
                    }}
                    style={{...sf,width:"100%",background:WH,
                      border:`2px solid ${ast.color}30`,borderRadius:14,
                      padding:"14px 16px",marginBottom:10,cursor:"pointer",
                      display:"flex",alignItems:"center",gap:12,
                      boxShadow:"0 2px 8px rgba(0,0,0,0.06)",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=ast.color}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=`${ast.color}30`}>
                    <Av u={ast} size={40}/>
                    <div>
                      <div style={{...sf,fontSize:15,fontWeight:700,color:"#1C1C1E"}}>{ast.name}</div>
                      <div style={{...sf,fontSize:12,color:g4,marginTop:2}}>
                        Сейчас: {managers.filter(m=>m.astId===ast.id).length} клиентов
                      </div>
                    </div>
                    <div style={{marginLeft:"auto",fontSize:20,color:g3}}>›</div>
                  </button>
                ))
              )}
 
              <button onClick={()=>setReplaceModal(null)}
                style={{...sf,width:"100%",background:g1,border:"none",borderRadius:12,
                  padding:"13px",fontSize:14,color:g4,cursor:"pointer",marginTop:4,fontWeight:600}}>
                Отмена
              </button>
            </div>
          </div>
        );
      })()}
 
      {/* ── МОДАЛКА: клиент ── */}
      {(modal==="edit_client") && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
          display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
          <div style={{background:WH,borderRadius:"24px 24px 0 0",padding:"12px 22px 44px",
            width:370,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{width:40,height:4,background:g2,borderRadius:2,margin:"10px auto 20px"}}/>
            <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:18}}>
              {sel?"Изменить клиента":"Новый клиент"}
            </div>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Имя и фамилия *</div>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Алексей Морозов" style={inp}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:0}}>
              <div>
                <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Логин *</div>
                <input value={form.login} onChange={e=>setForm({...form,login:e.target.value.toLowerCase().replace(/\s/g,"")})} placeholder="alex" style={inp}/>
              </div>
              <div>
                <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Пароль *</div>
                <input value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} placeholder="Пароль" style={inp}/>
              </div>
            </div>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Дней подписки</div>
            <input type="number" value={form.subDays} onChange={e=>setForm({...form,subDays:e.target.value})} placeholder="30" style={inp}/>
            {assistants.length>0 && <>
              <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>Ассистент</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                {assistants.map(a=>(
                  <button key={a.id} onClick={()=>setForm({...form,astId:a.id})}
                    style={{...sf,background:form.astId===a.id?`${a.color}14`:g1,
                      border:`1.5px solid ${form.astId===a.id?a.color:"transparent"}`,
                      borderRadius:12,padding:"8px 16px",cursor:"pointer",fontSize:14,
                      color:form.astId===a.id?a.color:"#000",fontWeight:form.astId===a.id?700:400}}>
                    {a.name}
                  </button>
                ))}
              </div>
            </>}
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:10}}>Цвет</div>
            <div style={{display:"flex",gap:10,marginBottom:22}}>
              {COLORS_LIST.map(col=>(
                <button key={col} onClick={()=>setForm({...form,color:col})}
                  style={{width:34,height:34,borderRadius:"50%",background:col,border:"none",cursor:"pointer",
                    boxShadow:form.color===col?`0 0 0 3px white, 0 0 0 5px ${col}`:"none",transition:"box-shadow .15s"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveClient} disabled={!form.name||!form.login||!form.pw}
                style={{...sf,flex:1,background:(!form.name||!form.login||!form.pw)?g2:B,
                  color:(!form.name||!form.login||!form.pw)?g3:"#fff",border:"none",borderRadius:14,
                  padding:"14px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
                {sel?"Сохранить":"Создать"}
              </button>
              <button onClick={()=>setModal(null)}
                style={{...sf,background:g1,border:"none",borderRadius:14,padding:"14px 18px",
                  fontSize:15,fontWeight:600,cursor:"pointer",color:g4}}>
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
            <div style={{width:40,height:4,background:g2,borderRadius:2,margin:"10px auto 20px"}}/>
            <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:18}}>
              {sel?"Изменить ассистента":"Новый ассистент"}
            </div>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Имя и фамилия *</div>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Мария Кузнецова" style={inp}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Логин *</div>
                <input value={form.login} onChange={e=>setForm({...form,login:e.target.value.toLowerCase().replace(/\s/g,"")})} placeholder="maria" style={inp}/>
              </div>
              <div>
                <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Пароль *</div>
                <input value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} placeholder="Пароль" style={inp}/>
              </div>
            </div>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:10}}>Цвет</div>
            <div style={{display:"flex",gap:10,marginBottom:22}}>
              {COLORS_LIST.map(col=>(
                <button key={col} onClick={()=>setForm({...form,color:col})}
                  style={{width:34,height:34,borderRadius:"50%",background:col,border:"none",cursor:"pointer",
                    boxShadow:form.color===col?`0 0 0 3px white, 0 0 0 5px ${col}`:"none",transition:"box-shadow .15s"}}/>
              ))}
            </div>
            <div style={{...sf,fontSize:11,color:g4,fontWeight:600,textTransform:"uppercase",marginBottom:8}}>Ставка за каждого клиента (₸)</div>
            <div style={{...sf,fontSize:11,color:g4,marginBottom:10}}>Заполни только те строки, сколько клиентов ведёт ассистент</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              {["1-й клиент","2-й клиент","3-й клиент"].map((lbl,i)=>(
                <div key={i}>
                  <div style={{...sf,fontSize:10,color:g4,marginBottom:4}}>{lbl}</div>
                  <input type="number"
                    value={form[`rate${i}`]!==undefined ? form[`rate${i}`] : (i===0 ? (form.ratePerClient||"") : "")}
                    onChange={e=>{
                      const val = e.target.value;
                      const updated = {...form, [`rate${i}`]: val};
                      if(i===0) updated.ratePerClient = val;
                      setForm(updated);
                    }}
                    placeholder={i===0?"90000":"(не заполнено)"} style={inp}/>
                </div>
              ))}
            </div>
            {(()=>{
              const r0 = parseInt(form.rate0||form.ratePerClient)||0;
              const r1 = parseInt(form.rate1)||0;
              const r2 = parseInt(form.rate2)||0;
              const total = r0+r1+r2;
              const filled = [r0,r1,r2].filter(x=>x>0).length;
              return total>0?(
                <div style={{...sf,fontSize:12,color:g4,marginBottom:18,padding:"8px 10px",background:g1,borderRadius:10}}>
                  {filled} клиент(а): итого <b style={{color:B}}>{total.toLocaleString("ru")} ₸/мес</b>
                </div>
              ):<div style={{marginBottom:18}}/>;
            })()}
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveAst} disabled={!form.name||!form.login||!form.pw}
                style={{...sf,flex:1,background:(!form.name||!form.login||!form.pw)?g2:B,
                  color:(!form.name||!form.login||!form.pw)?g3:"#fff",border:"none",borderRadius:14,
                  padding:"14px",fontSize:15,fontWeight:600,cursor:"pointer"}}>
                {sel?"Сохранить":"Создать"}
              </button>
              <button onClick={()=>setModal(null)}
                style={{...sf,background:g1,border:"none",borderRadius:14,padding:"14px 18px",
                  fontSize:15,fontWeight:600,cursor:"pointer",color:g4}}>
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
 
// ── CEO ПАНЕЛЬ ──
// ── ДИЗАЙН-СИСТЕМА ────────────────────────────────────────────────────────────
const csf = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" };
const C = {
  blue:   "#0066FF",
  navy:   "#0A1A3A",
  lblue:  "#E8F0FF",
  white:  "#FFFFFF",
  bg:     "#F7F9FC",
  card:   "#FFFFFF",
  border: "#E2EAF4",
  gray:   "#6B7A99",
  lgray:  "#F0F4FA",
  green:  "#00B87A",
  orange: "#FF8800",
  red:    "#FF3B30",
  cyan:   "#00AAFF",
};
 
const shadow = "0 2px 12px rgba(0,102,255,0.08)";
const shadowMd = "0 4px 20px rgba(0,102,255,0.12)";
 
// ── ДАННЫЕ ────────────────────────────────────────────────────────────────────
const USERS = [
  { id:"ceo1",  login:"ceo",      pw:"ceo123", role:"ceo",       name:"Авт" },
  { id:"adm1",  login:"admin",    pw:"admin123",role:"admin",    name:"Администратор" },
  { id:"a1",    login:"maria",    pw:"12345",  role:"assistant", name:"Мария" },
  { id:"a2",    login:"alina",    pw:"12345",  role:"assistant", name:"Алина" },
  { id:"c1",    login:"aidar",    pw:"12345",  role:"client",    name:"Айдар Сейткали" },
  { id:"c2",    login:"svetlana", pw:"12345",  role:"client",    name:"Светлана Петрова" },
];
 
const CEO_MONTHS = [
  { id:"2025-01", label:"Январь 2025", clients:[
    {name:"Алексей Морозов",  income:165000,astSalary:90000,expenses:5000},
    {name:"Светлана Петрова", income:165000,astSalary:90000,expenses:3000},
  ], general:40000, notes:"" },
  { id:"2025-02", label:"Февраль 2025", clients:[
    {name:"Алексей Морозов",  income:165000,astSalary:90000,expenses:5000},
    {name:"Светлана Петрова", income:165000,astSalary:90000,expenses:3000},
    {name:"Дмитрий Волков",   income:165000,astSalary:90000,expenses:2000},
  ], general:42000, notes:"" },
  { id:"2025-03", label:"Март 2025", clients:[
    {name:"Алексей Морозов",  income:165000,astSalary:90000,expenses:5000},
    {name:"Светлана Петрова", income:165000,astSalary:90000,expenses:3000},
    {name:"Дмитрий Волков",   income:165000,astSalary:90000,expenses:2000},
    {name:"Айдар Сейткали",   income:165000,astSalary:90000,expenses:4000},
  ], general:45000, notes:"" },
];
 
const ASSISTANTS_DATA = [
  {id:"a1",name:"Мария", clients:2,tasksDone:13,avgRating:4.5,lastSeen:Date.now()-5*60000},
  {id:"a2",name:"Алина", clients:2,tasksDone:9, avgRating:3.2,lastSeen:Date.now()-130*60000},
  {id:"a3",name:"Трдат", clients:0,tasksDone:0, avgRating:null,lastSeen:Date.now()-3*24*60*60000},
];
 
const CRM_CLIENTS = [
  {id:"c1",name:"Алексей Морозов", status:"active", lastCall:"2025-03-10", nextCall:"2025-03-24", rating:4.8, debt:0},
  {id:"c2",name:"Светлана Петрова",status:"active", lastCall:"2025-03-14", nextCall:"2025-03-28", rating:4.2, debt:0},
  {id:"c3",name:"Дмитрий Волков",  status:"pause",  lastCall:"2025-03-01", nextCall:"2025-03-16", rating:3.1, debt:165000},
  {id:"c4",name:"Айдар Сейткали",  status:"new",    lastCall:"2025-03-12", nextCall:"2025-03-26", rating:4.5, debt:0},
];
 
const fmt = n => Number(n).toLocaleString("ru") + " ₸";
const fmtD = d => new Date(d).toLocaleDateString("ru",{day:"numeric",month:"short"});
const diffD = d => Math.ceil((new Date(d)-new Date())/86400000);
const lastSeen = ts => {
  const m = Math.floor((Date.now()-ts)/60000);
  if(m<2)  return {t:"онлайн",c:C.green};
  if(m<60) return {t:`${m} мин`,c:C.green};
  const h = Math.floor(m/60);
  if(h<2)  return {t:`${h}ч назад`,c:C.orange};
  if(h<24) return {t:`${h}ч назад`,c:C.red};
  return {t:`${Math.floor(h/24)}д назад`,c:C.red};
};
const calcM = m => {
  const inc = m.clients.reduce((s,c)=>s+c.income,0);
  const exp = m.clients.reduce((s,c)=>s+c.astSalary+c.expenses,0)+m.general;
  const prf = inc-exp;
  return {inc,exp,prf,margin:inc>0?Math.round((prf/inc)*100):0,reinvest:Math.round(prf*0.2)};
};
 
// ── UI КОМПОНЕНТЫ ─────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:shadow,...style}}>{children}</div>
);
 
const Badge = ({label,color=C.blue,bg}) => (
  <span style={{...csf,fontSize:10,fontWeight:700,color,background:bg||color+"18",borderRadius:6,padding:"2px 8px",letterSpacing:0.3}}>{label}</span>
);
 
const Btn = ({children,onClick,variant="primary",style={}}) => {
  const styles = {
    primary:  {background:C.blue,color:C.white,border:"none"},
    secondary:{background:C.lgray,color:C.navy,border:`1px solid ${C.border}`},
    danger:   {background:"rgba(255,59,48,0.06)",color:C.red,border:"1px solid rgba(255,59,48,0.2)"},
  };
  return <button onClick={onClick} style={{...csf,...styles[variant],borderRadius:12,padding:"11px 18px",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%",boxShadow:variant==="primary"?shadowMd:"none",...style}}>{children}</button>;
};
 
const StatCard = ({label,value,color=C.blue,small=false}) => (
  <Card style={{padding:"14px 16px"}}>
    <div style={{...csf,fontSize:10,color:C.gray,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{label}</div>
    <div style={{...csf,fontSize:small?18:22,fontWeight:800,color}}>{value}</div>
  </Card>
);
 
const SectionLabel = ({children}) => (
  <div style={{...csf,fontSize:10,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:1,marginBottom:10,marginTop:4}}>{children}</div>
);
 
// ── ЭКРАН ВХОДА ───────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [login,setLogin] = useState("");
  const [pw,setPw]       = useState("");
  const [err,setErr]     = useState("");
 
  const go = () => {
    const u = USERS.find(u=>u.login===login.trim().toLowerCase()&&u.pw===pw);
    if(u) onLogin(u); else setErr("Неверный логин или пароль");
  };
 
  const hints = [{role:"СЕО",l:"ceo",p:"ceo123"},{role:"Админ",l:"admin",p:"admin123"},{role:"Ассистент",l:"maria",p:"12345"},{role:"Клиент",l:"aidar",p:"12345"}];
 
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:360}}>
        {/* Логотип */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:20,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:shadowMd}}>
            <span style={{fontSize:28,color:C.white,fontWeight:800}}>✦</span>
          </div>
          <div style={{...csf,fontSize:24,fontWeight:800,color:C.navy}}>MyAssistant</div>
          <div style={{...csf,fontSize:13,color:C.gray,marginTop:4}}>Войдите в свой аккаунт</div>
        </div>
 
        {/* Форма */}
        <Card style={{padding:"24px 20px",marginBottom:14}}>
          {[["Логин",login,setLogin,"text","Введите логин"],["Пароль",pw,setPw,"password","••••••"]].map(([label,val,set,type,ph])=>(
            <div key={label} style={{marginBottom:14}}>
              <div style={{...csf,fontSize:11,fontWeight:600,color:C.gray,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{label}</div>
              <input type={type} value={val} placeholder={ph}
                onChange={e=>{set(type==="text"?e.target.value.toLowerCase():e.target.value);setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&go()}
                style={{...csf,width:"100%",background:C.lgray,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 14px",fontSize:15,color:C.navy,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
          {err&&<div style={{...csf,fontSize:13,color:C.red,marginBottom:12,textAlign:"center",fontWeight:600}}>{err}</div>}
          <Btn onClick={go}>Войти</Btn>
        </Card>
 
        {/* Демо подсказки */}
        <Card style={{padding:"14px 16px"}}>
          <div style={{...csf,fontSize:10,fontWeight:700,color:C.gray,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Демо — нажми чтобы войти</div>
          {hints.map((h,i)=>(
            <div key={i} onClick={()=>{setLogin(h.l);setPw(h.p);setErr("");}}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<hints.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
              <div style={{...csf,fontSize:13,fontWeight:600,color:C.navy}}>{h.role}</div>
              <div style={{...csf,fontSize:12,color:C.gray}}><span style={{color:C.blue,fontWeight:600}}>{h.l}</span> / {h.p}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
 
// ── ШАПКА ─────────────────────────────────────────────────────────────────────
function Header({title,subtitle,onLogout,children}) {
  return (
    <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 18px 0",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 0 "+C.border}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:children?10:14}}>
        <div>
          <div style={{...csf,fontSize:18,fontWeight:800,color:C.navy}}>{title}</div>
          {subtitle&&<div style={{...csf,fontSize:12,color:C.gray,marginTop:2}}>{subtitle}</div>}
        </div>
        <button onClick={onLogout} style={{...csf,background:C.lgray,border:`1px solid ${C.border}`,borderRadius:10,padding:"6px 14px",fontSize:12,color:C.gray,cursor:"pointer",fontWeight:600}}>Выйти</button>
      </div>
      {children}
    </div>
  );
}
 
function Tabs({tabs,active,onChange}) {
  return (
    <div style={{display:"flex",gap:0,overflowX:"auto",paddingBottom:0}}>
      {tabs.map(t=>(
        <button key={t.k} onClick={()=>onChange(t.k)}
          style={{...csf,flex:"none",background:"none",border:"none",cursor:"pointer",padding:"8px 12px 11px",fontSize:11,fontWeight:active===t.k?700:500,color:active===t.k?C.blue:C.gray,borderBottom:`2.5px solid ${active===t.k?C.blue:"transparent"}`,whiteSpace:"nowrap",transition:"all 0.15s"}}>
          {t.l}
        </button>
      ))}
    </div>
  );
}
 
// ── СЕО — ФИНАНСЫ ─────────────────────────────────────────────────────────────
function CEOFinance() {
  const [months,setMonths] = useState(CEO_MONTHS);
  const [sel,setSel]       = useState("2025-03");
  const [edit,setEdit]     = useState(null);
  const [ev,setEv]         = useState("");
  const [adding,setAdding] = useState(false);
  const [newLabel,setNewLabel] = useState("");
 
  const m = months.find(x=>x.id===sel);
  if(!m) return null;
  const c = calcM(m);
  const all = months.map(mo=>({...calcM(mo),id:mo.id,label:mo.label}));
 
  const startE=(k,v)=>{setEdit(k);setEv(String(v));};
  const commitE=(mId,field,ci=null)=>{
    const v=parseInt(String(ev).replace(/\s/g,""))||0;
    setMonths(p=>p.map(mo=>mo.id!==mId?mo:{...mo,
      ...(ci!==null?{clients:mo.clients.map((cl,i)=>i===ci?{...cl,[field]:v}:cl)}:{[field]:v})
    }));
    setEdit(null);
  };
  const N=({k,v,onC})=>edit===k
    ?<input autoFocus value={ev} onChange={e=>setEv(e.target.value)} onBlur={onC} onKeyDown={e=>e.key==="Enter"&&onC()}
        style={{...csf,width:110,background:C.lgray,border:`1.5px solid ${C.blue}`,borderRadius:8,padding:"5px 10px",fontSize:13,color:C.navy,textAlign:"right",outline:"none"}}/>
    :<span onClick={()=>startE(k,v)} style={{...csf,fontSize:13,fontWeight:700,color:C.navy,cursor:"pointer",borderBottom:`1px dashed ${C.border}`}}>{fmt(v)}</span>;
 
  return (
    <div>
      {/* Выбор месяца */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
        {months.map(mo=>{const mc=calcM(mo);return(
          <button key={mo.id} onClick={()=>setSel(mo.id)}
            style={{...csf,flexShrink:0,background:sel===mo.id?C.blue:C.white,border:`1.5px solid ${sel===mo.id?C.blue:C.border}`,borderRadius:12,padding:"9px 14px",cursor:"pointer",textAlign:"center",boxShadow:sel===mo.id?shadowMd:shadow,transition:"all 0.15s"}}>
            <div style={{fontSize:11,fontWeight:700,color:sel===mo.id?C.white:C.navy}}>{mo.label}</div>
            <div style={{fontSize:11,color:sel===mo.id?"rgba(255,255,255,0.8)":mc.prf>=0?C.green:C.red,marginTop:2,fontWeight:600}}>{fmt(mc.prf)}</div>
          </button>
        );})}
        <button onClick={()=>setAdding(true)} style={{...csf,flexShrink:0,background:C.white,border:`1.5px dashed ${C.border}`,borderRadius:12,padding:"9px 14px",cursor:"pointer",fontSize:12,color:C.gray}}>+ Месяц</button>
      </div>
 
      {adding&&(
        <Card style={{padding:16,marginBottom:14}}>
          <div style={{...csf,fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>Новый месяц</div>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Апрель 2025"
            style={{...csf,width:"100%",background:C.lgray,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>{if(!newLabel)return;const id=`m-${Date.now()}`;setMonths(p=>[...p,{id,label:newLabel,clients:[...m.clients],general:m.general,notes:""}]);setSel(id);setAdding(false);setNewLabel("");}}>Создать</Btn>
            <Btn variant="secondary" onClick={()=>setAdding(false)}>Отмена</Btn>
          </div>
        </Card>
      )}
 
      {/* Сводка */}
      <SectionLabel>{m.label} — сводка</SectionLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <StatCard label="Выручка"  value={fmt(c.inc)} color={C.blue}/>
        <StatCard label="Расходы"  value={fmt(c.exp)} color={C.red}/>
        <StatCard label="Прибыль"  value={fmt(c.prf)} color={c.prf>=0?C.green:C.red}/>
        <StatCard label="Маржа"    value={c.margin+"%"} color={c.margin>=40?C.green:C.orange}/>
      </div>
 
      {/* Реинвестиция */}
      <div style={{background:C.lblue,borderRadius:14,padding:"12px 16px",marginBottom:16,border:`1px solid ${C.blue}20`}}>
        <div style={{...csf,fontSize:11,fontWeight:700,color:C.blue,marginBottom:3}}>Реинвестиция 20% этого месяца</div>
        <div style={{...csf,fontSize:22,fontWeight:800,color:C.blue}}>{fmt(c.reinvest)}</div>
        <div style={{...csf,fontSize:11,color:C.gray,marginTop:2}}>Направить на рекламу в следующем месяце</div>
      </div>
 
      {/* По клиентам */}
      <SectionLabel>По клиентам · нажми чтобы изменить</SectionLabel>
      {m.clients.map((cl,ci)=>{
        const p=cl.income-cl.astSalary-cl.expenses;
        const cm=cl.income>0?Math.round((p/cl.income)*100):0;
        return(
          <Card key={ci} style={{padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy}}>{cl.name}</div>
              <Badge label={cm+"%"} color={cm>=40?C.green:C.orange}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{l:"Доход",k:"income",v:cl.income},{l:"З/п асс.",k:"astSalary",v:cl.astSalary},{l:"Расходы",k:"expenses",v:cl.expenses},{l:"Прибыль",k:null,v:p}].map((r,ri)=>(
                <div key={ri} style={{background:C.lgray,borderRadius:10,padding:"8px 12px"}}>
                  <div style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:0.3,marginBottom:3}}>{r.l}</div>
                  {r.k?<N k={`${m.id}-${ci}-${r.k}`} v={r.v} onC={()=>commitE(m.id,r.k,ci)}/>
                      :<div style={{...csf,fontSize:13,fontWeight:700,color:p>=0?C.green:C.red}}>{fmt(p)}</div>}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
 
      {/* Общие расходы */}
      <Card style={{padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{...csf,fontSize:13,color:C.navy}}>Общие расходы</div>
        <N k={`${m.id}-gen`} v={m.general} onC={()=>commitE(m.id,"general")}/>
      </Card>
 
      {/* Динамика */}
      <SectionLabel>Динамика прибыли по месяцам</SectionLabel>
      <Card style={{padding:"4px 0"}}>
        {all.map((mo,i)=>{
          const prev=i>0?all[i-1].prf:null;
          const diff=prev!==null?mo.prf-prev:null;
          return(
            <div key={mo.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<all.length-1?`1px solid ${C.border}`:"none",background:sel===mo.id?C.lblue:"transparent",borderRadius:i===0?"16px 16px 0 0":i===all.length-1?"0 0 16px 16px":"0"}}>
              <div style={{...csf,fontSize:13,fontWeight:sel===mo.id?700:500,color:sel===mo.id?C.blue:C.navy}}>{mo.label}</div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {diff!==null&&<div style={{...csf,fontSize:11,fontWeight:600,color:diff>=0?C.green:C.red}}>{diff>=0?"+":""}{fmt(diff)}</div>}
                <div style={{...csf,fontSize:13,fontWeight:700,color:mo.prf>=0?C.green:C.red}}>{fmt(mo.prf)}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
 
// ── СЕО — КОМАНДА ─────────────────────────────────────────────────────────────
function CEOTeam({asts}) {
  const astList = (asts||[]).filter(u=>u.role==="assistant");
  return (
    <div>
      <SectionLabel>Ассистенты · Last seen</SectionLabel>
      {astList.length===0&&<div style={{...csf,fontSize:13,color:C.gray,padding:"20px 0",textAlign:"center"}}>Ассистенты не добавлены</div>}
      {astList.map(a=>{
        const aExt = {
          ...a,
          clients: (asts||[]).filter(u=>u.role==="manager"&&(u.astId===aExt.id||(aExt.clients||[]).includes(u.id))).length,
          tasksDone: 0,
          avgRating: aExt.avgRating||null,
          lastSeen: aExt.lastSeen||Date.now()-60*60000,
        };
        const ls=lastSeen(aExt.lastSeen);
        const offline=Date.now()-aExt.lastSeen>2*60*60000;
        const lowR=aExt.avgRating&&aExt.avgRating<4.0;
        return(
          <Card key={aExt.id} style={{marginBottom:10,overflow:"hidden",opacity:aExt.clients===0?0.55:1}}>
            <div style={{height:3,background:offline&&aExt.clients>0?C.red:lowR?C.orange:C.blue}}/>
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{position:"relative"}}>
                  <div style={{width:46,height:46,borderRadius:"50%",background:C.lblue,color:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,...sf}}>{aExt.name[0]}</div>
                  <div style={{position:"absolute",bottom:1,right:1,width:12,height:12,borderRadius:"50%",background:ls.c,border:"2px solid "+C.white}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{...csf,fontSize:15,fontWeight:700,color:C.navy}}>{aExt.name}</div>
                  <div style={{...csf,fontSize:12,color:ls.c,fontWeight:600}}>● {ls.t}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  {aExt.avgRating&&<div style={{...csf,fontSize:15,fontWeight:800,color:aExt.avgRating>=4?C.green:aExt.avgRating>=3?C.orange:C.red}}>★ {aExt.avgRating}</div>}
                  {offline&&aExt.clients>0&&<Badge label="2ч+" color={C.red}/>}
                  {lowR&&<Badge label="Низкий рейтинг" color={C.orange}/>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:"Клиентов",v:aExt.clients},{l:"Выполнено",v:aExt.tasksDone},{l:"Рейтинг",v:aExt.avgRating?"★ "+aExt.avgRating:"—"}].map((m,i)=>(
                  <div key={i} style={{background:C.lgray,borderRadius:10,padding:"8px",textAlign:"center"}}>
                    <div style={{...csf,fontSize:18,fontWeight:800,color:C.blue}}>{m.v}</div>
                    <div style={{...csf,fontSize:9,color:C.gray,marginTop:2,textTransform:"uppercase"}}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
 
// ── СЕО — CRM ─────────────────────────────────────────────────────────────────
function CEOCRM() {
  const [clients,setClients] = useState(CRM_CLIENTS);
  const [open,setOpen]       = useState(null);
 
  const STATUSES = [{k:"new",l:"Новый",c:C.cyan},{k:"active",l:"В работе",c:C.green},{k:"pause",l:"Пауза",c:C.orange},{k:"potential",l:"Потенциал",c:C.blue},{k:"lost",l:"Потерян",c:C.red}];
  const totalDebt = clients.reduce((s,c)=>s+c.debt,0);
 
  return (
    <div>
      {totalDebt>0&&(
        <div style={{background:"rgba(255,59,48,0.05)",border:"1px solid rgba(255,59,48,0.15)",borderRadius:12,padding:"11px 14px",marginBottom:14}}>
          <div style={{...csf,fontSize:13,color:C.red,fontWeight:700}}>Общий долг клиентов: {fmt(totalDebt)}</div>
        </div>
      )}
      <SectionLabel>Клиенты</SectionLabel>
      {clients.map(c=>{
        const st=STATUSES.find(s=>s.k===c.status);
        const d=diffD(c.nextCall);
        const dc=d<0?C.red:d<=3?C.orange:C.green;
        const isOpen=open===c.id;
        return(
          <Card key={c.id} style={{marginBottom:10,overflow:"hidden"}}>
            <div style={{height:3,background:st.c}}/>
            <div style={{padding:"13px 16px",cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:c.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy}}>{c.name}</div>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <Badge label={st.l} color={st.c}/>
                    {c.debt>0&&<Badge label="Долг" color={C.red}/>}
                    <span style={{...csf,fontSize:10,color:C.gray}}>★ {c.rating}</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{...csf,fontSize:11,fontWeight:700,color:dc}}>{d<0?`просроч. ${Math.abs(d)}д`:d===0?"сегодня":`через ${d}д`}</div>
                  <div style={{...csf,fontSize:10,color:C.gray}}>звонок</div>
                  <div style={{...csf,fontSize:11,color:C.gray,marginTop:3}}>{isOpen?"▲":"▼"}</div>
                </div>
              </div>
            </div>
            {isOpen&&(
              <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 16px"}} onClick={e=>e.stopPropagation()}>
                <SectionLabel>Статус клиента</SectionLabel>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  {STATUSES.map(s=>(
                    <button key={s.k} onClick={()=>setClients(p=>p.map(cl=>cl.id===c.id?{...cl,status:s.k}:cl))}
                      style={{...csf,background:c.status===s.k?s.c+"18":C.lgray,border:`1.5px solid ${c.status===s.k?s.c:C.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,color:c.status===s.k?s.c:C.gray,cursor:"pointer",fontWeight:c.status===s.k?700:500}}>
                      {s.l}
                    </button>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  <div style={{background:C.lgray,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",marginBottom:2}}>Последний звонок</div>
                    <div style={{...csf,fontSize:13,fontWeight:600,color:C.navy}}>{fmtD(c.lastCall)}</div>
                  </div>
                  <div style={{background:C.lgray,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",marginBottom:2}}>Следующий</div>
                    <div style={{...csf,fontSize:13,fontWeight:700,color:dc}}>{fmtD(c.nextCall)}</div>
                  </div>
                </div>
                <Btn onClick={()=>{const next=new Date();next.setDate(next.getDate()+14);setClients(p=>p.map(cl=>cl.id===c.id?{...cl,lastCall:new Date().toISOString().split("T")[0],nextCall:next.toISOString().split("T")[0]}:cl));}}>
                  ✓ Позвонил — следующий через 14 дней
                </Btn>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
 
// ── СЕО — ЗАРПЛАТЫ ───────────────────────────────────────────────────────────
// Начальные данные ведомости по месяцам
// ── ЛОГИКА ЗАРПЛАТЫ ──────────────────────────────────────────────────────────
// За каждого клиента: 90,000 фикс + КПИ за оценку (градация) + КПИ за продление
// Оценка 5★ → 7,500 | 4★ → 5,000 | 3★ → 2,500 | <3 → 0
// Продление → 7,500 | Максимум КПИ: 15,000 за клиента
 
const FIX_PER_CLIENT     = 90000;  // фикс за каждого клиента
const KPI_MAX_PER_CLIENT = 15000;  // макс КПИ за одного клиента
const KPI_RENEWAL_SHARE  = 7500;   // 50% КПИ — за продление подписки
 
// 50% КПИ — градация за оценку
function kpiByRating(stars) {
  if (stars >= 5) return 7500;
  if (stars >= 4) return 5000;
  if (stars >= 3) return 2500;
  return 0;
}
 
// Клиенты в строке ведомости
// { name, stars (оценка 0-5), kpiRenewal (0 или 7500) }
const SAL_MONTHS_INIT = [
  { id:"sal-2025-01", label:"Январь 2025", payDate:"2025-02-01",
    rows:[
      { id:"a1", name:"Мария", paid:true, paidDate:"2025-02-01",
        clients:[
          {name:"Алексей",  stars:5, kpiRenewal:7500},
          {name:"Светлана", stars:4, kpiRenewal:0},
        ]},
      { id:"a2", name:"Алина", paid:true, paidDate:"2025-02-01",
        clients:[
          {name:"Дмитрий",  stars:2, kpiRenewal:7500},
        ]},
    ]},
  { id:"sal-2025-02", label:"Февраль 2025", payDate:"2025-03-01",
    rows:[
      { id:"a1", name:"Мария", paid:true, paidDate:"2025-03-01",
        clients:[
          {name:"Алексей",  stars:5, kpiRenewal:7500},
          {name:"Светлана", stars:5, kpiRenewal:7500},
        ]},
      { id:"a2", name:"Алина", paid:false, paidDate:null,
        clients:[
          {name:"Дмитрий",  stars:3, kpiRenewal:0},
          {name:"Айдар",    stars:5, kpiRenewal:7500},
        ]},
    ]},
  { id:"sal-2025-03", label:"Март 2025", payDate:"2025-04-01",
    rows:[
      { id:"a1", name:"Мария", paid:false, paidDate:null,
        clients:[
          {name:"Алексей",  stars:0, kpiRenewal:0},
          {name:"Светлана", stars:0, kpiRenewal:0},
        ]},
      { id:"a2", name:"Алина", paid:false, paidDate:null,
        clients:[
          {name:"Дмитрий",  stars:0, kpiRenewal:0},
          {name:"Айдар",    stars:0, kpiRenewal:0},
        ]},
    ]},
];
 
// Считает итог по одному клиенту
function calcClient(cl) {
  const kpiR  = kpiByRating(cl.stars);
  const kpi   = kpiR + cl.kpiRenewal;
  const total = FIX_PER_CLIENT + kpi;
  return { kpiR, kpi, total };
}
 
// Считает итог по всей строке ассистента
function calcSalRow(r) {
  const clients  = r.clients || [];
  const fixTotal = clients.length * FIX_PER_CLIENT;
  const kpiTotal = clients.reduce((s,cl)=>s+kpiByRating(cl.stars)+cl.kpiRenewal, 0);
  const total    = fixTotal + kpiTotal;
  return { fixTotal, kpiTotal, total, clientCount: clients.length };
}
 
function CEOSalary({months, setMonths}) {
  if (!months) return null;
  const [sel,    setSel]    = useState("sal-2025-03");
  const [edit,   setEdit]   = useState(null);
  const [ev,     setEv]     = useState("");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
 
  const today    = new Date();
  const nextPay  = new Date(today.getFullYear(), today.getMonth()+1, 1);
  const dLeft    = Math.ceil((nextPay - today) / 86400000);
 
  const m = months.find(x => x.id === sel);
  if (!m) return null;
 
  const totalM  = m.rows.reduce((s,r)=>s+calcSalRow(r).total, 0);
  const unpaidM = m.rows.filter(r=>!r.paid).reduce((s,r)=>s+calcSalRow(r).total, 0);
  const paidM   = m.rows.filter(r=>r.paid).reduce((s,r)=>s+calcSalRow(r).total, 0);
  const allDebt = months.reduce((s,mo)=>s+mo.rows.filter(r=>!r.paid).reduce((ss,r)=>ss+calcSalRow(r).total,0), 0);
 
  const startE = (k,v) => { setEdit(k); setEv(String(v)); };
  const commitE = (mId, rid, field) => {
    const v = parseInt(String(ev).replace(/\s/g,"")) || 0;
    setMonths(p=>p.map(mo=>mo.id!==mId?mo:{...mo,rows:mo.rows.map(r=>r.id!==rid?r:{...r,[field]:v})}));
    setEdit(null);
  };
  const togglePaid = (mId, rid) => {
    setMonths(p=>p.map(mo=>mo.id!==mId?mo:{...mo,rows:mo.rows.map(r=>r.id!==rid?r:{...r,paid:!r.paid,paidDate:!r.paid?new Date().toISOString().split("T")[0]:null})}));
  };
  const payAll = (mId) => {
    const today = new Date().toISOString().split("T")[0];
    setMonths(p=>p.map(mo=>mo.id!==mId?mo:{...mo,rows:mo.rows.map(r=>({...r,paid:true,paidDate:today}))}));
  };
  const addMonth = () => {
    if (!newLabel.trim()) return;
    const id = `sal-${Date.now()}`;
    setMonths(p=>[...p, { id, label:newLabel.trim(), payDate:"", rows: m.rows.map(r=>({...r,paid:false,paidDate:null,clients:r.clients.map(cl=>({...cl,stars:0,kpiRenewal:0}))})) }]);
    setSel(id);
    setAdding(false);
    setNewLabel("");
  };
 
  const N = ({k,v,onC}) => edit===k
    ? <input autoFocus value={ev} onChange={e=>setEv(e.target.value)} onBlur={onC} onKeyDown={e=>e.key==="Enter"&&onC()}
        style={{...csf,width:90,background:C.lgray,border:`1.5px solid ${C.blue}`,borderRadius:8,padding:"5px 10px",fontSize:13,color:C.navy,outline:"none"}}/>
    : <span onClick={()=>startE(k,v)} style={{...csf,fontSize:13,fontWeight:700,color:C.navy,cursor:"pointer",borderBottom:`1px dashed ${C.border}`}}>{fmt(v)}</span>;
 
  return (
    <div>
      {/* Переключатель месяцев */}
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
        {months.map(mo=>{
          const tot  = mo.rows.reduce((s,r)=>s+calcSalRow(r).total,0);
          const debt = mo.rows.some(r=>!r.paid);
          return (
            <button key={mo.id} onClick={()=>setSel(mo.id)}
              style={{...csf,flexShrink:0,background:sel===mo.id?C.blue:C.white,border:`1.5px solid ${sel===mo.id?C.blue:C.border}`,borderRadius:12,padding:"9px 14px",cursor:"pointer",textAlign:"center",boxShadow:sel===mo.id?shadowMd:shadow,transition:"all 0.15s"}}>
              <div style={{fontSize:11,fontWeight:700,color:sel===mo.id?C.white:C.navy}}>{mo.label}</div>
              <div style={{fontSize:11,marginTop:2,fontWeight:600,color:sel===mo.id?"rgba(255,255,255,0.85)":debt?C.red:C.green}}>{fmt(tot)}</div>
            </button>
          );
        })}
        <button onClick={()=>setAdding(true)}
          style={{...csf,flexShrink:0,background:C.white,border:`1.5px dashed ${C.border}`,borderRadius:12,padding:"9px 14px",cursor:"pointer",fontSize:12,color:C.gray}}>
          + Месяц
        </button>
      </div>
 
      {/* Добавить месяц */}
      {adding && (
        <Card style={{padding:16,marginBottom:14}}>
          <div style={{...csf,fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>Новый месяц</div>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Апрель 2025"
            style={{...csf,width:"100%",background:C.lgray,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={addMonth}>Создать</Btn>
            <Btn variant="secondary" onClick={()=>setAdding(false)}>Отмена</Btn>
          </div>
        </Card>
      )}
 
      {/* Сводка месяца */}
      <Card style={{padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{...csf,fontSize:11,color:C.gray,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Выплата 1-го числа</div>
            <div style={{...csf,fontSize:18,fontWeight:800,color:C.navy}}>
              {sel==="sal-2025-03"?`1 апреля 2025 · через ${dLeft} дн.`:m.label}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{...csf,fontSize:11,color:C.gray,textTransform:"uppercase",marginBottom:3}}>Начислено</div>
            <div style={{...csf,fontSize:18,fontWeight:800,color:C.navy}}>{fmt(totalM)}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:unpaidM>0?12:0}}>
          <div style={{background:C.lgray,borderRadius:10,padding:"10px 12px"}}>
            <div style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",marginBottom:3}}>Выплачено</div>
            <div style={{...csf,fontSize:15,fontWeight:800,color:C.green}}>{fmt(paidM)}</div>
          </div>
          <div style={{background:unpaidM>0?"rgba(255,59,48,0.05)":C.lgray,borderRadius:10,padding:"10px 12px",border:unpaidM>0?`1px solid rgba(255,59,48,0.15)`:"none"}}>
            <div style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",marginBottom:3}}>Осталось</div>
            <div style={{...csf,fontSize:15,fontWeight:800,color:unpaidM>0?C.red:C.gray}}>{fmt(unpaidM)}</div>
          </div>
        </div>
        {unpaidM>0&&<Btn onClick={()=>payAll(m.id)}>✓ Выплатить всем за {m.label}</Btn>}
      </Card>
 
      {/* Общий долг за все месяцы */}
      {allDebt>0&&(
        <div style={{background:"rgba(255,59,48,0.05)",border:"1px solid rgba(255,59,48,0.15)",borderRadius:12,padding:"11px 14px",marginBottom:14}}>
          <div style={{...csf,fontSize:12,color:C.red,fontWeight:700}}>Общий долг за все месяцы: {fmt(allDebt)}</div>
        </div>
      )}
 
      {/* Ведомость — строки по ассистентам */}
      <SectionLabel>{m.label} · Ведомость</SectionLabel>
 
      {m.rows.map(r=>{
        const {fixTotal, kpiTotal, total, clientCount} = calcSalRow(r);
        const maxKPI = clientCount * KPI_MAX_PER_CLIENT;
        return (
          <Card key={r.id} style={{marginBottom:12,overflow:"hidden"}}>
            <div style={{height:3,background:r.paid?C.green:C.red}}/>
            <div style={{padding:"14px 16px"}}>
 
              {/* Шапка */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:C.lblue,color:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,...csf,flexShrink:0}}>{r.name[0]}</div>
                  <div>
                    <div style={{...csf,fontSize:15,fontWeight:700,color:C.navy}}>{r.name}</div>
                    <div style={{...csf,fontSize:11,color:C.gray}}>{clientCount} клиентов · макс КПИ {fmt(maxKPI)}</div>
                  </div>
                </div>
                <button onClick={()=>togglePaid(m.id,r.id)}
                  style={{...csf,background:r.paid?C.green+"15":"rgba(255,59,48,0.06)",border:`1.5px solid ${r.paid?C.green:C.red}`,borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,color:r.paid?C.green:C.red,cursor:"pointer"}}>
                  {r.paid?"✓ Выдано":"✗ Не выдано"}
                </button>
              </div>
 
              {/* Таблица клиентов */}
              <div style={{border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
                {/* Шапка таблицы */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 90px 90px",gap:0,background:C.lgray,padding:"8px 12px",borderBottom:`1px solid ${C.border}`}}>
                  {["Клиент","Фикс","★ Оценка","Продление","Итого"].map((h,i)=>(
                    <div key={i} style={{...csf,fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:0.3,textAlign:i===0?"left":"center"}}>{h}</div>
                  ))}
                </div>
                {r.clients.map((cl,ci)=>{
                  const {kpi,total:clTotal} = calcClient(cl);
                  return (
                    <div key={ci} style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 90px 90px",gap:0,padding:"10px 12px",borderBottom:ci<r.clients.length-1?`1px solid ${C.border}`:"none",alignItems:"center"}}>
                      <div style={{...csf,fontSize:13,fontWeight:600,color:C.navy}}>{cl.name}</div>
                      <div style={{textAlign:"center",...csf,fontSize:12,color:C.gray}}>{fmt(FIX_PER_CLIENT)}</div>
                      {/* КПИ за оценку — выбор звёзд */}
                      <div style={{textAlign:"center"}}>
                        <div style={{display:"flex",gap:2,justifyContent:"center",marginBottom:2}}>
                          {[1,2,3,4,5].map(n=>(
                            <span key={n} onClick={()=>setMonths(p=>p.map(mo=>mo.id!==m.id?mo:{...mo,rows:mo.rows.map(rr=>rr.id!==r.id?rr:{...rr,clients:rr.clients.map((cc,i)=>i!==ci?cc:{...cc,stars:cc.stars===n?0:n})})}))}
                              style={{fontSize:14,cursor:"pointer",color:n<=cl.stars?"#FF9500":"#D0DCEE",transition:"color 0.1s"}}>★</span>
                          ))}
                        </div>
                        <div style={{...csf,fontSize:10,fontWeight:700,color:cl.stars>=4?C.green:cl.stars>=3?C.orange:cl.stars>0?C.red:C.gray}}>
                          {cl.stars>0?fmt(kpiByRating(cl.stars)):"—"}
                        </div>
                      </div>
                      {/* КПИ за продление — кликабельный */}
                      <div style={{textAlign:"center"}}>
                        <button onClick={()=>setMonths(p=>p.map(mo=>mo.id!==m.id?mo:{...mo,rows:mo.rows.map(rr=>rr.id!==r.id?rr:{...rr,clients:rr.clients.map((c,i)=>i!==ci?c:{...c,kpiRenewal:c.kpiRenewal>0?0:KPI_RENEWAL_SHARE})})}))}
                          style={{...csf,background:cl.kpiRenewal>0?C.blue+"15":C.lgray,border:`1px solid ${cl.kpiRenewal>0?C.blue:C.border}`,borderRadius:8,padding:"3px 8px",fontSize:11,fontWeight:600,color:cl.kpiRenewal>0?C.blue:C.gray,cursor:"pointer"}}>
                          {cl.kpiRenewal>0?"✓ "+fmt(cl.kpiRenewal):"—"}
                        </button>
                      </div>
                      <div style={{textAlign:"center",...csf,fontSize:13,fontWeight:700,color:C.navy}}>{fmt(clTotal)}</div>
                    </div>
                  );
                })}
                {/* Итого строка */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 90px 90px 90px 90px",gap:0,padding:"10px 12px",background:C.lblue,borderTop:`1px solid ${C.border}`,alignItems:"center"}}>
                  <div style={{...csf,fontSize:12,fontWeight:700,color:C.blue}}>Итого</div>
                  <div style={{textAlign:"center",...csf,fontSize:12,fontWeight:700,color:C.navy}}>{fmt(fixTotal)}</div>
                  <div style={{textAlign:"center",...csf,fontSize:12,fontWeight:700,color:C.green}}>{fmt(r.clients.reduce((s,cl)=>s+kpiByRating(cl.stars),0))}</div>
                  <div style={{textAlign:"center",...csf,fontSize:12,fontWeight:700,color:C.blue}}>{fmt(r.clients.reduce((s,cl)=>s+cl.kpiRenewal,0))}</div>
                  <div style={{textAlign:"center",...csf,fontSize:14,fontWeight:800,color:C.navy}}>{fmt(total)}</div>
                </div>
              </div>
 
              {/* КПИ прогресс */}
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{...csf,fontSize:11,color:C.gray}}>КПИ: {fmt(kpiTotal)} из {fmt(maxKPI)}</div>
                  <div style={{...csf,fontSize:11,fontWeight:700,color:maxKPI>0&&kpiTotal===maxKPI?C.green:C.orange}}>{maxKPI>0?Math.round((kpiTotal/maxKPI)*100):0}%</div>
                </div>
                <div style={{background:C.lgray,borderRadius:4,height:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${maxKPI>0?Math.round((kpiTotal/maxKPI)*100):0}%`,background:kpiTotal===maxKPI?C.green:C.blue,borderRadius:4,transition:"width 0.3s"}}/>
                </div>
              </div>
 
              {r.paid&&r.paidDate&&<div style={{...csf,fontSize:11,color:C.gray}}>Выплачено: {fmtD(r.paidDate)}</div>}
            </div>
          </Card>
        );
      })}
 
      {/* История по всем месяцам */}
      <SectionLabel>История выплат</SectionLabel>
      <Card style={{padding:"4px 0"}}>
        {months.map((mo,i)=>{
          const tot   = mo.rows.reduce((s,r)=>s+calcSalRow(r).total,0);
          const paid  = mo.rows.filter(r=>r.paid).reduce((s,r)=>s+calcSalRow(r).total,0);
          const hasDebt = mo.rows.some(r=>!r.paid);
          return (
            <div key={mo.id} onClick={()=>setSel(mo.id)}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<months.length-1?`1px solid ${C.border}`:"none",background:sel===mo.id?C.lblue:"transparent",cursor:"pointer",borderRadius:i===0?"16px 16px 0 0":i===months.length-1?"0 0 16px 16px":"0"}}>
              <div>
                <div style={{...csf,fontSize:13,fontWeight:sel===mo.id?700:500,color:sel===mo.id?C.blue:C.navy}}>{mo.label}</div>
                <div style={{...csf,fontSize:11,color:C.gray,marginTop:2}}>{mo.rows.length} ассистентов</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{...csf,fontSize:13,fontWeight:700,color:C.navy}}>{fmt(tot)}</div>
                <div style={{...csf,fontSize:11,fontWeight:600,color:hasDebt?C.red:C.green,marginTop:2}}>
                  {hasDebt?`Долг ${fmt(tot-paid)}`:"✓ Всё выплачено"}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
 
// ── ВЬЮХИ ─────────────────────────────────────────────────────────────────────
function CEOView({user,onLogout,salMonths,setSalMonths,asts}) {
  const [tab,setTab] = useState("finance");
  const TABS = [{k:"finance",l:"💰 Финансы"},{k:"team",l:"👥 Команда"},{k:"salary",l:"💸 Зарплаты"},{k:"crm",l:"📞 CRM"}];
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <div style={{maxWidth:440,margin:"0 auto",paddingBottom:40}}>
        <Header title="✦ СЕО" subtitle="MyAssistant" onLogout={onLogout}>
          <Tabs tabs={TABS} active={tab} onChange={setTab}/>
        </Header>
        <div style={{padding:"16px 14px"}}>
          {tab==="finance"&&<CEOFinance/>}
          {tab==="team"&&<CEOTeam asts={asts}/>}
          {tab==="salary"&&<CEOSalary months={salMonths} setMonths={setSalMonths}/>}
          {tab==="crm"&&<CEOCRM/>}
        </div>
      </div>
    </div>
  );
}
 
function AdminView({user,onLogout,asts:initAsts,onAddAst,onRemoveAst}) {
  const [tab,setTab] = useState("clients");
  const [clients,setClients] = useState([
    {id:"c1",name:"Айдар Сейткали",   login:"aidar",    pw:"12345",ast:"Мария", subDays:22,color:"#007AFF"},
    {id:"c2",name:"Светлана Петрова", login:"svetlana", pw:"12345",ast:"Мария", subDays:8, color:"#34C759"},
    {id:"c3",name:"Дмитрий Волков",   login:"dmitry",   pw:"12345",ast:"Алина", subDays:3, color:"#FF9500"},
  ]);
  const [asts,setAsts] = useState(initAsts||[
    {id:"a1",name:"Мария",login:"maria",pw:"12345",clients:2,active:true,fix:60000},
    {id:"a2",name:"Алина",login:"alina",pw:"12345",clients:1,active:true,fix:60000},
  ]);
  const [delTarget,setDelTarget] = useState(null);
  const [copied,setCopied]       = useState(null);
  const [showAddAst,setShowAddAst] = useState(false);
  const [newAst,setNewAst]         = useState({name:"",login:"",pw:"12345",fix:60000});
 
  const copyCredentials = (u) => {
    setCopied(u.id);
    setTimeout(()=>setCopied(null),2000);
  };
 
  const TABS = [{k:"clients",l:"👤 Клиенты"},{k:"assistants",l:"🧠 Ассистенты"},{k:"subs",l:"📅 Подписки"}];
 
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <div style={{maxWidth:440,margin:"0 auto",paddingBottom:40}}>
        <Header title="⚙️ Администратор" subtitle="MyAssistant" onLogout={onLogout}>
          <Tabs tabs={TABS} active={tab} onChange={setTab}/>
        </Header>
        <div style={{padding:"16px 14px"}}>
          {delTarget&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
              <Card style={{padding:24,maxWidth:320,width:"100%",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>🗑</div>
                <div style={{...csf,fontSize:17,fontWeight:700,color:C.navy,marginBottom:8}}>Удалить?</div>
                <div style={{...csf,fontSize:13,color:C.gray,marginBottom:20}}><b style={{color:C.navy}}>{delTarget.name}</b> будет удалён. Это нельзя отменить.</div>
                <div style={{display:"flex",gap:10}}>
                  <Btn variant="secondary" onClick={()=>setDelTarget(null)}>Отмена</Btn>
                  <Btn variant="danger" onClick={()=>{
                    if(delTarget.type==="client") setClients(p=>p.filter(c=>c.id!==delTarget.id));
                    else { setAsts(p=>p.filter(a=>a.id!==delTarget.id)); if(onRemoveAst) onRemoveAst(delTarget.id); }
                    setDelTarget(null);
                  }}>Удалить</Btn>
                </div>
              </Card>
            </div>
          )}
 
          {tab==="clients"&&(
            <div>
              <Btn style={{marginBottom:14}}>+ Добавить клиента</Btn>
              {clients.map(c=>(
                <Card key={c.id} style={{marginBottom:10,overflow:"hidden"}}>
                  <div style={{height:3,background:c.color}}/>
                  <div style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:42,height:42,borderRadius:"50%",background:c.color+"18",color:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,...csf,flexShrink:0}}>
                        {c.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy}}>{c.name}</div>
                        <div style={{...csf,fontSize:11,color:C.gray}}>Асс: {c.ast}</div>
                      </div>
                      <Badge label={c.subDays+" дн."} color={c.subDays<=7?C.red:c.subDays<=14?C.orange:C.green}/>
                    </div>
                    <div style={{background:C.lgray,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{...csf,fontSize:12,color:C.gray}}>Логин: <b style={{color:C.navy}}>{c.login}</b></span>
                        <span style={{...csf,fontSize:12,color:C.gray}}>Пароль: <b style={{color:C.navy}}>{c.pw}</b></span>
                      </div>
                      <Btn onClick={()=>copyCredentials(c)} style={{padding:"9px"}}>
                        {copied===c.id?"✓ Скопировано!":"📋 Скопировать и отправить"}
                      </Btn>
                    </div>
                    <Btn variant="danger" onClick={()=>setDelTarget({...c,type:"client"})}>🗑 Удалить клиента</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
 
          {tab==="assistants"&&(
            <div>
              <Btn style={{marginBottom:14}} onClick={()=>setShowAddAst(p=>!p)}>
                {showAddAst?"Отмена":"+ Добавить ассистента"}
              </Btn>
              {showAddAst&&(
                <Card style={{padding:16,marginBottom:14}}>
                  <div style={{...csf,fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>Новый ассистент</div>
                  {[["Имя","name","Мария Иванова"],["Логин","login","maria2"],["Пароль","pw","12345"]].map(([label,field,ph])=>(
                    <div key={field} style={{marginBottom:10}}>
                      <div style={{...csf,fontSize:10,fontWeight:600,color:C.gray,textTransform:"uppercase",letterSpacing:0.4,marginBottom:5}}>{label}</div>
                      <input value={newAst[field]} onChange={e=>setNewAst(p=>({...p,[field]:e.target.value}))} placeholder={ph}
                        style={{...csf,width:"100%",background:C.lgray,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                  <div style={{marginBottom:14}}>
                    <div style={{...csf,fontSize:10,fontWeight:600,color:C.gray,textTransform:"uppercase",letterSpacing:0.4,marginBottom:5}}>Базовый фикс (зарплата)</div>
                    <input type="number" value={newAst.fix} onChange={e=>setNewAst(p=>({...p,fix:parseInt(e.target.value)||0}))} placeholder="60000"
                      style={{...csf,width:"100%",background:C.lgray,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box"}}/>
                    <div style={{...csf,fontSize:11,color:C.gray,marginTop:4}}>Автоматически появится в зарплатной ведомости</div>
                  </div>
                  <Btn onClick={()=>{
                    if(!newAst.name||!newAst.login) return;
                    const ast={id:"a-"+Date.now(),name:newAst.name,login:newAst.login,pw:newAst.pw,clients:0,active:true,fix:newAst.fix};
                    setAsts(p=>[...p,ast]);
                    if(onAddAst) onAddAst(ast);
                    setNewAst({name:"",login:"",pw:"12345",fix:60000});
                    setShowAddAst(false);
                  }}>Добавить ассистента</Btn>
                </Card>
              )}
              {asts.map(a=>(
                <Card key={a.id} style={{marginBottom:10,overflow:"hidden",opacity:a.active?1:0.55}}>
                  <div style={{height:3,background:C.blue}}/>
                  <div style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:42,height:42,borderRadius:"50%",background:C.lblue,color:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,...sf}}>{a.name[0]}</div>
                      <div style={{flex:1}}>
                        <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy}}>{a.name}</div>
                        <div style={{...csf,fontSize:11,color:C.gray}}>{a.clients} клиентов</div>
                      </div>
                    </div>
                    <div style={{background:C.lgray,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{...csf,fontSize:12,color:C.gray}}>Логин: <b style={{color:C.navy}}>{a.login}</b></span>
                        <span style={{...csf,fontSize:12,color:C.gray}}>Пароль: <b style={{color:C.navy}}>{a.pw}</b></span>
                      </div>
                      <Btn onClick={()=>copyCredentials(a)} style={{padding:"9px"}}>
                        {copied===a.id?"✓ Скопировано!":"📋 Скопировать и отправить"}
                      </Btn>
                    </div>
                    <Btn variant="danger" onClick={()=>setDelTarget({...a,type:"assistant"})}>🗑 Удалить ассистента</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
 
          {tab==="subs"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                <StatCard label="Истекает" value={clients.filter(c=>c.subDays<=7).length} color={C.red} small/>
                <StatCard label="Скоро"    value={clients.filter(c=>c.subDays<=14&&c.subDays>7).length} color={C.orange} small/>
                <StatCard label="Активны"  value={clients.filter(c=>c.subDays>14).length} color={C.green} small/>
              </div>
              {[...clients].sort((a,b)=>a.subDays-b.subDays).map(c=>(
                <Card key={c.id} style={{marginBottom:10,overflow:"hidden"}}>
                  <div style={{height:3,background:c.subDays<=7?C.red:c.subDays<=14?C.orange:C.green}}/>
                  <div style={{padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy}}>{c.name}</div>
                      <div style={{...csf,fontSize:11,color:C.gray}}>Асс: {c.ast}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{...csf,fontSize:16,fontWeight:800,color:c.subDays<=7?C.red:c.subDays<=14?C.orange:C.green}}>{c.subDays} дн.</div>
                      {c.subDays<=7&&<Badge label="Истекает" color={C.red}/>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
function AssistantView({user,onLogout}) {
  const TABS = [{k:"tasks",l:"📋 Задачи"},{k:"chat",l:"💬 Чат"},{k:"kpi",l:"⭐ КПИ"}];
  const [tab,setTab] = useState("tasks");
  const tasks = [
    {id:1,title:"Подготовить отчёт по продажам",client:"Айдар",status:"new",    deadline:"2025-03-20"},
    {id:2,title:"Запланировать встречи на неделю",client:"Светлана",status:"active",deadline:"2025-03-21"},
    {id:3,title:"Найти поставщика офисной мебели",client:"Айдар",status:"done",   deadline:"2025-03-18"},
  ];
  const STATUS_CFG = {new:{l:"Новая",c:C.orange},active:{l:"В процессе",c:C.blue},done:{l:"Готово",c:C.green}};
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <div style={{maxWidth:440,margin:"0 auto",paddingBottom:40}}>
        <Header title={"Привет, "+user.name} subtitle="Ассистент · MyAssistant" onLogout={onLogout}>
          <Tabs tabs={TABS} active={tab} onChange={setTab}/>
        </Header>
        <div style={{padding:"16px 14px"}}>
          {tab==="tasks"&&tasks.map(t=>{
            const s=STATUS_CFG[t.status];
            return(
              <Card key={t.id} style={{marginBottom:10,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy,flex:1,marginRight:10}}>{t.title}</div>
                  <Badge label={s.l} color={s.c}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{...csf,fontSize:12,color:C.gray}}>Клиент: {t.client}</div>
                  <div style={{...csf,fontSize:11,color:C.gray}}>до {fmtD(t.deadline)}</div>
                </div>
                {t.status==="new"&&<Btn style={{marginTop:10,padding:"9px"}}>Взять в работу</Btn>}
                {t.status==="active"&&<div style={{display:"flex",gap:8,marginTop:10}}><Btn style={{padding:"9px"}}>🤖 AI план</Btn><Btn variant="secondary" style={{padding:"9px"}}>Сдать</Btn></div>}
              </Card>
            );
          })}
          {tab==="kpi"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <StatCard label="Выполнено" value="13" color={C.blue}/>
                <StatCard label="Рейтинг"   value="★ 4.5" color={C.green}/>
              </div>
              <Card style={{padding:"14px 16px"}}>
                <div style={{...csf,fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>Оценки по задачам</div>
                {["★★★★★","★★★★☆","★★★★★","★★★☆☆"].map((stars,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                    <div style={{...csf,fontSize:12,color:C.navy}}>Задача #{i+1}</div>
                    <div style={{...csf,fontSize:13,color:C.orange}}>{stars}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {tab==="chat"&&(
            <Card style={{padding:20,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:10}}>💬</div>
              <div style={{...csf,fontSize:14,fontWeight:600,color:C.navy}}>Чат с клиентами</div>
              <div style={{...csf,fontSize:12,color:C.gray,marginTop:6}}>Переписка подключена в основном App.jsx</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
 
function ClientView({user,onLogout}) {
  const TABS = [{k:"tasks",l:"📋 Задачи"},{k:"chat",l:"💬 Чат"},{k:"calendar",l:"📅 Календарь"}];
  const [tab,setTab] = useState("tasks");
  const tasks = [
    {id:1,title:"Подготовить отчёт по продажам",status:"active",deadline:"2025-03-20",rating:null},
    {id:2,title:"Запланировать встречи",         status:"done",  deadline:"2025-03-18",rating:5},
    {id:3,title:"Найти поставщика мебели",        status:"new",   deadline:"2025-03-22",rating:null},
  ];
  const STATUS_CFG = {new:{l:"Новая",c:C.orange},active:{l:"В процессе",c:C.blue},done:{l:"Готово",c:C.green}};
  return (
    <div style={{background:C.bg,minHeight:"100vh"}}>
      <div style={{maxWidth:440,margin:"0 auto",paddingBottom:40}}>
        <Header title={"Добрый день, "+user.name.split(" ")[0]} subtitle="Клиент · MyAssistant" onLogout={onLogout}>
          <Tabs tabs={TABS} active={tab} onChange={setTab}/>
        </Header>
        <div style={{padding:"16px 14px"}}>
          {tab==="tasks"&&(
            <div>
              <Btn style={{marginBottom:14}}>+ Новая задача</Btn>
              {tasks.map(t=>{
                const s=STATUS_CFG[t.status];
                return(
                  <Card key={t.id} style={{marginBottom:10,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{...csf,fontSize:14,fontWeight:700,color:C.navy,flex:1,marginRight:10}}>{t.title}</div>
                      <Badge label={s.l} color={s.c}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{...csf,fontSize:11,color:C.gray}}>до {fmtD(t.deadline)}</div>
                      {t.status==="done"&&!t.rating&&<Btn style={{padding:"7px 14px",width:"auto",fontSize:12}}>Оценить ★</Btn>}
                      {t.rating&&<div style={{...csf,fontSize:13,color:C.orange}}>{"★".repeat(t.rating)}</div>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {tab==="chat"&&<Card style={{padding:20,textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>💬</div><div style={{...csf,fontSize:14,fontWeight:600,color:C.navy}}>Чат с ассистентом</div><div style={{...csf,fontSize:12,color:C.gray,marginTop:6}}>Переписка в основном App.jsx</div></Card>}
          {tab==="calendar"&&<Card style={{padding:20,textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>📅</div><div style={{...csf,fontSize:14,fontWeight:600,color:C.navy}}>Календарь</div><div style={{...csf,fontSize:12,color:C.gray,marginTop:6}}>События и встречи в основном App.jsx</div></Card>}
        </div>
      </div>
    </div>
  );
}
 
 
export default function App() {
  const [users,        setUsersState]   = useState([]);
  const [tasks,        setTasksState]   = useState({});
  const [msgs,         setMsgsState]    = useState({});
  const [events,       setEventsState]  = useState({});
  // ── Сессия: восстанавливаем из localStorage при обновлении ──────────────
  const [me,           setMeState]      = useState(() => {
    try { const s = localStorage.getItem("ma_me"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const setMe = (u) => {
    if (u) localStorage.setItem("ma_me", JSON.stringify(u));
    else localStorage.removeItem("ma_me");
    setMeState(u);
  };
  const [tab,          setTab]          = useState("home");
  const [curMgr,       setCurMgr]       = useState(null);
  const [chatMgr,      setChatMgr]      = useState(null);
  const [acknowledged, setAcknowledged] = useState(() => {
    try { const s = localStorage.getItem("ma_ack"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const setAck = (fn) => {
    setAcknowledged(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      try { localStorage.setItem("ma_ack", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const [unreadMsgs,   setUnreadMsgs]   = useState({});
  const [newTasksNotif,setNewTasksNotif]= useState({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [salMonths, setSalMonths] = useState(SAL_MONTHS_INIT);
  const isSaving  = useRef(false); // блокирует polling во время сохранения
  const lastSaved = useRef(0);     // timestamp последнего сохранения
 
  // ── Загрузка всех данных из Supabase ──────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [uData, tData, mData, eData] = await Promise.all([
        db.select("users"),
        db.select("tasks"),
        db.select("messages"),
        db.select("events"),
      ]);
 
      setUsersState(uData.map(rowToUser));
 
      const tasksMap = {};
      tData.forEach(r => {
        if (!tasksMap[r.mgr_id]) tasksMap[r.mgr_id] = [];
        tasksMap[r.mgr_id].push(rowToTask(r));
      });
      setTasksState(tasksMap);
 
      const msgsMap = {};
      mData.forEach(r => {
        if (!msgsMap[r.mgr_id]) msgsMap[r.mgr_id] = [];
        msgsMap[r.mgr_id].push(rowToMsg(r));
      });
      setMsgsState(msgsMap);
 
      const evtsMap = {};
      eData.forEach(r => {
        if (!evtsMap[r.mgr_id]) evtsMap[r.mgr_id] = [];
        evtsMap[r.mgr_id].push(rowToEvent(r));
      });
      setEventsState(evtsMap);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
      setError("Не удалось подключиться к базе данных");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { loadAll(); }, [loadAll]);
 
  // ── Polling — обновляем данные каждые 5 секунд ────────────────────────────
  useEffect(() => {
    // Polling только для сообщений и событий (чтобы видеть новые от другого пользователя)
    // Users и tasks НЕ перезагружаем — они уже актуальны в state после сохранения
    const interval = setInterval(async () => {
      if (!me || isSaving.current) return;
      if (Date.now() - lastSaved.current < 5000) return; // пауза 5 сек после сохранения
      try {
        const [tData, mData, eData] = await Promise.all([
          db.select("tasks"),
          db.select("messages"),
          db.select("events"),
        ]);
 
        // Обновляем задачи
        const tasksMap = {};
        tData.forEach(r => {
          if (!tasksMap[r.mgr_id]) tasksMap[r.mgr_id] = [];
          tasksMap[r.mgr_id].push(rowToTask(r));
        });
        setTasksState(tasksMap);
 
        const msgsMap = {};
        mData.forEach(r => {
          if (!msgsMap[r.mgr_id]) msgsMap[r.mgr_id] = [];
          msgsMap[r.mgr_id].push(rowToMsg(r));
        });
        setMsgsState(msgsMap);
 
        const evtsMap = {};
        eData.forEach(r => {
          if (!evtsMap[r.mgr_id]) evtsMap[r.mgr_id] = [];
          evtsMap[r.mgr_id].push(rowToEvent(r));
        });
        setEventsState(evtsMap);
      } catch(e) { /* тихая ошибка */ }
    }, 8000);
    return () => clearInterval(interval);
  }, [me]);
 
  // ── Сохранение пользователя в Supabase ────────────────────────────────────
  async function saveUserToDb(u) {
    await db.upsert("users", {
      id: u.id, role: u.role, name: u.name, initials: u.initials,
      color: u.color, login: u.login, pw: u.pw,
      clients: u.clients || [],
      ast_id: u.astId || null,
      sub_days: u.subDays ?? 30,
      rate_per_client: u.ratePerClient ?? 90000,
      info: u.info || "", about: u.about || "",
      likes: u.likes || "", dislikes: u.dislikes || "",
      accesses: u.accesses || [], files: u.files || [],
      active: u.active !== false,
    });
  }
 
  async function saveUsersBatch(usersList) {
    isSaving.current = true;
    lastSaved.current = Date.now();
    try {
      await Promise.all(usersList.map(u => saveUserToDb(u)));
      // Сохранение прошло успешно — state уже актуален, не перезагружаем
    } catch(e) {
      console.error("Ошибка batch сохранения:", e);
      // Если сохранение упало — восстанавливаем state из базы
      try {
        const uData = await db.select("users");
        setUsersState(uData.map(rowToUser));
      } catch(e2) { console.error("Ошибка восстановления:", e2); }
    }
    finally {
      lastSaved.current = Date.now();
      isSaving.current = false;
    }
  }
 
  async function deleteUserFromDb(id) {
    try { await db.delete("users", id); loadAll(); }
    catch(e) { console.error(e); }
  }
  function deleteUser(id) {
    setUsers(p => p.filter(u => u.id !== id));
    deleteUserFromDb(id);
    setConfirmDeleteUser(null);
  }
 
  // ── Обёртка setUsers — сохраняет изменения в Supabase ────────────────────
  const setUsers = fn => {
    // ВАЖНО: нельзя вызывать async внутри setState — React это ломает.
    // Сначала получаем текущий state напрямую через ref, потом сохраняем.
    setUsersState(prev => {
      const next = fn(prev);
      const changed = next.filter(u => {
        const old = prev.find(p => p.id === u.id);
        return JSON.stringify(old) !== JSON.stringify(u);
      });
      // Запускаем сохранение асинхронно, вне setState
      if (changed.length > 0) {
        setTimeout(() => saveUsersBatch(changed), 0);
      }
      return next;
    });
  };
 
  // ── Сохранение задачи ─────────────────────────────────────────────────────
  async function saveTaskToDb(mgrId, task) {
    try {
      await db.upsert("tasks", {
        id: String(task.id), mgr_id: mgrId,
        title: task.title, description: task.desc || "",
        deadline: task.deadline, priority: task.priority || "medium",
        er: task.er || "", status: task.status || "new",
        rating: task.rating || null, rc: task.rc || null,
        saved: task.saved || null, result: task.result || "",
        help_comment: task.helpComment || "",
        mgr_reply: task.mgrReply || "",
        files: task.files || [],
        photo: task.photo || null,
        link: task.link || null,
        result_photo: task.resultPhoto || null,
        result_link: task.resultLink || null,
      });
    } catch(e) { console.error("Ошибка сохранения задачи:", e); }
  }
 
  const setTasks = fn => {
    setTasksState(prev => {
      const next = fn(prev);
      const toSave = [];
      Object.entries(next).forEach(([mgrId, tList]) => {
        tList.forEach(t => {
          const old = (prev[mgrId] || []).find(p => p.id === t.id);
          if (JSON.stringify(old) !== JSON.stringify(t)) toSave.push([mgrId, t]);
        });
      });
      if (toSave.length > 0) {
        lastSaved.current = Date.now();
        setTimeout(async () => {
          await Promise.all(toSave.map(([mgrId, t]) => saveTaskToDb(mgrId, t)));
          // НЕ перезагружаем из базы — React state уже актуален
        }, 0);
      }
      return next;
    });
  };
 
  // ── Сохранение сообщения ──────────────────────────────────────────────────
  async function saveMsgToDb(mgrId, msg) {
    try {
      await db.upsert("messages", {
        id: String(msg.id), mgr_id: mgrId,
        from_role: msg.from, text: msg.text,
        time: msg.time, files: msg.files || [],
      });
    } catch(e) { console.error("Ошибка сохранения сообщения:", e); }
  }
 
  const setMsgs = fn => {
    setMsgsState(prev => {
      const next = fn(prev);
      const toSave = [];
      Object.entries(next).forEach(([mgrId, mList]) => {
        mList.forEach(m => {
          const old = (prev[mgrId] || []).find(p => p.id === m.id);
          if (!old) toSave.push([mgrId, m]);
        });
      });
      if (toSave.length > 0) setTimeout(() => toSave.forEach(([mgrId, m]) => saveMsgToDb(mgrId, m)), 0);
      return next;
    });
  };
 
  // ── Сохранение события ────────────────────────────────────────────────────
  async function saveEventToDb(mgrId, ev) {
    try {
      await db.upsert("events", {
        id: String(ev.id), mgr_id: mgrId,
        date: ev.date, time: ev.time,
        title: ev.title, type: ev.type, by_role: ev.by,
      });
    } catch(e) { console.error("Ошибка сохранения события:", e); }
  }
 
  async function deleteEventFromDb(id) {
    try { await db.delete("events", id); loadAll(); }
    catch(e) { console.error(e); }
  }
 
  const setEvents = fn => {
    setEventsState(prev => {
      const next = fn(prev);
      const toSave = [];
      const toDel = [];
      Object.entries(next).forEach(([mgrId, eList]) => {
        eList.forEach(e => {
          const old = (prev[mgrId] || []).find(p => p.id === e.id);
          if (!old) toSave.push([mgrId, e]);
        });
        // удалённые события
        (prev[mgrId] || []).forEach(e => {
          if (!eList.find(n => n.id === e.id)) toDel.push(e.id);
        });
      });
      if (toSave.length > 0) setTimeout(() => toSave.forEach(([mgrId, e]) => saveEventToDb(mgrId, e)), 0);
      if (toDel.length > 0) setTimeout(() => toDel.forEach(id => deleteEventFromDb(id)), 0);
      return next;
    });
  };
 
  function doLogin(u) {
    setMe(u); setTab("home");
    if (u.role==="assistant") {
      const first = (u.clients||[])[0] || null;
      setCurMgr(first); setChatMgr(first);
    }
  }
  function doLogout() { setMe(null); }
 
  // ── Экран загрузки ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:BG}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>✦</div>
          <div style={{...sf,fontSize:18,fontWeight:700,marginBottom:8}}>Мой Ассистент</div>
          <div style={{...sf,fontSize:14,color:g4}}>Загрузка данных…</div>
        </div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:BG,padding:24}}>
        <div style={{textAlign:"center",background:WH,borderRadius:20,padding:32,maxWidth:400}}>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{...sf,fontSize:16,fontWeight:700,marginBottom:8,color:R}}>{error}</div>
          <button onClick={()=>{setError(null);setLoading(true);loadAll();}}
            style={{...sf,background:B,color:"#fff",border:"none",borderRadius:14,padding:"14px 24px",
              fontSize:15,fontWeight:600,cursor:"pointer",marginTop:8}}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
 
  // ── Не залогинен — показываем экран входа ────────────────────────────────
  if (!me) {
    return (
      <div style={{height:"100vh",background:BG}}>
        <div style={{maxWidth:500,margin:"0 auto",height:"100%"}}>
          <LoginScreen onLogin={doLogin} users={users}/>
        </div>
      </div>
    );
  }
 
  // ── Залогинен ─────────────────────────────────────────────────────────────
  const freshMe = users.find(u => u.id === me.id) || me;
 
  const isAdmin = me.role==="admin";
  const isCeo   = me.role==="ceo";
  const isMgr   = me.role==="manager";
  const isAst   = me.role==="assistant";
 
  if (isCeo) {
    return (
      <div style={{height:"100vh",background:C.bg}}>
        <CEOView user={freshMe} onLogout={doLogout}
          salMonths={salMonths} setSalMonths={setSalMonths} asts={users.filter(u=>u.role==="assistant")}/>
      </div>
    );
  }
 
  // обновляем me из свежих данных — объявлен выше
 
  const astClients = isAst ? users.filter(u => u.role==="manager" && (freshMe.clients||[]).includes(u.id)) : [];
  const activeMgrId  = isMgr ? freshMe.id : curMgr;
  const activeChatId = isMgr ? freshMe.id : chatMgr;
  const activeMgrObj  = users.find(u => u.id===activeMgrId)  || null;
  const activeChatObj = users.find(u => u.id===activeChatId) || null;
 
  const mgrPeer = isMgr ? users.find(u => u.id===freshMe.astId) || null : null;
 
  const roleColor = isMgr?B : isAst?G : R;
  const roleLabel = isMgr?`👤 ${freshMe.name}` : isAst?`🧠 ${freshMe.name}` : isCeo?`✦ СЕО` : "👑 Администратор";
  const TABS = isMgr
    ? [{k:"home",i:"🏠",l:"Главная"},{k:"tasks",i:"📋",l:"Задачи"},{k:"chat",i:"💬",l:"Чат"},{k:"profile",i:"👤",l:"Профиль"}]
    : [{k:"home",i:"🏠",l:"Главная"},{k:"tasks",i:"📋",l:"Задачи"},{k:"chat",i:"💬",l:"Чат"}];
 
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:BG}}>
      <div style={{display:"flex",flexDirection:"column",height:"100%",maxWidth:600,
        margin:"0 auto",width:"100%",position:"relative"}}>
 
        {/* Хэдер */}
        <div style={{background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",
          borderBottom:`0.5px solid ${SEP}`,padding:"14px 18px 12px",
          display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:20}}>
          <div style={{flex:1}}>
            <div style={{...sf,fontSize:17,fontWeight:700,letterSpacing:-0.3}}>
              {isAdmin?"Управление" : tab==="home"?"Главная" : tab==="tasks"?"Задачи" : tab==="profile"?"Профиль" : "Чат"}
            </div>
            <div style={{...sf,fontSize:12,color:roleColor,fontWeight:500}}>{roleLabel}</div>
          </div>
          {!isAdmin && <div style={{...sf,fontSize:12,fontWeight:600,color:g4,background:g1,borderRadius:8,padding:"4px 10px"}}>🔔</div>}
          <button onClick={doLogout}
            style={{...sf,background:"none",border:"none",cursor:"pointer",fontSize:13,color:g4}}>
            Выйти
          </button>
        </div>
 
        {/* Вкладки клиентов у ассистента (главная + задачи) */}
        {isAst && tab!=="chat" && astClients.length>0 && (
          <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",overflowX:"auto",flexShrink:0}}>
            {astClients.map(c => {
              const nw = (tasks[c.id]||[]).filter(t=>t.status==="new").length;
              const pr = (tasks[c.id]||[]).filter(t=>t.status==="problem").length;
              return (
                <button key={c.id} onClick={()=>setCurMgr(c.id)}
                  style={{...sf,background:"transparent",border:"none",
                    borderBottom: curMgr===c.id?`2.5px solid ${c.color}`:"2.5px solid transparent",
                    padding:"10px 14px",cursor:"pointer",color:curMgr===c.id?c.color:g4,
                    fontWeight:curMgr===c.id?700:400,fontSize:14,
                    display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0}}>
                  {c.name.split(" ")[0]}
                  {nw>0 && <span style={{background:B,color:"#fff",borderRadius:8,padding:"1px 5px",fontSize:10,fontWeight:700}}>{nw}</span>}
                  {pr>0 && <span style={{background:R,color:"#fff",borderRadius:8,padding:"1px 5px",fontSize:10,fontWeight:700}}>!</span>}
                </button>
              );
            })}
          </div>
        )}
 
        {/* Контент */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
 
          {/* ── АДМИН ── */}
          {isAdmin && <AdminPanel users={users} setUsers={setUsers} tasks={tasks} onDeleteUser={id=>{setUsers(p=>p.filter(u=>u.id!==id));deleteUserFromDb(id);}}/>}
 
          {/* ── КЛИЕНТ / АССИСТЕНТ — ГЛАВНАЯ ── */}
          {!isAdmin && tab==="home" && (
            <div style={{padding:16}}>
 
              {isMgr && (() => {
                const mgrTasks   = tasks[freshMe.id] || [];
                const totalSaved = mgrTasks.reduce((s,t)=>s+(t.saved||0),0);
                const hrs        = Math.floor(totalSaved/60);
                const mins       = totalSaved % 60;
                const doneCnt    = mgrTasks.filter(t=>t.status==="done").length;
                const activeTasks= mgrTasks.filter(t=>t.status==="in_progress"||t.status==="new");
                const nextEvent  = (events[freshMe.id]||[]).sort((a,b)=>a.date>b.date?1:-1)[0];
                return (
                  <div>
                    <div style={{background:"linear-gradient(135deg,#007AFF,#0051D5)",borderRadius:22,
                      padding:"22px 20px",marginBottom:14,boxShadow:"0 8px 28px rgba(0,122,255,0.35)",
                      position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,
                        borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
                      <div style={{...sf,fontSize:12,color:"rgba(255,255,255,0.7)",
                        fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>
                        ⏱ Сэкономлено вашего времени
                      </div>
                      {totalSaved===0
                        ? <div style={{...sf,fontSize:32,fontWeight:800,color:"#fff",letterSpacing:-1,marginBottom:4}}>Первые задачи…</div>
                        : <div style={{marginBottom:4}}>
                            {hrs>0 && <span style={{...sf,fontSize:52,fontWeight:800,color:"#fff",letterSpacing:-2,lineHeight:1}}>{hrs}</span>}
                            {hrs>0 && <span style={{...sf,fontSize:22,color:"rgba(255,255,255,0.75)",fontWeight:600,marginRight:10}}> ч</span>}
                            {mins>0 && <span style={{...sf,fontSize:hrs>0?36:52,fontWeight:800,color:"#fff",letterSpacing:-1,lineHeight:1}}>{mins}</span>}
                            {mins>0 && <span style={{...sf,fontSize:22,color:"rgba(255,255,255,0.75)",fontWeight:600}}> мин</span>}
                          </div>
                      }
                      <div style={{...sf,fontSize:13,color:"rgba(255,255,255,0.6)"}}>
                        за всё время · {doneCnt} задач выполнено
                      </div>
                    </div>
 
                    <div style={{background:WH,borderRadius:18,padding:"14px 16px",marginBottom:14,
                      boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{...sf,fontSize:15,fontWeight:700}}>⚙️ Сейчас в работе</div>
                        <button onClick={()=>setTab("tasks")}
                          style={{...sf,background:`${B}10`,border:"none",borderRadius:10,
                            padding:"5px 12px",cursor:"pointer",fontSize:12,color:B,fontWeight:600}}>
                          Все задачи →
                        </button>
                      </div>
                      {activeTasks.length===0
                        ? <div style={{...sf,fontSize:14,color:g4,textAlign:"center",padding:"12px 0"}}>Нет активных задач 🎉</div>
                        : activeTasks.slice(0,3).map((t,i)=>{
                            const s=ST[t.status];
                            return (
                              <div key={i} style={{display:"flex",alignItems:"center",gap:10,
                                padding:"9px 0",borderBottom:i<Math.min(activeTasks.length,3)-1?`0.5px solid ${SEP}`:"none"}}>
                                <div style={{width:36,height:36,borderRadius:10,background:s.bg,
                                  border:`1.5px solid ${s.bd}`,display:"flex",alignItems:"center",
                                  justifyContent:"center",fontSize:16,flexShrink:0}}>{s.i}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{...sf,fontSize:14,fontWeight:600,overflow:"hidden",
                                    textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                                  <div style={{...sf,fontSize:11,color:g4}}>до {t.deadline}</div>
                                </div>
                                <div style={{...sf,fontSize:11,fontWeight:600,color:s.c,flexShrink:0}}>{s.l}</div>
                              </div>
                            );
                          })
                      }
                    </div>
 
                    {nextEvent && (() => {
                      const et = EVT[nextEvent.type]||EVT.meeting;
                      return (
                        <div style={{background:WH,borderRadius:18,padding:"14px 16px",marginBottom:14,
                          boxShadow:"0 1px 8px rgba(0,0,0,0.06)",borderLeft:`4px solid ${et.c}`}}>
                          <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                            textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>Ближайшее событие</div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:24}}>{et.i}</span>
                            <div style={{flex:1}}>
                              <div style={{...sf,fontSize:15,fontWeight:700}}>{nextEvent.title}</div>
                              <div style={{...sf,fontSize:12,color:g4}}>{nextEvent.date} · {nextEvent.time}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
 
                    {/* Уведомление: ассистент просит помощи */}
                    {(tasks[freshMe.id]||[]).some(t=>t.status==="problem") && (
                      <div onClick={()=>setTab("tasks")}
                        style={{background:"rgba(255,59,48,0.08)",border:"1.5px solid rgba(255,59,48,0.3)",
                          borderRadius:16,padding:"13px 16px",marginBottom:14,cursor:"pointer",
                          display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:40,height:40,borderRadius:12,background:R,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>❗</div>
                        <div style={{flex:1}}>
                          <div style={{...sf,fontSize:14,fontWeight:700,color:R}}>Ассистент просит помощи</div>
                          <div style={{...sf,fontSize:12,color:g4}}>Откройте Задачи → вкладка «Помощь»</div>
                        </div>
                        <span style={{...sf,fontSize:18,color:R}}>→</span>
                      </div>
                    )}
 
                    {freshMe.subDays <= 14 && (
                      <div style={{background:freshMe.subDays<=7?"rgba(255,59,48,0.08)":"rgba(255,149,0,0.08)",
                        border:`1.5px solid ${freshMe.subDays<=7?"rgba(255,59,48,0.25)":"rgba(255,149,0,0.25)"}`,
                        borderRadius:16,padding:"13px 16px",marginBottom:14,
                        display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:22}}>{freshMe.subDays<=7?"⚠️":"⏰"}</span>
                        <div style={{flex:1}}>
                          <div style={{...sf,fontSize:14,fontWeight:700,color:freshMe.subDays<=7?R:O}}>
                            {freshMe.subDays<=7?"Подписка заканчивается!":"Подписка скоро закончится"}
                          </div>
                          <div style={{...sf,fontSize:12,color:g4}}>Осталось {freshMe.subDays} дней</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
 
              {isAst && activeMgrId && (() => {
                const mgrTasks  = tasks[activeMgrId] || [];
                const weekTasks = mgrTasks.filter(t=>t.status==="done").slice(-5);
                const weekSaved = weekTasks.reduce((s,t)=>s+(t.saved||0),0);
                return weekTasks.length > 0
                  ? <WeeklyReport tasks={weekTasks} weekSaved={weekSaved} mgrName={activeMgrObj?.name||""}/>
                  : null;
              })()}
 
              {/* Уведомление ассистенту: руководитель ответил */}
              {isAst && astClients.some(c=>(tasks[c.id]||[]).some(t=>t.status==="problem"&&t.mgrReply)) && (
                <div onClick={()=>setTab("tasks")}
                  style={{background:"rgba(52,199,89,0.08)",border:"1.5px solid rgba(52,199,89,0.3)",
                    borderRadius:16,padding:"13px 16px",marginBottom:14,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✅</div>
                  <div style={{flex:1}}>
                    <div style={{...sf,fontSize:14,fontWeight:700,color:G}}>Руководитель ответил!</div>
                    <div style={{...sf,fontSize:12,color:g4}}>Откройте Задачи → вкладка «Помощь»</div>
                  </div>
                  <span style={{...sf,fontSize:18,color:G}}>→</span>
                </div>
              )}
 
              <div style={{background:WH,borderRadius:20,padding:16,marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}>📅 Календарь</div>
                {activeMgrId
                  ? <CalendarBlock events={events} setEvents={setEvents} mgrId={activeMgrId} role={freshMe.role}/>
                  : <div style={{...sf,fontSize:14,color:g4,textAlign:"center",padding:"20px 0"}}>Выберите клиента</div>
                }
              </div>
 
              {isAst && activeMgrObj && (
                <div style={{background:WH,borderRadius:20,padding:16,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                  <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}>👤 Профиль руководителя</div>
                  <ProfileBlock
                    mgr={activeMgrObj} setUsers={setUsers} canEdit={true}
                    isNewAssistant={isAst && !acknowledged[activeMgrId]}
                    onAcknowledge={()=>setAck(p=>({...p,[activeMgrId]:true}))}
                  />
                </div>
              )}
            </div>
          )}
 
          {/* ── ПРОФИЛЬ (клиент) ── */}
          {!isAdmin && tab==="profile" && isMgr && (() => {
            const mgrTasks  = tasks[freshMe.id] || [];
            const totalSaved= mgrTasks.reduce((s,t)=>s+(t.saved||0),0);
            const rated     = mgrTasks.filter(t=>t.rating);
            const avgRating = rated.length?(rated.reduce((s,t)=>s+t.rating,0)/rated.length).toFixed(1):null;
            return (
              <div style={{padding:16}}>
                <div style={{...sf,fontSize:11,color:g4,fontWeight:600,
                  textTransform:"uppercase",letterSpacing:0.4,marginBottom:10}}>📊 Статистика</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                  {[
                    {v:mgrTasks.length, l:"задач\nпоручено", c:B, bg:"rgba(0,122,255,0.08)", i:"📋"},
                    {v:fmtMin(totalSaved)||"0 мин", l:"сэкономлено", c:G, bg:"rgba(52,199,89,0.08)", i:"⏱"},
                    {v:avgRating?`★ ${avgRating}`:"—", l:"средняя\nоценка", c:O, bg:"rgba(255,149,0,0.08)", i:"⭐"},
                  ].map((m,i)=>(
                    <div key={i} style={{background:m.bg,borderRadius:16,padding:"12px 6px",textAlign:"center"}}>
                      <div style={{fontSize:18,marginBottom:2}}>{m.i}</div>
                      <div style={{...sf,fontSize:i===1?13:18,fontWeight:700,color:m.c,letterSpacing:-0.3,lineHeight:1.1}}>{m.v}</div>
                      <div style={{...sf,fontSize:9,color:g4,fontWeight:500,marginTop:3,lineHeight:1.3,whiteSpace:"pre-line"}}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:WH,borderRadius:20,padding:16,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                  <div style={{...sf,fontSize:15,fontWeight:700,marginBottom:12}}>👤 Мой профиль</div>
                  <ProfileBlock mgr={users.find(u=>u.id===freshMe.id)} setUsers={setUsers}
                    canEdit={false} isNewAssistant={false} onAcknowledge={null}/>
                </div>
              </div>
            );
          })()}
 
          {/* ── ЗАДАЧИ ── */}
          {!isAdmin && tab==="tasks" && (
            <div style={{padding:16}}>
              {isAst && activeMgrId && (newTasksNotif[activeMgrId]||0) > 0 && (
                <div style={{background:"linear-gradient(135deg,rgba(0,122,255,0.10),rgba(0,122,255,0.04))",
                  border:"1.5px solid rgba(0,122,255,0.25)",borderRadius:16,
                  padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`${B}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🔔</div>
                  <div style={{flex:1}}>
                    <div style={{...sf,fontSize:14,fontWeight:700,color:B}}>{newTasksNotif[activeMgrId]} новая задача!</div>
                    <div style={{...sf,fontSize:12,color:g4}}>{activeMgrObj?.name} поставил(а) новую задачу</div>
                  </div>
                  <button onClick={()=>setNewTasksNotif(p=>({...p,[activeMgrId]:0}))}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:g4}}>✕</button>
                </div>
              )}
              {activeMgrId
                ? <TasksBlock tasks={tasks} setTasks={setTasks} mgrId={activeMgrId} myRole={freshMe.role}
                    onNewTask={isMgr ? ()=>setNewTasksNotif(p=>({...p,[activeMgrId]:(p[activeMgrId]||0)+1})) : null}/>
                : <div style={{textAlign:"center",padding:"60px 0",...sf,color:g4}}>Выберите клиента</div>
              }
            </div>
          )}
 
          {/* ── ЧАТ ── */}
          {!isAdmin && tab==="chat" && (
            <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
              {isAst && astClients.length>0 && (
                <div style={{background:WH,borderBottom:`0.5px solid ${SEP}`,display:"flex",overflowX:"auto",flexShrink:0}}>
                  {astClients.map(c=>{
                    const hasUnread = unreadMsgs[c.id];
                    return (
                      <button key={c.id}
                        onClick={()=>{ setChatMgr(c.id); setUnreadMsgs(p=>({...p,[c.id]:false})); }}
                        style={{...sf,background:"transparent",border:"none",
                          borderBottom:chatMgr===c.id?`2.5px solid ${c.color}`:"2.5px solid transparent",
                          padding:"10px 14px",cursor:"pointer",color:chatMgr===c.id?c.color:g4,
                          fontWeight:chatMgr===c.id?700:400,fontSize:14,
                          whiteSpace:"nowrap",flexShrink:0,
                          display:"flex",alignItems:"center",gap:5}}>
                        {c.name.split(" ")[0]}
                        {hasUnread && <span style={{width:8,height:8,borderRadius:"50%",background:R,flexShrink:0}}/>}
                      </button>
                    );
                  })}
                </div>
              )}
              {isMgr && mgrPeer && (
                <ChatBlock messages={msgs} setMessages={setMsgs}
                  mgrId={freshMe.id} myRole="manager" peer={mgrPeer}
                  onSend={()=>setUnreadMsgs(p=>({...p,[freshMe.id]:true}))}/>
              )}
              {isAst && activeChatObj && (
                <ChatBlock messages={msgs} setMessages={setMsgs}
                  mgrId={activeChatId} myRole="assistant" peer={activeChatObj} onSend={null}/>
              )}
              {isAst && !activeChatObj && (
                <div style={{textAlign:"center",padding:"60px 0",...sf,color:g4}}>Выберите клиента</div>
              )}
            </div>
          )}
        </div>
 
        {/* Нижняя навигация */}
        {!isAdmin && (
          <div style={{background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",
            borderTop:`0.5px solid ${SEP}`,display:"flex",flexShrink:0,paddingBottom:8}}>
            {TABS.map(t=>{
              const hasUnreadChat = isAst && t.k==="chat" && Object.values(unreadMsgs).some(v=>v);
              const hasNewTask    = isAst && t.k==="tasks" && Object.values(newTasksNotif).some(v=>v>0);
              return (
                <button key={t.k} onClick={()=>setTab(t.k)}
                  style={{...sf,flex:1,background:"transparent",border:"none",cursor:"pointer",
                    padding:"9px 4px 5px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    position:"relative"}}>
                  <span style={{fontSize:22,position:"relative"}}>
                    {t.i}
                    {(hasUnreadChat||hasNewTask) && (
                      <span style={{position:"absolute",top:-2,right:-4,width:9,height:9,
                        borderRadius:"50%",background:R,border:`2px solid ${WH}`}}/>
                    )}
                  </span>
                  <span style={{fontSize:10,fontWeight:tab===t.k?700:400,color:tab===t.k?B:g4}}>{t.l}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
 
