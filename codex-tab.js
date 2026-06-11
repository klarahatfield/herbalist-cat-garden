
// ── switchCodexTab 래핑: 몬스터 탭 열 때 renderMonsterCodex 호출 ──
window.addEventListener('load', function(){
  var origSwitch = window.switchCodexTab;
  if(origSwitch){
    window.switchCodexTab = function(tab){
      origSwitch(tab);
      if(tab === 'monster' && typeof renderMonsterCodex === 'function')
        renderMonsterCodex();
    };
  }
  // closeBattle2 후에도 몬스터 탭 열려있으면 갱신
  var origClose = window.closeBattle2;
  if(origClose){
    window.closeBattle2 = function(){
      origClose();
      var sec = document.getElementById('csec-monster');
      if(sec && sec.style.display !== 'none' && typeof renderMonsterCodex === 'function')
        renderMonsterCodex();
    };
  }
});
