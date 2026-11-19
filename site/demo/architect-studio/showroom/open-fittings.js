import * as T from 'three';
import {RoundedBoxGeometry,mergeGeometries} from './vendor/furniture-utils.js';
// Independent public fittings. All dimensions are metres before placement.
// Only room-space extents are read from the layout, never private geometry.
const group=()=>new T.Group(),M=(c,r=.65,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const stone=M(0xc7bcaa,.39),brass=M(0xaa8952,.35,.69),wood=M(0x74503c,.55),dark=M(0x322f2e,.48),linen=M(0xd7c7b3,.94),bedlinen=M(0xf1e8d8,.94),sage=M(0x697269,.92),china=M(0xe2dfd6,.25),opal=M(0xffedcf,.36),black=M(0x23262a,.38),steel=M(0x9d9d97,.31,.64);
const rugMat=M(0xcac3b4,.99),glass=M(0x918267,.2,.35),paper=M(0xe4dac8,.81),leather=[0x654d41,0x413d38,0xa29479].map(c=>M(c,.56)),fabrics=[linen,sage,M(0x5e5550,.91),M(0xa78d74,.93)];opal.emissive.set(0xffdca7);opal.emissiveIntensity=.24;
const nameSeed=n=>Array.from(n).reduce((s,c)=>Math.imul(s,31)+c.charCodeAt(0)|0,3)>>>0;
const cache=new Map();function shape(key,fn){if(!cache.has(key))cache.set(key,fn());return cache.get(key)}
const v=(x,y,z)=>new T.Vector3(x,y,z);
function mesh(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o}
function box(g,x,y,z,w,h,d,m,r=0){const geo=shape(['b',w,h,d,r].join(','),()=>r?new RoundedBoxGeometry(w,h,d,3,Math.min(r,Math.min(w,h,d)*.47)):new T.BoxGeometry(w,h,d));return mesh(g,geo,m,x,y,z)}
function cyl(g,x,y,z,rt,rb,h,m,n=32){return mesh(g,shape(['c',rt,rb,h,n].join(','),()=>new T.CylinderGeometry(rt,rb,h,n)),m,x,y,z)}
function ell(g,x,y,z,w,h,d,m){const o=mesh(g,shape('s',()=>new T.SphereGeometry(1,28,16)),m,x,y,z);o.scale.set(w/2,h/2,d/2);return o}
function lathe(g,x,y,z,rows,m){const o=mesh(g,shape('lathe'+rows.join(),()=>new T.LatheGeometry(rows.map(([r,h])=>new T.Vector2(r,h)),40)),m,x,y,z);return o}
function wire(g,pts,r,m){const curve=new T.CatmullRomCurve3(pts.map(a=>v(...a)));return mesh(g,new T.TubeGeometry(curve,20,r,8,false),m)}
function merge(g){g.updateWorldMatrix(true,true);const parts=new Map();g.traverse(o=>{if(!o.isMesh)return;const geom=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const a of Object.keys(geom.attributes))if(!['position','normal','uv'].includes(a))geom.deleteAttribute(a);if(!geom.attributes.uv)geom.setAttribute('uv',new T.BufferAttribute(new Float32Array(geom.attributes.position.count*2),2));geom.applyMatrix4(o.matrixWorld);if(!parts.has(o.material))parts.set(o.material,[]);parts.get(o.material).push(geom)});const out=group();for(const [m,gg] of parts){mesh(out,mergeGeometries(gg),m);gg.forEach(q=>q.dispose())}return out}
function tailor(g,kind,x,y,z,w,h,d,m){const geo=new RoundedBoxGeometry(w,h,d,5,Math.min(h*.38,.13));const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const px=pos.getX(i),py=pos.getY(i),pz=pos.getZ(i);const a=Math.max(0,py/h+.1);pos.setY(i,py+a*(Math.cos(6*px/w+1.3*pz/d)*.012+Math.cos(20*pz/d+3*px/w)*.005));}geo.computeVertexNormals();return mesh(g,geo,m,x,y,z)}
function bed(g){box(g,0,.13,0,1.78,.22,1.95,wood,.055);box(g,0,.29,0,1.94,.29,2.04,linen,.09);box(g,0,.75,.94,2.03,.96,.16,linen,.075);for(let i=-3;i<=3;i++)box(g,i*.278,.76,.844,.007,.79,.009,stone,.003);
 tailor(g,0,0,.48,-.04,1.90,.32,1.97,bedlinen);tailor(g,0,0,.62,-.30,1.95,.19,1.43,linen);const end=tailor(g,0,0,.718,-.57,1.97,.052,.54,sage);end.rotation.y=.015;
 for(const s of [-1,1]){const p=tailor(g,0,s*.46,.73,.57,.83,.20,.47,bedlinen);p.rotation.x=-.23;p.rotation.z=s*.035;const q=tailor(g,0,s*.41,.83,.42,.57,.16,.35,sage);q.rotation.x=-.50;q.rotation.y=-s*.08}}
function lamp(g){lathe(g,0,0,0,[[.001,0],[.15,0],[.15,.02],[.09,.034],[.055,.07],[.023,.11],[.012,.13],[.012,.63],[.045,.64]],brass);lathe(g,0,.57,0,[[.19,0],[.19,.012],[.124,.208],[.119,.209],[.184,.009]],opal)}
function table(g){cyl(g,0,.035,0,.20,.203,.07,wood);cyl(g,0,.25,0,.075,.105,.45,brass);cyl(g,0,.49,0,.27,.26,.036,stone);cyl(g,0,.466,0,.26,.25,.013,brass)}
function cabinet(g){box(g,0,.06,0,.47,.12,.42,dark,.015);box(g,0,.32,0,.53,.42,.48,wood,.028);for(const y of [.23,.435]){box(g,0,y,-.243,.49,.182,.021,wood,.009);box(g,0,y+.045,-.265,.17,.012,.023,brass,.004)}box(g,0,.546,0,.55,.038,.5,stone,.013)}
function plate(g,x,y,z,s=1){const o=lathe(g,x,y,z,[[.001,.001],[.066,.001],[.109,.009],[.132,.021],[.13,.024],[.105,.014],[.063,.006],[.001,.006]],china);o.scale.setScalar(s)}
function settings(g){for(const x of [-.58,.58])for(const z of [-.32,.32]){plate(g,x,0,z);plate(g,x,.009,z,.75);const cup=lathe(g,x+.16,.008,z*.76,[[.001,0],[.036,0],[.039,.055],[.035,.058],[.030,.01],[.001,.009]],china);box(g,x-.165,.01,z,.012,.012,.18,brass,.004)}
 for(const x of [-1.04,1.04])plate(g,x,0,0);lathe(g,0,.002,0,[[.001,0],[.056,0],[.082,.09],[.034,.14],[.031,.15]],sage);for(let i=0;i<6;i++){const t=i*2.4;wire(g,[[0,.13,0],[.026*Math.cos(t),.27,.02*Math.sin(t)],[.095*Math.cos(t),.32+.03*i,.075*Math.sin(t)]],.003,wood);ell(g,.077*Math.cos(t),.32+.02*i,.055*Math.sin(t),.048,.023,.033,sage)}}
function speaker(g){box(g,0,.53,0,.3,1.04,.29,black,.019);for(const [y,r] of [[.22,.1],[.51,.1],[.79,.057],[.93,.027]]){const a=cyl(g,0,y,.149,r,r*.93,.015,dark);a.rotation.x=Math.PI/2;ell(g,0,y,.163,r*.96,r*.96,.021,black)}}
function bench(g){for(const x of [-.42,.42])for(const z of [-.14,.14])cyl(g,x,.14,z,.021,.015,.28,brass);box(g,0,.294,0,.96,.064,.40,wood,.017);tailor(g,0,0,.36,0,1,.13,.43,linen)}
function garment(g,idx){const material=fabrics[idx%4];const sides=48,rows=26,pos=[],uv=[],ix=[];for(let j=0;j<=rows;j++){const h=j/rows;const width=h<.70?.212-.047*h:.181*(1-.77*Math.pow((h-.70)/.30,1.52));for(let i=0;i<=sides;i++){const a=i/sides*2*Math.PI;const fold=(.010*Math.cos(8*a+h*2.5+idx)+.004*Math.cos(14*a-h))*(1-.53*h);pos.push((width+fold)*Math.cos(a),.78*h+.016*(1-h)**4*Math.cos(6*a+idx),(.072+fold+.013*(1-h))*Math.sin(a));uv.push(i/sides,h);if(i<sides&&j<rows){const k=j*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2)}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();mesh(g,geo,material);for(const s of [-1,1]){const arm=ell(g,s*.167,.41,0,.080,.42,.12,material);arm.rotation.z=s*.135}wire(g,[[0,.78,0],[.013,.81,0],[.002,.84,0],[-.022,.827,0]],.006,brass)}
function bag(g,i){const m=leather[i%3];box(g,0,.11,0,.32,.21,.13,m,.045);box(g,0,.154,.065,.293,.078,.015,m,.018);box(g,0,.125,.078,.038,.019,.012,brass,.005);for(const z of [-.036,.04])wire(g,[[-.083,.19,z],[-.075,.27,z],[0,.307,z],[.074,.26,z],[.083,.19,z]],.008,m)}
function pendant(g){cyl(g,0,.71,0,.07,.069,.03,brass);cyl(g,0,.48,0,.007,.007,.46,brass);for(let i=0;i<8;i++){const t=i*Math.PI/4,h=.14+.08*(i%2),x=.42*Math.cos(t),z=.42*Math.sin(t);wire(g,[[0,.26,0],[x*.77,h,z*.77],[x,h+.02,z]],.01,brass);ell(g,x,h+.087,z,.127,.15,.127,opal)}}
function basin(g,isTub=false){const o=lathe(g,0,0,0,isTub?[[.001,0],[.38,0],[.58,.035],[.83,.32],[.96,.54],[.95,.57],[.90,.57],[.75,.32],[.59,.15],[.32,.11],[.001,.11]]:[[.001,0],[.17,0],[.32,.045],[.41,.107],[.415,.132],[.39,.133],[.3,.066],[.12,.026],[.001,.025]],china);o.scale.z=isTub?.46:.48}
function sanitary(g,wc){if(wc){const o=lathe(g,0,0,0,[[.001,0],[.123,0],[.142,.03],[.145,.20],[.182,.29],[.19,.365],[.185,.39],[.155,.39],[.12,.33],[.06,.23],[.001,.22]],china);o.scale.z=1.41;ell(g,0,.398,0,.37,.042,.53,china);box(g,0,.69,-.227,.16,.087,.012,steel,.012)}else{box(g,0,.32,0,.81,.59,.42,wood,.027);for(const y of [.23,.49]){box(g,0,y,.21,.778,.237,.025,wood,.009);box(g,0,y+.075,.224,.56,.012,.012,brass,.004)}box(g,0,.633,0,.85,.052,.45,stone,.012);const b=group();basin(b);b.position.set(0,.66,.012);g.add(b);wire(g,[[.27,.655,-.15],[.27,.88,-.15],[.25,.886,-.085],[.224,.847,-.063]],.012,brass)}}
function bottle(g){lathe(g,0,0,0,[[.001,0],[.045,0],[.047,.01],[.044,.084],[.022,.102],[.012,.106],[.012,.116]],glass);cyl(g,0,.124,0,.024,.024,.026,brass)}
const bounds=o=>{o.updateWorldMatrix(true,true);return new T.Box3().setFromObject(o,true)};
function fit(g,n,src,lo,hi,yaw=0){const pivot=group();pivot.add(src.clone());pivot.rotation.y=yaw;const b=bounds(pivot),size=b.getSize(v()),c=b.getCenter(v()),dst=group();dst.name=T.PropertyBinding.sanitizeNodeName(n);dst.add(pivot);const d=hi.map((e,i)=>Math.max(.002,e-lo[i]));dst.scale.set(d[0]/size.x,d[1]/size.y,d[2]/size.z);dst.position.set((lo[0]+hi[0])/2-c.x*dst.scale.x,lo[1]-b.min.y*dst.scale.y,(lo[2]+hi[2])/2-c.z*dst.scale.z);g.add(dst);return dst}
export async function makeKit(loader){
 const url=n=>new URL('./assets/'+n,import.meta.url).href;
 const [layout,...lib]=await Promise.all([fetch(url('public-layout.json')).then(r=>{if(!r.ok)throw Error('Public fitting layout');return r.json()}),...['atelier','pavilion','table','chair'].map(n=>loader.loadAsync(url(n+'.glb')).then(v=>v.scene))]);
 const [sofa,pavilion,dining,chair]=lib;sofa.traverse(o=>{if(o.isMesh&&/fabric/i.test(o.material.name)){o.material.color.set(0xe6d8c2);o.material.roughness=.85}});
 const templates=new Map();function own(id,fn){if(!templates.has(id)){const g=group();fn(g);templates.set(id,merge(g))}return templates.get(id)}
 return {place(key,g,scene){for(let [n,lo,hi] of layout[key]||[]){let obj,rot=0;const id=nameSeed(n)%9;
 if(/House_Linen|linen three-seat/.test(n)){obj=sofa;rot=/Gallery/.test(n)?Math.PI:0}
 else if(/MidnightVelvet|CinemaLoveseat/.test(n)){obj=pavilion;rot=/Midnight/.test(n)?-Math.PI/2:Math.PI}
 else if(/FynnChair/.test(n)){obj=chair;rot=[0,0,Math.PI/2,Math.PI,Math.PI,-Math.PI/2][+n.slice(-1)]}
 else if(/LinhaTableSetting/.test(n))obj=own('settings',settings);
 else if(/LinhaTable/.test(n))obj=dining;
 else if(/Rug|rug|runner/.test(n))obj=own('rug',g=>box(g,0,0,0,1,.006,1,rugMat,.002));
 else if(/Nightstand|PrimaryNoir/.test(n))obj=own('cabinet',cabinet);
 else if(/Bed$|PrimaryEliana/.test(n))obj=own('bed',bed);
 else if(/Chandelier|Orbital/.test(n))obj=own('pendant',pendant);
 else if(/Lamp|lamp|reading light/.test(n))obj=own('lamp',lamp);
 else if(/StoneBrass|WarmCopper/.test(n))obj=own('table',table);
 else if(/Speaker/.test(n))obj=own('speaker',speaker);
 else if(/CinemaClub|leather club|PrimaryLounge|reading chair/.test(n)){obj=scene.getObjectByName('SM_EXT_LoungeChair_0');rot=/Cinema/.test(n)?Math.PI:0}
 else if(/Coat|hanging coat/.test(n))obj=own('coat'+(id%4),g=>garment(g,id%4));
 else if(/Handbag|DisplayBag|upper leather/.test(n)){obj=own('bag'+(id%3),g=>bag(g,id));rot=Math.PI/2}
 else if(/Perfume/.test(n))obj=own('bottle',bottle);
 else if(/Bench|bench/.test(n)){obj=own('bench',bench);if(hi[2]-lo[2]>hi[0]-lo[0])rot=Math.PI/2}
 else if(/FreestandingBath/.test(n))obj=own('tub',g=>basin(g,true));
 else if(/Vanity$|WC$/.test(n)){const wc=n.endsWith('WC'),[x,z]=({Suite2:wc?[.32,5.03]:[1.30,5.12],Suite3:wc?[10.22,5.03]:[8.64,5.12],His:wc?[-3.63,3.73]:[-3.20,5.12],Her:wc?[11.16,-.37]:[14.45,-.76]})[n.match(/Suite[23]|His|Her/)[0]],y=key==='first'?4.2:7.95,side=n.includes('Her'),w=wc?.39:.85,d=wc?.60:.44,h=wc?.79:.91,bottom=y+(wc?.13:.16);rot=side?-Math.PI/2:n.includes('HisWC')?0:Math.PI;lo=[x-(side?d:w)/2,bottom,z-(side?w:d)/2];hi=[2*x-lo[0],bottom+h,2*z-lo[2]];obj=own(wc?'wc':'wash',g=>sanitary(g,wc))}
 if(!obj)throw Error('Unfilled public furniture slot: '+n);fit(g,n,obj,lo,hi,rot);
 }}}
}
