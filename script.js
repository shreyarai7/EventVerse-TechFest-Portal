(function(){
  'use strict';
  const $=(s,r=document)=> r.querySelector(s);
  const $$=(s,r=document)=> Array.from((r||document).querySelectorAll(s));

  // Smooth scroll and focus
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href=a.getAttribute('href');
      if(!href||href==='#') return;
      const t=document.querySelector(href);
      if(!t) return;
      e.preventDefault();
      const offset=Math.max(0,t.getBoundingClientRect().top+window.scrollY-72);
      window.scrollTo({top:offset,behavior:'smooth'});
      setTimeout(()=> t.focus({preventScroll:true}),600);
    });
  });

  // Reveal animation
  const revealTargets=$$('.section,.event-card');
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      }
    });
  },{threshold:0.16});
  revealTargets.forEach(t=>{ t.classList.add('fade-hidden'); observer.observe(t); });

  // Nav highlight
  const navLinks=$$('.nav-list a');
  const sections=navLinks.map(l=>document.querySelector(l.getAttribute('href')));
  const highlightNav=()=>{
    const y=window.scrollY+90;
    for(let i=sections.length-1;i>=0;i--){
      const s=sections[i];
      if(!s) continue;
      if(y>=s.offsetTop){
        navLinks.forEach(n=>n.removeAttribute('aria-current'));
        navLinks[i].setAttribute('aria-current','page');
        break;
      }
    }
  };
  window.addEventListener('scroll',highlightNav,{passive:true});
  highlightNav();

  // Event filter
  $$('.chip').forEach(ch=>{
    ch.addEventListener('click',()=>{
      $$('.chip').forEach(c=>{c.classList.remove('active');c.setAttribute('aria-pressed','false')});
      ch.classList.add('active');ch.setAttribute('aria-pressed','true');
      const f=ch.dataset.filter;
      $$('.event-card').forEach(card=>{
        const cat=card.dataset.category;
        if(f==='all'||cat===f){card.style.display='';card.setAttribute('aria-hidden','false')}
        else{card.style.display='none';card.setAttribute('aria-hidden','true')}
      });
    });
    ch.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ch.click();e.preventDefault()}});
  });

  // Modal logic
  const modal=$('#modal');
  const modalTitle=$('#modal-title');
  const modalDesc=$('#modal-desc');
  const modalExtra=$('#modal-extra');
  let lastFocus=null;

  function openModal(data){
    lastFocus=document.activeElement;
    modalTitle.textContent=data.title||'Event';
    modalDesc.textContent=data.desc||'';
    modalExtra.innerHTML=`<p><strong>Rules:</strong> ${data.rules||'—'}</p><p><strong>Prize:</strong> ${data.prize||'—'}</p><p><strong>Contact:</strong> ${data.contact||'—'}</p>`;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(()=> $('.modal-close')?.focus(),50);
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocus) lastFocus.focus();
  }

  // open details
  $$('.view-more').forEach(b=>{
    b.addEventListener('click',()=>{
      try{openModal(JSON.parse(b.getAttribute('data-event')));}catch(e){}
    });
  });

  // modal buttons
  modal.addEventListener('click',e=>{
    if(e.target.classList.contains('modal-close')||e.target.classList.contains('modal-close-2')){
      closeModal();
    }else if(e.target.classList.contains('modal-register')){
      closeModal();
      const sel=$('#event-select');
      if(sel){sel.value=modalTitle.textContent;sel.focus();}
      $('#register')?.scrollIntoView({behavior:'smooth',block:'center'});
    }else if(e.target===modal){
      closeModal();
    }
  });

  // keyboard trap & Esc
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&modal.getAttribute('aria-hidden')==='false') closeModal();
    if(e.key==='Tab'&&modal.getAttribute('aria-hidden')==='false'){
      const focusable=Array.from(modal.querySelectorAll('button,[href],input,select,textarea')).filter(el=>!el.hasAttribute('disabled'));
      if(!focusable.length) return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });

  // register button shortcut
  $$('.register-btn').forEach(b=>{
    b.addEventListener('click',()=>{
      const sel=$('#event-select');
      if(sel) sel.value=b.dataset.register||'';
      $('#register')?.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=> sel?.focus(),500);
    });
  });

  // Schedule
  const dayTabs=$$('.day-tab');
  const timelineEvents=$('#timeline-events');
  const scheduleData={
    '1':[{time:'09:00',title:'Opening Ceremony',place:'Main Stage'},{time:'10:00',title:'CodeRush Round 1',place:'Aud A'},{time:'16:00',title:'LAN Quals',place:'Lab B'}],
    '2':[{time:'10:00',title:'RoboWar Heats',place:'Arena'},{time:'13:00',title:'AI Talk',place:'Seminar Hall'},{time:'17:00',title:'TechArt',place:'Gallery'}],
    '3':[{time:'09:30',title:'ML Workshop',place:'Workshop Room'},{time:'12:00',title:'Hack Final',place:'Labs'},{time:'18:00',title:'Closing & Awards',place:'Main Stage'}]
  };
  function renderDay(d){
    timelineEvents.innerHTML='';
    (scheduleData[d]||[]).forEach(ev=>{
      const node=document.createElement('div');
      node.className='timed-event';
      node.innerHTML=`<div class="time">${ev.time}</div><div><strong>${ev.title}</strong><div class="small">${ev.place}</div></div>`;
      timelineEvents.appendChild(node);
    });
  }
  dayTabs.forEach(t=>{
    t.addEventListener('click',()=>{
      dayTabs.forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
      t.classList.add('active');t.setAttribute('aria-selected','true');
      renderDay(t.dataset.day);
    });
  });
  renderDay('1');

  // Registration
  const regForm=$('#register');
  const regStatus=$('#reg-status');
  if(regForm){
    regForm.addEventListener('submit',e=>{
      e.preventDefault();
      const name=$('#name')?.value.trim();
      const email=$('#email')?.value.trim();
      const ev=$('#event-select')?.value.trim();
      regStatus.hidden=true;
      if(!name) return showErr('Please enter full name','#name');
      if(!/\S+@\S+\.\S+/.test(email)) return showErr('Please enter valid email','#email');
      if(!ev) return showErr('Choose an event','#event-select');
      regStatus.textContent='Registration successful! Check your email.';
      regStatus.style.color='';regStatus.hidden=false;
      regForm.reset();
    });
  }
  function showErr(msg,sel){
    regStatus.textContent=msg;regStatus.hidden=false;regStatus.style.color='#ff6b6b';
    $(sel)?.focus();
    setTimeout(()=>regStatus.style.color='',3000);
  }

  // reduced motion
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    $$('.event-card,.section').forEach(el=>el.classList.add('visible'));
  }
})();
