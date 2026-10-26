(function(){
  var form=document.querySelector('form.cform'); if(!form) return;
  var plan=new URLSearchParams(location.search).get('plan');
  var pf=document.getElementById('planField');
  if(pf&&plan){pf.value={start:'Старт',business:'Бизнес',enterprise:'Корпоративный'}[plan]||pf.value;}
  function collect(){
    var lines=[],seen={};
    Array.prototype.forEach.call(form.elements,function(el){
      if(!el.name||el.type==='submit') return;
      if(el.type==='checkbox'){ if(el.checked){seen[el.name]=(seen[el.name]?seen[el.name]+', ':'')+el.value;} return; }
      if(el.value) lines.push(el.name+': '+el.value);
    });
    Object.keys(seen).forEach(function(k){lines.push(k+': '+seen[k]);});
    lines.push('Страница: '+location.pathname);
    return lines.join('\n');
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    var body=collect();
    var href='mailto:hello@chatyr.kz?subject='+encodeURIComponent(form.dataset.subject||'Chatyr')+'&body='+encodeURIComponent(body);
    var done=document.getElementById('formDone'),copy=document.getElementById('formCopy'),again=document.getElementById('mailAgain');
    if(copy) copy.value=(form.dataset.subject||'Chatyr')+'\n\n'+body+'\n\nКуда: hello@chatyr.kz';
    if(again) again.href=href;
    form.hidden=true; if(done){done.hidden=false; done.scrollIntoView({behavior:'smooth',block:'start'});}
    try{localStorage.setItem('chatyr-lead',body);}catch(_){ }
    window.location.href=href;
  });
})();
