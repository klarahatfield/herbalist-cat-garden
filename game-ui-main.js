// ╔══════════════════════════════════════════════════════╗
// ║  game-ui-main.js                                      ║
// ║  약초사의 비밀정원 — UI 렌더링 (메인)                        ║
// ║                                                      ║
// ║  포함: renderUI, renderCraft, renderShop, renderQuest, renderStats,
// ╚══════════════════════════════════════════════════════╝

// ══════════════════════════════════════
var SH_PRICES = {energy:[2,3,5,8], gather:[1,2,3], luck:[2,3,5]};

function buyShop(type){
  if(type==='season'){
    if(G.coins.golden<1){shopMsg('⭐ 골든 냥코인이 부족합니다!');return;}
    if(G.upg.seasonPredict){shopMsg('이미 구매했습니다!');return;}
    G.coins.golden--;G.upg.seasonPredict=true;
    shopMsg('✨ 계절 예측 활성화! 다음 계절이 표시됩니다.');
    spawnFloat('⭐ 계절예측!');G.seasonForecast=true;updateUI();updateShopUI();log('[상점] 계절예측 구매 - 다음 날씨가 미리 표시됩니다');return;
  }
  const lvKey=type==='energy'?'energyBought':type+'Bonus';
  const curLv=G.upg[lvKey]||0;
  const prices=SH_PRICES[type];
  if(curLv>=prices.length){shopMsg('이미 최대 레벨!');return;}
  const price=prices[curLv];
  if(G.coins.silver<price){shopMsg(`🔘 실버 ${price}개 필요!`);return;}
  G.coins.silver-=price;
  if(type==='energy'){G.maxEnergy++;G.energy++;G.upg.energyBought++;}
  else if(type==='gather') G.upg.gatherBonus++;
  else G.upg.luckBonus++;
  shopMsg(`✨ 업그레이드 완료!`);spawnFloat('⬆️ 업그레이드!');
  updateUI();updateShopUI();
}

function buyHerb(item,bronzeCost){
  const amts={herb:3,lotus:2,shroom:2};
  if(G.coins.bronze<bronzeCost){shopMsg(`🪙 브론즈 ${bronzeCost}개 필요!`);return;}
  G.coins.bronze-=bronzeCost;
  addHerb(item,amts[item]);
  const spent = bronzeCost; shopMsg(`🛒 ${iN(item)} ${amts[item]}개 구매! (-${spent}₦)`);
  spawnFloat(`+${amts[item]} ${iN(item)}`);updateUI();
}

function sellAll(mult=1){
  const total=Object.values(G.herbs).reduce((a,b)=>a+b,0);
  if(total===0){shopMsg('팔 재료가 없습니다.');return;}
  const earned=total*mult;
  addCoins('bronze',earned);
  Object.keys(G.herbs).forEach(k=>G.herbs[k]=0);
  shopMsg(`💼 재료 ${total}개 판매 → +${earned}₦!`);
  spawnFloat(`+${earned}₦`);
  hideEvent();updateUI();updateShopUI();
}

function updateShopUI(){
  document.getElementById('ex-bronze').textContent=G.coins.bronze;
  document.getElementById('ex-silver').textContent=G.coins.silver;
  const ext=document.getElementById('ex-total');
  if(ext) ext.textContent=totalNyang();
  const eb=G.upg.energyBought||0,gb=G.upg.gatherBonus||0,lb=G.upg.luckBonus||0;
  document.getElementById('sh-ev').textContent=G.maxEnergy;
  document.getElementById('sh-ep').textContent=eb>=SH_PRICES.energy.length?'최대':'🔘'+SH_PRICES.energy[eb];
  document.getElementById('sh-energy').classList.toggle('disabled',eb>=SH_PRICES.energy.length);
  document.getElementById('sh-gv').textContent=`현재 ${1+gb}~${3+gb}개`;
  document.getElementById('sh-gp').textContent=gb>=SH_PRICES.gather.length?'최대':'🔘'+SH_PRICES.gather[gb];
  document.getElementById('sh-gather').classList.toggle('disabled',gb>=SH_PRICES.gather.length);
  document.getElementById('sh-lv').textContent=`현재 ${20+lb*10}%`;
  document.getElementById('sh-lp').textContent=lb>=SH_PRICES.luck.length?'최대':'🔘'+SH_PRICES.luck[lb];
  document.getElementById('sh-luck').classList.toggle('disabled',lb>=SH_PRICES.luck.length);
  document.getElementById('sh-sp').textContent=G.upg.seasonPredict?'구매됨':'⭐1';
  document.getElementById('sh-season').classList.toggle('disabled',!!G.upg.seasonPredict);
  const sellTotal=Object.values(G.herbs).reduce((a,b)=>a+b,0);
  document.getElementById('sell-val').textContent=sellTotal;
}

function shopMsg(t){document.getElementById('shop-msg').textContent='🐱 Baba: '+t;}

// ══════════════════════════════════════
//  QUESTS
// ══════════════════════════════════════
function trackQT(type,n){
  if(!(type in G.qt)) return;
  // day_reach는 누적이 아니라 현재 day 값으로 직접 설정
  if(type==='day_reach'){
    G.qt[type]=n; // n = G.day 직접 대입
  } else {
    G.qt[type]+=n;
  }
  G.quests.forEach(q=>{if(q.type===type&&!q.claimed)q.prog=Math.min(q.target,G.qt[type]);});
}

function checkQuestProgress(){
  const c=G.quests.filter(q=>!q.claimed&&q.prog>=q.target).length;
  const el=document.getElementById('tb-quest');
  el.textContent=c||'';
  el.parentElement.classList.toggle('has-badge',c>0);
}

function claimQuest(id){
  const q=G.quests.find(q=>q.id===id);
  if(!q||q.claimed||q.prog<q.target)return;
  q.claimed=true;G.questsCompleted++;
  if(q.reward.bronze) addCoins('bronze',q.reward.bronze);
  if(q.reward.silver) addCoins('silver',q.reward.silver);
  if(q.reward.golden) addCoins('golden',q.reward.golden);
  if(q.reward.herb) Object.entries(q.reward.herb).forEach(([k,v])=>addHerb(k,v));
  if(q.reward.energy){G.maxEnergy++;G.energy++;}
  const claimNyang=(q.reward.bronze||0)+(q.reward.silver||0)*10+(q.reward.golden||0)*100;
  spawnFloat(claimNyang>0?`+${claimNyang}₦`:'🎉완료!');
  log(`[퀘스트] "${q.title}" 완료!`);
  checkQuestProgress();checkEndings();updateUI();renderQuests();
}

function renderQuests(){
  const list=document.getElementById('quest-list');list.innerHTML='';
  G.quests.forEach(q=>{
    const pct=Math.min(100,Math.round(q.prog/q.target*100));
    const done=q.prog>=q.target;
    const qNyang=(q.reward.bronze||0)+(q.reward.silver||0)*10+(q.reward.golden||0)*100;
    const rStr=[
      qNyang>0?`+${qNyang}₦`:'',
      q.reward.energy?'⚡ Activity +1':'',
      q.reward.herb?Object.entries(q.reward.herb).map(([h,n])=>`${iN(h)}×${n}`).join(' '):'',
    ].filter(Boolean).join(' ');
    const card=document.createElement('div');
    card.className='quest-card'+(done&&!q.claimed?' done':'')+(q.claimed?' claimed':'');
    card.innerHTML=`
      <div class="qh">
        <span class="q-icon">${q.icon}</span>
        <span class="q-title">${q.title}</span>
        <span class="q-diff diff-${q.diff}">${q.diff==='easy'?'쉬움':q.diff==='med'?'보통':'어려움'}</span>
      </div>
      <div class="qb">
        <div class="q-desc">${q.desc}</div>
        <div class="q-prog">
          <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
          <span>${q.prog}/${q.target}</span>
        </div>
        <div class="q-reward">보상: ${rStr}</div>
        ${!q.claimed?`<button class="q-claim-btn" onclick="claimQuest('${q.id}')" ${!done?'disabled':''}>${done?'🎁 보상 받기':'진행 중...'}</button>`
        :'<div style="font-size:.76rem;color:var(--moss);margin-top:6px;text-align:center">✅ 완료됨</div>'}
      </div>`;
    list.appendChild(card);
  });

  // 도제가 아무도 없으면 안내 메시지
  if(G.unlockedApps.length===0){
    const msg=document.createElement('div');
    msg.style.cssText='text-align:center;padding:20px;font-size:.85rem;color:var(--ink2);font-style:italic';
    msg.innerHTML='명성을 쌓으면 도제가 찾아옵니다!<br><br>🌿 물약 납품 → 명성 획득 → 도제 합류';
    list.appendChild(msg);
  }
}

// ══════════════════════════════════════
//  APPRENTICES
// ══════════════════════════════════════
function addAppXP(n){
  Object.keys(APP_BASE).forEach(id=>{if(!G.appMission[id]){G.appXP[id]+=n;checkAppLevelUp(id);}});
}
function checkAppLevelUp(id){
  const xpNext=20*Math.pow(1.5,G.appLv[id]-1);
  if(G.appXP[id]>=xpNext&&G.appLv[id]<10){
    G.appXP[id]-=xpNext;G.appLv[id]++;
    Object.keys(APP_BASE[id].stats).forEach(k=>APP_BASE[id].stats[k]=Math.min(100,APP_BASE[id].stats[k]+8));
    log(`🌟 ${APP_BASE[id].name} Lv.${G.appLv[id]} 성장!`);
    log(`[레벨업] ${APP_BASE[id].name} Lv.${G.appLv[id]}!`);
  }
}

function sendMission(appId,mId){
  if(!G.unlockedApps||!G.unlockedApps.includes(appId)) return;
  const a=APP_BASE[appId];const m=MISSIONS.find(x=>x.id===mId);
  if(G.appMission[appId])return;
  G.appMission[appId]={item:m.item,missionEnd:G.day+m.days,label:m.label};
  const say=a.sayIdle[Math.floor(Math.random()*a.sayIdle.length)];
  log(`[임무] ${a.name}: "${say}" → ${m.label} (${m.days}일)`);
  spawnFloat(`${a.name} 출발!`);
  renderApprentices();checkQuestProgress();
}

function renderApprentices(){
  const list=document.getElementById('app-list');list.innerHTML='';
  if(!G.unlockedApps) G.unlockedApps=[];

  // 잠긴 도제 표시
  APP_UNLOCK_CONDITIONS.forEach(cond=>{
    if(!G.unlockedApps.includes(cond.id)){
      const repNeeded=cond.repNeeded;
      const rep=G.reputation||0;
      const pct=Math.min(100,Math.round(rep/repNeeded*100));
      const locked=document.createElement('div');
      locked.style.cssText='border-radius:10px;border:2px dashed var(--parch3);background:var(--parch2);margin-bottom:11px;padding:16px;text-align:center;opacity:.7';
      locked.innerHTML=`
        <div style="font-size:2rem;margin-bottom:6px;filter:grayscale(1)">🐱</div>
        <div style="font-family:Cinzel,serif;font-size:.85rem;color:var(--ink2);margin-bottom:4px">??? 미지의 도제</div>
        <div style="font-size:.75rem;color:var(--ink2);margin-bottom:8px">명성 ${repNeeded} 달성 시 합류</div>
        <div style="height:6px;background:var(--parch3);border-radius:3px;overflow:hidden;margin-bottom:4px">
          <div style="height:100%;width:${pct}%;background:var(--gold2);border-radius:3px;transition:width .5s"></div>
        </div>
        <div style="font-size:.7rem;color:var(--ink2)">${rep} / ${repNeeded} 명성</div>`;
      list.appendChild(locked);
    }
  });

  Object.values(APP_BASE).forEach(a=>{
    if(!G.unlockedApps.includes(a.id)) return; // 잠긴 도제 숨기기
    const lv=G.appLv[a.id];
    const xp=G.appXP[a.id];
    const xpNext=Math.round(20*Math.pow(1.5,lv-1));
    const xpPct=Math.min(100,Math.round(xp/xpNext*100));
    const mis=G.appMission[a.id];
    const missionArea=mis
      ?`<div style="text-align:center;font-size:.8rem;color:var(--moss);padding:6px 0">
          🏃 임무 중… ${iN(mis.item)} 채집 → Day ${mis.missionEnd} 귀환
        </div>`
      :`<div style="margin-top:8px;font-size:.72rem;color:var(--ink2);margin-bottom:5px">임무 보내기:</div>
        <div class="ap-action">
          ${MISSIONS.map(m=>`<button class="ap-btn primary" onclick="sendMission('${a.id}','${m.id}')">${iN(m.item)}</button>`).join('')}
        </div>`;
    const say=mis?'':`<div class="ap-msg">"${a.sayIdle[G.day%a.sayIdle.length]}"</div>`;
    const card=document.createElement('div');
    card.className='app-card';
    card.innerHTML=`
      <div class="ap-hdr">
        <span class="app-avatar">${a.avatar}</span>
        <div><div class="ap-name">${a.name}</div><div class="ap-title">${a.title}</div></div>
        <div class="ap-lv"><div class="lv-num">Lv.${lv}</div><div class="lv-label">레벨</div></div>
      </div>
      <div class="ap-body">
        <div class="ap-stat"><span class="as-label">채집력</span><div class="as-bar"><div class="as-fill fill-green" style="width:${a.stats.gather}%"></div></div><span class="as-val">${a.stats.gather}</span></div>
        <div class="ap-stat"><span class="as-label">행운</span><div class="as-bar"><div class="as-fill fill-blue" style="width:${a.stats.luck}%"></div></div><span class="as-val">${a.stats.luck}</span></div>
        <div class="ap-stat"><span class="as-label">연금술</span><div class="as-bar"><div class="as-fill fill-gold" style="width:${a.stats.craft}%"></div></div><span class="as-val">${a.stats.craft}</span></div>
        <div class="ap-skill"><p>🌟 <strong>특기:</strong> ${a.skill}</p></div>
        <div class="ap-xp">
          <div class="ap-xp-row"><span>경험치</span><span>${xp}/${xpNext}</span></div>
          <div class="ap-xp-bar"><div class="ap-xp-fill" style="width:${xpPct}%"></div></div>
        </div>
        ${say}${missionArea}
      </div>`;
    list.appendChild(card);
  });
}

// ══════════════════════════════════════
//  ENDINGS
// ══════════════════════════════════════
function checkEndings(){
  ENDINGS.forEach(e=>{
    if(!G.endings.includes(e.id)&&e.check()){
      G.endings.push(e.id);
      showEnding(e);
    }
  });
}
function showEnding(e){
  document.getElementById('ending-icon').textContent=e.icon;
  document.getElementById('ending-title').textContent='엔딩: '+e.title;
  document.getElementById('ending-desc').textContent=e.desc+'\n\n계속 플레이하거나 새 모험을 시작하세요!';
  document.getElementById('ending').classList.add('show');
}
function restartGame(){
  document.getElementById('ending').classList.remove('show');
}

// ── 성배 선택 오버레이 ──
function showGrailChoiceOverlay(){
  var overlay = document.getElementById('grail-choice-overlay');
  if(overlay){ overlay.style.display='flex'; }
}
function chooseGrailEnding(choice){
  var overlay = document.getElementById('grail-choice-overlay');
  if(overlay){ overlay.style.display='none'; }
  G.grailChoice = choice;
  checkEndings();
  updateUI();
  var msgs = {
    witch:'✨ 저주가 풀립니다... Baba는 마녀의 모습으로 돌아왔습니다.',
    cat:'🐱 Baba는 성배를 내려놓았습니다. 이 정원이 영원히 내 것이야.',
    shatter:'🔮 성배가 산산조각 납니다. 눈부신 빛과 함께 무언가가 바뀌었습니다...'
  };
  showResult(msgs[choice]||'');
}

// ══════════════════════════════════════
//  STATS PAGE
// ══════════════════════════════════════
function updateStatsPage(){
  var R=RACES[G.charType]||{name:'종족 미선택',icon:'🐱'};
  // 캐릭터 카드
  var iconEl=document.getElementById('stats-race-icon');
  var nameEl=document.getElementById('stats-char-name');
  var raceEl=document.getElementById('stats-char-race');
  // 칭호 표시
  var titleEl=document.getElementById('stats-char-title');
  if(titleEl&&typeof getCurrentTitle==='function'){
    var ct=getCurrentTitle();
    titleEl.textContent=ct.icon+' '+ct.title;
  }
  var condEl=document.getElementById('stats-char-condition');
  var medalEl=document.getElementById('stats-sky-medal');
  if(iconEl) iconEl.textContent=R.icon||'🐱';
  // 배너 캐릭터 아이콘 업데이트
  var hdrIcon = document.getElementById('hdr-char-icon');
  if(hdrIcon && G.charType) {
    var charImgs = {cat:'data:image/png;base64,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',dog:'data:image/png;base64,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',bunny:'data:image/png;base64,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'};
    if(charImgs[G.charType]) { hdrIcon.src=charImgs[G.charType]; hdrIcon.style.display='block'; }
  }
  if(nameEl) nameEl.textContent=G.charName||G.playerName||'약초사';
  if(raceEl) raceEl.textContent=R.name||'종족 미선택';
  // HP 상태 텍스트
  var hp=G.hp||0; var maxHp=G.maxHp||100;
  var hpPct=Math.round(hp/maxHp*100);
  if(condEl){
    if(hpPct>=80) condEl.textContent='Vitality 충만 😊';
    else if(hpPct>=50) condEl.textContent='Vitality 보통 😐';
    else if(hpPct>=30) condEl.textContent='Vitality 부족 😟';
    else condEl.textContent='Vitality 고갈 😵';
  }
  // HP 바
  var hpText=document.getElementById('stats-hp-text');
  var hpBar=document.getElementById('stats-hp-bar');
  if(hpText) hpText.textContent=hp+'/'+maxHp;
  if(hpBar){
    hpBar.style.width=hpPct+'%';
    hpBar.style.background=hpPct>60?'linear-gradient(90deg,#4aaa30,#80dd50)':hpPct>30?'linear-gradient(90deg,#aa8820,#ddcc40)':'linear-gradient(90deg,#aa2020,#ff5040)';
  }
  // 에너지 바
  var eText=document.getElementById('stats-energy-text');
  var eBar=document.getElementById('stats-energy-bar');
  var energy=G.energy||0; var maxE=G.maxEnergy||5;
  if(eText) eText.textContent=energy+'/'+maxE;
  if(eBar) eBar.style.width=Math.round(energy/maxE*100)+'%';
  // 메달
  if(medalEl) medalEl.style.display=(G.skyPass&&(G.skyPass.permanent||isSeasonPassValid()))?'inline':'none';
  renderCustomerHistory();
  updateReputation();
  const sb=document.getElementById('stat-block');
  const rows=[
    ['경과 일수',`${G.day}일`],
    ['현재 계절',`${getSeason().icon} ${getSeason().name}`],
    ['총 채집량',`${G.stats.totalGather||0}개`],
    ['희귀초 채집',`${G.stats.rarePicked}개`],
    ['총 제조',`${G.stats.totalCraft}회`],
    ['총 임무 완료',`${G.stats.missionsTotal}회`],
    ['퀘스트 완료',`${G.questsCompleted}개`],
    ['보유 코인',`<img src='${COIN_IMGS.bronze}' style='width:16px;height:16px;object-fit:contain;vertical-align:middle'>${G.coins.bronze} <img src='${COIN_IMGS.silver}' style='width:16px;height:16px;object-fit:contain;vertical-align:middle'>${G.coins.silver} <img src='${COIN_IMGS.golden}' style='width:16px;height:16px;object-fit:contain;vertical-align:middle'>${G.coins.golden}`],
    ['총 코인 환산',`🪙${totalCoins()}냥`],
    ['달성 엔딩',`${G.endings.length}/${ENDINGS.length}개`],
  ];
  sb.innerHTML=rows.map(([l,v])=>`<div class="stat-item"><span>${l}</span><span class="si-val">${v}</span></div>`).join('');
}

// ══════════════════════════════════════
//  SAVE / LOAD
// ══════════════════════════════════════

function loadGame(){
  const msgEl = document.getElementById('save-msg');
  if(window._fbUser && window._fbDb && window._fbFns){
    if(msgEl) msgEl.textContent = '☁️ 클라우드에서 불러오는 중...';
    const saveRef = window._fbFns.doc(window._fbDb, 'saves', window._fbUser.uid);
    window._fbFns.getDoc(saveRef).then(function(snap){
      if(snap.exists() && snap.data().gameState){
        try{
          G = JSON.parse(snap.data().gameState);
          patchState();
          if(msgEl) msgEl.textContent = '☁️ 클라우드 불러오기 완료!';
          refreshUIAfterLoad();
          return;
        }catch(e){ console.error(e); }
      }
      loadGameLocalFallback(msgEl);
    }).catch(function(){ loadGameLocalFallback(msgEl); });
  } else {
    loadGameLocalFallback(msgEl);
  }
}

function loadGameLocalFallback(msgEl){
  if(loadGameLocal()){
    if(msgEl) msgEl.textContent = '📂 로컬 불러오기 완료!';
    refreshUIAfterLoad();
  } else {
    if(msgEl) msgEl.textContent = '❌ 저장 파일이 없습니다.';
  }
}

function refreshUIAfterLoad(){
  buildLocScroll();
  setLocation(G.curLoc);
  rollWeather();
  renderQuests();
  renderApprentices();
  updateUI();
  updateShopUI();
  updateReputation();
  if(typeof updateStatsPage === 'function') updateStatsPage();
}
function resetGame(){
  if(!confirm('정말 초기화하시겠습니까?'))return;
  localStorage.removeItem('herbcat_save');
  G=freshState();G.quests=QUEST_DEFS.map(q=>({...q,prog:0,claimed:false}));
  Object.values(APP_BASE).forEach(a=>{a.stats={...APP_BASE[a.id].stats};});
  init();
  document.getElementById('save-msg').textContent='🌱 초기화 완료!';
}

// ══════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════
function iN(k){return IN[k]||k;}
function addHerb(k,n){
  G.herbs[k]=(G.herbs[k]||0)+n;
  G.stats.totalHerb=(G.stats.totalHerb||0)+n;
  if(G.herbCollected&&k in G.herbCollected){ G.herbCollected[k]=(G.herbCollected[k]||0)+n; checkHerbUnlock(); }
  // 한 번이라도 보유한 허브 기록 (야간허브 표시용)
  if(!G.herbMaxHeld) G.herbMaxHeld={};
  if(n>0) G.herbMaxHeld[k]=1;
}

function showResult(msg,warn=false){
  const el=document.getElementById('s-result');
  el.textContent=msg;
  el.style.borderLeftColor=warn?'#a84020':'var(--moss)';
  setTimeout(()=>el.style.borderLeftColor='var(--moss)',1500);
}
function log(msg){document.getElementById('log-strip').textContent=msg;}
function spawnFloat(text){
  const el=document.createElement('div');
  el.className='flt';el.textContent=text;
  el.style.left=(20+Math.random()*60)+'%';
  el.style.top=(30+Math.random()*30)+'%';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1400);
}
function updateUI(){

  document.getElementById('s-day').textContent=G.day;
  document.getElementById('s-energy').textContent=G.energy;
  document.getElementById('s-maxe').textContent=G.maxEnergy;
  // 치유 물약 보유량 표시 (G.potionInv.healing)
  var healingCount=(G.potionInv&&G.potionInv.healing)||0;
  document.getElementById('s-potion').textContent=healingCount;
  // 코인 이미지 + 숫자 업데이트
  const _bi=document.getElementById('coin-img-b');
  const _si=document.getElementById('coin-img-s');
  const _gi=document.getElementById('coin-img-g');
  if(_bi&&typeof COIN_IMGS!=='undefined'){_bi.src=COIN_IMGS.bronze;_si.src=COIN_IMGS.silver;_gi.src=COIN_IMGS.golden;}
  const _sb=document.getElementById('s-bronze');
  const _ss=document.getElementById('s-silver');
  const _sg=document.getElementById('s-golden');
  if(_sb)_sb.textContent=G.coins.bronze;
  if(_ss)_ss.textContent=G.coins.silver;
  if(_sg)_sg.textContent=G.coins.golden;
  // 야간 약초 인벤토리 표시 제어
  // 특수 약초 표시 제어 (야간 + 계절)
  const nightHerbKeys=['moonpetal','starweed','glowshroom','nightmoss','shadowleaf','lumiresin'];
  const seasonHerbKeys=['snowcrystal','sakuradew','sunbloom','crimsonleaf'];
  const specialHerbKeys=nightHerbKeys.concat(seasonHerbKeys);
  // 야간 허브: 한 번이라도 채집한 적 있으면(최대보유 기록) 항상 표시, 없으면 숨김
  nightHerbKeys.forEach(k=>{
    const cell=document.getElementById('inv-'+k);
    const everHad = (G.herbs[k]>0)||(G.herbMaxHeld&&G.herbMaxHeld[k]>0);
    if(cell) cell.style.display=everHad?'':'none';
  });
  Object.keys(G.herbs).forEach(k=>{const el=document.getElementById('i-'+k);if(el)el.textContent=G.herbs[k];});
  // craft
  const h=G.herbs;
  const can={
    healing:h.herb>=3,moon:h.lotus>=2&&h.moss>=1,forest:h.resin>=2&&h.shroom>=2,
    dream:h.herb>=2&&h.lotus>=1&&h.shroom>=1,
    legendary:h.rare>=1&&h.herb>=1&&h.lotus>=1&&h.shroom>=1&&h.moss>=1&&h.resin>=1, petal_brew: h.petal>=3&&h.herb>=1,honey_syrup: h.honey>=2&&h.petal>=1,
    moon_honey: h.honey>=2&&h.lotus>=1,
    golden_honey: h.honey>=3&&h.rare>=1,
  };
  Object.entries(can).forEach(([id,ok])=>{const el=document.getElementById('cr-'+id);if(el)el.classList.toggle('disabled',!ok);});
  // ── 성배 퀘스트 UI ──
  const grailSection=document.getElementById('grail-essence-section');
  if(grailSection) grailSection.style.display=(G.grailMemoRead?'':'none');
  const essenceKeys=['spring_essence','summer_essence','autumn_essence','winter_essence'];
  essenceKeys.forEach(k=>{
    const canMake={spring_essence:h.sakuradew>=5&&h.moonpetal>=3,summer_essence:h.sunbloom>=5&&h.glowshroom>=3,autumn_essence:h.crimsonleaf>=5&&h.shadowleaf>=3,winter_essence:h.snowcrystal>=5&&h.starweed>=3};
    const el=document.getElementById('cr-'+k); if(el) el.classList.toggle('disabled',!canMake[k]);
    const st=document.getElementById('cr-'+k+'-status');
    if(st){ if((h[k]||0)>=1){st.textContent='✅ 완성';st.style.color='#80e050';}else{st.textContent='미제조';st.style.color='#a0c080';} }
    const cell=document.getElementById('inv-'+k);
    if(cell) cell.style.display=((h[k]||0)>0)?'':'none';
  });
  // 물약 인벤토리 표시
  if(G.potionInv){
    const pkeys=['healing','moon','forest','dream','legendary','petal_brew','honey_syrup','moon_honey','golden_honey'];
    pkeys.forEach(k=>{ const el=document.getElementById('pi-'+k); if(el) el.textContent=G.potionInv[k]||0; });
    const tot=document.getElementById('pi-total');
    if(tot) tot.textContent=pkeys.reduce((a,k)=>a+(G.potionInv[k]||0),0);
  }
  renderCustomerBanner();
  // adv craft buttons
  if(G.refined){
    Object.entries(ADV_RECIPES_ISLAND).forEach(([id,R])=>{
      const el=document.getElementById('adv-'+id);
      if(el){ const ok=Object.entries(R.need).every(([k,v])=>(G.refined[k]||0)>=v); el.classList.toggle('disabled',!ok); }
    });
  }
}

// Track which herbs are unlocked
function getHerbUnlocked(h){
  const collected = G.stats['collected_'+h.reqItem] || G.qt['herb_total'] || 0;
  // use per-item tracking
  const amt = G.herbCollected ? (G.herbCollected[h.reqItem]||0) : 0;
  return amt >= h.reqAmt;
}

function renderHerbarium(){
  const HERB_IMG = {herb:'fuzzthistle',lotus:'lunarlurelilynight',shroom:'windershroom',moss:'steamventmoss',resin:'wailingvine',rare:'clockworkdaisy',bramble:'magneticbramble',lubelily:'lubricantlily',rustcap:'rust_cap',voltcreep:'voltcreeper'};
  const grid = document.getElementById('herb-grid');
  if(!grid) return;
  grid.innerHTML = '';
  let unlocked = 0;
  HERBARIUM.forEach(h => {
    const isUnlocked = getHerbUnlocked(h);
    if(isUnlocked) unlocked++;
    const card = document.createElement('div');
    card.className = 'herb-card' + (isUnlocked ? '' : ' locked');
    card.innerHTML = isUnlocked ? `
      <div class="herb-card-header" onclick="toggleHerbCard('hcb-${h.id}')">
        <img class="hc-icon" src="guidebook/${HERB_IMG[h.id] || h.id}.png"
          onerror="this.style.display='none'"
          style="width:2.2rem;height:2.2rem;object-fit:contain;flex-shrink:0;"/>
        <div class="hc-main">
          <div class="hc-name">${h.name} <span style="font-size:.7rem;color:var(--ink2)">(${h.engName})</span></div>
          <div class="hc-latin">${h.latin}</div>
        </div>
        <span class="hc-unlock">▼ 보기</span>
      </div>
      <div class="herb-card-body" id="hcb-${h.id}">
        <div class="hcb-habitat">📍 ${h.habitat}</div>
        <div class="hcb-effect">💊 <b>효능:</b> ${h.effect}</div>
        <div class="hcb-note">
          <div class="hcb-note-inner">📝 <b>바바의 연구 노트:</b><br>${h.note}</div>
        </div>
        <div class="hcb-game-effect">🎮 게임 효과: ${h.gameEffect}</div>
      </div>
    ` : `
      <div class="herb-card-header">
        <span class="hc-icon" style="filter:grayscale(1)">🌿</span>
        <div class="hc-main">
          <div class="hc-name" style="color:var(--ink2)">??? 미발견</div>
          <div class="hc-latin">${h.reqItem==='rare'?'희귀초':iN(h.reqItem)} ${h.reqAmt}개 채집 시 해금</div>
        </div>
        <span class="hc-lock">🔒 ${(G.herbCollected?G.herbCollected[h.reqItem]||0:0)}/${h.reqAmt}</span>
      </div>
    `;
    grid.appendChild(card);
  });
  const pct = Math.round(unlocked/HERBARIUM.length*100);
  const fill = document.getElementById('herb-prog-fill');
  const label = document.getElementById('herb-prog-label');
  if(fill) fill.style.width = pct+'%';
  if(label) label.textContent = unlocked+' / '+HERBARIUM.length+' 해금';
  const tb = document.getElementById('tb-herb');
  if(tb){ tb.textContent=unlocked>0?unlocked:''; tb.parentElement.classList.toggle('has-badge',unlocked>0); }
}

function toggleHerbCard(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle('open');
  // update arrow
  const arrow = el.previousElementSibling.querySelector('.hc-unlock');
  if(arrow) arrow.textContent = el.classList.contains('open') ? '▲ 닫기' : '▼ 보기';
}

function checkHerbUnlock(){
  if(!G.herbCollected) return;
  const prev = G.herbUnlockCount || 0;
  let cur = HERBARIUM.filter(h=>getHerbUnlocked(h)).length;
  if(cur > prev){
    G.herbUnlockCount = cur;
    const newH = HERBARIUM.find(h=>getHerbUnlocked(h) && (G.herbUnlockCount===1||true));
    spawnFloat('📖 도감 해금!');
    log('[도감] 새 약초 페이지가 해금됐습니다!');
    document.getElementById('tb-herb').textContent='!';
    document.getElementById('tb-herb').parentElement.classList.add('has-badge');
  }
}

var POTION_NAMES = {
  healing:'치유 물약', moon:'달빛 물약', forest:'숲의 정수',
  dream:'꿈의 물약', legendary:'전설의 영약'
};

function rollCustomer(){
  if(G.curCustomer) return; // 현재 손님 처리 중
  if(G.day < 2) return;     // Day 2부터 손님 등장
  if(Math.random() > 0.6) return; // 60% 확률로 등장

  const cust = CUSTOMERS[Math.floor(Math.random()*CUSTOMERS.length)];
  const order = cust.orders[Math.floor(Math.random()*cust.orders.length)];
  G.curCustomer = {
    custId: cust.id,
    orderId: Math.random().toString(36).slice(2),
    item: order.item,
    name: order.name,
    count: order.count,
    reward: order.reward,
    deadline: G.day + order.deadline,
    fulfilled: false,
  };
  renderCustomerBanner();
  log(`[손님] ${cust.name} 방문! ${order.name} ×${order.count} 주문`);
  spawnFloat(`${cust.avatar} 손님 방문!`);
}

function renderCustomerBanner(){
  const banner = document.getElementById('customer-banner');
  if(!banner) return;
  if(!G.curCustomer){ banner.style.display='none'; return; }

  const c = G.curCustomer;
  const cust = CUSTOMERS.find(x=>x.id===c.custId);
  if(!cust){ banner.style.display='none'; return; }

  const say = cust.says[G.day % cust.says.length];
  const remain = c.deadline - G.day;
  const deadlineOk = remain > 0;
  const rewardStr = Object.entries(c.reward)
    .filter(([k])=>k!=='herb')
    .map(([k,v])=>`${k==='bronze'?'🪙':k==='silver'?'🔘':'⭐'}${v}`).join(' ');

  if(!G.potionInv) G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  const potionHave = G.potionInv[c.item]||0;
  const canFulfill = potionHave >= c.count;

  banner.style.display='block';
  banner.innerHTML=`
    <div class="cb-header">
      <span class="cb-avatar">${cust.avatar}</span>
      <div>
        <div class="cb-name">${cust.name}</div>
        <div class="cb-title">${cust.title}</div>
      </div>
    </div>
    <div class="cb-body">
      <div class="cb-request">${say}</div>
      <div class="cb-order">
        <span class="co-icon">${getRecipeIcon(c.item)}</span>
        <div class="co-info"><b>${c.name}</b> ×${c.count}</div>
        <span class="co-reward">${rewardStr}</span>
      </div>
      <div class="cb-deadline ${deadlineOk?'ok':''}">
        ⏰ ${deadlineOk ? `마감까지 ${remain}일` : '⚠️ 오늘이 마지막!'}
      </div>
      <button class="cb-fulfill-btn" onclick="fulfillOrder()"
        ${canFulfill?'':'disabled'}>
        ${canFulfill
          ? '🌿 납품하기 (' + getRecipeIcon(c.item) + ' 보유 ' + potionHave + '개)'
          : getRecipeIcon(c.item) + ' ' + c.name + ' ' + c.count + '개 필요 (보유 ' + potionHave + '개)'}
      </button>
    </div>`;
}

function fulfillOrder(){
  if(!G.curCustomer) return;
  const c = G.curCustomer;
  if(!G.potionInv) G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  // 물약 인벤토리에서 차감
  if((G.potionInv[c.item]||0) < c.count){
    showResult('❌ ' + c.name + ' ' + c.count + '개 필요! (보유: ' + (G.potionInv[c.item]||0) + '개)', true);
    return;
  }
  G.potionInv[c.item] -= c.count;

  // 보상 지급
  const cust = CUSTOMERS.find(x=>x.id===c.custId);
  Object.entries(c.reward).forEach(([k,v])=>{
    if(k==='herb') Object.entries(v).forEach(([hk,hv])=>addHerb(hk,hv));
    else addCoins(k,v);
  });

  // 명성 상승
  G.reputation = (G.reputation||0) + getRepGain(c.item);

  // 특별 보상 (30% 확률)
  let bonusMsg = '';
  if(Math.random()<0.3 && cust.specialReward){
    const sr = cust.specialReward;
    if(sr.bronze) addCoins('bronze', sr.bronze);
    if(sr.silver) addCoins('silver', sr.silver);
    if(sr.golden) addCoins('golden', sr.golden);
    if(sr.herb) Object.entries(sr.herb).forEach(([k,v])=>addHerb(k,v));
    bonusMsg = ` + 특별 보상! "${sr.msg}"`;
  }

  const nyVal = (c.reward.bronze||0)+(c.reward.silver||0)*10+(c.reward.golden||0)*100;
  showResult(`✅ ${cust.name} 납품 완료! +${nyVal}₦${bonusMsg}`);
  spawnFloat(`+${nyVal}₦ 납품!`);
  log(`[손님] ${cust.name} 납품 완료 → +${nyVal}₦ | 명성 +${getRepGain(c.item)}`);

  // 히스토리 추가
  if(!G.customerHistory) G.customerHistory=[];
  G.customerHistory.unshift({
    avatar:cust.avatar, name:cust.name,
    item:c.name, day:G.day, reward:nyVal,
  });
  if(G.customerHistory.length>10) G.customerHistory.pop();

  G.curCustomer = null;
  renderCustomerBanner();
  updateUI();
  updateReputation();
}

function checkCustomerDeadline(){
  if(!G.curCustomer) return;
  if(G.day > G.curCustomer.deadline){
    const cust = CUSTOMERS.find(x=>x.id===G.curCustomer.custId);
    const name = cust ? cust.name : '손님';
    log(`[손님] ${name} 마감 초과! 손님이 돌아갔습니다.`);
    showResult(`😿 ${name}이(가) 기다리다 돌아갔습니다...`);
    spawnFloat('😿 손님 떠남');
    G.reputation = Math.max(0, (G.reputation||0)-2);
    G.curCustomer = null;
    renderCustomerBanner();
    updateReputation();
  }
}

function getRepGain(item){
  return {healing:1, moon:2, forest:2, dream:3, legendary:5}[item]||1;
}
function getRecipeIcon(item){
  return {healing:'🧪', moon:'🌙', forest:'🌲', dream:'🌺', legendary:'⭐'}[item]||'🌿';
}

function updateReputation(){
  checkAppUnlock();
  const rep = G.reputation||0;
  const lv = rep<5?1:rep<15?2:rep<30?3:rep<50?4:5;
  const repIcons = ['','🌿','⭐','🏅','👑','🌟'];
  const repTitles = ['','동네 약초사','공인 약초사','명망 있는 약초사','Aethel Cataria의 전설','왕실 납품 약초사'];
  // 명성 표시 업데이트
  const repDisplay = document.getElementById('rep-display');
  if(repDisplay) repDisplay.innerHTML = `${repIcons[lv]} ${rep}명성`;
  // 칭호 뱃지 - PLAYER_TITLES 기반으로 표시
  const titleBadge = document.getElementById('player-title-badge');
  if(titleBadge) {
    if(typeof getCurrentTitle === 'function') {
      const ct = getCurrentTitle();
      titleBadge.innerHTML = `${ct.icon} ${ct.title}`;
    } else {
      // fallback: 명성 기반 칭호
      titleBadge.innerHTML = `${repIcons[lv]} ${repTitles[lv]}`;
    }
    titleBadge.style.display = 'inline';
  }
  // 명성 레벨업 알림
  const prevLv = G.repLv||1;
  if(lv>prevLv){
    G.repLv=lv;
    spawnFloat(`${repIcons[lv]} ${repTitles[lv]} 달성!`);
    log(`[명성] ${repTitles[lv]} 달성!`);
    showResult(`🎉 명성 레벨 업! ${repIcons[lv]} ${repTitles[lv]}`);
  }
}

// 기록 탭에 손님 히스토리 추가
function renderCustomerHistory(){
  const container = document.getElementById('customer-history-block');
  if(!container) return;
  const history = G.customerHistory||[];
  if(history.length===0){
    container.innerHTML='<div style="font-size:.78rem;color:var(--ink2);text-align:center;padding:8px">아직 손님이 없습니다.</div>';
    return;
  }
  container.innerHTML = history.map(h=>`
    <div class="ch-row">
      <span class="ch-icon">${h.avatar}</span>
      <span style="flex:1">${h.name}</span>
      <span style="color:var(--ink2);font-size:.72rem">${h.item}</span>
      <span style="color:var(--gold);font-size:.75rem">+${h.reward}₦</span>
      <span style="color:var(--ink2);font-size:.68rem">Day${h.day}</span>
    </div>`).join('');
}

// ══════════════════════════════════════
