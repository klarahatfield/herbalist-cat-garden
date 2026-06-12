// ╔══════════════════════════════════════════════════════╗
// ║  codex_system.js                                     ║
// ║  약초사의 비밀정원 — 도감 서브탭 + 물약 + 연구노트  ║
// ╚══════════════════════════════════════════════════════╝

// ══ 현재 활성 서브탭 ══
var currentCodexTab = 'herb';

function switchCodexTab(tab) {
  currentCodexTab = tab;
  var tabs = ['herb','crystal','monster','potion','note'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('ctab-' + t);
    var sec = document.getElementById('csec-' + t);
    if(btn) btn.classList.toggle('active', t === tab);
    if(sec) sec.style.display = (t === tab) ? 'block' : 'none';
  });
  if(tab === 'herb')    { renderHerbarium(); renderHerbCodexSections(); }
  if(tab === 'crystal') renderMineCodex();
  if(tab === 'monster') renderMonsterCodex();
  if(tab === 'potion')  renderPotionCodex();
  if(tab === 'note')    renderResearchNotes();
}

// ══ 약초 도감 — 3섹션 (일반/야간/계절) ══
const HERB_NIGHT = [
  { id:'moonpetal', icon:'🌙', name:'달빛꽃잎',  engName:'Moonpetal',
    habitat:'몽환꽃밭 — 달빛이 드리운 밤',
    effect:'달이 밝을수록 향이 짙어지며 수면을 깊게 해준다.',
    note:'밤에만 핀다. 낮에 보면 그냥 시든 잡초처럼 생겼는데, 달이 뜨면 형광빛으로 빛난다. 한 번은 졸린 채로 채집하다가 꽃잎이 내 코에 달라붙어서 하루 종일 달빛꽃잎 냄새를 풍기며 돌아다녔다.',
    gameEffect:'🌙 달빛 물약 재료' },
  { id:'starweed',  icon:'⭐', name:'별빛풀',    engName:'Starweed',
    habitat:'달빛라군 — 맑은 밤하늘 아래',
    effect:'반짝이는 수액이 상처를 빠르게 아물게 한다.',
    note:'별처럼 반짝인다. 뽑을 때 찌릿한 느낌이 나는데 전기는 아닌 것 같고... 그냥 별빛풀 특유의 간지럼인 것 같다. 아직 원인을 모른다.',
    gameEffect:'❄️ 겨울의 정수 재료' },
  { id:'glowshroom',icon:'💡', name:'발광버섯',  engName:'Glow-Shroom',
    habitat:'버섯밭 — 어두운 밤',
    effect:'갈아서 등불에 넣으면 오랫동안 빛을 낸다.',
    note:'이름처럼 정말 빛난다. 너무 밝아서 밤에 이걸 가방에 넣고 다니면 가방 안이 환해진다. 밤중에 서류 찾기 딱 좋다.',
    gameEffect:'☀️ 여름의 정수 재료' },
  { id:'nightmoss', icon:'🌿', name:'야광이끼',  engName:'Night Moss',
    habitat:'벨벳이끼언덕 — 야간',
    effect:'습기를 머금어 건조한 환경에서 피부를 보호한다.',
    note:'낮에는 평범한 이끼인데 밤에는 희미하게 빛난다. 발에 밟히는 게 싫어서 밤에 스스로 이동한다는 소문이 있는데, 사실인지 모르겠다. 한 번 자고 일어났더니 내 신발 위에 올라와 있긴 했다.',
    gameEffect:'🌿 야간 채집 전용' },
  { id:'shadowleaf',icon:'🍃', name:'그림자잎',  engName:'Shadow Leaf',
    habitat:'가르릉숲 — 달 없는 어둠',
    effect:'그림자에 녹아들어 은신 효과를 준다는 전설이 있다.',
    note:'손에 쥐면 그림자가 손 주변으로 모인다. 신기해서 계속 들고 있었더니 내 그림자가 두 배로 커졌다. 무섭다.',
    gameEffect:'🍂 가을의 정수 재료' },
  { id:'lumiresin', icon:'✨', name:'빛수지',    engName:'Lumi-Resin',
    habitat:'가르릉숲 — 야간',
    effect:'야간에 채집한 수지로, 빛을 머금어 어둠 속에서도 투명하게 빛난다.',
    note:'낮에 채집한 수지랑 성분이 미묘하게 다르다. 밤 공기를 흡수해서 그런지 더 끈적하고 향이 강하다. 실험실에 놓아두면 밤에 혼자 반짝여서 야간 조명 대용으로 쓰고 있다.',
    gameEffect:'🌿 숲의 정수 재료 대용' },
];

const HERB_SEASON = [
  { id:'sakuradew',   icon:'🌸', name:'벚꽃이슬',  engName:'Sakura Dew',   season:'봄',  seasonIcon:'🌸',
    habitat:'몽환꽃밭 — 봄에만 피어남',
    effect:'봄 아침 이슬을 머금은 벚꽃잎. 피로와 스트레스를 해소한다.',
    note:'봄에만 채집할 수 있다. 맛도 보기도 예쁘다. 봄이 오면 제일 먼저 이걸 찾아다닌다. 올해는 만개하기 전에 비가 와서 다 떨어졌다. 슬프다.',
    gameEffect:'🌸 봄의 정수 재료 (벚꽃이슬×5 + 달빛꽃잎×3)' },
  { id:'sunbloom',    icon:'🌻', name:'태양꽃',    engName:'Sun Bloom',    season:'여름', seasonIcon:'☀️',
    habitat:'위스커정원 — 한여름 태양 아래',
    effect:'강렬한 태양을 담아 체력을 대폭 회복시킨다.',
    note:'한여름에만 핀다. 너무 뜨거워서 채집할 때 두꺼운 장갑을 끼어야 한다. 그런데 장갑도 뜨거워진다. 도대체 이 꽃은 어떻게 살고 있는 건지.',
    gameEffect:'☀️ 여름의 정수 재료 (태양꽃×5 + 발광버섯×3)' },
  { id:'crimsonleaf', icon:'🍁', name:'단풍잎',    engName:'Crimson Leaf',  season:'가을', seasonIcon:'🍂',
    habitat:'가르릉숲 — 가을 단풍 속',
    effect:'붉은 빛이 도는 잎으로, 혈액순환을 촉진하고 몸을 따뜻하게 한다.',
    note:'가을에 채집할 수 있다. 밟으면 바삭한 소리가 나서 채집하러 가면 동네 고양이들이 다 따라온다. 왜인지는 모르겠다.',
    gameEffect:'🍂 가을의 정수 재료 (단풍잎×5 + 그림자잎×3)' },
  { id:'snowcrystal', icon:'❄️', name:'눈결정초',  engName:'Snow Crystal',  season:'겨울', seasonIcon:'❄️',
    habitat:'벨벳이끼언덕 — 눈 쌓인 겨울',
    effect:'눈 속에서 자라며 극한의 한기를 머금어 해열에 탁월하다.',
    note:'겨울에만 채집 가능. 손에 쥐면 차갑지 않고 오히려 포근한 느낌이 난다. 설명이 안 된다. 과학이 틀렸거나 내 손 감각이 틀렸거나 둘 중 하나다.',
    gameEffect:'❄️ 겨울의 정수 재료 (눈결정초×5 + 별빛풀×3)' },
];

function renderHerbCodexSections() {
  // 야간 식물 섹션
  var nightSec = document.getElementById('herb-night-sec');
  if(!nightSec) return;
  nightSec.innerHTML = '';
  if(!G.herbs) return;

  var UNLOCK_AMT = 3; // 3개 채집 시 해금

  HERB_NIGHT.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var unlocked = amt >= UNLOCK_AMT;
    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:1.5px solid ' + (unlocked ? 'rgba(100,80,200,.5)' : 'rgba(60,40,100,.2)') + ';background:' + (unlocked ? 'rgba(40,20,80,.4)' : 'rgba(20,10,40,.3)') + ';margin-bottom:8px;overflow:hidden';
    if(!unlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.8rem;filter:brightness(0) opacity(.2)">🌑</span>'
        + '<div><div style="font-size:.85rem;color:rgba(150,100,200,.4);font-family:Cinzel,serif">??? 야간 식물</div>'
        + '<div style="font-size:.65rem;color:rgba(100,60,160,.4)">야간 채집 ' + UNLOCK_AMT + '개 후 해금</div></div>'
        + '<span style="margin-left:auto;font-size:.68rem;color:rgba(100,60,160,.3)">' + amt + '/' + UNLOCK_AMT + '</span></div>';
    } else {
      var bodyId = 'hnb-' + h.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid rgba(100,80,200,.3)" onclick="toggleHerbNightCard(\'' + bodyId + '\')">'
        + '<span style="font-size:1.8rem">' + h.icon + '</span>'
        + '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--ink2)">' + h.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + h.engName + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="harr-' + h.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">📍 ' + h.habitat + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(100,60,200,.08);border-radius:6px;border-left:3px solid rgba(100,80,200,.4);margin-bottom:7px">💊 <b>효능:</b> ' + h.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;background:rgba(100,60,200,.05);border-radius:6px;border-left:3px solid rgba(80,60,160,.4);margin-bottom:6px;font-style:italic">📝 ' + h.note + '</div>'
        + '<div style="font-size:.7rem;color:var(--ink2);background:rgba(100,60,200,.08);border-radius:5px;padding:4px 8px">🎮 ' + h.gameEffect + '</div>'
        + '</div>';
    }
    nightSec.appendChild(card);
  });

  // 계절 식물 섹션
  var seasonSec = document.getElementById('herb-season-sec');
  if(!seasonSec) return;
  seasonSec.innerHTML = '';

  HERB_SEASON.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var unlocked = amt >= 1;
    var borderColor = {봄:'rgba(255,150,180,.5)',여름:'rgba(255,200,50,.5)',가을:'rgba(200,100,50,.5)',겨울:'rgba(100,180,255,.5)'}[h.season] || 'rgba(150,150,150,.3)';
    var bgColor = {봄:'rgba(255,150,180,.1)',여름:'rgba(255,200,50,.08)',가을:'rgba(200,100,50,.1)',겨울:'rgba(100,180,255,.1)'}[h.season] || 'rgba(100,100,100,.05)';
    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:1.5px solid ' + (unlocked ? borderColor : 'rgba(150,130,100,.2)') + ';background:' + (unlocked ? bgColor : 'rgba(30,25,15,.3)') + ';margin-bottom:8px;overflow:hidden';
    if(!unlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.8rem;filter:grayscale(1) opacity(.3)">' + h.seasonIcon + '</span>'
        + '<div><div style="font-size:.85rem;color:rgba(150,130,100,.4);font-family:Cinzel,serif">??? ' + h.season + ' 식물</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,100,.3)">' + h.season + ' 시즌에 채집하면 해금</div></div></div>';
    } else {
      var bodyId = 'hsb-' + h.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid ' + borderColor + '" onclick="toggleHerbNightCard(\'' + bodyId + '\')">'
        + '<span style="font-size:1.8rem">' + h.icon + '</span>'
        + '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--ink2)">' + h.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + h.engName + ' · ' + h.seasonIcon + ' ' + h.season + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="harr-' + h.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">📍 ' + h.habitat + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(0,0,0,.06);border-radius:6px;border-left:3px solid ' + borderColor + ';margin-bottom:7px">💊 <b>효능:</b> ' + h.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;background:rgba(0,0,0,.04);border-radius:6px;border-left:3px solid rgba(150,130,100,.3);margin-bottom:6px;font-style:italic">📝 ' + h.note + '</div>'
        + '<div style="font-size:.7rem;color:var(--ink2);background:rgba(0,0,0,.06);border-radius:5px;padding:4px 8px">🎮 ' + h.gameEffect + '</div>'
        + '</div>';
    }
    seasonSec.appendChild(card);
  });
}

function toggleHerbNightCard(bodyId) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var arrId = bodyId.replace('hnb-','harr-').replace('hsb-','harr-');
  var arr = document.getElementById(arrId);
  if(arr) arr.textContent = open ? '▼' : '▲';
}

// ══ 물약 도감 ══
const POTION_CODEX = [
  { id:'healing',   icon:'🧪', name:'치유 물약',   engName:'Healing Potion',
    color:'rgba(255,80,80,.15)', border:'rgba(255,80,80,.4)',
    ingredients:'약초 3 + 수초 2',
    effect:'HP와 Vitality를 회복한다.',
    note:'기본 중의 기본. 처음 만들었을 때 색깔이 예뻐서 맛보려다가 Aqua에게 제지당했다. "선생님, 제발 직접 드시지 마세요." 아직도 조금 억울하다.',
    unlock:'처음 제조 시 해금' },
  { id:'moon',      icon:'🌙', name:'달빛 물약',   engName:'Moon Potion',
    color:'rgba(100,80,220,.15)', border:'rgba(100,80,220,.4)',
    ingredients:'달빛꽃잎 3 + 수초 2',
    effect:'야간 채집 효율이 상승한다.',
    note:'달빛이 담긴 느낌이 나는 물약. 마시면 달빛 아래서 눈이 더 밝아지는 기분이다. 실제 효과가 있는 건지 플라시보인지는 여전히 연구 중이다.',
    unlock:'달빛꽃잎 3개 이상 보유 시 해금' },
  { id:'forest',    icon:'🌲', name:'숲의 정수',   engName:'Forest Essence',
    color:'rgba(50,150,80,.15)', border:'rgba(50,150,80,.4)',
    ingredients:'수지 3 + 이끼 2',
    effect:'가르릉숲과 벨벳이끼언덕에서 채집량이 늘어난다.',
    note:'숲의 기운을 담은 물약. 만들 때 온 실험실에 숲 냄새가 가득 찬다. Ink가 "숲에 온 것 같다"고 했다. 칭찬인지 불평인지 모르겠다.',
    unlock:'수지 3개 이상 보유 시 해금' },
  { id:'dream',     icon:'💭', name:'꿈의 물약',   engName:'Dream Potion',
    color:'rgba(180,100,220,.15)', border:'rgba(180,100,220,.4)',
    ingredients:'희귀초 2 + 달빛꽃잎 2 + 별빛풀 1',
    effect:'다음날 이벤트 발생 확률이 높아진다.',
    note:'마시면 그날 밤 이상한 꿈을 꾼다. Luna가 마시고 나서 "바바 선생님이 춤을 추는 꿈을 꿨다"고 했다. 그 이후로 이 물약이 무섭다.',
    unlock:'희귀초 2개 이상 보유 시 해금' },
  { id:'legendary', icon:'⭐', name:'전설의 물약', engName:'Legendary Elixir',
    color:'rgba(220,170,50,.15)', border:'rgba(220,170,50,.4)',
    ingredients:'희귀초 3 + 별빛풀 2 + 발광버섯 2 + 그림자잎 1',
    effect:'모든 능력치를 하루 동안 강화한다.',
    note:'만들기도 어렵고 재료도 귀하다. 처음 완성했을 때 세 제자가 동시에 "우와" 하고 감탄했다. 그 이후로 셋이 이걸 만들어 달라고 매일 졸라댄다. 재료가 부족하다고 몇 번을 말해도 소용없다.',
    unlock:'전설의 물약 첫 제조 후 해금' },
];

function renderPotionCodex() {
  var grid = document.getElementById('potion-codex-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!G.potionInv) G.potionInv = {healing:0,moon:0,forest:0,dream:0,legendary:0};
  if(!G.herbs) return;

  var unlockCond = {
    healing:  true,
    moon:     (G.herbs.moonpetal||0) >= 3,
    forest:   (G.herbs.resin||0) >= 3,
    dream:    (G.herbs.rare||0) >= 2,
    legendary:(G.potionInv.legendary||0) >= 1 || (G.herbs.rare||0) >= 3,
  };
  // 한 번이라도 제조했으면 해금
  POTION_CODEX.forEach(function(p) {
    if((G.potionInv[p.id]||0) >= 1) unlockCond[p.id] = true;
  });

  var totalUnlocked = 0;
  POTION_CODEX.forEach(function(p) {
    var unlocked = unlockCond[p.id];
    if(unlocked) totalUnlocked++;
    var have = G.potionInv[p.id] || 0;
    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:1.5px solid ' + (unlocked ? p.border : 'rgba(150,130,100,.2)') + ';background:' + (unlocked ? p.color : 'rgba(30,25,15,.3)') + ';margin-bottom:8px;overflow:hidden';
    if(!unlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.8rem;filter:grayscale(1) opacity(.3)">⚗️</span>'
        + '<div><div style="font-size:.85rem;color:rgba(150,130,100,.4);font-family:Cinzel,serif">??? 미발견 물약</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,100,.3)">' + p.unlock + '</div></div></div>';
    } else {
      var bodyId = 'pcb-' + p.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid ' + p.border + '" onclick="togglePotionCard(\'' + bodyId + '\',\'' + p.id + '\')">'
        + '<span style="font-size:1.8rem">' + p.icon + '</span>'
        + '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--ink2)">' + p.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + p.engName + '</div></div>'
        + '<div style="text-align:right;flex-shrink:0"><div style="font-size:.68rem;color:var(--ink2);opacity:.7">보유 ' + have + '개</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5;margin-left:4px" id="parr-' + p.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">🧫 <b>재료:</b> ' + p.ingredients + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(0,0,0,.06);border-radius:6px;border-left:3px solid ' + p.border + ';margin-bottom:7px">✨ <b>효과:</b> ' + p.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;background:rgba(0,0,0,.04);border-radius:6px;border-left:3px solid rgba(150,130,100,.3);font-style:italic">📝 ' + p.note + '</div>'
        + '</div>';
    }
    grid.appendChild(card);
  });

  var fill = document.getElementById('potion-codex-fill');
  var lbl  = document.getElementById('potion-codex-label');
  var pct  = Math.round(totalUnlocked / POTION_CODEX.length * 100);
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent = totalUnlocked + ' / ' + POTION_CODEX.length + ' 해금';
}

function togglePotionCard(bodyId, pid) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var arr = document.getElementById('parr-' + pid);
  if(arr) arr.textContent = open ? '▼' : '▲';
}

// ══ 바바의 연구 노트 ══
const RESEARCH_NOTES = [
  { id:'start',     icon:'📝', title:'새로운 시작',
    cond: function() { return G.day >= 1; },
    condLabel:'Day 1 시작 시',
    content:'드디어 이 정원에서 새 출발을 하게 되었다. 약초들은 건강하고, 공기는 맑다. 제자들도 아직은 의욕에 넘쳐 보인다. 언제까지 지속될지는 모르겠지만, 일단 기록을 남기기로 했다. 이 노트가 언젠가 도움이 되기를 바란다. — Baba' },
  { id:'first_herb', icon:'🌿', title:'첫 번째 채집',
    cond: function() { return G.stats && G.stats.totalHerb >= 1; },
    condLabel:'첫 약초 채집 후',
    content:'오늘 처음으로 약초를 채집했다. 손이 서툴러서 잎이 조금 찢겼지만, 성분은 살아있다. 약초는 다루는 사람의 마음을 느낀다고 한다. 긴장하지 말고 천천히. 그게 내가 배운 첫 번째 교훈이다. — Baba' },
  { id:'first_potion', icon:'⚗️', title:'첫 번째 연금술',
    cond: function() { return G.stats && G.stats.totalCraft >= 1; },
    condLabel:'첫 물약 제조 후',
    content:'마침내 물약을 만들었다. 재료들이 솥 안에서 끓어오를 때 나는 소리가 음악처럼 들렸다. 연금술이란 결국 자연과 대화하는 것이다. 재료를 이해하고, 불을 조절하고, 타이밍을 기다리면 된다. — Baba' },
  { id:'first_battle', icon:'⚔️', title:'정원의 위협',
    cond: function() { return G.stats && (G.stats.totalDays >= 3); },
    condLabel:'Day 3 이후',
    content:'정원이 완전히 평화롭지만은 않다는 것을 알았다. 가끔 이상한 생명체들이 나타난다. 하지만 두려워할 필요는 없다. 약초사는 자연의 일부이고, 자연에는 위협도 있지만 그것도 균형의 일부다. — Baba' },
  { id:'first_night',  icon:'🌙', title:'밤의 정원',
    cond: function() { var n = G.herbs; return n && (n.moonpetal||0)+(n.starweed||0)+(n.glowshroom||0)+(n.nightmoss||0)+(n.shadowleaf||0)+(n.lumiresin||0) >= 1; },
    condLabel:'첫 야간 채집 후',
    content:'밤의 정원은 낮과 전혀 다른 모습이다. 달빛 아래 빛나는 식물들, 어둠 속에 숨어있던 것들이 깨어난다. 낮에 볼 수 없었던 것들이 여기 있다. 밤을 두려워하지 말 것. 밤은 또 다른 세계다. — Baba' },
  { id:'quest_1',  icon:'📜', title:'도제 훈련 일지 1',
    cond: function() { return G.questsCompleted >= 1; },
    condLabel:'퀘스트 1개 완료 후',
    content:'첫 번째 도제 훈련 목표를 달성했다. Ink, Aqua, Luna 모두 제각각의 방식으로 성장하고 있다. Ink는 꼼꼼하고, Aqua는 창의적이며, Luna는 직관적이다. 세 명이 서로를 보완하면 나보다 나은 약초사가 될 것이다. — Baba' },
  { id:'quest_3',  icon:'📜', title:'도제 훈련 일지 2',
    cond: function() { return G.questsCompleted >= 3; },
    condLabel:'퀘스트 3개 완료 후',
    content:'벌써 세 번째 목표다. 처음보다 확실히 숙련되었다. 그런데 이상하게 제자들이 점점 대담해지고 있다. Aqua가 어제 내 실험을 "개선해보겠다"고 했다. 기대 반, 두려움 반. — Baba' },
  { id:'season_change', icon:'🍂', title:'계절이 바뀌면',
    cond: function() { return G.season >= 1; },
    condLabel:'첫 계절 변화 후',
    content:'계절이 바뀌었다. 정원의 모습이 달라졌다. 새로운 식물들이 나타났고, 예전 것들은 사라졌다. 자연은 항상 변한다. 그 변화에 저항하지 말고, 함께 흘러가는 것이 약초사의 마음가짐이다. — Baba' },
  { id:'rare_found', icon:'💎', title:'희귀초에 대한 고찰',
    cond: function() { return G.herbs && (G.herbs.rare||0) >= 1; },
    condLabel:'희귀초 첫 발견 후',
    content:'드디어 희귀초를 발견했다. 오래 찾아 헤맸는데 이렇게 눈앞에 있었다니. 희귀한 것은 사실 멀리 있지 않다. 우리가 제대로 보지 못했을 뿐이다. 이 교훈을 잊지 말아야겠다. — Baba' },
  { id:'mine_first', icon:'⛏️', title:'지하 세계의 신비',
    cond: function() { return G.crystalMined && Object.values(G.crystalMined).reduce(function(a,b){return a+b;},0) >= 1; },
    condLabel:'광산 첫 탐험 후',
    content:'처음으로 지하 광산에 들어갔다. 땅 아래 이런 세계가 있을 줄이야. 크리스탈들이 빛나는 것을 보니 자연은 지상뿐만 아니라 지하에도 경이로움을 숨겨두었다는 것을 알았다. — Baba' },
  { id:'ignis_met',  icon:'🔥', title:'불꽃 존재와의 만남',
    cond: function() { return G.ignisMetFlag || G.ignisUnlocked; },
    condLabel:'이그니스 조우 후',
    content:'이그니스라는 존재를 만났다. 불꽃으로 이루어진 신비로운 존재. 처음엔 두려웠지만 이야기를 나눠보니 그저 다른 형태의 생명일 뿐이었다. 자연에는 우리가 모르는 존재들이 아직 많다. — Baba' },
  { id:'library_visit', icon:'🏛️', title:'폐허 도서관의 비밀',
    cond: function() { return G.libraryVisited; },
    condLabel:'폐허 도서관 원정 후',
    content:'드디어 폐허 도서관에 다녀왔다. 수백 년 전 약초사들이 남긴 연구 기록들이 가득했다. 먼지가 쌓여있었지만 내용은 여전히 빛났다. 과거의 지식이 현재의 나를 더 깊게 만든다. — Baba' },
  { id:'desert_visit', icon:'🏜️', title:'오아시스의 기억',
    cond: function() { return G.desertVisited; },
    condLabel:'사막 오아시스 원정 후',
    content:'The Great Cat-mint Market을 직접 다녀왔다. 온갖 곳에서 온 고양이 상인들로 북적였다. 고양이민트 향이 사막 바람에 실려왔다. 세상은 넓고 약초사는 아직 갈 길이 멀다. — Baba' },
  { id:'day30',    icon:'⭐', title:'30일간의 기록',
    cond: function() { return G.day >= 30; },
    condLabel:'Day 30 도달 후',
    content:'어느덧 30일이 지났다. 처음 이 정원에 왔을 때가 엊그제 같은데. 많은 것을 배웠고, 많은 것을 잃었으며, 더 많은 것을 얻었다. 약초사의 길은 끝이 없다. 오늘도 정원은 나를 기다리고 있다. — Baba' },
];

function renderResearchNotes() {
  var grid = document.getElementById('research-notes-grid');
  if(!grid) return;
  grid.innerHTML = '';

  var unlocked = 0;
  var NOTE_IMG = {
  start:'1newstart',
  first_herb:'2firstcollect',
  first_potion:'3.firstalchemist',
  first_battle:'4threattothegarden',
  first_night:'5gardenofnight',
  quest_1:'6dogetrining1',
  quest_3:'7dogetraining2',
  season_change:'8seasonchange',
  rare_found:'9.aboutrareplant',
  mine_first:'10mysteriesoftheunderground',
  ignis_met:'11meetwihtignis',
  library_visit:'12secretofruinlibrary',
  desert_visit:'13memoryofoasis',
  day30:'14recordof30days'
};
  var total = RESEARCH_NOTES.length;

  RESEARCH_NOTES.forEach(function(note) {
    var isUnlocked = false;
    try { isUnlocked = note.cond(); } catch(e) {}
    if(isUnlocked) unlocked++;

    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:none;background:' + (isUnlocked ? 'url(guidebook/cardbackground.png) center/110% 100% no-repeat' : 'rgba(30,25,10,.2)') + ';margin-bottom:8px;overflow:visible;padding:4px';
    if(!isUnlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.5rem;filter:brightness(0) opacity(.2)">📜</span>'
        + '<div><div style="font-size:.82rem;color:rgba(180,150,80,.3);font-family:Cinzel,serif">???</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,60,.3)">' + note.condLabel + '</div></div>'
        + '<span style="margin-left:auto;font-size:1rem;opacity:.2">🔒</span></div>';
    } else {
      var bodyId = 'rnb-' + note.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid rgba(184,137,26,.3)" onclick="toggleNoteCard(\'' + bodyId + '\',\'' + note.id + '\')">'
        + '<img src="guidebook/research_journal/' + (NOTE_IMG[note.id]||note.id) + '.png" style="width:2.2rem;height:2.2rem;object-fit:contain;flex-shrink:0;" onerror="this.style.display=\'none\'"/>'
        + '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:var(--gold2)">' + note.title + '</div>'
        + '<div style="font-size:.63rem;color:var(--ink2);opacity:.6">' + note.condLabel + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="narr-' + note.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:12px 13px">'
        + '<div style="font-size:.8rem;color:var(--ink2);line-height:1.7;padding:10px 12px;background:rgba(184,137,26,.06);border-radius:7px;border-left:3px solid rgba(184,137,26,.4);font-style:italic">'
        + note.content + '</div></div>';
    }
    grid.appendChild(card);
  });

  var fill = document.getElementById('research-notes-fill');
  var lbl  = document.getElementById('research-notes-label');
  var pct  = Math.round(unlocked / total * 100);
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent = unlocked + ' / ' + total + ' 해금';
}

function toggleNoteCard(bodyId, noteId) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var arr = document.getElementById('narr-' + noteId);
  if(arr) arr.textContent = open ? '▼' : '▲';
}
