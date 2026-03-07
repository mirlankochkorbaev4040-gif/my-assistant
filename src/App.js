> Mika:
import { useState } from "react";

// ── ЦВЕТА И ШРИФТ ─────────────────────────────────────────────────────────────
const B = "#007AFF", G = "#34C759", R = "#FF3B30", O = "#FF9500";
const g1="#F2F2F7", g2="#E5E5EA", g3="#C7C7CC", g4="#8E8E93";
const BG="#F2F2F7", WH="#FFF", SEP="rgba(60,60,67,0.12)";
const sf = { fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" };

const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const fmtMin = m => m >= 60 ? ${Math.floor(m/60)} ч ${m%60 ? m%60+" мин":""} : ${m} мин;

// ── ДАННЫЕ ────────────────────────────────────────────────────────────────────
const USERS = [
  { id:"admin1", role:"admin",     name:"Администратор",    initials:"AD", color:R,        login:"admin",    pw:"admin123" },
  { id:"ast1",   role:"assistant", name:"Мария Кузнецова",  initials:"МК", color:B,        login:"maria",    pw:"maria123", clients:["mgr1","mgr2","mgr3"] },
  { id:"ast2",   role:"assistant", name:"Иван Смирнов",     initials:"ИС", color:"#AF52DE",login:"ivan",     pw:"ivan123",  clients:["mgr4"] },
  { id:"mgr1",   role:"manager",   name:"Алексей Морозов",  initials:"АМ", color:B,        login:"alex",     pw:"alex123",  astId:"ast1", subDays:28,
    info:"CEO · ООО Горизонт",
    about:"Предпочитает краткие отчёты. Рабочее время 9:00–18:00. Срочные вопросы — только WhatsApp.",
    likes:"Быстрое выполнение, инициативность, чёткие отчёты",
    dislikes:"Опоздания, лишние звонки, размытые ответы",
    accesses:[{icon:"📧",label:"Gmail",val:"alex@gorizo.ru / G@2024!"},{icon:"💼",label:"CRM",val:"alex_m / CRM#567"}],
    files:[{name:"Устав.pdf",size:"2.4 МБ",icon:"📄"},{name:"Реквизиты.docx",size:"180 КБ",icon:"📝"}]
  },
  { id:"mgr2",   role:"manager",   name:"Светлана Петрова", initials:"СП", color:G,        login:"svetlana", pw:"svet123",  astId:"ast1", subDays:14,
    info:"COO · Альфа Групп",
    about:"Любит детальные отчёты. Созвоны только по записи. Telegram предпочтительнее.",
    likes:"Детализация, пунктуальность", dislikes:"Неожиданные звонки",
    accesses:[{icon:"📧",label:"Email",val:"s.petrova@alfa.ru"}], files:[]
  },
  { id:"mgr3",   role:"manager",   name:"Дмитрий Волков",   initials:"ДВ", color:O,        login:"dmitry",   pw:"dima123",  astId:"ast1", subDays:7,
    info:"Директор · Волна Медиа",
    about:"Работает до 21:00. Любит голосовые сообщения. Оперативно в WhatsApp.",
    likes:"Скорость, краткость", dislikes:"Длинные письма",
    accesses:[], files:[{name:"Бриф.pdf",size:"1.1 МБ",icon:"📄"}]
  },
  { id:"mgr4",   role:"manager",   name:"Анна Белова",      initials:"АБ", color:"#FF2D55",login:"anna",     pw:"anna123",  astId:"ast2", subDays:21,
    info:"HR-директор · Старт",
    about:"Рабочее время 10:00–19:00.", likes:"Точность", dislikes:"Опоздания", accesses:[], files:[]
  },
];

const INIT_TASKS = {
  mgr1:[
    {id:1,title:"Найти поставщика упаковки",   desc:"Минимум 3 предложения с ценами", deadline:"2026-03-02",priority:"high",  er:"Таблица сравнения",     status:"done",       rating:5,rc:"Отлично!",  saved:90,  files:[]},
    {id:2,title:"Подготовить КП для Горизонт", desc:"КП для ООО Горизонт",             deadline:"2026-03-05",priority:"high",  er:"Готовый PDF",           status:"in_progress",rating:null,rc:null,      saved:null,files:[]},
    {id:3,title:"Записать машину на техосмотр",desc:"Audi A6, А123ВС, любая СТО",      deadline:"2026-03-11",priority:"low",   er:"Подтверждение записи",  status:"new",        rating:null,rc:null,      saved:null,files:[]},
  ],
  mgr2:[
    {id:4,title:"Анализ конкурентов",          desc:"5 конкурентов по ценам",          deadline:"2026-03-08",priority:"medium",er:"Отчёт Google Docs",     status:"problem",    rating:null,rc:null,      saved:null,files:[]},

> Mika:
{id:5,title:"Забронировать отель Москва",  desc:"5–7 апреля, центр, до 8000₽/ночь",deadline:"2026-03-20",priority:"medium",er:"Подтверждение брони",  status:"done",       rating:4,rc:"Хорошо!",  saved:35,  files:[]},
  ],
  mgr3:[
    {id:6,title:"Подготовить презентацию",     desc:"15 слайдов для инвесторов",       deadline:"2026-03-10",priority:"high",  er:"PowerPoint файл",       status:"in_progress",rating:null,rc:null,      saved:null,files:[]},
  ],
  mgr4:[
    {id:7,title:"Собрать резюме кандидатов",   desc:"На позицию Middle Developer",     deadline:"2026-03-12",priority:"high",  er:"10+ резюме в папке",    status:"new",        rating:null,rc:null,      saved:null,files:[]},
  ],
};

const INIT_MSGS = {
  mgr1:[
    {id:1,from:"manager",  text:"Привет! Когда будет КП?",          time:"09:15",files:[]},
    {id:2,from:"assistant",text:"Сегодня к 17:00 пришлю!",          time:"09:18",files:[]},
    {id:3,from:"manager",  text:"Отлично, жду 👍",                  time:"09:20",files:[]},
  ],
  mgr2:[
    {id:1,from:"assistant",text:"Начала работу над анализом.",       time:"10:00",files:[]},
    {id:2,from:"manager",  text:"Хорошо. Нужно до пятницы.",         time:"10:15",files:[]},
  ],
  mgr3:[
    {id:1,from:"manager",  text:"Презентация готова?",               time:"11:30",files:[]},
    {id:2,from:"assistant",text:"8 из 15 слайдов готово.",           time:"11:35",files:[]},
  ],
  mgr4:[],
};

const INIT_EVENTS = {
  mgr1:[
    {id:1,date:"2026-03-10",time:"10:00",title:"Встреча с инвесторами",type:"meeting", by:"manager"},
    {id:2,date:"2026-03-12",time:"14:00",title:"Звонок с поставщиком", type:"call",    by:"assistant"},
    {id:3,date:"2026-03-07",time:"11:00",title:"Встреча с командой",   type:"meeting", by:"assistant"},
  ],
  mgr2:[{id:1,date:"2026-03-09",time:"15:00",title:"Созвон по анализу",     type:"call",    by:"assistant"}],
  mgr3:[{id:1,date:"2026-03-10",time:"09:00",title:"Дедлайн — презентация", type:"deadline",by:"manager"}],
  mgr4:[],
};

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
