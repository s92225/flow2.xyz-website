import {buildExterior} from './exterior.js';
import {wallHeight,soffitAt} from './view-motion.js';
/* All dimensions in model metres; these lightweight masses follow the local
   reconstruction's room arrangement, not an as-built survey. */
export const floors=[
 {name:['Garden level','花園層'],e:'±0.00',scale:35,center:[3.5,-1.8],rooms:[
 ['living','Living & sitting','客廳及起居區',0,8.8,-2.85,2.87,'A long living room opens directly onto the terrace.','長形客廳直接連接花園平台。'],
 ['dining','Dining room','飯廳',8.8,14.79,-2.85,2.87,'The dining setting shares the open frontage with the living room.','飯廳與客廳共享面向花園的開放空間。'],
 ['guest','Guest suite','客套房',-4.18,-.10,-2.85,2.87,'The guest suite sits at the quiet end of the living floor.','客套房位於客廳一側的安靜角落。'],
 ['kitchen','Enclosed kitchen','廚房',9.19,14.79,3.05,6.65,'The enclosed kitchen is accessed from the dining side.','獨立廚房由飯廳一側進入。'],
 ['garden','Garden & pool','花園及泳池',15.1,23.8,-11,-4.8,'A terrace follows the garden edge towards the angled pool.','花園平台沿邊界通往斜置的泳池。']]},
 {name:['First floor','一樓'],e:'+4.20',scale:21.8,center:[5.3,2.2],rooms:[
 ['cinema','Private cinema','私人影院',-4.18,.14,-2.65,1.93,'A former bedroom becomes a two-row screening room. The aisle stays clear along the east side.','原睡房改為兩排座位的私人影院，東側預留通道。'],
 ['family','Family lounge','家庭起居室',.14,6.48,-2.65,1.93,'The shared family room occupies the middle of the garden frontage.','家庭起居室位於面向花園的中央位置。'],
 ['flex','Reading room','閱覽室',6.48,10.78,-2.65,1.93,'Between the lounge and the dressing salon, two reading chairs share a book-lined corner.','閱覽室位於起居室與衣帽間之間，兩張單椅面向木書架。'],
 ['salon','Dressing salon','女士衣帽間',10.78,14.79,-2.65,1.93,'Two runs of cabinetry frame a freestanding jewellery island and upholstered bench.','兩排通高展示櫃圍合珠寶島及軟墊長凳。'],
 ['stairs','Stair hall','樓梯大堂',4.1,7.85,3.40,7.42,'Stacked return stairs connect the public floor and the private suite above.','折返樓梯連接地下公共空間及樓上的主人套房。']]},
 {name:['Second floor','二樓'],e:'+7.95',scale:21.8,center:[5.3,2.2],rooms:[
 ['wardrobe','Dressing room','更衣室',-4.18,.20,-2.65,1.93,'A separate dressing room completes the private floor.','獨立更衣室連繫主人樓層的私人空間。'],
 ['study','Private study','書房',.2,4.2,-2.65,1.93,'A study forms a more intimate transition into the main bedroom.','書房是通往主人睡房的過渡空間。'],
 ['primary','Primary bedroom','主人睡房',4.2,10.76,-2.65,1.93,'The main bedroom lies between the study and the en-suite bathing space.','主人睡房位於書房與套房浴室之間。'],
 ['bath','Primary bathroom','主人浴室',10.76,14.79,-2.65,1.93,'The bath is set against the garden-facing side of the suite.','浴缸設於套房面向花園的一側。'],
 ['stairs','Stair hall','樓梯大堂',4.1,7.85,3.40,7.42,'From the landing a short passage serves the study and main bedroom.','樓梯平台以短走廊連接書房與主人睡房。']]}];
export function build(T, group,level){
const pick=[],geo=new T.BoxGeometry(1,1,1),edge=new T.EdgesGeometry(geo),lineMat=new T.LineBasicMaterial({color:0x716c60,transparent:true,opacity:.26}),mats=new Map();
function material(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.9,side:T.DoubleSide}));return mats.get(c)}
const paper=0xece9df, limestone=0xd4cbb5,timber=0xb89e78,oak=0xb99f80,dust=0xe6dfce, sage=0xa5b399,ink=0x685f51,chair=0xd1bb9b,water=0x88aaa6;
function box(x,z,w,d,y,h,c=paper,outline=false,room=null,ang=0){
 const m=new T.Mesh(geo,material(c));m.position.set(x,y+h/2,z);m.scale.set(w,h,d);m.rotation.y=ang;m.castShadow=m.receiveShadow=true;group.add(m);
 if(outline){const l=new T.LineSegments(edge,lineMat);m.add(l)}if(room){m.userData.room=room;pick.push(m)}return m}
function plate(x1,x2,z1,z2,y,c){return box((x1+x2)/2,(z1+z2)/2,x2-x1,z2-z1,y,.21,c,true)}
// Only the wall heads move, never the footprint. Scaling boxes instead of just discarding
// fragments leaves solid visible cut faces. Door openings keep a real lintel above 2.12 m.
const members=[],glass=new T.MeshStandardMaterial({color:0xbac9c5,roughness:.25,transparent:true,opacity:.18,depthWrite:false});
function member(x,z,w,d,bottom,open,c=paper,outline=true,head=false){
 const o=box(x,z,w,d,bottom,1,c,outline);members.push({o,bottom,open,head});return o
}
function hx(z,x1,x2){return member((x1+x2)/2,z,x2-x1,.14,.01,1.45)}
function vz(x,z1,z2){return member(x,(z1+z2)/2,.14,z2-z1,.01,1.45)}
function run(fun,f,a,b,gaps){let l=a;for(const [u,v]of gaps){if(u>l)fun(f,l,u);const x0=Math.max(a,u),x1=Math.min(b,v);
 if(x1>x0){const m=(x0+x1)/2;fun===hx?member(m,f,x1-x0,.14,2.12,1.45):member(f,m,.14,x1-x0,2.12,1.45)}l=v}if(l<b)fun(f,l,b)}
function cyl(x,z,y,rb,rt,h,c,n=20){const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,n),material(c));o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;group.add(o);return o}
function sofa(x,z,w,flip=1){box(x,z,w,.75,.05,.28,oak,true);for(let i=0;i<Math.ceil(w/.86);i++){const n=Math.ceil(w/.86);box(x-w/2+(i+.5)*w/n,z,w/n-.03,.71,.33,.20,dust,true)}box(x,z+flip*.30,w,.15,.48,.35,dust,true);for(const s of [-1,1])box(x+s*(w/2-.06),z,.13,.77,.29,.35,dust,true)}
function bed(x,z,w){box(x,z,w,2,.04,.29,oak,true);box(x,z,w-.045,1.95,.33,.21,paper,true);box(x,z+.96,w+.11,.18,.05,.99,timber,true);box(x,z-.4,w+.015,1.05,.54,.08,dust,true);for(const s of [-1,1])box(x+s*w*.24,z+.62,w*.41,.35,.54,.15,paper,true)}
function table(x,z,w,d){box(x,z,w,d,.68,.07,timber,true);for(const a of [-1,1])for(const b of [-1,1])box(x+a*(w/2-.11),z+b*(d/2-.1),.06,.06,.03,.65,ink)}
function seat(x,z){box(x,z,.41,.41,.06,.35,chair,true);box(x,z+.19,.41,.06,.4,.35,timber,true)}
function stairs(){for(let i=0;i<9;i++)box(4.10+(i+.5)*.27,6.80,.268,1.24,.02,(i+1)*.085,limestone,true);box(7.19,6.8,1.32,1.24,.02,.77,limestone,true);
 for(let i=0;i<6;i++)box(7.19,6.18-(i+.5)*.25,1.32,.248,.02,.77+(i+1)*.085,limestone,true);box(7.19,4.04,1.32,1.28,.02,1.28,limestone,true);for(let i=0;i<9;i++)box(6.53-(i+.5)*.27,4.04,.268,1.28,.02,1.28+(i+1)*.085,limestone,true)}
function windowLine(z,a,b,h=1.24){
 const mid=(a+b)/2;box(mid,z,b-a,.11,0,.11,limestone);
 const pane=member(mid,z,b-a,.026,.11,h,ink,false);pane.material=glass;pane.castShadow=false;
 member(mid,z,b-a,.082,0,h,ink,false,true);
 const n=Math.ceil((b-a)/1.33);for(let i=0;i<=n;i++)member(a+(b-a)*i/n,z,.055,.065,.09,h,ink,false)
}
function setSection(worldHeight){
 const top=wallHeight(level,worldHeight,1.45),windowTop=wallHeight(level,worldHeight,1.24);
 if(top===setSection.previous)return;setSection.previous=top;
 for(const {o,bottom,open,head} of members){
  const limit=open===1.45?top:windowTop,base=head?Math.max(0,limit-.065):bottom;
  o.visible=limit>base+.0001;
  if(o.visible){o.scale.y=limit-base;o.position.y=(limit+base)/2}
 }
}
let exteriorPick;
if(level===0){
 exteriorPick=buildExterior(T,group);
 plate(-4.18,14.79,-2.87,2.87,-.20,limestone);plate(-4.18,0,2.87,6.41,-.20,limestone);plate(0,7.85,2.87,7.44,-.20,limestone);plate(9.19,14.79,2.87,6.65,-.20,limestone);hx(-2.86,-4.18,-3.79);windowLine(-2.87,-3.79,-.12);windowLine(-2.87,.08,14.77);vz(14.78,-2.87,6.65);vz(-4.18,-2.87,6.41);run(vz,-.1,-2.87,2.87,[[1.93,2.78]]);run(hx,2.87,-4.18,14.79,[[2.21,4.01],[9.68,10.65]]);hx(6.64,9.2,14.79);vz(9.19,2.87,6.64);hx(7.43,.02,7.85);vz(7.86,2.87,7.43);hx(6.41,-4.18,.02);run(vz,0,2.87,7.43,[[5.29,6.32]]);stairs();
 sofa(3.7,.97,2.8,1);sofa(3.7,-1.18,2.8,-1);box(3.7,-.11,1.32,.62,.06,.28,ink,true);sofa(7.58,.14,1.7);table(12,-.08,2.5,1.2);for(let i=0;i<3;i++)for(const z of [-.99,.83])seat(11.15+i*.85,z);
 bed(-2.37,1.27,1.7);box(12.04,6.15,5.4,.62,.02,.87,timber,true);box(14.30,4.6,.72,2.3,.02,1.77,oak,true);table(-2.4,4.99,1.5,.58);seat(-2.39,5.54);
}else{
 plate(-4.18,14.79,-2.65,5.46,-.2,limestone);plate(.12,7.85,5.46,7.43,-.20,limestone);run(hx,5.46,-4.18,4.10,[[2.35,3.65]]);hx(5.46,7.91,14.79);hx(7.42,.12,7.91);vz(.12,5.46,7.43);vz(7.91,3.04,7.43);vz(-4.18,-2.65,5.46);vz(14.79,-2.65,5.46);windowLine(-2.65,-4.18,14.79);run(hx,3.33,-4.18,4.10,level===1?[[-2.07,-.99],[2.00,3.28]]:[[1.92,3.14]]);run(hx,3.37,7.91,14.79,level===1?[[11.76,12.78]]:[[11.00,12.15]]);if(level===1)hx(3.33,4.10,7.91);stairs();
 if(level===1){
 for(const x of [.14,6.48,10.78])vz(x,-2.65,1.93);run(hx,1.93,-4.18,14.79,[[-1.44,-.31],[2.78,4.02],[7.91,9.08],[11.45,12.54]]);run(vz,-.36,3.4,5.46,[[4.05,5.04]]);vz(1.88,3.4,5.46);run(vz,10.87,3.4,5.46,[[4.05,5.04]]);
 box(-2.03,-2.37,3.4,.20,0,.12,ink,true);box(-2.03,-2.47,2.76,.12,.42,1.58,ink,true);box(-2.03,-2.392,2.53,.035,.51,1.40,0xb2bbb4);for(const x of [-3.62,-.41])box(x,-2.10,.29,.32,.12,1.1,ink,true);
 for(const x of [-3.38,-2.29])sofa(x,.94,.88);sofa(-2.85,-.42,2.04);sofa(4.17,.7,2.1);sofa(2.8,-1.33,2.05,-1);cyl(3.72,-.29,0,.5,.5,.33,oak);
 seat(7.24,-.90);seat(9.18,-.48);cyl(8.24,-.69,0,.27,.27,.37,oak);box(10.49,-.18,.33,1.94,.02,1.9,ink,true);
 for(const x of [11.11,14.45]){box(x,-.37,.52,4.15,.01,.16,timber);for(let i=0;i<=5;i++)box(x,-2.43+.82*i,.52,.055,.14,1.66,timber,true);for(const h of [.30,.94,1.57,1.79])box(x,-.36,.53,4.12,h,.05,timber,true)}
 box(13.12,-.29,.84,1.13,.03,.86,oak,true);box(13.12,-.29,.91,1.20,.89,.07,paper,true);sofa(13.12,.95,.94);
 }else{
 for(const [x,g] of [[.20,[[.58,1.64]]],[4.2,[[.49,1.61]]],[10.76,[[.52,1.58]]]])run(vz,x,-2.65,1.93,g);run(hx,1.93,-4.18,14.79,[[.57,1.68],[4.62,5.90]]);run(vz,-1.08,3.35,5.46,[[4.1,5.13]]);
 bed(7.87,.55,2.20);for(const x of [6.38,9.34])box(x,1.33,.57,.45,.05,.5,timber,true);sofa(9.46,-1.85,.78);table(2.7,-1.55,1.63,.7);seat(2.65,-.95);box(-2.345,1.55,3.29,.55,.02,1.59,timber,true);box(-3.82,-.35,.50,2.85,.02,2.1,oak,true);box(-2.08,-.37,.62,1.15,.04,.46,chair,true);
 box(13.19,-1.74,1.67,.79,.03,.48,paper,true);box(13.19,-1.74,1.47,.57,.51,.03,0xc1c7bd);box(14.31,.92,.48,1.21,.03,.71,oak,true);
 }}
 const pads={};for(const r of floors[level].rooms){if(r[0]==='garden'){const o=exteriorPick;o.userData.room=r[0];pick.push(o);pads[r[0]]=o;continue}
 const [x1,x2,z1,z2]=r.slice(3,7);pads[r[0]]=box((x1+x2)/2,(z1+z2)/2,x2-x1-.13,z2-z1-.13,.012,.012,dust,false,r[0]);}
 // The garden-level plate projects beyond the next floor in places. Close those
 // exposed roof strips at the same soffit rather than leaving a slit over the glazing.
 if(level===0){const y=soffitAt(0);plate(-4.25,14.86,-2.94,-2.65,y,limestone);
  plate(-4.25,.12,5.46,6.48,y,limestone);plate(9.12,14.86,5.46,6.72,y,limestone)}
 return {pick,pads,material,base:dust,water,setSection};
}
