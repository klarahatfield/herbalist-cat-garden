// ╔══════════════════════════════════════════════════════╗
// ║  game-engine.js                                       ║
// ║  약초사의 비밀정원 — 핵심 게임 엔진                           ║
// ║                                                      ║
// ║  포함: init, buildLocScroll, switchTab, getSeason, rollWeather, advanceSeason,
// ╚══════════════════════════════════════════════════════╝

// ══════════════════════════════════════
function init(){
  if(!G.quests) G.quests=QUEST_DEFS.map(q=>({...q,prog:0,claimed:false}));
  buildLocScroll();
  setLocation(G.startLoc||'bloom');
  if(typeof enableHorizontalScroll==='function') enableHorizontalScroll('#loc-scroll');
  rollWeather();
  renderCustomerBanner();
  updateReputation();
  renderQuests();
  renderApprentices();
  updateUI();
  updateShopUI();
  updateStatsPage();
}

function buildLocScroll(){
  const w=document.getElementById('loc-scroll');w.innerHTML='';
  LOC_ORDER.forEach(key=>{
    const L=LOCS[key];
    const unlocked=isLocUnlocked(key);
    const unlockDay=getLocUnlockDay(key);
    const pill=document.createElement('div');
    pill.dataset.loc=key;
    if(!unlocked){
      pill.className='loc-pill locked';
      const lockImg = (typeof LOC_PILL_IMGS!=='undefined' && LOC_PILL_IMGS[key]) ? LOC_PILL_IMGS[key] : '';
      pill.innerHTML = `${lockImg?`<div class="lp-bg" style="background-image:url(${lockImg})"></div>`:''}`
        + `<div class="lp-lock"><span>🔒</span><span>Day ${unlockDay}</span></div>
`
        + `<span class="lp-name">Day ${unlockDay}</span>`;
      pill.onclick=()=>showResult(`🔒 Day ${unlockDay}에 해금됩니다!`,true);
    } else {
      pill.className='loc-pill'+(key===G.curLoc?' active':'');
      const shortNames={bloom:'꽃밭',pond:'연꽃못',forest:'퍼숲',hills:'이끼언덕',
        mushroom:'버섯밭',whisker:'희귀정원',lookout:'전망대',cottage:'오두막'};
      // 낮/밤 이미지 선택
      const isNightMode = G.isNight || false;
      const nightImgs = (typeof LOC_PILL_IMGS_NIGHT!=='undefined') ? LOC_PILL_IMGS_NIGHT : {};
      const dayImgs = (typeof LOC_PILL_IMGS!=='undefined') ? LOC_PILL_IMGS : {};
      const pillImg = (isNightMode && nightImgs[key]) ? nightImgs[key] : (dayImgs[key] || '');
      pill.innerHTML = pillImg
        ? `<div class="lp-bg" style="background-image:url(${pillImg})"></div><span class="lp-name">${shortNames[key]||key}</span>`
        : `<span class="lp-name">${shortNames[key]||key}</span>`;
      pill.onclick=()=>setLocation(key);
    }
    w.appendChild(pill);
  });
}

// ══════════════════════════════════════
//  TABS
// ══════════════════════════════════════
function switchTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='pg-'+id));
  if(id==='shop'){updateShopUI();}
  if(id==='mine'){renderMinePage();}
  if(id==='contact'){renderContact();}
  if(id==='house'){renderHouseTab();}
  if(id==='notice'){renderNotices();}
  if(id==='achievements'){renderAchievements();}
  if(id==='herb'){renderHerbarium();renderMineCodex();}
  if(id==='quest'){renderQuests();}
  if(id==='apprentice'){renderApprentices();}
  if(id==='stats'){updateStatsPage();}
  if(id==='craft'){initSecretCombo();}
}

// ══════════════════════════════════════
//  SEASON & WEATHER
// ══════════════════════════════════════
function getSeason(){return SEASONS[G.season%4];}
function rollWeather(){
  const S=getSeason();
  const pool=S.weather;
  G.weather=pool[Math.floor(Math.random()*pool.length)];
  const W=WEATHERS[G.weather];
  G.weatherMod=W.mod;
  document.getElementById('weather-icon').textContent=W.icon;
  document.getElementById('weather-desc').textContent=W.desc;
  document.getElementById('weather-chip').innerHTML=W.icon+' '+W.label;
  // season badge
  const S2=getSeason();
  document.getElementById('season-chip').textContent=S2.icon+' '+S2.name;
  document.body.className=S2.cls;
}

function advanceSeason(){
  const oldS=G.season;
  if(G.day%7===0){
    G.season=(G.season+1)%4;
    if(G.season!==oldS%4){
      const S=getSeason();
      showResult(`${S.icon} 계절이 ${S.name}(으)로 바뀌었습니다!`);
      spawnFloat(S.icon+' '+S.name+'!');
    }
  }
}

// ══════════════════════════════════════
//  LOCATION
// ══════════════════════════════════════
function setLocation(key){
  G.curLoc=key;
  document.querySelectorAll('.loc-pill').forEach(p=>p.classList.toggle('active',p.dataset.loc===key));
  const L=LOCS[key];
  document.getElementById('scene-box').className=L.theme;
  document.getElementById('s-bg').textContent=L.bg;
  document.getElementById('s-name').textContent=L.n;
  document.getElementById('s-desc').textContent=L.desc;
  document.getElementById('sp-label').textContent=L.sName;
  // Aero-Mortar 버튼 표시/숨김
  const aBtn=document.getElementById('btn-aero');
  if(aBtn){
    aBtn.style.display='none'; // 야외에서는 숨김
  }
  // Update gather button to show what item this location yields
  const ITEM_ICONS={herb:'🌿',lotus:'🪷',shroom:'🍄',moss:'🪨',resin:'🌳',rare:'💎'};
  const ITEM_LABELS={herb:'약초',lotus:'수초',shroom:'버섯',moss:'이끼',resin:'수지',rare:'희귀초'};
  const gi=document.getElementById('gather-icon');
  const gl=document.getElementById('gather-label');
  const isNightNow2 = G.isNight||false;
  const nightIcons={moonpetal:'🌙',starweed:'⭐',glowshroom:'💡',nightmoss:'🌿',shadowleaf:'🍃',lumiresin:'✨'};
  const nightLabels={moonpetal:'달빛꽃잎',starweed:'별빛풀',glowshroom:'발광버섯',nightmoss:'야광이끼',shadowleaf:'그림자잎',lumiresin:'빛수지'};
  if(isNightNow2 && L.nItem){
    if(gi) gi.textContent=nightIcons[L.nItem]||'🌙';
    if(gl) gl.textContent=(nightLabels[L.nItem]||'야간채집')+' 채집';
  } else {
    if(gi&&L.item) gi.textContent=ITEM_ICONS[L.item]||'🌿';
    if(gl&&L.item) gl.textContent=(ITEM_LABELS[L.item]||'채집')+' 채집';
  }
  const isCottage=key==='cottage';
  const actionsEl=document.getElementById('actions');
  const btnGather=document.getElementById('btn-gather');
  const btnSearch=document.getElementById('btn-search');
  const btnSpecial=document.getElementById('btn-special');
  const btnRest=document.getElementById('btn-rest');
  if(isCottage){
    // 오두막: 채집/탐색/특수 숨기고 하루마감만 크게
    if(actionsEl) actionsEl.classList.add('cottage-mode');
    if(btnGather) btnGather.style.display='none';
    if(btnSearch) btnSearch.style.display='none';
    if(btnSpecial) btnSpecial.style.display='none';
    const btnTonight=document.getElementById('btn-tonight');
    const btnNap=document.getElementById('btn-nap');
    const napCostLabel=document.getElementById('nap-cost-label');
    if(btnTonight){
      btnTonight.style.display=G.isNight?'none':'';
      btnTonight.classList.add('cottage-btn');
    }
    if(btnRest){
      btnRest.style.display=G.isNight?'':'none';
      btnRest.classList.add('cottage-btn');
    }
    if(btnNap){
      btnNap.style.display=G.isNight?'none':'';
      btnNap.classList.add('cottage-btn');
      const napN=G.napCount||0;
      const restore=napN===0?3:napN===1?2:1;
      if(napCostLabel) napCostLabel.textContent='Activity +'+(restore>0?restore:'없음(지침)');
    }
    // 수납장 버튼 추가
    renderCottageSResult();
    // 격납고 버튼: Day3 이후 + 원정 중 아닐 때
    const btnAeroCottage=document.getElementById('btn-aero-cottage');
    if(btnAeroCottage){
      const showAero=(G.day>=3&&!G.aeroMission);
      btnAeroCottage.style.display=showAero?'':'none';
      if(showAero) btnAeroCottage.style.gridColumn='1/-1';
    }
  } else {
    // 야외: 채집/탐색/특수 표시, 하루마감 숨김
    if(actionsEl) actionsEl.classList.remove('cottage-mode');
    if(btnGather){btnGather.style.display='';btnGather.disabled=false;}
    if(btnSearch){btnSearch.style.display='';btnSearch.disabled=false;}
    if(btnSpecial) btnSpecial.style.display='';
    const btnTonightOut=document.getElementById('btn-tonight');
    const btnNapOut=document.getElementById('btn-nap');
    if(btnTonightOut){btnTonightOut.style.display='none';btnTonightOut.classList.remove('cottage-btn');}
    if(btnNapOut){btnNapOut.style.display='none';btnNapOut.classList.remove('cottage-btn');}
    if(btnRest){btnRest.style.display='none';btnRest.classList.remove('cottage-btn');}
    // 야외: btn-aero-cottage 숨김 (오두막 전용)
    const btnAeroCottageOut=document.getElementById('btn-aero-cottage');
    if(btnAeroCottageOut) btnAeroCottageOut.style.display='none';
    // 야외: s-result 기본 텍스트 복구
    const sResultOut=document.getElementById('s-result');
    if(sResultOut && sResultOut.querySelector('button'))
      sResultOut.innerHTML='장소를 고르고 행동하세요 🐾';
  }
  // 수채화 배경 이미지 — 별도 div에 낮은 opacity로 적용
  const sceneBg = document.getElementById('scene-bg-img');
  if(sceneBg){
    const isNightNow = G.isNight || false;
    const nightSrc = (typeof LOC_PILL_IMGS_NIGHT!=='undefined') ? LOC_PILL_IMGS_NIGHT[key] : null;
    const daySrc = (typeof LOC_IMAGES!=='undefined') ? LOC_IMAGES[key] : null;
    const bgSrc = (isNightNow && nightSrc) ? nightSrc : daySrc;
    sceneBg.style.backgroundImage = bgSrc ? 'url(' + bgSrc + ')' : 'none';
  }
}

// ══════════════════════════════════════
//  GATHER CALC
// ══════════════════════════════════════
function calcGather(item,base){
  let n=base;
  // season bonus
  if(getSeason().bonus.includes(item)) n=Math.ceil(n*1.3);
  // weather
  const W=WEATHERS[G.weather];
  if(W.special&&W.special.includes(G.curLoc)&&(item==='lotus'||item==='moss')) n=Math.ceil(n*1.5);
  else n=Math.ceil(n*G.weatherMod);
  // apprentice specialty
  if(isSpecialty(item)) n=Math.ceil(n*1.5);
  return Math.max(1,n);
}

function isSpecialty(item){
  return Object.values(APP_BASE).some(a=>a.specialty.includes(item)&&!G.appMission[a.id]);
}

// ══════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════

// ══════════════════════════════════════
//  END DAY
// ══════════════════════════════════════
function endDay(){
  // 낮/밤: 밤 상태 유지 (새 날 시작 시 리셋)
  // HP 체크 - 너무 낮으면 경고만 (마감 자체는 항상 가능)
  if((G.hp||0) <= 0){
    // HP 0이어도 마감은 가능 - 경고만
    spawnFloat('💀 Vitality 고갈!');
  } else if((G.hp||0) < G.maxHp * 0.2){
    // 20% 미만 경고
    spawnFloat('⚠️ Vitality 위험!');
  }
  // 하루 마감 시 HP -10%
  const hpLoss = Math.ceil(G.maxHp * 0.1);
  G.hp = Math.max(0, (G.hp||G.maxHp) - hpLoss);
  updateHpBar();
  G.day++; G.energy=G.maxEnergy; G.stats.totalDays++;
  advanceSeason();
  rollWeather();
  // missions return
  let returned=[];
  Object.values(APP_BASE).forEach(a=>{
    const m=G.appMission[a.id];
    if(m&&G.day>=m.missionEnd){
      const spec=a.specialty.includes(m.item);
      const lvMul=1+(G.appLv[a.id]-1)*0.2;
      const raw=(Math.floor(Math.random()*3)+2)*lvMul*(spec?1.5:1);
      const n=Math.ceil(raw);
      addHerb(m.item,n);G.stats.totalHerb+=n;
      trackQT('mission_count',1);G.stats.missionsTotal++;
      if(m.item==='rare'){trackQT('rare_total',n);G.stats.rarePicked+=n;}
      const say=a.sayReturn[Math.floor(Math.random()*a.sayReturn.length)];
      returned.push(`${a.name}: "${say}" (${iN(m.item)} +${n})`);
      G.appXP[a.id]+=5;checkAppLevelUp(a.id);
      G.appMission[a.id]=null;
      spawnFloat(`${a.name} +${n} ${iN(m.item)}`);
    }
  });
  if(returned.length){
    document.getElementById('tb-app').textContent='!';
    document.getElementById('tb-app').parentElement.classList.add('has-badge');
    returned.forEach(r=>log(r));
  }
  // random event
  tryRollEvent();
  checkForgeComplete();
  checkIgnisUnlock();
  checkSkyTax();
  renderForgeQueue();
  checkAeroReturn();
  checkCustomerDeadline();
  rollCustomer();
  tryWalkEvent();
  updateReputation();
  trackQT('day_reach',G.day);
  // 새 날: 낮으로 전환
  G.isNight = false;
  G.napCount = 0; // 새 날: 낮잠 횟수 리셋
  buildLocScroll();
  setLocation(G.curLoc);
  // 오두막이면 버튼 상태 갱신
  if(G.curLoc==='cottage'){
    const btnTonED=document.getElementById('btn-tonight');
    const btnRestED=document.getElementById('btn-rest');
    if(btnTonED){btnTonED.style.display='';btnTonED.classList.add('cottage-btn');}
    if(btnRestED) btnRestED.style.display='none';
  }
  showResult(`☀️ Day ${G.day} 시작! Activity ${G.maxEnergy} 회복.`);
  spawnFloat('🌙 새 날!');
  log(`── Day ${G.day} ──`);
  checkQuestProgress();
  checkEndings();
  updateUI();
  renderApprentices();
}

// ══════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════
function tryRollEvent(){
  if(Math.random()<0.3){
    const ev=EVENTS[Math.floor(Math.random()*EVENTS.length)];
    G.curEvent=ev;
    const banner=document.getElementById('event-banner');
    if(ev.auto){
      ev.onAuto();
      banner.innerHTML=`${ev.icon} <b>${ev.title}</b><br>${ev.desc}`;
      banner.style.display='block';
      setTimeout(()=>{banner.style.display='none';},4000);
    } else {
      banner.innerHTML=`${ev.icon} <b>${ev.title}</b><br>${ev.desc}<br><button onclick="triggerEventBtn()" style="margin-top:6px;padding:5px 14px;border-radius:6px;border:1px solid var(--gold);background:rgba(184,137,26,.15);font-family:'Nanum Myeongjo',serif;font-size:.82rem;cursor:pointer">${ev.btn}</button>`;
      banner.style.display='block';
    }
  }
}
function hideEvent(){document.getElementById('event-banner').style.display='none';G.curEvent=null;}
function triggerEventBtn(){if(G.curEvent&&G.curEvent.onBtn)G.curEvent.onBtn();}

// ══════════════════════════════════════
//  CRAFT
// ══════════════════════════════════════
const RECIPES={
  healing:{name:'치유 물약', need:{herb:3},          reward:{bronze:5}},
  moon:   {name:'달빛 물약', need:{lotus:2,moss:1},   reward:{silver:1}},
  forest: {name:'숲의 정수', need:{resin:2,shroom:2}, reward:{silver:1,bronze:2}},
  dream:  {name:'꿈의 물약', need:{herb:2,lotus:1,shroom:1},reward:{silver:1,bronze:5}},
  legendary:{name:'전설의 영약',need:{rare:1,herb:1,lotus:1,shroom:1,moss:1,resin:1},reward:{golden:1}},
  spring_essence:{name:'🌸 봄의 정수', need:{sakuradew:5,moonpetal:3}, reward:{bronze:3}, isEssence:true},
  summer_essence:{name:'☀️ 여름의 정수', need:{sunbloom:5,glowshroom:3}, reward:{bronze:3}, isEssence:true},
  autumn_essence:{name:'🍂 가을의 정수', need:{crimsonleaf:5,shadowleaf:3}, reward:{bronze:3}, isEssence:true},
  winter_essence:{name:'❄️ 겨울의 정수', need:{snowcrystal:5,starweed:3}, reward:{bronze:3}, isEssence:true},
};

function craft(id){
  const R=RECIPES[id];
  for(const[k,v]of Object.entries(R.need)){
    if(G.herbs[k]<v){showResult('❌ 재료 부족!',true);return;}
  }
  for(const[k,v]of Object.entries(R.need)) G.herbs[k]-=v;
  // 정수 레시피: G.herbs에 결과물 추가
  if(R.isEssence){
    G.herbs[id]=(G.herbs[id]||0)+1;
    // 퀘스트 진행도 갱신
    if(G.grailQuestStage===1||G.grailQuestStage===2) G.grailQuestStage=2;
    const allFour=['spring_essence','summer_essence','autumn_essence','winter_essence'];
    if(allFour.every(k=>(G.herbs[k]||0)>=1)) G.grailQuestStage=3;
    spawnFloat(`✨ ${R.name} 완성!`);
    showResult(`✨ ${R.name} 완성! 성배 재료가 모이고 있습니다.`);
    log(`${R.name} 제조 완료`);
    const el=document.getElementById('cr-'+id);
    if(el){el.classList.add('crafting');setTimeout(()=>el.classList.remove('crafting'),500);}
    checkQuestProgress();checkEndings();updateUI();
    return;
  }
  // coins
  Object.entries(R.reward).forEach(([k,v])=>addCoins(k,v));
  G.potions++;G.stats.totalCraft++;checkTitleUpgrade();
  if(!G.potionInv) G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  G.potionInv[id]=(G.potionInv[id]||0)+1;
  if(id==='moon') trackQT('craft_moon',1);
  if(id==='legendary'){trackQT('craft_legendary',1);}
  const totalB=Object.entries(R.reward).map(([k,v])=>`${k==='bronze'?'🪙':k==='silver'?'🔘':'⭐'}+${v}`).join(' ');
  const craftNyang = (R.reward.bronze||0)+(R.reward.silver||0)*10+(R.reward.golden||0)*100;
  showResult(`🧪 ${R.name} 완성! +${craftNyang}₦`);
  spawnFloat(`+${craftNyang}₦`);
  log(`${R.name} 제조 완료`);
  // anim
  const el=document.getElementById('cr-'+id);
  if(el){el.classList.add('crafting');setTimeout(()=>el.classList.remove('crafting'),500);}
  addAppXP(4);
  checkQuestProgress();checkEndings();updateUI();
}

// ══════════════════════════════════════
//  COINS
// ══════════════════════════════════════
function addCoins(type,n){G.coins[type]=(G.coins[type]||0)+n;}
// ── 코인 이미지 데이터 ──
const COIN_IMGS = {
  bronze: 'data:image/png;base64,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',
  silver: 'data:image/png;base64,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',
  golden: 'data:image/png;base64,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',
};


// ── 수납장 시스템 ──
const CABINET_DRAWERS = [
  {
    id: "drawer_bloom",
    icon: "🌸", name: "드리밍 블룸 서랍",
    locked: false,
    note: "드리밍 블룸 추출물 — 극도의 주의 필요. 뚜껑을 여는 순간 향기가 퍼져 15분 낮잠에 빠져들었다. 다음엔 방독면을 쓸 것. — B",
    effect: function(){
      if(G.isNight){ showResult("밤엔 이미 졸립습니다...", true); return; }
      var restore = 2;
      G.energy = Math.min(G.maxEnergy, (G.energy||0)+restore);
      G.napCount = (G.napCount||0)+1;
      showResult("😴 드리밍 블룸 향기에 잠들었다... Activity +" + restore + " 회복!");
      spawnFloat("😴 블룸 향기!");
      updateUI();
    },
    effectLabel: "😴 향기 맡기 (낮잠 효과)"
  },
  {
    id: "drawer_recipe",
    icon: "📜", name: "고양이 행복 팅크처 레시피",
    locked: false,
    note: "고양이 행복 팅크처 제조법 (3년째 도제가 까먹어서 다시 기록함):\n1. 달빛 에센스 정확히 2방울\n2. 저울이 안정될 때까지 기다리기\n3. 앞발로 세 번 토닥토닥\n4. 큰 숟갈로 한 번 젓기\n결과: 성공하면 기분 좋은 가르릉 소리가 납니다. — B",
    effect: null,
    effectLabel: null
  },
  {
    id: "drawer_vault",
    icon: "🔒", name: "도제의 비밀 금고",
    locked: function(){ return (G.stats.totalGather||0) < 30; },
    lockHint: "채집 30회 후 해금",
    note: "THE SECRET VAULT — 도제가 몰래 모아둔 것들. 희귀초 3개, 구겨진 메모지, 그리고... 내 모자? — B\n(금고 안에서 희귀초 2개를 발견했습니다!)",
    effect: function(){
      addHerb("rare", 2);
      showResult("🔒 도제의 금고에서 희귀초×2 발견!");
      spawnFloat("💎 희귀초×2!");
      G.cabinetVaultOpened = true;
      updateUI();
    },
    effectLabel: "🔍 금고 열기 (희귀초×2)",
    oneTime: true,
    openedKey: "cabinetVaultOpened"
  },
  {
    id: "drawer_jar",
    icon: "🫙", name: "파란 항아리 아래",
    locked: function(){ return G.day < 10; },
    lockHint: "Day 10 이후 발견 가능",
    note: "보안 메모: 열쇠는 파란 항아리 아래에 있소. 절대 잊지 말게! (참고: 파란 항아리는 준비대 맨 오른쪽) — B\n항아리 아래에서 낡은 열쇠를 발견했습니다. 어딘가에 쓸 수 있을 것 같습니다...",
    effect: function(){
      G.hasSecretKey = true;
      showResult("🗝️ 파란 항아리 아래서 낡은 열쇠를 발견했습니다!");
      spawnFloat("🗝️ 열쇠 발견!");
      log("[수납장] 비밀 열쇠 발견");
      updateUI();
    },
    effectLabel: "🗝️ 항아리 들어보기",
    oneTime: true,
    openedKey: "hasSecretKey"
  },
  {
    id: "drawer_mushroom",
    icon: "🍄", name: "테일왁 버섯 서랍",
    locked: false,
    note: "중요: 특수 3단 채취 기법 — 버섯 포자 관리에 필수. 나비를 피하기 위해 새벽에 채취할 것. (나비가 포자를 흩어놓음) — B",
    effect: function(){
      addHerb("shroom", 2);
      showResult("🍄 버섯 채취 기법을 배웠습니다! 버섯×2 획득!");
      spawnFloat("🍄 ×2!");
      updateUI();
    },
    effectLabel: "🍄 버섯 포자 채취 (버섯×2)"
  },
  {
    id: "drawer_velvet",
    icon: "🪨", name: "벨벳 모스 힐스 메모",
    locked: false,
    note: "벨벳 모스 힐스 현장 노트: 새들을 유심히 볼 것. (내가 좋아하는 새가 있음) 이끼 채취 최적 시간: 이슬이 마르기 전 아침. — B",
    effect: function(){
      addHerb("moss", 3);
      showResult("🌿 이끼 채취 비법을 익혔습니다! 이끼×3 획득!");
      spawnFloat("🌿 ×3!");
      updateUI();
    },
    effectLabel: "🌿 이끼 채취 비법 (이끼×3)"
  },
  {
    id: "drawer_grail_memo",
    icon: "📜", name: "낡은 양피지 메모",
    locked: function(){ return G.day < 10 || G.grailMemoRead; },
    lockHint: "Day 10 이후 발견 가능",
    note: "시간별 성배는 4계절의 정수로 만들어진다.\n\n🌸 봄의 정수: 벚꽃이슬×5 + 달빛꽃잎×3\n☀️ 여름의 정수: 태양꽃×5 + 발광버섯×3\n🍂 가을의 정수: 단풍잎×5 + 그림자잎×3\n❄️ 겨울의 정수: 눈결정초×5 + 별빛풀×3\n\n4가지 정수를 연금술로 제조한 뒤, 이 수납장에서 성배를 조립하라.\n저주는 반드시 풀 수 있다. — B",
    effect: function(){
      G.grailMemoRead = true;
      G.grailQuestStage = Math.max(G.grailQuestStage, 1);
      G.grailMemoOpened = true;
      var section = document.getElementById('grail-essence-section');
      if(section) section.style.display = '';
      showResult("📜 낡은 양피지에서 비밀 레시피를 발견했습니다! 연금술 탭에서 4계절의 정수를 제조하세요!");
      spawnFloat("📜 비밀 레시피 발견!");
      log("[수납장] 성배 메모 발견 — 퀘스트 시작");
      checkQuestProgress(); checkEndings(); updateUI();
    },
    effectLabel: "📜 메모 확인하기",
    oneTime: false,
    openedKey: "grailMemoRead"
  },
  {
    id: "drawer_grail_assemble",
    icon: "🔮", name: "시간별 성배 — 조립대",
    locked: function(){ return G.grailQuestStage < 3; },
    lockHint: "4계절의 정수를 모두 제조해야 합니다",
    note: "4계절의 정수가 모두 준비되었습니다. 성배를 조립하면 저주를 풀 수 있는 힘을 얻게 됩니다. 하지만 선택은 당신의 몫입니다...",
    effect: function(){
      if((G.herbs.spring_essence||0)<1||(G.herbs.summer_essence||0)<1||(G.herbs.autumn_essence||0)<1||(G.herbs.winter_essence||0)<1){
        showResult("❌ 4계절의 정수가 모두 필요합니다!", true); return;
      }
      G.herbs.spring_essence--; G.herbs.summer_essence--;
      G.herbs.autumn_essence--; G.herbs.winter_essence--;
      G.grailQuestStage = 4;
      G.grailAssembled = true;
      closeCabinet();
      showGrailChoiceOverlay();
      log("[성배] 성배 조립 완료 — 엔딩 선택");
      updateUI();
    },
    effectLabel: "🔮 성배 조립하기",
    oneTime: false,
    openedKey: null
  },
];


function renderCottageSResult(){
  var sResult = document.getElementById('s-result');
  if(!sResult) return;
  var div = document.createElement('div');
  div.style.cssText = 'display:flex;flex-direction:column;gap:8px';
  var desc = document.createElement('div');
  desc.style.cssText = 'font-size:.82rem;color:#5a4a30';
  desc.textContent = '🏠 Baba의 아늑한 오두막. 뼈계단 위엔 다락방이 있습니다.';
  div.appendChild(desc);
  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;padding:10px;border-radius:9px;border:1.5px solid rgba(180,130,50,.4);background:rgba(180,130,50,.1);color:#c8a060;font-size:.85rem;cursor:pointer;text-align:left;';
  btn.textContent = '🗄️ 약초사 수납장 살펴보기';
  btn.onclick = openCabinet;
  div.appendChild(btn);
  sResult.innerHTML = '';
  sResult.appendChild(div);
}

function openCabinet(){
  const overlay = document.getElementById('cabinet-overlay');
  if(!overlay) return;
  // 서랍 목록 렌더링
  renderCabinetDrawers();
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCabinet(){
  const overlay = document.getElementById('cabinet-overlay');
  if(overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function renderCabinetDrawers(){
  var container = document.getElementById('cabinet-drawers');
  if(!container) return;
  container.innerHTML = '';
  CABINET_DRAWERS.forEach(function(d){
    var isLocked = typeof d.locked === 'function' ? d.locked() : d.locked;
    var isOpened = d.openedKey && G[d.openedKey];
    var card = document.createElement('div');
    card.style.border = '1px solid rgba(180,130,50,' + (isLocked ? '.15' : '.35') + ')';
    card.style.borderRadius = '10px';
    card.style.overflow = 'hidden';
    card.style.background = 'rgba(40,25,10,' + (isLocked ? '.3' : '.5') + ')';
    card.style.opacity = isLocked ? '0.5' : '1';
    card.style.marginBottom = '6px';
    // 헤더
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:' + (isLocked ? 'default' : 'pointer');
    // 아이콘
    var iconEl = document.createElement('span');
    iconEl.style.fontSize = '1.2rem';
    iconEl.textContent = d.icon;
    header.appendChild(iconEl);
    // 텍스트
    var textDiv = document.createElement('div');
    textDiv.style.flex = '1';
    var nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:.76rem;color:' + (isLocked ? '#7a6a50' : '#d4a830');
    nameEl.textContent = d.name;
    textDiv.appendChild(nameEl);
    if(isLocked && d.lockHint){
      var hintEl = document.createElement('div');
      hintEl.style.cssText = 'font-size:.62rem;color:#7a6a50';
      hintEl.textContent = '🔒 ' + d.lockHint;
      textDiv.appendChild(hintEl);
    }
    if(isOpened){
      var opEl = document.createElement('div');
      opEl.style.cssText = 'font-size:.62rem;color:#60a060';
      opEl.textContent = '✅ 이미 열었습니다';
      textDiv.appendChild(opEl);
    }
    header.appendChild(textDiv);
    // 화살표
    var arrow = document.createElement('span');
    arrow.id = 'arrow-' + d.id;
    arrow.style.cssText = 'font-size:.7rem;color:#9a7a50;transition:transform .2s';
    arrow.textContent = '▼';
    header.appendChild(arrow);
    // 바디
    var body = document.createElement('div');
    body.id = 'body-' + d.id;
    body.style.display = 'none';
    body.style.padding = '0 12px 12px';
    if(!isLocked){
      // 쪽지
      var note = document.createElement('div');
      note.style.cssText = 'font-size:.73rem;color:#c8b080;line-height:1.7;background:rgba(255,240,200,.06);border-radius:7px;padding:10px;margin-bottom:8px;font-style:italic;white-space:pre-line;border-left:3px solid rgba(180,130,50,.4)';
      note.textContent = d.note;
      body.appendChild(note);
      // 효과 버튼
      if(d.effect && !isOpened){
        var btn = document.createElement('button');
        btn.style.cssText = 'width:100%;padding:8px;border-radius:8px;border:1px solid rgba(180,130,50,.5);background:rgba(180,130,50,.15);color:#d4a830;font-size:.78rem;cursor:pointer';
        btn.textContent = d.effectLabel;
        (function(drawer){ btn.onclick = function(){ drawer.effect(); renderCabinetDrawers(); }; })(d);
        body.appendChild(btn);
      }
      // 토글
      (function(b, a){ header.onclick = function(){
        var open = b.style.display !== 'none';
        b.style.display = open ? 'none' : 'block';
        a.style.transform = open ? '' : 'rotate(180deg)';
      }; })(body, arrow);
    }
    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function totalCoins(){return G.coins.bronze+(G.coins.silver*10)+(G.coins.golden*100);}
function totalNyang(){return totalCoins();}

// 통합 코인 차감 헬퍼 함수 (잔돈 강제환전 없음)
function deductNyang(amount){
  if(totalNyang() < amount) return false;
  let cost = amount;

  // 1. 골든으로 지불 가능한 만큼 차감
  const goldToUse = Math.min(G.coins.golden, Math.floor(cost / 100));
  G.coins.golden -= goldToUse;
  cost -= goldToUse * 100;

  // 2. 실버로 지불 가능한 만큼 차감
  const silverToUse = Math.min(G.coins.silver, Math.floor(cost / 10));
  G.coins.silver -= silverToUse;
  cost -= silverToUse * 10;

  // 3. 브론즈로 지불, 부족하면 상위 코인을 깨서 충당
  while(G.coins.bronze < cost){
    if(G.coins.silver > 0){
      G.coins.silver -= 1;
      G.coins.bronze += 10;
    } else if(G.coins.golden > 0){
      G.coins.golden -= 1;
      G.coins.silver += 10;
    } else break;
  }
  G.coins.bronze -= cost;
  return true;
}

function exchange(dir){
  if(dir==='b2s'){
    if(G.coins.bronze<10){shopMsg('🪙 브론즈가 10개 이상 필요합니다!');return;}
    G.coins.bronze-=10;G.coins.silver++;
    shopMsg('✨ 10🪙 → 1🔘 환전! (가치 동일, 총 '+totalNyang()+'₦)');spawnFloat('환전완료');
  } else {
    if(G.coins.silver<10){shopMsg('🔘 실버가 10개 이상 필요합니다!');return;}
    G.coins.silver-=10;G.coins.golden++;
    shopMsg('✨ 10🔘 → 1⭐ 환전! (가치 동일, 총 '+totalNyang()+'₦)');spawnFloat('환전완료');
    trackQT('gold_earned',1);
  }
  checkQuestProgress();checkEndings();updateUI();updateShopUI();
}

// ══════════════════════════════════════
//  SHOP
