// ╔══════════════════════════════════════════════════════╗
// ║  game-advanced.js                                     ║
// ║  약초사의 비밀정원 — 심화 시스템2                            ║
// ║                                                      ║
// ║  포함: TITLE/ACHIEVEMENT, WEAPON/ARMOR/ACCESSORY,
// ╚══════════════════════════════════════════════════════╝

const PLAYER_TITLES = [
  {
    id:'beginner', rank:1,
    title:'잡초 뽑는 초보',
    eng:'Garden Cleaner',
    icon:'🌱',
    desc:'정원에 첫 발을 내딛었다.',
    check:()=>true, // 항상 시작 칭호
  },
  {
    id:'brewer', rank:2,
    title:'어설픈 조제사',
    eng:'Clumsy Brewer',
    icon:'🌿',
    desc:'약초를 20번 채집하고 물약을 처음 만들었다.',
    check:()=>(G.stats&&G.stats.totalGather>=20)||(G.potions&&G.potions>=1),
  },
  {
    id:'chronicler', rank:3,
    title:'비밀정원의 기록자',
    eng:'Secret Garden Chronicler',
    icon:'📖',
    desc:'도감 5종 이상을 해금하고 연구를 시작했다.',
    check:()=>(G.herbUnlockCount||0)+(G.mineCodexUnlocked&&G.mineCodexUnlocked.length||0)>=5,
  },
  {
    id:'ignispartner', rank:4,
    title:'이그니스의 동료',
    eng:'Ignis Companion',
    icon:'🔥',
    desc:'화산섬을 방문하고 이그니스와 협력했다.',
    check:()=>G.ignisMetFlag===true,
  },
  {
    id:'alchemist', rank:5,
    title:'바바의 수석 파트너',
    eng:"Baba Chief Partner",
    icon:'⚗️',
    desc:'비밀 조합을 10가지 이상 발견했다.',
    check:()=>(G.secretCombosFound||0)>=10,
  },
  {
    id:'legend', rank:6,
    title:'전설의 약초사',
    eng:'Legendary Herbalist',
    icon:'👑',
    desc:'Aethel Cataria 전체에 이름을 떨쳤다.',
    check:()=>(G.reputation||0)>=50&&(G.herbUnlockCount||0)>=8,
  },
];

function getCurrentTitle(){
  if(!G.playerTitle) G.playerTitle='beginner';
  const t=PLAYER_TITLES.find(t=>t.id===G.playerTitle);
  return t||PLAYER_TITLES[0];
}

function checkTitleUpgrade(){
  const cur=getCurrentTitle();
  // 현재보다 높은 칭호 중 조건 만족하는 것 찾기
  const upgradable=PLAYER_TITLES
    .filter(t=>t.rank>cur.rank && t.check())
    .sort((a,b)=>b.rank-a.rank); // 가장 높은 것
  if(upgradable.length>0){
    const newTitle=upgradable[0];
    G.playerTitle=newTitle.id;
    // 칭호 획득 알림
    showTitleAlert(newTitle);
    // 업적에 기록
    if(!G.earnedTitles)G.earnedTitles=[];
    if(!G.earnedTitles.includes(newTitle.id)){
      G.earnedTitles.push(newTitle.id);
    }
    return true;
  }
  return false;
}

function showTitleAlert(titleObj){
  // 기존 알림 제거
  const old=document.getElementById('title-alert');
  if(old)old.remove();

  const el=document.createElement('div');
  el.id='title-alert';
  el.style.cssText=[
    'position:fixed','top:80px','left:50%','transform:translateX(-50%) translateY(-20px)',
    'z-index:400','background:linear-gradient(135deg,#2a1a08,#3d2810)',
    'border:2px solid var(--gold)','border-radius:14px','padding:14px 20px',
    'text-align:center','box-shadow:0 8px 30px rgba(0,0,0,.6)',
    'animation:titleSlideIn .5s ease forwards','max-width:300px','width:90%'
  ].join(';');
  el.innerHTML=[
    '<div style="font-size:.68rem;color:rgba(212,168,48,.7);letter-spacing:.15em;margin-bottom:4px">✨ 칭호 획득 ✨</div>',
    '<div style="font-size:2rem;margin-bottom:6px">'+titleObj.icon+'</div>',
    '<div style="font-family:Cinzel,serif;font-size:1rem;color:var(--gold2);margin-bottom:3px">'+titleObj.title+'</div>',
    '<div style="font-size:.7rem;color:var(--parch2);font-style:italic">'+titleObj.eng+'</div>',
    '<div style="font-size:.72rem;color:var(--parch2);margin-top:6px;line-height:1.5">'+titleObj.desc+'</div>',
  ].join('');
  document.body.appendChild(el);

  // 3초 후 사라짐
  setTimeout(function(){
    el.style.animation='titleFadeOut .5s ease forwards';
    setTimeout(function(){el.remove();},500);
  },3500);

  // 헤더 타이틀도 갱신
  updateTitleDisplay();
}

function updateTitleDisplay(){
  const t=getCurrentTitle();
  // 헤더 칭호 뱃지
  let badge=document.getElementById('player-title-badge');
  if(!badge){
    badge=document.createElement('span');
    badge.id='player-title-badge';
    badge.style.cssText='font-size:.65rem;color:var(--gold2);background:rgba(184,137,26,.15);border:1px solid rgba(200,150,42,.3);border-radius:8px;padding:2px 7px;margin-left:4px;white-space:nowrap;';
    const title=document.getElementById('main-title');
    if(title)title.parentNode.insertBefore(badge,title.nextSibling);
  }
  badge.textContent=t.icon+' '+t.title;
}

// 조합 성공 시 성취감 연출
function showComboCelebration(recipe){
  // 황금 파티클
  for(let i=0;i<8;i++){
    setTimeout(function(){spawnFloat(['✨','🌟','💫','⭐'][Math.floor(Math.random()*4)]);},i*150);
  }
  // 비밀 조합 카운트
  if(!G.secretCombosFound)G.secretCombosFound=0;
  G.secretCombosFound++;
  // 칭호 체크
  checkTitleUpgrade();
  // 연금술 탭에 특별 기록
  if(!G.discoveredCombos)G.discoveredCombos=[];
  if(!G.discoveredCombos.includes(recipe.id)){
    G.discoveredCombos.push(recipe.id);
    log('[발견] 새 비밀 조합: '+recipe.name+'!');
  }
}

// checkAchievement 함수 (요청대로)
function checkAchievement(){
  checkTitleUpgrade();
  // 퀘스트 체크
  if(typeof checkQuestProgress==='function') checkQuestProgress();
  // 업적 체크
  if(typeof ENDINGS!=='undefined'){
    ENDINGS.forEach(function(e){
      if(!G.endings.includes(e.id)){
        if(e.check&&e.check()){
          if(typeof showEnding==='function') showEnding(e.id);
        }
      }
    });
  }
}

// ══ WEAPON/ARMOR/ACCESSORY SYSTEM ══

// ── 이그니스 축복 옵션 ──
const IGNIS_BLESSINGS = [
  {id:'fire_atk',    name:'화염의 분노',  icon:'🔥', desc:'공격력 +5',           effect:{atk:5}},
  {id:'sharp',       name:'예리함',       icon:'⚔️', desc:'크리티컬 확률 +10%',  effect:{crit:10}},
  {id:'sturdy',      name:'견고함',       icon:'🛡️', desc:'방어력 +3',           effect:{def:3}},
  {id:'swift',       name:'신속',         icon:'💨', desc:'선제 공격 확률 +15%', effect:{speed:15}},
  {id:'volcanic',    name:'화산의 심장',  icon:'🌋', desc:'화염 데미지 +8',      effect:{fireDmg:8}},
  {id:'blessed',     name:'이그니스의 총애',icon:'✨',desc:'모든 능력치 +2',      effect:{all:2}},
];

// ── 무기 정의 ──

// ── 이그니스 정제 의뢰 데이터 ──
const IGNIS_REFINE_REQUESTS = [
  {id:'req_purified',   mat:'purified',   amt:2, need:{herb:5},         icon:'🌿', matName:'정제 약초',    needDesc:'약초 ×5'},
  {id:'req_crystal',    mat:'crystal',    amt:1, need:{shroom:3},       icon:'🔥', matName:'화염 크리스탈', needDesc:'버섯 ×3'},
  {id:'req_moonstone',  mat:'moonstone',  amt:1, need:{lotus:3},        icon:'🌙', matName:'달빛석',       needDesc:'연꽃 ×3'},
  {id:'req_dragonbone', mat:'dragonbone', amt:1, need:{rare:2},         icon:'🦴', matName:'용골 분말',    needDesc:'희귀초 ×2'},
  {id:'req_voidmoss',   mat:'voidmoss',   amt:1, need:{moss:4},         icon:'🌑', matName:'심연 이끼',    needDesc:'이끼 ×4'},
  {id:'req_starresin',  mat:'starresin',  amt:1, need:{resin:3,rare:1}, icon:'⭐', matName:'별빛 수지',    needDesc:'수지 ×3 + 희귀초 ×1'},
];

function ignisAcceptRefine(reqId){
  const req = IGNIS_REFINE_REQUESTS.find(r=>r.id===reqId);
  if(!req) return;
  // 재료 보유 확인
  for(const [k,v] of Object.entries(req.need)){
    if((G.herbs[k]||0) < v){
      showResult('재료가 부족합니다! ('+req.needDesc+' 필요)', true);
      return;
    }
  }
  // 재료 차감
  for(const [k,v] of Object.entries(req.need)){
    G.herbs[k] = (G.herbs[k]||0) - v;
  }
  // 정제 재료 지급
  if(!G.refined) G.refined = {};
  G.refined[req.mat] = (G.refined[req.mat]||0) + req.amt;
  showResult(req.icon+' '+req.matName+' ×'+req.amt+' 획득!');
  spawnFloat(req.icon+' +'+req.amt);
  log('[이그니스] 정제 의뢰 완료: '+req.matName+' ×'+req.amt);
  renderIgnisForge();
  updateUI();
}

const WEAPONS = [
  {id:'rusty_dagger', name:'녹슨 단검',    icon:'🗡️', atk:5,  cost:{refined:'purified',amt:1,bronze:20},
   desc:'오래됐지만 아직 쓸만한 단검', tier:1},
  {id:'flame_sword',  name:'화염검',       icon:'⚔️', atk:12, cost:{refined:'crystal',amt:1,bronze:50},
   desc:'이그니스가 만든 불꽃이 깃든 검', tier:2},
  {id:'moon_blade',   name:'달빛 단검',    icon:'🌙', atk:9,  cost:{refined:'moonstone',amt:1,bronze:40},
   desc:'달빛을 담아 제련한 얇은 단검', tier:2},
  {id:'dragon_lance', name:'용골 창',      icon:'🏹', atk:18, cost:{refined:'dragonbone',amt:2,bronze:80},
   desc:'용의 뼈로 만든 강력한 창', tier:3},
  {id:'star_blade',   name:'별빛 대검',    icon:'🌟', atk:25, cost:{refined:'starresin',amt:1,bronze:120},
   desc:'별빛 수지를 주입한 전설의 대검', tier:4},
];

// ── 방어구 정의 (Harvest Village) ──
const ARMORS = [
  {id:'leather_vest',  name:'가죽 조끼',    icon:'🥼', def:5,  price:30,  friendLv:0,
   desc:'기본적인 가죽 방어구'},
  {id:'iron_plate',    name:'철제 흉갑',    icon:'🦺', def:12, price:80,  friendLv:1,
   desc:'든든한 철제 방어구'},
  {id:'herb_coat',     name:'약초사 코트',  icon:'🧥', def:8,  price:60,  friendLv:1,
   desc:'약초사를 위한 특별 코트. 채집 효율 +5%'},
  {id:'crystal_armor', name:'크리스탈 갑옷',icon:'💎', def:20, price:150, friendLv:2,
   desc:'크리스탈로 강화된 고급 갑옷'},
  {id:'shadow_cloak',  name:'그림자 망토',  icon:'🌑', def:15, price:120, friendLv:3,
   desc:'한정판. 도망 성공률 +30%'},
];

// ── 악세서리 정의 (비밀 조합) ──
const ACCESSORIES = [
  {id:'herb_ring',    name:'약초 반지',     icon:'💍', effect:{gather:1},    combo:['herb','lotus'],
   desc:'채집량 +1'},
  {id:'crystal_orb',  name:'크리스탈 구슬',icon:'🔮', effect:{rare:15},     combo:['rare','shroom'],
   desc:'희귀초 발견 +15%'},
  {id:'flame_amulet', name:'화염 부적',     icon:'🔴', effect:{fireDmg:5},   combo:['voltcreep','rustcap'],
   desc:'화염 데미지 +5'},
  {id:'moon_pendant', name:'달빛 목걸이',  icon:'🌙', effect:{heal:10},     combo:['lotus','moss'],
   desc:'자연 회복 +10%'},
  {id:'thunder_ring', name:'번개 반지',    icon:'⚡', effect:{crit:20},     combo:['voltcreep','rare'],
   desc:'크리티컬 +20%'},
];

// ── Harvest Village 상인 친밀도 ──
const VILLAGE_MERCHANTS = [
  {id:'blacksmith', name:'대장장이 루크',  icon:'⚒️',
   greetings:[
     '"처음 오셨군요. 우리 마을에 오신 걸 환영합니다."',
     '"자주 오시는군요! 좋은 물건 따로 빼놨어요."',
     '"이제 단골이시네요. 특별 할인 드릴게요!"',
     '"오랜 친구처럼 반갑습니다! 비밀 재고 보여드릴게요."',
   ]},
  {id:'merchant',  name:'상인 미아',      icon:'🛒',
   greetings:[
     '"어서오세요! 오늘은 뭘 찾고 계신가요?"',
     '"또 오셨네요! 좋은 눈 가지셨어요."',
     '"단골 고객님! 오늘 특가 있어요."',
     '"진짜 VIP 고객님이세요. 창고 물건도 봐드릴게요!"',
   ]},
];

// ── 이그니스 무기 제련 함수 ──
function ignisForgeWeapon(weaponId){
  const W=WEAPONS.find(w=>w.id===weaponId);
  if(!W){showResult('알 수 없는 무기입니다.',true);return;}
  if(!G.ignisMetFlag){showResult('먼저 화산섬을 방문하세요!',true);return;}
  // 재료 확인
  const cost=W.cost;
  if(!G.refined) G.refined={};
  if((G.refined[cost.refined]||0)<cost.amt){
    showResult('재료가 부족합니다! '+cost.refined+' ×'+cost.amt+' 필요',true);return;
  }
  if(totalNyang()<cost.bronze){
    showResult('냥코인이 부족합니다! '+cost.bronze+'₦ 필요',true);return;
  }
  // 재료 차감
  G.refined[cost.refined]-=cost.amt;
  if(!deductNyang(cost.bronze)){showResult('냥코인이 부족합니다!',true);return;}
  // 랜덤 축복 옵션 부여!
  const blessing=IGNIS_BLESSINGS[Math.floor(Math.random()*IGNIS_BLESSINGS.length)];
  const weapon={...W, blessing, forgedDay:G.day};
  if(!G.weapons)G.weapons=[];
  G.weapons.push(weapon);
  // 결과 표시
  showResult('⚔️ '+W.name+' 제련! 축복: '+blessing.name+' ('+blessing.desc+')');
  spawnFloat('⚔️ '+W.icon+' 제련 완료!');
  // 이그니스 대사
  const ignisSays=[
    '"이번엔 '+blessing.name+' 옵션이 붙었군. 운이 좋은 편이야."',
    '"'+blessing.icon+' '+blessing.name+'... 불이 원했던 것 같아."',
    '"이 무기, 아끼게 될 거야. 내가 보장해."',
  ];
  if(typeof showBabaComment==='function')
    showBabaComment(ignisSays[Math.floor(Math.random()*ignisSays.length)]);
  updateUI();
  log('[제련] '+W.name+' | 축복: '+blessing.name);
}

// ── Harvest Village 방어구 구매 ──
function buyVillageArmor(armorId){
  const A=ARMORS.find(a=>a.id===armorId);
  if(!A){showResult('알 수 없는 아이템입니다.',true);return;}
  const friendLv=G.villageFriendship||0;
  if(friendLv<A.friendLv){
    showResult('친밀도가 부족합니다! (현재 Lv.'+friendLv+' / 필요 Lv.'+A.friendLv+')',true);return;
  }
  // 친밀도에 따른 할인
  const discount=Math.min(0.3, friendLv*0.08); // 최대 30%
  const finalPrice=Math.max(1,Math.floor(A.price*(1-discount)));
  if(totalNyang()<finalPrice){
    showResult('냥코인이 부족합니다! '+finalPrice+'₦ 필요'+(discount>0?' ('+Math.round(discount*100)+'% 할인됨)':''),true);return;
  }
  if(!deductNyang(finalPrice)){showResult('냥코인이 부족합니다!',true);return;}
  if(!G.armors)G.armors=[];
  G.armors.push({...A, boughtDay:G.day});
  // 친밀도 증가
  G.villageFriendship=(G.villageFriendship||0)+1;
  const merchant=VILLAGE_MERCHANTS[Math.floor(Math.random()*VILLAGE_MERCHANTS.length)];
  const lv=Math.min(3,G.villageFriendship);
  const greeting=merchant.greetings[lv]||merchant.greetings[0];
  showResult(A.icon+' '+A.name+' 구매! ('+finalPrice+'₦)');
  spawnFloat(A.icon+' 구매 완료!');
  if(typeof showBabaComment==='function')
    showBabaComment(merchant.icon+' '+merchant.name+': '+greeting);
  updateUI();
  log('[마을] '+A.name+' 구매 | 친밀도 Lv.'+G.villageFriendship);
}

// ── 악세서리 제작 (비밀 조합에서) ──
function craftAccessory(accId){
  const ACC=ACCESSORIES.find(a=>a.id===accId);
  if(!ACC)return;
  // 재료 확인
  for(const herbId of ACC.combo){
    const have=(G.herbs&&G.herbs[herbId])||0;
    if(have<2){showResult('재료 부족! '+herbId+' ×2 필요',true);return;}
  }
  // 재료 차감
  ACC.combo.forEach(h=>{if(G.herbs[h])G.herbs[h]=Math.max(0,G.herbs[h]-2);});
  if(!G.accessories)G.accessories=[];
  G.accessories.push({...ACC, craftedDay:G.day});
  showResult('💍 '+ACC.name+' 제작 완료! '+ACC.desc);
  spawnFloat('💍 '+ACC.icon);
  updateUI();
}

// ── 장착 무기/방어구 효과 적용 ──
function getEquippedStats(){
  const stats={atk:0,def:0,fireDmg:0,crit:0,speed:0};
  // 장착 무기
  if(G.equippedWeapon){
    const w=G.weapons&&G.weapons.find(w=>w.id===G.equippedWeapon);
    if(w){
      stats.atk+=w.atk||0;
      if(w.blessing&&w.blessing.effect){
        Object.entries(w.blessing.effect).forEach(([k,v])=>{
          if(k==='all'){Object.keys(stats).forEach(sk=>stats[sk]+=v);}
          else if(k in stats){stats[k]+=v;}
        });
      }
    }
  }
  // 장착 방어구
  if(G.equippedArmor){
    const a=G.armors&&G.armors.find(a=>a.id===G.equippedArmor);
    if(a) stats.def+=a.def||0;
  }
  return stats;
}

function battle2Action(type){
  if(!curBattle2) return;
  const mob = curBattle2;

  if(type === 'attack'){
    const eStats = getEquippedStats();
    const baseAtk = 8 + Math.floor(Math.random()*8) + (eStats.atk||0);
    const isCrit = Math.random()*100 < (eStats.crit||0);
    const dmg = isCrit ? Math.floor(baseAtk*1.8) : baseAtk;
    if(mob.nextAction === 'defend'){
      mob.curHp = Math.max(0, mob.curHp - Math.max(1, Math.floor(dmg*0.5)));
    } else {
      mob.curHp = Math.max(0, mob.curHp - dmg);
    }
    const critTxt = isCrit ? ' 💥 크리티컬!' : '';
    addBattleLog('attack', '⚔️ ' + dmg + ' 데미지!' + critTxt + ' ' + getBattleComment('attack'));
    if(mob.curHp > 0){
      const edef = eStats.def||0;
      const mobDmg = Math.max(1, Math.floor(mob.atk*(0.8+Math.random()*0.4)) - edef);
      G.battleHp = Math.max(0, (G.battleHp||100) - mobDmg);
      updateBattleHpBar();
      addBattleLog('mob_atk', '💥 적이 ' + mobDmg + ' 피해! (방어력 ' + edef + ' 적용) ' + getBattleComment('mob_atk'));
      shakeBattleScreen();
    }
    mobNextAction = rollMobAction();
    curBattle2.turn++;
    updateBattle2UI();
    if(mob.curHp <= 0) setTimeout(handleBattle2Win, 500);
    else if(G.battleHp <= 0) setTimeout(handleBattle2Lose, 500);

  } else if(type === 'defend'){
    addBattleLog('defend', '🛡️ 방어 태세를 취합니다! ' + getBattleComment('defend'));
    curBattle2.turn++;
    updateBattle2UI();

  } else if(type === 'analyze'){
    curBattle2.analyzed = true;
    curBattle2.weakRevealed = true;
    addBattleLog('analyze', '🔍 적의 약점을 파악했습니다! ' + getBattleComment('analyze'));
    curBattle2.turn++;
    updateBattle2UI();

  } else if(type === 'flee'){
    addBattleLog('flee', '💨 전투에서 도망칩니다! ' + getBattleComment('flee'));
    setTimeout(closeBattle2, 800);
  }
}

// ══ IGNIS FORGE UI ══
function renderIgnisForge(){
  const sec = document.getElementById('ignis-forge-section2');
  if(!sec) return;
  sec.innerHTML = '';

  // 현재 보유 정제 재료 표시
  const matDiv = document.createElement('div');
  matDiv.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:12px';
  const matNames = {purified:'정제약초',crystal:'화염크리스탈',moonstone:'달빛석',dragonbone:'용골분말',voidmoss:'심연이끼',starresin:'별빛수지'};
  const matIcons = {purified:'🌿',crystal:'🔥',moonstone:'🌙',dragonbone:'🦴',voidmoss:'🌑',starresin:'⭐'};
  Object.keys(matNames).forEach(function(k){
    const have = (G.refined&&G.refined[k])||0;
    const cell = document.createElement('div');
    cell.style.cssText = 'padding:5px 4px;border-radius:7px;background:rgba(255,255,255,.06);border:1px solid rgba(200,100,40,.2);text-align:center;font-size:.7rem;color:#c09060';
    cell.innerHTML = '<div style="font-size:1.1rem">'+matIcons[k]+'</div><div>'+matNames[k]+'</div><div style="font-weight:700;color:'+(have>0?'#ffcc80':'#886644')+'">×'+have+'</div>';
    matDiv.appendChild(cell);
  });
  sec.appendChild(matDiv);

  // 무기 목록
  const title = document.createElement('div');
  title.style.cssText = 'font-family:Cinzel,serif;font-size:.8rem;color:#d09060;margin-bottom:8px;border-bottom:1px solid rgba(200,100,40,.3);padding-bottom:5px';
  // 상단 제목
  const mainTitle = document.createElement('div');
  mainTitle.style.cssText = 'font-family:Cinzel,serif;font-size:.82rem;color:#ff7030;letter-spacing:.08em;margin-bottom:6px;border-bottom:1px solid #3a1a08;padding-bottom:5px';
  mainTitle.textContent = '⚒️ 제련 의뢰 & 무기 제작';
  sec.appendChild(mainTitle);
  // 정제 의뢰 섹션
  const reqTitle = document.createElement('div');
  reqTitle.style.cssText = 'font-family:Cinzel,serif;font-size:.78rem;color:#ffa040;margin-bottom:6px;border-bottom:1px solid rgba(200,100,40,.2);padding-bottom:4px';
  reqTitle.textContent = '🔬 정제 의뢰 (약초 → 정제 재료)';
  sec.appendChild(reqTitle);
  const herbIcons={herb:'🌿',lotus:'🪷',shroom:'🍄',moss:'🌱',resin:'🫧',rare:'💎'};
  IGNIS_REFINE_REQUESTS.forEach(function(req){
    const haveAll = Object.entries(req.need).every(function([k,v]){return (G.herbs[k]||0)>=v;});
    const rCard = document.createElement('div');
    rCard.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;'
      +'border:1px solid rgba(200,130,40,'+(haveAll?'.5':'.2')+');'
      +'background:rgba(60,30,10,'+(haveAll?'.3':'.12')+');margin-bottom:5px;';
    const needText = Object.entries(req.need).map(function([k,v]){
      const have = G.herbs[k]||0;
      return (herbIcons[k]||'🌿')+' '+have+'/'+v;
    }).join('  ');
    rCard.innerHTML = '<span style="font-size:1.4rem">'+req.icon+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-size:.78rem;color:#f0c080">'+req.matName+'</div>'
      +'<div style="font-size:.65rem;color:'+(haveAll?'#a0d080':'#886644')+'">필요: '+needText+'</div>'
      +'</div>';
    if(haveAll){
      const rb = document.createElement('button');
      rb.style.cssText = 'padding:5px 10px;border-radius:7px;border:1px solid #c08040;background:rgba(180,100,30,.3);color:#f0c080;font-size:.72rem;cursor:pointer;flex-shrink:0';
      rb.textContent = '의뢰 수락';
      (function(rid){rb.onclick=function(){ignisAcceptRefine(rid);};})(req.id);
      rCard.appendChild(rb);
    }
    sec.appendChild(rCard);
  });

  const subTxt = document.createElement('div');
  subTxt.style.cssText = 'font-size:.72rem;color:#a07040;margin-bottom:10px;margin-top:10px';
  subTxt.textContent = '정제 재료를 이용해 무기를 제작하세요!';
  sec.appendChild(subTxt);
  title.textContent = '⚔️ 무기 제련 목록';
  sec.appendChild(title);

  WEAPONS.forEach(function(W){
    const cost = W.cost;
    if(!G.refined) G.refined={};
    const haveRef = G.refined[cost.refined] || 0;
    const hasRef = haveRef >= cost.amt;
    const nyangTotal = totalNyang();
    const hasGold = nyangTotal >= cost.bronze;
    const canForge = hasRef && hasGold;
    const matIc = matIcons[cost.refined]||'🔥';
    const matName = matNames[cost.refined]||cost.refined;
    const refColor = haveRef >= cost.amt ? '#ffcc80' : '#ff6644';

    const card = document.createElement('div');
    card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;'
      +'border:1.5px solid rgba(200,100,40,'+(canForge?'.5':'.2')+');'
      +'background:rgba(90,42,16,'+(canForge?'.3':'.15')+');margin-bottom:7px;';

    const tierStars = '★'.repeat(W.tier)+'☆'.repeat(4-W.tier);
    const nyangColor = nyangTotal >= cost.bronze ? '#ffcc80' : '#ff6644';
    card.innerHTML = '<span style="font-size:2rem;flex-shrink:0">'+W.icon+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-family:Cinzel,serif;font-size:.85rem;color:#f0c080">'+W.name+'</div>'
      +'<div style="font-size:.65rem;color:#a07040;margin-top:1px">'+tierStars+' | 공격+'+W.atk+'</div>'
      +'<div style="font-size:.68rem;margin-top:3px">'
        +'<span style="color:'+refColor+'">'+matIc+' '+matName+' '+haveRef+'/'+cost.amt+'</span>'
        +' <span style="color:#666;margin:0 2px">·</span>'
        +'<span style="color:'+nyangColor+'">🪙 '+nyangTotal+'/'+cost.bronze+'₦</span>'
      +'</div>'
      +'<div style="font-size:.63rem;color:#ffcc60;font-style:italic;margin-top:2px">✨ 제련 시 랜덤 축복 부여!</div>'
      +'</div>';

    if(canForge){
      const btn = document.createElement('button');
      btn.style.cssText = 'padding:7px 12px;border-radius:8px;border:1px solid #c08040;background:rgba(180,100,30,.3);color:#f0c080;font-size:.75rem;cursor:pointer;flex-shrink:0';
      btn.textContent = '제련';
      (function(wid){btn.onclick = function(){ignisForgeWeapon(wid);renderIgnisForge();};})(W.id);
      card.appendChild(btn);
    } else {
      const lock = document.createElement('span');
      lock.style.cssText = 'font-size:.7rem;color:#664422;flex-shrink:0';
      lock.textContent = !hasRef?'재료부족':'냥부족';
      card.appendChild(lock);
    }
    sec.appendChild(card);
  });

  // 보유 무기 목록
  if(G.weapons && G.weapons.length > 0){
    const myTitle = document.createElement('div');
    myTitle.style.cssText = 'font-family:Cinzel,serif;font-size:.8rem;color:#d09060;margin:12px 0 8px;border-bottom:1px solid rgba(200,100,40,.3);padding-bottom:5px';
    myTitle.textContent = '🗡️ 보유 무기';
    sec.appendChild(myTitle);
    G.weapons.forEach(function(W,i){
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;'
        +'border:1.5px solid rgba(200,100,40,.4);background:rgba(90,42,16,.2);margin-bottom:6px;';
      const isEquipped = G.equippedWeapon===W.id+'_'+i;
      card.innerHTML = '<span style="font-size:1.8rem">'+W.icon+'</span>'
        +'<div style="flex:1">'
        +'<div style="font-family:Cinzel,serif;font-size:.82rem;color:#f0c080">'+W.name+'</div>'
        +'<div style="font-size:.68rem;color:#ffcc60;margin-top:2px">'+W.blessing.icon+' '+W.blessing.name+' — '+W.blessing.desc+'</div>'
        +'<div style="font-size:.65rem;color:#a07040">공격력 '+(W.atk+(W.blessing.effect.atk||0)+((W.blessing.effect.all||0)))+'</div>'
        +'</div>';
      const equipBtn = document.createElement('button');
      equipBtn.style.cssText = 'padding:5px 10px;border-radius:7px;border:1px solid '+(isEquipped?'#60cc60':'#c08040')+';background:'+(isEquipped?'rgba(60,120,60,.3)':'rgba(180,100,30,.2)')+';color:'+(isEquipped?'#80ff80':'#f0c080')+';font-size:.72rem;cursor:pointer;flex-shrink:0';
      equipBtn.textContent = isEquipped?'장착중':'장착';
      (function(uid){equipBtn.onclick = function(){G.equippedWeapon=uid;renderIgnisForge();spawnFloat('⚔️ 장착!');updateUI();};})(W.id+'_'+i);
      card.appendChild(equipBtn);
      sec.appendChild(card);
    });
  }
}

// ══ ACCESSORY CRAFT UI ══
function renderAccCraft(){
  const list = document.getElementById('acc-craft-list');
  if(!list) return;
  list.innerHTML = '';

  const herbIcons = {herb:'🌿',lotus:'🪷',shroom:'🍄',moss:'🪨',resin:'🌳',rare:'💎',
    bramble:'🌑',lubelily:'🌼',rustcap:'🍄',voltcreep:'⚡'};
  const herbNames = {herb:'약초',lotus:'수초',shroom:'버섯',moss:'이끼',resin:'수지',rare:'희귀초',
    bramble:'통곡의 덩굴',lubelily:'윤활유 꽃',rustcap:'고철 버섯',voltcreep:'감전 덩굴풀'};

  ACCESSORIES.forEach(function(ACC){
    // 재료 확인
    const canCraft = ACC.combo.every(function(h){
      const have = (G.herbs&&G.herbs[h])||0;
      return have >= 2;
    });
    // 이미 보유 중인지
    const owned = G.accessories && G.accessories.some(function(a){return a.id===ACC.id;});

    const card = document.createElement('div');
    card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:10px;'
      +'border:1.5px solid '+(owned?'var(--gold)':canCraft?'var(--moss)':'var(--parch3)')+';'
      +'background:'+(owned?'rgba(184,137,26,.08)':canCraft?'rgba(74,122,50,.06)':'var(--parch2)')+';margin-bottom:8px;';

    const comboStr = ACC.combo.map(function(h){
      return (herbIcons[h]||'🌿')+(herbNames[h]||h)+'×2';
    }).join(' + ');

    card.innerHTML = '<span style="font-size:2rem;flex-shrink:0">'+ACC.icon+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-family:Cinzel,serif;font-size:.85rem;color:var(--ink)">'+ACC.name+'</div>'
      +'<div style="font-size:.7rem;color:var(--ink2);margin-top:2px">'+ACC.desc+'</div>'
      +'<div style="font-size:.65rem;color:var(--moss);margin-top:3px">재료: '+comboStr+'</div>'
      +'</div>';

    if(owned){
      const equip = document.createElement('button');
      const isEq = G.equippedAccessory===ACC.id;
      equip.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid '+(isEq?'var(--moss)':'var(--gold)')+';'
        +'background:'+(isEq?'rgba(74,122,50,.15)':'rgba(184,137,26,.1)')+';'
        +'font-size:.72rem;color:'+(isEq?'var(--moss)':'var(--gold2)')+';cursor:pointer;flex-shrink:0';
      equip.textContent = isEq?'장착중':'장착';
      (function(aid){equip.onclick = function(){
        G.equippedAccessory = isEq?null:aid;
        renderAccCraft();
        spawnFloat(ACC.icon+' '+(isEq?'해제':'장착')+'!');
        updateUI();
      };})(ACC.id);
      card.appendChild(equip);
    } else if(canCraft){
      const btn = document.createElement('button');
      btn.style.cssText = 'padding:6px 12px;border-radius:8px;border:1px solid var(--moss);background:rgba(74,122,50,.1);font-size:.75rem;color:var(--moss);cursor:pointer;flex-shrink:0';
      btn.textContent = '제작';
      (function(aid){btn.onclick = function(){craftAccessory(aid);renderAccCraft();};})(ACC.id);
      card.appendChild(btn);
    } else {
      const lock = document.createElement('span');
      lock.style.cssText = 'font-size:.68rem;color:var(--ink2);flex-shrink:0';
      lock.textContent = '재료부족';
      card.appendChild(lock);
    }
    list.appendChild(card);
  });

  // 보유 악세서리 없으면 안내
  if(!G.accessories||G.accessories.length===0){
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:10px;font-size:.78rem;color:var(--ink2);font-style:italic';
    empty.textContent = '아직 제작한 악세서리가 없어요.';
    list.insertBefore(empty, list.firstChild);
  }
}

// ══ HARVEST VILLAGE ══
function showHarvestVillage(){
  const ov=document.getElementById('village-overlay');
  if(ov){ov.classList.add('show');renderVillageShop();return;}
  // 오버레이 동적 생성
  const div=document.createElement('div');
  div.id='village-overlay';
  div.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(10,6,2,.95);flex-direction:column;overflow-y:auto;';
  div.innerHTML=`
    <div style="background:linear-gradient(180deg,#1a3010,#2a4a18);padding:16px;text-align:center;border-bottom:2px solid #4a8a28">
      <div style="font-size:2.5rem;margin-bottom:4px">🏘️</div>
      <div style="font-family:Cinzel,serif;font-size:1.1rem;color:#c0e880">Harvest Village</div>
      <div style="font-size:.75rem;color:rgba(192,232,128,.6);margin-top:3px">약초사들의 교역 마을</div>
      <div style="font-size:.72rem;color:#80aa60;margin-top:5px">친밀도 Lv.<span id="v-friend-lv">0</span> | 할인율 <span id="v-discount">0</span>%</div>
    </div>
    <div style="padding:14px" id="village-shop-content"></div>
    <div style="padding:0 14px 16px">
      <button onclick="closeHarvestVillage()" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid #4a8a28;background:rgba(60,100,30,.2);color:#c0e880;font-family:'Nanum Myeongjo',serif;font-size:.9rem;cursor:pointer">
        🚶 마을을 떠나기
      </button>
    </div>
  `;
  document.body.appendChild(div);
  div.classList.add('show');
  renderVillageShop();
}

function renderVillageShop(){
  const content=document.getElementById('village-shop-content');
  if(!content)return;
  const lv=G.villageFriendship||0;
  const discount=Math.min(30,lv*8);
  const lvEl=document.getElementById('v-friend-lv');
  const dcEl=document.getElementById('v-discount');
  if(lvEl)lvEl.textContent=lv;
  if(dcEl)dcEl.textContent=discount;
  content.innerHTML='';

  // 상인 인사
  const merchant=VILLAGE_MERCHANTS[0];
  const greeting=merchant.greetings[Math.min(3,lv)]||merchant.greetings[0];
  const greetDiv=document.createElement('div');
  greetDiv.style.cssText='display:flex;align-items:center;gap:10px;padding:12px;border-radius:10px;background:rgba(60,100,30,.15);border:1px solid rgba(100,160,50,.3);margin-bottom:14px';
  greetDiv.innerHTML='<span style="font-size:1.8rem">'+merchant.icon+'</span>'
    +'<div><div style="font-family:Cinzel,serif;font-size:.82rem;color:#c0e880">'+merchant.name+'</div>'
    +'<div style="font-size:.78rem;color:rgba(192,232,128,.7);margin-top:3px;font-style:italic">'+greeting+'</div></div>';
  content.appendChild(greetDiv);

  // 방어구 목록
  const title=document.createElement('div');
  title.style.cssText='font-family:Cinzel,serif;font-size:.8rem;color:#c0e880;margin-bottom:10px;border-bottom:1px solid rgba(100,160,50,.3);padding-bottom:5px';
  title.textContent='🛡️ 방어구 상점';
  content.appendChild(title);

  ARMORS.forEach(function(A){
    const finalPrice=Math.max(1,Math.floor(A.price*(1-discount/100)));
    const canBuy=totalNyang()>=finalPrice;
    const locked=lv<A.friendLv;
    const owned=G.armors&&G.armors.some(function(a){return a.id===A.id;});
    const card=document.createElement('div');
    card.style.cssText='display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:10px;'
      +'border:1.5px solid '+(owned?'#4a8a28':locked?'rgba(100,160,50,.15)':'rgba(100,160,50,.4)')+';'
      +'background:'+(owned?'rgba(60,100,30,.2)':'rgba(20,40,10,.3)')+';margin-bottom:8px;'
      +'opacity:'+(locked?'.5':'1');
    card.innerHTML='<span style="font-size:2rem">'+A.icon+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-family:Cinzel,serif;font-size:.85rem;color:#c0e880">'+A.name+'</div>'
      +'<div style="font-size:.72rem;color:rgba(192,232,128,.6);margin-top:2px">방어력 +'+A.def+' | '+A.desc+'</div>'
      +(locked?'<div style="font-size:.65rem;color:#886644;margin-top:2px">🔒 친밀도 Lv.'+A.friendLv+' 필요</div>':'')
      +(discount>0&&!locked?'<div style="font-size:.65rem;color:#ffcc60;margin-top:2px">'+discount+'% 할인 적용!</div>':'')
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0">'
      +'<div style="font-size:.82rem;color:#c0e880">'+finalPrice+'₦</div>'
      +(A.price!==finalPrice?'<div style="font-size:.65rem;color:#886644;text-decoration:line-through">'+A.price+'₦</div>':'')
      +'</div>';
    if(!locked&&!owned){
      const btn=document.createElement('button');
      btn.style.cssText='padding:6px 10px;border-radius:8px;border:1px solid #4a8a28;background:rgba(60,100,30,.2);color:#c0e880;font-size:.72rem;cursor:pointer;'+(canBuy?'':'opacity:.4;');
      btn.textContent=canBuy?'구매':'냥부족';
      if(canBuy)(function(aid){btn.onclick=function(){buyVillageArmor(aid);renderVillageShop();};})(A.id);
      card.appendChild(btn);
    } else if(owned){
      const isEq=G.equippedArmor===A.id;
      const eBtn=document.createElement('button');
      eBtn.style.cssText='padding:6px 10px;border-radius:8px;border:1px solid '+(isEq?'#80cc40':'#4a8a28')+';background:'+(isEq?'rgba(80,160,30,.25)':'rgba(60,100,30,.1)')+';color:'+(isEq?'#a0ff60':'#c0e880')+';font-size:.72rem;cursor:pointer;';
      eBtn.textContent=isEq?'장착중':'장착';
      (function(aid){eBtn.onclick=function(){G.equippedArmor=isEq?null:aid;renderVillageShop();spawnFloat(A.icon+(isEq?' 해제':' 장착!'));updateUI();};})(A.id);
      card.appendChild(eBtn);
    }
    content.appendChild(card);
  });
}

function closeHarvestVillage(){
  const ov=document.getElementById('village-overlay');
  if(ov){ ov.classList.remove('show'); ov.style.display=''; }
  updateUI();
}

// ══ PROLOGUE SYSTEM ══
var prlStartLoc = 'bloom'; // 선택한 시작 장소
var prlScrolled = false;

function skipIntroLocal(){
  // 로컬 저장 데이터 로드
  if(loadGameLocal()){
    closeIntroAndStart('bloom');
  } else {
    // 저장 없으면 프롤로그 표시
    showPrologue();
  }
}

function showPrologue(){
  var el = document.getElementById('prologue-screen');
  if(el) el.classList.add('show');
  // 순차적 단락 표시
  startPrologueAnimation();
}

function startPrologueAnimation(){
  var paragraphs = document.querySelectorAll('.prl-paragraph');
  var delay = 300;
  paragraphs.forEach(function(p, i){
    setTimeout(function(){
      p.classList.add('visible');
    }, delay + i * 800);
  });
  // 선택 버튼 표시
  setTimeout(function(){
    var choice = document.getElementById('prl-choice');
    if(choice) choice.classList.add('show');
    // 스크롤 힌트 숨김
    var hint = document.getElementById('prl-scroll-hint');
    if(hint) hint.style.display = 'none';
  }, delay + paragraphs.length * 800 + 500);
}

function chooseStart(loc){
  prlStartLoc = loc;
  // 이름 입력창 표시
  var nameArea = document.getElementById('prl-name-area');
  if(nameArea) nameArea.classList.add('show');
  // 선택 버튼 하이라이트
  document.querySelectorAll('.prl-choice-btn').forEach(function(btn){
    btn.style.opacity = '0.45';
    btn.style.transform = 'scale(0.97)';
  });
  var selected = loc === 'pond'
    ? document.querySelector('.prl-choice-btn.water')
    : document.querySelector('.prl-choice-btn.bloom');
  if(selected){
    selected.style.opacity = '1';
    selected.style.transform = 'scale(1.03)';
    selected.style.borderWidth = '2.5px';
    selected.style.boxShadow = '0 0 16px rgba(212,168,48,.4)';
  }
  // 힌트 텍스트 → 선택 완료 안내로 교체
  var hint = document.getElementById('prl-choice-hint');
  var locName = loc === 'pond' ? 'Lunar Lure Lagoon (달빛 달빛라군)' : 'Dreaming Bloom-Beds (꿈꾸는 몽환꽃밭)';
  if(hint) hint.innerHTML = '✅ <b style="color:rgba(212,168,48,.85)">' + locName + '</b> 선택됨<br><span style="color:rgba(180,150,80,.5)">아래에 이름을 입력하면 시작합니다</span>';
  // 이름 입력창으로 스크롤
  setTimeout(function(){
    var nameArea = document.getElementById('prl-name-area');
    if(nameArea) nameArea.scrollIntoView({behavior:'smooth', block:'center'});
    var input = document.getElementById('prl-name-input');
    if(input) input.focus();
  }, 200);
}

function startFromPrologue(){
  var nameInput = document.getElementById('prl-name-input');
  var name = nameInput ? nameInput.value.trim() : '';
  if(!name){ nameInput && nameInput.focus(); return; }

  // 로컬 스토리지에 저장
  G.playerName = name;
  G.charName = name;
  try{ localStorage.setItem('herbcat_name', name); }catch(e){}

  // 프롤로그 닫기
  var el = document.getElementById('prologue-screen');
  if(el){
    el.style.transition = 'opacity 1s ease';
    el.style.opacity = '0';
    setTimeout(function(){ el.classList.remove('show'); el.style.opacity=''; }, 1000);
  }

  // 캐릭터 선택으로 이동 (Firebase 로그인 없이)
  setTimeout(function(){
    // 기존 intro-screen 건너뛰고 바로 char-screen으로
    var intro = document.getElementById('intro-screen');
    if(intro) intro.style.display = 'none';
    // charType이 없으면 선택
    if(!G.charType){
      showCharScreen();
    } else {
      // 저장 데이터 있으면 바로 시작
      closeIntroAndStart(prlStartLoc);
    }
  }, 1200);
}

function showCharScreen(){
  var intro = document.getElementById('intro-screen');
  if(intro) intro.style.display = 'flex';
  var screens = ['intro-title-screen','login-screen'];
  screens.forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  var charScreen = document.getElementById('char-screen');
  if(charScreen) charScreen.style.display = 'block';
}

function closeIntroAndStart(loc){
  // 로컬 저장 데이터 불러오기
  try{
    var saved = localStorage.getItem('herbcat_save');
    if(saved){
      var data = JSON.parse(saved);
      if(data.G) Object.assign(G, data.G);
      else Object.assign(G, data);
    }
  }catch(e){}
  if(typeof patchState==='function') patchState(); // charName 복구
  closeIntro();
  if(loc && typeof setLocation === 'function'){
    setTimeout(function(){ setLocation(loc); }, 500);
  }
  updateTitle();
  updateUI();
  if(typeof initHp==='function') initHp();
  if(typeof startBgm==='function') startBgm();
  if(typeof startAutoSave==='function') startAutoSave();
  if(typeof startNaturalHeal==='function') startNaturalHeal();
}

function skipPrologue(){
  var el = document.getElementById('prologue-screen');
  if(el) el.classList.remove('show');
  // 로컬 데이터 확인
  try{
    var saved = localStorage.getItem('herbcat_save');
    if(saved){
      closeIntroAndStart('bloom');
      return;
    }
  }catch(e){}
  // 저장 데이터 없으면 이름 입력
  var nameInput = prompt('모험가님의 이름을 알려주세요:');
  if(nameInput && nameInput.trim()){
    G.playerName = nameInput.trim();
    G.charName = nameInput.trim();
    showCharScreen();
  }
}

// ══ LOCAL STORAGE SAVE/LOAD (Firebase 대체) ══
function saveGameLocal(){
  try{
    var saveData = JSON.stringify(G);
    localStorage.setItem('herbcat_save', saveData);
    localStorage.setItem('hcsg_save_time', new Date().toISOString());
    log('[자동저장] 로컬 저장 완료');
  }catch(e){
    log('[저장 오류] ' + e.message);
  }
}

function loadGameLocal(){
  try{
    var saved = localStorage.getItem('herbcat_save');
    if(saved){
      var data = JSON.parse(saved);
      // 구형 {G:{...}} 포맷과 신형 {...} 포맷 모두 호환
      if(data.G) Object.assign(G, data.G);
      else Object.assign(G, data);
      return true;
    }
  }catch(e){}
  return false;
}

// AUTO-SAVE every end of day (already called from endDay via updateUI chain)
// Try load on startup
(function tryAutoLoad(){
  // initIntroStars();
})();
