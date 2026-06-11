// ==========================================
//  정밀탐색 미니게임 - 돋보기로 약초 찾기
// ==========================================
(function(){
    var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

  var GAME_TIME = 20000;
  var TARGET = 5;
  var MAX_HP = 3;
  var MAGNIFIER_SIZE = 120;

  var HERBS = {
    bloom:    ['🌸','🌿','💮','🌺','🍀'],
    pond:     ['🌊','🪷','🌿','💧','🍃'],
    forest:   ['🌲','🍄','🌿','🍀','🌾'],
    hills:    ['🪨','🌿','🍃','🌱','🍀'],
    mushroom: ['🍄','🌿','🌱','🍀','🪸'],
    whisker:  ['✨','🌿','💎','🍀','🌸'],
    default:  ['🌿','🍀','🌱','🍃','🌾']
  };

  var DECOYS = ['🪨','🍂','🌰','🪵','🐚','🌾','🍁'];

  function getTheme(){
    var night = (typeof G!=='undefined') && G.isNight;
    var loc = (typeof G!=='undefined') ? (G.curLoc||'default') : 'default';
    return {
      isNight: night,
      loc: loc,
      herbs: HERBS[loc] || HERBS.default,
      bg: night
        ? 'linear-gradient(180deg,#0f0a1e 0%,#1e1035 100%)'
        : 'linear-gradient(180deg,#e8f5e9 0%,#f1f8e9 100%)',
      titleColor: night ? '#d4b8ff' : '#4a7c3f',
      title: '정밀 탐색',
      desc: '돋보기로 약초를 찾으세요!'
    };
  }

  window.openSearchMinigame = function(onSuccess, onFail){
    var theme = getTheme();
    var score = 0;
    var hp = MAX_HP;
    var active = true;
    var timerId;
    var mouseX = 0, mouseY = 0;

    // CSS
    var style = document.createElement('style');
    style.id = 'search-mg-style';
    style.textContent = [
      '@keyframes herbAppear{',
        '0%{transform:scale(0) rotate(-20deg);opacity:0}',
        '100%{transform:scale(1) rotate(0deg);opacity:1}',
      '}',
      '@keyframes shake{',
        '0%,100%{transform:translateX(0)}',
        '20%{transform:translateX(-8px)}',
        '40%{transform:translateX(8px)}',
        '60%{transform:translateX(-6px)}',
        '80%{transform:translateX(6px)}',
      '}',
      '@keyframes hpLost{',
        '0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}',
      '}',
      '#search-field {cursor:none;}',
      '#search-magnifier {',
        'position:absolute;',
        'width:'+MAGNIFIER_SIZE+'px;',
        'height:'+MAGNIFIER_SIZE+'px;',
        'border-radius:50%;',
        'border:4px solid '+(theme.isNight?'#a78bca':'#4a7c3f')+';',
        'box-shadow:0 0 0 3px rgba(0,0,0,.3), inset 0 0 20px rgba(255,255,255,.1);',
        'pointer-events:none;',
        'z-index:10;',
        'transform:translate(-50%,-50%);',
        'overflow:hidden;',
        'background:rgba(255,255,255,.08);',
      '}',
      '#search-magnifier::after{',
        'content:"";',
        'position:absolute;',
        'top:10%;left:10%;',
        'width:30%;height:30%;',
        'border-radius:50%;',
        'background:rgba(255,255,255,.2);',
      '}',
      '.search-herb{',
        'position:absolute;',
        'font-size:1.8rem;',
        'cursor:none;',
        'opacity:0;',
        'transition:opacity .2s;',
        'user-select:none;',
      '}',
      '.search-herb.visible{opacity:1;}',
      '.search-herb.found{',
        'animation:herbAppear .3s ease forwards;',
      '}'
    ].join('');
    document.head.appendChild(style);

    function removeStyles(){
      var s = document.getElementById('search-mg-style');
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
      +'<div style="font-size:.75rem;color:rgba(80,100,60,.7);margin-top:4px">'+theme.desc+'</div>'
      +'<div style="position:absolute;top:12px;right:16px;font-size:1.5rem;cursor:pointer;opacity:.6" id="search-exit">✕</div>';

    // 스코어 & 타이머 & HP
    var info = document.createElement('div');
    info.style.cssText = 'display:flex;gap:20px;justify-content:center;align-items:center;margin:4px 0 8px;z-index:2;position:relative';

    var scoreEl = document.createElement('span');
    scoreEl.style.cssText = 'font-size:1rem;color:'+theme.titleColor;
    scoreEl.textContent = '🔍 0 / '+TARGET;

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
    field.id = 'search-field';
    field.style.cssText = 'position:relative;flex:1;width:100%;overflow:hidden';

    // 돋보기
    var magnifier = document.createElement('div');
    magnifier.id = 'search-magnifier';
    field.appendChild(magnifier);

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

    // 돋보기 이동
    function moveMagnifier(clientX, clientY){
      var rect = field.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
      magnifier.style.left = mouseX+'px';
      magnifier.style.top = mouseY+'px';

      // 돋보기 범위 안 아이템 보이기
      checkVisible();
    }

    field.addEventListener('mousemove', function(e){
      if(active) moveMagnifier(e.clientX, e.clientY);
    });
    field.addEventListener('touchmove', function(e){
      if(active && e.touches[0]) moveMagnifier(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }, {passive:false});

    // 아이템 생성
    var items = [];
    function spawnItems(){
      var fieldW = field.offsetWidth || 360;
      var fieldH = field.offsetHeight || 600;
      var total = TARGET + 6; // 목표 + 가짜

      for(var i=0; i<total; i++){
        var isHerb = i < TARGET;
        var el = document.createElement('div');
        el.className = 'search-herb';
        var icon = isHerb
          ? theme.herbs[Math.floor(Math.random()*theme.herbs.length)]
          : DECOYS[Math.floor(Math.random()*DECOYS.length)];
        el.textContent = icon;
        el.dataset.herb = isHerb ? '1' : '0';

        var x = 10 + Math.random()*80;
        var y = 10 + Math.random()*80;
        el.style.left = x+'%';
        el.style.top = y+'%';

        el.addEventListener('click', function(e){
          if(!active) return;
          // 돋보기 범위 안에서만 클릭 가능
          var rect = this.getBoundingClientRect();
          var cx = rect.left + rect.width/2;
          var cy = rect.top + rect.height/2;
          var fieldRect = field.getBoundingClientRect();
          var dx = cx - fieldRect.left - mouseX;
          var dy = cy - fieldRect.top - mouseY;
          var dist = Math.sqrt(dx*dx + dy*dy);

          if(dist > MAGNIFIER_SIZE/2) return; // 돋보기 밖은 클릭 안됨

          if(this.dataset.herb==='1'){
            // 약초 발견!
            this.style.animation='herbAppear .3s ease forwards';
            burst(e.clientX, e.clientY, false);
            this.remove();
            score++;
            scoreEl.textContent='🔍 '+score+' / '+TARGET;
            if(score>=TARGET) endGame(true);
          } else {
            // 가짜 클릭
            burst(e.clientX, e.clientY, true);
            this.remove();
            hp--;
            updateHp();
            ov.style.animation='shake .3s ease';
            setTimeout(function(){ov.style.animation='';},300);
            if(hp<=0) endGame(false);
          }
        });

        field.appendChild(el);
        items.push(el);
      }
    }

    // 돋보기 범위 안 아이템 보이기
    function checkVisible(){
      items.forEach(function(item){
        if(!item.parentNode) return;
        var rect = item.getBoundingClientRect();
        var fieldRect = field.getBoundingClientRect();
        var cx = rect.left + rect.width/2 - fieldRect.left;
        var cy = rect.top + rect.height/2 - fieldRect.top;
        var dx = cx - mouseX;
        var dy = cy - mouseY;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < MAGNIFIER_SIZE/2 - 10){
          item.classList.add('visible');
        } else {
          item.classList.remove('visible');
        }
      });
    }

    // 파티클
    function burst(cx, cy, isBad){
      for(var i=0;i<5;i++){
        var sp = document.createElement('div');
        sp.textContent = isBad ? '💢' : '✨';
        var angle=(i/5)*Math.PI*2;
        var dist=25+Math.random()*15;
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
      var exitBtn = document.getElementById('search-exit');
      if(exitBtn) exitBtn.onclick = function(){
        var confirmDiv = document.createElement('div');
        confirmDiv.style.cssText = [
          'position:absolute;inset:0;display:flex;flex-direction:column',
          'align-items:center;justify-content:center;z-index:20',
          'background:rgba(0,0,0,.6);backdrop-filter:blur(4px)'
        ].join(';');
        confirmDiv.innerHTML = '<div style="font-size:1.5rem">🔍</div>'
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

    // 게임 시작
    spawnItems();

    // 게임 종료
    function endGame(success){
      if(!active) return;
      active=false;
      clearInterval(timerId);

      var res = document.createElement('div');
      res.style.cssText=[
        'position:absolute;inset:0;display:flex;flex-direction:column',
        'align-items:center;justify-content:center;z-index:10',
        'background:rgba(0,0,0,.5);backdrop-filter:blur(4px)'
      ].join(';');

      var msg = success
        ? '<div style="font-size:2.5rem">🎉</div>'
          +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">탐색 성공!</div>'
          +'<div style="color:#aaa;font-size:.85rem">약초 '+score+'개 발견</div>'
        : (hp<=0
          ? '<div style="font-size:2.5rem">😵</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">잘못 건드렸어요!</div>'
            +'<div style="color:#aaa;font-size:.85rem">다음엔 더 꼼꼼히 보세요</div>'
          : '<div style="font-size:2.5rem">⏰</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">시간 초과...</div>'
            +'<div style="color:#aaa;font-size:.85rem">약초 '+score+'개 발견</div>'
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