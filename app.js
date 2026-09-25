
const phaseDefs=[
 {name:'Fase 1 — Base & Padrão Vertical',short:'F1',weeks:'1–4',focus:'Força base + reconstrução do dip/drive vertical.'},
 {name:'Fase 2 — Força Máxima & Tripla Extensão',short:'F2',weeks:'5–7',focus:'Mais força e extensão rápida/coordenada.'},
 {name:'Semana 8 — Deload Técnico',short:'D8',weeks:'8',focus:'Reduzir fadiga e lapidar técnica.'},
 {name:'Fase 3 — Potência & Transferência',short:'F3',weeks:'9–12',focus:'Converter força em potência específica de toss.'},
 {name:'Fase 4 — Pico de Performance',short:'F4',weeks:'13–15',focus:'Manter força, maximizar velocidade e chegar fresco ao cheer.'},
 {name:'Semana 16 — Deload & Testes',short:'W16',weeks:'16',focus:'Recuperar e medir força, potência e transferência.'}
];
function phaseForWeek(w){if(w<=4)return 0;if(w<=7)return 1;if(w===8)return 2;if(w<=12)return 3;if(w<=15)return 4;return 5}
const names={force:'A — FORCE',toss:'B — TOSS ENGINE',speed:'C — SPEED TRANSFER',armor:'D — ARMOR',cheer:'CHEER',recovery:'RECOVERY'};
const descriptions={
 force:'Força absoluta, pernas, posterior e pulling.',
 toss:'Tripla extensão, dip/drive, clean/jerk e sincronia pernas → braços.',
 speed:'Pliometria, força rápida e primer neural com baixa fadiga.',
 armor:'Overhead, unilateral, core, estabilidade e prehab.',
 cheer:'Transferência real para toss, stunts e skills.',
 recovery:'Recuperação, mobilidade e restauração.'
};
const goals=['Dip/drive vertical consistente','Tripla extensão sincronizada','Timing pernas → braços consistente','Toss Quality Score ≥ 22/25','Weighted pull-up mais forte','Back squat mais forte','Push press mais forte e rápido','CMJ mais alto','Cupie/overhead estável','Completar 16 semanas com deloads'];
const storeKey='arthurCheerPerformanceFlexV2', oldKey='arthurCheerPerformance16W';
const defaultState={settings:{name:'Arthur',week:1,phase:0,weeklyTarget:3},days:{},metrics:{},goals:{},tossScores:{},history:[]};
function load(){
 try{
  const fresh=JSON.parse(localStorage.getItem(storeKey)||'null');
  if(fresh)return {...structuredClone(defaultState),...fresh,settings:{...defaultState.settings,...fresh.settings}};
  const old=JSON.parse(localStorage.getItem(oldKey)||'null');
  if(old)return {...structuredClone(defaultState),...old,settings:{...defaultState.settings,...old.settings,weeklyTarget:3},history:old.history||[]};
 }catch(e){}
 return structuredClone(defaultState)
}
let state=load();
function save(){localStorage.setItem(storeKey,JSON.stringify(state))}
function iso(d=new Date()){return d.toISOString().slice(0,10)}
function weekdayName(d=new Date()){return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][d.getDay()]}
function todayData(){const k=iso();return state.days[k] ||= {done:[],energy:'',sleep:'',note:'',saved:false,session:null,unavailable:false}}
function weekStart(d=new Date()){const x=new Date(d);const day=x.getDay();const diff=(day===0?-6:1-day);x.setDate(x.getDate()+diff);x.setHours(0,0,0,0);return x}
function completedThisWeek(){
 const s=weekStart(), e=new Date(s);e.setDate(e.getDate()+7);
 return state.history.filter(h=>{const d=new Date(h.date+'T12:00:00');return d>=s&&d<e&&['force','toss','speed','armor'].includes(h.session)}).map(h=>h.session)
}
function lastPhysical(){
 return [...state.history].reverse().find(h=>['force','toss','speed','armor'].includes(h.session))
}
function cheerToday(day=new Date().getDay()){return [4,6,0].includes(day)}
function cheerTomorrow(day=new Date().getDay()){return [3,5,6].includes(day)}
function queue(){
 const done=completedThisWeek();
 const q=['toss','force','speed'].filter(x=>!done.includes(x));
 if(done.includes('toss')&&done.includes('force')&&done.includes('speed')&&!done.includes('armor'))q.push('armor');
 return q.length?q:['armor','speed','toss','force'];
}
function recommend(){
 const d=new Date(), wd=d.getDay(), day=todayData();
 if(day.session)return {session:day.session,reason:'Você já selecionou esta sessão para hoje.'};
 if(cheerToday(wd))return {session:'cheer',reason:'Hoje é dia de cheer. A prioridade é transferir a força para toss/skills, não acumular fadiga na academia.'};
 if(wd===5)return {session:'recovery',reason:'Sexta fica como recuperação entre o cheer de quinta e o fim de semana.'};
 const q=queue(); let pick=q[0];
 const last=lastPhysical();
 if(cheerTomorrow(wd)){
   if(pick==='force'||pick==='toss') pick=q.includes('speed')?'speed':'armor';
   return {session:pick,reason:'Há cheer amanhã: recomendação de baixa fadiga e alta qualidade para chegar rápido e fresco.'};
 }
 if(last){
   const days=(new Date(iso()+'T12:00:00')-new Date(last.date+'T12:00:00'))/86400000;
   if(days<1.5 && last.session==='force' && pick==='toss') pick=q.includes('speed')?'speed':'armor';
 }
 return {session:pick,reason:'Escolhido pela fila de prioridade da semana, preservando recuperação e transferência para o cheer.'};
}
function phase(){state.settings.phase=phaseForWeek(+state.settings.week||1);return phaseDefs[state.settings.phase]}
function sessionBlocks(type){
 const w=+state.settings.week||1, p=phaseForWeek(w);
 if(type==='cheer')return [['CHEER — Transferência','Cue principal: EMPURRA O CHÃO E CRESCE. Segunda cue: DOWN → UP. Evite pensar em muitas articulações durante o stunt.','Treino específico'],['Toss Quality','Depois do treino registre altura, verticalidade, timing, tripla extensão e catch/controle.','2 min']];
 if(type==='recovery')return [['Recuperação','Descanso total OU 20–30 min de caminhada/bike leve.','RPE 1–3'],['Mobilidade','Tornozelo, quadril, T-spine e ombros sem forçar amplitude.','10–15 min']];
 if(type==='armor')return [['Cupie/Overhead Hold','3×20–35 s por braço. Costelas sobre pelve.','8 min'],['Pull + estabilidade','Row 3×8 + face pull 2×15 + rotação externa 2×15.','12 min'],['Core transmissor','Pallof 3×10 + ab wheel 3×8–12 + Copenhagen 2×20–30 s.','15 min'],['Mobilidade','Tornozelo + quadril + T-spine.','10 min']];
 if(p===2)return type==='force'?[['Força leve','Back squat 3×5 ~60–65% + pull-up 3×5 + RDL 2×6.','35–45 min']]:type==='toss'?[['Toss Lab leve','Dip & Freeze 3×3 + vertical jump 3×3 + hang clean leve 3×3.','30–40 min']]:[['Primer técnico','CMJ 3×2 + med ball 3×2 + push press leve 3×3.','25–35 min']];
 if(p===5)return type==='force'?[['Testes submáximos','Atualizar e1RM de squat e weighted pull-up sem falhar repetições.','45 min']]:type==='toss'?[['Teste de potência/técnica','CMJ + broad jump + vídeo lateral de dip-drive + hang clean técnico.','40 min']]:[['Primer/recuperação','Pliometria mínima + mobilidade + prehab.','25–30 min']];
 if(type==='force'){
  if(p===0)return [['CMJ + Stick','4×3. Máxima intenção; aterrissagem controlada.','8 min'],['Back Squat','5×5. Descida controlada, brace e subida agressiva.','18 min • RPE 7–8'],['Weighted Pull-up','4×4–6.','10 min'],['Romanian Deadlift','3×6.','10 min'],['Bulgarian Split Squat','3×6/perna.','8 min'],['Farmer Carry + Ab Wheel','3×25 m + 3×8–12.','8 min']];
  if(p===1)return [['CMJ','5×2 com descanso completo.','8 min'],['Back Squat','5×3 pesado, sem grind.','18 min • RPE 8'],['Weighted Pull-up','5×3–5.','10 min'],['RDL','4×5.','10 min'],['Split Squat','3×5/perna.','8 min'],['Farmer Carry','4×25 m pesado.','6 min']];
  if(p===3)return [['CMJ','4×2 máximo.','7 min'],['Back Squat','4×3 forte.','15 min • RPE 8'],['Weighted Pull-up','5×3.','9 min'],['RDL','3×5.','9 min'],['Split Squat','3×5/perna.','8 min'],['Ab Wheel','3×8–12.','5 min']];
  return [['CMJ','4×2 máximo.','7 min'],['Back Squat','4×2–3 pesado, sem grind.','14 min • RPE 8–9'],['Weighted Pull-up','4×3 pesado.','9 min'],['RDL','2×5.','7 min'],['Carry + Core','3 séries.','8 min']];
 }
 if(type==='toss'){
  const base=[['TÉCNICA — Dip & Freeze','3–4×3. Empilhe costelas sobre pelve; dip vertical.','6 min'],['Vertical Jump + Arms','4×3. Pernas iniciam e braços terminam; não projete a barriga.','7 min']];
  if(p===0)return [...base,['Jump Shrug','3×3. Tripla extensão para CIMA.','6 min'],['Hang Power Clean','5×3 leve/moderado. Velocidade > carga.','15 min'],['Power Jerk','4×3. Dip curto vertical → drive → lockout.','12 min'],['Strict Press + Row','4×5 + 3×6–8.','12 min']];
  if(p===1)return [...base,['Hang High Pull','4×3. Termine alto.','8 min'],['Hang Power Clean','6×2 rápido.','15 min'],['Power Jerk','5×2–3.','12 min'],['Dips com peso','3×5–8.','7 min']];
  if(p===3)return [...base,['Hang Power Clean','5×2 rápido.','12 min'],['Clean + Power Jerk','4×(1+2).','12 min'],['Loaded Jump','4×3 leve e explosivo.','8 min'],['Push Press','4×3.','9 min']];
  return [...base,['Hang Power Clean','5×2 rápido.','12 min'],['Power Jerk','5×2 rápido.','10 min'],['Push Press','3×3.','8 min'],['Cupie Hold','3 séries de qualidade.','7 min']];
 }
 // speed
 if(p===0)return [['Depth Jump Freeze','3×3. Aterrissagem limpa.','7 min'],['Med Ball Overhead Throw','5×3 máximo e vertical.','8 min'],['Push Press','5×3 rápido. Pare se perder velocidade.','12 min'],['Pogo Jump','3×10. Contato curto.','5 min'],['Core + Prehab','Pallof + Copenhagen + manguito.','15 min']];
 if(p===1)return [['Depth Jump → Vertical','4×2.','8 min'],['Med Ball Throw','5×3.','7 min'],['Push Press','6×2 rápido.','12 min'],['Overhead Hold','3×25–35 s unilateral.','8 min'],['Core/Prehab','Hanging raise + Pallof + manguito.','12 min']];
 if(p===3)return [['Reactive Plyo','Depth jump 4×2 + pogo 3×10.','10 min'],['Med Ball Toss','6×2 máximo.','7 min'],['Push Press velocidade','5×2 moderado.','10 min'],['Handstand/Cupie','3 séries de qualidade.','8 min'],['Prehab','Ombro + core + mobilidade.','12 min']];
 return [['Primer neural','Depth jump 3×2 + med ball 4×2.','10 min'],['Push Press leve/rápido','4×2.','8 min'],['Controle corporal','Handstand + core + mobilidade.','20 min'],['Sair fresco','Sem falha, sem volume extra.','—']];
}
function setSession(type){const d=todayData();d.session=type;d.unavailable=false;d.done=[];save();renderToday()}
function renderToday(){
 const d=new Date(), day=todayData(), ph=phase(), rec=recommend(), active=day.session||rec.session, blocks=sessionBlocks(active);
 document.querySelector('#dateLabel').textContent=d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
 document.querySelector('#todayTitle').textContent=`${weekdayName(d)} • Semana ${state.settings.week}`;
 document.querySelector('#todaySubtitle').textContent=names[active]+' — '+descriptions[active];
 document.querySelector('#levelPill').textContent=ph.short;
 document.querySelector('#quickWeek').value=state.settings.week;
 document.querySelector('#energySelect').value=day.energy||'';
 document.querySelector('#sleepInput').value=day.sleep||'';
 document.querySelector('#noteInput').value=day.note||'';
 document.querySelector('#recommendTitle').textContent=names[rec.session];
 document.querySelector('#recommendReason').textContent=rec.reason;
 document.querySelector('#activeSessionName').textContent=names[active];
 document.querySelector('#queueText').textContent=queue().map(x=>names[x]).join(' → ');
 document.querySelector('#readinessPill').textContent=cheerTomorrow()?'CHEER AMANHÃ':'PRIORIDADE';
 const picker=document.querySelector('#sessionPicker');picker.innerHTML='';
 ['force','toss','speed','armor','recovery'].forEach(t=>{const b=document.createElement('button');b.className='session-choice';b.innerHTML=`${names[t]}<small>${descriptions[t]}</small>`;b.onclick=()=>{setSession(t);picker.classList.add('hidden')};picker.appendChild(b)});
 const list=document.querySelector('#workoutList');list.innerHTML='';
 if(active==='toss'||active==='speed'){const cue=document.createElement('div');cue.className='tech-cue';cue.innerHTML='<b>EMPURRA O CHÃO E CRESCE.</b><span>DOWN → UP • costelas sobre pelve • sem projetar quadril/barriga à frente.</span>';list.appendChild(cue)}
 blocks.forEach((b,i)=>{const done=day.done.includes(i),el=document.createElement('article');el.className='workout-item'+(done?' done':'');el.innerHTML=`<button class="check-btn ${done?'done':''}" data-i="${i}">${done?'✓':'○'}</button><div class="workout-copy"><h4>${b[0]}</h4><p>${b[1]}</p><p class="workout-meta">${b[2]}</p></div>`;list.appendChild(el)});
 list.querySelectorAll('.check-btn').forEach(btn=>btn.onclick=()=>{const i=+btn.dataset.i;day.done=day.done.includes(i)?day.done.filter(x=>x!==i):[...day.done,i];save();renderToday();renderProgress()});
 const pct=blocks.length?Math.round(day.done.length/blocks.length*100):0;
 document.querySelector('#todayScore').textContent=pct+'%';document.querySelector('#scoreRing').style.background=`conic-gradient(var(--red) ${pct}%,#2a2f3c ${pct}%)`;
 const ts=state.tossScores[iso()]||{};['height','vertical','timing','extension','control'].forEach(k=>{document.querySelector('#toss_'+k).value=ts[k]||''});
 document.querySelector('#tossTotal').textContent=['height','vertical','timing','extension','control'].reduce((a,k)=>a+(+ts[k]||0),0)+'/25';
}
function renderPlan(){
 const wrap=document.querySelector('#phaseCards');wrap.innerHTML='';
 phaseDefs.forEach((p,i)=>{const el=document.createElement('article');el.className='phase-card '+(i===state.settings.phase?'active-phase':'');el.innerHTML=`<div class="phase-top"><div><p class="eyebrow">SEMANAS ${p.weeks}</p><h3>${p.name}</h3></div>${i===state.settings.phase?'<span class="level-pill">ATUAL</span>':''}</div><p>${p.focus}</p>
 <details class="day-plan"><summary>A — FORCE</summary><ul>${sessionBlocksAt(i,'force').map(x=>`<li><b>${x[0]}:</b> ${x[1]}</li>`).join('')}</ul></details>
 <details class="day-plan"><summary>B — TOSS ENGINE</summary><ul>${sessionBlocksAt(i,'toss').map(x=>`<li><b>${x[0]}:</b> ${x[1]}</li>`).join('')}</ul></details>
 <details class="day-plan"><summary>C — SPEED TRANSFER</summary><ul>${sessionBlocksAt(i,'speed').map(x=>`<li><b>${x[0]}:</b> ${x[1]}</li>`).join('')}</ul></details>
 <details class="day-plan"><summary>D — ARMOR (opcional)</summary><p>Overhead, core, estabilidade e prehab. Use quando houver um dia extra sem comprometer o cheer.</p></details>`;wrap.appendChild(el)})
}
function sessionBlocksAt(p,t){const old=state.settings.week;state.settings.week=[1,5,8,9,13,16][p];const b=sessionBlocks(t);state.settings.week=old;state.settings.phase=phaseForWeek(old);return b}
function completionStats(){const sessions=state.history.length;let streak=0,d=new Date();for(let i=0;i<60;i++){if(state.days[iso(d)]?.saved)streak++;else if(i>0)break;d.setDate(d.getDate()-1)}return {sessions,streak,pct:Math.min(100,Math.round(completedThisWeek().length/Math.max(1,state.settings.weeklyTarget)*100))}}
function renderProgress(){const s=completionStats();document.querySelector('#statSessions').textContent=s.sessions;document.querySelector('#statStreak').textContent=s.streak;document.querySelector('#statCompletion').textContent=s.pct+'%';document.querySelector('#statPhase').textContent=state.settings.week;document.querySelectorAll('[data-metric]').forEach(i=>i.value=state.metrics[i.dataset.metric]??'');const gl=document.querySelector('#goalsList');gl.innerHTML='';goals.forEach((g,i)=>{const done=!!state.goals[i],el=document.createElement('div');el.className='goal';el.innerHTML=`<button data-goal="${i}" class="${done?'done':''}">${done?'✓':'○'}</button><span>${g}</span>`;gl.appendChild(el)});gl.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.goals[b.dataset.goal]=!state.goals[b.dataset.goal];save();renderProgress()})}
function renderSettings(){document.querySelector('#nameInput').value=state.settings.name||'';document.querySelector('#weekInput').value=state.settings.week;document.querySelector('#weeklyTarget').value=state.settings.weeklyTarget||3;document.querySelector('#settingsPhase').innerHTML='';phaseDefs.forEach((p,i)=>document.querySelector('#settingsPhase').add(new Option(p.name,i)));document.querySelector('#settingsPhase').value=state.settings.phase}
function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='planView')renderPlan();if(id==='progressView')renderProgress();if(id==='settingsView')renderSettings()}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
document.querySelector('#startRecommended').onclick=()=>setSession(recommend().session);
document.querySelector('#chooseSession').onclick=()=>document.querySelector('#sessionPicker').classList.toggle('hidden');
document.querySelector('#cantTrain').onclick=()=>{const d=todayData();d.unavailable=true;d.session=null;d.done=[];d.note='Dia indisponível — sessão devolvida à fila.';save();renderToday();alert('Sem problema: o treino voltou para a fila de prioridade.')};
document.querySelector('#quickWeek').onchange=e=>{state.settings.week=Math.max(1,Math.min(16,+e.target.value||1));state.settings.phase=phaseForWeek(state.settings.week);save();renderToday();renderProgress()};
document.querySelector('#energySelect').onchange=e=>{todayData().energy=e.target.value;save()};
document.querySelector('#sleepInput').onchange=e=>{todayData().sleep=e.target.value;save()};
document.querySelector('#noteInput').onchange=e=>{todayData().note=e.target.value;save()};
document.querySelector('#resetToday').onclick=()=>{if(confirm('Limpar os checks e a sessão escolhida de hoje?')){const d=todayData();d.done=[];d.session=null;save();renderToday()}};
document.querySelector('#saveDay').onclick=()=>{const d=todayData(), active=d.session||recommend().session;d.session=active;d.energy=document.querySelector('#energySelect').value;d.sleep=document.querySelector('#sleepInput').value;d.note=document.querySelector('#noteInput').value;d.saved=true;if(!state.history.some(h=>h.date===iso()&&h.session===active))state.history.push({date:iso(),session:active,week:state.settings.week});save();renderToday();renderProgress();alert('Sessão salva e fila atualizada.')};
document.querySelector('#saveToss').onclick=()=>{const s={};['height','vertical','timing','extension','control'].forEach(k=>s[k]=+document.querySelector('#toss_'+k).value||0);state.tossScores[iso()]=s;save();renderToday();alert('Toss Quality Score salvo.')};
document.querySelector('#saveMetrics').onclick=()=>{document.querySelectorAll('[data-metric]').forEach(i=>state.metrics[i.dataset.metric]=i.value);save();alert('Marcas salvas.')};
document.querySelector('#saveSettings').onclick=()=>{state.settings.name=document.querySelector('#nameInput').value||'Arthur';state.settings.weeklyTarget=+document.querySelector('#weeklyTarget').value;state.settings.week=Math.max(1,Math.min(16,+document.querySelector('#weekInput').value||1));state.settings.phase=phaseForWeek(state.settings.week);save();renderToday();renderPlan();renderProgress();renderSettings();alert('Ajustes salvos.')};
document.querySelector('#clearData').onclick=()=>{if(confirm('Apagar todos os dados deste navegador?')){localStorage.removeItem(storeKey);state=structuredClone(defaultState);location.reload()}};
renderToday();renderProgress();renderSettings();


/* ===== v3 DRAGGABLE WEEK CALENDAR ===== */
state.schedule = state.schedule || {};
state.weekOffset = state.weekOffset || 0;
function calISO(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),x=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${x}`}
function calMonday(){const d=new Date(),w=d.getDay();d.setDate(d.getDate()+(w===0?-6:1-w));d.setHours(0,0,0,0);return d}
function calDates(){const m=calMonday();m.setDate(m.getDate()+state.weekOffset*7);return Array.from({length:7},(_,i)=>{const d=new Date(m);d.setDate(d.getDate()+i);return d})}
function seedWeek(ds){
 const defaults=['force','toss','speed','cheer','recovery','cheer','cheer'];
 ds.forEach((d,i)=>{const k=calISO(d);if(!(k in state.schedule))state.schedule[k]=[defaults[i]]});
 save();
}
let pickedCard=null;
function moveCal(from,to,type){
 state.schedule[from]=(state.schedule[from]||[]).filter(x=>x!==type);
 state.schedule[to]=state.schedule[to]||[];
 if(!state.schedule[to].includes(type))state.schedule[to].push(type);
 if(to===calISO(new Date()) && ['force','toss','speed','armor','recovery','cheer'].includes(type)) setSession(type);
 save();renderCalendar();
}
function renderCalendar(){
 const ds=calDates();seedWeek(ds);
 const strip=document.querySelector('#weekStrip');if(!strip)return;strip.innerHTML='';
 const fmt=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
 document.querySelector('#agendaRange').textContent=`${fmt(ds[0])} — ${fmt(ds[6])}`;
 const labels=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
 ds.forEach((d,i)=>{
   const k=calISO(d),box=document.createElement('div');box.className='agenda-day'+(k===calISO(new Date())?' today':'');
   box.innerHTML=`<div class="agenda-head">${labels[i]}<b>${d.getDate()}</b></div><div class="agenda-items"></div>`;
   const items=box.querySelector('.agenda-items'),arr=state.schedule[k]||[];
   if(!arr.length)items.innerHTML='<div class="empty-slot">Solte aqui</div>';
   arr.forEach(type=>{
     const c=document.createElement('div');c.className=`agenda-card ${type}`;c.draggable=true;
     c.innerHTML=`${names[type]||type}<small>${descriptions[type]||''}</small>`;
     c.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({from:k,type}));
     c.onclick=e=>{e.stopPropagation();document.querySelectorAll('.agenda-card').forEach(x=>x.style.outline='');pickedCard={from:k,type};c.style.outline='2px solid white'};
     items.appendChild(c);
   });
   box.ondragover=e=>{e.preventDefault();box.classList.add('drop')};
   box.ondragleave=()=>box.classList.remove('drop');
   box.ondrop=e=>{e.preventDefault();box.classList.remove('drop');try{const x=JSON.parse(e.dataTransfer.getData('text/plain'));moveCal(x.from,k,x.type)}catch(_){}};
   box.onclick=()=>{if(pickedCard){moveCal(pickedCard.from,k,pickedCard.type);pickedCard=null;document.querySelectorAll('.agenda-card').forEach(x=>x.style.outline='')}};
   strip.appendChild(box);
 });
}
document.querySelector('#prevWeek').onclick=()=>{state.weekOffset--;save();renderCalendar()};
document.querySelector('#nextWeek').onclick=()=>{state.weekOffset++;save();renderCalendar()};

/* Calendar is the source of today's session. */
const todayKey=calISO(new Date()), currentWeek=calDates();seedWeek(currentWeek);
const scheduled=(state.schedule[todayKey]||[]).find(x=>x!=='recovery') || (state.schedule[todayKey]||[])[0];
if(scheduled && !todayData().session){todayData().session=scheduled;save();}
renderCalendar();renderToday();

/* Make phase/week impossible to appear blank. */
const quickWeek=document.querySelector('#quickWeek');
if(quickWeek){quickWeek.value=state.settings.week||1;quickWeek.onchange=e=>{state.settings.week=Math.max(1,Math.min(16,+e.target.value||1));state.settings.phase=phaseForWeek(state.settings.week);save();renderToday();renderPlan();renderProgress();renderSettings()}}
