// ==========================================
//  달빛 명상 - 연꽃 타이밍 미니게임
// ==========================================
(function(){

    var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;
  var GAME_TIME = 30000;
  var TARGET = 5;
  var MAX_HP = 3;

  function getTheme(){
    var night = (typeof G!=='undefined') && G.isNight;
    return {
      isNight: night,
      bg: night
        ? 'linear-gradient(180deg,#0a1628 0%,#0d2137 60%,#1a3a4a 100%)'
        : 'linear-gradient(180deg,#e8f4f8 0%,#d0eaf4 100%)',
      titleColor: night ? '#7ec8e3' : '#2a7a9a',
      title: night ? '달빛 명상' : '연꽃 명상',
      desc: '연꽃이 활짝 피는 순간에 탭하세요!',
    };
  }

  // 연꽃 단계
  var STAGES = [
    {icon:'🫧', label:'봉오리 전', scale:.6},
    {icon:'🌱', label:'봉오리',    scale:.8},
    {icon:'🌸', label:'활짝!',     scale:1.2},  // ← 이때만 탭 가능
    {icon:'🍃', label:'시듦',      scale:.9},
    {icon:'💧', label:'낙화',      scale:.6},
  ];

  window.openMeditationMinigame = function(onSuccess, onFail){
    var theme = getTheme();
    var score = 0;
    var hp = MAX_HP;
    var active = true;
    var timerId;
    var flowers = [];

    // CSS
    var style = document.createElement('style');
    style.id = 'med-mg-style';
    style.textContent = [
      '@keyframes medShake{',
        '0%,100%{transform:translateX(0)}',
        '20%{transform:translateX(-8px)}',
        '40%{transform:translateX(8px)}',
        '60%{transform:translateX(-6px)}',
        '80%{transform:translateX(6px)}',
      '}',
      '@keyframes hpLost{',
        '0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}',
      '}',
      '@keyframes bloom{',
        '0%{transform:scale(.8)}',
        '50%{transform:scale(1.3)}',
        '100%{transform:scale(1.2)}',
      '}',
      '@keyframes ripple{',
        '0%{transform:translate(-50%,-50%) scale(0);opacity:.8}',
        '100%{transform:translate(-50%,-50%) scale(3);opacity:0}',
      '}',
      '@keyframes floatUp{',
        '0%{transform:translateY(0);opacity:1}',
        '100%{transform:translateY(-40px);opacity:0}',
      '}'
    ].join('');
    document.head.appendChild(style);

    function removeStyles(){
      var s = document.getElementById('med-mg-style');
      if(s) s.remove();
    }

    // 오버레이
    var ov = document.createElement('div');
    ov.style.cssText = [
      'position:fixed;inset:0;z-index:99999;overflow:hidden',
      'display:flex;flex-direction:column;align-items:center',
      'background:'+theme.bg,
      'font-family:Cinzel,serif;touch-action:none;user-select:none'
    ].join(';');

    // 헤더
    var hdr = document.createElement('div');
    hdr.style.cssText = 'width:100%;padding:16px 20px 8px;text-align:center;position:relative;z-index:2';
    hdr.innerHTML = '<div style="font-size:1.3rem;color:'+theme.titleColor+';letter-spacing:1px">'+theme.title+'</div>'
      +'<div style="font-size:.75rem;color:rgba(40,100,130,.7);margin-top:4px">'+theme.desc+'</div>'
      +'<div style="position:absolute;top:12px;right:16px;font-size:1.5rem;cursor:pointer;opacity:.6" id="med-exit">✕</div>';

    // 스코어 & 타이머 & HP
    var info = document.createElement('div');
    info.style.cssText = 'display:flex;gap:20px;justify-content:center;align-items:center;margin:4px 0 8px;z-index:2;position:relative';

    var scoreEl = document.createElement('span');
    scoreEl.style.cssText = 'font-size:1rem;color:'+theme.titleColor;
    scoreEl.textContent = '🌸 0 / '+TARGET;

    var timerEl = document.createElement('span');
    timerEl.style.cssText = 'font-size:1rem;color:#888';
    timerEl.textContent = '⏱ '+(GAME_TIME/1000)+'s';

    var hpEl = document.createElement('span');
    hpEl.style.cssText = 'font-size:1rem';
    hpEl.textContent = '❤️'.repeat(MAX_HP);

    info.appendChild(scoreEl);
    info.appendChild(timerEl);
    info.appendChild(hpEl);

    // 게임 필드
    var field = document.createElement('div');
    field.style.cssText = 'position:relative;flex:1;width:100%;overflow:hidden;z-index:1';

    ov.appendChild(hdr);
    ov.appendChild(info);
    ov.appendChild(field);
    document.body.appendChild(ov);

    // HP 업데이트
    function updateHp(){
      var h='';
      for(var i=0;i<MAX_HP;i++) h += i<hp?'❤️':'🖤';
      hpEl.textContent=h;
      hpEl.style.animation='hpLost .3s ease';
      setTimeout(function(){hpEl.style.animation='';},300);
    }

    // 물결 효과
    function ripple(el){
      var rect = el.getBoundingClientRect();
      var fieldRect = field.getBoundingClientRect();
      var r = document.createElement('div');
      r.style.cssText = [
        'position:absolute',
        'left:'+(rect.left-fieldRect.left+rect.width/2)+'px',
        'top:'+(rect.top-fieldRect.top+rect.height/2)+'px',
        'width:80px;height:80px',
        'border-radius:50%',
        'border:2px solid '+theme.titleColor,
        'pointer-events:none',
        'animation:ripple .6s ease-out forwards',
        'z-index:10'
      ].join(';');
      field.appendChild(r);
      setTimeout(function(){ r.remove(); }, 600);
    }

    // 플로팅 텍스트
    function floatText(x, y, text, color){
      var t = document.createElement('div');
      t.textContent = text;
      t.style.cssText = [
        'position:fixed',
        'left:'+x+'px;top:'+y+'px',
        'color:'+color,
        'font-size:1.1rem',
        'font-weight:bold',
        'pointer-events:none',
        'z-index:100000',
        'animation:floatUp .8s ease-out forwards'
      ].join(';');
      document.body.appendChild(t);
      setTimeout(function(){ t.remove(); }, 800);
    }

    // 연꽃 생성
    function spawnFlower(){
      if(!active) return;

      var fieldW = field.offsetWidth || 360;
      var fieldH = field.offsetHeight || 600;

      var x = 10 + Math.random()*75;
      var y = 20 + Math.random()*60;
      var stageIdx = 0;
      var stageDurations = [1200, 1000, 1500, 1000, 800]; // 각 단계 지속시간

      var el = document.createElement('div');
      el.style.cssText = [
        'position:absolute',
        'left:'+x+'%',
        'top:'+y+'%',
        'font-size:3rem',
        'cursor:pointer',
        'text-align:center',
        'transition:transform .3s ease, font-size .3s ease',
        'z-index:3'
      ].join(';');

      // 수련잎 배경
      var pad = document.createElement('div');
      pad.style.cssText = [
        'position:absolute',
        'left:50%;top:50%',
        'transform:translate(-50%,-50%)',
        'width:70px;height:70px',
        'border-radius:50%',
        'background:'+(theme.isNight?'rgba(10,40,60,.4)':'rgba(100,180,150,.2)'),
        'border:1px solid '+(theme.isNight?'rgba(126,200,227,.2)':'rgba(80,160,120,.2)'),
        'z-index:-1'
      ].join(';');
      el.appendChild(pad);

      var iconEl = document.createElement('span');
      iconEl.style.cssText = 'display:inline-block;transition:transform .3s ease';
      iconEl.textContent = STAGES[0].icon;
      el.appendChild(iconEl);

      el.addEventListener('click', function(e){
        if(!active) return;
        e.stopPropagation();

        if(stageIdx === 2){ // 활짝 핀 상태
          ripple(el);
          floatText(e.clientX, e.clientY-20, '🌸 완벽!', theme.titleColor);
          el.remove();
          flowers = flowers.filter(function(f){ return f !== el; });
          score++;
          scoreEl.textContent='🌸 '+score+' / '+TARGET;
          if(score>=TARGET) endGame(true);
        } else if(stageIdx < 2){ // 너무 일찍
          floatText(e.clientX, e.clientY-20, '⏰ 너무 일찍!', '#e05050');
          iconEl.style.animation='medShake .3s ease';
          setTimeout(function(){iconEl.style.animation='';},300);
          hp--;
          updateHp();
          if(hp<=0) endGame(false);
        } else { // 너무 늦게
          floatText(e.clientX, e.clientY-20, '🍃 너무 늦었어요!', '#888');
          iconEl.style.animation='medShake .3s ease';
          setTimeout(function(){iconEl.style.animation='';},300);
          hp--;
          updateHp();
          if(hp<=0) endGame(false);
        }
      });

      field.appendChild(el);
      flowers.push(el);

      // 단계 진행
      function nextStage(){
        if(!active || !el.parentNode) return;
        if(stageIdx >= STAGES.length-1){
          el.remove();
          flowers = flowers.filter(function(f){ return f !== el; });
          return;
        }
        stageIdx++;
        var stage = STAGES[stageIdx];
        iconEl.textContent = stage.icon;
        iconEl.style.transform = 'scale('+stage.scale+')';

        if(stageIdx === 2){
          // 활짝! 글로우 효과
          el.style.filter = theme.isNight
            ? 'drop-shadow(0 0 8px #7ec8e3)'
            : 'drop-shadow(0 0 8px #ff9ec8)';
          iconEl.style.animation = 'bloom .3s ease forwards';
        } else {
          el.style.filter = '';
          iconEl.style.animation = '';
        }

        setTimeout(nextStage, stageDurations[stageIdx]);
      }

      setTimeout(nextStage, stageDurations[0]);
    }

    // 꽃 주기적으로 생성
    var spawnId = setInterval(function(){
      if(flowers.length < 4) spawnFlower();
    }, 1500);

    // 파티클
    function burst(cx, cy){
      for(var i=0;i<6;i++){
        var sp = document.createElement('div');
        sp.textContent = '🌸';
        var angle=(i/6)*Math.PI*2;
        var dist=30+Math.random()*20;
        sp.style.cssText=[
          'position:fixed',
          'left:'+(cx-10)+'px;top:'+(cy-10)+'px',
          'font-size:.9rem;pointer-events:none;z-index:100000',
          'transition:transform .4s ease-out,opacity .4s ease-out'
        ].join(';');
        document.body.appendChild(sp);
        requestAnimationFrame(function(el,a,d){return function(){
          requestAnimationFrame(function(){
            el.style.transform='translate('+(Math.cos(a)*d)+'px,'+(Math.sin(a)*d)+'px) scale(0)';
            el.style.opacity='0';
          });
        };}(sp,angle,dist));
        setTimeout(function(el){el.remove();},500,sp);
      }
    }

    // 타이머
    var remain = GAME_TIME/1000;
    timerId = setInterval(function(){
      remain--;
      timerEl.textContent='⏱ '+remain+'s';
      if(remain<=5) timerEl.style.color='#e05050';
      if(remain<=0){ clearInterval(timerId); endGame(score>=TARGET); }
    },1000);

    // 나가기 버튼
    setTimeout(function(){
      var exitBtn = document.getElementById('med-exit');
      if(exitBtn) exitBtn.onclick = function(){
        var confirmDiv = document.createElement('div');
        confirmDiv.style.cssText = [
          'position:absolute;inset:0;display:flex;flex-direction:column',
          'align-items:center;justify-content:center;z-index:20',
          'background:rgba(0,0,0,.6);backdrop-filter:blur(4px)'
        ].join(';');
        confirmDiv.innerHTML = '<div style="font-size:1.5rem">🌸</div>'
          +'<div style="color:#f5e9cc;font-size:1rem;margin:8px 0;text-align:center">정말 나가시겠어요?<br><span style="font-size:.8rem;color:#aaa">진행상황이 사라져요</span></div>';
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:12px;margin-top:12px';
        var btnStay = document.createElement('button');
        btnStay.textContent = '계속하기';
        btnStay.style.cssText = 'padding:10px 20px;border-radius:20px;border:none;background:'+theme.titleColor+';color:#fff;font-size:.9rem;cursor:pointer';
        btnStay.onclick = function(){ confirmDiv.remove(); };
        var btnLeave = document.createElement('button');
        btnLeave.textContent = '나가기';
        btnLeave.style.cssText = 'padding:10px 20px;border-radius:20px;border:none;background:#888;color:#fff;font-size:.9rem;cursor:pointer';
        btnLeave.onclick = function(){
          active=false;
          clearInterval(timerId);
          clearInterval(spawnId);
          ov.remove();
          removeStyles();
          if(onFail) onFail();
        };
        btnRow.appendChild(btnStay);
        btnRow.appendChild(btnLeave);
        confirmDiv.appendChild(btnRow);
        field.appendChild(confirmDiv);
      };
    },100);

    // 게임 종료
    function endGame(success){
      if(!active) return;
      active=false;
      clearInterval(timerId);
      clearInterval(spawnId);

      var res = document.createElement('div');
      res.style.cssText=[
        'position:absolute;inset:0;display:flex;flex-direction:column',
        'align-items:center;justify-content:center;z-index:10',
        'background:rgba(0,0,0,.5);backdrop-filter:blur(4px)'
      ].join(';');

      var msg = success
        ? '<div style="font-size:2.5rem">🎉</div>'
          +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">명상 성공!</div>'
          +'<div style="color:#aaa;font-size:.85rem">연꽃 '+score+'송이 수집</div>'
        : (hp<=0
          ? '<div style="font-size:2.5rem">💔</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">집중이 흐트러졌어요!</div>'
            +'<div style="color:#aaa;font-size:.85rem">마음을 가라앉히고 다시 도전하세요</div>'
          : '<div style="font-size:2.5rem">⏰</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">시간 초과...</div>'
            +'<div style="color:#aaa;font-size:.85rem">연꽃 '+score+'송이 수집</div>'
        );

      res.innerHTML = msg;
      var btn = document.createElement('button');
      btn.textContent = success ? '확인' : '돌아가기';
      btn.style.cssText='margin-top:16px;padding:10px 28px;border-radius:20px;border:none;'
        +'background:'+(success?theme.titleColor:'#888')+';color:#fff;font-size:1rem;cursor:pointer;font-family:Cinzel,serif';
      btn.onclick=function(){
        ov.remove();
        removeStyles();
        if(success){ onSuccess(); } else { if(onFail) onFail(); }
      };
      res.appendChild(btn);
      field.appendChild(res);
    }
  };

})();