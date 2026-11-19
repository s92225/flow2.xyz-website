import {floors,build} from './plan.js';
import {siteFrame,halfSpan,revealStoreys,sectionAt,elevations} from './view-motion.js';
import {buildHillside} from './hillside.js';
const $=s=>document.querySelector(s), params=new URLSearchParams(location.search);
let zh=params.get('lang')!=='en',level=params.has('floor')?Math.min(2,Math.max(0,Math.round(Number(params.get('floor')))||0)):0,selected='',az=.48,el=.79,zoom=1,flat=false;
if(params.get('room')){const id=params.get('room');if(floors[level].rooms.some(r=>r[0]===id))selected=id;else for(const [i,f] of floors.entries()){if(f.rooms.some(r=>r[0]===id)){level=i;selected=id;break}}}
const stage=$('#stage'),markers=$('#markers'),levels=$('#levels'),rooms=$('#rooms'),t=(a,b)=>zh?b:a;
const back=$('#back');
back.href='../project/#walkthrough';
let T,renderer,scene,camera,group,model,ground,grid,raycaster,light;
try{
 T=await import('./vendor/three.module.js');renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor(0xe9e9e1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;stage.append(renderer.domElement);
 scene=new T.Scene();camera=new T.OrthographicCamera(-1,1,1,-1,.1,180);raycaster=new T.Raycaster();scene.add(new T.HemisphereLight(0xfffff5,0x9f927d,2.35));
 light=new T.DirectionalLight(0xfff4d9,2.6);light.position.set(-12,26,1);light.target.position.set(3,0,-1);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-33,right:33,top:25,bottom:-25,far:80});light.shadow.normalBias=.016;light.shadow.bias=-.0002;scene.add(light,light.target);
 ground=new T.Mesh(new T.PlaneGeometry(220,220),new T.ShadowMaterial({color:0x696755,opacity:.27}));ground.rotation.x=-Math.PI/2;ground.position.y=-.26;ground.receiveShadow=true;scene.add(ground);
 grid=new T.GridHelper(96,48,0xc9ccbf,0xc9ccbf);grid.position.y=-.251;grid.material.opacity=.29;grid.material.transparent=true;scene.add(grid);
}catch{flat=true;stage.replaceChildren();stage.style.touchAction='pan-y';stage.style.cursor='default';document.querySelector('.camera').hidden=true;document.querySelector('.camera').style.display='none';}
let pins=[],svg,target=siteFrame,lastW=0,lastH=0,cut;
const storeys=new Map();
const viewport=$('#viewport'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
if(renderer)renderer.shadowMap.autoUpdate=false;
const landscapeButton=$('#landscape-toggle');let landscapeOn=true,hillside;
function landscapeLabel(){
 if(!landscapeButton)return;
 landscapeButton.hidden=flat;landscapeButton.setAttribute('aria-pressed',String(landscapeOn&&!flat));
 landscapeButton.textContent=t('Hillside context','山坡環境');landscapeButton.title=t('Illustrative landscape, not a surveyed hillside','示意山坡，並非實測地形');
}
function syncLandscape(){
 if(flat)return;
 const visible=landscapeOn;if(visible&&!hillside){hillside=buildHillside(T);scene.add(hillside)}if(hillside)hillside.visible=visible;
 ground.position.y=visible?-12:-1.52;ground.visible=!visible;grid.position.y=ground.position.y+.009;grid.visible=!visible;
 renderer.setClearColor(0xe9e9e1);viewport.dataset.landscape=visible?'on':'off';renderer.shadowMap.needsUpdate=true;landscapeLabel();
}
if(landscapeButton)landscapeButton.onclick=()=>{if(flat)return;landscapeOn=!landscapeOn;syncLandscape();draw()};
if(renderer){renderer.localClippingEnabled=true;cut=new T.Plane(new T.Vector3(0,-1,0),2.45)}
let sectionHeight=sectionAt(level),wanted=level,inkShown=-1;
function ensureStorey(i){
 if(storeys.has(i))return storeys.get(i);
 const g=new T.Group();const m=build(T,g,i);
 if(i===0){const garden=m.pads.garden.parent;scene.add(garden)} // reparent complete site assembly, not just its pick plane
 g.position.y=elevations[i];g.visible=elevations[i]-.20<=sectionHeight;m.setSection(sectionHeight);
 g.traverse(o=>{if(!o.material)return;for(const mat of [].concat(o.material)){mat.clippingPlanes=[cut];mat.clipShadows=true}});
 scene.add(g);const rec={group:g,model:m};storeys.set(i,rec);return rec;
}
const motion=revealStoreys(level,(height,ink,arrived,final)=>{
 const shifted=height!==sectionHeight;
 sectionHeight=height;
 if(!flat&&(shifted||final)){cut.constant=height;for(const [i,entry] of storeys){
  entry.group.visible=elevations[i]-.20<=height;
  if(entry.group.visible)entry.model.setSection(height)
 }if(final||arrived)renderer.shadowMap.needsUpdate=true}
 const commit=arrived&&(wanted!==level||!rooms.children.length);
 if(commit)showFloor(wanted);
 if(inkShown!==ink){inkShown=ink;for(const el of [markers,rooms,$('#levelTitle'),$('#elev')])el.style.opacity=String(ink)}
 if(shifted||commit||final)draw();
},reduce,s=>{rooms.inert=!!s;rooms.setAttribute('aria-busy',String(!!s));if(s)viewport.dataset.floorMotion=s;else delete viewport.dataset.floorMotion});
reduce.addEventListener('change',()=>{if(reduce.matches)motion.settle()});
function copy(){
 syncEntry();
 landscapeLabel();
 document.documentElement.lang=zh?'zh-HK':'en';document.title=t('House 03 — spatial study','Mount Nicholson 3 號屋 — 空間研究');back.textContent=t('← Project','← 返回項目');$('#lang').textContent=t('繁中','EN');$('#lang').setAttribute('aria-label',t('繁體中文','English'));$('#lang').lang=t('zh-HK','en');levels.setAttribute('aria-label',t('Choose floor','選擇樓層'));rooms.setAttribute('aria-label',t('Room index','房間索引'));
 $('#kicker').textContent=t('RESIDENTIAL STUDY / 03','住宅空間研究 / 03');$('#model-title').textContent=flat?t('Spatial plan','平面圖'):t('Spatial model','立體空間模型');$('#section-caption').textContent=t('Drawing index','樓層索引');$('#note-head').textContent=t('Reading the model','空間註解');
 $('#instructions').textContent=flat?t('Plan view · Choose a floor and room.','平面圖 · 選擇樓層及房間。'):t('Drag to orbit · Scroll or pinch to zoom · Arrow keys to rotate','拖曳旋轉 · 滾輪或雙指縮放 · 方向鍵旋轉');
 $('#disclosure').textContent=flat?t('3D unavailable. Schematic plan shown instead.','此裝置未能顯示 3D，現以簡化平面圖展示。'):t('Schematic cutaway, not the photoreal Unreal tour.','簡化剖視模型，並非 Unreal 寫實版。');
 for(const [id,en,cn] of [['left','Rotate left','向左旋轉'],['right','Rotate right','向右旋轉'],['in','Zoom in','放大'],['out','Zoom out','縮小'],['reset','Reset view','重設視角']]){const b=$('#'+id);b.setAttribute('aria-label',t(en,cn));b.title=t(en,cn)}
 stage.setAttribute('aria-label',t('Architectural model. Use arrow keys to orbit, plus and minus to zoom, Home to reset.','建築模型。方向鍵旋轉，加減鍵縮放，Home 重設。'));
}
function tabs(){
 for(let i=0;i<floors.length;i++){let b=levels.children[i];if(!b){b=document.createElement('button');b.type='button';b.textContent=['G/F','1/F','2/F'][i];b.onclick=()=>change(i);levels.append(b)}b.setAttribute('aria-pressed',String(wanted===i))}
}
function row(){
 const f=floors[level];
 $('#levelTitle').textContent=f.name[zh?1:0];$('#elev').textContent=f.e+' m / '+t('Demo elevation','模型標高');rooms.replaceChildren();f.rooms.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.className='room';b.dataset.room=r[0];const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');b.append(num,document.createTextNode(r[zh?2:1]));b.setAttribute('aria-pressed',String(selected===r[0]));b.onclick=()=>focus(r[0]);rooms.append(b)});
}
function note(){const r=floors[level].rooms.find(r=>r[0]===selected);$('#description').textContent=r?r[zh?8:7]:t('Select a room number to trace its footprint. The cutaway shows relationships rather than as-built dimensions.','選擇房間編號可標示範圍。剖視模型展示空間關係，並非實測圖則。')}
function syncEntry(){
 const r=selected&&wanted===level?({flex:'reading',garden:'pool',bath:'mainBath',stairs:level===2?'landing2':'landing1'}[selected]||selected):['living','landing1','landing2'][wanted];
 $('#web-showroom').href='../showroom/?lang='+(zh?'zh':'en')+'&room='+encodeURIComponent(r);
}
function updateURL(){syncEntry();const u=new URL(location.href);u.searchParams.set('floor',wanted);if(selected&&wanted===level)u.searchParams.set('room',selected);else u.searchParams.delete('room');u.searchParams.set('lang',zh?'zh':'en');history.replaceState({},'',u)}
function focus(id){if(motion.moving)return;selected=id;for(const b of rooms.children)b.setAttribute('aria-pressed',String(b.dataset.room===id));note();updateURL();draw()}
function flatten(){
 const f=floors[level],g=document.createElementNS('http://www.w3.org/2000/svg','svg');g.classList.add('flat');g.setAttribute('viewBox','-190 -125 456 218');g.setAttribute('aria-label',t('Floor plan','平面圖'));stage.replaceChildren(g);svg=g;
 for(const [i,r] of f.rooms.entries()){const [x1,x2,z1,z2]=r.slice(3,7),rect=document.createElementNS(g.namespaceURI,'rect');rect.setAttribute('x',10*x1);rect.setAttribute('y',10*z1);rect.setAttribute('width',10*(x2-x1));rect.setAttribute('height',10*(z2-z1));rect.setAttribute('stroke','#7a806e');rect.setAttribute('fill',selected===r[0]?'#a2ad92':'#eeede4');rect.onclick=()=>focus(r[0]);g.append(rect);const label=document.createElementNS(g.namespaceURI,'text');label.setAttribute('x',(x1+x2)*5);label.setAttribute('y',(z1+z2)*5);label.setAttribute('text-anchor','middle');label.setAttribute('pointer-events','none');label.textContent=String(i+1).padStart(2,'0');g.append(label)}
}
function reset(){az=.48;el=.79;zoom=1;draw()}
function showFloor(i){
 if(model){for(const pad of Object.values(model.pads)){if(pad.userData.selectionOutline)pad.userData.selectionOutline.visible=false;else pad.material=model.material(model.base)}}
 if(i!==level)selected='';level=i;row();note();markers.replaceChildren();markers.dataset.floor=String(i);
 if(!flat){({group,model}=storeys.get(level));
  pins=floors[level].rooms.map((r,index)=>{const pin=document.createElement('span');pin.className='pin';pin.textContent=String(index+1).padStart(2,'0');markers.append(pin);return pin})}
}
function change(i,first=false){
 if(i===wanted&&!first)return;
 wanted=i;tabs();if(first)copy();
 if(!flat){for(let k=0;k<=wanted;k++)ensureStorey(k);if(first)syncLandscape()}
 motion.go(wanted,first||flat);if(!first)updateURL()}
function draw(){const f=floors[level];if(flat){flatten();return}
 const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
 if(w!==lastW||h!==lastH){renderer.setSize(w,h,false);lastW=w;lastH=h}const asp=w/h;
 const tx=target.x,tz=target.z,half=halfSpan(target,asp,zoom);camera.left=-half*asp;camera.right=half*asp;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();camera.position.set(tx+65*Math.cos(el)*Math.sin(az),.60+65*Math.sin(el),tz+65*Math.cos(el)*Math.cos(az));camera.lookAt(tx,.60,tz);camera.updateMatrixWorld();
 f.rooms.forEach((r,i)=>{const [a,b,c,d]=r.slice(3,7),pad=model.pads[r[0]];pad.material=model.material(r[0]===selected?0xb0b99b:r[0]==='garden'?model.water:model.base);if(pad.userData.selectionOutline)pad.userData.selectionOutline.visible=r[0]===selected;
 const v=new T.Vector3((a+b)/2,elevations[level]+(r[0]==='stairs'?2.28:r[0]==='garden'?.05:.97),(c+d)/2).project(camera);pins[i].style.left=(v.x+1)*w/2+'px';pins[i].style.top=(1-v.y)*h/2+'px';pins[i].classList.toggle('on',r[0]===selected)});
 renderer.render(scene,camera);
}
function apply(daz,del,m){az+=daz;el=Math.max(.27,Math.min(1.53,el+del));zoom=Math.max(.7,Math.min(2.5,zoom*m));draw()}
$('#lang').onclick=()=>{zh=!zh;copy();row();note();draw();updateURL()};$('#in').onclick=()=>apply(0,0,1.18);$('#out').onclick=()=>apply(0,0,1/1.18);$('#left').onclick=()=>apply(-.22,0,1);$('#right').onclick=()=>apply(.22,0,1);$('#reset').onclick=reset;
const pointers=new Map();let gesture='idle',moved=false,start,pinch=0,wheelGuard=0;
const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};
stage.onpointerdown=e=>{
 if(flat||e.button!==0||pointers.size===2)return;
 // One mouse/pen/finger orbits. Two fingers exclusively pinch; an old
 // contact left over from a pinch never starts a new orbit or room pick.
 if(pointers.size&&e.pointerType!=='touch')return;
 stage.focus({preventScroll:true});pointers.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);
 if(pointers.size===1){gesture='orbit';moved=false;start=[e.clientX,e.clientY]}
 else{gesture='pinch';moved=true;pinch=distance()}
};
stage.onpointermove=e=>{
 const last=pointers.get(e.pointerId);if(!last)return;
 const dx=e.clientX-last[0],dy=e.clientY-last[1];pointers.set(e.pointerId,[e.clientX,e.clientY]);
 if(gesture==='pinch'&&pointers.size===2){const d=distance();if(pinch>1&&d>1&&Math.abs(d-pinch)>.04)apply(0,0,d/pinch);pinch=d}
 else if(gesture==='orbit'){if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>3)moved=true;if(moved&&(dx||dy))apply(-dx*.009,dy*.007,1)}
};
function release(e,cancelled){
 if(!pointers.has(e.pointerId))return;
 const tap=gesture==='orbit'&&!moved&&!cancelled&&!motion.moving;
 pointers.delete(e.pointerId);gesture=pointers.size?'await-release':'idle';
 if(moved||cancelled)wheelGuard=performance.now()+160;
 if(!tap||flat)return;
 const rect=stage.getBoundingClientRect(),mouse=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
 const i=pins.findIndex(p=>{const r=p.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});
 if(i>=0){focus(floors[level].rooms[i][0]);return}raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(model.pick)[0];if(hit)focus(hit.object.userData.room);
}
stage.onpointerup=e=>release(e,false);stage.onpointercancel=stage.onlostpointercapture=e=>release(e,true);
stage.addEventListener('wheel',e=>{
 if(flat)return;e.preventDefault();if(pointers.size||performance.now()<wheelGuard||!e.deltaY||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);apply(0,0,Math.exp(Math.max(-.32,Math.min(.32,-dy*.002))));
},{passive:false});
stage.addEventListener('keydown',e=>{if(flat)return;const actions={ArrowLeft:()=>apply(-.1,0,1),ArrowRight:()=>apply(.1,0,1),ArrowUp:()=>apply(0,.1,1),ArrowDown:()=>apply(0,-.1,1),'+':()=>apply(0,0,1.1),'=':()=>apply(0,0,1.1),'-':()=>apply(0,0,1/1.1),Home:reset};if(actions[e.key]){e.preventDefault();actions[e.key]()}});
let surfaceRAF=0;
window.addEventListener('model-material-ready',()=>{
 if(flat||surfaceRAF)return;
 surfaceRAF=requestAnimationFrame(()=>{surfaceRAF=0;renderer.shadowMap.needsUpdate=true;draw()});
});
change(level,true);new ResizeObserver(()=>draw()).observe(stage);
