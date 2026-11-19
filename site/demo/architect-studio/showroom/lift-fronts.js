import * as T from 'three';
import {floors} from './navigation.js';
export const sill={x:1.86,z:6.73},arrival={x:2.44,z:sill.z},seat={x:.64,z:sill.z};
export const floorName=i=>['G/F','1/F','2/F'][i];

// Local Z points towards the lobby. The cab and the three landing frames
// share the same sill datum, but have separate telescopic leaves.
export function fitLiftFronts(scene,fit,rayMeshes){
 const unit=new T.BoxGeometry(1,1,1),m=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const metal=m(0xb9b0a1,.37,.53),bronze=m(0x857251,.34,.62),joint=m(0x3f3933,.66,.18),stone=m(0xbdb1a0,.7),oak=m(0x795c47,.56),lining=m(0xc8b99f,.65),opal=m(0xffe3b6,.45);opal.emissive.setHex(0xffd9ac);opal.emissiveIntensity=.9;
 const root=new T.Group();root.name='Residential lift';root.position.set(sill.x,0,sill.z);root.rotation.y=Math.PI/2;scene.add(root);
 function box(g,n,x,y,z,w,h,d,mat){
  const o=new T.Mesh(unit,mat);o.name=n;o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);o.receiveShadow=true;rayMeshes.push(o);return o
 }
 const textures=new Map();
 function sign(g,n,label,x,y,z,w,h,action){
  if(!textures.has(label)){const c=document.createElement('canvas');c.width=256;c.height=128;const p=c.getContext('2d');p.fillStyle='#423a31';p.fillRect(0,0,256,128);p.fillStyle='#fff1ca';p.font='500 73px Arial';p.textBaseline='middle';p.textAlign='center';p.fillText(label,128,70);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;textures.set(label,new T.MeshBasicMaterial({map:t,toneMapped:false}))}
  const a=new T.Mesh(new T.PlaneGeometry(w,h),textures.get(label));a.name=n;a.position.set(x,y,z);g.add(a);rayMeshes.push(a);if(action!==undefined)a.userData.liftAction=action;return a
 }
 function doors(g,z){
  const pieces=[];for(const s of [-1,1])for(let k=0;k<3;k++){const w=.124;const o=box(g,'Telescopic door leaf',s*(k+.5)*w,1.056,z-.010*k,w-.001,2.106,.009,metal);pieces.push([o,o.position.x,s*(3-k)*w])}return pieces;
 }
 const shellTop=11.14;
 box(root,'Shaft back lining',0,shellTop/2,-1.635,1.16,shellTop,.075,stone);
 for(const s of [-1,1])box(root,'Lift shaft side wall',s*.543,shellTop/2,-.797,.072,shellTop,1.686,stone);
 const landings=floors.map((y,i)=>{
  const g=new T.Group();g.name='Landing portal '+floorName(i);g.position.y=y;root.add(g);
  for(const s of [-1,1]){box(g,'Stone portal pier',s*.471,1.1,.008,.197,2.2,.090,stone);box(g,'Bronze door reveal',s*.379,1.071,.052,.017,2.142,.034,bronze)}
  const top=(floors[i+1]??shellTop)-y;
  box(g,'Shaft spandrel',0,(top+2.15)/2,.016,1.157,top-2.15,.079,stone);
  box(g,'Door head',0,2.137,.046,.77,.037,.042,bronze);
  box(g,'Level threshold',0,.006,.028,.754,.012,.114,metal);
  sign(g,'Floor plaque '+floorName(i),floorName(i),0,2.37,.058,.265,.132);
  const call=box(g,'Landing call button',.463,1.04,.061,.090,.162,.015,bronze);call.userData.liftAction='call';
  sign(g,'Call lift','<>',.463,1.045,.07,.064,.035,'call');
  fit.barriers.push(['Enclosed lift shaft '+floorName(i),.13,1.92,6.18,7.39,y,y+top-.01]);
  return doors(g,.002)
 });
 const cab=new T.Group();cab.name='Moving passenger cabin';root.add(cab);
 box(cab,'Cab floor',0,-.027,-.83,.986,.054,1.542,stone);
 box(cab,'Cab ceiling',0,2.185,-.82,.985,.052,1.54,lining);
 box(cab,'Cab walnut back wall',0,1.081,-1.579,.99,2.162,.042,oak);
 for(const s of [-1,1]){
  box(cab,'Cab side lining',s*.484,1.081,-.82,.025,2.162,1.532,lining);
  box(cab,'Cab cove',s*.432,2.153,-.82,.028,.009,1.40,opal);
  box(cab,'Cab door pocket',s*.435,1.061,-.106,.121,2.13,.053,metal)
 }
 box(cab,'Cab fascia',0,2.14,-.10,.98,.06,.072,metal);
 box(cab,'Rear wall grip',0,.935,-1.510,.84,.03,.033,bronze);
 for(const s of [-1,1])box(cab,'Grip support',s*.376,.935,-1.535,.02,.026,.043,bronze);
 const panel=new T.Group();panel.position.set(-.466,0,-.46);panel.rotation.y=Math.PI/2;cab.add(panel);
 box(panel,'Cab operating panel',0,1.24,0,.136,.53,.008,bronze);
 for(let i=0;i<3;i++)sign(panel,'Car button '+floorName(i),floorName(i),0,1.105+i*.12,.006,.092,.055,i);
 const inner=doors(cab,-.07),set=(arr,t)=>{for(const [o,x,delta] of arr)o.position.x=x+delta*t};
 function update(height,dock,opening){cab.position.y=height;set(inner,opening);landings.forEach((arr,i)=>set(arr,i===dock?opening:0));root.updateMatrixWorld(true)}
 update(0,0,0);return {update}
}

