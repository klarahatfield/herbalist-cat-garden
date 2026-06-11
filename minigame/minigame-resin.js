(function(){

  var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

  var GAME_TIME = 30000;
  var TARGET = 4;
  var MAX_HP = 3;

  window.openResinMinigame = function(onSuccess, onFail){
    var score = 0;
    var hp = MAX_HP;
    var active = true;
    var timerId;
    var gaugeFilling = false;
    var gaugeVal = 0;
    var gaugeDir = 1;
    var gaugeTimer;
    var currentTree = null;

    var TREES = [
      {id:0, left:'35%', top:'20%', label: MG ? MG.resinRareTree  : '고대 톱니바퀴 나무', rare:true},
      {id:1, left:'60%', top:'40%', label: MG ? MG.resinTreeA     : '일반 나무 A',        rare:false},
      {id:2, left:'20%', top:'50%', label: MG ? MG.resinTreeB     : '일반 나무 B',        rare:false},
      {id:3, left:'70%', top:'60%', label: MG ? MG.resinTreeC     : '일반 나무 C',        rare:false},
    ];

    var style = document.createElement('style');
    style.id = 'resin-mg-style';
    style.textContent = [
      '@keyframes gearSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      '@keyframes resinGlow{0%,100%{opacity:.6}50%{opacity:1}}',
      '@keyframes gaugeShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
      '.resin-tree{position:absolute;cursor:pointer;text-align:center;transition:transform .2s;}',
      '.resin-tree:hover{transform:scale(1.1);}',
      '.resin-tree .tree-icon{font-size:3rem;display:block;}',
      '.resin-tree .tree-glow{position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;border-radius:50%;background:radial-gradient(circle,rgba(255,180,0,.3),transparent);animation:resinGlow 1.5s ease-in-out infinite;pointer-events:none;}',
    ].join('');
    document.head.appendChild(style);

    function removeStyles(){
      var s = document.getElementById('resin-mg-style');
      if(s) s.remove();
    }

    var ov = document.createElement('div');
    ov.style.cssText = [
      'position:fixed;inset:0;z-index:99999;overflow:hidden',
      'display:flex;flex-direction:column;align-items:center',
      'background:url("minigame/game image/background/resin_background.png") center/cover no-repeat',
      'font-family:Cinzel,serif;touch-action:none;user-select:none'
    ].join(';');

    var hdr = document.createElement('div');
    hdr.style.cssText = 'width:100%;padding:16px 20px 8px;text-align:center;position:relative;z-index:2;background:rgba(0,0,0,.3)';
    hdr.innerHTML = '<div style="font-size:1.3rem;color:#f0c060;letter-spacing:1px">'+(MG ? MG.resinTitle : '⚙️ 수지 추출')+'</div>'
      +'<div style="font-size:.75rem;color:rgba(240,180,80,.7);margin-top:4px">'+(MG ? MG.resinDesc : '반짝이는 나무를 찾아 적정 압력에서 추출하세요!')+'</div>'
      +'<div style="position:absolute;top:12px;right:16px;font-size:1.5rem;cursor:pointer;opacity:.6;color:#fff" id="resin-exit">✕</div>';

    var info = document.createElement('div');
    info.style.cssText = 'display:flex;gap:20px;justify-content:center;align-items:center;margin:4px 0 8px;z-index:2;position:relative;background:rgba(0,0,0,.3);width:100%;padding:6px 0';

    var scoreEl = document.createElement('span');
    scoreEl.style.cssText = 'font-size:1rem;color:#f0c060';
    scoreEl.textContent = '🌳 0 / '+TARGET;

    var timerEl = document.createElement('span');
    timerEl.style.cssText = 'font-size:1rem;color:#aaa';
    timerEl.textContent = '⏱ '+(GAME_TIME/1000)+'s';

    var hpEl = document.createElement('span');
    hpEl.style.cssText = 'font-size:1rem';
    hpEl.textContent = '❤️'.repeat(MAX_HP);

    info.appendChild(scoreEl);
    info.appendChild(timerEl);
    info.appendChild(hpEl);

    var field = document.createElement('div');
    field.style.cssText = 'position:relative;flex:1;width:100%;overflow:hidden;z-index:1';

    var gaugeOv = document.createElement('div');
    gaugeOv.style.cssText = [
      'position:absolute;inset:0;display:none;flex-direction:column',
      'align-items:center;justify-content:center;z-index:20',
      'background:rgba(0,0,0,.5);backdrop-filter:blur(2px)'
    ].join(';');
    gaugeOv.innerHTML = [
      '<div style="color:#f0c060;font-size:1rem;margin-bottom:12px" id="resin-tree-label"></div>',
      '<div style="font-size:.8rem;color:#ccc;margin-bottom:16px">'+(MG ? MG.resinGaugeDesc : '적정 구간(🟡)에서 버튼을 누르세요!')+'</div>',
      '<div style="position:relative;width:280px;height:36px;background:rgba(0,0,0,.4);border-radius:18px;border:2px solid #f0c060;overflow:hidden;margin-bottom:16px">',
        '<div id="resin-gauge-fill" style="position:absolute;left:0;top:0;bottom:0;width:0%;background:linear-gradient(90deg,#40a0ff,#40ff80);transition:none;border-radius:16px"></div>',
        '<div style="position:absolute;left:40%;top:0;bottom:0;width:20%;background:rgba(255,200,0,.4);border-left:2px solid #ffd700;border-right:2px solid #ffd700"></div>',
        '<div id="resin-gauge-marker" style="position:absolute;top:-4px;bottom:-4px;width:6px;background:#fff;border-radius:3px;left:0%;transform:translateX(-50%)"></div>',
      '</div>',
      '<button id="resin-extract-btn" style="padding:12px 32px;border-radius:24px;border:2px solid #f0c060;background:rgba(240,180,0,.2);color:#f0c060;font-size:1rem;cursor:pointer;font-family:Cinzel,serif">'+(MG ? MG.resinExtract : '⚙️ 추출!')+'</button>',
      '<div id="resin-gauge-msg" style="margin-top:12px;font-size:.85rem;color:#ccc;height:20px"></div>'
    ].join('');
    field.appendChild(gaugeOv);

    ov.appendChild(hdr);
    ov.appendChild(info);
    ov.appendChild(field);
    document.body.appendChild(ov);

    var treeEls = [];
    TREES.forEach(function(t){
      var el = document.createElement('div');
      el.className = 'resin-tree';
      el.style.left = t.left;
      el.style.top = t.top;
      el.innerHTML = (t.rare
        ? '<div class="tree-glow"></div><span class="tree-icon">⚙️🌳</span>'
        : '<div class="tree-glow" style="animation-duration:2.5s"></div><span class="tree-icon">🌳</span>')
        +'<div style="font-size:.75rem;color:#fff;margin-top:2px;background:rgba(0,0,0,.75);padding:4px 10px;border-radius:8px;border:1px solid rgba(240,180,0,.5);font-weight:bold">'+(t.rare ? (MG ? MG.resinRare : '✨ 희귀') : (MG ? MG.resinNormal : '일반'))+'</div>';
      el.onclick = function(){
        if(!active || gaugeFilling) return;
        currentTree = t;
        startGauge(t);
      };
      field.appendChild(el);
      treeEls.push(el);
    });

    function updateHp(){
      var h='';
      for(var i=0;i<MAX_HP;i++) h += i<hp?'❤️':'🖤';
      hpEl.textContent=h;
    }

    function startGauge(tree){
      gaugeFilling = true;
      gaugeVal = 0;
      gaugeOv.style.display = 'flex';
      document.getElementById('resin-tree-label').textContent = '⚙️ '+tree.label;
      document.getElementById('resin-gauge-msg').textContent = '';

      var speed = tree.rare ? 1.8 : 1.2;
      gaugeTimer = setInterval(function(){
        gaugeVal += speed * gaugeDir;
        if(gaugeVal >= 100){ gaugeVal = 100; gaugeDir = -1; }
        if(gaugeVal <= 0){ gaugeVal = 0; gaugeDir = 1; }
        document.getElementById('resin-gauge-fill').style.width = gaugeVal+'%';
        document.getElementById('resin-gauge-marker').style.left = gaugeVal+'%';
      }, 16);
    }

    setTimeout(function(){
      var btn = document.getElementById('resin-extract-btn');
      if(btn) btn.onclick = function(){
        if(!gaugeFilling) return;
        clearInterval(gaugeTimer);
        gaugeFilling = false;

        var inZone   = gaugeVal >= 40 && gaugeVal <= 60;
        var nearZone = gaugeVal >= 30 && gaugeVal <= 70;
        var msg = document.getElementById('resin-gauge-msg');

        if(inZone){
          msg.textContent = MG ? MG.resinPerfect : '✨ 완벽한 추출!';
          msg.style.color = '#ffd700';
          score++;
          scoreEl.textContent = '🌳 '+score+' / '+TARGET;
          setTimeout(function(){ gaugeOv.style.display='none'; gaugeDir=1; if(score>=TARGET) endGame(true); }, 800);
        } else if(nearZone){
          msg.textContent = MG ? MG.resinGood : '👍 성공!';
          msg.style.color = '#80e080';
          score++;
          scoreEl.textContent = '🌳 '+score+' / '+TARGET;
          setTimeout(function(){ gaugeOv.style.display='none'; gaugeDir=1; if(score>=TARGET) endGame(true); }, 800);
        } else {
          msg.textContent = gaugeVal < 30
            ? (MG ? MG.resinTooEarly : '❄️ 너무 일찍! 수지가 덜 익었어요')
            : (MG ? MG.resinTooLate  : '🔥 과열! 증기압이 너무 높아요');
          msg.style.color = '#ff8080';
          hp--;
          updateHp();
          setTimeout(function(){ gaugeOv.style.display='none'; gaugeDir=1; if(hp<=0) endGame(false); }, 1000);
        }
      };

      var exitBtn = document.getElementById('resin-exit');
      if(exitBtn) exitBtn.onclick = function(){
        active=false;
        clearInterval(timerId);
        clearInterval(gaugeTimer);
        ov.remove();
        removeStyles();
        if(onFail) onFail();
      };
    }, 100);

    var remain = GAME_TIME/1000;
    timerId = setInterval(function(){
      remain--;
      timerEl.textContent = '⏱ '+remain+'s';
      if(remain<=5) timerEl.style.color='#e05050';
      if(remain<=0){ clearInterval(timerId); endGame(score>=TARGET); }
    }, 1000);

    function endGame(success){
      if(!active) return;
      active=false;
      clearInterval(timerId);
      clearInterval(gaugeTimer);

      var res = document.createElement('div');
      res.style.cssText = [
        'position:absolute;inset:0;display:flex;flex-direction:column',
        'align-items:center;justify-content:center;z-index:30',
        'background:rgba(0,0,0,.6);backdrop-filter:blur(4px)'
      ].join(';');

      res.innerHTML = success
        ? '<div style="font-size:2.5rem">🎉</div>'
          +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">'+(MG ? MG.resinSuccessTitle : '채집 성공!')+'</div>'
          +'<div style="color:#aaa;font-size:.85rem">'+(MG ? MG.resinSuccessDesc : '수지 ')+score+(MG ? MG.resinSuccessDesc2 : '개 추출 완료')+'</div>'
        : (hp<=0
          ? '<div style="font-size:2.5rem">💥</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">'+(MG ? MG.resinFailHp : '과열 폭발!')+'</div>'
            +'<div style="color:#aaa;font-size:.85rem">'+(MG ? MG.resinFailHpDesc : '도구가 망가졌어요...')+'</div>'
          : '<div style="font-size:2.5rem">⏰</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">'+(MG ? MG.resinFailTime : '시간 초과...')+'</div>'
            +'<div style="color:#aaa;font-size:.85rem">'+(MG ? MG.resinFailTimeDesc : '수지 ')+score+(MG ? MG.resinFailTimeDesc2 : '개 추출')+'</div>'
        );

      var btn = document.createElement('button');
      btn.textContent = success ? (MG ? MG.confirm : '확인') : (MG ? MG.retry : '돌아가기');
      btn.style.cssText = 'margin-top:16px;padding:10px 28px;border-radius:20px;border:none;'
        +'background:'+(success?'#c08020':'#888')+';color:#fff;font-size:1rem;cursor:pointer;font-family:Cinzel,serif';
      btn.onclick = function(){
        ov.remove();
        removeStyles();
        if(success){ onSuccess(); } else { if(onFail) onFail(); }
      };
      res.appendChild(btn);
      field.appendChild(res);
    }
  };

})();