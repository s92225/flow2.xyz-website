import * as T from 'three';
import {floors} from './navigation.js';

// The native fit-out has cased openings but no operable leaves. All four
// bathroom entries run parallel to Z. Dimensions are the shell's jambs (m).
const openings=[
  ['westBath',2,-.36,4.05,5.04],['eastBath',2,10.87,4.05,5.04],
  ['mainBath',4,10.76,.52,1.58],['bath2',4,-1.08,4.11,5.12]
];
// The west WC needed a landing-side return. The primary corridor is now a
// continuous wall in the shell itself (no duplicate infill or ghost casing).
const infills=[
  ['West bathroom landing return',1.815,1.945,3.395,5.395,4.2,7.58]
];
const smooth=t=>t*t*(3-2*t);
export function privacyRooms(scene,shell,fit,rayMeshes){
  fit.barriers.push(...infills);
  const materials=new Map();shell.traverse(o=>{if(o.isMesh)materials.set(o.material.name,o.material)});
  const standard=(c,r,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const wood=materials.get('UP_WalnutJoinery')||standard(0x614735,.54);
  const wall=materials.get('UP_PalePlaster')||standard(0xd8cfc2,.78);
  const metal=standard(0x987b52,.35,.68),recess=standard(0x342a24,.52);
  const root=new T.Group(),box=new T.BoxGeometry(1,1,1);root.name='Upper bathroom enclosures';scene.add(root);
  function slab(group,name,x,y,z,w,h,d,mat){
    const mesh=new T.Mesh(box,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);rayMeshes.push(mesh);return mesh;
  }
  for(const [name,a,b,c,d,y,h] of infills)slab(root,name,(a+b)/2,(y+h)/2,(c+d)/2,b-a,h-y,d-c,wall);
  const doors=openings.map(([id,l,x,lo,hi])=>{
    const frame=new T.Group();frame.position.set(x,floors[l/2],lo);frame.name='Privacy door / '+id;root.add(frame);
    const width=hi-lo,half=width/2;
    // Two staggered opaque leaves telescope into the short solid return,
    // instead of swinging into a toilet, vanity or the dressing-room aisle.
    const items=[0,1].map(i=>{
      const panel=new T.Group();panel.userData.privacyDoor=id;frame.add(panel);
      const nx=i===0?-.021:.021, a=i?half-.007:-.007,b=i?width-.024:half+.007;
      slab(panel,'Flush walnut leaf',nx,1.205,(a+b)/2,.038,2.386,b-a,wood);
      if(i===1){for(const side of [-1,1]){
        slab(panel,'Bronze recessed pull',nx+side*.020,1.02,width-.085,.005,.163,.045,metal);
        slab(panel,'Finger recess',nx+side*.023,1.02,width-.085,.003,.138,.030,recess);
      }}
      return panel;
    });
    // Jambs belong to the shell. Keep the track below its lintel and clear
    // of the moving leaves; no second casing on the same faces.
    slab(frame,'Recessed head track',0,2.416,half,.096,.018,width-.044,recess);
    return {id,l,x,lo,hi,width,items,t:0,goal:0,guidedFrom:0};
  });
  root.updateMatrixWorld(true);
  const inThroat=(d,p)=>d.l===p.l&&Math.abs(p.x-d.x)<.22&&p.z>d.lo-.16&&p.z<d.hi+.16;
  function near(p){return doors.find(d=>d.l===p.l&&Math.abs(p.x-d.x)<1.45&&p.z>d.lo-.27&&p.z<d.hi+.27)}
  // Test the swept segment, including the body's clearance. Not part of the
  // route cache: a directory route can plan through a door, never walk through it.
  function obstruction(a,b){
    if(a.l!==b.l)return null;
    const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.055));
    for(let i=1;i<=n;i++){
      const p={l:a.l,x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n};
      const d=doors.find(d=>d.t<1&&inThroat(d,p));if(d)return d;
    }return null;
  }
  function set(d,open,p,guide=false){
    if(!open&&inThroat(d,p))return false;
    d.goal=open?1:0;d.guidedFrom=guide?Math.sign(p.x-d.x):0;return true;
  }
  function tick(dt,p,reduced,guiding){
    let changed=false;
    for(const d of doors){
      if(d.guidedFrom&&(!guiding||p.l!==d.l||Math.sign(p.x-d.x)!==d.guidedFrom)&&!inThroat(d,p))set(d,false,p);
      if(d.t===d.goal)continue;
      d.t+=Math.sign(d.goal-d.t)*Math.min(Math.abs(d.goal-d.t),reduced?1:dt*1.65);
      const slide=smooth(d.t)*(d.width/2+.035);
      d.items.forEach((panel,i)=>{panel.position.z=-(i+1)*slide;panel.updateWorldMatrix(true,true)});
      changed=true;
    }return changed;
  }
  return {near,obstruction,set,tick};
}
