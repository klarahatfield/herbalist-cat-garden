// ╔══════════════════════════════════════════════════════╗
// ║  game-systems.js                                      ║
// ║  약초사의 비밀정원 — 심화 시스템1                            ║
// ║                                                      ║
// ║  포함: SECRET COMBINATION, ACHIEVEMENTS, BATTLE SYSTEM v2 ║
// ╚══════════════════════════════════════════════════════╝

// 약초 10종 정의
const COMBO_HERBS = [
  {id:'herb',     name:'털뭉치 엉겅퀴', icon:'🌿', hint:'채집: 정원 채집'},
  {id:'lotus',    name:'달빛 연꽃',     icon:'🪷', hint:'채집: 라군 채집'},
  {id:'shroom',   name:'태엽 감는 버섯',icon:'🍄', hint:'채집: 버섯밭 채집'},
  {id:'moss',     name:'증기 뿜는 이끼',icon:'🪨', hint:'채집: 언덕 채집'},
  {id:'resin',    name:'(수지류)',       icon:'🌳', hint:'채집: 숲 채집'},
  {id:'rare',     name:'(희귀초)',       icon:'💎', hint:'채집: 정밀탐색'},
  {id:'bramble',  name:'통곡의 덩굴',   icon:'🌑', hint:'채집: 위스커 채집'},
  {id:'lubelily', name:'안갯속 윤활유 꽃',icon:'🌼', hint:'특수: 라군 달빛명상'},
  {id:'rustcap',  name:'녹슨 고철 버섯', icon:'🍄', hint:'특수: 버섯밭 포자채집'},
  {id:'voltcreep',name:'감전되는 덩굴풀',icon:'⚡', hint:'특수: 위스커 감각집중'},
];

// 핵심 조합 레시피 (2개/3개)
const SECRET_RECIPES = [
  // ── 2개 조합 ──
  {
    id:'anti_rust_oint', herbs:['lubelily','bramble'].sort(),
    name:'방청 진통제', icon:'🔧',
    desc:'통증 완화 + 녹 방지. 전투 피해 -30% (3회)',
    effect:'battle_def',
    baba:'"고통과 녹이 합쳐지면 진통제가 된다... 논리적으로 맞는 것 같기도 하고 아닌 것 같기도 하고."',
    sellVal:80,
  },
  {
    id:'maglev_oint', herbs:['lubelily','rare'].sort(),
    name:'자기 부상 연고', icon:'✨',
    desc:'집 다리 관절에 바름. 워킹하우스 이벤트 +15%',
    effect:'walk_bonus',
    baba:'"미끄럽고 자성까지 있으니... 집이 춤을 추기 시작했다."',
    sellVal:120,
  },
  {
    id:'elec_distill', herbs:['voltcreep','moss'].sort(),
    name:'전기 분해 증류액', icon:'💧',
    desc:'이그니스 제련 전용 재료. 정제 시간 -1일',
    effect:'ignis_boost',
    baba:'"전기와 수분의 만남. 실험실에서 시도했다가 머리카락이 전부 곤두섰다."',
    sellVal:150,
  },
  {
    id:'dream_shield', herbs:['lotus','bramble'].sort(),
    name:'꿈의 방패', icon:'🛡️',
    desc:'Vitality 최대치 +15 (영구). 악몽을 막아줌',
    effect:'maxhp_up',
    baba:'"연꽃의 달빛과 통곡의 어둠이 합쳐지면... 완벽한 방어막이 된다. 이론상으로."',
    sellVal:200,
  },
  {
    id:'iron_skin', herbs:['rustcap','resin'].sort(),
    name:'철피 수지', icon:'🦺',
    desc:'채집 시 Vitality 소모 없음 (하루 3회)',
    effect:'gather_nohp',
    baba:'"녹슨 버섯 + 나무 수액 = 갑옷. 내 공식이 맞다면 이게 맞다."',
    sellVal:100,
  },
  {
    id:'spark_tonic', herbs:['voltcreep','lotus'].sort(),
    name:'전기 Vitality제', icon:'⚡',
    desc:'에너지 최대치 +2 (오늘 하루)',
    effect:'energy_today',
    baba:'"마셨더니 눈이 번쩍 뜨였다. 커피? 아니, 이건 번개다."',
    sellVal:90,
  },
  {
    id:'golden_herb', herbs:['rare','herb'].sort(),
    name:'황금 약초 정수', icon:'🌟',
    desc:'모든 물약 제조 시 효율 2배 (1회 사용)',
    effect:'craft_double',
    baba:'"희귀초와 평범한 약초가 만나면... 평범한 것이 빛을 낸다. 철학적이군."',
    sellVal:300,
  },
  {
    id:'ancient_brew', herbs:['resin','shroom'].sort(),
    name:'고대 양조액', icon:'🏺',
    desc:'명성 +10 즉시 획득',
    effect:'rep_up',
    baba:'"이건 몇 백 년 전 레시피인데... 내가 우연히 재현했다. 천재인가?"',
    sellVal:180,
  },
  // ── 3개 조합 ──
  {
    id:'baba_legendary', herbs:['rare','lotus','voltcreep'].sort(),
    name:'바바의 전설 오일', icon:'🌈',
    desc:'HP 전회복 + 에너지 전충전 + 명성 +5',
    effect:'full_restore',
    baba:'"이건... 내가 20년간 찾던 완전 회복제다. 어쩐지 쉽게 만들어졌다 싶더니."',
    sellVal:500,
  },
  {
    id:'rust_lightning', herbs:['rustcap','voltcreep','bramble'].sort(),
    name:'고철 번개 포션', icon:'⚡🍄',
    desc:'전투 공격력 3배 (1회), 하지만 HP -20%',
    effect:'power_attack',
    baba:'"강력하다. 단, 내가 마셨을 때 실험실 벽이 세 군데 무너졌다는 점은 참고할 것."',
    sellVal:250,
  },
  {
    id:'morning_dew', herbs:['moss','lotus','herb'].sort(),
    name:'새벽 이슬 차', icon:'🍵',
    desc:'자연 HP 회복 속도 3배 (다음 하루)',
    effect:'regen_boost',
    baba:'"마시고 나서 10분 동안 기분이 너무 좋아서 정원을 세 바퀴 돌았다. 운동도 됐군."',
    sellVal:130,
  },
  {
    id:'walking_oil', herbs:['lubelily','resin','shroom'].sort(),
    name:'집 활성화 오일', icon:'🏠',
    desc:'워킹하우스 이벤트 당일 100% 발동',
    effect:'walk_today',
    baba:'"집에 발랐더니 집이 춤을 췄다. 기분 좋은 것 같더라. 나도 기분이 좋아졌다."',
    sellVal:200,
  },
  {
    id:'philosopher', herbs:['rare','resin','lotus'].sort(),
    name:'현자의 정수', icon:'🔮',
    desc:'도감 미발견 약초 1개 즉시 힌트 해금',
    effect:'codex_hint',
    baba:'"세상의 비밀이 보이는 것 같다... 아니, 그냥 이끼 냄새가 강한 것 같다."',
    sellVal:400,
  },
  {
    id:'steampunk_elixir', herbs:['voltcreep','rustcap','lubelily'].sort(),
    name:'스팀펑크 엘릭서', icon:'⚙️',
    desc:'이그니스 화산섬 슬롯 +1 (오늘)',
    effect:'ignis_slot',
    baba:'"전기 + 녹 + 기름 = 스팀펑크. 공식이 이렇게 단순한 것이었나?"',
    sellVal:350,
  },
];

// 실패작 목록
const FAIL_RESULTS = [
  {name:'정체불명의 진흙', icon:'🟫', baba:'"분명히 대박날 줄 알았는데. 진흙이다."', sellVal:5},
  {name:'썩은 냄새 오물', icon:'💩', baba:'"냄새가... 형용할 수가 없다. 내 후각이 문제인지 이 물질이 문제인지."', sellVal:3},
  {name:'끈적한 잿더미', icon:'🖤', baba:'"뭔가 타긴 탔는데 뭔지 모르겠다."', sellVal:7},
  {name:'흐물흐물한 덩어리', icon:'🟢', baba:'"살아있는 것 같기도 하고 죽은 것 같기도 하고."', sellVal:4},
  {name:'투명한 이상한 물', icon:'💧', baba:'"물이다. 그냥 물이다. 약초를 낭비했다."', sellVal:2},
  {name:'먼지 뭉치', icon:'🌫️', baba:'"실험실 구석에 굴러다니는 것과 구별이 안 된다."', sellVal:1},
  {name:'바바의 실패작 #7', icon:'❓', baba:'"기록할 가치조차 없다고 생각했는데, 일단 번호는 붙여두겠다."', sellVal:8},
  {name:'알 수 없는 결정체', icon:'💠', baba:'"예쁘긴 한데 쓸모는 없다. 장식품으로 팔까."', sellVal:10},
];

// 조합 상태
var comboSelected = [];
var comboResult = null;

function initSecretCombo(){
  renderComboHerbs();
}

function renderComboHerbs(){
  var grid = document.getElementById('combo-herb-grid');
  if(!grid) return;
  grid.innerHTML = '';

  COMBO_HERBS.forEach(function(h){
    var have = (G.herbs&&G.herbs[h.id])||0;
    if(h.id==='lubelily'||h.id==='rustcap'||h.id==='voltcreep'){
      have = (G.herbCollected&&G.herbCollected[h.id])||0;
    }
    var selected = comboSelected.indexOf(h.id) >= 0;
    var btn = document.createElement('button');
    btn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:7px 8px;'
      +'border-radius:8px;border:2px solid '+(selected?'var(--gold)':'var(--parch3)')+';'
      +'background:'+(selected?'rgba(184,137,26,.18)':'var(--parch)')+';'
      +'cursor:'+(have>0?'pointer':'default')+';opacity:'+(have>0?'1':'.35')+';'
      +'transition:all .15s;width:100%;text-align:left;';
    btn.innerHTML = '<span style="font-size:1.4rem;flex-shrink:0">'+h.icon+'</span>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:.68rem;color:var(--ink);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+h.name+'</div>'
      +'<div style="font-size:.58rem;color:var(--ink2)">보유 '+have+'개'+(selected?' ✓':'')+'</div>'
      +'</div>';
    if(have > 0){
      (function(hid){ btn.onclick = function(){ toggleComboHerb(hid); }; })(h.id);
    }
    grid.appendChild(btn);
  });

  // 슬롯 업데이트
  renderComboSlots();

  // 힌트 창 렌더링
  renderComboHints();

  // 조합 버튼 상태
  var tryBtn = document.getElementById('combo-try-btn');
  if(tryBtn){
    tryBtn.disabled = comboSelected.length < 2;
    tryBtn.style.opacity = comboSelected.length < 2 ? '.5' : '1';
    if(comboSelected.length >= 2){
      tryBtn.textContent = '🧪 조합 시도! ('+comboSelected.length+'가지)';
    } else {
      tryBtn.textContent = '🧪 조합 시도!';
    }
  }
}

function renderComboSlots(){
  var slots = document.getElementById('combo-slots');
  if(!slots) return;
  if(comboSelected.length === 0){
    slots.innerHTML = '<div style="font-size:.75rem;color:var(--ink2);font-style:italic;margin:auto">약초를 탭해서 추가하세요</div>';
    return;
  }
  slots.innerHTML = '';
  comboSelected.forEach(function(id){
    var h = COMBO_HERBS.find(function(x){return x.id===id;});
    if(!h) return;
    var chip = document.createElement('div');
    chip.style.cssText = 'display:flex;align-items:center;gap:4px;padding:5px 9px;'
      +'border-radius:20px;background:rgba(184,137,26,.15);border:1.5px solid var(--gold);'
      +'cursor:pointer;font-size:.72rem;color:var(--ink);white-space:nowrap;';
    chip.innerHTML = h.icon+' '+h.name+' <span style="color:var(--mush);margin-left:2px">✕</span>';
    chip.title = '클릭하면 제거';
    (function(hid){ chip.onclick = function(){ toggleComboHerb(hid); }; })(id);
    slots.appendChild(chip);
  });
  // + 슬롯 표시 (최대 3개)
  if(comboSelected.length < 3){
    var add = document.createElement('div');
    add.style.cssText = 'width:44px;height:44px;border-radius:8px;border:2px dashed var(--parch3);'
      +'display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--ink2);';
    add.textContent = '+';
    slots.appendChild(add);
  }
}

function renderComboHints(){
  var hintEl = document.getElementById('combo-hint-list');
  if(!hintEl) return;

  // 현재 선택된 재료와 관련된 힌트 표시
  var hints = [];

  // 선택된 재료가 있으면 그에 맞는 힌트
  if(comboSelected.length > 0){
    SECRET_RECIPES.forEach(function(r){
      var match = comboSelected.every(function(s){ return r.herbs.indexOf(s) >= 0; });
      if(match && r.herbs.length >= comboSelected.length){
        var needed = r.herbs.filter(function(h){ return comboSelected.indexOf(h)<0; });
        var neededNames = needed.map(function(id){
          var herb = COMBO_HERBS.find(function(x){return x.id===id;});
          return herb?herb.icon+herb.name:'?';
        });
        if(neededNames.length === 0){
          hints.push('<div style="padding:4px 0;border-bottom:1px solid var(--parch3);color:var(--gold2)">✨ 조합 가능!</div>');
        } else {
          hints.push('<div style="padding:4px 0;border-bottom:1px solid var(--parch3)">+'+neededNames.join(', ')+'<br><span style="color:var(--ink2);font-size:.6rem">→ ???</span></div>');
        }
      }
    });
  }

  // 선택 없으면 기본 힌트 목록
  if(hints.length === 0){
    hints = [
      '<div style="color:var(--ink2);padding:3px 0">🌼+💎 → ?</div>',
      '<div style="color:var(--ink2);padding:3px 0">⚡+🪨 → ?</div>',
      '<div style="color:var(--ink2);padding:3px 0">🍄+🌳 → ?</div>',
      '<div style="color:var(--ink2);padding:3px 0">🪷+🌑 → ?</div>',
      '<div style="color:var(--ink2);padding:3px 0">💎+🌿 → ?</div>',
      '<div style="color:var(--ink2);padding:3px 0;font-style:italic">도감 노트에<br>힌트 있음 👀</div>',
    ];
  }

  hintEl.innerHTML = hints.join('');
}

function toggleComboHerb(id){
  var idx = comboSelected.indexOf(id);
  if(idx >= 0){
    comboSelected.splice(idx,1);
  } else {
    if(comboSelected.length >= 3){
      // 진동 효과
      var btn = document.getElementById('combo-try-btn');
      if(btn){btn.style.border='2px solid var(--mush)';setTimeout(function(){btn.style.border='2px solid var(--gold)';},500);}
      showResult('최대 3개까지 선택 가능합니다!', true); return;
    }
    comboSelected.push(id);
    // 즉각적인 피드백
    spawnFloat(COMBO_HERBS.find(function(h){return h.id===id;}).icon+' 추가!');
  }
  renderComboHerbs();
}

function trySecretCombo(){
  if(comboSelected.length < 2){showResult('약초를 2개 이상 선택하세요!',true);return;}
  // 재료 보유 확인
  for(var i=0;i<comboSelected.length;i++){
    var id=comboSelected[i];
    var have=(G.herbs&&G.herbs[id])||0;
    if(id==='lubelily'||id==='rustcap'||id==='voltcreep') have=(G.herbCollected&&G.herbCollected[id])||0;
    if(have<1){showResult('재료가 부족합니다!',true);return;}
  }
  // 정렬해서 레시피 검색
  var key = comboSelected.slice().sort();
  var recipe = null;
  for(var r=0;r<SECRET_RECIPES.length;r++){
    if(JSON.stringify(SECRET_RECIPES[r].herbs)===JSON.stringify(key)){
      recipe=SECRET_RECIPES[r]; break;
    }
  }
  // 재료 소모
  comboSelected.forEach(function(id){
    if(id==='lubelily'||id==='rustcap'||id==='voltcreep'){
      if(G.herbCollected)G.herbCollected[id]=Math.max(0,(G.herbCollected[id]||0)-1);
    } else {
      if(G.herbs)G.herbs[id]=Math.max(0,(G.herbs[id]||0)-1);
    }
  });
  // 결과 처리
  if(recipe){
    applyComboEffect(recipe);
    showComboResult(recipe, true);
    if(typeof showComboCelebration==='function') showComboCelebration(recipe);
  } else {
    var fail=FAIL_RESULTS[Math.floor(Math.random()*FAIL_RESULTS.length)];
    addCoins('bronze', fail.sellVal);
    showComboResult(fail, false);
  }
  comboSelected=[];
  updateUI();
  renderComboHerbs();
}

function applyComboEffect(recipe){
  var e=recipe.effect;
  if(e==='battle_def'){if(!G.comboBattleDef)G.comboBattleDef=0;G.comboBattleDef+=3;}
  else if(e==='walk_bonus'){G.upg.luckBonus=(G.upg.luckBonus||0)+15;}
  else if(e==='ignis_boost'){if(!G.ignisBoost)G.ignisBoost=1;}
  else if(e==='maxhp_up'){G.maxHp=(G.maxHp||100)+15;G.hp=Math.min(G.maxHp,G.hp+15);}
  else if(e==='gather_nohp'){if(!G.gatherNoHp)G.gatherNoHp=3;}
  else if(e==='energy_today'){G.maxEnergy=(G.maxEnergy||5)+2;G.energy=Math.min(G.maxEnergy,G.energy+2);}
  else if(e==='craft_double'){if(!G.craftDouble)G.craftDouble=1;}
  else if(e==='rep_up'){G.reputation=(G.reputation||0)+10;updateReputation();}
  else if(e==='full_restore'){G.hp=G.maxHp;G.energy=G.maxEnergy;G.reputation=(G.reputation||0)+5;}
  else if(e==='power_attack'){if(!G.powerAtk)G.powerAtk=1;G.hp=Math.max(1,G.hp-Math.ceil(G.maxHp*.2));}
  else if(e==='regen_boost'){if(!G.regenBoost)G.regenBoost=true;}
  else if(e==='walk_today'){if(!G.walkToday)G.walkToday=true;}
  else if(e==='codex_hint'){spawnFloat('🔮 도감 힌트 해금!');}
  else if(e==='ignis_slot'){if(!G.ignisExtraSlot)G.ignisExtraSlot=1;}
  else if(e==='steampunk_elixir'){if(!G.ignisExtraSlot)G.ignisExtraSlot=1;}
  updateHpBar();
}

function showComboResult(item, isSuccess){
  var el=document.getElementById('combo-result');
  if(!el)return;
  el.style.display='block';
  el.innerHTML='<div style="text-align:center;padding:14px;border-radius:10px;border:2px solid '+(isSuccess?'var(--gold)':'var(--parch3)')+';background:'+(isSuccess?'rgba(184,137,26,.1)':'rgba(0,0,0,.05)')+'">'
    +'<div style="font-size:2.5rem;margin-bottom:6px">'+item.icon+'</div>'
    +'<div style="font-family:Cinzel,serif;font-size:.9rem;color:'+(isSuccess?'var(--gold2)':'var(--ink)')+'">'+item.name+'</div>'
    +(item.desc?'<div style="font-size:.75rem;color:var(--moss);margin-top:4px">'+item.desc+'</div>':'')
    +'<div style="font-size:.75rem;color:var(--ink2);font-style:italic;margin-top:8px;padding:8px;background:rgba(0,0,0,.04);border-radius:7px">Baba: '+item.baba+'</div>'
    +(isSuccess?'':'<div style="font-size:.72rem;color:var(--ink2);margin-top:6px">판매하면 '+item.sellVal+'₦</div>')
    +'</div>';
  spawnFloat(isSuccess?item.icon+' 비밀 조합 성공!':'💩 실패...');
  log('[비밀조합] '+(isSuccess?'성공':'실패')+': '+item.name);
}

// ══ ACHIEVEMENTS ══
function renderAchievements(){
  var list=document.getElementById('achievements-list');
  if(!list)return;
  list.innerHTML='';
  // 달성한 업적
  var earned=G.endings||[];
  if(earned.length===0){
    list.innerHTML='<div style="text-align:center;padding:30px;font-size:.85rem;color:var(--ink2);font-style:italic">아직 달성한 업적이 없어요.<br>게임을 계속 플레이해보세요!</div>';
    return;
  }
  earned.forEach(function(id){
    var E=ENDINGS.find(function(e){return e.id===id;});
    if(!E)return;
    var card=document.createElement('div');
    card.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1.5px solid var(--gold);background:rgba(184,137,26,.08);margin-bottom:8px';
    card.innerHTML='<span style="font-size:2rem">'+E.icon+'</span>'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--gold2)">'+E.title+'</div>'
      +'<div style="font-size:.72rem;color:var(--ink2);margin-top:3px">'+E.desc+'</div></div>'
      +'<span style="font-size:.7rem;color:var(--gold2)">✅</span>';
    list.appendChild(card);
  });
  // 미달성 업적 (잠금 표시)
  ENDINGS.forEach(function(E){
    if(earned.includes(E.id))return;
    var card=document.createElement('div');
    card.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1.5px solid var(--parch3);background:var(--parch2);margin-bottom:8px;opacity:.5';
    card.innerHTML='<span style="font-size:2rem;filter:grayscale(1)">🔒</span>'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--ink)">??? 미달성</div>'
      +'<div style="font-size:.72rem;color:var(--ink2);margin-top:3px">달성 조건을 찾아보세요</div></div>';
    list.appendChild(card);
  });
  // 뱃지 초기화
  var tb=document.getElementById('tb-achievements');
  if(tb)tb.style.display='none';
}

function updateForgeQueueDisplay(){
  var el=document.getElementById('forge-queue-display');
  var listEl=document.getElementById('forge-queue-list');
  if(!el||!listEl)return;
  if(!G.forgeQueue||G.forgeQueue.length===0){
    el.style.display='none';return;
  }
  el.style.display='block';
  var names={purified:'정제약초',crystal:'화염크리스탈',moonstone:'달빛석',dragonbone:'용골분말',voidmoss:'심연이끼',starresin:'별빛수지'};
  var icons={purified:'🌿',crystal:'🔥',moonstone:'🌙',dragonbone:'🦴',voidmoss:'🌑',starresin:'⭐'};
  listEl.innerHTML='';
  G.forgeQueue.forEach(function(item){
    var remaining=Math.max(0,(item.endDay||0)-G.day);
    var div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(180,60,20,.1)';
    div.innerHTML=(icons[item.type]||'🔥')+' '+(names[item.type]||item.type)
      +'<span style="color:'+(remaining===0?'#60cc60':'#cc6030')+'">'
      +(remaining===0?'✅ 완성!':'Day '+item.endDay+' 완성 ('+remaining+'일 후)')
      +'</span>';
    listEl.appendChild(div);
  });
}

// ══ BATTLE SYSTEM v2 ══
const BATTLE_MOBS = {
  // 광산 몹
  mine_mole:  {name:'기계 두더지',  icon:'🦔', hp:25, atk:8,  def:3,  weak:'shroom', reward:{bronze:8,  herb:{shroom:2}}, zone:'mine',   desc:'광산 터널을 파고다니는 기계 생명체'},
  mine_golem: {name:'증기 골렘',    icon:'🤖', hp:40, atk:14, def:6,  weak:'resin',  reward:{bronze:15, herb:{rare:1}},   zone:'mine',   desc:'증기 압력으로 움직이는 철제 골렘'},
  mine_spider:{name:'태엽 거미',    icon:'🕷', hp:30, atk:18, def:2,  weak:'moss',   reward:{silver:1,  herb:{rare:1}},   zone:'mine',   desc:'태엽으로 움직이는 기계 거미'},
  // 원정 몹
  aero_bat:   {name:'구름 박쥐',    icon:'🦇', hp:20, atk:10, def:1,  weak:'lotus',  reward:{bronze:10, herb:{lotus:2}},  zone:'aero',   desc:'구름 위를 나는 기계 날개 박쥐'},
  aero_dragon:{name:'용암 도마뱀',  icon:'🦎', hp:55, atk:22, def:8,  weak:'rare',   reward:{silver:2,  herb:{rare:2}},   zone:'aero',   desc:'화산 근처에 사는 불꽃 도마뱀'},
  // 북쪽 설산 몹
  snow_golem: {name:'빙하 골렘',    icon:'🧊', hp:60, atk:18, def:10, weak:'resin',  reward:{silver:2, herb:{rare:2}, crystal:{mooncrys:1}}, zone:'snowfield', desc:'설산 깊은 곳에 잠들어 있던 얼음 거인'},
  snow_wolf:  {name:'눈보라 늑대',  icon:'🐺', hp:35, atk:22, def:4,  weak:'herb',   reward:{bronze:20, herb:{rare:1}, crystal:{sapphire:1}},  zone:'snowfield', desc:'눈보라를 타고 나타나는 흰 늑대'},
  // 깊은 숲 몹
  forest_spirit:{name:'고대 나무 정령', icon:'🌳', hp:50, atk:15, def:8, weak:'lotus', reward:{silver:1, herb:{moss:3,resin:2}}, zone:'deepforest', desc:'수백 년 된 나무에 깃든 정령'},
  forest_spider:{name:'독거미',      icon:'🕸', hp:28, atk:20, def:2,  weak:'shroom', reward:{bronze:12, herb:{shroom:3,moss:2}}, zone:'deepforest', desc:'깊은 숲 속 독 거미'},
  // 워킹하우스 몹
  walk_bandit:{name:'기계 도둑',    icon:'🤺', hp:35, atk:15, def:4,  weak:'herb',   reward:{bronze:20, herb:{herb:3}},   zone:'walk',   desc:'워킹하우스를 노리는 기계 도둑'},
  walk_beast: {name:'철갑 맹수',    icon:'🐗', hp:45, atk:20, def:7,  weak:'resin',  reward:{silver:1,  bronze:10},       zone:'walk',   desc:'철갑을 두른 야생 맹수'},
};

const BABA_BATTLE = {
  start:   ['"적이 나타났다. 나는... 뒤에 있을게."', '"이럴 때일수록 침착하게. 일단 상대를 분석해봐."', '"조심해. 저 눈빛이 심상치 않아."'],
  attack:  ['"좋아! 그렇게!"', '"역시 공격이 최선의 방어지."', '"힘차게!"'],
  defend:  ['"현명한 선택이야. 방어도 전략이지."', '"버텨. 기회가 올 거야."', '"방패를 믿어."'],
  item:    ['"오호, 포션을 쓰는군. 내가 만든 거잖아!"', '"약이 잘 들었으면 좋겠는데..."', '"연금술의 힘을 믿어봐."'],
  flee:    ['"도망치는 것도 용기야... 라고 말하고 싶은데."', '"다음에 더 강해져서 오자."', '"살아남는 게 우선이야."'],
  analyze: ['"흥미롭군. 약점이 보이는 것 같아."', '"기록해두겠어. 나중에 도움이 될 거야."', '"역시 분석이 먼저야!"'],
  mob_atk: ['"아야! 정신차려!"', '"버텨! 아직 끝나지 않았어!"', '"이런... 제대로 맞았군."'],
  mob_def: ['"벽처럼 버티고 있어. 타이밍을 봐."', '"방어 자세야. 공격 준비 중일 수도 있어."'],
  mob_charge:['"힘을 모으고 있어! 다음 턴 공격이 강할 거야!"', '"위험해! 방어하거나 도망쳐!"'],
  win:     ['"해냈어! 역시 내 제자야... 아니, 내 동료야."', '"잘했어. 전리품도 꽤 괜찮군."', '"이번 전투 기록해두겠어."'],
  lose:    ['"일어나... 아직 끝나지 않았어."', '"괜찮아. 다음엔 더 잘 할 수 있어."'],
};

let curBattle2 = null; // 새 전투 시스템
let battleLog = [];
let mobNextAction = null;

function getBattleComment(type){
  const arr=BABA_BATTLE[type]||BABA_BATTLE.start;
  return arr[Math.floor(Math.random()*arr.length)];
}

// 전투 시작
function startBattle2(mobId, zone){
  const mob=BATTLE_MOBS[mobId];
  if(!mob)return;
  if(!G.battleHp)G.battleHp=G.maxBattleHp||100;
  curBattle2={
    mobId, ...mob,
    curHp:mob.hp,
    analyzed:false,
    weakRevealed:false,
    turn:1,
  };
  battleLog=[];
  mobNextAction=rollMobAction();
  showBattle2Overlay();
}

function rollMobAction(){
  const r=Math.random();
  if(r<0.5)return'attack';
  if(r<0.75)return'defend';
  return'charge';
}

function showBattle2Overlay(){
  const ov=document.getElementById('battle2-overlay');
  if(!ov)return;
  ov.classList.add('show');
  updateBattle2UI();
  addBattleLog('start', getBattleComment('start'));
  // 전투 HP 바 표시
  const row=document.getElementById('battle-hp-row');
  if(row)row.style.display='flex';
  updateBattleHpBar();
}

function updateBattleHpBar(){
  if(!G.battleHp)G.battleHp=G.maxBattleHp||100;
  const pct=Math.round(G.battleHp/G.maxBattleHp*100);
  const fill=document.getElementById('battle-hp-fill');
  const val=document.getElementById('battle-hp-val');
  if(fill)fill.style.width=pct+'%';
  if(val)val.textContent=G.battleHp+'/'+G.maxBattleHp;
}

function updateBattle2UI(){
  if(!curBattle2)return;
  const m=curBattle2;
  // 몹 정보
  const mobIcon=document.getElementById('b2-mob-icon');
  const mobName=document.getElementById('b2-mob-name');
  const mobHpFill=document.getElementById('b2-mob-hp-fill');
  const mobHpVal=document.getElementById('b2-mob-hp-val');
  const nextAct=document.getElementById('b2-next-action');
  const weakInfo=document.getElementById('b2-weak-info');
  if(mobIcon)mobIcon.textContent=m.icon;
  if(mobName)mobName.textContent=m.name+' (Turn '+m.turn+')';
  const mobPct=Math.round(m.curHp/m.hp*100);
  if(mobHpFill)mobHpFill.style.width=mobPct+'%';
  if(mobHpVal)mobHpVal.textContent=m.curHp+'/'+m.hp;
  // 다음 행동 예고
  const actionNames={attack:'⚔️ 공격 준비 중!', defend:'🛡️ 방어 자세', charge:'💥 힘 모으는 중!'};
  const actionColors={attack:'#ff6040', defend:'#6090ff', charge:'#ffaa00'};
  if(nextAct){
    nextAct.textContent='다음 행동: '+actionNames[mobNextAction];
    nextAct.style.color=actionColors[mobNextAction];
  }
  // 약점 정보
  if(weakInfo){
    if(m.weakRevealed){
      const herb=COMBO_HERBS?COMBO_HERBS.find(h=>h.id===m.weak):null;
      weakInfo.textContent='약점: '+(herb?herb.icon+herb.name:'알 수 없음');
      weakInfo.style.display='block';
    } else {
      weakInfo.style.display='none';
    }
  }
}

function addBattleLog(type, msg){
  battleLog.push({type,msg});
  const logEl=document.getElementById('b2-log');
  if(!logEl)return;
  const div=document.createElement('div');
  div.style.cssText='padding:5px 8px;border-bottom:1px solid rgba(0,0,0,.08);font-size:.8rem;color:var(--ink2);line-height:1.5;';
  div.innerHTML='<span style="font-size:.7rem;color:var(--moss);font-style:italic">Baba: </span>'+msg;
  logEl.appendChild(div);
  logEl.scrollTop=logEl.scrollHeight;
}

// 플레이어 행동

function handleBattle2Win(){
  const m=curBattle2;
  let rStr='';
  if(m.reward.bronze){addCoins('bronze',m.reward.bronze);rStr+='🪙'+m.reward.bronze+' ';}
  if(m.reward.silver){addCoins('silver',m.reward.silver);rStr+='🔘'+m.reward.silver+' ';}
  if(m.reward.herb){
    Object.entries(m.reward.herb).forEach(([k,v])=>{addHerb(k,v);rStr+=iN(k)+'×'+v+' ';});
  }
  // 분석 완료면 도감에 기록
  if(m.analyzed&&m.weakRevealed){
    if(!G.mobCodex)G.mobCodex={};
    G.mobCodex[m.mobId]={name:m.name,icon:m.icon,weak:m.weak,desc:m.desc,defeated:true};
    spawnFloat('📖 도감 업데이트!');
  }
  addBattleLog('win', '🏆 승리! 전리품: '+rStr+' '+getBattleComment('win'));
  document.getElementById('b2-result-btn').style.display='block';
  document.getElementById('b2-result-btn').textContent='🏆 전리품 수령!';
  disableBattle2Btns();
  G.reputation=(G.reputation||0)+2;
  updateUI();
}

function handleBattle2Lose(){
  addBattleLog('lose', '💔 쓰러졌습니다... '+getBattleComment('lose'));
  G.battleHp=Math.floor(G.maxBattleHp*0.3);
  document.getElementById('b2-result-btn').style.display='block';
  document.getElementById('b2-result-btn').textContent='😴 회복 후 복귀';
  disableBattle2Btns();
  updateBattleHpBar();
}

function disableBattle2Btns(){
  document.querySelectorAll('.b2-btn').forEach(b=>b.disabled=true);
}

function closeBattle2(){
  document.getElementById('battle2-overlay').classList.remove('show');
  const row=document.getElementById('battle-hp-row');
  if(row)row.style.display='none';
  curBattle2=null;
  updateUI();
}

function shakeBattleScreen(){
  const ov=document.getElementById('battle2-overlay');
  if(!ov)return;
  ov.style.animation='battleShake .4s ease';
  setTimeout(()=>{ov.style.animation='';},400);
}

function showBattleItemMenu(){
  const menu=document.getElementById('b2-item-menu');
  if(!menu)return;
  menu.innerHTML='';
  const items=[
    {key:'healing',icon:'🧪',name:'치유 물약',effect:()=>{G.battleHp=Math.min(G.maxBattleHp,G.battleHp+Math.ceil(G.maxBattleHp*.4));updateBattleHpBar();}},
    {key:'moon',icon:'🌙',name:'달빛 물약',effect:()=>{G.vitality=Math.min(G.maxVitality||100,G.vitality+30);updateHpBar();}},
    {key:'forest',icon:'🌲',name:'숲의 정수',effect:()=>{const b=6+Math.floor(Math.random()*6);curBattle2.curHp=Math.max(0,curBattle2.curHp-b);addBattleLog('item','🌲 숲의 정수! 독 '+b+'데미지');}},
  ];
  items.forEach(item=>{
    const have=(G.potionInv&&G.potionInv[item.key])||0;
    if(have<=0)return;
    const btn=document.createElement('button');
    btn.style.cssText='display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--parch3);background:var(--parch);margin-bottom:6px;cursor:pointer;font-size:.85rem;';
    btn.innerHTML=item.icon+' '+item.name+' <span style="color:var(--ink2);margin-left:auto">×'+have+'</span>';
    btn.onclick=function(){
      G.potionInv[item.key]--;
      item.effect();
      addBattleLog('item',getBattleComment('item'));
      menu.style.display='none';
      updateBattle2UI();
      // 포션으로 몬스터 HP 0이 된 경우 승리 판정
      if(curBattle2 && curBattle2.curHp <= 0){
        setTimeout(handleBattle2Win, 500);
      }
    };
    menu.appendChild(btn);
  });
  if(menu.children.length===0){
    menu.innerHTML='<div style="text-align:center;padding:10px;color:var(--ink2);font-size:.82rem">사용 가능한 포션이 없어요!</div>';
  }
  menu.style.display=menu.style.display==='block'?'none':'block';
}

// 전투 트리거
function tryTriggerBattle(zone){
  const zoneMobs={
    mine:['mine_mole','mine_golem','mine_spider'],
    aero:['aero_bat','aero_dragon'],
    walk:['walk_bandit','walk_beast'],
  };
  const mobs=zoneMobs[zone];
  if(!mobs)return false;
  const chance={mine:0.25,aero:0.3,walk:0.2}[zone]||0.2;
  if(Math.random()<chance){
    const mobId=mobs[Math.floor(Math.random()*mobs.length)];
    startBattle2(mobId, zone);
    return true;
  }
  return false;
}

// ══ TITLE/ACHIEVEMENT SYSTEM ══
