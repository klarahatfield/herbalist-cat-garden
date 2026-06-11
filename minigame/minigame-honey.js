// ==========================================
//  꿀 채취 미니게임 - 스팀펑크 에테르 버전
// ==========================================
(function(){
  var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

  var GAME_TIME = 20000;
  var TARGET = 10;
  var MAX_HP = 3;

  function getTheme(){
    var night = (typeof G!=='undefined') && G.isNight;
    return {
      isNight: night,
      bg: night
        ? 'linear-gradient(180deg,#1a0f2e 0%,#2d1b4e 100%)'
        : 'linear-gradient(180deg,#1a0f00 0%,#2d1f00 50%,#1a0f00 100%)',
      titleColor: night ? '#c8a8e9' : '#d4820a',
      title: night ? '달빛 꿀 채취' : '에테르 꿀 채취',
      desc: night ? '달빛 꿀방울을 모으세요! 과열 주의!' : '증기 압력을 조절하며 꿀을 모으세요!',
      dropGood: night ? ['🌸','💜','🌙','✨'] : ['🍯','💛','🌼','⭐'],
      dropBad:  night ? ['🦋','🕷️','🌑'] : ['🐝','🦟','💢'],
      jarColor: night ? '#9b7fd4' : '#d4820a',
      gearColor: night ? '#7c5cbf' : '#8B6914',
      gaugeNormal: '#4caf50',
      gaugeWarn: '#ff9800',
      gaugeDanger: '#f44336',
    };
  }

  window.openHoneyMinigame = function(onSuccess, onFail){
    var theme = getTheme();
    var score = 0;
    var hp = MAX_HP;
    var active = true;
    var timerId, spawnId;
    var jarX = 50;
    var fieldW = 0;

    // 압력 게이지
    var pressure = 0; // 0~100
    var overheated = false;
    var overheatTimer = null;
    var pressureInterval = null;

    // CSS
    var style = document.createElement('style');
    style.id = 'honey-mg-style';
    style.textContent = [
      '@keyframes dropFall{',
        '0%{transform:translateY(-60px)}',
        '100%{transform:translateY(110vh)}',
      '}',
      '@keyframes shake{',
        '0%,100%{transform:translateX(0)}',
        '20%{transform:translateX(-8px)}',
        '40%{transform:translateX(8px)}',
        '60%{transform:translateX(-6px)}',
        '80%{transform:translateX(6px)}',
      '}',
      '@keyframes jarBounce{',
        '0%,100%{transform:scaleY(1)}',
        '50%{transform:scaleY(1.15)}',
      '}',
      '@keyframes hpLost{',
        '0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}',
      '}',
      '@keyframes gearSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      '@keyframes gearSpinRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
      '@keyframes steamPuff{',
        '0%{transform:translateY(0) scale(1);opacity:.8}',
        '100%{transform:translateY(-40px) scale(2);opacity:0}',
      '}',
      '@keyframes overheatShake{',
        '0%,100%{transform:translateX(0) rotate(0deg)}',
        '25%{transform:translateX(-5px) rotate(-3deg)}',
        '75%{transform:translateX(5px) rotate(3deg)}',
      '}',
      '@keyframes floatUp{',
        '0%{transform:translateY(0);opacity:1}',
        '100%{transform:translateY(-40px);opacity:0}',
      '}',
      '@keyframes sparkle{',
        '0%{transform:scale(1);opacity:1}',
        '100%{transform:scale(0) translateY(-20px);opacity:0}',
      '}',
      '@keyframes swingFall{',
    '0%{transform:translateY(-60px) rotate(0deg)}',
    '25%{transform:translateY(25vh) rotate(10deg) translateX(15px)}',
    '50%{transform:translateY(50vh) rotate(-10deg) translateX(-15px)}',
    '75%{transform:translateY(75vh) rotate(8deg) translateX(10px)}',
    '100%{transform:translateY(110vh) rotate(0deg)}',
'}',
'@keyframes zigzagFall{',
    '0%{transform:translateY(-60px) translateX(0px)}',
    '20%{transform:translateY(20vh) translateX(30px)}',
    '40%{transform:translateY(40vh) translateX(-30px)}',
    '60%{transform:translateY(60vh) translateX(30px)}',
    '80%{transform:translateY(80vh) translateX(-30px)}',
    '100%{transform:translateY(110vh) translateX(0px)}',
'}',
'@keyframes slowDrip{',
    '0%{transform:translateY(-60px) scaleY(1)}',
    '50%{transform:translateY(55vh) scaleY(1.1)}',
    '100%{transform:translateY(110vh) scaleY(1)}',
'}',
    ].join('');
    document.head.appendChild(style);

    function removeStyles(){
      var s = document.getElementById('honey-mg-style');
      if(s) s.remove();
    }

    // 오버레이
    var ov = document.createElement('div');
    ov.style.cssText = [
      'position:fixed;inset:0;z-index:99999;overflow:hidden',
      'display:flex;flex-direction:column;align-items:center',
      'background:url("minigame/game image/background/hony_background.png") center/cover no-repeat',
      'font-family:Cinzel,serif;touch-action:none;user-select:none'
    ].join(';');

    // 헤더
    var hdr = document.createElement('div');
    hdr.style.cssText = 'width:100%;padding:12px 20px 6px;text-align:center;position:relative;z-index:2';
    hdr.innerHTML = '<div style="font-size:1.2rem;color:'+theme.titleColor+';letter-spacing:1px">'+theme.title+'</div>'
      +'<div style="font-size:.7rem;color:rgba(200,160,80,.7);margin-top:2px">'+theme.desc+'</div>'
      +'<div style="position:absolute;top:12px;right:16px;font-size:1.5rem;cursor:pointer;opacity:.6" id="honey-exit">✕</div>';

    // 스코어 & 타이머 & HP
    var info = document.createElement('div');
    info.style.cssText = 'display:flex;gap:16px;justify-content:center;align-items:center;margin:4px 0 4px;z-index:2;position:relative';

    var scoreEl = document.createElement('span');
    scoreEl.style.cssText = 'font-size:1rem;color:'+theme.titleColor;
    scoreEl.textContent = '🍯 0 / '+TARGET;

    var timerEl = document.createElement('span');
    timerEl.style.cssText = 'font-size:1rem;color:#aaa';
    timerEl.textContent = '⏱ '+(GAME_TIME/1000)+'s';

    var hpEl = document.createElement('span');
    hpEl.style.cssText = 'font-size:1rem';
    hpEl.textContent = '❤️'.repeat(MAX_HP);

    info.appendChild(scoreEl);
    info.appendChild(timerEl);
    info.appendChild(hpEl);

    // 압력 게이지
    var pressureWrap = document.createElement('div');
    pressureWrap.style.cssText = [
      'width:80%;height:16px;margin:0 auto 4px',
      'background:rgba(0,0,0,.4)',
      'border-radius:8px',
      'border:1px solid '+theme.gearColor,
      'overflow:hidden;position:relative;z-index:2'
    ].join(';');

    var pressureFill = document.createElement('div');
    pressureFill.style.cssText = [
      'height:100%;width:0%',
      'background:'+theme.gaugeNormal,
      'border-radius:8px',
      'transition:width .1s linear, background .3s'
    ].join(';');

    var pressureLabel = document.createElement('div');
    pressureLabel.style.cssText = [
      'position:absolute;inset:0',
      'display:flex;align-items:center;justify-content:center',
      'font-size:.6rem;color:#fff;letter-spacing:1px'
    ].join(';');
    pressureLabel.textContent = '⚙️ 압력 게이지';

    pressureWrap.appendChild(pressureFill);
    pressureWrap.appendChild(pressureLabel);

    // 게임 필드
    var field = document.createElement('div');
    field.style.cssText = 'position:relative;flex:1;width:100%;overflow:hidden';

    // 병 (jar)
    var jar = document.createElement('div');
    jar.style.cssText = [
      'position:absolute;bottom:80px',
      'left:calc(50% - 35px)',
      'width:70px;height:80px',
      'cursor:none;transition:left .05s linear',
      'z-index:5;overflow:hidden;border-radius:0 0 12px 12px'
    ].join(';');

    var jarEmoji = document.createElement('img');
    jarEmoji.src = 'minigame/game image/bottle.png';
    jarEmoji.style.cssText = 'width:60px;height:70px;object-fit:contain;position:absolute;inset:0;z-index:2';

    var jarGauge = document.createElement('div');
jarGauge.style.cssText = [
    'width:80%;height:16px;margin:0 auto 4px',
    'background:rgba(0,0,0,.4)',
    'border-radius:8px',
    'border:1px solid '+theme.gearColor,
    'overflow:hidden;position:relative;z-index:2'
].join(';');

var jarGaugeFill = document.createElement('div');
jarGaugeFill.style.cssText = [
    'position:absolute;top:0;left:0;bottom:0',
    'width:0%',
    'background:'+(theme.isNight?'rgba(167,139,202,.9)':'rgba(245,200,50,.9)'),
    'border-radius:8px',
    'transition:width .3s ease'
].join(';');

jarGauge.appendChild(jarGaugeFill);
var jarGaugeLabel = document.createElement('div');
jarGaugeLabel.style.cssText = [
    'position:absolute;inset:0',
    'display:flex;align-items:center;justify-content:center',
    'font-size:.6rem;color:#fff;letter-spacing:1px'
].join(';');
jarGaugeLabel.textContent = '🍯 꿀 게이지';
jarGauge.appendChild(jarGaugeLabel);

    // 과열 표시
    var overheatLabel = document.createElement('div');
    overheatLabel.style.cssText = [
      'position:absolute;bottom:165px;left:50%',
      'transform:translateX(-50%)',
      'background:rgba(244,67,54,.9)',
      'color:#fff;padding:4px 12px;border-radius:12px',
      'font-size:.8rem;display:none;z-index:6',
      'white-space:nowrap'
    ].join(';');
    overheatLabel.textContent = '🔥 과열! 냉각 중...';

    // 톱니바퀴 장식
    var gearL = document.createElement('div');
    gearL.textContent = '⚙️';
    gearL.style.cssText = 'position:absolute;bottom:75px;left:calc(50% - 55px);font-size:1.2rem;opacity:.6;animation:gearSpin 2s linear infinite;z-index:4';

    var gearR = document.createElement('div');
    gearR.textContent = '⚙️';
    gearR.style.cssText = 'position:absolute;bottom:75px;left:calc(50% + 35px);font-size:1rem;opacity:.6;animation:gearSpinRev 1.5s linear infinite;z-index:4';

    jar.appendChild(jarEmoji);
    field.appendChild(jar);
    field.appendChild(overheatLabel);
    field.appendChild(gearL);
    field.appendChild(gearR);

    ov.appendChild(hdr);
    ov.appendChild(info);
    ov.appendChild(pressureWrap);
    field.appendChild(jarGauge);
    ov.appendChild(field);
    document.body.appendChild(ov);

    fieldW = field.offsetWidth || window.innerWidth;

    // 병 이동
    function moveJar(clientX){
      if(overheated) return; // 과열 시 조작 불가
      var rect = field.getBoundingClientRect();
      var x = clientX - rect.left;
      var pct = Math.max(5, Math.min(95, (x/rect.width)*100));
      jarX = pct;
      jar.style.left = 'calc('+pct+'% - 35px)';
    }

    field.addEventListener('mousemove', function(e){ if(active) moveJar(e.clientX); });
    field.addEventListener('touchmove', function(e){
      if(active && e.touches[0]) moveJar(e.touches[0].clientX);
      e.preventDefault();
    }, {passive:false});

    // 압력 게이지 업데이트
    function updatePressure(amount){
      pressure = Math.min(100, Math.max(0, pressure + amount));
      pressureFill.style.width = pressure+'%';

      if(pressure < 60){
        pressureFill.style.background = theme.gaugeNormal;
      } else if(pressure < 85){
        pressureFill.style.background = theme.gaugeWarn;
      } else {
        pressureFill.style.background = theme.gaugeDanger;
      }

      if(pressure >= 100 && !overheated){
        triggerOverheat();
      }
    }

    // 자연 감소
    pressureInterval = setInterval(function(){
      if(!overheated && active){
        updatePressure(-2);
      }
    }, 500);

    // 과열 발동
    function triggerOverheat(){
      overheated = true;
      overheatLabel.style.display = 'block';
      jar.style.animation = 'overheatShake .2s ease infinite';
      jarEmoji.style.filter = 'sepia(1) saturate(3) hue-rotate(-20deg)';

      // 증기 파티클
      for(var i=0;i<3;i++){
        setTimeout(function(){
          spawnSteam();
        }, i*200);
      }

      // 3초 후 냉각
      overheatTimer = setTimeout(function(){
        overheated = false;
        pressure = 0;
        updatePressure(0);
        overheatLabel.style.display = 'none';
        jar.style.animation = '';
        jarEmoji.style.filter = '';
      }, 3000);
    }

    // 증기 파티클
    function spawnSteam(){
      var rect = jar.getBoundingClientRect();
      var fieldRect = field.getBoundingClientRect();
      for(var i=0;i<3;i++){
        var s = document.createElement('div');
        s.textContent = '💨';
        s.style.cssText = [
          'position:absolute',
          'left:'+(rect.left - fieldRect.left + Math.random()*60)+'px',
          'top:'+(rect.top - fieldRect.top)+'px',
          'font-size:'+(0.8+Math.random()*0.5)+'rem',
          'pointer-events:none;z-index:8',
          'animation:steamPuff '+(0.4+Math.random()*0.4)+'s ease-out forwards'
        ].join(';');
        field.appendChild(s);
        setTimeout(function(el){ el.remove(); }, 800, s);
      }
    }

    // HP 업데이트
    function updateHp(){
      var h='';
      for(var i=0;i<MAX_HP;i++) h += i<hp?'❤️':'🖤';
      hpEl.textContent=h;
      hpEl.style.animation='hpLost .3s ease';
      setTimeout(function(){hpEl.style.animation='';},300);
    }

    // 타이머
    var remain = GAME_TIME/1000;
    timerId = setInterval(function(){
      remain--;
      timerEl.textContent='⏱ '+remain+'s';
      if(remain<=5) timerEl.style.color='#e05050';
      if(remain<=0){ clearInterval(timerId); endGame(score>=TARGET); }
    },1000);

    // 방울 생성
    function spawnDrop(isBad){
      if(!active) return;
      var p = document.createElement('div');
      var icons = isBad ? theme.dropBad : theme.dropGood;
      var icon = icons[Math.floor(Math.random()*icons.length)];
      var x = 5 + Math.random()*88;
      var dur = isBad
        ? (1.8 + Math.random()*1.2)
        : (2.5 + Math.random()*2.0);
      var size = isBad ? 1.6 : (1.8 + Math.random()*0.8);
var badAnim = 'fallDown';
  if(isBad){
  if(icon.includes('steam_bomb'))       badAnim = 'swingFall';
  else if(icon.includes('clockworkbug')) badAnim = 'zigzagFall';
  else if(icon.includes('poison_drop'))  badAnim = 'slowDrip';
}
      if(!isBad){
    var dropImg = document.createElement('img');
    var dropImgs = ['honeydrop1.png','honeydrop2.png','honeydrop3.png'];
    dropImg.src = 'minigame/game image/' + dropImgs[Math.floor(Math.random()*dropImgs.length)];
    dropImg.style.cssText = 'width:'+(size*20)+'px;height:'+(size*24)+'px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,200,50,0.8))';
    p.appendChild(dropImg);
    
} else {
    var badImgs = ['steam_bomb.png','clockworkbug.png','poison_drop.png'];
    var badImgName = badImgs[Math.floor(Math.random()*badImgs.length)];
    var badImg = document.createElement('img');
    badImg.src = 'minigame/game image/' + badImgName;
    var glowColor = badImgName === 'poison_drop.png'
        ? 'drop-shadow(0 0 8px rgba(50,255,50,0.9))'
        : 'drop-shadow(0 0 8px rgba(255,50,50,0.8))';
    badImg.style.cssText = 'width:'+(size*30)+'px;height:'+(size*30)+'px;object-fit:contain;filter:'+glowColor;
    p.appendChild(badImg);
}
var badAnim = !isBad ? 'dropFall' 
    : badImgName === 'steam_bomb.png' ? 'swingFall'
    : badImgName === 'clockworkbug.png' ? 'zigzagFall'
    : 'slowDrip';
p.dataset.x = x;
p.dataset.bad = isBad ? '1' : '0';
p.style.cssText = [
    'position:absolute',
    'left:'+x+'%',
    'top:-60px',
    'font-size:'+size+'rem',
    'animation:'+badAnim+' '+dur+'s linear forwards',
    'z-index:3'
].join(';');
if(!isBad){
    var elapsed2 = 0;
    var trailId = setInterval(function(){
        if(!p.parentNode){ clearInterval(trailId); return; }
        elapsed2 += 300;
        var progress = elapsed2 / (dur * 1000);
        if(progress > 1){ clearInterval(trailId); return; }
        var fieldH = field.offsetHeight || 600;
        var dropY = progress * (fieldH + 60) - 60;
        var dropXpx = (x / 100) * (field.offsetWidth || window.innerWidth);
        var spark = document.createElement('div');
        spark.textContent = ['✨','⭐','💫'][Math.floor(Math.random()*3)];
        spark.style.cssText = [
            'position:absolute',
            'left:'+(dropXpx + Math.random()*20 - 10)+'px',
            'top:'+dropY+'px',
            'font-size:.5rem;pointer-events:none;z-index:2',
            'animation:sparkle .5s ease-out forwards'
        ].join(';');
        field.appendChild(spark);
        setTimeout(function(){ spark.remove(); }, 500);
    }, 300);
    }
      field.appendChild(p);

      // 충돌 감지
      var startTime = Date.now();
      var checkId = setInterval(function(){
        if(!active){ clearInterval(checkId); return; }
        if(!p.parentNode){ clearInterval(checkId); return; }

        var elapsed = (Date.now()-startTime)/1000;
        var progress = elapsed/dur;
        if(progress>1){ clearInterval(checkId); if(p.parentNode) p.remove(); return; }

        var fieldH = field.offsetHeight || 600;
        var dropY = progress * (fieldH + 60) - 60;
        var jarBottom = fieldH - 80 - 80;

        if(dropY >= jarBottom - 40 && dropY <= jarBottom + 80){
          var dropXpx = (parseFloat(p.dataset.x)/100) * (field.offsetWidth||window.innerWidth);
          var jarXpx = (jarX/100) * (field.offsetWidth||window.innerWidth);
          var dist = Math.abs(dropXpx - jarXpx);

          if(dist < 70){
            clearInterval(checkId);
            p.remove();

            if(p.dataset.bad==='1'){
              burst(jarXpx, jarBottom, true);
              hp--;
              updateHp();
              updatePressure(20); // 방해물 맞으면 압력 급상승
              ov.style.animation='shake .3s ease';
              setTimeout(function(){ov.style.animation='';},300);
              if(hp<=0) endGame(false);
            } else {
              if(overheated) return; // 과열 중엔 수집 불가
              burst(jarXpx, jarBottom, false);
              jar.style.animation='jarBounce .2s ease';
              setTimeout(function(){jar.style.animation='';},200);

              // 액체 차오르기
              var fillPct = Math.min(100, (score+1)/TARGET*100);
              jarGaugeFill.style.width = fillPct+'%';

              // 압력 상승
              updatePressure(10);

              score++;
              scoreEl.textContent='🍯 '+score+' / '+TARGET;
              if(score>=TARGET) endGame(true);
            }
          }
        }
      }, 50);

      setTimeout(function(){ clearInterval(checkId); if(p.parentNode) p.remove(); }, dur*1000+200);
    }

    spawnId = setInterval(function(){
      spawnDrop(false);
      if(Math.random()<0.35) spawnDrop(true);
    }, 800);

    // 파티클
    function burst(cx, cy, isBad){
      for(var i=0;i<5;i++){
        var sp = document.createElement('div');
        sp.textContent = isBad ? '💢' : (theme.isNight?'✨':'🍯');
        var angle=(i/5)*Math.PI*2;
        var dist=25+Math.random()*15;
        sp.style.cssText=[
          'position:fixed',
          'left:'+(cx-10)+'px;top:'+(cy+field.getBoundingClientRect().top-10)+'px',
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

    // 나가기 버튼
    setTimeout(function(){
      var exitBtn = document.getElementById('honey-exit');
      if(exitBtn) exitBtn.onclick = function(){
        var confirmDiv = document.createElement('div');
        confirmDiv.style.cssText = [
          'position:absolute;inset:0;display:flex;flex-direction:column',
          'align-items:center;justify-content:center;z-index:20',
          'background:rgba(0,0,0,.6);backdrop-filter:blur(4px)'
        ].join(';');
        confirmDiv.innerHTML = '<div style="font-size:1.5rem">⚙️</div>'
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
          clearInterval(pressureInterval);
          if(overheatTimer) clearTimeout(overheatTimer);
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
      clearInterval(pressureInterval);
      if(overheatTimer) clearTimeout(overheatTimer);

      var res = document.createElement('div');
      res.style.cssText=[
        'position:absolute;inset:0;display:flex;flex-direction:column',
        'align-items:center;justify-content:center;z-index:10',
        'background:rgba(0,0,0,.5);backdrop-filter:blur(4px)'
      ].join(';');

      var msg = success
        ? '<div style="font-size:2.5rem">🎉</div>'
          +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">채취 성공!</div>'
          +'<div style="color:#aaa;font-size:.85rem">꿀 '+score+'방울 수집</div>'
        : (hp<=0
          ? '<div style="font-size:2.5rem">🐝</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">방해를 받았어요!</div>'
            +'<div style="color:#aaa;font-size:.85rem">다음엔 조심하세요</div>'
          : '<div style="font-size:2.5rem">⏰</div>'
            +'<div style="color:#f5e9cc;font-size:1.2rem;margin:8px 0">시간 초과...</div>'
            +'<div style="color:#aaa;font-size:.85rem">꿀 '+score+'방울 수집</div>'
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