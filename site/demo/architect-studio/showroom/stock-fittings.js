import * as T from 'three';

// Catalogue assets are oriented locally before placement. Never rotate a clone
// of an already installed chair: that double-applies the living-room transform.
const lists={
 house03:'coffee-main coffee-side coffee-round coffee-family place-setting light-floor sputnik chaise bench table-small',
 ground:'bed-guest nightstand light-desk fridge oven hob pan knife board sink bowl spice knife-block base-cabinet wall-cabinet book coffee-round',
 first:'cinema audio trench shirt trousers salon-bag scent bench chandelier vanity mixer flush toilet-ceramic coffee-family table-library light-floor light-desk',
 second:'bed-primary nightstand sputnik light-desk bench trousers trench shirt salon-bag vanity mixer flush toilet-ceramic tub'
};
const rad=T.MathUtils.degToRad,box=o=>{o.updateWorldMatrix(true,true);return new T.Box3().setFromObject(o,true)},vec=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const ids=new Set(Object.values(lists).flatMap(s=>s.split(' ')));
export function prepareStock(loader){
 const sources=new Map(),jobs=new Map();
 function load(id){if(!ids.has(id))throw Error('Unknown furniture '+id);
  if(!jobs.has(id))jobs.set(id,loader.loadAsync(new URL('./assets/fit-'+id+'.glb',import.meta.url).href).then(({scene:s})=>{
   s.traverse(o=>{if(!o.isMesh)return;const mat=o.material,n=mat.name;o.castShadow=o.receiveShadow=true;
    if(id==='bench'&&/textile/i.test(n))mat.color.set('#9c826a');
    if(id==='vanity'&&/wine.?wood/i.test(n))mat.color.set('#644637');
    if(id==='vanity'&&/metal|alum/i.test(n)){mat.color.set('#9d8a71');mat.metalness=.68;mat.roughness=.27}
    if(id==='sputnik'&&!/emiss|lamp|bulb|glass/i.test(n)&&!mat.map){mat.color.set('#ae926b')}
    if(id==='chaise'&&/cloth|fabric|textile|blue/i.test(n))mat.color.set('#897f6c');
    if(id==='toilet-ceramic'&&n!=='Chrome'){mat.map=null;mat.vertexColors=false;mat.color.set(n==='Porcelain'?'#ece8df':'#e2dfd5');mat.metalness=0;mat.roughness=.24}
    if(id==='coffee-main'&&'transmission' in mat){mat.transmission=0;mat.metalness=.58;mat.roughness=.36;mat.color.set('#77644e');mat.transparent=false;mat.opacity=1}
    if(id==='coffee-main'&&n==='White Marble'){mat.metalness=0;mat.roughness=.35}
    if(id==='coffee-round'&&/glass/i.test(n)){mat.color.set('#716a5b');mat.metalness=.32;mat.roughness=.35}
    if(id==='light-floor'&&/squares|plastic|wooden_plate/.test(n)){mat.map=null;mat.color.set(/squares/.test(n)?'#d2c4ae':'#705944');mat.roughness=.67;mat.metalness=.09}
    if(id==='trench'){mat.color.set('#a48565');mat.roughness=.88;mat.metalness=0}
    if(id==='shirt'&&/1513820/.test(n)){mat.color.set('#68798a');mat.roughness=.88}
    if(['flush','mixer'].includes(id)&&n==='Chrome'){mat.color.set('#c6b7a1');mat.metalness=.84;mat.roughness=.24}
    if(id==='tub'&&/bathtub_baked/i.test(n)){mat.color.set('#f5efe4');mat.roughness=.25;mat.metalness=0;mat.metalnessMap=null;mat.roughnessMap=null}
    if(['shirt','trench','trousers'].includes(id))mat.side=T.DoubleSide;
   });
   const b=box(s),c=b.getCenter(vec()),size=b.getSize(vec());if(Math.min(size.x,size.y,size.z)<1e-8 && id!=='hob')throw Error('Empty catalogue object '+id);
   const body=new T.Group();body.add(s);s.position.sub(vec(c.x,b.min.y,c.z));body.userData.size=size.toArray();sources.set(id,body);
  }).catch(e=>{jobs.delete(id);throw e}));return jobs.get(id)
 }
 const ready=f=>Promise.all((lists[f]||'').split(' ').filter(Boolean).map(load));
 // x/z centre, finished floor or mounting surface y. Scale in the author's
 // axes, then rotate; a turned portrait of a chair is never squashed to an AABB.
 function put(g,id,name,x,y,z,w,h,d,yaw=0,mode='fitted'){
  const src=sources.get(id);if(!src)throw Error('Catalogue model not ready: '+id);
  const o=src.clone();o.name=T.PropertyBinding.sanitizeNodeName(name);o.userData.stock=id;const [a,b,c]=src.userData.size,sw=w/a,sh=h/b,sd=d/Math.max(c,1e-6);
  if(mode==='natural')o.scale.setScalar(Math.min(sw,sh,sd));else o.scale.set(sw,sh,sd);
  o.rotation.y=yaw;o.position.set(x,y,z);g.add(o);return o
 }
 function atBounds(g,id,n,lo,hi,yaw=0,mode='fitted',swap=false){const [w,h,d]=hi.map((v,i)=>v-lo[i]);return put(g,id,n,(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2,swap?d:w,h,swap?w:d,yaw,mode)}
 function exchange(g,n,id,orientation=0,swap=false){const old=g.getObjectByName(T.PropertyBinding.sanitizeNodeName(n));if(!old)throw Error('Missing fitted slot '+n);const b=box(old);old.removeFromParent();return atBounds(g,id,n,b.min.toArray(),b.max.toArray(),orientation,'fitted',swap)}
 function rail(g,n,style,x,top,z,yaw,w,h,d){const src=sources.get(style);const [a,b,c]=src.userData.size;const sc=Math.min(w/a,h/b,d/c);return put(g,style,n,x,top-sc*b,z,w,h,d,yaw,'natural')}
 function wc(g,scene,name,x,z,level,heading){const shell=scene.getObjectByName(level===4.2?'SM_UP_FirstFloor':'SM_UP_SecondFloor');const rear=vec(-Math.sin(heading),0,-Math.cos(heading)),origin=vec(x,level+.88,z);
  const ray=new T.Raycaster(origin,rear,.03,.82);shell?.updateWorldMatrix(true,true);const hit=shell&&ray.intersectObject(shell,true)[0];
  if(!hit)throw Error('No supporting wall behind '+name);const depth=.545,centre=hit.point.clone().addScaledVector(rear,-depth/2-.006);
  const o=put(g,'toilet-ceramic',name,centre.x,level+.002,centre.z,.369,.859,depth,heading);
  const h=level+1.02;
  // Locate the visible wall face at the plate's actual elevation. Its rear
  // face is inset 0.5 mm, so no viewing angle can show daylight behind it.
  ray.ray.origin.y=h;const mount=ray.intersectObject(shell,true)[0];if(!mount)throw Error('Missing flush plate support '+name);
  const pt=mount.point.clone().addScaledVector(rear,-(.014/2-.0005));
  const plate=put(g,'flush',name+' flush plate',pt.x,h-.197/2,pt.z,.155,.197,.014,heading);
  plate.userData.wall=mount.point.toArray();plate.userData.normal=rear.clone().negate().toArray();o.userData.backWallDistance=.006;return o
 }
 function vanity(g,name,x,z,floor,yaw){
  const body=put(g,'vanity',name,x,floor+.002,z,.84,.882,.448,yaw);
  const base=vec(x-.17*Math.sin(yaw),floor+.884,z-.17*Math.cos(yaw)),rot=yaw-Math.PI/2;
  const tap=put(g,'mixer',name+' deck mixer',base.x,base.y,base.z,.205,.344,.096,rot);
  // Use the bottom ring of the manufacturer's casting as the installation
  // point; the centre of its bounding box lies halfway along the spout.
  tap.updateWorldMatrix(true,true);const ring=new T.Box3(),pt=vec();
  tap.traverse(o=>{if(!o.isMesh)return;const pos=o.geometry.attributes.position;
   for(let i=0;i<pos.count;i++){pt.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(pt.y<=base.y+.004)ring.expandByPoint(pt)}});
  if(!ring.isEmpty()){ring.getCenter(pt);tap.position.x+=base.x-pt.x;tap.position.z+=base.z-pt.z}
  tap.userData.mount=base.toArray();return body
 }
 function seats(g,n,lo,hi,scene){const x=(lo[0]+hi[0])/2,z=(lo[2]+hi[2])/2,screen=scene.getObjectByName('SM_SAL_Projection')||g.getObjectByName('SM_SAL_Projection');const c=box(screen).getCenter(vec()),heading=Math.atan2(c.x-x,c.z-z),o=put(g,'cinema',n,x,lo[1],z,.86,.88,.86,heading,'natural');o.userData.aimPoint=c.toArray();return o}
 return {ready,put,atBounds,exchange,rail,wc,vanity,seats};
}
