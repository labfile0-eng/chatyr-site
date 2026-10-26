(function(){
  var form=document.querySelector('form.cform'); if(!form) return;
  var ENDPOINT='https://docs.google.com/forms/d/e/1FAIpQLSd2qfMQHCF0sCq2vltAq36YFFJxeVFbMcUB6mXHW0OZuCZXlg/formResponse';
  var F={company:'entry.84833072',email:'entry.711402302',details:'entry.952236487'};
  var plan=new URLSearchParams(location.search).get('plan');
  var pf=document.getElementById('planField');
  if(pf&&plan){pf.value={start:'Старт',business:'Бизнес',enterprise:'Корпоративный'}[plan]||pf.value;}
  function collect(){
    var lines=[],seen={},company='',email='';
    Array.prototype.forEach.call(form.elements,function(el){
      if(!el.name||el.type==='submit') return;
      if(el.type==='checkbox'){ if(el.checked){seen[el.name]=(seen[el.name]?seen[el.name]+', ':'')+el.value;} return; }
      if(el.name==='Компания') company=el.value;
      if(el.name==='Почта') email=el.value;
      if(el.value) lines.push(el.name+': '+el.value);
    });
    Object.keys(seen).forEach(function(k){lines.push(k+': '+seen[k]);});
    lines.push('Страница: '+location.pathname);
    return {company:company,email:email,text:lines.join('\n')};
  }
  function send(d){
    var body=new URLSearchParams();
    body.set(F.company,d.company); body.set(F.email,d.email); body.set(F.details,(form.dataset.subject||'Chatyr')+'\n'+d.text);
    return fetch(ENDPOINT,{method:'POST',mode:'no-cors',body:body});
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    var btn=form.querySelector('button[type=submit]'); if(btn){btn.disabled=true;btn.textContent='Отправляем…';}
    var d=collect();
    var mail='mailto:hello@chatyr.kz?subject='+encodeURIComponent(form.dataset.subject||'Chatyr')+'&body='+encodeURIComponent(d.text);
    var done=document.getElementById('formDone'),copy=document.getElementById('formCopy'),again=document.getElementById('mailAgain'),msg=document.getElementById('doneText');
    function show(ok){
      if(copy) copy.value=(form.dataset.subject||'Chatyr')+'\n\n'+d.text+'\n\nКуда: hello@chatyr.kz';
      if(again) again.href=mail;
      if(msg) msg.textContent=ok?'Заявка получена. Ответим на указанную почту в течение рабочего дня.':'Не удалось отправить автоматически. Нажмите кнопку ниже, откроется письмо с вашими данными, или скопируйте текст и отправьте на hello@chatyr.kz.';
      if(ok&&again) again.textContent='Продублировать письмом';
      form.hidden=true; if(done){done.hidden=false; done.scrollIntoView({behavior:'smooth',block:'start'});}
    }
    var t=setTimeout(function(){show(false);},8000);
    send(d).then(function(){clearTimeout(t);show(true);}).catch(function(){clearTimeout(t);show(false);});
    try{localStorage.setItem('chatyr-lead',d.text);}catch(_){ }
  });
})();
