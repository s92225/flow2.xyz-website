import * as T from 'three';
import {prepareStock} from './stock-fittings.js';
const url=n=>new URL('./assets/'+n,import.meta.url).href;
const vec=()=>new T.Vector3(),PI=Math.PI;
const allTextile=new T.MeshStandardMaterial({color:0xd7ccb9,roughness:.99});
function rug(g,n,lo,hi){const o=new T.Mesh(new T.BoxGeometry(hi[0]-lo[0],Math.max(.004,hi[1]-lo[1]),hi[2]-lo[2]),allTextile.clone());o.name=T.PropertyBinding.sanitizeNodeName(n);o.position.set((hi[0]+lo[0])/2,(hi[1]+lo[1])/2,(hi[2]+lo[2])/2);g.add(o)}
function retained(g,n,src,lo,hi,rot){const p=new T.Group();p.add(src.clone());p.rotation.y=rot;p.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(p,true),c=b.getCenter(vec()),s=b.getSize(vec()),q=new T.Group();q.name=T.PropertyBinding.sanitizeNodeName(n);q.add(p);q.scale.set((hi[0]-lo[0])/s.x,(hi[1]-lo[1])/s.y,(hi[2]-lo[2])/s.z);q.position.set((lo[0]+hi[0])/2-c.x*q.scale.x,lo[1]-b.min.y*q.scale.y,(lo[2]+hi[2])/2-c.z*q.scale.z);g.add(q)}
export async function makeKit(loader){
 const stock=prepareStock(loader);
 const [layout,sofa,pavilion,dining,chair]=await Promise.all([fetch(url('public-layout.json')).then(r=>{if(!r.ok)throw Error('Public fitting layout');return r.json()}),...['atelier','pavilion','table','chair'].map(n=>loader.loadAsync(url(n+'.glb')).then(v=>v.scene)),stock.ready('house03')]);
 sofa.traverse(o=>{if(o.isMesh&&/fabric/i.test(o.material.name)){o.material.color.set(0xe6d8c2);o.material.roughness=.85}});
 function place(key,g,scene){
  const {put,rail,exchange,atBounds}=stock;
  if(key==='house03'){
   exchange(g,'SM_CUR_StoneOakCoffee','coffee-main',PI/2,true);exchange(g,'SM_EXT_SittingTeaTable','coffee-round');
   for(const x of [3.72,12.32])put(g,'sputnik','Catalogue suspension',x,2.86,-.03,1.34,.94,1.14);
   for(const [x,z] of [[16.05,-2.91],[17.31,-3.54]])put(g,'chaise','Poolside lounger',x,-.026,z,.70,.77,1.90,.51);
   put(g,'table-small','Poolside occasional table',16.84,-.026,-3.01,.38,.32,.38);
   put(g,'bench','Garden bench',-12.01,-.035,-1.88,1.96,.69,.60,.36);
  }
  if(key==='first'){exchange(g,'SM_UPF_FamilyTable','coffee-family');exchange(g,'Fit Library / round tea table','table-library')}
  for(const [n,lo,hi] of layout[key]||[]){const [x,y,z]=lo.map((a,i)=>(a+hi[i])/2),w=hi[0]-lo[0],d=hi[2]-lo[2],floor=key==='first'?4.2:7.95;
   const use=(id,...args)=>atBounds(g,id,n,lo,hi,...args);
   if(/House_Linen|linen three-seat/.test(n))retained(g,n,sofa,lo,hi,/Gallery/.test(n)?PI:0);
   else if(/MidnightVelvet|CinemaLoveseat/.test(n))retained(g,n,pavilion,lo,hi,/Midnight/.test(n)?-PI/2:PI);
   else if(/FynnChair/.test(n))retained(g,n,chair,lo,hi,[0,0,PI/2,PI,PI,-PI/2][+n.slice(-1)]);
   else if(/LinhaTableSetting/.test(n)){for(const [dx,dz,a] of [[-.56,-.34,PI],[.56,-.34,PI],[-.56,.34,0],[.56,.34,0],[-1.07,0,-PI/2],[1.07,0,PI/2]])put(g,'place-setting','Porcelain and stemware',x+dx,lo[1],dz,.39,.195,.34,a)}
   else if(/LinhaTable/.test(n))retained(g,n,dining,lo,hi,0);
   else if(/rug|runner/i.test(n))rug(g,n,lo,hi);
   else if(/GuestKingBed/.test(n))put(g,'bed-guest',n,x,lo[1],z,2.16,.64,1.93,PI/2);
   else if(/PrimaryEliana/.test(n))put(g,'bed-primary',n,x,lo[1],z,2.89,.89,2.15);
   else if(/Nightstand|PrimaryNoir/.test(n)){if(!/PrimaryNoir/.test(n))use('nightstand',PI);/* Sagara includes two bedside wings. */}
   else if(/Orbital/.test(n))use('sputnik');
   else if(/Chandelier/.test(n))use('chandelier');
   else if(/BrassLamp|shaded brass lamp/.test(n))use('light-floor');
   else if(/Lamp|lamp|reading light/.test(n))use('light-desk');
   else if(/StoneBrass/.test(n))use('coffee-side');
   else if(/WarmCopper/.test(n)){if(!n.endsWith('1'))use('coffee-round');}
   else if(/Speaker/.test(n))put(g,'audio',n,x,lo[1],z,.32,1.0,.33,0);
   else if(/CinemaClub/.test(n))stock.seats(g,n,lo,hi,scene);
   else if(/leather club|PrimaryLounge|reading chair/.test(n))retained(g,n,scene.getObjectByName('SM_EXT_LoungeChair_0'),lo,hi,0);
   else if(/Coat|hanging coat/.test(n)){
    const number=+n.slice(-1),second=key==='second',bay=+(n.match(/(?:_|coat )(\d+)[_.]\d+$/)?.[1]||0);
    const face=second||/Coat1_/.test(n)?1:-1,top=second?9.72:6.405;
    const type=['trench','shirt','trousers'][(bay+number)%3];
    rail(g,n,type,x,top,z,face*(number===1?.12:.32),second?.38:.43,.88,.175)
   }
   else if(/Handbag|DisplayBag|upper leather/.test(n))use('salon-bag',PI/2,'natural',true);
   else if(/Perfume/.test(n))use('scent');
   else if(/Bench|bench/.test(n))use('bench',d>w?PI/2:0,'fitted',d>w);
   else if(/FreestandingBath/.test(n))put(g,'tub',n,x,lo[1],z,.82,.647,1.74,-PI/2);
   else if(/Vanity|WC$/.test(n)){
    const kind=n.match(/Suite[23]|His|Her/)[0],wc=n.endsWith('WC');
    const [xx,zz]=({Suite2:wc?[.32,5.03]:[1.30,5.12],Suite3:wc?[10.22,5.03]:[8.64,5.12],His:wc?[-3.63,3.73]:[-3.20,5.12],Her:wc?[11.16,-.37]:[14.45,-.76]})[kind];
    if(wc)stock.wc(g,scene,n,xx,zz,floor,kind==='Her'?PI/2:kind==='His'?0:PI);
    else stock.vanity(g,n,xx,zz,floor,kind==='Her'?-PI/2:PI);
   }else throw Error('Undefined furnishing '+n)
  }
 }
 return {stock,place};
}
