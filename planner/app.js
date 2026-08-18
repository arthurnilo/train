const phases = [
  {
    name:'Fase 1 — Base', short:'Fase 1', weeks:'1–8', focus:'Técnica, força básica, mobilidade e base aeróbica.',
    days:{
      1:[['Força A','Agachamento 5×5 + barra fixa 5×5–8 + terra romeno 3×6–8 + desenvolvimento 4×5–6.','50–60 min • RPE 7'],['Potência','Box jump 5×3, descanso completo e aterrissagem perfeita.','8–10 min']],
      2:[['Calistenia','Barra 4 séries + dips 4 séries + handstand 10 min + hollow 3×30s + hanging knee raise 3×8–12.','40–45 min • técnico'],['Sprint','6×60 m com 90–120 s de descanso.','15 min • RPE 8']],
      3:[['Recuperação','Caminhada leve e mobilidade de tornozelo, quadril, ombro e punho.','20–35 min']],
      4:[['Força B','Terra 5×3 + agachamento frontal 4×5 + barra com peso 5×5 + push press 5×3 + split squat 3×6.','50–60 min • RPE 7–8']],
      5:[['Condicionamento','4 rounds: 600–800 m corrida + remo/bike + lunges + burpees + farmer carry.','45–55 min • RPE 7']],
      6:[['Spider Skills','Handstand, muscle-up progressão, L-sit, pistol squat, grip e mobilidade.','40–60 min • opcional']],
      0:[['Descanso','Descanso completo ou caminhada leve.','Livre']]
    }
  },
  {
    name:'Fase 2 — Força & Explosão', short:'Fase 2', weeks:'9–16', focus:'Mais força relativa, potência e calistenia intermediária.',
    days:{
      1:[['Força A','Agachamento 5×3 + barra com peso 5×4 + terra romeno 4×6 + OHP 4×5.','50–60 min • RPE 8'],['Potência','Box jump 6×2 + broad jump 5×2.','10 min']],
      2:[['Skills','Muscle-up 15 min + front lever tuck 5×10–15s + handstand 15 min.','40 min'],['Sprint','8×80 m, descanso completo.','18 min • RPE 9']],
      3:[['Recuperação','Mobilidade + Z2 muito leve.','25–40 min']],
      4:[['Força B','Terra 5×3 + agachamento frontal 4×4 + push press 5×3 + barra com peso 5×3 + farmer carry.','55–60 min • RPE 8']],
      5:[['Hyrox style','4–5 blocos de corrida + estação funcional.','50–60 min • RPE 8']],
      6:[['Agilidade & Skills','Shuttle 5-10-5 + saltos laterais + escalada/monkey bar + mobilidade.','45–60 min']],
      0:[['Descanso','Recuperação total.','Livre']]
    }
  },
  {
    name:'Fase 3 — Atleticismo', short:'Fase 3', weeks:'17–24', focus:'Velocidade, mudança de direção, potência repetida e resistência.',
    days:{
      1:[['Força + potência','Agachamento 4×3 + barra com peso 5×3 + push press 6×2 + saltos.','50–60 min']],
      2:[['Calistenia avançada','Muscle-up + front lever + handstand + core.','40 min'],['Velocidade','4×40 m + 4×100 m.','20 min']],
      3:[['Recuperação','Mobilidade e caminhada.','20–30 min']],
      4:[['Força B','Terra 4×2–3 + unilateral + puxada pesada + carry.','50–60 min']],
      5:[['Hyrox style','Corrida comprometida + sled/carry/remo/burpee.','50–60 min']],
      6:[['Atletismo','Mudanças de direção, reação, precisão de salto, vault básico e mobilidade.','45–60 min']],
      0:[['Descanso','Recuperação.','Livre']]
    }
  },
  {
    name:'Fase 4 — Performance', short:'Fase 4', weeks:'25–32', focus:'Consolidar habilidades, testar marcas e atingir pico.',
    days:{
      1:[['Força principal','Alternar agachamento pesado e volume moderado + barra pesada.','50 min • RPE 8–9']],
      2:[['Skill principal','25 min focando muscle-up, front lever ou handstand.','25 min'],['Sprint','6×60 m ou 4×100 m cronometrados.','15–20 min']],
      3:[['Recuperação','Z2 leve + mobilidade.','30–40 min']],
      4:[['Força B','Alternar terra pesado + push press + barra pesada + carry.','50–60 min']],
      5:[['Conditioning test','Simulado Hyrox parcial ou circuito de 35–50 min.','45–60 min']],
      6:[['Teste atlético','Alternar salto, shuttle, grip, corrida curta e circuito técnico.','40–50 min']],
      0:[['Descanso','Revisão semanal e recuperação.','Livre']]
    }
  }
];

const goals=['20 barras perfeitas','Muscle-up consistente','Handstand 60 segundos','Front lever','Agachamento 2× peso corporal','Terra 2,5× peso corporal','Dead hang 90 segundos','5 km forte','Treinar mobilidade com consistência'];
const storeKey='spiderPerformanceV1';
const defaultState={settings:{name:'Atleta',phase:0,weeklyTarget:4},days:{},metrics:{},goals:{}};
let state=load();
function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(storeKey)||'{}')}}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem(storeKey,JSON.stringify(state))}
function iso(d=new Date()){return d.toISOString().slice(0,10)}
function todayData(){const key=iso(); return state.days[key] ||= {done:[],energy:'',sleep:'',note:'',saved:false};}
function weekdayName(d=new Date()){return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][d.getDay()]}

const phaseSelect=document.querySelector('#phaseSelect'), settingsPhase=document.querySelector('#settingsPhase');
phases.forEach((p,i)=>{phaseSelect.add(new Option(p.short,i));settingsPhase.add(new Option(p.name,i));});

function renderToday(){
  const d=new Date(), day=todayData(), phase=phases[state.settings.phase], blocks=phase.days[d.getDay()]||[];
  document.querySelector('#dateLabel').textContent=d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  document.querySelector('#todayTitle').textContent=`${weekdayName(d)} • ${phase.short}`;
  document.querySelector('#todaySubtitle').textContent=blocks.map(x=>x[0]).join(' + ');
  phaseSelect.value=state.settings.phase; document.querySelector('#levelPill').textContent=phase.short;
  document.querySelector('#energySelect').value=day.energy||''; document.querySelector('#sleepInput').value=day.sleep||''; document.querySelector('#noteInput').value=day.note||'';
  const list=document.querySelector('#workoutList'); list.innerHTML='';
  blocks.forEach((b,i)=>{const done=day.done.includes(i); const el=document.createElement('article');el.className='workout-item'+(done?' done':'');el.innerHTML=`<button class="check-btn ${done?'done':''}" data-i="${i}">${done?'✓':'○'}</button><div class="workout-copy"><h4>${b[0]}</h4><p>${b[1]}</p><p class="workout-meta">${b[2]}</p></div>`;list.appendChild(el)});
  list.querySelectorAll('.check-btn').forEach(btn=>btn.onclick=()=>{const i=+btn.dataset.i;day.done=day.done.includes(i)?day.done.filter(x=>x!==i):[...day.done,i];save();renderToday();renderProgress()});
  const pct=blocks.length?Math.round(day.done.length/blocks.length*100):100; document.querySelector('#todayScore').textContent=pct+'%'; document.querySelector('#scoreRing').style.background=`conic-gradient(var(--red) ${pct}%,#2a2f3c ${pct}%)`;
}
function renderPlan(){const wrap=document.querySelector('#phaseCards');wrap.innerHTML='';phases.forEach((p,i)=>{const el=document.createElement('article');el.className='phase-card '+(i===state.settings.phase?'active-phase':'');const dayHtml=Object.entries(p.days).map(([k,v])=>`<details class="day-plan"><summary>${['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][k]}</summary><ul>${v.map(x=>`<li><b>${x[0]}:</b> ${x[1]}</li>`).join('')}</ul></details>`).join('');el.innerHTML=`<div class="phase-top"><div><p class="eyebrow">SEMANAS ${p.weeks}</p><h3>${p.name}</h3></div>${i===state.settings.phase?'<span class="level-pill">ATUAL</span>':''}</div><p>${p.focus}</p><div class="week-row">${Array.from({length:8},(_,w)=>`<div class="week-dot ${i===state.settings.phase&&w===0?'current':''}">${w+1}</div>`).join('')}</div>${dayHtml}`;wrap.appendChild(el)})}
function completionStats(){const vals=Object.values(state.days).filter(x=>x.saved);const sessions=vals.length;const done=vals.reduce((a,x)=>a+(x.done?.length||0),0);const total=vals.reduce((a,x)=>a+Math.max(x.done?.length||0,1),0);let streak=0,d=new Date();for(let i=0;i<60;i++){const entry=state.days[iso(d)];if(entry?.saved)streak++;else if(i>0)break;d.setDate(d.getDate()-1)}return {sessions,streak,pct:sessions?Math.round(done/total*100):0}}
function renderProgress(){const s=completionStats();document.querySelector('#statSessions').textContent=s.sessions;document.querySelector('#statStreak').textContent=s.streak;document.querySelector('#statCompletion').textContent=s.pct+'%';document.querySelector('#statPhase').textContent=state.settings.phase+1;document.querySelectorAll('[data-metric]').forEach(i=>i.value=state.metrics[i.dataset.metric]??'');const gl=document.querySelector('#goalsList');gl.innerHTML='';goals.forEach((g,i)=>{const done=!!state.goals[i];const el=document.createElement('div');el.className='goal';el.innerHTML=`<button data-goal="${i}" class="${done?'done':''}">${done?'✓':'○'}</button><span>${g}</span>`;gl.appendChild(el)});gl.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.goals[b.dataset.goal]=!state.goals[b.dataset.goal];save();renderProgress()})}
function renderSettings(){document.querySelector('#nameInput').value=state.settings.name||'';settingsPhase.value=state.settings.phase;document.querySelector('#weeklyTarget').value=state.settings.weeklyTarget||4}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='planView')renderPlan();if(id==='progressView')renderProgress();if(id==='settingsView')renderSettings()}

document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
phaseSelect.onchange=e=>{state.settings.phase=+e.target.value;save();settingsPhase.value=e.target.value;renderToday();renderPlan();renderProgress()};
document.querySelector('#energySelect').onchange=e=>{todayData().energy=e.target.value;save()};
document.querySelector('#sleepInput').onchange=e=>{todayData().sleep=e.target.value;save()};
document.querySelector('#noteInput').onchange=e=>{todayData().note=e.target.value;save()};
document.querySelector('#saveDay').onclick=()=>{const d=todayData();d.energy=document.querySelector('#energySelect').value;d.sleep=document.querySelector('#sleepInput').value;d.note=document.querySelector('#noteInput').value;d.saved=true;save();renderProgress();alert('Treino salvo. Boa missão. 🕷️')};
document.querySelector('#resetToday').onclick=()=>{if(confirm('Limpar os checks de hoje?')){todayData().done=[];save();renderToday()}};
document.querySelector('#saveMetrics').onclick=()=>{document.querySelectorAll('[data-metric]').forEach(i=>state.metrics[i.dataset.metric]=i.value);save();alert('Marcas salvas.')};
document.querySelector('#saveSettings').onclick=()=>{state.settings.name=document.querySelector('#nameInput').value||'Atleta';state.settings.phase=+settingsPhase.value;state.settings.weeklyTarget=+document.querySelector('#weeklyTarget').value;save();renderToday();renderPlan();renderProgress();alert('Ajustes salvos.')};
document.querySelector('#clearData').onclick=()=>{if(confirm('Apagar todos os dados do planner deste navegador?')){localStorage.removeItem(storeKey);state=structuredClone(defaultState);location.reload()}};

renderToday();renderProgress();renderSettings();
