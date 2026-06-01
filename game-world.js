// ╔══════════════════════════════════════════════════════╗
// ║  game-world.js                                        ║
// ║  약초사의 비밀정원 — 월드 시스템                             ║
// ║                                                      ║
// ║  포함: mine-detail, openAero, closeAero, checkAeroReturn,
// ╚══════════════════════════════════════════════════════╝

//  WALKING HOUSE EVENT
// ══════════════════════════════════════
const WALK_EVENTS = [
  {title:'수상한 상인 발견!', icon:'🐾',
   desc:'집이 걸어다니다 수상한 상인 고양이를 만났습니다! 오늘 재료를 2배 가격에 팔 수 있어요.',
   rewards:[{label:'재료 전량 2배 판매', action:()=>sellAll(2)},{label:'그냥 돌아가기',action:()=>{}}]},
  {title:'고대 유적 발견!', icon:'🏛️',
   desc:'공룡 다리뼈가 고대 유적 터까지 걸어갔습니다. 크리스탈 파편이 흩어져 있어요!',
   rewards:[{label:'사파이어×2 + 에메랄드×1 수집', action:()=>{G.crystals.sapphire+=2;G.crystals.emerald+=1;spawnFloat('🏛️ +사파이어2 +에메랄드1');}}]},
  {title:'비밀 약초밭 발견!', icon:'🌿',
   desc:'집이 숲 깊은 곳에서 아무도 모르던 약초밭을 발견했습니다!',
   rewards:[{label:'약초×5 + 희귀초×1 수집', action:()=>{addHerb('herb',5);addHerb('rare',1);spawnFloat('🌿 +약초5 +희귀초1');}}]},
  {title:'Baba의 친구 방문!', icon:'🐱',
   desc:'집이 걷다가 옛 친구 고양이를 만났습니다. 선물로 재료를 가져왔어요!',
   rewards:[{label:'랜덤 재료 한 보따리 받기', action:()=>{const items=['herb','lotus','shroom','moss','resin'];items.forEach(k=>addHerb(k,Math.floor(Math.random()*3)+1));spawnFloat('🎁 선물!');}}]},
];

function tryWalkEvent(){
  if(Math.random() < 0.15 && G.day >= 5){
    triggerWalkEvent();
  }
}

function triggerWalkEvent(){
  const ev = WALK_EVENTS[Math.floor(Math.random()*WALK_EVENTS.length)];
  G.walkActive = true;
  const overlay = document.getElementById('walk-overlay');
  document.getElementById('walk-title').textContent='🦕 '+ev.title;
  document.getElementById('walk-desc').textContent=ev.desc;
  const rewardDiv = document.getElementById('walk-rewards');
  rewardDiv.innerHTML='';
  ev.rewards.forEach(r=>{
    const btn=document.createElement('button');
    btn.className='walk-reward';
    btn.textContent=r.label;
    btn.onclick=()=>{r.action();updateUI();updateMineUI();closeWalk();};
    rewardDiv.appendChild(btn);
  });
  overlay.classList.add('show');
  log(`[워킹하우스] ${ev.title}`);
  spawnFloat('🦕 집이 걷기 시작했다!');
}

function closeWalk(){
  document.getElementById('walk-overlay').classList.remove('show');
  G.walkActive=false;
}

// ══════════════════════════════════════
//  IGNIS FORGE SYSTEM
// ══════════════════════════════════════
const IGNIS_TIPS = [
  '"화염이 재료를 정제하고, 정제된 재료가 전설을 만들지."',
  '"별빛 수지는 내가 제일 좋아하는 재료야. 향이 끝내주거든."',
  '"서두르지 마. 화덕은 천천히 달궈야 제맛이지."',
  '"용골 분말은 화산 깊은 곳에서 찾은 비법 재료야."',
  '"달빛석을 만들 때는 달이 밝은 날 더 잘 되더라고."',
  '"고급 물약 하나가 브론즈 열 개보다 가치 있어."',
  '"심연 이끼는 쉽게 구하기 힘들지만... 그게 또 매력이지."',
];

const FORGE_RECIPES = {
  purified:  {name:'정제 약초',   icon:'🌿✨', need:{herb:{herb:5}},         needCoin:{bronze:2}, days:1, out:'purified',   outN:2},
  crystal:   {name:'화염 크리스탈',icon:'💎🔥', need:{herb:{rare:2}},         needCoin:{silver:1}, days:2, out:'crystal',    outN:1},
  moonstone: {name:'달빛석',      icon:'🌙⚡', need:{herb:{lotus:4,moss:2}},  needCoin:{silver:1}, days:2, out:'moonstone',  outN:1},
  dragonbone:{name:'용골 분말',   icon:'🦴🔥', need:{herb:{resin:3,shroom:3}},needCoin:{silver:2}, days:2, out:'dragonbone', outN:1},
  voidmoss:  {name:'심연 이끼',   icon:'🌑🍄', need:{herb:{moss:5,shroom:3}}, needCoin:{silver:2}, days:3, out:'voidmoss',   outN:1},
  starresin: {name:'별빛 수지',   icon:'⭐🌳', need:{herb:{resin:4,rare:1}},  needCoin:{silver:3}, days:3, out:'starresin',  outN:1},
};
const ADV_RECIPES = {
  ignisfire: {name:'불꽃 물약',    icon:'🔥', need:{purified:1,crystal:1},             reward:{golden:1,silver:5}},
  moonblaze: {name:'달불꽃 정수',  icon:'🌙', need:{moonstone:1,purified:2},            reward:{golden:1,silver:8}},
  dragonbrew:{name:'용골 강화약',  icon:'🦴', need:{dragonbone:1,voidmoss:1},           reward:{golden:2}},
  stardust:  {name:'별빛 만능약',  icon:'🌟', need:{starresin:1,crystal:1,moonstone:1}, reward:{golden:5}},
};
const REFINED_NAMES = {
  purified:'정제 약초',crystal:'화염 크리스탈',moonstone:'달빛석',
  dragonbone:'용골 분말',voidmoss:'심연 이끼',starresin:'별빛 수지',
};

function checkIgnisUnlock(){
  if(!G.ignisUnlocked && G.day >= 3){
    G.ignisUnlocked = true;
    const banner = document.getElementById('event-banner');
    banner.innerHTML = `⚙️ <b>정원 지하 격납고가 활성화됐습니다!</b><br>🏠 오두막에서 지하 격납고로 내려가 Aero-Mortar 원정을 떠날 수 있어요!`;
    banner.style.display = 'block';
    setTimeout(()=>{ banner.style.display='none'; }, 6000);
    spawnFloat('✈️ 원정 해금!');
    log('⚙️ Day 3: 정원 지하 격납고 활성화! 오두막에서 Aero-Mortar 원정을 떠날 수 있습니다.');
  }
  // Aero-Mortar 버튼: 라군 장소에 있을 때 항상 표시 (Day 3 이후)
  const aeroBtn = document.getElementById('btn-aero');
  if(aeroBtn){
    const atLagoon = G.curLoc === 'pond';
    const dayOk = G.day >= 3;
    const noMission = !G.aeroMission; // 원정 중이 아닐 때
    aeroBtn.style.display = (atLagoon && dayOk && noMission) ? '' : 'none';
  }
}

function renderIgnisPage(){
  if(G.ignisUnlocked){
    document.getElementById('ignis-locked').style.display = 'none';
    document.getElementById('ignis-unlocked').style.display = 'block';
    // random tip
    const tip = IGNIS_TIPS[G.day % IGNIS_TIPS.length];
    const el = document.getElementById('ignis-tip');
    if(el) el.textContent = tip;
    updateIgnisUI();
    renderForgeQueue();
  } else {
    document.getElementById('ignis-locked').style.display = 'block';
    document.getElementById('ignis-unlocked').style.display = 'none';
  }
}

function startForge(id){
  // Auto-unlock if somehow missed
  if(!G.ignisUnlocked) G.ignisUnlocked = true;
  if(G.forgeQueue.length >= 2){ ignisMsg('🔥 화덕이 가득 찼습니다! 최대 2개 동시 제련.'); return; }
  const R = FORGE_RECIPES[id];
  // check herbs
  for(const[k,v] of Object.entries(R.need.herb||{})){
    if((G.herbs[k]||0) < v){ ignisMsg('❌ ' + iN(k) + ' ' + v + '개가 필요합니다!'); return; }
  }
  // check coins
  for(const[k,v] of Object.entries(R.needCoin||{})){
    if((G.coins[k]||0) < v){ ignisMsg('❌ ' + (k==='bronze'?'브론즈🪙':k==='silver'?'실버🔘':'골든⭐') + ' ' + v + '개 부족!'); return; }
  }
  // deduct
  for(const[k,v] of Object.entries(R.need.herb||{})) G.herbs[k] -= v;
  for(const[k,v] of Object.entries(R.needCoin||{})) G.coins[k] -= v;
  G.forgeQueue.push({id, recipe:id, endDay: G.day + R.days, startDay: G.day});
  ignisMsg(`⚒️ ${R.name} 제련 시작! ${R.days}일 후 완성됩니다.`);
  spawnFloat('🔥 제련 시작!');
  log(`[제련소] ${R.name} 제련 시작 → Day ${G.day + R.days} 완성`);
  updateUI(); renderForgeQueue(); updateIgnisUI();
}

function cancelForge(idx){
  const job = G.forgeQueue[idx];
  if(!job) return;
  // refund half herbs
  const R = FORGE_RECIPES[job.recipe];
  for(const[k,v] of Object.entries(R.need.herb||{})) G.herbs[k] = (G.herbs[k]||0) + Math.floor(v/2);
  G.forgeQueue.splice(idx, 1);
  ignisMsg('취소됨. 재료 절반 환급.');
  updateUI(); renderForgeQueue(); updateIgnisUI();
}

function checkForgeComplete(){
  const done = G.forgeQueue.filter(j => G.day >= j.endDay);
  const remaining = G.forgeQueue.filter(j => G.day < j.endDay);
  G.forgeQueue = remaining;
  done.forEach(job => {
    const R = FORGE_RECIPES[job.recipe];
    G.refined[R.out] = (G.refined[R.out]||0) + R.outN;
    spawnFloat(`${R.icon} ${R.name} 완성!`);
    log(`[제련소] ${R.name} ×${R.outN} 제련 완료!`);
    document.getElementById('tb-ignis').textContent = '✓';
    document.getElementById('tb-ignis').parentElement.classList.add('has-badge');
  });
  if(done.length > 0){ updateIgnisUI(); renderForgeQueue(); }
}

function renderForgeQueue(){
  const slots = document.getElementById('queue-slots');
  if(!slots) return;
  const empty = document.getElementById('queue-empty');
  if(G.forgeQueue.length === 0){
    slots.innerHTML = '<div id="queue-empty" style="font-size:.78rem;color:#805030;text-align:center;padding:8px">현재 제련 중인 작업이 없습니다.</div>';
    return;
  }
  slots.innerHTML = '';
  G.forgeQueue.forEach((job, idx) => {
    const R = FORGE_RECIPES[job.recipe];
    const total = job.endDay - job.startDay;
    const done = G.day - job.startDay;
    const pct = Math.min(100, Math.round((done/total)*100));
    const remain = job.endDay - G.day;
    const div = document.createElement('div');
    div.className = 'queue-slot';
    div.innerHTML = `
      <span class="qs-icon">${R.icon}</span>
      <div style="flex:1">
        <div class="qs-name">${R.name}</div>
        <div class="qs-prog"><div class="qs-prog-fill" style="width:${pct}%"></div></div>
        <div class="qs-remain">${remain > 0 ? remain+'일 후 완성' : '✅ 완성! 하루 마감 후 수령'}</div>
      </div>
      <button class="qs-cancel" onclick="cancelForge(${idx})">취소</button>`;
    slots.appendChild(div);
  });
}

function advCraft(id){
  if(!G.ignisUnlocked){ ignisMsg('🔒 제련소가 열려야 합니다!'); return; }
  const R = ADV_RECIPES[id];
  for(const[k,v] of Object.entries(R.need)){
    if((G.refined[k]||0) < v){ ignisMsg(`❌ ${REFINED_NAMES[k]||k} ${v}개 부족!`); return; }
  }
  for(const[k,v] of Object.entries(R.need)) G.refined[k] -= v;
  Object.entries(R.reward).forEach(([k,v]) => addCoins(k,v));
  G.potions++; G.stats.totalCraft++;
  if(!G.potionInv) G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  G.potionInv[id]=(G.potionInv[id]||0)+1;
  const nyangVal = (R.reward.bronze||0) + (R.reward.silver||0)*10 + (R.reward.golden||0)*100;
  const rewStr = '+' + nyangVal + '₦ ' + Object.entries(R.reward).map(([k,v])=>`(${k==='bronze'?'🪙':k==='silver'?'🔘':'⭐'}×${v})`).join('');
  ignisMsg(`✨ ${R.name} 제조 완료! ${rewStr}`);
  spawnFloat(`🔥 ${R.name}!`);
  log(`[제련소] 고급: ${R.name} 완성 → ${rewStr}`);
  checkQuestProgress(); checkEndings(); updateUI(); updateIgnisUI();
}

function updateIgnisUI(){
  if(!G.refined) return;
  const keys = ['purified','crystal','moonstone','dragonbone','voidmoss','starresin'];
  keys.forEach(k => {
    const el = document.getElementById('ri-'+k);
    if(el){ el.textContent = G.refined[k]||0; }
  });
  // forge availability
  const FR = FORGE_RECIPES;
  Object.entries(FR).forEach(([id, R]) => {
    const el = document.getElementById('fg-'+id);
    if(!el) return;
    const queueFull = G.forgeQueue.length >= 2;
    const herbOk = Object.entries(R.need.herb||{}).every(([k,v]) => (G.herbs[k]||0) >= v);
    const coinOk = Object.entries(R.needCoin||{}).every(([k,v]) => (G.coins[k]||0) >= v);
    el.classList.toggle('disabled', queueFull || !herbOk || !coinOk);
  });
  // adv island availability + notice
  const advNotice = document.getElementById('adv-ignis-notice');
  const advIslandIds = ['ignisfire','moonblaze','dragonbrew','stardust'];
  if(!G.ignisMetFlag){
    if(advNotice) advNotice.style.display = 'block';
    advIslandIds.forEach(id => {
      const el = document.getElementById('adv-'+id);
      if(el) el.classList.add('disabled');
    });
  } else {
    if(advNotice) advNotice.style.display = 'none';
    // check individual availability via ADV_RECIPES_ISLAND
    if(typeof ADV_RECIPES_ISLAND !== 'undefined'){
      Object.entries(ADV_RECIPES_ISLAND).forEach(([id, R]) => {
        const el = document.getElementById('adv-'+id);
        if(!el) return;
        const ok = Object.entries(R.need||{}).every(([k,v]) => (G.refined[k]||0) >= v);
        el.classList.toggle('disabled', !ok);
      });
    }
  }
}

function ignisMsg(msg){
  const el = document.getElementById('ignis-quote');
  if(el){ el.textContent = msg; setTimeout(()=>{ el.textContent = IGNIS_TIPS[G.day % IGNIS_TIPS.length]; }, 3000); }
  log('[이그니스] ' + msg);
  // Also show in s-result as fallback
  showResult('[이그니스] ' + msg);
}

// ══ BGM + TITLE ══
let bgmPlaying = false;

function toggleBgm(){
  var audio=document.getElementById('bgm');
  if(!audio)return;
  if(bgmPlaying){
    audio.pause();
    bgmPlaying=false;
    updateBgmUI();
  } else {
    audio.play().then(function(){
      bgmPlaying=true;
      updateBgmUI();
    }).catch(function(){
      bgmPlaying=false;
      updateBgmUI();
    });
  }
}
function toggleBgmSettings(){
  toggleBgm();
}
function updateBgmUI(){
  // 실제 오디오 상태로 확인 (bgmPlaying 변수보다 더 신뢰)
  var audio=document.getElementById('bgm');
  var actuallyPlaying = audio && !audio.paused;
  // 변수 동기화
  bgmPlaying = actuallyPlaying;

  var icon=document.getElementById('settings-bgm-icon');
  var status=document.getElementById('settings-bgm-status');
  var toggle=document.getElementById('settings-bgm-toggle');
  var knob=document.getElementById('settings-bgm-knob');

  if(icon) icon.textContent=bgmPlaying?'🎵':'🔇';
  if(status) status.textContent=bgmPlaying?'재생 중':'정지됨';
  if(toggle){
    toggle.style.background=bgmPlaying?'#4a9a30':'#999';
    toggle.style.transition='background .3s';
  }
  if(knob){
    knob.style.left=bgmPlaying?'22px':'2px';
    knob.style.right='auto';
    knob.style.transition='left .3s';
  }
}

function startBgm(){
  const audio=document.getElementById('bgm');
  if(audio&&!bgmPlaying){
    audio.volume=0.4;
    audio.play().then(function(){
      bgmPlaying=true;
      updateBgmUI();
    }).catch(function(){
      // 자동재생 차단 시 버튼으로만 재생 가능
    });
  }
}

function updateTitle(){
  const titleEl=document.getElementById('main-title');
  if(!titleEl)return;
  const name=G.charName||G.playerName||'';
  if(name){
    titleEl.textContent='🌿 약초사 '+name+'님의 비밀정원';
  } else {
    titleEl.textContent='🌿 약초사의 비밀정원';
  }
  // 글자 길이에 따라 폰트 크기 자동 조정
  const len=titleEl.textContent.length;
  if(len>16)      titleEl.style.fontSize='.72rem';
  else if(len>12) titleEl.style.fontSize='.82rem';
  else            titleEl.style.fontSize='.92rem';
}

// ══ SKY GARDEN SYSTEM ══
const SKY_HERBS = {
  starbloom:{name:'별빛 개화초',icon:'🌟',energyCost:1,
    reward:()=>({rare:1+Math.floor(Math.random()*2),herb:2})},
  cloudmoss:{name:'구름 이끼',  icon:'☁️', energyCost:1,
    reward:()=>({moss:2+Math.floor(Math.random()*2)})},
  moonpetal:{name:'달빛 꽃잎',  icon:'🌙', energyCost:1,
    reward:()=>({lotus:2+Math.floor(Math.random()*2),rare:1})},
  rainflower:{name:'무지개 꽃', icon:'🌈', energyCost:2,
    reward:()=>({herb:3,lotus:2,rare:1})},
};

const CAT_SCENES = [
  {cat:'🐱', action:'낮잠 중', desc:'"구름이 이렇게 푹신한 줄 몰랐다. 오늘 실험은... 내일 하지."', anim:'catNap'},
  {cat:'😸', action:'나비 장난', desc:'"나비야, 이리 와봐... 냥! 으—잡을 뻔 했는데."', anim:'catPlay'},
  {cat:'😺', action:'별 관찰', desc:'"저 별 이름이 뭐지? 약초 이름으로 쓸 수 있을 것 같은데."', anim:'catStar'},
  {cat:'🙀', action:'구름 위 발견', desc:'"잠깐, 이 구름... 움직이고 있어? 집이 아니라 구름이 날 따라다니는 건가?!"', anim:'catShock'},
  {cat:'😴', action:'깊은 잠', desc:'"zzz... 엉겅퀴... 5분만 더... zzz..."', anim:'catSleep'},
  {cat:'😼', action:'Earl Grey 음용', desc:'"구름 위에서 마시는 Earl Grey는... 확실히 다른 맛이군. 습도 탓인가."', anim:'catTea'},
];
let catSceneIdx = 0;

function openSkyGarden(){
  const overlay=document.getElementById('sky-overlay');
  overlay.classList.add('show');
  overlay.scrollTop=0;
  renderSkyGarden();
  log('[하늘정원] 입장');
}

function closeSkyGarden(){
  document.getElementById('sky-overlay').classList.remove('show');
}

function isSeasonPassValid(){
  if(!G.skyPass) return false;
  if(G.skyPass.permanent) return true;
  // 계절 세금: 마지막 납부 계절과 현재 계절 비교
  return G.skyPass.paidSeason === Math.floor(G.day/7);
}

function renderSkyGarden(){
  // 현재 냥 표시
  const nyEl=document.getElementById('sky-nyang-display');
  if(nyEl) nyEl.textContent='현재 보유: '+totalNyang()+'₦';
  // 500냥 부족하면 버튼 스타일 변경
  const btn=document.getElementById('seasonal-pass-btn');
  if(btn){
    if(totalNyang()<500){
      btn.style.opacity='.5';
      btn.title='냥코인이 부족합니다 (500₦ 필요)';
    } else {
      btn.style.opacity='1';
      btn.title='';
    }
  }
  const locked=document.getElementById('sky-locked-view');
  const unlocked=document.getElementById('sky-unlocked-view');
  const medal=document.getElementById('sky-medal');
  const hasPass=G.skyPass&&(G.skyPass.permanent||isSeasonPassValid());

  if(hasPass){
    locked.style.display='none';
    unlocked.style.display='block';
    if(medal) medal.classList.add('show');
    // 출입증 정보
    const pname=document.getElementById('sky-pass-name');
    const pdesc=document.getElementById('sky-pass-desc');
    const pbadge=document.getElementById('sky-pass-badge');
    if(G.skyPass.permanent){
      if(pname) pname.textContent='영구 시민권 보유자';
      if(pdesc) pdesc.textContent='하늘정원 영구 입장 가능';
      if(pbadge){pbadge.textContent='영구';pbadge.style.background='rgba(255,215,0,.3)';}
    } else {
      const rem=7-((G.day%7)||7);
      if(pname) pname.textContent='계절 시민권 보유자';
      if(pdesc) pdesc.textContent='다음 계절까지 '+rem+'일 남음';
      if(pbadge){pbadge.textContent='유효';pbadge.style.background='rgba(100,200,100,.2)';}
    }
    renderCatScene();
  } else {
    locked.style.display='block';
    unlocked.style.display='none';
    if(medal) medal.classList.remove('show');
  }
}

function switchSkyTab(tab){
  document.querySelectorAll('.sky-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.sky-section').forEach(s=>s.classList.remove('active'));
  event.target.classList.add('active');
  const sec=document.getElementById('sky-'+tab);
  if(sec) sec.classList.add('active');
  if(tab==='cats') renderCatScene();
}

function skyHarvest(id){
  const H=SKY_HERBS[id];
  if(!H) return;
  if(G.energy<H.energyCost){
    showResult('⚡ Activity이 부족합니다!',true);return;
  }
  G.energy-=H.energyCost;
  const r=H.reward();
  Object.entries(r).forEach(([k,v])=>{if(v>0)addHerb(k,v);});
  const rStr=Object.entries(r).map(([k,v])=>iN(k)+'×'+v).join(' ');
  showResult('🌸 '+H.name+' 채집! '+rStr);
  spawnFloat(H.icon+' +'+rStr);
  log('[하늘정원] '+H.name+' 채집 → '+rStr);
  updateUI();
}

function skyBuy(id){
  const items={
    goldenpass:{name:'골든 냥코인 ×5',costType:'skyherb',costAmt:10,action:()=>{addCoins('golden',5);}},
    skypotion: {name:'하늘의 만능 물약',costType:'golden',costAmt:2, action:()=>{healHp(G.maxHp);G.energy=Math.min(G.maxEnergy+3,G.energy+3);}},
    energymax: {name:'Activity 최대 확장',costType:'golden',costAmt:5, action:()=>{G.maxEnergy+=2;G.energy+=2;}},
    housesky:  {name:'하늘 외벽 장식', costType:'skyherb',costAmt:5, action:()=>{if(!G.houseMods)G.houseMods={};G.houseMods['wall-sky']='equipped';}},
  };
  const item=items[id];
  if(!item){return;}
  if(item.costType==='golden'&&(G.coins.golden||0)<item.costAmt){
    showResult('⭐ 골든 냥코인이 부족합니다!',true);return;
  }
  if(item.costType==='golden') G.coins.golden-=item.costAmt;
  item.action();
  showResult('✨ '+item.name+' 구매!');
  spawnFloat('☁️ '+item.name+'!');
  log('[하늘시장] '+item.name+' 구매');
  updateUI();
}

function buySkyPass(type){
  if(type==='permanent'){
    showResult('🏅 영구 출입증 구매는 준비 중입니다!',false);
    // 추후 실제 결제 연동
  } else if(type==='seasonal'){
    if(totalNyang()<500){
      showResult('💰 냥코인이 부족합니다! (500₦ 필요)',true);return;
    }
    // 500냥 차감
    if(!deductNyang(500)){showResult('냥코인이 부족합니다!',true);return;}
    if(!G.skyPass) G.skyPass={};
    G.skyPass.permanent=false;
    G.skyPass.paidSeason=Math.floor(G.day/7);
    renderSkyGarden();
    spawnFloat('🏅 하늘 시민권 획득!');
    log('[하늘정원] 계절 시민권 구매 (500₦)');
    updateUI();
  }
}

function paySeasonTax(){
  if(totalNyang()<500){showResult('💰 냥코인이 부족합니다!',true);dismissTax();return;}
  if(!deductNyang(500)){showResult('💰 냥코인이 부족합니다!',true);dismissTax();return;}
  G.skyPass.paidSeason=Math.floor(G.day/7);
  dismissTax();
  spawnFloat('✅ 세금 납부 완료!');
  log('[하늘정원] 계절 세금 납부 (500₦)');
  updateUI();
}

function dismissTax(){
  document.getElementById('tax-banner').classList.remove('show');
}

function checkSkyTax(){
  if(!G.skyPass||G.skyPass.permanent) return;
  // 계절이 바뀌면 세금 알림
  const curSeason=Math.floor(G.day/7);
  if(G.skyPass.paidSeason!==undefined&&G.skyPass.paidSeason<curSeason){
    document.getElementById('tax-banner').classList.add('show');
  }
}

function renderCatScene(){
  const display=document.getElementById('cat-scene-display');
  if(!display)return;
  const s=CAT_SCENES[catSceneIdx%CAT_SCENES.length];
  display.innerHTML='<div class="cat-rest-scene">'
    +'<div class="cat-rest-main" style="animation:catIdle 2s ease-in-out infinite">'+s.cat+'</div>'
    +'<div class="cat-rest-action">'+s.action+'</div>'
    +'<div class="cat-rest-desc">'+s.desc+'</div>'
    +'</div>';
}

function nextCatScene(){
  catSceneIdx++;
  renderCatScene();
  spawnFloat(CAT_SCENES[catSceneIdx%CAT_SCENES.length].cat);
}

// ══ PASSWORD RESET ══
function showResetScreen(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('reset-screen').style.display='block';
  document.getElementById('reset-msg-ok').textContent='';
  document.getElementById('reset-msg-err').textContent='';
  document.getElementById('reset-email').value='';
}
function showResetBack(){
  document.getElementById('reset-screen').style.display='none';
  document.getElementById('login-screen').style.display='block';
}
function sendPasswordReset(){
  const email=document.getElementById('reset-email').value.trim();
  const okEl=document.getElementById('reset-msg-ok');
  const errEl=document.getElementById('reset-msg-err');
  okEl.textContent=''; errEl.textContent='';
  if(!email||!email.includes('@')){
    errEl.textContent='올바른 이메일 주소를 입력해주세요.'; return;
  }
  if(!window._fbAuth||!window._fbFns){
    errEl.textContent='Firebase 연결이 필요합니다.'; return;
  }
  window._fbFns.sendPasswordResetEmail(window._fbAuth, email)
    .then(function(){
      okEl.textContent='✅ 재설정 이메일을 보냈습니다! 메일함을 확인해주세요.';
    })
    .catch(function(err){
      if(err.code==='auth/user-not-found')
        errEl.textContent='등록되지 않은 이메일입니다.';
      else if(err.code==='auth/invalid-email')
        errEl.textContent='올바른 이메일 형식이 아닙니다.';
      else
        errEl.textContent='오류: '+err.message;
    });
}

// ══ NOTICE SYSTEM ══
let noticesCache = [];

function renderNotices(){
  const list=document.getElementById('notice-list');
  if(!list) return;
  // Firebase에서 공지 불러오기
  if(window._fbDb&&window._fbFns){
    const noticeRef=window._fbFns.collection(window._fbDb,'notices');
    window._fbFns.getDocs(noticeRef).then(function(snap){
      noticesCache=[];
      snap.forEach(function(doc){
        noticesCache.push({id:doc.id, ...doc.data()});
      });
      // 핀 먼저, 날짜 최신순 정렬
      noticesCache.sort(function(a,b){
        if(a.pinned&&!b.pinned) return -1;
        if(!a.pinned&&b.pinned) return 1;
        return new Date(b.createdAt||0)-new Date(a.createdAt||0);
      });
      displayNotices();
    }).catch(function(){
      displayNotices();
    });
  } else {
    list.innerHTML='<div class="nc-empty">공지를 불러오려면 로그인이 필요합니다.</div>';
  }
}

function displayNotices(){
  const list=document.getElementById('notice-list');
  if(!list) return;
  if(noticesCache.length===0){
    list.innerHTML='<div class="nc-empty">📜 아직 공지사항이 없습니다.<br><br>"Baba가 Earl Grey를 마시며 공지를 작성 중입니다..."</div>';
    return;
  }
  list.innerHTML='';
  noticesCache.forEach(function(n,i){
    const card=document.createElement('div');
    card.className='notice-card'+(n.pinned?' pinned':'');
    const date=n.createdAt?new Date(n.createdAt).toLocaleDateString('ko-KR'):'';
    const typeLabel=n.type==='update'?'업데이트':n.type==='event'?'이벤트':n.type==='fix'?'버그수정':'공지';
    const typeEl=n.pinned?'<span class="nc-pin">📌 고정</span>':'';
    card.innerHTML='<div class="nc-header">'
      +typeEl
      +'<span class="nc-type">'+typeLabel+'</span>'
      +'<span class="nc-title">'+n.title+'</span>'
      +'<span class="nc-date">'+date+'</span>'
      +'</div>'
      +'<div class="nc-body" id="nb-'+i+'"><div class="nc-content">'+(n.content||'').replace(/\n/g,'<br>')+'</div></div>';
    card.onclick=function(){toggleNotice('nb-'+i);};
    list.appendChild(card);
  });
  // 미읽은 공지 뱃지
  const tb=document.getElementById('tb-notice');
  if(tb&&noticesCache.length>0){
    tb.textContent=noticesCache.length;
    tb.parentElement.classList.add('has-badge');
  }
}

function toggleNotice(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.classList.toggle('open');
}

// ══ AUTO SAVE SYSTEM ══
let autoSaveTimer = null;
let lastSaveTime = 0;

function startAutoSave(){
  // 3분마다 자동 저장
  if(autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(function(){
    if(typeof G !== 'undefined' && G.day > 0){
      saveGame();
      const now = new Date();
      lastSaveTime = now;
      console.log('[자동저장] ' + now.toLocaleTimeString());
    }
  }, 3 * 60 * 1000); // 3분
}

// 탭 전환 시 저장
function saveOnTabSwitch(){
  if(typeof G !== 'undefined' && G.day > 0){
    try{
      localStorage.setItem('herbcat_save', JSON.stringify(G));
    }catch(e){}
  }
}

// 페이지 나가기 전 저장
window.addEventListener('beforeunload', function(){
  if(typeof G !== 'undefined' && G.day > 0){
    try{
      localStorage.setItem('herbcat_save', JSON.stringify(G));
    }catch(e){}
  }
});

// 화면 숨김 시 저장 (모바일 앱 전환)
document.addEventListener('visibilitychange', function(){
  if(document.hidden && typeof G !== 'undefined' && G.day > 0){
    saveGame();
    console.log('[자동저장] 화면 전환 감지');
  }
});

// ══ BABA COMMENTS ══
const BABA_GATHER = {
  bloom: [
    '"꽃잎이 오늘따라 유난히 향기롭군."',
    '"이 꽃은 보름달 때 채집해야 효과가 배가 되지."',
    '"음... 약초 상태가 좋아. 날씨 덕분인가?"',
    '"조심해서 다뤄. 이 꽃은 한 번 꺾이면 끝이야."',
  ],
  pond: [
    '"라군의 수초는 달이 없는 밤에 가장 잘 자란다오."',
    '"물이 차갑군. 좋은 수초가 나올 거야."',
    '"개구리가 도망가는군... 내 인기가 없나?"',
    '"이 연꽃, Earl Grey에 넣으면 꽤 괜찮지."',
  ],
  forest: [
    '"고목나무 틈새에 수지가 맺혔군. 오늘 운이 좋아."',
    '"숲이 조용하면 좋은 재료가 나온다. 경험상."',
    '"이 나무... 300년은 됐겠군. 약성이 깊어."',
    '"발소리를 줄여. 희귀초가 소리에 반응한다고."',
  ],
  hills: [
    '"이끼는 습도가 높을 때 채집해야 해. 오늘 딱이군."',
    '"돌 밑을 살펴봐. 좋은 것들은 항상 숨어있거든."',
    '"이 이끼 색... 약성이 강한 녀석이야."',
    '"언덕 바람이 세군. 재료 날아가기 전에 서둘러."',
  ],
  mushroom: [
    '"버섯은 만지기 전에 냄새부터 맡아야 해."',
    '"이 포자... 조심해. 재채기 멈추기 힘들거야."',
    '"오늘 버섯 상태가 좋군. 비가 왔나?"',
    '"독버섯이랑 구별 못 하면... 뭐, 나한테 물어봐."',
  ],
  whisker: [
    '"여기서는 수염 감각에 집중해야 해. 희귀초 냄새가 달라."',
    '"감각을 열어. 이 정원은 말을 건네거든."',
    '"희귀초가 근처에 있어. 수염이 간질거려."',
    '"조용히. 이 정원에서 서두르면 아무것도 못 얻어."',
  ],
  lookout: [
    '"전망대에서 보면 내일 날씨를 읽을 수 있지."',
    '"저 구름... 내일은 비가 오겠군."',
    '"높은 곳에서 보면 정원이 다르게 보여. 항상."',
    '"바람의 방향이 바뀌었어. 뭔가 올 것 같은데."',
  ],
  cottage: [
    '"연금술은 서두름의 적이야. 천천히."',
    '"실험실 정리 좀 해줘. 내가 하기 싫거든."',
    '"약탕기 온도가 딱 맞군. 오늘 제조 성공률 높겠어."',
    '"Earl Grey 한 잔 마시고 시작하는 게 좋아."',
  ],
};

const BABA_RARE = [
  '"오... 이건 드문 거야. 잘 보관해."',
  '"희귀초! 100년에 한 번 피는 건데..."',
  '"이걸 찾다니. 오늘 운이 좋군, 자네."',
  '"내 도감에도 몇 번 없는 것이야. 조심히."',
];

const BABA_GOLDEN = [
  '"황금 약초?! 이게 여기 있었어?! 내가 20년을 찾던..."',
  '"전설에만 나오던 황금 약초... 실제로 있었군."',
  '"이건... 말문이 막히는군. Earl Grey보다 귀해."',
];

const BABA_WEATHER = {
  rain: '"비 오는 날 수초가 최고야."',
  storm: '"폭풍 속에서 채집하다니... 대담하군."',
  fog: '"안개 속에서만 피는 약초가 있지."',
  wind: '"바람이 세군. 가벼운 포자들이 날아다녀."',
};

function getBabaComment(locKey, isRare, isGolden){
  if(isGolden) return BABA_GOLDEN[Math.floor(Math.random()*BABA_GOLDEN.length)];
  if(isRare) return BABA_RARE[Math.floor(Math.random()*BABA_RARE.length)];
  const weather = G.weather;
  if(BABA_WEATHER[weather] && Math.random()<0.3) return BABA_WEATHER[weather];
  const comments = BABA_GATHER[locKey]||BABA_GATHER.bloom;
  return comments[Math.floor(Math.random()*comments.length)];
}

function showBabaComment(msg){
  // 기존 말풍선 제거
  const old = document.getElementById('baba-speech');
  if(old) old.remove();
  const el = document.createElement('div');
  el.id = 'baba-speech';
  el.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);'
    +'background:rgba(46,31,15,.95);border:1.5px solid var(--gold);border-radius:12px;'
    +'padding:9px 14px;font-size:.82rem;color:var(--gold2);font-style:italic;'
    +'max-width:280px;text-align:center;z-index:99;'
    +'animation:babaFadeIn .3s ease forwards;pointer-events:none;'
    +'box-shadow:0 4px 15px rgba(0,0,0,.4)';
  el.innerHTML = '🐱 ' + msg;
  document.body.appendChild(el);
  setTimeout(()=>{ if(el.parentNode){ el.style.opacity='0'; el.style.transition='opacity .5s'; setTimeout(()=>el.remove(),500); }}, 3000);
}

// ══ 황금 약초 ══
function tryGoldenHerb(){
  if(Math.random() < 0.005){ // 0.5% 확률
    G.herbs.rare = (G.herbs.rare||0) + 1;
    G.herbs.herb = (G.herbs.herb||0) + 2;
    // 특별 연출
    spawnFloat('✨ 황금 약초 발견!');
    showBabaComment(getBabaComment(G.curLoc, false, true));
    showResult('🌟 황금 약초 발견! 전설의 재료입니다!');
    log('[황금약초] 발견! 희귀초+1, 약초+2');
    // 파티클 효과
    for(let i=0;i<5;i++){
      setTimeout(()=>spawnFloat('✨'), i*200);
    }
    return true;
  }
  return false;
}

// ══ 정밀 탐색 ══
function doSearchAction(){
  const loc = G.curLoc;
  if(loc==='cottage'){showResult('오두막에서는 탐색보다 연구가 우선이야.',true);return;}
  if(G.energy < 2){showResult('⚡ Activity이 부족합니다! (2 필요)',true);return;}
  G.energy -= 2;
  G.stats.totalGather=(G.stats.totalGather||0)+1;
  checkTitleUpgrade();

  let results=[];
  let isRare=false;

  // 정밀탐색: 희귀초 40% + 특수 효과
  if(Math.random()<0.4){
    addHerb('rare',1); results.push('💎 희귀초×1'); isRare=true;
  }
  // 장소별 추가 보상
  const searchBonus={
    bloom:  ()=>{ addHerb('lotus',2); results.push('🪷 수초×2'); },
    pond:   ()=>{ addHerb('lotus',2); addHerb('moss',1); results.push('🪷×2 🪨×1'); },
    forest: ()=>{ addHerb('resin',2); results.push('🌳 수지×2'); },
    hills:  ()=>{ addHerb('moss',2); if(G.crystals){G.crystals.sapphire=(G.crystals.sapphire||0)+1;trackCrystalMined('sapphire',1);results.push('💎 사파이어×1');} },
    mushroom:()=>{ addHerb('shroom',3); results.push('🍄 버섯×3'); },
    whisker:()=>{ addHerb('rare',1); addHerb('herb',2); results.push('💎 희귀초×1 🌿×2'); isRare=true; },
    lookout:()=>{ // 내일 날씨 예고
      const nextW=['sunny','rain','storm','fog','wind','bountiful'][Math.floor(Math.random()*6)];
      const wNames={sunny:'맑음',rain:'비',storm:'폭풍',fog:'안개',wind:'바람',bountiful:'풍년'};
      results.push('🔭 내일 날씨: '+wNames[nextW]);
      G.nextWeather=nextW;
    },
    cottage:()=>{ G.upg.craftBonus=(G.upg.craftBonus||0)+1; results.push('⚗️ 오늘 제조 보너스!'); },
  };
  if(searchBonus[loc]) searchBonus[loc]();

  // 황금 약초 체크
  const golden = tryGoldenHerb();
  if(golden) results.push('🌟 황금약초!');

  const msg = results.length ? results.join(' ') : '특별한 것을 찾지 못했습니다...';
  showResult('🔍 정밀 탐색: '+msg);
  spawnFloat('🔍 '+msg.split(' ')[0]);
  showBabaComment(getBabaComment(loc, isRare, golden));
  checkQuestProgress();
  updateUI();
}

// ══ 장소별 특수행동 구현 ══
const SPECIAL_ACTIONS = {
  bloom: {
    name:'밤꽃 수확', icon:'🌸', cost:2,
    fn: function(){
      addHerb('lotus',2); addHerb('rare',1);
      showResult('🌸 밤꽃 수확! 달빛 수초×2 + 희귀초×1');
      showBabaComment('"밤꽃은 달빛을 머금고 있어. 달빛 물약 재료로 최고지."');
      G.upg.luckBonus=(G.upg.luckBonus||0)+1; // 임시 행운 버프
    }
  },
  pond: {
    name:'달빛 명상', icon:'🌙', cost:2,
    fn: function(){
      G.upg.gatherBonus=(G.upg.gatherBonus||0)+2; // 다음날까지 채집 보너스
      showResult('🌙 달빛 명상! 내일 채집량 +2 버프!');
      showBabaComment('"라군의 달빛 아래서 명상하면... 약초가 스스로 다가온다오."');
    }
  },
  forest: {
    name:'수지 추출', icon:'🌳', cost:2,
    fn: function(){
      addHerb('resin',3);
      showResult('🌳 수지 추출! 수지×3 획득!');
      showBabaComment('"나무 상처에서 나오는 수지... 자연의 눈물이라 부르지."');
    }
  },
  hills: {
    name:'돌 뒤집기', icon:'🪨', cost:2,
    fn: function(){
      addHerb('moss',2);
      if(G.crystals && Math.random()<0.4){
        G.crystals.amethyst=(G.crystals.amethyst||0)+1;
        trackCrystalMined('amethyst',1);
        showResult('🪨 돌 뒤집기! 이끼×2 + 자수정 발견!');
      } else {
        showResult('🪨 돌 뒤집기! 이끼×2 획득!');
      }
      showBabaComment('"돌 밑은 항상 뭔가 숨겨져 있어. 경험에서 나온 진리야."');
    }
  },
  mushroom: {
    name:'포자 채집', icon:'🍄', cost:2,
    fn: function(){
      addHerb('shroom',3);
      if(!G.herbCollected)G.herbCollected={};
      if(Math.random()<0.2){
        addHerb('rare',1);
        G.herbCollected.rustcap=(G.herbCollected.rustcap||0)+1;
        showResult('🍄 포자 채집! 버섯×3 + 🍄 녹슨 고철 버섯 발견!');
      } else {
        showResult('🍄 포자 채집! 버섯×3 획득!');
      }
      if(typeof showBabaComment==='function') showBabaComment('Baba: Hold your breath. Rust-spores are tricky...');
    }
  },
  whisker: {
    name:'감각 집중', icon:'✨', cost:2,
    fn: function(){
      addHerb('rare',2);
      if(!G.herbCollected)G.herbCollected={};
      if(Math.random()<0.25){
        G.herbCollected.voltcreep=(G.herbCollected.voltcreep||0)+1;
        G.maxEnergy=Math.min(10,(G.maxEnergy||5)+1);
        showResult('✨ 감각 집중! 희귀초×2 + ⚡ 감전 덩굴풀 발견! Activity 최대치 +1');
      } else {
        showResult('✨ 감각 집중! 희귀초×2 발견!');
      }
      if(typeof showBabaComment==='function') showBabaComment('Baba: Whiskers tingling... something rare nearby.');
    }
  },
  lookout: {
    name:'전망 탐색', icon:'🔭', cost:2,
    fn: function(){
      const weathers=['sunny','rain','fog','wind','storm','bountiful'];
      const wNames={sunny:'맑음',rain:'비',storm:'폭풍',fog:'안개',wind:'바람',bountiful:'풍년'};
      const next=weathers[Math.floor(Math.random()*weathers.length)];
      G.nextWeather=next;
      addCoins('bronze',5);
      showResult('🔭 내일 날씨: '+wNames[next]+' + 브론즈×5 발견!');
      showBabaComment('"저 구름 모양... 내일은 '+wNames[next]+'이겠군."');
    }
  },
  cottage: {
    name:'연금술 연습', icon:'⚗️', cost:2,
    fn: function(){
      G.potions=(G.potions||0)+1;
      if(!G.potionInv)G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
      G.potionInv.healing=(G.potionInv.healing||0)+1;
      showResult('⚗️ 연금술 연습! 치유 물약×1 완성!');
      showBabaComment('"연습이 완벽을 만들지. 나도 처음엔 폭발을 몇 번 했다오."');
    }
  },
};

// doAction 함수 교체 - 특수행동 연결
const _origDoAction = typeof doAction==='function' ? doAction : null;
function doAction(type){
  // 하루 마감 최우선
  // 😺 낮잠
  if(type==='nap'){
    if(G.isNight){showResult('밤에는 낮잠 대신 수면을 취하세요. 😴',true);return;}
    const napN = G.napCount||0;
    const restore = napN===0?3:napN===1?2:napN===2?1:0;
    G.napCount = napN+1;
    if(restore > 0){
      G.energy = Math.min(G.maxEnergy, (G.energy||0)+restore);
    }
    // 낮잠 이벤트
    const napEvents=[
      {msg:'꿈에서 신비로운 약초 레시피를 봤다... 일어나서 기록해야지!', bonus:{resin:1}},
      {msg:'낮잠 중 도제가 실수로 연금술 냄비를 엎었다. 뭔가 타는 냄새가...'},
      {msg:'꿈속에서 Baba가 어린 시절 마녀였을 때 기억이 스쳐갔다.'},
      {msg:'따뜻한 햇살 속에서 꿀잠을 잤다. 온몸이 개운하다!'},
      {msg:'꿈에서 루나루어 라군이 은하수로 빛나고 있었다...'},
      {msg:'낮잠 중 수염이 간질간질... 나비가 앉았다 갔나봐.'},
    ];
    const ev = napEvents[Math.floor(Math.random()*napEvents.length)];
    if(ev.bonus) Object.entries(ev.bonus).forEach(function([k,v]){addHerb(k,v);});
    const restMsg = restore>0 ? ` Activity +${restore} 회복.` : ' 너무 많이 잤다... 피곤하다.';
    showResult('😺 '+ev.msg+restMsg);
    spawnFloat(restore>0?'😺 낮잠!':'😫 지침!');
    log('[낮잠] '+ev.msg);
    // 낮잠 버튼 효율 업데이트
    const napLabel=document.getElementById('nap-cost-label');
    const nextRestore=G.napCount===1?2:G.napCount===2?1:0;
    if(napLabel) napLabel.textContent='Activity '+(nextRestore>0?'+'+nextRestore:'없음(지침)');
    updateUI(); return;
  }
  // 🌙 밤으로 전환 (endDay 없음)
  if(type==='tonight'){
    if(G.isNight){showResult('이미 밤입니다.',true);return;}
    G.isNight = true;
    // Activity 일부 회복 (야간 활동용)
    const nightRestore = Math.ceil(G.maxEnergy * 0.4);
    G.energy = Math.min(G.maxEnergy, (G.energy||0) + nightRestore);
    buildLocScroll();
    setLocation(G.curLoc);
    showResult('🌙 밤이 찾아왔습니다. Activity +'+nightRestore+' 회복! 야간 채집이 가능합니다.');
    spawnFloat('🌙 밤 전환!');
    log('🌙 밤이 됐습니다. 야간 채집 가능.');
    updateUI();
    // 오두막 버튼 갱신 (밤으로→수면으로 교체)
    const btnTon=document.getElementById('btn-tonight');
    const btnRest2=document.getElementById('btn-rest');
    if(btnTon) btnTon.style.display='none';
    if(btnRest2) btnRest2.style.display='';
    return;
  }
  // 😴 수면 → 진짜 새 날 시작
  if(type==='rest'){
    if(!G.isNight){
      showResult('밤이 된 후 수면할 수 있습니다. 먼저 🌙 밤으로를 눌러주세요.',true);
      return;
    }
    endDay();
    return;
  }
  // 정밀 탐색
  if(type==='search'){ doSearchAction(); return; }
  // 특수 행동
  if(type==='special'){
    const sp=SPECIAL_ACTIONS[G.curLoc];
    if(!sp){showResult('이 장소에선 특수 행동이 없습니다.',true);return;}
    if(G.energy<sp.cost){showResult('⚡ Activity '+sp.cost+' 필요!',true);return;}
    G.energy-=sp.cost;
    sp.fn();
    spawnFloat(sp.icon+' '+sp.name+'!');
    checkQuestProgress(); updateUI(); return;
  }
  // 채집
  if(type==='gather'){
    const W=WEATHERS[G.weather]||{};
    let cost=1;
    if(W.extraCost) cost+=W.extraCost;
    if(G.energy<cost){showResult('⚡ Activity 부족!',true);return;}
    G.energy-=cost;
    const L=LOCS[G.curLoc];
    if(!L||!L.item){showResult('여기선 채집할 수 없습니다.',true);G.energy+=cost;return;}
    // 겨울 채집 패널티 + 눈결정초
    const curSeason = getSeason();
    const isWinter = (curSeason.name === '겨울');
    // 계절 한정 약초 체크
    const seasonName = curSeason.name;
    const seasonHerbs = {봄:'sakuradew',여름:'sunbloom',가을:'crimsonleaf',겨울:'snowcrystal'};
    const seasonIcons = {봄:'🌸',여름:'🌻',가을:'🍂',겨울:'❄️'};
    const seasonHerbNames = {봄:'벚꽃이슬',여름:'태양꽃',가을:'단풍잎',겨울:'눈결정초'};
    const sHerb = seasonHerbs[seasonName];
    if(sHerb && Math.random() < 0.20){
      addHerb(sHerb, 1);
      showResult(seasonIcons[seasonName]+' '+seasonHerbNames[seasonName]+'×1 발견! ('+seasonName+' 한정)');
      spawnFloat(seasonIcons[seasonName]+' '+seasonHerbNames[seasonName]+'!');
      G.stats.totalGather=(G.stats.totalGather||0)+1;
      checkTitleUpgrade(); checkQuestProgress();
      updateUI(); saveOnTabSwitch(); return;
    }
    if(isWinter){
      // 연꽃못은 겨울에 채집 불가
      if(G.curLoc==='pond' && !G.isNight){
        showResult('❄️ 연꽃이 얼어붙었습니다. 겨울에는 채집할 수 없어요!', true);
        G.energy+=cost; return;
      }
      // 일반 약초 겨울 패널티 (수지/이끼 제외)
      if(L.item!=='resin' && L.item!=='moss'){
        if(Math.random() < 0.5){
          showResult('❄️ 겨울 한파로 채집량이 없습니다. (수지/이끼는 겨울에도 가능)');
          G.stats.totalGather=(G.stats.totalGather||0)+1;
          updateUI(); return;
        }
      }
    }
    // 밤 분기: 야간 전용 약초 채집
    if(G.isNight && L.nItem){
      const nightAmt = Math.floor(Math.random()*2)+1;
      addHerb(L.nItem, nightAmt);
      G.stats.totalGather=(G.stats.totalGather||0)+1;
      checkTitleUpgrade();
      showResult('🌙 '+iN(L.nItem)+'×'+nightAmt+' 채집! (야간 전용)');
      spawnFloat('🌙 '+iN(L.nItem)+'×'+nightAmt);
      if(Math.random()<0.3) showBabaComment('"밤에만 깨어나는 식물들... 달빛이 허락한 거야."');
      checkQuestProgress(); updateUI(); saveOnTabSwitch(); return;
    }
    // HP 디버프: Vitality 50% 이하면 채집량 감소
    const hpPct=(G.hp||G.maxHp)/G.maxHp;
    const hpDebuff=hpPct<0.5?(hpPct<0.2?0.4:0.7):1.0;
    const raw=Math.max(1,Math.floor((Math.floor(Math.random()*3)+1+(G.upg.gatherBonus||0))*hpDebuff));
    const bonus=W.gatherBonus?W.gatherBonus:1;
    const n=Math.max(1,Math.round(raw*bonus));
    addHerb(L.item,n);
    G.stats.totalGather=(G.stats.totalGather||0)+n;
    if(!G.herbCollected)G.herbCollected={};
      if(G.herbCollected.lubelily===undefined)G.herbCollected.lubelily=0;
      if(G.herbCollected.rustcap===undefined)G.herbCollected.rustcap=0;
      if(G.herbCollected.voltcreep===undefined)G.herbCollected.voltcreep=0;
    G.herbCollected[L.item]=(G.herbCollected[L.item]||0)+n;
    checkHerbUnlock();
    showResult(iN(L.item)+'×'+n+' 채집!');
    spawnFloat(iN(L.item)+'×'+n);
    if(Math.random()<0.3) showBabaComment(getBabaComment(G.curLoc,false,false));
    tryGoldenHerb();
    checkQuestProgress(); updateUI(); saveOnTabSwitch(); return;
  }
}

