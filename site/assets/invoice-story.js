/* A local, illustrative WhatsApp → Flow2 → invoice → customer story.
   WAAPI transform/opacity only. Never opens WhatsApp or creates/sends an invoice. */
(() => {
  'use strict';
  const DURATION=11000, APPROVAL_TIME=Math.round(DURATION*.17);
  const ORDER={quantity:20,unitPrice:180};
  const AMOUNT=ORDER.quantity*ORDER.unitPrice;
  const MONEY='HK$'+AMOUNT.toLocaleString('en-HK');
  const MOVE='cubic-bezier(.77,0,.175,1)';
  const OUT='cubic-bezier(.22,1,.36,1)';
  const words={
    zh:{client:'客人',message:'請問 20 盒禮盒<br>合共多少錢？',quote:`20 盒合共 ${MONEY}。`,generate:'一鍵生成發票',cs:'客服 CS',reply:'Invoice 已送達',processing:'按已確認報價開單',item:'示例禮盒',quantity:`${ORDER.quantity} × HK$${ORDER.unitPrice}`,total:'總額',file:'Invoice · PDF',delivered:'已送達',sample:'示例訂單 · 動畫不會實際開立發票或傳送 WhatsApp 訊息',phases:['客人問價','CS 回覆','一鍵開單','發送發票'],captions:['客人詢問 20 盒禮盒的價錢。','報價已確認，由 CS 按鈕開單。','Flow2 按報價生成發票。','發票正在傳送予客戶。'],try:'體驗發票流程',replay:'再試一次',label:'客人問價、客服回覆 3600 元，再按鈕生成發票並發送予客戶的互動示範'},
    en:{client:'Customer',message:'How much for<br>20 gift sets?',quote:`20 sets total ${MONEY}.`,generate:'Generate invoice',cs:'Customer service',reply:'Invoice delivered',processing:'Using the agreed quote',item:'Sample gift sets',quantity:`${ORDER.quantity} × HK$${ORDER.unitPrice}`,total:'Total',file:'Invoice · PDF',delivered:'Delivered',sample:'Sample order. This animation does not create invoices or send WhatsApp messages.',phases:['Enquiry','CS reply','Generate','Delivered'],captions:['A customer asks about 20 gift sets.','CS confirms the price, then starts the invoice.','Flow2 generates the agreed invoice.','Sending it back to the customer.'],try:'Try an invoice',replay:'Play again',label:'A customer asks for a price, CS quotes HK$3,600, then generates an invoice and sends it back'}
  };
  const smallDocument='<svg viewBox="0 0 30 36" aria-hidden="true"><path d="M4 1h15l7 7v27H4z"/><path d="M19 1v8h7M9 15h12M9 21h12M9 27h8"/></svg>';
  const ticks='<svg viewBox="0 0 26 16" aria-hidden="true"><path d="m2 8 4 4L16 2M11 10l3 3L24 3"/></svg>';
  const t=(x,y,s=1,r=0)=>`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  const key=(offset,transform,opacity=1,easing=MOVE)=>({offset,transform,opacity,easing});
  function cubic(p0,p1,p2,p3,u){const q=1-u;return{x:q*q*q*p0.x+3*q*q*u*p1.x+3*q*u*u*p2.x+u*u*u*p3.x,y:q*q*q*p0.y+3*q*q*u*p1.y+3*q*u*u*p2.y+u*u*u*p3.y};}
  class FlowInvoiceStory {
    static markup(locale='zh'){
      const w=words[locale];
      return `<div class="invoice-film" role="group" aria-label="${w.label}" data-ui>
        <svg class="story-flight-trail" aria-hidden="true"><path/></svg>
        <div class="story-chat">
          <div class="wa-header"><img src="assets/invoice-story/whatsapp.svg" width="28" height="32" alt=""><div><strong>${w.client}</strong><span>WhatsApp</span></div><span class="wa-header-dots" aria-hidden="true">···</span></div>
          <div class="wa-conversation"><div class="wa-incoming">${w.message}<small>10:24</small></div><div class="wa-cs-reply"><span>${w.cs}</span><p>${w.quote}</p><small>10:25 ${ticks}</small></div><button type="button" class="wa-generate-invoice" data-generate-invoice disabled>${smallDocument}<span>${w.generate}</span><span aria-hidden="true">↗</span></button><div class="wa-received-file"><span class="wa-pdf-icon">${smallDocument}<b>PDF</b></span><div><strong>INV-003.pdf</strong><span>${w.file}</span></div><small class="wa-ticks">${ticks}</small></div></div>
        </div>
        <div class="story-message-token" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="story-core"><div class="story-core-tile"><span>flow<sup>2</sup></span></div><p>${w.processing}</p><i class="story-data data-a" aria-hidden="true"></i><i class="story-data data-b" aria-hidden="true"></i><i class="story-data data-c" aria-hidden="true"></i></div>
        <div class="story-invoice"><div class="invoice-brand">flow<sup>2</sup><span>INVOICE</span></div><div class="invoice-reference">INV-003</div><div class="invoice-graphic" aria-hidden="true">${smallDocument}</div><div class="invoice-order"><strong>${w.item}</strong><span>${w.quantity}</span></div><div class="invoice-total"><span>${w.total}</span><strong>${MONEY}</strong></div></div>
        <div class="story-plane" aria-hidden="true"><svg viewBox="0 0 100 100"><path class="plane-paper" d="M6 50 94 7 58 93 44 60Z"/><path class="plane-crease" d="m6 50 38 10L94 7 31 49 6 50Z"/><path class="plane-fold" d="m44 60 2 22 12-12"/></svg></div>
        <div class="story-delivered"><span>${ticks}</span>${w.reply}</div>
        <p class="story-caption" aria-hidden="true">${w.captions[0]}</p>
      </div><p class="story-honesty">${w.sample}</p>`;
    }
    constructor(stage,{locale='zh',isPaused=()=>false,onPhase=()=>{},state=null}={}){
      this.stage=stage;this.root=stage.querySelector('.invoice-film');this.locale=locale;this.w=words[locale];this.isPaused=isPaused;this.onPhase=onPhase;
      this.requiresApproval=!this.root.hasAttribute('data-function-kind');this.approved=state?.approved??false;
      this.animations=[];this.visible=false;this.running=state?.running??true;this.destroyed=false;this.lastPhase=-1;this.lastDelivered=null;
      this.reduce=matchMedia('(prefers-reduced-motion: reduce)');this.resize=null;
      this.build(this.reduce.matches?(this.requiresApproval&&!this.approved?APPROVAL_TIME:DURATION):state?.time??0);
      this.visibility=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.sync();},{threshold:.3});this.visibility.observe(this.root);
      this.resize=new ResizeObserver(()=>{const r=this.root.getBoundingClientRect();if(Math.abs(r.width-this.width)>.5||Math.abs(r.height-this.height)>.5)this.build(this.time());});this.resize.observe(this.root);
      this.onVisibility=()=>this.sync();document.addEventListener('visibilitychange',this.onVisibility);
      this.onReduce=()=>{if(this.reduce.matches){this.running=false;this.seek(this.requiresApproval&&!this.approved?APPROVAL_TIME:DURATION);}this.sync();};this.reduce.addEventListener('change',this.onReduce);
      this.onClick=e=>{
        if(e.target.closest('[data-generate-invoice]')){this.generate();return;}
        const b=e.target.closest('button[data-story-phase]');if(b){this.running=false;const phase=+b.dataset.storyPhase;this.seek(this.requiresApproval&&!this.approved&&phase>0?APPROVAL_TIME:[650,3400,5900,10600][phase]);this.sync();}
      };
      stage.addEventListener('click',this.onClick);
      this.timer=setInterval(()=>this.update(),160);
      this.update(true);this.sync();
    }
    track(selector,frames){
      const animation=this.root.querySelector(selector).animate(frames,{duration:DURATION,fill:'both',easing:'linear'});animation.pause();this.animations.push(animation);return animation;
    }
    build(at=0){
      this.animations.forEach(a=>a.cancel());this.animations=[];
      const rect=this.root.getBoundingClientRect();this.width=rect.width;this.height=rect.height;
      const phone=rect.width<580;
      const left=phone?0:-Math.min(292,rect.width*.285),right=phone?0:Math.min(272,rect.width*.27),up=phone?-130:0;
      const chatSmall=phone ? .68 : .84;
      const chatQuiet=phone ? 0 : .3, coreQuiet=phone ? 0 : .28;
      this.clock=this.track('.story-chat',[
        key(0,t(0,0),1,OUT),key(.17,t(0,0),1),key(.28,t(left,up,chatSmall),chatQuiet),key(.73,t(left,up,chatSmall),chatQuiet),key(.78,t(left,up,chatSmall),chatQuiet),key(.9,t(0,0),1,OUT),key(1,t(0,0),1)
      ]);
      this.track('.wa-incoming',[key(0,t(0,8),0,OUT),key(.045,t(0,0),1),key(1,t(0,0),1)]);
      this.track('.wa-cs-reply',[key(0,t(0,8),0),key(.065,t(0,8),0,OUT),key(.105,t(0,0),1),key(1,t(0,0),1)]);
      this.track('.wa-generate-invoice',[key(0,t(0,6),0),key(.125,t(0,6),0,OUT),key(.165,t(0,0),1),key(.17,t(0,0),1),key(.205,t(0,-4),0),key(1,t(0,-4),0)]);
      this.track('.wa-received-file',[key(0,t(0,14,.96),0),key(.86,t(0,14,.96),0,OUT),key(.91,t(0,0),1),key(1,t(0,0),1)]);
      this.track('.story-message-token',[
        key(0,t(left,up),0),key(.17,t(left,up),0),key(.19,t(left,up),1),key(.29,t(0,0,.38,-9),1),key(.32,t(0,0,.3,-9),0),key(1,t(0,0,.3),0)
      ]);
      this.track('.story-core',[
        key(0,t(0,0,.94),0),key(.23,t(0,0,.94),0,OUT),key(.3,t(0,0),1),key(.41,t(0,0),1),key(.47,t(phone?-75:-20,phone?25:0,.82),coreQuiet),key(.64,t(phone?-75:-20,phone?25:0,.82),coreQuiet),key(.77,t(phone?-75:-20,phone?25:0,.82),0),key(1,t(0,0,.82),0)
      ]);
      ['.data-a','.data-b','.data-c'].forEach((selector,i)=>{
        const angle=i*2.094;const x=Math.cos(angle)*82,y=Math.sin(angle)*70;
        this.track(selector,[key(0,t(x,y,.9,i*24),0),key(.275+i*.018,t(x,y,.9,i*24),0),key(.3+i*.018,t(x,y,.9,i*24),1),key(.365+i*.018,t(0,0,.6,0),0),key(1,t(0,0,.6),0)]);
      });
      this.track('.story-invoice',[
        key(0,t(0,28,.75),0),key(.39,t(0,28,.75),0,OUT),key(.49,t(right,0),1),key(.6,t(right,0),1),key(.645,`translate3d(${right}px,0,0) perspective(700px) rotateY(72deg) rotate(9deg) scale(.65)`,.45),key(.667,t(right,-8,.4,14),0),key(1,t(right,-8,.4),0)
      ]);
      const start={x:right,y:-8},bend={x:phone?-70:left,y:-52},end={x:0,y:62};
      const p1={x:right+(phone?145:80),y:-165},p2={x:(phone?-140:left-30),y:-177};
      const q1={x:bend.x-30,y:55},q2={x:-65,y:125};
      const plane=[key(0,t(right,-8,.8),0),key(.635,t(right,-8,.8),0),key(.66,t(right,-8),1,'linear')];
      const path=[];let previousAngle=null;
      for(let i=0;i<=54;i++){
        const u=i/54;let p,next;
        if(u<=.56){const v=u/.56;p=cubic(start,p1,p2,bend,v);next=cubic(start,p1,p2,bend,Math.min(1,v+.012));}
        else{const v=(u-.56)/.44;p=cubic(bend,q1,q2,end,v);next=cubic(bend,q1,q2,end,Math.min(1,v+.012));}
        let angle=Math.atan2(next.y-p.y,next.x-p.x)*180/Math.PI+45;if(i===54)angle=-2;
        // Keep banking continuous across atan2's -180/180 boundary.
        if(previousAngle!==null){while(angle-previousAngle>180)angle-=360;while(angle-previousAngle<-180)angle+=360;}previousAngle=angle;
        plane.push(key(.665+u*.235,t(p.x,p.y,1-u*.4,angle),1,'linear'));path.push(p);
      }
      plane.push(key(.918,t(end.x,end.y,.28,previousAngle),0,OUT),key(1,t(end.x,end.y,.28,previousAngle),0));this.track('.story-plane',plane);
      const trail=this.root.querySelector('.story-flight-trail');trail.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
      trail.querySelector('path').setAttribute('d',path.map((p,i)=>`${i?'L':'M'}${(p.x+rect.width/2).toFixed(1)} ${(p.y+rect.height/2).toFixed(1)}`).join(' '));
      this.track('.story-flight-trail',[{offset:0,opacity:0},{offset:.66,opacity:0},{offset:.69,opacity:.8},{offset:.89,opacity:.8},{offset:.94,opacity:0},{offset:1,opacity:0}]);
      this.track('.story-delivered',[key(0,t(0,10,.97),0),key(.91,t(0,10,.97),0,OUT),key(.955,t(0,0),1),key(1,t(0,0),1)]);
      this.seek(Math.min(DURATION,at));this.sync();
    }
    time(){return Number(this.clock?.currentTime)||0;}
    snapshot(){return {time:this.time(),running:this.running,approved:this.approved};}
    seek(time){this.animations.forEach(a=>{a.currentTime=time;});this.update(true);}
    replay(){this.approved=false;this.running=!this.reduce.matches;this.seek(this.reduce.matches?(this.requiresApproval?APPROVAL_TIME:DURATION):0);this.sync();}
    generate(){
      if(!this.requiresApproval||this.approved||this.time()<APPROVAL_TIME-1)return false;
      this.approved=true;this.running=!this.reduce.matches;
      this.root.setAttribute('tabindex','-1');this.root.focus({preventScroll:true});
      if(this.reduce.matches)this.seek(DURATION);else this.update(true);
      this.sync();return true;
    }
    sync(){
      if(this.destroyed)return;
      const play=this.running&&this.visible&&!this.isPaused()&&!document.hidden&&!this.reduce.matches&&this.time()<DURATION;
      this.animations.forEach(a=>{if(play){if(a.playState!=='running')a.play();}else a.pause();});
      this.root.dataset.playing=String(play);
    }
    update(force=false){
      let time=this.time();
      if(this.requiresApproval&&!this.approved&&time>=APPROVAL_TIME){this.running=false;this.animations.forEach(a=>{a.pause();a.currentTime=APPROVAL_TIME;});time=APPROVAL_TIME;this.root.dataset.playing='false';}
      if(this.requiresApproval){this.root.dataset.awaitingApproval=String(!this.approved&&time>=APPROVAL_TIME);const action=this.root.querySelector('[data-generate-invoice]');if(action){action.disabled=this.approved||time<APPROVAL_TIME;action.setAttribute('aria-hidden',String(action.disabled));}
        this.root.querySelector('.wa-cs-reply')?.setAttribute('aria-hidden',String(time<900));
        this.root.querySelector('.story-invoice')?.setAttribute('aria-hidden',String(!this.approved||time<DURATION*.49||time>DURATION*.667));
        this.root.querySelector('.story-core')?.setAttribute('aria-hidden','true');
        this.root.querySelector('.wa-received-file')?.setAttribute('aria-hidden',String(!this.approved||time<10000));
        this.root.querySelector('.story-delivered')?.setAttribute('aria-hidden',String(!this.approved||time<10000));}
      const phase=this.requiresApproval?(time<900?0:!this.approved?1:time<7350?2:3):(time<2600?0:time<4850?1:time<7350?2:3);const delivered=time>=10000;
      if(phase!==this.lastPhase||force){
        this.lastPhase=phase;this.stage.dataset.storyPhase=phase;this.stage.dataset.step=phase;
        this.stage.querySelectorAll('[data-story-phase]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.storyPhase===phase));
        this.root.querySelector('.story-caption').textContent=this.w.captions[phase];this.onPhase(phase);
        if(this.requiresApproval){const live=this.stage.querySelector('#hero-announcement');if(live)live.textContent=this.w.captions[phase];}
      }
      if(delivered!==this.lastDelivered||force){this.lastDelivered=delivered;this.stage.dataset.storyDelivered=String(delivered);const live=this.stage.querySelector('#hero-announcement');if(live&&delivered)live.textContent=this.w.reply;}
      if(time>=DURATION&&this.running){this.running=false;this.sync();}
    }
    destroy(){this.destroyed=true;this.animations.forEach(a=>a.cancel());this.visibility?.disconnect();this.resize?.disconnect();clearInterval(this.timer);document.removeEventListener('visibilitychange',this.onVisibility);this.reduce.removeEventListener('change',this.onReduce);this.stage.removeEventListener('click',this.onClick);}
    static phases(locale){return words[locale].phases;}
    static button(locale){return words[locale].try;}
  }
  window.FlowInvoiceStory=FlowInvoiceStory;
})();
