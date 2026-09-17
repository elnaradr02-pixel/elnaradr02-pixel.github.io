// Общие скрипты портфолио: прелоадер, шапка, меню, курсор-сердечко, появление блоков, tilt, конфетти.
// ---------- preloader ----------
window.addEventListener('load',()=>{
  const fill=document.getElementById('loaderFill');
  let p=0;
  const iv=setInterval(()=>{
    p+=Math.random()*22;
    if(p>=100){p=100;clearInterval(iv);
      setTimeout(()=>document.getElementById('preloader').classList.add('hide'),250);
    }
    fill.style.width=p+'%';
  },120);
});

// ---------- header scroll state ----------
const header=document.getElementById('siteHeader');
window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled', window.scrollY>40);
});

// ---------- mobile menu ----------
const burger=document.getElementById('burger');
const mobileMenu=document.getElementById('mobileMenu');
const menuClose=document.getElementById('menuClose');
function setMenu(open){
  burger.classList.toggle('open',open);
  mobileMenu.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  burger.setAttribute('aria-expanded',open?'true':'false');
}
burger.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
menuClose.addEventListener('click',()=>setMenu(false));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
window.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});

// ---------- custom cursor ----------
// hidden until a real mouse actually moves, so it never gets stuck
// floating in the middle of the screen on touch devices / previews
const dot=document.getElementById('cursor-dot');
const ring=document.getElementById('cursor-ring');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
let cursorAwake=false;
window.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  dot.style.left=mx+'px';dot.style.top=my+'px';
  if(!cursorAwake){cursorAwake=true;document.body.classList.add('cursor-active');rx=mx;ry=my;}
},{passive:true});
function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);}
loop();

// ---------- same heart cursor, but for touch (появляется в точке касания) ----------
let touchIdleTimer=null;
function moveCursorTo(x,y){
  mx=x;my=y;
  dot.style.left=x+'px';dot.style.top=y+'px';
  if(!cursorAwake){cursorAwake=true;rx=x;ry=y;}
  document.body.classList.remove('cursor-touch-idle');
  document.body.classList.add('cursor-active');
}
window.addEventListener('touchstart',e=>{
  const t=e.touches[0]; if(!t) return;
  clearTimeout(touchIdleTimer);
  moveCursorTo(t.clientX,t.clientY);
},{passive:true});
window.addEventListener('touchmove',e=>{
  const t=e.touches[0]; if(!t) return;
  moveCursorTo(t.clientX,t.clientY);
},{passive:true});
function releaseTouchCursor(){
  clearTimeout(touchIdleTimer);
  touchIdleTimer=setTimeout(()=>document.body.classList.add('cursor-touch-idle'),500);
}
window.addEventListener('touchend',releaseTouchCursor,{passive:true});
window.addEventListener('touchcancel',releaseTouchCursor,{passive:true});
document.querySelectorAll('a,button,.work-card,.service-card,.case-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>ring.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>ring.classList.remove('hovering'));
});

// ---------- scroll reveal ----------
const io=new IntersectionObserver((entries)=>{
  entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in-view');io.unobserve(en.target);}});
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ---------- typewriter tagline ----------
const twEl=document.getElementById('typewriter');
// фразы можно задать на странице через data-phrases='["...","..."]' (так сделано в en.html)
const phrases=(twEl&&twEl.dataset.phrases)?JSON.parse(twEl.dataset.phrases):[
  'Делаю сайты, которые запоминаются, а не теряются.',
  'Собираю учебные платформы: от базы данных до кабинета ученика.',
  'Проектирую уроки, которые проходят до конца.',
  'Пишу код руками и ускоряю разработку через AI-assisted development.'
];
let phraseIdx=0,charIdx=0,deleting=false;
function typeLoop(){
  const current=phrases[phraseIdx];
  if(!deleting){
    charIdx++;
    twEl.innerHTML=current.slice(0,charIdx)+'<span class="cursor-blink">&nbsp;</span>';
    if(charIdx===current.length){deleting=true;setTimeout(typeLoop,1600);return;}
  }else{
    charIdx--;
    twEl.innerHTML=current.slice(0,charIdx)+'<span class="cursor-blink">&nbsp;</span>';
    if(charIdx===0){deleting=false;phraseIdx=(phraseIdx+1)%phrases.length;}
  }
  setTimeout(typeLoop,deleting?35:55);
}
if(twEl){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){twEl.textContent=phrases[0];}
  else typeLoop();
}

// ---------- tilt cards ----------
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5;
    const py=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(800px) rotateX(${py*-6}deg) rotateY(${px*6}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='';});
});

// ---------- magnetic buttons ----------
document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.25;
    const y=(e.clientY-r.top-r.height/2)*.5;
    btn.style.transform=`translate(${x}px,${y}px)`;
  });
  btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
});

// ---------- signature confetti easter egg ----------
const canvas=document.getElementById('confetti-canvas');
const ctx=canvas.getContext('2d');
function resizeCanvas(){canvas.width=innerWidth;canvas.height=innerHeight;}
resizeCanvas();
window.addEventListener('resize',resizeCanvas);
const colors=['#CC7A8C','#E0A182','#F8DEE2','#2B2130'];
let particles=[];
function burst(x,y){
  for(let i=0;i<60;i++){
    particles.push({
      x,y,
      vx:(Math.random()-.5)*10,
      vy:(Math.random()-1.6)*10,
      size:Math.random()*7+3,
      color:colors[Math.floor(Math.random()*colors.length)],
      rot:Math.random()*360,
      life:100
    });
  }
}
function animateConfetti(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.vy+=.25;p.x+=p.vx;p.y+=p.vy;p.life--;p.rot+=6;
    ctx.save();
    ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
    ctx.fillStyle=p.color;
    ctx.globalAlpha=Math.max(p.life/100,0);
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    ctx.restore();
  });
  particles=particles.filter(p=>p.life>0);
  requestAnimationFrame(animateConfetti);
}
animateConfetti();
const signature=document.getElementById('signature');
if(signature) signature.addEventListener('click',(e)=>{burst(e.clientX,e.clientY);});
