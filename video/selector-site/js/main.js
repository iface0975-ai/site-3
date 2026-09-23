(()=>{
  const deck=document.getElementById('deck'), v=document.getElementById('vinyl'), bars=[...document.querySelectorAll('#vu i')];
  if(!deck||!v) return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE=reduce?0:200;            // 33⅓ об/хв = 200°/с
  let rot=0, vel=BASE, drag=false, lastA=0, lastT=0, powT=0, vuT=0;
  const ang=e=>{const r=v.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2))*180/Math.PI;};
  v.addEventListener('pointerdown',e=>{drag=true; v.setPointerCapture(e.pointerId); lastA=ang(e); lastT=performance.now(); vel=0;});
  v.addEventListener('pointermove',e=>{
    if(!drag) return;
    const a=ang(e), t=performance.now(); let d=a-lastA;
    if(d>180) d-=360; if(d<-180) d+=360;
    rot+=d; const dt=Math.max(t-lastT,8)/1000; vel=vel*.5+(d/dt)*.5;
    lastA=a; lastT=t; v.style.transform=`rotate(${rot}deg)`;
  });
  const end=()=>{drag=false;};
  v.addEventListener('pointerup',end); v.addEventListener('pointercancel',end);
  v.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowUp'){vel+=900; e.preventDefault();}
    if(e.key==='ArrowLeft'||e.key==='ArrowDown'){vel-=900; e.preventDefault();}
  });
  let prev=performance.now();
  (function tick(now){
    const dt=Math.min((now-prev)/1000,.05); prev=now;
    if(!drag){ vel+= (BASE-vel)*Math.min(dt*1.6,1); rot+=vel*dt; v.style.transform=`rotate(${rot}deg)`; }
    const energy=Math.min(Math.abs(vel)/1400,1);
    if(Math.abs(vel)>700){powT=now;}
    deck.classList.toggle('scratch', now-powT<260);
    if(now-vuT>90){ vuT=now;
    bars.forEach((b,i)=>{
      const lvl=Math.max(.08, Math.min(1, energy*1.15*(1-i*.06)+ (reduce?0:Math.random()*.18)));
      b.style.height=(lvl*100).toFixed(0)+'%'; b.classList.toggle('hot', i>6 && lvl>.6);
    });}
    requestAnimationFrame(tick);
  })(prev);
})();
(()=>{
  const W=document.getElementById('dirs'); if(!W) return;
  const svg=document.getElementById('graf'), note=document.getElementById('favNote');
  const h2=W.querySelector('.sec-head h2'), card=W.querySelector('.card.fav');
  const ink=svg.querySelector('.ink'), pink=svg.querySelector('.pink'), spray=svg.querySelector('.spray'), head=svg.querySelector('.head'), drips=svg.querySelector('.drips');
  const NS='http://www.w3.org/2000/svg';
  function draw(){
    const wr=W.getBoundingClientRect(), hr=h2.getBoundingClientRect(), cr=card.getBoundingClientRect();
    const width=wr.width;
    // start: right after the heading word
    const S={x:hr.left-wr.left+Math.min(hr.width,textWidth(h2))+16, y:hr.top-wr.top+hr.height*.5};
    // end: just above the favourite card, right of the crown
    const E={x:cr.left-wr.left+Math.min(cr.width*.42,210), y:cr.top-wr.top-12};
    const k=Math.max(.45,Math.min(1,(width-S.x-24)/180));
    const L=[S.x+95*k,S.y-38*k, S.x+180*k,S.y+8*k, S.x+146*k,S.y+52*k];
    const M=[S.x+116*k,S.y+92*k, S.x+54*k,S.y+64*k, S.x+92*k,S.y+34*k];
    const c1={x:S.x+150*k,y:S.y+2*k}, c2={x:E.x+70,y:E.y-(E.y-S.y)*.45};
    const d=`M${S.x},${S.y} C${L.join(' ')} C${M.join(' ')} C${c1.x},${c1.y} ${c2.x},${c2.y} ${E.x},${E.y}`;
    [ink,pink,spray].forEach(p=>p.setAttribute('d',d));
    const len=pink.getTotalLength();
    [ink,pink,spray].forEach(p=>{p.style.strokeDasharray=len; if(!W.classList.contains('in')) p.style.strokeDashoffset=len;});
    // arrow head along final tangent
    const a=Math.atan2(E.y-c2.y,E.x-c2.x), s=24;
    const pt=(r,t)=>`${E.x+Math.cos(a+t)*r},${E.y+Math.sin(a+t)*r}`;
    head.setAttribute('d',`M${pt(10,0)} L${pt(s,2.55)} L${pt(s*.45,Math.PI)} L${pt(s,-2.55)} Z`);
    // paint drips
    drips.innerHTML='';
    [[.22,18],[.5,26],[.8,14]].forEach(([f,h],i)=>{
      const p=pink.getPointAtLength(len*f);
      const g=document.createElementNS(NS,'g'); g.setAttribute('class','drip'); g.style.transitionDelay=(1.5+i*.15)+'s';
      g.innerHTML=`<path d="M${p.x},${p.y} v${h}" stroke="#0D0D0D" stroke-width="9" stroke-linecap="round"/><path d="M${p.x},${p.y} v${h}" stroke="#FF2A6D" stroke-width="4" stroke-linecap="round"/>`;
      drips.appendChild(g);
    });
    // caption above the curl
    const nw=note.offsetWidth, nh=note.offsetHeight;
    note.style.left=Math.max(0,Math.min(S.x+10, width-nw-28))+'px';
    note.style.top=(S.y-38*k-nh-4)+'px';
  }
  function textWidth(el){const r=document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width;}
  draw();
  new ResizeObserver(draw).observe(W);
  document.fonts&&document.fonts.ready.then(draw);
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){
    W.classList.add('in'); [ink,pink,spray].forEach(p=>p.style.strokeDashoffset=0);
    setTimeout(()=>W.classList.add('settled'),1200); io.disconnect();}})},{threshold:.35});
  io.observe(W);
})();
(()=>{
  const W=document.querySelector('.revs'); if(!W) return;
  const list=document.getElementById('nList'), items=[...list.querySelectorAll('.notif')], phone=W.querySelector('.phone');
  const q=W.querySelector('.rv-quote'), tx=document.getElementById('rvText'), nm=document.getElementById('rvName'), tg=document.getElementById('rvTag'), ix=document.getElementById('rvIdx');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur=-1, swapT=0;
  const maxS=()=>Math.max(1,list.scrollHeight-list.clientHeight);
  function setActive(i){
    if(i===cur) return; cur=i;
    items.forEach((n,k)=>n.classList.toggle('on',k===i));
    clearTimeout(swapT);
    q.classList.add('swap');
    swapT=setTimeout(()=>{
      const n=items[cur];
      tx.textContent=n.querySelector('.n-msg').textContent;
      nm.textContent=n.querySelector('.n-name').firstChild.textContent;
      tg.textContent=n.querySelector('.n-name em').textContent;
      ix.textContent=String(cur+1).padStart(2,'0');
      q.classList.remove('swap');
    }, reduce?0:180);
  }
  // scroll position maps 1:1 onto the review index: top = first, bottom = last
  const byScroll=()=>Math.round(list.scrollTop/maxS()*(items.length-1));
  let target=-1, raf=0;
  list.addEventListener('scroll',()=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{
    const k=byScroll();
    if(target>=0){ if(k===target) target=-1; else return; }
    setActive(k);
  });},{passive:true});
  function go(d){
    const k=Math.max(0,Math.min(items.length-1,(cur<0?0:cur)+d));
    target=k; setActive(k);
    list.scrollTo({top:k/(items.length-1)*maxS(), behavior:reduce?'auto':'smooth'});
    clearTimeout(go.t); go.t=setTimeout(()=>{target=-1;},900);
  }
  document.getElementById('rvUp').onclick=()=>go(-1);
  document.getElementById('rvDown').onclick=()=>go(1);
  list.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){go(1);e.preventDefault();} if(e.key==='ArrowUp'){go(-1);e.preventDefault();}});
  items.forEach((n,k)=>n.addEventListener('click',()=>{ if(!moved) go(k-cur); }));
  list.addEventListener('wheel',()=>{target=-1;},{passive:true});
  // mouse drag-to-scroll
  let down=false, y0=0, s0=0, moved=false;
  list.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return; target=-1; down=true; moved=false; y0=e.clientY; s0=list.scrollTop; list.setPointerCapture(e.pointerId);});
  list.addEventListener('pointermove',e=>{if(!down)return; const dy=e.clientY-y0; if(Math.abs(dy)>4){moved=true; list.classList.add('grabbing');} list.scrollTop=s0-dy;});
  const up=()=>{down=false; list.classList.remove('grabbing'); setTimeout(()=>moved=false,0);};
  list.addEventListener('pointerup',up); list.addEventListener('pointercancel',up);
  setActive(0);
  // notifications drop in one by one when the section shows up
  items.forEach((n,k)=>n.style.animationDelay=(k*.18)+'s');
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){W.classList.add('in'); if(!reduce){phone.classList.add('buzz'); setTimeout(()=>phone.classList.remove('buzz'),400);} io.disconnect();}})},{threshold:.3});
  io.observe(W);
})();
