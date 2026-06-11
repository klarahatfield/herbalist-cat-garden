var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

var petalGame = {
  phase: 1,
  active: false,
  onSuccess: null,
  onFail: null,
  interval: null,
  steam: 50,
  formula: [],
  collected: [],
  flowers: [],
  pollen: false,
};

var FLOWER_TYPES = [
  { id:'purple', color:'#c080e0', icon:'🌸', name: MG ? MG.petalPurple : '보라 꽃' },
  { id:'yellow', color:'#e0c040', icon:'🌼', name: MG ? MG.petalYellow : '노랑 꽃' },
  { id:'pink',   color:'#e080a0', icon:'🌺', name: MG ? MG.petalPink   : '분홍 꽃' },
  { id:'blue',   color:'#6090e0', icon:'💐', name: MG ? MG.petalBlue   : '파랑 꽃' },
];

function openPetalMinigame(successCb, failCb) {
  petalGame.onSuccess = successCb;
  petalGame.onFail = failCb;
  petalGame.phase = 1;
  petalGame.active = true;
  petalGame.steam = 50;
  petalGame.collected = [];
  petalGame.pollen = false;

  document.getElementById('petal-minigame-popup').style.display = 'flex';
  renderPetalPhase1();
}

function closePetalMinigame() {
  clearInterval(petalGame.interval);
  petalGame.active = false;
  document.getElementById('petal-minigame-popup').style.display = 'none';
}

function renderPetalPhase1() {
  var c = document.getElementById('petal-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:.9rem;color:#d0a0e0;margin-bottom:4px">${MG ? MG.petalPhase1Title : '1단계 — 안개 걷기'}</div>
      <div style="font-size:.72rem;color:#a080b0;line-height:1.6">
        ${MG ? MG.petalPhase1Desc : '마우스를 움직여 안개를 걷어내세요<br>꽃들의 색깔을 기억해두세요!'}
      </div>
    </div>
    <div id="petal-fog-area" style="position:relative;width:100%;height:220px;background:radial-gradient(ellipse at center,rgba(60,20,80,.6) 0%,rgba(20,5,30,.9) 100%);border-radius:12px;border:1.5px solid rgba(180,100,220,.4);overflow:hidden;cursor:none">
      <div id="petal-flower-0" style="position:absolute;left:20%;top:30%;transform:translate(-50%,-50%);font-size:2rem;opacity:0;transition:opacity .3s">🌸</div>
      <div id="petal-flower-1" style="position:absolute;left:50%;top:55%;transform:translate(-50%,-50%);font-size:2rem;opacity:0;transition:opacity .3s">🌼</div>
      <div id="petal-flower-2" style="position:absolute;left:75%;top:30%;transform:translate(-50%,-50%);font-size:2rem;opacity:0;transition:opacity .3s">🌺</div>
      <div id="petal-flower-3" style="position:absolute;left:35%;top:70%;transform:translate(-50%,-50%);font-size:2rem;opacity:0;transition:opacity .3s">💐</div>
      <div id="petal-flower-4" style="position:absolute;left:65%;top:65%;transform:translate(-50%,-50%);font-size:2rem;opacity:0;transition:opacity .3s">🌸</div>
      <div id="petal-fog" style="position:absolute;inset:0;background:rgba(200,180,220,.85);backdrop-filter:blur(8px);pointer-events:none"></div>
      <div id="petal-cursor" style="position:absolute;width:50px;height:50px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.4) 0%,transparent 70%);transform:translate(-50%,-50%);pointer-events:none;z-index:10"></div>
    </div>
    <div id="petal-fog-progress" style="margin-top:8px">
      <div style="font-size:.68rem;color:#a080b0;margin-bottom:3px">${MG ? MG.petalPhase1Fog : '안개 제거: '}<span id="petal-fog-pct">0</span>%</div>
      <div style="height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden">
        <div id="petal-fog-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#c080e0,#e0a0f0);border-radius:3px;transition:width .1s"></div>
      </div>
    </div>
  `;

  var area = document.getElementById('petal-fog-area');
  var cursor = document.getElementById('petal-cursor');
  var fogEl = document.getElementById('petal-fog');
  var fogPct = 0;
  var clearedCells = new Set();

  petalGame.flowers = [];
  petalGame.formula.forEach(function(f) {
    for(var i = 0; i < f.count; i++) {
      petalGame.flowers.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: f.type });
    }
  });
  var formulaIds = petalGame.formula.map(function(f){ return f.type.id; });
  var decoyTypes = FLOWER_TYPES.filter(function(t){ return formulaIds.indexOf(t.id) === -1; });
  while(petalGame.flowers.length < 9) {
    var randType = decoyTypes.length > 0
      ? decoyTypes[Math.floor(Math.random() * decoyTypes.length)]
      : FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    petalGame.flowers.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: randType });
  }

  area.addEventListener('mousemove', function(e) {
    var rect = area.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var px = mx / rect.width * 100;
    var py = my / rect.height * 100;

    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';

    var cellKey = Math.floor(px/10) + '_' + Math.floor(py/10);
    if(!clearedCells.has(cellKey)) {
      clearedCells.add(cellKey);
      fogPct = Math.min(100, clearedCells.size * 1.2);
      document.getElementById('petal-fog-bar').style.width = fogPct + '%';
      document.getElementById('petal-fog-pct').textContent = Math.floor(fogPct);
      fogEl.style.opacity = 1 - (fogPct / 100) * 0.95;
    }

    petalGame.flowers.forEach(function(f, i) {
      var dist = Math.sqrt(Math.pow(px - f.x, 2) + Math.pow(py - f.y, 2));
      var el = document.getElementById('petal-flower-' + i);
      if(el) el.style.opacity = dist < 20 ? '1' : '0';
    });

    if(fogPct >= 80) {
      setTimeout(function(){ renderPetalPhase2(); }, 500);
    }
  });
}

function renderPetalPhase2() {
  clearInterval(petalGame.interval);

  var shuffled = FLOWER_TYPES.slice().sort(function(){ return Math.random() - 0.5; });
  petalGame.formula = [
    { type: shuffled[0], count: 2 },
    { type: shuffled[1], count: 1 },
  ];
  petalGame.collected = [];

  petalGame.flowers = [];
  petalGame.formula.forEach(function(f) {
    for(var i = 0; i < f.count; i++) {
      petalGame.flowers.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: f.type });
    }
  });
  var formulaIds = petalGame.formula.map(function(f){ return f.type.id; });
  var decoyTypes = FLOWER_TYPES.filter(function(t){ return formulaIds.indexOf(t.id) === -1; });
  while(petalGame.flowers.length < 9) {
    var randType = decoyTypes.length > 0
      ? decoyTypes[Math.floor(Math.random() * decoyTypes.length)]
      : FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    petalGame.flowers.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, type: randType });
  }

  var c = document.getElementById('petal-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:.9rem;color:#d0a0e0;margin-bottom:4px">${MG ? MG.petalPhase2Title : '2단계 — 향기 포집'}</div>
      <div style="font-size:.72rem;color:#a080b0;line-height:1.5">
        ${MG ? MG.petalPhase2Desc : '향기 공식에 맞는 꽃을 클릭하세요'}<br>
        <span style="color:#ff9090">⚠️ ${MG ? MG.petalPhase2Warn : '증기를 적정 온도로 유지하세요!'}</span>
      </div>
    </div>
    <div style="background:rgba(60,20,80,.4);border-radius:8px;padding:8px;margin-bottom:8px;border:1px solid rgba(180,100,220,.3)">
      <div style="font-size:.68rem;color:#a080b0;margin-bottom:4px">${MG ? MG.petalPhase2Formula : '📋 향기 공식:'}</div>
      <div style="display:flex;gap:8px;justify-content:center">
        ${petalGame.formula.map(function(f){ return '<div style="text-align:center"><div style="font-size:1.2rem">'+f.type.icon+'</div><div style="font-size:.65rem;color:'+f.type.color+'">×'+f.count+'</div></div>'; }).join('<div style="color:#a080b0;align-self:center">+</div>')}
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:.65rem;color:#a080b0;margin-bottom:3px">
        <span>${MG ? MG.petalPhase2Cold : '❄️ 차가움'}</span>
        <span>${MG ? MG.petalPhase2Temp : '증기 온도'}</span>
        <span>${MG ? MG.petalPhase2Hot : '🔥 뜨거움'}</span>
      </div>
      <div style="position:relative;height:16px;background:rgba(0,0,0,.3);border-radius:8px;overflow:hidden;border:1px solid rgba(180,100,220,.3)">
        <div style="position:absolute;left:35%;width:30%;height:100%;background:rgba(180,100,220,.25);border-left:2px solid #c080e0;border-right:2px solid #c080e0"></div>
        <div id="petal-steam-bar" style="position:absolute;top:0;left:50%;width:6px;height:100%;background:#e0c0f0;border-radius:3px;transform:translateX(-50%)"></div>
      </div>
      <div style="display:flex;gap:6px;justify-content:center;margin-top:6px">
        <button onmousedown="petalSteamStart(1)" onmouseup="petalSteamStop()" ontouchstart="petalSteamStart(1)" ontouchend="petalSteamStop()" style="padding:5px 14px;border-radius:8px;background:rgba(60,20,80,.4);border:1px solid rgba(180,100,220,.4);color:#d0a0e0;font-size:.72rem;cursor:pointer">${MG ? MG.petalPhase2Up : '🔥 올리기'}</button>
        <button onmousedown="petalSteamStart(-1)" onmouseup="petalSteamStop()" ontouchstart="petalSteamStart(-1)" ontouchend="petalSteamStop()" style="padding:5px 14px;border-radius:8px;background:rgba(60,20,80,.4);border:1px solid rgba(180,100,220,.4);color:#d0a0e0;font-size:.72rem;cursor:pointer">${MG ? MG.petalPhase2Down : '❄️ 내리기'}</button>
      </div>
    </div>
    <div id="petal-field" style="position:relative;width:100%;height:180px;background:radial-gradient(ellipse at center,rgba(60,20,80,.5) 0%,rgba(20,5,30,.8) 100%);border-radius:12px;border:1.5px solid rgba(180,100,220,.4);overflow:hidden">
      ${petalGame.flowers.map(function(f,i){ return '<div id="petal-f-'+i+'" onclick="collectFlower('+i+')" style="position:absolute;left:'+f.x+'%;top:'+f.y+'%;transform:translate(-50%,-50%);font-size:1.8rem;cursor:pointer;transition:transform .3s;filter:drop-shadow(0 0 6px '+f.type.color+')">'+f.type.icon+'</div>'; }).join('')}
    </div>
    <div id="petal-collected" style="display:flex;gap:6px;justify-content:center;margin-top:8px;min-height:30px;flex-wrap:wrap"></div>
    <div id="petal-phase2-msg" style="text-align:center;margin-top:4px;font-size:.72rem;color:#a080b0">${MG ? MG.petalPhase2Msg : '향기 공식에 맞는 꽃을 클릭하세요'}</div>
  `;

  petalGame.interval = setInterval(function() {
    petalGame.flowers.forEach(function(f, i) {
      f.x += (Math.random() - 0.5) * 1.5;
      f.y += (Math.random() - 0.5) * 1.5;
      f.x = Math.max(10, Math.min(90, f.x));
      f.y = Math.max(10, Math.min(90, f.y));
      var el = document.getElementById('petal-f-' + i);
      if(el) { el.style.left = f.x + '%'; el.style.top = f.y + '%'; }
    });
    petalGame.steam = Math.max(0, Math.min(100, petalGame.steam - 0.3));
    updatePetalSteam();
  }, 100);
}

var petalSteamDir = 0;
var petalSteamTimer = null;

function petalSteamStart(dir) {
  petalSteamDir = dir;
  petalSteamTimer = setInterval(function() {
    petalGame.steam = Math.max(0, Math.min(100, petalGame.steam + dir * 3));
    updatePetalSteam();
  }, 50);
}

function petalSteamStop() {
  clearInterval(petalSteamTimer);
}

function updatePetalSteam() {
  var bar = document.getElementById('petal-steam-bar');
  if(bar) bar.style.left = petalGame.steam + '%';
  var inZone = petalGame.steam >= 35 && petalGame.steam <= 65;
  if(bar) bar.style.background = inZone ? '#80e080' : '#e08060';
}

function collectFlower(idx) {
  if(!petalGame.active) return;
  var f = petalGame.flowers[idx];

  var inZone = petalGame.steam >= 35 && petalGame.steam <= 65;
  if(!inZone) { petalPollen(); return; }

  var isInFormula = petalGame.formula.some(function(fm){ return fm.type.id === f.type.id; });
  if(!isInFormula) { petalPollen(); return; }

  var needed = petalGame.formula.find(function(fm){ return fm.type.id === f.type.id; });
  var already = petalGame.collected.filter(function(id){ return id === f.type.id; }).length;
  if(needed && already >= needed.count) {
    var msg = document.getElementById('petal-phase2-msg');
    if(msg) { msg.textContent = MG ? MG.petalPhase2Enough : '이미 충분히 수집했어요!'; msg.style.color = '#f0a030'; }
    return;
  }

  petalGame.collected.push(f.type.id);

  var collectedEl = document.getElementById('petal-collected');
  if(collectedEl) {
    var span = document.createElement('span');
    span.style.cssText = 'font-size:1.2rem';
    span.textContent = f.type.icon;
    collectedEl.appendChild(span);
  }

  var el = document.getElementById('petal-f-' + idx);
  if(el) { el.style.opacity = '0.3'; el.style.pointerEvents = 'none'; }

  if(checkFormula()) {
    clearInterval(petalGame.interval);
    setTimeout(renderPetalPhase3, 500);
  }

  var msg = document.getElementById('petal-phase2-msg');
  if(msg) { msg.textContent = '✅ ' + f.type.name; msg.style.color = '#c080e0'; }
}

function petalPollen() {
  petalGame.pollen = true;
  var field = document.getElementById('petal-field');
  if(field) {
    field.style.filter = 'blur(4px) brightness(1.5)';
    setTimeout(function() {
      if(field) field.style.filter = 'none';
      petalGame.pollen = false;
    }, 1500);
  }
  var msg = document.getElementById('petal-phase2-msg');
  if(msg) { msg.textContent = MG ? MG.petalPhase2Pollen : '🤧 꽃가루! 증기 온도를 맞추세요!'; msg.style.color = '#ff9090'; }
}

function checkFormula() {
  for(var i = 0; i < petalGame.formula.length; i++) {
    var f = petalGame.formula[i];
    var cnt = petalGame.collected.filter(function(id){ return id === f.type.id; }).length;
    if(cnt < f.count) return false;
  }
  return true;
}

function renderPetalPhase3() {
  var c = document.getElementById('petal-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#d0a0e0;margin-bottom:4px">${MG ? MG.petalPhase3Title : '3단계 — 향기 증류'}</div>
      <div style="font-size:.72rem;color:#a080b0;line-height:1.5">
        ${MG ? MG.petalPhase3Desc : '태엽을 돌려 기계식 필터를 가동하세요!'}
      </div>
    </div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:3rem;margin-bottom:8px" id="petal-gear-icon">⚙️</div>
      <div style="font-size:.75rem;color:#a080b0;margin-bottom:8px">${MG ? MG.petalPhase3Msg : '증류 진행도'}</div>
      <div style="height:12px;background:rgba(0,0,0,.3);border-radius:6px;overflow:hidden;border:1px solid rgba(180,100,220,.3);margin:0 20px">
        <div id="petal-distill-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#c080e0,#f0a0f0);border-radius:6px;transition:width .1s"></div>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <button onclick="petalTurnGear()" style="padding:14px 32px;border-radius:16px;background:rgba(60,20,80,.4);border:2px solid rgba(180,100,220,.5);color:#d0a0e0;font-size:1rem;cursor:pointer">${MG ? MG.petalPhase3Btn : '⚙️ 태엽 돌리기!'}</button>
    </div>
    <div id="petal-distill-msg" style="text-align:center;font-size:.72rem;color:#a080b0">${MG ? MG.petalPhase3Msg : '태엽을 돌려 꽃의 기운을 약초로 변환하세요!'}</div>
  `;
  petalGame.distill = 0;
}

function petalTurnGear() {
  petalGame.distill = Math.min(100, (petalGame.distill || 0) + 15);
  var bar = document.getElementById('petal-distill-bar');
  var gear = document.getElementById('petal-gear-icon');
  if(bar) bar.style.width = petalGame.distill + '%';
  if(gear) gear.style.transform = 'rotate(' + petalGame.distill * 3 + 'deg)';

  var msg = document.getElementById('petal-distill-msg');
  if(petalGame.distill >= 100) {
    if(msg) { msg.textContent = MG ? MG.petalPhase3Done : '✨ 증류 완성!'; msg.style.color = '#f0a0f0'; }
    setTimeout(petalSuccess, 500);
  } else if(petalGame.distill >= 60) {
    if(msg) { msg.textContent = MG ? MG.petalPhase3Almost : '💜 거의 다 됐어요!'; msg.style.color = '#c080e0'; }
  }
}

function petalSuccess() {
  var reward = (petalGame.distill || 0) >= 100 ? 3 : 2;
  var c = document.getElementById('petal-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🌸</div>
      <div style="font-size:1rem;color:#d0a0e0;margin-bottom:6px">${MG ? MG.confirm : '향기 추출 성공!'}</div>
      <div style="font-size:.85rem;color:#f0d080;margin-bottom:4px">×${reward}</div>
      <div style="font-size:.75rem;color:#a080b0;margin-bottom:16px">${MG ? MG.petalSuccessMsg : '꽃의 기운이 약초로 변환됐습니다!'}</div>
      <button onclick="closePetalMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(80,40,120,.3);border:1px solid #c080e0;color:#d0a0e0;cursor:pointer">${MG ? MG.confirm : '확인'}</button>
    </div>
  `;
  if(petalGame.onSuccess) petalGame.onSuccess(reward);
}

function petalFail() {
  var c = document.getElementById('petal-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🤧</div>
      <div style="font-size:1rem;color:#f06040;margin-bottom:8px">${MG ? MG.retry : '향기 추출 실패...'}</div>
      <div style="font-size:.8rem;color:#a080b0;margin-bottom:16px">${MG ? MG.petalFailMsg : '꽃들이 잠에서 깨어났어요.'}</div>
      <button onclick="closePetalMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(150,50,50,.3);border:1px solid #c05050;color:#f08080;cursor:pointer">${MG ? MG.close : '닫기'}</button>
    </div>
  `;
  if(petalGame.onFail) petalGame.onFail();
}