// ╔══════════════════════════════════════════════════════╗
// ║  monster_codex.js                                    ║
// ║  약초사의 비밀정원 — 몬스터 도감 시스템              ║
// ║                                                      ║
// ║  포함: MONSTER_CODEX 데이터, renderMonsterCodex,    ║
// ║        toggleMonsterCard, trackMonsterKill           ║
// ╚══════════════════════════════════════════════════════╝

// ══ MONSTER CODEX DATA ══
const MONSTER_CODEX = [
  // ── 꽃밭 ──
  {
    id:'bloom_sprite',  zone:'bloom',    loc:'꽃밭',
    icon:'🌸', silhouette:'❓',
    name:'꽃빛 요정',   engName:'Bloom Sprite',
    hp:18, atk:6, def:1, weak:'moss',
    reward:{bronze:5, herb:{herb:2}},
    look:'꽃잎으로 이루어진 반투명한 날개를 가진 작은 요정.',
    first:'처음엔 꽃밭에서 흔들리는 꽃인 줄 알았다. 다가갔더니 갑자기 날아올라 꽃가루를 뿌렸다. 재채기가 멈추질 않았다.',
    baba:'꽃빛 요정은 꽃밭을 지키는 수호자야. 이끼를 들고 있으면 도망간다더군.',
    gameEffect:'🌿 처치 시 약초 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'petal_golem',   zone:'bloom',    loc:'꽃밭',
    icon:'🌺', silhouette:'❓',
    name:'꽃잎 골렘',   engName:'Petal Golem',
    hp:32, atk:11, def:4, weak:'resin',
    reward:{bronze:12, herb:{herb:3, rare:1}},
    look:'수백 장의 꽃잎이 뭉쳐 사람 형태를 이룬 골렘. 움직일 때마다 꽃향기가 난다.',
    first:'꽃밭 한 가운데에서 꽃잎들이 소용돌이치더니 거대한 형체를 만들어냈다. 예쁘긴 한데... 주먹이 엄청 아팠다.',
    baba:'꽃잎이 굳기 전에 수지로 틈새를 막아버리면 움직이지 못해. 비법이야.',
    gameEffect:'💎 처치 시 희귀초 확률 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 연꽃못 ──
  {
    id:'pond_wisp',     zone:'pond',     loc:'연꽃못',
    icon:'💧', silhouette:'❓',
    name:'연못 도깨비불', engName:'Pond Wisp',
    hp:22, atk:9, def:2, weak:'herb',
    reward:{bronze:8, herb:{lotus:2}},
    look:'수면 위를 떠다니는 파란 불꽃. 가까이 가면 물을 튀긴다.',
    first:'밤에 연꽃못에 갔다가 파란 불빛을 따라갔더니 진흙탕에 빠졌다. 도깨비불이었다. 웃는 것 같았다.',
    baba:'도깨비불은 약초 냄새를 싫어해. 주머니에 약초를 넣고 다니면 덜 나타난다고.',
    gameEffect:'💧 처치 시 수초 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'lotus_serpent', zone:'pond',     loc:'연꽃못',
    icon:'🐍', silhouette:'❓',
    name:'연화 수룡',   engName:'Lotus Serpent',
    hp:38, atk:14, def:5, weak:'shroom',
    reward:{silver:1, herb:{lotus:3}},
    look:'연꽃잎 무늬가 새겨진 비늘을 가진 작은 용. 연꽃 사이를 유영한다.',
    first:'수련잎인 줄 알고 밟았다가 뱀처럼 생긴 것이 홱 나타났다. 비늘이 연꽃 무늬였다. 아름다웠지만 이빨은 날카로웠다.',
    baba:'버섯 포자 가루를 물에 뿌리면 수룡이 혼란스러워해. 그 틈에 공격하면 돼.',
    gameEffect:'🌙 처치 시 야간 채집량 +1',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 퍼숲 ──
  {
    id:'forest_troll',  zone:'forest',   loc:'퍼숲',
    icon:'🌳', silhouette:'❓',
    name:'나무 트롤',   engName:'Forest Troll',
    hp:45, atk:13, def:7, weak:'lotus',
    reward:{bronze:15, herb:{resin:2, moss:1}},
    look:'고목나무처럼 생긴 거대한 트롤. 몸에서 수액이 흘러내린다.',
    first:'길을 막고 선 고목인 줄 알았는데 눈을 뜨더니 포효했다. 온 숲이 흔들렸다.',
    baba:'수련 꽃잎을 태운 연기가 나무 트롤에게 효과적이야. 왜인지는... 모르겠어.',
    gameEffect:'🌲 처치 시 수지 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'shadow_wolf',   zone:'forest',   loc:'퍼숲',
    icon:'🐺', silhouette:'❓',
    name:'그림자 늑대', engName:'Shadow Wolf',
    hp:35, atk:18, def:3, weak:'rare',
    reward:{silver:1, herb:{moss:2}},
    look:'빛을 흡수하는 칠흑색 털을 가진 늑대. 그림자 속에서는 눈만 빛난다.',
    first:'숲이 갑자기 어두워지더니 눈 두 개가 빛났다. 그림자인 줄 알았는데 늑대였다.',
    baba:'희귀초의 빛이 그림자를 밀어낸다고 해. 희귀초를 들고 있으면 그나마 낫지.',
    gameEffect:'⭐ 처치 시 희귀 경험치 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 이끼언덕 ──
  {
    id:'moss_crab',     zone:'hills',    loc:'이끼언덕',
    icon:'🦀', silhouette:'❓',
    name:'이끼 게',     engName:'Moss Crab',
    hp:28, atk:10, def:8, weak:'herb',
    reward:{bronze:10, herb:{moss:3}},
    look:'등껍데기가 온통 이끼로 덮인 게. 가만히 있으면 돌처럼 보인다.',
    first:'언덕에서 쉬려고 돌에 앉았다가 돌이 움직였다. 집게발에 세게 집혔다.',
    baba:'이끼 게 껍데기는 단단하지만 집게발 관절은 약해. 약초즙을 바르면 힘이 빠진다더군.',
    gameEffect:'🪨 처치 시 이끼 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 버섯밭 ──
  {
    id:'shroom_ghost',  zone:'mushroom', loc:'버섯밭',
    icon:'👻', silhouette:'❓',
    name:'포자 유령',   engName:'Spore Phantom',
    hp:25, atk:12, def:1, weak:'moss',
    reward:{bronze:9, herb:{shroom:3}},
    look:'버섯의 포자로 이루어진 반투명한 유령. 달빛 아래서만 모습을 드러낸다.',
    first:'버섯밭에서 포자 구름이 피어오르더니 사람 형상이 됐다. 손을 뻗으면 잡힐 것 같은데 닿지 않았다.',
    baba:'포자 유령은 이끼 냄새에 약해. 이끼를 피우면 흩어진다고 기록돼 있어.',
    gameEffect:'🍄 처치 시 버섯 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'poison_toad',   zone:'mushroom', loc:'버섯밭',
    icon:'🐸', silhouette:'❓',
    name:'독버섯 두꺼비', engName:'Toxic Toad',
    hp:40, atk:15, def:4, weak:'resin',
    reward:{silver:1, herb:{shroom:4}},
    look:'온몸이 버섯 반점으로 뒤덮인 거대한 두꺼비. 독액을 뿜는다.',
    first:'거대한 버섯인 줄 알고 다가갔더니 눈이 열렸다. 독액을 뱉기 전에 간신히 피했다. 신발이 녹았다.',
    baba:'수지 성분이 독액을 중화시켜. 수지를 바른 방패가 있으면 독을 막을 수 있어.',
    gameEffect:'⚗️ 처치 시 포션 재료 획득 확률 상승',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 희귀정원 ──
  {
    id:'crystal_beetle', zone:'whisker', loc:'희귀정원',
    icon:'💎', silhouette:'❓',
    name:'보석 딱정벌레', engName:'Gem Beetle',
    hp:20, atk:8, def:12, weak:'lotus',
    reward:{bronze:20, herb:{rare:2}},
    look:'몸 전체가 보석처럼 빛나는 딱정벌레. 등딱지는 어떤 칼날도 튕겨낸다.',
    first:'빛나는 돌인 줄 알고 집으려다 날아올랐다. 딱정벌레였는데 등딱지에 칼이 튕겼다.',
    baba:'수련 성분이 관절을 부드럽게 만든다고 해. 그러면 방어가 허술해지지.',
    gameEffect:'💫 처치 시 코인 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'vine_horror',   zone:'whisker',  loc:'희귀정원',
    icon:'🌿', silhouette:'❓',
    name:'마법 덩굴',   engName:'Arcane Vine',
    hp:50, atk:16, def:6, weak:'shroom',
    reward:{silver:2, herb:{rare:3}},
    look:'스스로 움직이는 빛나는 덩굴. 희귀 식물의 기운을 먹고 자란다.',
    first:'발에 뭔가 감겼다 싶었는데 덩굴이었다. 손으로 잡아당겼더니 거꾸로 잡아당겼다.',
    baba:'버섯 포자가 마법 덩굴의 성장을 억제해. 버섯 가루를 뿌리면 잠깐 마비된다더군.',
    gameEffect:'🌟 처치 시 희귀초 대량 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 전망대 ──
  {
    id:'wind_spirit',   zone:'lookout',  loc:'전망대',
    icon:'🌪️', silhouette:'❓',
    name:'바람 정령',   engName:'Gale Spirit',
    hp:30, atk:20, def:2, weak:'moss',
    reward:{bronze:18, herb:{herb:2, rare:1}},
    look:'회오리바람 형태의 정령. 눈에 잘 보이지 않으며 갑자기 나타난다.',
    first:'전망대에서 바람이 거세지더니 모래가 소용돌이쳤다. 그 안에 뭔가 있었다.',
    baba:'이끼에는 무게가 있어. 바람 정령은 무거운 것에 약하지. 이끼를 던지면 돼.',
    gameEffect:'🌬️ 처치 시 날씨 예측 힌트 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 사막 오아시스 ──
  {
    id:'desert_scorpion', zone:'desert',   loc:'사막 오아시스',
    icon:'🦂', silhouette:'❓',
    name:'사막 전갈',    engName:'Desert Scorpion',
    hp:38, atk:16, def:5, weak:'lotus',
    reward:{bronze:15, herb:{rare:1, herb:2}},
    look:'모래색 등껍데기를 가진 거대한 전갈. 꼬리의 독침이 날카롭게 빛난다.',
    first:'오아시스 근처에서 물을 마시려다 모래가 갑자기 움직였다. 전갈이었다. 꼬리를 피하는 데 정신이 없었다.',
    baba:'수초 성분이 전갈의 독을 중화시킨다. 수초를 들고 다니면 덜 공격적이래.',
    gameEffect:'🏜️ 처치 시 사막 특산 재료 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  // ── 광산 ──
  {
    id:'mine_mole',     zone:'mine',     loc:'광산',
    icon:'🦔', silhouette:'❓',
    name:'기계 두더지', engName:'Clockwork Mole',
    hp:25, atk:8, def:3, weak:'shroom',
    reward:{bronze:8, herb:{shroom:2}},
    look:'황동 기어가 박힌 기계 두더지. 땅굴을 파는 속도가 믿기 어렵다.',
    first:'광산 바닥이 갑자기 솟아오르더니 기계 소리가 났다. 두더지인데 기어가 달려 있었다.',
    baba:'버섯 포자가 기어 틈에 끼어. 기계 두더지가 엄청 싫어하지.',
    gameEffect:'⚙️ 처치 시 광산 채굴 보너스',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'mine_golem',    zone:'mine',     loc:'광산',
    icon:'🤖', silhouette:'❓',
    name:'증기 골렘',   engName:'Steam Golem',
    hp:40, atk:14, def:6, weak:'resin',
    reward:{bronze:15, herb:{rare:1}},
    look:'증기 압력으로 움직이는 철제 골렘. 관절에서 수증기가 새어나온다.',
    first:'광산 깊은 곳에서 쿵쿵 소리가 났다. 철로 만든 거인이 걸어왔다.',
    baba:'수지를 관절 틈에 부으면 굳어서 움직이지 못해. 약점을 노리는 거야.',
    gameEffect:'💎 처치 시 크리스탈 추가 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
  {
    id:'mine_spider',   zone:'mine',     loc:'광산',
    icon:'🕷', silhouette:'❓',
    name:'태엽 거미',   engName:'Clockwork Spider',
    hp:30, atk:18, def:2, weak:'moss',
    reward:{silver:1, herb:{rare:1}},
    look:'태엽으로 움직이는 기계 거미. 거미줄이 강철 실로 되어 있다.',
    first:'천장에 반짝이는 것이 있어 올려다봤더니 수백 개의 눈이 나를 보고 있었다.',
    baba:'이끼가 태엽 거미의 기어에 끼어. 움직임이 굼뜨게 돼.',
    gameEffect:'🕸️ 처치 시 특수 재료 획득',
    unlockKills:1, infoKills:5, masterKills:10,
  },
];

// BATTLE_MOBS와 도감 연동 - 처치 시 기록
function trackMonsterKill(mobId){
  if(!G.monsterCodex) G.monsterCodex = {};
  if(!G.monsterCodex[mobId]) G.monsterCodex[mobId] = {seen:false, kills:0};
  G.monsterCodex[mobId].seen = true;
  G.monsterCodex[mobId].kills = (G.monsterCodex[mobId].kills || 0) + 1;
  const kills = G.monsterCodex[mobId].kills;
  const codex = MONSTER_CODEX.find(m => m.id === mobId);
  if(codex){
    if(kills === codex.infoKills)
      showBanner(`📖 도감 해금! <b>${codex.name}</b>의 정보가 추가됐습니다!`);
    if(kills === codex.masterKills)
      showBanner(`⭐ <b>${codex.name}</b> 완전 분석 완료!`);
  }
  saveGameLocal();
}

// 몬스터 도감 렌더링
function renderMonsterCodex(){
  const grid = document.getElementById('monster-codex-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!G.monsterCodex) G.monsterCodex = {};

  const WEAK_NAMES = {herb:'약초',lotus:'수초',shroom:'버섯',moss:'이끼',resin:'수지',rare:'희귀초'};
  const ZONE_COLORS = {
    bloom:'rgba(255,150,180,.15)', pond:'rgba(80,160,200,.15)',
    forest:'rgba(80,160,80,.15)',  hills:'rgba(120,160,80,.15)',
    mushroom:'rgba(180,80,40,.15)',whisker:'rgba(150,80,200,.15)',
    lookout:'rgba(100,150,220,.15)',mine:'rgba(100,80,60,.15)',
    desert:'rgba(220,180,80,.15)',
  };
  const ZONE_BORDER = {
    bloom:'rgba(255,150,180,.5)', pond:'rgba(80,160,200,.5)',
    forest:'rgba(80,160,80,.5)',  hills:'rgba(120,160,80,.5)',
    mushroom:'rgba(180,80,40,.5)',whisker:'rgba(150,80,200,.5)',
    lookout:'rgba(100,150,220,.5)',mine:'rgba(100,80,60,.5)',
    desert:'rgba(220,180,80,.5)',
  };

  let unlocked = 0;
  let total = MONSTER_CODEX.length;

  // 구역별 그룹화
  const zones = {};
  MONSTER_CODEX.forEach(m => {
    if(!zones[m.zone]) zones[m.zone] = [];
    zones[m.zone].push(m);
  });

  Object.entries(zones).forEach(([zone, monsters]) => {
    // 구역 헤더
    const zoneHdr = document.createElement('div');
    zoneHdr.style.cssText = 'font-family:Cinzel,serif;font-size:.78rem;color:var(--gold2);padding:8px 4px 4px;border-bottom:1px solid rgba(184,137,26,.3);margin-bottom:6px;margin-top:10px';
    zoneHdr.textContent = '📍 ' + monsters[0].loc;
    grid.appendChild(zoneHdr);

    monsters.forEach(m => {
      const rec = G.monsterCodex[m.id] || {seen:false, kills:0};
      const kills = rec.kills || 0;
      const isSeen = rec.seen || kills > 0;
      const isInfo = kills >= m.infoKills;
      const isMaster = kills >= m.masterKills;
      if(isSeen) unlocked++;

      const card = document.createElement('div');
      card.style.cssText = `border-radius:10px;border:1.5px solid ${isSeen ? ZONE_BORDER[zone] : 'rgba(80,60,40,.3)'};background:${isSeen ? ZONE_COLORS[zone] : 'rgba(30,20,10,.4)'};margin-bottom:8px;overflow:hidden;transition:all .2s`;

      if(!isSeen){
        // 미발견 - 실루엣
        card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:11px 13px">
          <span style="font-size:2rem;flex-shrink:0;filter:brightness(0) opacity(.3)">👾</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:.85rem;color:rgba(180,150,100,.4)">??? 미발견 몬스터</div>
            <div style="font-size:.65rem;color:rgba(180,150,100,.3);margin-top:1px">${m.loc} 탐험 중 조우 시 해금</div>
          </div>
          <span style="font-size:.7rem;color:rgba(150,120,80,.3)">0/${m.unlockKills}</span>
        </div>`;
      } else {
        // 발견됨
        const badge = isMaster ? '⭐ 완전분석' : isInfo ? '📖 정보공개' : '👁️ 발견';
        const badgeColor = isMaster ? '#d4a830' : isInfo ? '#80b860' : '#aaa';
        const bodyId = 'mcb-' + m.id;

        const hdr = document.createElement('div');
        hdr.style.cssText = `display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer;border-bottom:1px solid ${ZONE_BORDER[zone]}`;
        hdr.innerHTML = `<span style="font-size:2rem;flex-shrink:0">${m.icon}</span>
          <div style="flex:1">
            <div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--ink2)">${m.name}</div>
            <div style="font-size:.65rem;color:var(--ink2);opacity:.6;margin-top:1px">${m.engName} · ${m.loc}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:.6rem;color:${badgeColor};margin-bottom:2px">${badge}</div>
            <div style="font-size:.68rem;color:var(--ink2);opacity:.7">토벌 ${kills}회</div>
          </div>
          <span style="font-size:.7rem;color:var(--ink2);opacity:.5;margin-left:4px" id="marr-${m.id}">▼</span>`;
        hdr.onclick = () => toggleMonsterCard(bodyId, m.id);

        const body = document.createElement('div');
        body.id = bodyId;
        body.style.display = 'none';
        body.style.padding = '11px 13px';

        // 기본 정보 (발견 시)
        let bodyHTML = `<div style="display:flex;gap:12px;margin-bottom:10px">
          <div style="flex:1;background:rgba(0,0,0,.06);border-radius:7px;padding:8px 10px">
            <div style="font-size:.62rem;color:var(--ink2);opacity:.6;margin-bottom:3px">전투 스탯</div>
            <div style="font-size:.75rem;color:var(--ink2)">❤️ HP ${m.hp} &nbsp; ⚔️ 공격 ${m.atk} &nbsp; 🛡 방어 ${m.def}</div>
            <div style="font-size:.72rem;color:#cc6644;margin-top:3px">💥 약점: ${WEAK_NAMES[m.weak]||m.weak}</div>
          </div>
        </div>`;

        // 외형 정보 (5회 처치 시)
        if(isInfo){
          bodyHTML += `<div style="font-size:.78rem;color:var(--ink2);margin-bottom:7px">🔍 <b>외형:</b> ${m.look}</div>
          <div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:7px 9px;background:rgba(0,0,0,.05);border-radius:6px;border-left:3px solid ${ZONE_BORDER[zone]};margin-bottom:8px">
            📝 <b>바바의 메모:</b><br>${m.baba}
          </div>`;
        } else {
          bodyHTML += `<div style="font-size:.72rem;color:var(--ink2);opacity:.5;margin-bottom:7px;font-style:italic">🔒 ${m.infoKills - kills}회 더 처치하면 상세 정보가 해금됩니다.</div>`;
        }

        // 첫 조우 일지 + 효과 (10회 처치 시)
        if(isMaster){
          bodyHTML += `<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:7px 9px;background:rgba(0,0,0,.05);border-radius:6px;border-left:3px solid #d4a830;margin-bottom:7px;font-style:italic">
            📖 <b>첫 조우 일지:</b><br>"${m.first}"
          </div>
          <div style="font-size:.72rem;color:var(--ink2);background:rgba(0,0,0,.06);border-radius:5px;padding:5px 8px">🎮 ${m.gameEffect}</div>`;
        } else if(isInfo){
          bodyHTML += `<div style="font-size:.72rem;color:var(--ink2);opacity:.5;font-style:italic">🔒 ${m.masterKills - kills}회 더 처치하면 첫 조우 일지가 해금됩니다.</div>`;
        }

        body.innerHTML = bodyHTML;
        card.appendChild(hdr);
        card.appendChild(body);
      }
      grid.appendChild(card);
    });
  });

  // 진행률
  const pct = Math.round(unlocked / total * 100);
  const fill = document.getElementById('mcodex-monster-fill');
  const lbl  = document.getElementById('mcodex-monster-label');
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent = unlocked + ' / ' + total + ' 발견';
}

function toggleMonsterCard(bodyId, mobId){
  const el = document.getElementById(bodyId);
  if(!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  const arr = document.getElementById('marr-' + mobId);
  if(arr) arr.textContent = isOpen ? '▼' : '▲';
}

// 전투 승리 시 자동 호출 (startBattle2 승리 훅에 연동)
// handleBattle2Win() 내부에서 trackMonsterKill(curBattle2.mobId) 호출 필요
