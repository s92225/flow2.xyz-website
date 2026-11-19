import * as T from 'three';
import {Reflector} from './vendor/mirror.js';
// The source bathroom collection is authored with -Z as "up". The UE fitting
// inherited its display turntable axes. Correct the fitted bounds and wall mount.
const bathFit={
 SM_UPF_HerVanity:[14.45,-.76,7.95,1,Math.PI/2,-1],SM_UPF_HisVanity:[-3.20,5.12,7.95,1,Math.PI,1],
 SM_UPF_Suite2Vanity:[1.30,5.12,4.2,1,Math.PI,1],SM_UPF_Suite3Vanity:[8.64,5.12,4.2,1,Math.PI,1],
 SM_UPF_Suite2WC:[.32,5.03,4.2,0,Math.PI,1],SM_UPF_Suite3WC:[10.22,5.03,4.2,0,Math.PI,1],
 SM_UPF_HerWC:[11.16,-.37,7.95,0,Math.PI/2,1],SM_UPF_HisWC:[-3.63,3.73,7.95,0,0,1]};
const bounds=o=>{o.updateWorldMatrix(true,true);return new T.Box3().setFromObject(o,true)};
const mount=(group,o,x,z,bottom,w,h,d)=>{const b=bounds(o),s=b.getSize(new T.Vector3());o.scale.multiply(new T.Vector3(w/s.x,h/s.y,d/s.z));const q=bounds(o),c=q.getCenter(new T.Vector3());o.position.add(new T.Vector3(x-c.x,bottom-q.min.y,z-c.z));group.add(o);o.updateWorldMatrix(true,true)};
function cloneAt(group,src,name,x,z,y,yaw,width,height,depth){if(!src)return;const g=new T.Group();g.name=name;const a=src.clone();g.add(a);g.rotation.y=yaw;g.updateMatrixWorld(true);if(width===null){const b=bounds(g),c=b.getCenter(new T.Vector3());g.position.set(x-c.x,y-b.min.y,z-c.z);group.add(g)}else{
 const b=bounds(g),s=b.getSize(new T.Vector3());const wrap=new T.Group();wrap.add(g);mount(group,wrap,x,z,y,width,height,depth)}return g}
function target(f){const [x,z,y,v,yaw]=f;const alongX=Math.abs(Math.sin(yaw))<.5;return [x,z,y+(v?.16:.13),alongX?(v?.85:.39):(v?.44:.60),v?1.55:.79,alongX?(v?.44:.60):(v?.85:.39)]}
export function correctedFit(fit){for(const b of fit.barriers){const f=bathFit[b[0]];if(f){const [x,z,y,w,h,d]=target(f);b.splice(1,6,x-w/2,x+w/2,z-d/2,z+d/2,y,y+h)}}
 fit.barriers.push(['Entrance console',.23,.61,3.47,4.71,0,.86],['Garden lounge L',-10.5,-9.6,-3.5,-2.5,-.09,.82],['Garden lounge R',-12.45,-11.55,-4.10,-3.10,-.09,.82]);for(const [x,z,y,dx] of [[-3.53,4.13,4.2,-.32],[13.82,4.12,4.2,.32],[13.77,4.1,7.95,.32]])fit.barriers.push(['Garment stand',x+dx-.20,x+dx+.20,z-.55,z+.55,y,y+1.82]);
 fit.barriers.push(['Garden tea table',-11.33,-10.67,-3.68,-3.04,-.06,.33]);return fit}
const std=(color,rough=.7,metal=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const brass=std(0xa78550,.36,.65),frame=std(0x544739),paper=std(0xcdc8b7),bookM=[0x535747,0xbbab92,0x5b4740,0xb0845b].map(c=>std(c)),geo=new T.BoxGeometry(1,1,1);let images;
function slab(g,x,y,z,w,h,d,m){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=o.receiveShadow=true;g.add(o);return o}
export function dressWing(key,g,scene,render,materials){
 if(key==='ground'){
  for(const [n,dy] of [['SM_INT_FoyerConsole',0],['SM_INT_FoyerCeramic',0]]){const o=g.getObjectByName(n);if(!o)continue;o.position.x-=5.21;o.position.z-=.41}
  if(!images)images=['house03-plan-sheet.svg','study-window-section.svg'].map(n=>{const tex=new T.TextureLoader().load(new URL('../media/'+n,import.meta.url).href,render);tex.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tex,toneMapped:false})});
  function print(x,y,z,w,h,angle,i){const board=new T.Group();g.add(board);board.position.set(x,y,z);board.rotation.y=angle;
   slab(board,0,0,0,w+.045,h+.045,.033,frame);slab(board,0,0,.019,w,h,.009,paper);
   const im=new T.Mesh(new T.PlaneGeometry(w*.87,h*.85),images[i]);im.position.z=.025;board.add(im);
  }
  print(-2.91,1.64,3.075,1.26,.90,0,0);print(-4.13,1.64,4.04,.83,.67,Math.PI/2,1);print(.166,1.70,4.17,.97,.72,Math.PI/2,0);
  cloneAt(g,scene.getObjectByName('SM_KG_GuestBedsideLamp0'),'Study brass task lamp',-3.40,4.36,.759,.13,.32,.47,.32);
  for(let i=0;i<3;i++)slab(g,-2.45+i*.013,.776+i*.032,4.57-i*.014,.275-i*.014,.029,.20-i*.013,bookM[i]);
  const stool=scene.getObjectByName('SM_EXT_LoungeChair_0');cloneAt(g,stool,'West garden lounge 1',-10.05,-3,-.061,-.6,.89,.79,.94);
  cloneAt(g,stool,'West garden lounge 2',-12,-3.60,-.061,2.5,.89,.79,.94);
  cloneAt(g,scene.getObjectByName('SM_EXT_SittingTeaTable'),'Outdoor tea',-11.00,-3.36,-.059,.3,.65,.37,.65)
 }
 // Give the narrow dressing runs a rail of genuinely shaped garments rather than an empty box.
 if(key==='second'||key==='first'){
  const base=key==='first'?4.2:7.95;const alcoves=key==='first'?[[-3.53,4.13],[13.82,4.12]]:[[13.77,4.1]];
  const wood=std(0x6d5240,.59);
  const hangers=[];
  g.traverse(o=>{if(/^SM_SAL_F_Coat|^Fit_Dressing__hanging_coat/.test(o.name))hangers.push(o)});
  for(const coat of hangers){
   const b=bounds(coat),c=b.getCenter(new T.Vector3()),top=b.max.y;
   // Existing rod pins end at collar height. Carry the load through the neck
   // onto a wooden shoulder piece rather than ending the pin in empty space.
   slab(g,c.x,top-.023,c.z,.010,.080,.010,brass);
   for(const side of [-1,1]){
    const arm=slab(g,c.x+side*.071,top-.066,c.z,.16,.021,.026,wood);
    arm.rotation.z=-side*.30;
   }
  }
  for(const [x,z] of alcoves){const hor=key==='first'&&x<0?1:-1;const xx=x-hor*.32;
   const rail=new T.Mesh(new T.CylinderGeometry(.014,.014,1.08,14),brass);rail.rotation.x=Math.PI/2;rail.position.set(xx,base+1.78,z);g.add(rail);
   for(const dz of [-.53,.53]){slab(g,xx,base+.92,z+dz,.028,1.82,.028,brass)}slab(g,xx,base+.15,z,.40,.04,1.12,wood);
   const coat=scene.getObjectByName('SM_SAL_F_Coat1_1_0')||scene.getObjectByName('Fit_Dressing__hanging_coat_00');
   if(coat)for(let j=0;j<3;j++)cloneAt(g,coat,'Hanging jacket',xx,z-.24+j*.22,base+.62,.24,.32,1.14,.16)
  }
 }
 for(const [k,v] of Object.entries(bathFit)){
  const f=key==='first'?4.2:key==='second'?7.95:-10;if(v[2]!==f||!v[3])continue;
  const [x,z]=v,y=f,along=Math.abs(Math.sin(v[4]))<.5;
  // Full-height stone back panel behind the wall-hung basin, with a brushed border.
  const bx=along?x:14.698,bz=along?5.368:z;
  slab(g,bx,y+1.27,bz,along?1.02:.063,2.46,along?.06:1.0,materials.stone).name='Wall-bedded vanity panel';
  const mirrorFrame=new T.Group();mirrorFrame.position.set(bx-(along?0:.032),y+1.64,bz-(along?.031:0));mirrorFrame.rotation.y=along?Math.PI:-Math.PI/2;g.add(mirrorFrame);
  const disk=new T.Mesh(new T.CylinderGeometry(1,1,.018,64),brass);disk.rotation.x=Math.PI/2;disk.scale.set(.308,1,.428);disk.position.z=.008;mirrorFrame.add(disk);
  const mirror=new Reflector(new T.CircleGeometry(1,64),{textureWidth:320,textureHeight:320,color:0xccc8c0,clipBias:.003,multisample:0});mirror.name='Working vanity mirror';mirror.scale.set(.298,.418,1);mirror.position.z=.005;
  mirror.position.z=.018;mirror.userData.mirrorRoom={SM_UPF_HerVanity:'mainBath',SM_UPF_HisVanity:'bath2',SM_UPF_Suite2Vanity:'westBath',SM_UPF_Suite3Vanity:'eastBath'}[k];mirror.visible=false;mirrorFrame.add(mirror);
  slab(mirrorFrame,0,.59,.019,.38,.031,.040,brass).name='Surface-mounted vanity light';
 }
}
