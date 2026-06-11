var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

var mossGame = {
  phase: 1,
  active: false,
  pressure: 50,
  pressureDir: 1,
  needle: 0,
  needleDir: 1,
  dragTarget: null,
  dragFixed: false,
  heat: 0,
  onSuccess: null,
  onFail: null,
  interval: null,
  mossType: null,
};

var MOSS_TYPES = [
  { id:'gear',    icon:'⚙️', name: MG ? MG.mossGear    : '태엽 이끼',     color:'#b0a060' },
  { id:'steam',   icon:'💨', name: MG ? MG.mossSteam   : '증기 뿜는 이끼', color:'#90c0d0' },
  { id:'velvet',  icon:'✨', name: MG ? MG.mossVelvet  : '광택 벨벳 이끼', color:'#c090d0' },
  { id:'gravity', icon:'🌀', name: MG ? MG.mossGravity : '중력 이끼',      color:'#80b090' },
];

function openMossMiniGame(successCb, failCb) {
  mossGame.onSuccess = successCb;
  mossGame.onFail = failCb;
  mossGame.phase = 1;
  mossGame.active = true;
  mossGame.heat = 0;
  mossGame.pressure = 50;
  mossGame.dragFixed = false;
  mossGame.mossType = MOSS_TYPES[Math.floor(Math.random() * MOSS_TYPES.length)];

  var popup = document.getElementById('moss-minigame-popup');
  popup.style.display = 'flex';
  renderMossPhase1();
}

function closeMossMinigame() {
  clearInterval(mossGame.interval);
  mossGame.active = false;
  document.getElementById('moss-minigame-popup').style.display = 'none';
}

function renderMossPhase1() {
  var c = document.getElementById('moss-game-content');
  var tx = 30 + Math.random() * 40;
  var ty = 30 + Math.random() * 40;
  mossGame.targetX = tx;
  mossGame.targetY = ty;
  mossGame.dragFixed = false;

  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.mossPhase1Title : '1단계 — 매듭 조준'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.mossPhase1Desc : '이끼의 매듭을 드래그해서 고정하세요'}</div>
    </div>
    <div id="moss-drag-area" style="position:relative;width:100%;height:220px;background:rgba(40,60,20,.4);border-radius:12px;border:1.5px solid rgba(100,150,50,.4);overflow:hidden;cursor:crosshair">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(60,100,30,.3) 0%, transparent 70%)"></div>
      <div id="moss-knot" style="position:absolute;left:${tx}%;top:${ty}%;transform:translate(-50%,-50%);font-size:1.8rem;cursor:grab;user-select:none;filter:drop-shadow(0 0 6px rgba(100,200,50,.6))">${mossGame.mossType.icon}</div>
      <div id="moss-crosshair" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:40px;height:40px;border:2px solid rgba(255,200,50,.6);border-radius:50%;pointer-events:none"></div>
    </div>
    <div id="moss-phase1-msg" style="text-align:center;margin-top:8px;font-size:.75rem;color:#a0906a">${MG ? MG.mossPhase1Msg : '매듭을 중앙 원 안으로 드래그하세요'}</div>
  `;

  var knot = document.getElementById('moss-knot');
  var area = document.getElementById('moss-drag-area');

  knot.addEventListener('mousedown', startDrag);
  knot.addEventListener('touchstart', startDrag);

  function startDrag(e) {
    e.preventDefault();
    area.addEventListener('mousemove', onDrag);
    area.addEventListener('touchmove', onDrag);
    area.addEventListener('mouseup', endDrag);
    area.addEventListener('touchend', endDrag);
  }

  function onDrag(e) {
    var rect = area.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    var px = cx / rect.width * 100;
    var py = cy / rect.height * 100;
    knot.style.left = px + '%';
    knot.style.top = py + '%';

    var dist = Math.sqrt(Math.pow(px - 50, 2) + Math.pow(py - 50, 2));
    if(dist < 8) {
      document.getElementById('moss-phase1-msg').textContent = MG ? MG.mossPhase1Done : '✅ 고정 완료! 손을 떼세요';
      document.getElementById('moss-phase1-msg').style.color = '#80d080';
      mossGame.dragFixed = true;
    } else {
      document.getElementById('moss-phase1-msg').textContent = MG ? MG.mossPhase1Msg : '매듭을 중앙 원 안으로 드래그하세요';
      document.getElementById('moss-phase1-msg').style.color = '#a0906a';
      mossGame.dragFixed = false;
    }
  }

  function endDrag() {
    area.removeEventListener('mousemove', onDrag);
    area.removeEventListener('touchmove', onDrag);
    if(mossGame.dragFixed) {
      setTimeout(function(){ renderMossPhase2(); }, 500);
    }
  }
}

function renderMossPhase2() {
  mossGame.pressure = 50;
  mossGame.heat = 0;
  var c = document.getElementById('moss-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.mossPhase2Title : '2단계 — 스팀 압력 유지'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.mossPhase2Desc : '버튼을 꾹 눌러 압력을 초록 영역에 유지하세요'}</div>
    </div>
    <div style="margin-bottom:12px">
      <div style="font-size:.72rem;color:#a0906a;margin-bottom:4px">${MG ? MG.mossPhase2Gauge : '압력 게이지'}</div>
      <div style="position:relative;height:28px;background:rgba(0,0,0,.3);border-radius:14px;overflow:hidden;border:1px solid rgba(180,130,50,.3)">
        <div style="position:absolute;left:35%;width:30%;height:100%;background:rgba(50,200,50,.25);border-left:2px solid #50c050;border-right:2px solid #50c050"></div>
        <div id="moss-pressure-bar" style="position:absolute;left:0;top:0;height:100%;width:50%;background:linear-gradient(90deg,#c06020,#f0a030);border-radius:14px;transition:width .1s"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#fff;font-weight:bold">${MG ? MG.mossPhase2Gauge : '압력'}</div>
      </div>
    </div>
    <div style="margin-bottom:12px">
      <div style="font-size:.72rem;color:#a0906a;margin-bottom:4px">🌡️ <span id="moss-heat-val">0</span>%</div>
      <div style="position:relative;height:14px;background:rgba(0,0,0,.3);border-radius:7px;overflow:hidden;border:1px solid rgba(180,130,50,.3)">
        <div id="moss-heat-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#f0a030,#ff4020);border-radius:7px;transition:width .15s"></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button id="moss-press-btn" style="padding:14px 28px;border-radius:12px;background:rgba(100,60,20,.4);border:2px solid rgba(180,130,50,.5);color:#f0d080;font-size:.9rem;cursor:pointer;user-select:none">${MG ? MG.mossPhase2Press : '⚙️ 꾹 누르기'}</button>
      <button onclick="mossCoolDown()" style="padding:14px 18px;border-radius:12px;background:rgba(20,60,100,.4);border:2px solid rgba(100,150,200,.5);color:#a0c0ff;font-size:.9rem;cursor:pointer">${MG ? MG.mossPhase2Cool : '💧 냉각'}</button>
    </div>
    <div id="moss-phase2-msg" style="text-align:center;margin-top:10px;font-size:.75rem;color:#a0906a"></div>
  `;

  var pressing = false;
  var btn = document.getElementById('moss-press-btn');

  btn.addEventListener('mousedown', function(){ pressing = true; });
  btn.addEventListener('touchstart', function(){ pressing = true; });
  btn.addEventListener('mouseup', function(){ pressing = false; });
  btn.addEventListener('touchend', function(){ pressing = false; });

  var successTime = 0;
  mossGame.interval = setInterval(function(){
    if(pressing) {
      mossGame.pressure = Math.min(100, mossGame.pressure + 3);
      mossGame.heat = Math.min(100, mossGame.heat + 1.5);
    } else {
      mossGame.pressure = Math.max(0, mossGame.pressure - 2);
      mossGame.heat = Math.max(0, mossGame.heat - 0.3);
    }

    document.getElementById('moss-pressure-bar').style.width = mossGame.pressure + '%';
    document.getElementById('moss-heat-bar').style.width = mossGame.heat + '%';
    document.getElementById('moss-heat-val').textContent = Math.floor(mossGame.heat);

    var inZone = mossGame.pressure >= 35 && mossGame.pressure <= 65;
    document.getElementById('moss-pressure-bar').style.background = inZone
      ? 'linear-gradient(90deg,#30a050,#50d070)'
      : 'linear-gradient(90deg,#c06020,#f0a030)';

    if(mossGame.heat >= 100) {
      clearInterval(mossGame.interval);
      document.getElementById('moss-phase2-msg').textContent = MG ? MG.mossPhase2Heat : '🔥 과열! 냉각하세요!';
      document.getElementById('moss-phase2-msg').style.color = '#ff6040';
      mossGame.heat = 80;
      mossGame.interval = null;
      pressing = false;
      return;
    }

    if(inZone) {
      successTime++;
      document.getElementById('moss-phase2-msg').textContent = (MG ? MG.mossPhase2Hold : '✅ 압력 유지 중... ') + successTime + '/30';
      document.getElementById('moss-phase2-msg').style.color = '#80d080';
    } else {
      successTime = 0;
      document.getElementById('moss-phase2-msg').textContent = mossGame.pressure > 65
        ? (MG ? MG.mossPhase2High : '⚠️ 압력이 너무 높아요!')
        : (MG ? MG.mossPhase2Low  : '⚠️ 압력이 너무 낮아요!');
      document.getElementById('moss-phase2-msg').style.color = '#f0a030';
    }

    if(successTime >= 30) {
      clearInterval(mossGame.interval);
      setTimeout(function(){ renderMossPhase3(); }, 400);
    }
  }, 100);
}

function mossCoolDown() {
  mossGame.heat = Math.max(0, mossGame.heat - 30);
  if(!mossGame.interval) {
    renderMossPhase2();
  }
}

function renderMossPhase3() {
  mossGame.needle = 0;
  mossGame.needleDir = 1;
  var c = document.getElementById('moss-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.mossPhase3Title : '3단계 — 태엽 감기'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.mossPhase3Desc : '바늘이 초록 영역에 왔을 때 탭하세요!'}</div>
    </div>
    <div style="position:relative;height:80px;background:rgba(0,0,0,.3);border-radius:12px;overflow:hidden;border:1px solid rgba(180,130,50,.3);margin-bottom:16px">
      <div style="position:absolute;left:35%;width:30%;height:100%;background:rgba(50,200,50,.2);border-left:2px solid #50c050;border-right:2px solid #50c050"></div>
      <div id="moss-needle" style="position:absolute;top:0;left:0%;width:4px;height:100%;background:#f0d080;border-radius:2px;box-shadow:0 0 8px rgba(240,208,128,.8)"></div>
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <button id="moss-tap-btn" onclick="mossTap()" style="padding:16px 40px;border-radius:16px;background:rgba(100,60,20,.4);border:2px solid rgba(180,130,50,.5);color:#f0d080;font-size:1rem;cursor:pointer">${MG ? MG.mossPhase3Btn : '⚙️ 태엽 감기!'}</button>
    </div>
    <div id="moss-phase3-msg" style="text-align:center;font-size:.75rem;color:#a0906a">${MG ? MG.mossPhase3Remain : '남은 기회: '}<span id="moss-chances">3</span></div>
  `;

  mossGame.chances = 3;
  mossGame.tapSuccess = 0;

  mossGame.interval = setInterval(function(){
    mossGame.needle += mossGame.needleDir * 2.5;
    if(mossGame.needle >= 100) mossGame.needleDir = -1;
    if(mossGame.needle <= 0) mossGame.needleDir = 1;
    var el = document.getElementById('moss-needle');
    if(el) el.style.left = mossGame.needle + '%';
  }, 30);
}

function mossTap() {
  var inZone = mossGame.needle >= 35 && mossGame.needle <= 65;
  if(inZone) {
    mossGame.tapSuccess++;
    document.getElementById('moss-phase3-msg').innerHTML = (MG ? MG.mossPhase3Success : '✅ 성공! 남은 기회: ') + '<span id="moss-chances">' + mossGame.chances + '</span>';
    document.getElementById('moss-phase3-msg').style.color = '#80d080';
    if(mossGame.tapSuccess >= 1) {
      clearInterval(mossGame.interval);
      setTimeout(function(){ mossSuccess(); }, 400);
    }
  } else {
    mossGame.chances--;
    document.getElementById('moss-phase3-msg').innerHTML = (MG ? MG.mossPhase3Fail : '❌ 타이밍 실패! 남은 기회: ') + '<span id="moss-chances">' + mossGame.chances + '</span>';
    document.getElementById('moss-phase3-msg').style.color = '#f06040';
    if(mossGame.chances <= 0) {
      clearInterval(mossGame.interval);
      setTimeout(function(){ mossFail(); }, 400);
    }
  }
}

function mossSuccess() {
  var c = document.getElementById('moss-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">${mossGame.mossType.icon}</div>
      <div style="font-size:1rem;color:#f0d080;margin-bottom:8px">${mossGame.mossType.name} ${MG ? MG.confirm : '채집 성공!'}</div>
      <div style="font-size:.8rem;color:#a0d080;margin-bottom:16px">${MG ? MG.mossSuccessMsg : '스팀 흡입기가 이끼를 뿌리째 빨아들였습니다!'}</div>
      <button onclick="closeMossMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(50,150,50,.3);border:1px solid #50c050;color:#80d080;cursor:pointer">${MG ? MG.confirm : '확인'}</button>
    </div>
  `;
  if(mossGame.onSuccess) mossGame.onSuccess();
}

function mossFail() {
  var c = document.getElementById('moss-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">💨</div>
      <div style="font-size:1rem;color:#f06040;margin-bottom:8px">${MG ? MG.retry : '채집 실패...'}</div>
      <div style="font-size:.8rem;color:#a0906a;margin-bottom:16px">${MG ? MG.mossFailMsg : '이끼가 튕겨 나갔습니다. 다시 도전해보세요!'}</div>
      <button onclick="closeMossMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(150,50,50,.3);border:1px solid #c05050;color:#f08080;cursor:pointer">${MG ? MG.close : '닫기'}</button>
    </div>
  `;
  if(mossGame.onFail) mossGame.onFail();
}