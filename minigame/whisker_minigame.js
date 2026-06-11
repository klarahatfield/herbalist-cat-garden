var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

var whiskerGame = {
  phase: 1,
  active: false,
  holdTimer: null,
  holdProgress: 0,
  ringSize: 100,
  ringShrinking: false,
  onSuccess: null,
  onFail: null,
  interval: null,
  herbX: 0,
  herbY: 0,
  revealed: false,
  stunned: false,
  decoys: [],
};

function openWhiskerMiniGame(successCb, failCb) {
  whiskerGame.onSuccess = successCb;
  whiskerGame.onFail = failCb;
  whiskerGame.phase = 1;
  whiskerGame.active = true;
  whiskerGame.revealed = false;
  whiskerGame.stunned = false;
  whiskerGame.holdProgress = 0;

  document.getElementById('whisker-minigame-popup').style.display = 'flex';
  renderWhiskerPhase1();
}

function closeWhiskerMinigame() {
  clearInterval(whiskerGame.interval);
  clearTimeout(whiskerGame.holdTimer);
  whiskerGame.active = false;
  document.getElementById('whisker-minigame-popup').style.display = 'none';
}

function renderWhiskerPhase1() {
  var c = document.getElementById('whisker-game-content');

  whiskerGame.herbX = 20 + Math.random() * 60;
  whiskerGame.herbY = 20 + Math.random() * 60;

  whiskerGame.decoys = [
    { x: 10 + Math.random() * 30, y: 10 + Math.random() * 80 },
    { x: 60 + Math.random() * 30, y: 10 + Math.random() * 80 },
  ];

  c.innerHTML = `
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:.9rem;color:#c0a0ff;margin-bottom:4px">${MG ? MG.whiskerPhase1Title : '1단계 — 수염 탐색'}</div>
      <div style="font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase1Desc : '수염 아크가 심하게 떨리는 곳을 찾으세요'}</div>
    </div>
    <div id="whisker-search-area" style="position:relative;width:100%;height:240px;background:radial-gradient(ellipse at center,rgba(40,20,80,.8) 0%,rgba(10,5,30,.95) 100%);border-radius:12px;border:1.5px solid rgba(120,80,200,.4);overflow:hidden;cursor:crosshair">
      <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:120px;height:60px;border-top:3px solid rgba(160,120,255,.6);border-left:3px solid rgba(160,120,255,.6);border-right:3px solid rgba(160,120,255,.6);border-radius:60px 60px 0 0" id="whisker-arc"></div>
      <div id="whisker-cursor" style="position:absolute;width:20px;height:20px;border-radius:50%;border:2px solid rgba(160,120,255,.8);transform:translate(-50%,-50%);pointer-events:none;transition:all .05s"></div>
      <div id="whisker-wave" style="position:absolute;width:40px;height:40px;border-radius:50%;border:1px solid rgba(160,120,255,.3);transform:translate(-50%,-50%);pointer-events:none;transition:all .1s"></div>
      ${whiskerGame.decoys.map(function(d,i){ return '<div class="whisker-decoy" data-decoy="'+i+'" style="position:absolute;left:'+d.x+'%;top:'+d.y+'%;transform:translate(-50%,-50%);font-size:1.2rem;opacity:0.15;filter:blur(2px);pointer-events:none">🌿</div>'; }).join('')}
      <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:.65rem;color:rgba(160,120,255,.5)">${MG ? MG.whiskerPhase1Hint : '✦ 마우스를 움직여 탐색하세요 ✦'}</div>
    </div>
    <div id="whisker-phase1-msg" style="text-align:center;margin-top:8px;font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase1Msg : '수염 아크의 반응을 확인하세요...'}</div>
  `;

  var area = document.getElementById('whisker-search-area');
  var cursor = document.getElementById('whisker-cursor');
  var wave = document.getElementById('whisker-wave');
  var arc = document.getElementById('whisker-arc');

  area.addEventListener('mousemove', function(e) {
    if(whiskerGame.stunned) return;
    var rect = area.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var px = mx / rect.width * 100;
    var py = my / rect.height * 100;

    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    wave.style.left = mx + 'px';
    wave.style.top = my + 'px';

    var dist = Math.sqrt(Math.pow(px - whiskerGame.herbX, 2) + Math.pow(py - whiskerGame.herbY, 2));

    if(dist < 15) {
      arc.style.borderColor = 'rgba(200,160,255,.9)';
      arc.style.boxShadow = '0 0 12px rgba(180,120,255,.6)';
      wave.style.width = '60px';
      wave.style.height = '60px';
      wave.style.borderColor = 'rgba(160,120,255,.7)';
      cursor.style.borderColor = 'rgba(200,160,255,1)';
      document.getElementById('whisker-phase1-msg').textContent = MG ? MG.whiskerPhase1Hot : '⚡ 강한 반응! 여기서 홀드하세요!';
      document.getElementById('whisker-phase1-msg').style.color = '#c0a0ff';
    } else if(dist < 30) {
      arc.style.borderColor = 'rgba(160,120,255,.7)';
      wave.style.width = '50px';
      wave.style.height = '50px';
      document.getElementById('whisker-phase1-msg').textContent = MG ? MG.whiskerPhase1Near : '〜 반응 감지 중...';
      document.getElementById('whisker-phase1-msg').style.color = '#a090d0';
    } else {
      arc.style.borderColor = 'rgba(120,80,200,.4)';
      arc.style.animation = 'none';
      wave.style.width = '40px';
      wave.style.height = '40px';
      wave.style.borderColor = 'rgba(160,120,255,.2)';
      cursor.style.borderColor = 'rgba(160,120,255,.6)';
      document.getElementById('whisker-phase1-msg').textContent = MG ? MG.whiskerPhase1Msg : '수염 아크의 반응을 확인하세요...';
      document.getElementById('whisker-phase1-msg').style.color = '#9080c0';
    }
  });

  area.addEventListener('mousedown', function(e) {
    if(whiskerGame.stunned) return;
    var rect = area.getBoundingClientRect();
    var px = (e.clientX - rect.left) / rect.width * 100;
    var py = (e.clientY - rect.top) / rect.height * 100;
    var dist = Math.sqrt(Math.pow(px - whiskerGame.herbX, 2) + Math.pow(py - whiskerGame.herbY, 2));

    var hitDecoy = whiskerGame.decoys.some(function(d) {
      return Math.sqrt(Math.pow(px-d.x,2)+Math.pow(py-d.y,2)) < 12;
    });

    if(hitDecoy) { whiskerStun(area); return; }
    if(dist < 15) { renderWhiskerPhase2(e.clientX - rect.left, e.clientY - rect.top); }
    else { whiskerStun(area); }
  });
}

function whiskerStun(area) {
  whiskerGame.stunned = true;
  var msg = document.getElementById('whisker-phase1-msg');
  if(msg) {
    msg.textContent = MG ? MG.whiskerPhase1Stun : '⚡ 정전기! 잠시 채집 불가...';
    msg.style.color = '#ff8060';
  }
  if(area) {
    area.style.filter = 'brightness(1.5) saturate(2)';
    setTimeout(function(){
      area.style.filter = 'none';
      whiskerGame.stunned = false;
      if(msg) {
        msg.textContent = MG ? MG.whiskerPhase1Msg : '수염 아크의 반응을 확인하세요...';
        msg.style.color = '#9080c0';
      }
    }, 1500);
  }
}

function renderWhiskerPhase2(hx, hy) {
  var c = document.getElementById('whisker-game-content');
  whiskerGame.holdProgress = 0;

  c.innerHTML = `
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:.9rem;color:#c0a0ff;margin-bottom:4px">${MG ? MG.whiskerPhase2Title : '2단계 — 고정 홀드'}</div>
      <div style="font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase2Desc : '약초가 드러날 때까지 꾹 누르세요!'}</div>
    </div>
    <div id="whisker-hold-area" style="position:relative;width:100%;height:240px;background:radial-gradient(ellipse at center,rgba(40,20,80,.8) 0%,rgba(10,5,30,.95) 100%);border-radius:12px;border:1.5px solid rgba(120,80,200,.4);overflow:hidden;cursor:pointer">
      <div id="whisker-herb-spot" style="position:absolute;left:50%;top:45%;transform:translate(-50%,-50%)">
        <div style="font-size:2rem;filter:blur(4px);opacity:0.3" id="whisker-herb-icon">🌟</div>
        <div id="whisker-hold-ring" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;border:3px solid rgba(160,120,255,.5)"></div>
      </div>
      <div style="position:absolute;bottom:20px;left:10px;right:10px">
        <div style="height:8px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden;border:1px solid rgba(120,80,200,.3)">
          <div id="whisker-hold-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#6040c0,#c080ff);border-radius:4px;transition:width .05s"></div>
        </div>
      </div>
    </div>
    <div id="whisker-phase2-msg" style="text-align:center;margin-top:8px;font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase2Msg : '꾹 누르고 있으세요...'}</div>
  `;

  var area = document.getElementById('whisker-hold-area');
  var pressing = false;

  area.addEventListener('mousedown', function(){ pressing = true; });
  area.addEventListener('mouseup', function(){ pressing = false; });
  area.addEventListener('mouseleave', function(){ pressing = false; });

  whiskerGame.interval = setInterval(function(){
    if(pressing) {
      whiskerGame.holdProgress = Math.min(100, whiskerGame.holdProgress + 3);
      document.getElementById('whisker-hold-bar').style.width = whiskerGame.holdProgress + '%';

      var herb = document.getElementById('whisker-herb-icon');
      if(herb) {
        var blur = 4 - (whiskerGame.holdProgress / 100 * 4);
        var opacity = 0.3 + (whiskerGame.holdProgress / 100 * 0.7);
        herb.style.filter = 'blur(' + blur + 'px)';
        herb.style.opacity = opacity;
      }

      if(whiskerGame.holdProgress >= 100) {
        clearInterval(whiskerGame.interval);
        document.getElementById('whisker-phase2-msg').textContent = MG ? MG.whiskerPhase2Done : '✨ 약초 발견!';
        document.getElementById('whisker-phase2-msg').style.color = '#c0a0ff';
        setTimeout(renderWhiskerPhase3, 500);
      }
    } else {
      whiskerGame.holdProgress = Math.max(0, whiskerGame.holdProgress - 2);
      document.getElementById('whisker-hold-bar').style.width = whiskerGame.holdProgress + '%';
    }
  }, 50);
}

function renderWhiskerPhase3() {
  clearInterval(whiskerGame.interval);
  whiskerGame.ringSize = 100;
  var chances = 2;

  var c = document.getElementById('whisker-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:.9rem;color:#c0a0ff;margin-bottom:4px">${MG ? MG.whiskerPhase3Title : '3단계 — 주파수 동기화'}</div>
      <div style="font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase3Desc : '바깥 원이 안쪽 원과 겹치는 순간 클릭!'}</div>
    </div>
    <div onclick="whiskerSync()" style="position:relative;width:100%;height:240px;background:radial-gradient(ellipse at center,rgba(40,20,80,.8) 0%,rgba(10,5,30,.95) 100%);border-radius:12px;border:1.5px solid rgba(120,80,200,.4);overflow:hidden;cursor:crosshair;display:flex;align-items:center;justify-content:center">
      <div style="position:relative;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:60px;height:60px;border-radius:50%;border:3px solid rgba(200,160,255,.9);box-shadow:0 0 10px rgba(180,120,255,.5)"></div>
        <div id="whisker-outer-ring" style="position:absolute;width:160px;height:160px;border-radius:50%;border:3px solid rgba(160,120,255,.6);transition:none"></div>
        <div style="font-size:2rem">🌟</div>
      </div>
      <div style="position:absolute;top:10px;left:0;right:0;text-align:center;font-size:.65rem;color:rgba(160,120,255,.5)">${MG ? MG.whiskerPhase3Hint : '✦ 클릭 타이밍! ✦'}</div>
    </div>
    <div id="whisker-phase3-msg" style="text-align:center;margin-top:8px;font-size:.72rem;color:#9080c0">${MG ? MG.whiskerPhase3Remain : '기회: '}<span id="whisker-chances">${chances}</span></div>
  `;

  whiskerGame.syncChances = chances;
  whiskerGame.ringSize = 160;

  whiskerGame.interval = setInterval(function(){
    whiskerGame.ringSize -= 1.2;
    if(whiskerGame.ringSize < 30) whiskerGame.ringSize = 160;
    var ring = document.getElementById('whisker-outer-ring');
    if(ring) {
      ring.style.width = whiskerGame.ringSize + 'px';
      ring.style.height = whiskerGame.ringSize + 'px';
      var near = whiskerGame.ringSize >= 55 && whiskerGame.ringSize <= 70;
      ring.style.borderColor = near ? 'rgba(200,255,160,.9)' : 'rgba(160,120,255,.6)';
      ring.style.boxShadow = near ? '0 0 16px rgba(160,255,120,.5)' : 'none';
    }
  }, 20);
}

function whiskerSync() {
  var near = whiskerGame.ringSize >= 55 && whiskerGame.ringSize <= 70;
  if(near) {
    clearInterval(whiskerGame.interval);
    whiskerSyncSuccess();
  } else {
    whiskerGame.syncChances--;
    document.getElementById('whisker-chances').textContent = whiskerGame.syncChances;
    document.getElementById('whisker-phase3-msg').style.color = '#ff8060';
    if(whiskerGame.syncChances <= 0) {
      clearInterval(whiskerGame.interval);
      setTimeout(whiskerFail, 400);
    }
  }
}

function whiskerSyncSuccess() {
  var reward = Math.random() < 0.5 ? 1 : 2;
  var c = document.getElementById('whisker-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🌟</div>
      <div style="font-size:1rem;color:#c0a0ff;margin-bottom:6px">${MG ? MG.confirm : '희귀초 채집 성공!'}</div>
      <div style="font-size:.85rem;color:#f0d080;margin-bottom:4px">✨ ×${reward}</div>
      <div style="font-size:.75rem;color:#9080c0;margin-bottom:16px">${MG ? MG.whiskerSuccessMsg : '칙— 증기와 함께 약초가 보관함으로 빨려 들어갔습니다!'}</div>
      <button onclick="closeWhiskerMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(80,50,150,.3);border:1px solid #a080d0;color:#c0a0ff;cursor:pointer">${MG ? MG.confirm : '확인'}</button>
    </div>
  `;
  if(whiskerGame.onSuccess) whiskerGame.onSuccess(reward);
}

function whiskerFail() {
  var c = document.getElementById('whisker-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">😿</div>
      <div style="font-size:1rem;color:#f06040;margin-bottom:8px">${MG ? MG.retry : '동기화 실패...'}</div>
      <div style="font-size:.8rem;color:#9080c0;margin-bottom:16px">${MG ? MG.whiskerFailMsg : '약초가 마법 안개 속으로 사라졌어요.'}</div>
      <button onclick="closeWhiskerMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(150,50,50,.3);border:1px solid #c05050;color:#f08080;cursor:pointer">${MG ? MG.close : '닫기'}</button>
    </div>
  `;
  if(whiskerGame.onFail) whiskerGame.onFail();
}