import * as T from 'three';
import {GLTFLoader,MeshoptDecoder} from './vendor/loader.js';

import {makeKit} from './open-fittings.js';
import {wings} from './wings.js';
import {landscapeFinishes} from './grounds.js';
import {directory} from './directory.js';
import {byId,where} from './places.js';
import {makeNavigation,surface,eye} from './navigation.js';
import {privacyRooms} from './privacy.js';
import {liftRide} from './lift-ride.js';
import {finishEnvelope} from './envelope.js';
import {setupResolution,touchDevice} from './resolution.js';
import {qualityControls,quality} from './arrival.js';
import {bindLook} from './look.js';

const $=id=>document.getElementById(id), en=new URLSearchParams(location.search).get('lang')==='en', t=(zh,eng)=>en?eng:zh;
const canvas=$('room'), guide=$('guide'), text=(id,zh,eng)=>$(id).textContent=t(zh,eng);
const zhBack=new URL('../model/?floor=0&lang='+ (en?'en':'zh'),document.baseURI);
if(document.referrer){try{const r=new URL(document.referrer);if(r.origin===location.origin && r.pathname===zhBack.pathname && /^[0-2]$/.test(r.searchParams.get('floor')))zhBack.searchParams.set('floor',r.searchParams.get('floor'))}catch{}}
$('back').href=zhBack;
if(en){document.documentElement.lang='en';document.title='House 03 · Three-storey walkthrough | Stillform';text('coverTitle','','Walk through House 03');text('load','','Preparing the room…');text('back','','← Floor model');text('stillLink','','See the project images →');text('fabricTitle','','Sofa upholstery');text('finishes','','Upholstery ＋');text('guideTitle','','Visiting the house');text('guideText','','Click or tap the floor to walk. Hold either mouse button and move the mouse to look in the same direction; release to stop. Use WASD to walk at the same time. On touch screens, drag the view. Use the arrow keys to turn without a mouse. Tap a linen sofa to try a fabric. At the sliding door press E or tap Open door. All three floors share one staircase. Open the room index to follow a route or go directly to a room.');text('closeGuide','','Continue');$('help').ariaLabel='Visitor guide';$('closeSamples').ariaLabel='Close upholstery';canvas.ariaLabel='First-person interior: tap the floor or use WASD to walk. Hold and move the mouse to look, or use the arrow keys.'}
if(en){
 text('arrival-quality-label','','3D quality');text('resolution-label','','3D quality');text('resolution-hint','','Choose Smooth if movement stutters. All rooms and furniture are still available.');
 for(const select of qualityControls)['Auto (recommended)','Smooth','Sharp'].forEach((v,i)=>select.options[i].textContent=v)
}
function set(el,key,value){if(el[key]!==value)el[key]=value}
function attr(el,key,value){if(el.getAttribute(key)!==value)el.setAttribute(key,value)}
let cancelWalk=()=>{},cancelLook=()=>{},keys=new Set();
if(en){text('lift-guide','','Call the lift in any of the three lobbies. Enter when the doors open, choose a floor, then exit after arrival.');text('bath-guide','','At a bathroom door, tap the door, use the door button or press E. Guided walks open and close it for you.')}
$('help').onclick=()=>{cancelLook();cancelWalk();keys.clear();guide.showModal()};$('closeGuide').onclick=()=>guide.close();
const notice=(zh,eng)=>{text('notice',zh,eng);clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('notice').textContent='',2400)};
function fallback(){cancelLook();$('cover').hidden=false;$('tools').hidden=true;$('progress').hidden=true;$('stillLink').hidden=false;$('arrival-quality').closest('.pref').hidden=true;text('load','未能顯示即時 3D。可以重新載入，或先睇項目圖輯。','Live 3D is unavailable. Reload to retry, or view the project photographs.'); }
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});canvas.addEventListener('webglcontextrestored',()=>location.reload());
const finishes=[
 {id:'linen',label:t('燕麥亞麻','Oat linen'),color:'#eee3d2',rough:.91,sheen:.25},
 {id:'velvet',label:t('苔綠絲絨','Moss velvet'),color:'#48614f',rough:.76,sheen:.55},
 {id:'nubuck',label:t('栗色磨砂皮','Chestnut nubuck'),color:'#996645',rough:.56,sheen:.13}];
const samples=$('samples');
function panel(v){samples.hidden=!v;$('finishes').setAttribute('aria-expanded',String(v))}
$('finishes').onclick=()=>panel(samples.hidden);$('closeSamples').onclick=()=>{panel(false);$('finishes').focus()};
const asset=n=>new URL('./assets/'+n,import.meta.url).href;
const clamp=T.MathUtils.clamp, TAU=Math.PI*2;
function owner(o,regex){for(let p=o;p;p=p.parent)if(regex.test(p.name))return p;return null}
function bake(m,tex,fabricFloor){
 m.onBeforeCompile=s=>{s.uniforms.houseDaylight={value:tex};s.vertexShader='varying vec3 vHousePos;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvHousePos=(modelMatrix*vec4(transformed,1.)).xyz;'+(fabricFloor?'\n#ifdef USE_MAP\nvMapUv=vHousePos.xz/.82;\n#endif\n#ifdef USE_NORMALMAP\nvNormalMapUv=vHousePos.xz/.82;\n#endif\n':''));
 s.fragmentShader='varying vec3 vHousePos; uniform sampler2D houseDaylight;\n'+s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nvec2 hu=clamp(vec2(vHousePos.x/14.794,0.5-vHousePos.z/5.74),vec2(.001),vec2(.999)); diffuseColor.rgb*=vec3(.15)+texture2D(houseDaylight,hu).rgb*1.42;');};m.customProgramCacheKey=()=>fabricFloor?'garden-wool':'garden-oak';
}
async function start(){
 const params=new URLSearchParams(location.search),startRoom=byId[params.get('room')];
 const mobile=touchDevice(),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const r=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'}),scene=new T.Scene(),cam=new T.PerspectiveCamera(67,1,.045,140);
 r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.03;
 r.shadowMap.enabled=true;r.shadowMap.type=quality.mode==='smooth'?T.BasicShadowMap:T.PCFShadowMap;r.shadowMap.autoUpdate=false;r.shadowMap.needsUpdate=true;
 const dirty=()=>{redraw=true};let redraw=true;
 const resolution=setupResolution({quality,compact:mobile,r,canvas,resize:(w,h)=>{cam.aspect=w/h;cam.updateProjectionMatrix();r.setSize(w,h,false);dirty()}});
 scene.background=new T.Color(0xcacbc4);
 const hemi=new T.HemisphereLight(0xfff8e9,0xa6a59c,1.18);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffecd2,2.25);sun.position.set(-2,8,-10);sun.target.position.set(5,0,0);scene.add(sun,sun.target);sun.castShadow=true;
 Object.assign(sun.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:.1,far:38});sun.shadow.camera.updateProjectionMatrix();sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.bias=-.00015;sun.shadow.normalBias=.022;
 quality.onChange(()=>{
  const type=quality.mode==='smooth'?T.BasicShadowMap:T.PCFShadowMap;
  if(r.shadowMap.type!==type){r.shadowMap.type=type;r.shadowMap.needsUpdate=true;dirty()}
 });
 const skyloader=new T.TextureLoader(),progress=$('progress');progress.value=5;
 const tex=async(n,color=false)=>{const v=await skyloader.loadAsync(asset(n));if(color)v.colorSpace=T.SRGBColorSpace;v.anisotropy=Math.min(4,r.capabilities.getMaxAnisotropy());return v};
 const manager=new T.LoadingManager(),loader=new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
 const fitJob=fetch(asset('floor-fit.json')).then(r=>{if(!r.ok)throw Error('House floor data');return r.json()});
 // The furnished reception area and complete structural envelope block arrival. Separate furnishings stream afterwards.
 const [kit,gltf,lightmap,bg,rug,rugBump,weft,wallIrr,topIrr,fit,shell,groundEnvelope]=await Promise.all([makeKit(loader),loader.loadAsync(asset('house03.glb'),e=>{if(e.total)progress.value=10+65*e.loaded/e.total}),tex('daylight.webp'),tex('hillside-sky.webp',true),tex('wool.webp',true),tex('wool-normal.webp'),tex('plaster.webp'),tex('gallery.webp'),tex('soffit.webp'),fitJob,loader.loadAsync(asset('shell.glb')),loader.loadAsync(asset('ground-envelope.glb'))]);
 bg.mapping=T.EquirectangularReflectionMapping;scene.background=bg;scene.environment=bg;scene.environmentIntensity=.39;
 const model=gltf.scene;scene.add(model);kit.place("house03",model,scene);model.updateWorldMatrix(true,true);
 rug.wrapS=rug.wrapT=rugBump.wrapS=rugBump.wrapT=T.RepeatWrapping;weft.wrapS=weft.wrapT=T.RepeatWrapping;
 const boxes=[],rayMeshes=[],cloth=[],applied=new Set(),doors=[];
 const glass=new T.MeshPhysicalMaterial({color:0xabbbad,roughness:.17,metalness:.06,opacity:.045,transparent:true,depthWrite:false,side:T.DoubleSide});
 model.traverse(o=>{
  if(/^(SM_GDN_DoorLeaf(Glass)?)$/.test(o.name)){o.position.z=-3.035;doors.push([o,o.position.x]);o.updateWorldMatrix(true,true)}
  if(/^(House_Linen_(Gallery|Garden)|SM_CUR_(MidnightVelvet|StoneOakCoffee|StoneBrass(West|East)|WarmCopper\d|BrassLamp(West|East))|SM_EXT_(LoungeChair_\d|SittingTeaTable)|SM_INT_(LinhaTable|FynnChair_\d))$/.test(o.name)){
   const b=new T.Box3().setFromObject(o,true);if(!b.isEmpty())boxes.push([b.min.x,b.max.x,b.min.z,b.max.z])
  }
  if(owner(o,/^(Inset.?walnut.?leaf|Bronze.?finger.?pull)/i)){o.visible=false;return} // Open the three temporary doors used to close off the original sample.
  if(!o.isMesh)return;let m=o.material;let pane=m.name==='M_GlazingMarker'||owner(o,/^SM_GDN_DoorLeafGlass$/);if(pane)o.material=m=glass;
  const floor=owner(o,/^SM_OakFloor|^SM_CUR_SilverWovenRug/);
  o.castShadow=!pane&&!floor;o.receiveShadow=!pane;rayMeshes.push(o);
  if(owner(o,/^SM_CUR_SilverWovenRug/)&&!applied.has(m)){m.metalness=0;m.metalnessMap=null;m.roughness=.99;m.roughnessMap=null;m.normalMap=rugBump;m.normalScale.set(.38,.38);m.color.set(0xffffff);m.map=rug}
  if((m.name==='M_PorcelainPaint'||m.name==='M_CeilingChalk')&&!applied.has(m)){
   m.roughness=.96;m.normalMap=weft;m.normalScale.set(.115,.115);m.onBeforeCompile=shader=>{shader.uniforms.wallIrr={value:wallIrr};shader.uniforms.topIrr={value:topIrr};
    shader.vertexShader='varying vec3 plasterPos;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nplasterPos=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 plasterPos; uniform sampler2D topIrr; uniform sampler2D wallIrr;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat edge=min(2.95-abs(plasterPos.z),min(plasterPos.x,14.8-plasterPos.x));float cove=min(abs(plasterPos.y-3.81),abs(plasterPos.y));diffuseColor.rgb*=mix(.64,1.,smoothstep(0.,.42,max(0.,max(cove,edge))))*(.95-.13*smoothstep(-2.1,2.8,plasterPos.z));vec3 wi=texture2D(wallIrr,clamp(vec2(plasterPos.x/14.794,plasterPos.y/3.88),vec2(.001),vec2(.999))).rgb;vec3 ci=texture2D(topIrr,clamp(vec2(plasterPos.x/14.794,.5-plasterPos.z/5.74),vec2(.001),vec2(.999))).rgb;diffuseColor.rgb*=mix(vec3(1.),.38+wi*1.38,smoothstep(2.45,2.78,plasterPos.z));diffuseColor.rgb*=mix(vec3(1.),.47+ci*1.35,smoothstep(3.45,3.71,plasterPos.y));');
   };m.customProgramCacheKey=()=>'window-wall';applied.add(m)
  }
  if(floor&&!applied.has(m)){bake(m,lightmap,!!owner(o,/^SM_CUR_SilverWovenRug/));applied.add(m)}
  if(owner(o,/^House_Linen_/)&&/GlamVelvetSofa.fabric/i.test(m.name))cloth.push([o,m]);
  if(m.name==='M_GDN_WaterPlaceholder'){m.color.set(0x65948c);m.roughness=.16;m.metalness=.3}
 });
 // Repeat the original UV transform on each alternative woven surface. Feet and hardware stay original.
 const fabricCache=new Map(),weaves=new Map();let fabricChoice=0;
 async function choose(i){
  const serial=++fabricChoice;let weave;
  if(i){try{if(!weaves.has(i))weaves.set(i,tex(finishes[i].id+'.webp',true));weave=await weaves.get(i)}
   catch{weaves.delete(i);if(serial===fabricChoice)notice('面料暫時未能載入。','Fabric could not be loaded.');return}}
  if(serial!==fabricChoice)return;
  for(const [o,base] of cloth){const k=base.uuid+':'+i;
  if(!i){o.material=base;continue}
  if(!fabricCache.has(k)){const f=finishes[i],map=weave.clone();map.wrapS=map.wrapT=T.RepeatWrapping;map.flipY=base.map?.flipY??false;map.repeat.copy(base.map?.repeat??new T.Vector2(6,6));map.offset.copy(base.map?.offset??new T.Vector2());map.needsUpdate=true;
   fabricCache.set(k,new T.MeshPhysicalMaterial({map,color:f.color,vertexColors:base.vertexColors,roughness:f.rough,metalness:0,sheen:f.sheen,sheenColor:new T.Color(f.color).lerp(new T.Color(0xffffff),.32),sheenRoughness:.75,side:base.side,normalMap:base.normalMap,normalScale:base.normalScale}))}
  o.material=fabricCache.get(k)}
  $('chosen').textContent=finishes[i].label;canvas.dataset.fabric=finishes[i].id;[...$('swatches').children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));dirty();
 }
 finishes.forEach((f,i)=>{const b=document.createElement('button');b.title=b.ariaLabel=f.label;b.style.backgroundColor=f.color;b.onclick=()=>choose(i);$('swatches').append(b)});choose(0);
 // Near-field planting is drawn after the first usable indoor frame.
 let planting;
 const plant=()=>planting??=Promise.all([import('../model/hillside.js'),import('../model/exterior.js')]).then(([{buildHillside},{buildExterior}])=>{
 const hillside=buildHillside(T);scene.add(hillside);
 // Re-use the exact planting layout from the floor model without duplicating its schematic house or slabs.
 const sampleSite=new T.Group(),garden=new T.Group();buildExterior(T,sampleSite);
 for(const o of [...sampleSite.children[0].children]){if(o.isInstancedMesh||/Garden foliage|Woodland planting bed|Poolside mixed border|Tea garden gravel/.test(o.name))garden.add(o);
  else {o.geometry?.dispose();o.material?.dispose()}}
 scene.add(garden);garden.traverse(o=>{if(o.isMesh){rayMeshes.push(o);o.userData.planting=true}});
 r.shadowMap.needsUpdate=true;dirty()
 }).catch(e=>{planting=null;console.warn('Garden planting is not available:',e)});
 window.addEventListener('model-material-ready',()=>{r.shadowMap.needsUpdate=true;dirty()});
 const waterFrame=landscapeFinishes(model,bg,dirty,reduced||mobile);
 const wing=wings({fit,envelope:{shell,'ground-envelope':groundEnvelope},scene,loader,kit,glass,quality,mobile,rayMeshes,rug,rugBump,render:dirty,updateShadow:()=>{r.shadowMap.needsUpdate=true}});
 await wing.prepareEnvelope();
 const liftModel=finishEnvelope(scene,wing.fit,rayMeshes,glass);
 const privacy=privacyRooms(scene,scene.getObjectByName('House / shell'),wing.fit,rayMeshes);
 const nav=makeNavigation(wing.fit,boxes),ray=new T.Raycaster(),pointer=new T.Vector2();let layer=0,poseDirty=false;
 cam.position.set(.64,eye,1.08);let yaw=1.31,pitch=-.115,door=0,doorGoal=0,route=[],destination=null,face=null,requestId=0,loadingWing=false;
 const pose=()=>({x:cam.position.x,z:cam.position.z,l:layer});
 const paintPose=()=>{cam.rotation.set(pitch,-yaw,0,'YXZ');cam.updateMatrixWorld();for(const [k,v] of Object.entries({yaw:yaw.toFixed(3),pitch:pitch.toFixed(3),x:cam.position.x.toFixed(2),z:cam.position.z.toFixed(2),y:cam.position.y.toFixed(3),layer:String(layer)}))set(canvas.dataset,k,v);poseDirty=false;dirty()};
 function turnTo(p,tilt=-.085){const dx=p.x-cam.position.x,dz=p.z-cam.position.z;face={yaw:Math.atan2(dx,-dz),pitch:tilt}}
 let lift;
 function labels(){const p=pose(),id=where(p),r=byId[id],out=['pool','garden','terrace'].includes(id),floor=layer%2?(surface(layer,p.x,p.z)>[0,2.1,0,6.075][layer]?Math.ceil(layer/2):Math.floor(layer/2)):layer/2;
  const next=canvas.dataset.zone!==id;set(canvas.dataset,'zone',id);
  if(next||($('location').dataset.inLift==='1'&&!lift?.locked())){const mapRoom=({living:'living',sitting:'living',dining:'dining',guest:'guest',kitchen:'kitchen',pool:'garden',garden:'garden',terrace:'garden',family:'family',cinema:'cinema',salon:'salon',reading:'flex',primary:'primary',wardrobe:'wardrobe',study:'study',mainBath:'bath',landing1:'stairs',landing2:'stairs'})[id];zhBack.searchParams.set('floor',floor);if(mapRoom)zhBack.searchParams.set('room',mapRoom);else zhBack.searchParams.delete('room');$('back').href=zhBack;
   $('location').textContent=r?r[en?'en':'zh']:t('折返樓梯','Main stair');text('route',out?'返客廳 ↗':'去露台 ↗',out?'Living room ↗':'Terrace ↗');$('finishes').hidden=!['living','sitting','dining','terrace'].includes(id);if($('finishes').hidden)panel(false)}
  set($('location').dataset,'inLift',lift?.locked()?'1':'0');
  set($('level-caption'),'textContent','HOUSE 03  /  '+(layer%2?['','G/F — 1/F','','1/F — 2/F'][layer]:['GARDEN LEVEL','FIRST FLOOR','SECOND FLOOR'][floor]));
  wing.activate(floor,id,p);const bathDoor=privacy.near(p),isOpen=bathDoor?bathDoor.goal===1:doorGoal===1;
  set($('door'),'hidden',!bathDoor&&!nearDoor());attr($('door'),'aria-pressed',String(isOpen));
  set($('door'),'textContent',bathDoor?(isOpen?t('閂浴室門','Close bathroom door'):t('開浴室門','Open bathroom door')):(isOpen?t('閂趟門','Close door'):t('開趟門','Open door')));
  set(canvas.dataset,'walk',route.length||loadingWing?'moving':'idle');set(canvas.dataset,'door',door>.995?'open':door<.005?'closed':'sliding');
  if(!lift?.locked())set($('tip'),'textContent',destination?t('步行前往：','Walking to ')+destination[en?'en':'zh']+t(' · 點畫面可停低',' · Tap to stop'):mobile?t('點地面行走 · 拖動轉身','Tap the floor to walk · Drag to look'):t('撳實滑鼠轉視角 · WASD 行走','Hold and move mouse to look · WASD to walk'));
  lift?.ui();
 }
 const marker=new T.Mesh(new T.RingGeometry(.091,.108,48),new T.MeshBasicMaterial({color:0xffebc3,side:T.DoubleSide,depthTest:false,transparent:true,opacity:.85}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
 cancelWalk=()=>{requestId++;route=[];destination=face=null;loadingWing=false;marker.visible=false;labels();dirty()};
 function openDoor(v){if(!v&&layer===0&&Math.abs(cam.position.z+3.035)<.25&&cam.position.x>.76&&cam.position.x<4.30){notice('行開少少先閂門。','Move clear of the doorway first.');return}doorGoal=v?1:0;labels();dirty()}
 function nearDoor(){return layer===0&&Math.hypot(cam.position.x-1.73,cam.position.z+2.85)<2.15}
 function toggleDoor(){const p=pose(),d=privacy.near(p);cancelWalk();if(d){
   if(!privacy.set(d,!d.goal,p))notice('行開門口少少先閂門。','Step clear of the doorway before closing it.');
   labels();dirty();
  }else if(nearDoor())openDoor(!doorGoal)}
 $('door').onclick=toggleDoor;
 const place=p=>{layer=p.l;cam.position.set(p.x,eye+surface(layer,p.x,p.z),p.z);paintPose()};
 function go(p,show=false,guide=false){const found=nav.path(pose(),p,guide||door>.98);if(!found){notice('呢度唔係通道。試吓點旁邊嘅地面。','No clear passage. Try the floor beside it.');return false}route=found;if(show){marker.position.set(p.x,surface(p.l,p.x,p.z)+.062,p.z);marker.visible=true}labels();return true}
 async function visit(r,jump=false){
  if(lift.locked())return;
  cancelWalk();keys.clear();panel(false);const serial=requestId;destination=r;
  if($('cover').hidden&&['garden','pool','terrace'].includes(r.id))plant();
  try{if(!wing.readyAt(r)){loadingWing=true;labels();notice('正在準備樓層傢俬…','Preparing the floor…');await wing.ensureAt(r)}if(serial!==requestId)return;loadingWing=false;clearTimeout(notice.timer);$('notice').textContent='';
   if(jump){place(r);const dx=r.tx-r.x,dz=r.tz-r.z;yaw=Math.atan2(dx,-dz);pitch=r.pitch??-.135;if(r.id==='foyer'&&new URLSearchParams(location.search).get('lift')==='1'){cam.position.set(3.54,eye,6.76);yaw=-Math.PI/2;pitch=-.04}destination=null;paintPose();labels()}
   else if(!go(r,false,true)){destination=null;labels()}else labels();
  }catch(err){if($('cover').hidden){if(serial===requestId){cancelWalk();notice('樓層未能載入；可再選一次。','Floor unavailable. Choose the room to retry.')}}else throw err}
 }
 function warm(p){if(wing.readyAt(p)||loadingWing)return;loadingWing=true;labels();notice('正在準備前面嘅空間…','Preparing the space ahead…');wing.ensureAt(p).catch(()=>{cancelWalk();keys.clear();notice('樓層載入失敗，可在目錄重試。','Floor unavailable. Retry in the index.')}).finally(()=>{loadingWing=false;labels();dirty()})}
 $('route').onclick=()=>visit(byId[['pool','garden','terrace'].includes(where(pose()))?'living':'terrace']);
 directory({en,at:()=>({l:layer,id:where(pose())}),move:visit,stop:()=>{cancelLook();cancelWalk();keys.clear();panel(false)}});
 lift=liftRide({model:liftModel,pose,canvas,reduced,t,notice,prepare:wing.ensure,refresh:()=>{labels();dirty()},halt:()=>{cancelWalk();keys.clear();panel(false)},move:({x,y,z,l})=>{layer=l;cam.position.set(x,y,z);paintPose()},look:angle=>{face={yaw:angle,pitch:0}}});
 const keysAllowed=['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE'];
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelLook();keys.clear();panel(false);cancelWalk();return}if(guide.open||$('index').open||!keysAllowed.includes(e.code)||e.altKey||e.ctrlKey||e.metaKey)return;e.preventDefault();
  if(e.code==='KeyE'){if(!e.repeat&&lift.key())return;if(!e.repeat&&(privacy.near(pose())||nearDoor()))toggleDoor();return}if(lift.locked()&&!['ArrowLeft','ArrowRight'].includes(e.code))return;cancelWalk();keys.add(e.code)});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 function tap(cx,cy){const b=canvas.getBoundingClientRect();pointer.set(2*(cx-b.left)/b.width-1,1-2*(cy-b.top)/b.height);ray.setFromCamera(pointer,cam);
  const visible=o=>{for(let k=o;k;k=k.parent)if(!k.visible)return false;return true};
  const hits=ray.intersectObjects(rayMeshes.filter(visible),false);if(!hits.length)return;const hit=hits[0],o=hit.object;
  if(o.userData.liftAction!==undefined){lift.interact(o.userData.liftAction);return}if(lift.locked())return;
  const d=privacy.near(pose());if(d){for(let n=o;n;n=n.parent)if(n.userData.privacyDoor===d.id){toggleDoor();return}}
  if(owner(o,/^House_Linen_/)){panel(true);return}
  if(nearDoor()&&owner(o,/^SM_GDN_DoorLeaf/)){openDoor(!doorGoal);return}
  const {x,y,z}=hit.point,normal=hit.face?.normal.clone().transformDirection(o.matrixWorld);if(!normal||Math.abs(normal.y)<.62)return;
  for(const l of [layer,...[0,1,2,3,4].filter(n=>n!==layer)]){
   if(Math.abs(y-surface(l,x,z))>(l%2?.215:.145)||!nav.inside(l,x,z,door>.98))continue;
   panel(false);go({x,z,l},true);return
  }
 }
 const look=bindLook(canvas,{stop:cancelWalk,tap,turn(dx,dy,fps){
  // The mouse-look direction follows either mouse button. The touch gesture
  // instead moves the scene with the hand or pointer.
  yaw+=(fps?1:-1)*dx*.0042;
  pitch=clamp(pitch+(fps?-1:1)*dy*.0037,-1.18,1.12);
  poseDirty=true
 }});
 cancelLook=look.cancel;
 function tick(ms){requestAnimationFrame(tick);const dt=Math.min(.1,(ms-(tick.last??ms))/1000);tick.last=ms;if(document.hidden||!$('cover').hidden)return;
  const started=performance.now(),open=door>.98;let changed=false;
  if(lift.tick(dt))changed=true;
  if(privacy.tick(dt,pose(),reduced,!!destination)){if(!mobile||!privacy.moving())r.shadowMap.needsUpdate=true;changed=true}
  if(door!==doorGoal){door+=Math.sign(doorGoal-door)*Math.min(Math.abs(doorGoal-door),dt*(reduced?7:1.35));const eased=door*door*(3-2*door);for(const [o,x] of doors)o.position.x=x+1.58*eased;if(!mobile||door===doorGoal)r.shadowMap.needsUpdate=true;changed=true}
  if(keys.size){const h=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
   yaw+=(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')))*dt*1.45;
   const k=dt*1.65/Math.max(1,Math.hypot(h,f)),dx=(Math.sin(yaw)*f+Math.cos(yaw)*h)*k,dz=(-Math.cos(yaw)*f+Math.sin(yaw)*h)*k;
   let p=pose();for(const [sx,sz] of [[dx,0],[0,dz]]){const next=nav.manual(p,p.x+sx,p.z+sz,open);if(!privacy.obstruction(p,next))p=next}
   if(!lift.locked()){if(!wing.readyAt(p)){warm(p);paintPose()}else place(p)}else paintPose();changed=true}
  if(route.length){
   const p=route[0],a=pose(),dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz);
   const step=Math.min(d,dt*(destination?2.02:1.64)),b=d>step?{x:a.x+dx/d*step,z:a.z+dz/d*step,l:p.l}:p;
   const gate=privacy.obstruction(a,b);
   if(!wing.readyAt(b)){warm(b)}else if(gate){
    if(destination){if(!gate.goal)privacy.set(gate,true,a,true);turnTo({x:gate.x,z:(gate.lo+gate.hi)/2})}
    else{cancelWalk();notice('開浴室門先可以行入去。','Open the bathroom door to pass.')}
   }else if(!open&&p.l===0&&!nav.inside(0,b.x,b.z,false)&&destination&&nearDoor()){if(!doorGoal)openDoor(true)}
   else{if(destination&&d>.15)turnTo(p,p.l%2?(surface(p.l,p.x,p.z)<surface(a.l,a.x,a.z)?-.22:-.025):-.085);place(b);if(d<=step)route.shift();if(!route.length&&destination){turnTo({x:destination.tx,z:destination.tz},destination.pitch??-.12);destination=null}changed=true}
  }
  if(face){const diff=T.MathUtils.euclideanModulo(face.yaw-yaw+Math.PI,TAU)-Math.PI;const mix=reduced?1:1-Math.exp(-dt*5);
   yaw+=diff*mix;pitch+= (face.pitch-pitch)*mix;if(Math.abs(diff)<.005&&Math.abs(face.pitch-pitch)<.005)face=null;paintPose();changed=true}
  if(!route.length&&!destination&&marker.visible){marker.visible=false;changed=true}
  if(poseDirty)paintPose();
  if(changed){labels();dirty()}if(quality.mode!=='smooth'&&waterFrame(ms,canvas.dataset.zone))dirty();
  if(redraw){redraw=false;r.render(scene,cam);resolution.observe(ms,performance.now()-started,changed||look.moving)}
 }
 paintPose();labels();
 if(startRoom&&!wing.readyAt(startRoom)){text('load','準備你揀嘅房間…','Preparing the room you selected…');progress.removeAttribute('value')}
 if(startRoom)await visit(startRoom,true);
 if(['garden','pool','terrace'].includes(startRoom?.id))await plant();
 resolution.fit();progress.value=94;
 await new Promise(resolve=>requestAnimationFrame(resolve));
 redraw=false;r.render(scene,cam);$('cover').hidden=true;$('tools').hidden=false;canvas.dataset.ready='true';
 requestAnimationFrame(tick);
 const idle=(fn)=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:1200}):setTimeout(fn,0);
 // Let the input-ready frame paint, and don't begin background work during the first swipe.
 setTimeout(function prepareSurroundings(){
  if(document.hidden||look.held||keys.size||route.length){setTimeout(prepareSurroundings,450);return}
  idle(()=>{plant();wing.preloadGround().catch(()=>{})})
 },1300);
}
start().catch(err=>{console.error('House showroom:',err);fallback()});
