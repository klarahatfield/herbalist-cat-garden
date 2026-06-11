// ╔══════════════════════════════════════════════════════╗
// ║  codex_system.js  —  logic only (lang/ko.js or      ║
// ║  lang/en.js must be loaded before this file)        ║
// ╚══════════════════════════════════════════════════════╝

// ── 언어 데이터 연결 ──
var HERBS_MAIN     = LANG.HERBS_MAIN;
var HERB_NIGHT     = LANG.HERB_NIGHT;
var HERB_SEASON    = LANG.HERB_SEASON;
var POTION_CODEX   = LANG.POTION_CODEX;
var RESEARCH_NOTES = LANG.RESEARCH_NOTES;
var QUEST_DEFS     = LANG.QUEST_DEFS;
var UI             = LANG.UI;

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

function renderHerbarium() {
  var grid = document.getElementById('herb-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!G.herbs) return;

  HERBS_MAIN.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var unlocked = amt >= h.unlockAmt;
    var card = document.createElement('div');
    card.className = 'herb-card' + (unlocked ? '' : ' locked');
    if(!unlocked) {
      card.innerHTML = '<div class="herb-card-header">'
        + '<span class="hc-icon" style="filter:grayscale(1)">🌿</span>'
        + '<div class="hc-main">'
        + '<div class="hc-name" style="color:var(--ink2)">' + UI.undiscoveredHerb + '</div>'
        + '<div class="hc-latin">' + h.name + ' ' + h.unlockAmt + UI.unlockHint + '</div>'
        + '</div>'
        + '<span class="hc-lock">🔒 ' + amt + '/' + h.unlockAmt + '</span>'
        + '</div>';
    } else {
      var bodyId = 'hb-' + h.id;
      card.innerHTML = '<div class="herb-card-header" onclick="toggleHerbCard(\'' + bodyId + '\')" style="cursor:pointer">'
        + '<span class="hc-icon">' + h.icon + '</span>'
        + '<div class="hc-main">'
        + '<div class="hc-name">' + h.name + ' <span style="font-size:.7rem;color:var(--ink2);opacity:.7">(' + h.engName + ')</span></div>'
        + '<div class="hc-latin" style="font-style:italic;opacity:.6">' + h.latin + '</div>'
        + '</div>'
        + '<span style="font-size:.7rem;color:#a0d080">✅ ' + amt + '</span>'
        + '<span style="font-size:.7rem;color:#a0906a;margin-left:6px" id="harr-main-' + h.id + '">▼</span>'
        + '</div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px;border-top:1px solid rgba(180,130,50,.2)">'
        + '<div style="font-size:.72rem;color:var(--ink2);margin-bottom:6px">📍 ' + h.habitat + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(180,130,50,.06);border-radius:6px;margin-bottom:7px">💊 <b>' + UI.ingredients + ':</b> ' + h.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;background:rgba(180,130,50,.04);border-radius:6px;margin-bottom:6px;font-style:italic">📝 ' + h.note + '</div>'
        + '<div style="font-size:.7rem;color:var(--ink2);background:rgba(180,130,50,.06);border-radius:5px;padding:4px 8px">🎮 ' + h.gameEffect + '</div>'
        + '</div>';
    }
    grid.appendChild(card);
  });
}

function renderHerbCodexSections() {
  var nightSec = document.getElementById('herb-night-sec');
  if(!nightSec) return;
  nightSec.innerHTML = '';
  if(!G.herbs) return;
  var UNLOCK_AMT = 3;

  HERB_NIGHT.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var unlocked = amt >= UNLOCK_AMT;
    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:1.5px solid ' + (unlocked ? 'rgba(100,80,200,.5)' : 'rgba(60,40,100,.2)') + ';background:' + (unlocked ? 'rgba(40,20,80,.4)' : 'rgba(20,10,40,.3)') + ';margin-bottom:8px;overflow:hidden';
    if(!unlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.8rem;filter:brightness(0) opacity(.2)">🌑</span>'
        + '<div><div style="font-size:.85rem;color:rgba(150,100,200,.4)">' + UI.undiscoveredNight + '</div>'
        + '<div style="font-size:.65rem;color:rgba(100,60,160,.4)">' + UI.nightUnlockHint + ' ' + UNLOCK_AMT + UI.nightHarvestCount + '</div></div>'
        + '<span style="margin-left:auto;font-size:.68rem;color:rgba(100,60,160,.3)">' + amt + '/' + UNLOCK_AMT + '</span></div>';
    } else {
      var bodyId = 'hnb-' + h.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer" onclick="toggleHerbNightCard(\'' + bodyId + '\')">'
        + '<span style="font-size:1.8rem">' + h.icon + '</span>'
        + '<div style="flex:1"><div style="font-size:.88rem;color:var(--ink2)">' + h.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + h.engName + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="harr-' + h.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">📍 ' + h.habitat + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(100,60,200,.08);border-radius:6px;margin-bottom:7px">💊 ' + h.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;font-style:italic;margin-bottom:6px">📝 ' + h.note + '</div>'
        + '<div style="font-size:.7rem;color:var(--ink2);background:rgba(100,60,200,.08);border-radius:5px;padding:4px 8px">🎮 ' + h.gameEffect + '</div>'
        + '</div>';
    }
    nightSec.appendChild(card);
  });

  var seasonSec = document.getElementById('herb-season-sec');
  if(!seasonSec) return;
  seasonSec.innerHTML = '';

  HERB_SEASON.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var unlocked = amt >= 1;
    var borderColor = {봄:'rgba(255,150,180,.5)',여름:'rgba(255,200,50,.5)',가을:'rgba(200,100,50,.5)',겨울:'rgba(100,180,255,.5)',
                       Spring:'rgba(255,150,180,.5)',Summer:'rgba(255,200,50,.5)',Autumn:'rgba(200,100,50,.5)',Winter:'rgba(100,180,255,.5)'}[h.season] || 'rgba(150,150,150,.3)';
    var bgColor =     {봄:'rgba(255,150,180,.1)',여름:'rgba(255,200,50,.08)',가을:'rgba(200,100,50,.1)',겨울:'rgba(100,180,255,.1)',
                       Spring:'rgba(255,150,180,.1)',Summer:'rgba(255,200,50,.08)',Autumn:'rgba(200,100,50,.1)',Winter:'rgba(100,180,255,.1)'}[h.season] || 'rgba(100,100,100,.05)';
    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:1.5px solid ' + (unlocked ? borderColor : 'rgba(150,130,100,.2)') + ';background:' + (unlocked ? bgColor : 'rgba(30,25,15,.3)') + ';margin-bottom:8px;overflow:hidden';
    if(!unlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.8rem;filter:grayscale(1) opacity(.3)">' + h.seasonIcon + '</span>'
        + '<div><div style="font-size:.85rem;color:rgba(150,130,100,.4)">??? ' + h.season + ' ' + UI.seasonPlant + '</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,100,.3)">' + h.season + ' ' + UI.seasonUnlockHint + '</div></div></div>';
    } else {
      var bodyId = 'hsb-' + h.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer" onclick="toggleHerbNightCard(\'' + bodyId + '\')">'
        + '<span style="font-size:1.8rem">' + h.icon + '</span>'
        + '<div style="flex:1"><div style="font-size:.88rem;color:var(--ink2)">' + h.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + h.engName + ' · ' + h.seasonIcon + ' ' + h.season + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="harr-' + h.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">📍 ' + h.habitat + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(0,0,0,.06);border-radius:6px;margin-bottom:7px">💊 ' + h.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;font-style:italic;margin-bottom:6px">📝 ' + h.note + '</div>'
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

function renderPotionCodex() {
  var grid = document.getElementById('potion-codex-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!G.potionInv) G.potionInv = {healing:0,moon:0,forest:0,dream:0,legendary:0};
  if(!G.herbs) return;

  var unlockCond = {
    healing: true,
    moon:      (G.herbs.moonpetal||0) >= 3,
    forest:    (G.herbs.resin||0) >= 3,
    dream:     (G.herbs.rare||0) >= 2,
    legendary: (G.potionInv.legendary||0) >= 1 || (G.herbs.rare||0) >= 3,
  };
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
        + '<div><div style="font-size:.85rem;color:rgba(150,130,100,.4)">' + UI.undiscoveredPotion + '</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,100,.3)">' + p.unlock + '</div></div></div>';
    } else {
      var bodyId = 'pcb-' + p.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid ' + p.border + '" onclick="togglePotionCard(\'' + bodyId + '\',\'' + p.id + '\')">'
        + '<span style="font-size:1.8rem">' + p.icon + '</span>'
        + '<div style="flex:1"><div style="font-size:.88rem;color:var(--ink2)">' + p.name + '</div>'
        + '<div style="font-size:.65rem;color:var(--ink2);opacity:.6">' + p.engName + '</div></div>'
        + '<div style="font-size:.68rem;color:var(--ink2);opacity:.7">' + UI.haveLabel + ' ' + have + '</div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5;margin-left:4px" id="parr-' + p.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:10px 13px">'
        + '<div style="font-size:.75rem;color:var(--ink2);margin-bottom:6px">🧫 ' + UI.ingredients + ': ' + p.ingredients + '</div>'
        + '<div style="font-size:.78rem;color:var(--ink2);line-height:1.55;padding:6px 9px;background:rgba(0,0,0,.06);border-radius:6px;margin-bottom:7px">✨ ' + p.effect + '</div>'
        + '<div style="font-size:.75rem;color:var(--ink2);line-height:1.6;padding:6px 9px;font-style:italic">📝 ' + p.note + '</div>'
        + '</div>';
    }
    grid.appendChild(card);
  });

  var fill = document.getElementById('potion-codex-fill');
  var lbl  = document.getElementById('potion-codex-label');
  var pct  = Math.round(totalUnlocked / POTION_CODEX.length * 100);
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent  = totalUnlocked + ' / ' + POTION_CODEX.length + ' ' + UI.codexUnlocked;
}

function togglePotionCard(bodyId, pid) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var arr = document.getElementById('parr-' + pid);
  if(arr) arr.textContent = open ? '▼' : '▲';
}

function renderResearchNotes() {
  var grid = document.getElementById('research-notes-grid');
  if(!grid) return;
  grid.innerHTML = '';

  var NOTE_CONDS = {
    start:         function() { return G.day >= 1; },
    first_herb:    function() { return G.stats && G.stats.totalHerb >= 1; },
    first_potion:  function() { return G.stats && G.stats.totalCraft >= 1; },
    first_battle:  function() { return G.stats && G.stats.totalDays >= 3; },
    first_night:   function() { var n = G.herbs; return n && (n.moonpetal||0)+(n.starweed||0)+(n.glowshroom||0)+(n.nightmoss||0)+(n.shadowleaf||0)+(n.lumiresin||0) >= 1; },
    quest_1:       function() { return G.questsCompleted >= 1; },
    quest_3:       function() { return G.questsCompleted >= 3; },
    season_change: function() { return G.season >= 1; },
    rare_found:    function() { return G.herbs && (G.herbs.rare||0) >= 1; },
    mine_first:    function() { return G.crystalMined && Object.values(G.crystalMined).reduce(function(a,b){return a+b;},0) >= 1; },
    ignis_met:     function() { return G.ignisMetFlag || G.ignisUnlocked; },
    library_visit: function() { return G.libraryVisited; },
    desert_visit:  function() { return G.desertVisited; },
    day30:         function() { return G.day >= 30; },
  };

  var NOTE_IMG = {
    start:'1newstart', first_herb:'2firstcollect', first_potion:'3.firstalchemist',
    first_battle:'4threattothegarden', first_night:'5gardenofnight',
    quest_1:'6dogetrining1', quest_3:'7dogetraining2', season_change:'8seasonchange',
    rare_found:'9.aboutrareplant', mine_first:'10mysteriesoftheunderground',
    ignis_met:'11meetwihtignis', library_visit:'12secretofruinlibrary',
    desert_visit:'13memoryofoasis', day30:'14recordof30days'
  };

  var unlocked = 0;
  var total = RESEARCH_NOTES.length;

  RESEARCH_NOTES.forEach(function(note) {
    var isUnlocked = false;
    try { isUnlocked = NOTE_CONDS[note.id] ? NOTE_CONDS[note.id]() : false; } catch(e) {}
    if(isUnlocked) unlocked++;

    var card = document.createElement('div');
    card.style.cssText = 'border-radius:10px;border:none;background:' + (isUnlocked ? 'url(guidebook/cardbackground.png) center/110% 100% no-repeat' : 'rgba(30,25,10,.2)') + ';margin-bottom:8px;overflow:visible;padding:4px';

    if(!isUnlocked) {
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px">'
        + '<span style="font-size:1.5rem;filter:brightness(0) opacity(.2)">📜</span>'
        + '<div><div style="font-size:.82rem;color:rgba(180,150,80,.3)">???</div>'
        + '<div style="font-size:.65rem;color:rgba(150,130,60,.3)">' + note.condLabel + '</div></div>'
        + '<span style="margin-left:auto;font-size:1rem;opacity:.2">🔒</span></div>';
    } else {
      var bodyId = 'rnb-' + note.id;
      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;border-bottom:1px solid rgba(184,137,26,.3)" onclick="toggleNoteCard(\'' + bodyId + '\',\'' + note.id + '\')">'
        + '<img src="guidebook/research_journal/' + (NOTE_IMG[note.id]||note.id) + '.png" style="width:2.2rem;height:2.2rem;object-fit:contain;flex-shrink:0;" onerror="this.style.display=\'none\'"/>'
        + '<div style="flex:1"><div style="font-size:.88rem;color:var(--gold2)">' + note.title + '</div>'
        + '<div style="font-size:.63rem;color:var(--ink2);opacity:.6">' + note.condLabel + '</div></div>'
        + '<span style="font-size:.7rem;color:var(--ink2);opacity:.5" id="narr-' + note.id + '">▼</span></div>'
        + '<div id="' + bodyId + '" style="display:none;padding:12px 13px">'
        + '<div style="font-size:.8rem;color:var(--ink2);line-height:1.7;padding:10px 12px;background:rgba(184,137,26,.06);border-radius:7px;font-style:italic">'
        + note.content + '</div></div>';
    }
    grid.appendChild(card);
  });

  var fill = document.getElementById('research-notes-fill');
  var lbl  = document.getElementById('research-notes-label');
  var pct  = Math.round(unlocked / total * 100);
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent  = unlocked + ' / ' + total + ' ' + UI.codexUnlocked;
}

function toggleNoteCard(bodyId, noteId) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var arr = document.getElementById('narr-' + noteId);
  if(arr) arr.textContent = open ? '▼' : '▲';
}

// ══ 인벤토리 ══
function switchInvTab(tab) {
  ['herb','potion','material'].forEach(function(t) {
    var btn = document.getElementById('itab-' + t);
    var sec = document.getElementById('isec-' + t);
    if(btn) btn.classList.toggle('active', t === tab);
    if(sec) sec.style.display = (t === tab) ? 'block' : 'none';
  });
  if(tab === 'herb')     renderInvHerbs();
  if(tab === 'potion')   renderInvPotions();
  if(tab === 'material') renderInvMaterials();
}

function renderInvHerbs() {
  var grid = document.getElementById('inv-herb-grid');
  if(!grid || !G.herbs) return;
  grid.innerHTML = '';
  LANG.INV_HERBS.forEach(function(h) {
    var amt = G.herbs[h.id] || 0;
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1px solid rgba(180,130,50,' + (amt > 0 ? '.35' : '.12') + ');background:rgba(180,130,50,' + (amt > 0 ? '.08' : '.03') + ');margin-bottom:7px';
    div.innerHTML = '<span style="font-size:1.6rem">' + h.icon + '</span>'
      + '<span style="flex:1;font-size:.88rem;color:' + (amt > 0 ? '#f0d080' : '#888') + '">' + h.name + '</span>'
      + '<span style="font-size:.85rem;color:' + (amt > 0 ? '#a0d080' : '#666') + ';font-weight:bold">' + amt + '</span>';
    grid.appendChild(div);
  });
}

function renderInvPotions() {
  var grid = document.getElementById('inv-potion-grid');
  if(!grid) return;
  if(!G.potionInv) G.potionInv = {};
  grid.innerHTML = '';
  LANG.INV_POTIONS.forEach(function(p) {
    var amt = G.potionInv[p.id] || 0;
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;border:1px solid rgba(180,130,50,' + (amt > 0 ? '.35' : '.12') + ');background:rgba(180,130,50,' + (amt > 0 ? '.08' : '.03') + ');margin-bottom:7px';
    div.innerHTML = '<span style="font-size:1.6rem">' + p.icon + '</span>'
      + '<span style="flex:1;font-size:.88rem;color:' + (amt > 0 ? '#f0d080' : '#888') + '">' + p.name + '</span>'
      + '<span style="font-size:.85rem;color:' + (amt > 0 ? '#a0d080' : '#666') + ';font-weight:bold">' + amt + '</span>';
    grid.appendChild(div);
  });
}

function renderInvMaterials() {
  var grid = document.getElementById('inv-material-grid');
  if(!grid) return;
  grid.innerHTML = '';
}

// ══ 상점 시스템 ══
function switchShopTab(tab) {
  ['material','tool','sell'].forEach(function(t) {
    var btn = document.getElementById('stab-' + t);
    var sec = document.getElementById('ssec-' + t);
    if(btn) btn.classList.toggle('active', t === tab);
    if(sec) sec.style.display = (t === tab) ? 'block' : 'none';
  });
  if(tab === 'sell') renderSellGrid();
}

function renderSellGrid() {
  var grid = document.getElementById('shop-sell-grid');
  if(!grid) return;
  grid.innerHTML = '';

  var herbTitle = document.createElement('div');
  herbTitle.style.cssText = 'font-size:.75rem;color:#a0906a;margin-bottom:8px;margin-top:4px';
  herbTitle.textContent = UI.sellHerbSection;
  grid.appendChild(herbTitle);

  LANG.SELL_HERBS.forEach(function(item) {
    var amt = (G.herbs && G.herbs[item.id]) || 0;
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;border:1px solid rgba(180,130,50,' + (amt > 0 ? '.35' : '.12') + ');background:rgba(180,130,50,' + (amt > 0 ? '.08' : '.03') + ');margin-bottom:6px';
    div.innerHTML = '<span style="font-size:1.3rem">' + item.icon + '</span>'
      + '<span style="flex:1;font-size:.82rem;color:' + (amt > 0 ? '#f0d080' : '#888') + '">' + item.name + '</span>'
      + '<span style="font-size:.72rem;color:#a0906a">' + UI.haveLabel + ' ' + amt + '</span>'
      + '<span style="font-size:.72rem;color:#f0c030;margin:0 6px">🪙' + item.price + '</span>'
      + '<button onclick="sellItem(\'herb\',\'' + item.id + '\',' + item.price + ')" '
      + (amt > 0 ? '' : 'disabled ')
      + 'style="padding:3px 8px;border-radius:6px;background:rgba(180,130,50,' + (amt > 0 ? '.3' : '.1') + ');border:1px solid rgba(180,130,50,.4);color:' + (amt > 0 ? '#f0d080' : '#666') + ';font-size:.7rem;cursor:' + (amt > 0 ? 'pointer' : 'default') + '">' + UI.sellBtn + '</button>';
    grid.appendChild(div);
  });

  var potionTitle = document.createElement('div');
  potionTitle.style.cssText = 'font-size:.75rem;color:#a0906a;margin-bottom:8px;margin-top:12px';
  potionTitle.textContent = UI.sellPotionSection;
  grid.appendChild(potionTitle);

  LANG.SELL_POTIONS.forEach(function(item) {
    var amt = (G.potionInv && G.potionInv[item.id]) || 0;
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;border:1px solid rgba(180,130,50,' + (amt > 0 ? '.35' : '.12') + ');background:rgba(180,130,50,' + (amt > 0 ? '.08' : '.03') + ');margin-bottom:6px';
    div.innerHTML = '<span style="font-size:1.3rem">' + item.icon + '</span>'
      + '<span style="flex:1;font-size:.82rem;color:' + (amt > 0 ? '#f0d080' : '#888') + '">' + item.name + '</span>'
      + '<span style="font-size:.72rem;color:#a0906a">' + UI.haveLabel + ' ' + amt + '</span>'
      + '<span style="font-size:.72rem;color:#f0c030;margin:0 6px">🪙' + item.price + '</span>'
      + '<button onclick="sellItem(\'potion\',\'' + item.id + '\',' + item.price + ')" '
      + (amt > 0 ? '' : 'disabled ')
      + 'style="padding:3px 8px;border-radius:6px;background:rgba(180,130,50,' + (amt > 0 ? '.3' : '.1') + ');border:1px solid rgba(180,130,50,.4);color:' + (amt > 0 ? '#f0d080' : '#666') + ';font-size:.7rem;cursor:' + (amt > 0 ? 'pointer' : 'default') + '">' + UI.sellBtn + '</button>';
    grid.appendChild(div);
  });
}

function sellItem(type, id, price) {
  var maxAmt = type === 'herb' ? ((G.herbs && G.herbs[id]) || 0) : ((G.potionInv && G.potionInv[id]) || 0);
  if(maxAmt <= 0) { msg(UI.noStock); return; }

  var existing = document.getElementById('sell-popup');
  if(existing) existing.remove();

  var popup = document.createElement('div');
  popup.id = 'sell-popup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;';
  popup.innerHTML = '<div style="background:#1a1205;border:2px solid #8B6914;border-radius:16px;padding:24px;width:80%;max-width:300px;text-align:center">'
    + '<div style="font-size:.9rem;color:#f0d080;margin-bottom:16px">' + UI.sellTitle + '</div>'
    + '<div style="font-size:.8rem;color:#a0906a;margin-bottom:12px">' + UI.sellMax + ' ' + maxAmt + ' | 🪙' + price + UI.sellPer + '</div>'
    + '<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px">'
    + '<button onclick="changeSellQty(-1,' + maxAmt + ',' + price + ')" style="width:32px;height:32px;border-radius:50%;background:rgba(180,130,50,.2);border:1px solid rgba(180,130,50,.4);color:#f0d080;font-size:1.2rem;cursor:pointer">-</button>'
    + '<input id="sell-qty-input" type="number" min="1" max="' + maxAmt + '" value="1" style="width:60px;text-align:center;background:rgba(0,0,0,.3);border:1px solid rgba(180,130,50,.4);border-radius:8px;color:#f0d080;font-size:1rem;padding:4px">'
    + '<button onclick="changeSellQty(1,' + maxAmt + ',' + price + ')" style="width:32px;height:32px;border-radius:50%;background:rgba(180,130,50,.2);border:1px solid rgba(180,130,50,.4);color:#f0d080;font-size:1.2rem;cursor:pointer">+</button>'
    + '</div>'
    + '<div id="sell-total" data-price="' + price + '" style="font-size:.85rem;color:#f0c030;margin-bottom:16px">' + UI.sellTotal + ' 🪙' + price + '</div>'
    + '<div style="display:flex;gap:8px">'
    + '<button onclick="closeSellPopup()" style="flex:1;padding:10px;border-radius:10px;background:rgba(100,100,100,.2);border:1px solid #555;color:#888;cursor:pointer">' + UI.sellCancel + '</button>'
    + '<button onclick="confirmSell(\'' + type + '\',\'' + id + '\',' + price + ',' + maxAmt + ')" style="flex:1;padding:10px;border-radius:10px;background:rgba(180,130,50,.3);border:1px solid rgba(180,130,50,.5);color:#f0d080;cursor:pointer">' + UI.sellBtn + '</button>'
    + '</div></div>';
  document.body.appendChild(popup);
}

function closeSellPopup() {
  var popup = document.getElementById('sell-popup');
  if(popup) popup.remove();
}

function changeSellQty(dir, max, price) {
  var input = document.getElementById('sell-qty-input');
  if(!input) return;
  var val = Math.min(Math.max(1, (parseInt(input.value)||1) + dir), max);
  input.value = val;
  var total = document.getElementById('sell-total');
  if(total) total.textContent = UI.sellTotal + ' 🪙' + (val * price);
}

function confirmSell(type, id, price, max) {
  var input = document.getElementById('sell-qty-input');
  if(!input) return;
  var qty = Math.min(Math.max(1, parseInt(input.value)||1), max);
  if(type === 'herb') {
    if(!G.herbs || (G.herbs[id]||0) < qty) { msg(UI.notEnough); return; }
    G.herbs[id] -= qty;
  } else {
    if(!G.potionInv || (G.potionInv[id]||0) < qty) { msg(UI.notEnough); return; }
    G.potionInv[id] -= qty;
  }
  if(!G.gold) G.gold = 0;
  G.gold += price * qty;
  saveG();
  updateHUD();
  msg('💰 ' + qty + UI.soldMsg + ' 🪙' + (price * qty) + ' ' + UI.goldGained);
  closeSellPopup();
  renderSellGrid();
}

// ══ 퀘스트 시스템 ══
function getQuestProgress(q) {
  if(!G.herbs) G.herbs = {};
  if(!G.potionInv) G.potionInv = {};
  switch(q.type) {
    case 'herb_total':      return G.herbs.herb || 0;
    case 'shroom_total':    return G.herbs.mushroom || 0;
    case 'moss_total':      return G.herbs.moss || 0;
    case 'lotus_total':     return G.herbs.aqua || 0;
    case 'resin_total':     return G.herbs.resin || 0;
    case 'rare_total':      return G.herbs.rare || 0;
    case 'craft_total':     return G.stats && G.stats.totalCraft || 0;
    case 'craft_moon':      return G.potionInv.moon || 0;
    case 'craft_legendary': return G.potionInv.legendary || 0;
    case 'day_reach':       return G.day || 1;
    default: return 0;
  }
}

function renderQuests() {
  var list = document.getElementById('quest-list');
  if(!list) return;
  if(!G.quests) G.quests = QUEST_DEFS.map(function(q) {
    return Object.assign({}, q, {prog:0, claimed:false});
  });
  QUEST_DEFS.forEach(function(def) {
    if(!G.quests.find(function(q){ return q.id === def.id; })) {
      G.quests.push(Object.assign({}, def, {prog:0, claimed:false}));
    }
  });

  list.innerHTML = '';
  var diffLabel = {easy: UI.questEasy, med: UI.questMed, hard: UI.questHard};
  var diffOrder = ['easy','med','hard'];

  diffOrder.forEach(function(diff) {
    var quests = G.quests.filter(function(q){ return q.diff === diff; });
    if(!quests.length) return;

    var title = document.createElement('div');
    title.style.cssText = 'font-size:.75rem;color:#a0906a;margin:12px 0 6px';
    title.textContent = diffLabel[diff];
    list.appendChild(title);

    quests.forEach(function(q) {
      var prog = getQuestProgress(q);
      var done = prog >= q.target;
      var pct  = Math.min(100, Math.floor(prog / q.target * 100));

      var rewardStr = Object.entries(q.reward).map(function(e) {
        if(e[0] === 'bronze') return '🪙' + e[1];
        if(e[0] === 'silver') return '🔘' + e[1];
        if(e[0] === 'golden') return '⭐' + e[1];
        return e[1];
      }).join(' ');

      var card = document.createElement('div');
      card.style.cssText = 'border-radius:10px;border:1px solid rgba(180,130,50,' + (done ? '.5' : '.2') + ');background:rgba(180,130,50,' + (done ? '.1' : '.04') + ');padding:12px;margin-bottom:8px';
      card.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        + '<span style="font-size:1.4rem">' + q.icon + '</span>'
        + '<div style="flex:1"><div style="font-size:.88rem;color:' + (done ? '#f0d080' : '#c8a060') + '">' + q.title + '</div>'
        + '<div style="font-size:.72rem;color:#a0906a;margin-top:2px">' + q.desc + '</div></div>'
        + '<div style="font-size:.72rem;color:#f0c030">' + rewardStr + '</div>'
        + '</div>'
        + '<div style="height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden;margin-bottom:6px">'
        + '<div style="height:100%;width:' + pct + '%;background:' + (done ? '#80d080' : 'rgba(180,130,50,.5)') + ';border-radius:3px;transition:width .3s"></div>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span style="font-size:.68rem;color:#a0906a">' + prog + ' / ' + q.target + '</span>'
        + (done && !q.claimed
          ? '<button onclick="claimQuest(\'' + q.id + '\')" style="padding:4px 12px;border-radius:6px;background:rgba(80,180,80,.3);border:1px solid #80d080;color:#80d080;font-size:.72rem;cursor:pointer">' + UI.claimReward + '</button>'
          : done && q.claimed
          ? '<span style="font-size:.68rem;color:#80d080">' + UI.questDone + '</span>'
          : '')
        + '</div>';
      list.appendChild(card);
    });
  });
}

function claimQuest(id) {
  var q = G.quests && G.quests.find(function(q){ return q.id === id; });
  if(!q || q.claimed) return;
  var prog = getQuestProgress(q);
  if(prog < q.target) return;

  q.claimed = true;
  if(!G.coins) G.coins = {bronze:0, silver:0, golden:0};
  if(q.reward.bronze) G.coins.bronze = (G.coins.bronze||0) + q.reward.bronze;
  if(q.reward.silver) G.coins.silver = (G.coins.silver||0) + q.reward.silver;
  if(q.reward.golden) G.coins.golden = (G.coins.golden||0) + q.reward.golden;
  if(!G.questsCompleted) G.questsCompleted = 0;
  G.questsCompleted++;

  saveG();
  updateHUD();
  msg(UI.questComplete + ' ' + q.title);
  renderQuests();
}

function toggleHerbCard(bodyId) {
  var el = document.getElementById(bodyId);
  if(!el) return;
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  var id = bodyId.replace('hb-','');
  var arr = document.getElementById('harr-main-' + id);
  if(arr) arr.textContent = open ? '▼' : '▲';
}