// A conjectural landscape around the model, not surveyed terrain. All units are metres.
const parcel=[[-17.69,-4.97],[-3.03,-9.70],[1.99,-6.47],[11.18,-4.95],[16.316,-8.873],[22.804,-11.712],[25.033,-6.417],[19.74,-4.39],[21.326,-.795],[14.9,-.795],[14.9,6.65],[9.19,6.65],[9.19,2.87],[7.86,2.87],[7.86,7.44],[0,7.44],[0,6.41],[-4.25,6.41],[-4.25,-.334],[-13.775,-.190],[-14.524,-2.063],[-15.908,-3.879]];
const PI=Math.PI,TAU=PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function clearance(x,z){
 let inside=false,min=Infinity;
 for(let i=0;i<parcel.length;i++){const [a,b]=parcel[i],[c,d]=parcel[(i+1)%parcel.length],u=c-a,v=d-b;
  if((b>z)!==(d>z)&&x<a+(z-b)*u/v)inside=!inside;
  const t=clamp(((x-a)*u+(z-b)*v)/(u*u+v*v),0,1);min=Math.min(min,Math.hypot(x-a-t*u,z-b-t*v));}
 return inside?-min:min;
}
const radius=a=>1+.047*Math.sin(3*a+.6)+.054*Math.sin(5*a+1.5)+.026*Math.sin(9*a-.25)+.012*Math.cos(15*a);
const radial=(x,z)=>{const u=(x-3.5)/29,v=(z+2)/17.2;return Math.hypot(u,v)/radius(Math.atan2(v,u))};
function height(x,z){
 const d=Math.max(0,clearance(x,z)-.55),r=radial(x,z);
 const detail=.20*Math.sin(x*.43+z*.25)+.17*Math.cos(z*.67-x*.1)+.35*Math.sin(z*.27-.4);
 return -1.62-Math.max(0,d*(.105+.046*Math.sin(x*.20)) - detail*Math.min(1,d/3)) - 1.03*Math.max(0,r-.76)*4;
}
export function buildHillside(T){
 const g=new T.Group();g.name='Surrounding hillside · illustrative landscape';
 let seed=31590;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const range=(a,b)=>a+rand()*(b-a), col=new T.Color(), grassLo=new T.Color(0xbed1b1),grassHi=new T.Color(0xe1e2c8),granite=new T.Color(0xc5beb0);
 const layer=(name,geo,mat,cast=false)=>{const m=new T.Mesh(geo,mat);m.name=name;m.receiveShadow=true;m.castShadow=cast;g.add(m);return m};
 const pos=[],color=[],uv=[],ix=[],N=96,R=20;
 function landVertex(x,y,z,edge=0){
  pos.push(x,y,z);uv.push((x+.21*z+.43*Math.sin(z*.31))/12,(-z+.14*x+y*.62)/12);const t=clamp(.47+.16*Math.sin(x*.36-z*.37)+.19*Math.cos(z*.66+x*.21)+.08*Math.sin(z*2+x*.36),.04,.92);
  col.copy(grassLo).lerp(grassHi,t).lerp(granite,edge*.8).multiplyScalar(1-edge*.06+range(-.024,.024));color.push(col.r,col.g,col.b);
 }
 landVertex(3.5,-1.62,-2);
 const id=(j,i)=>1+(j-1)*N+(i+N)%N;
 for(let j=1;j<=R+2;j++)for(let i=0;i<N;i++){
  const angle=TAU*i/N,r=radius(angle)*Math.min(1,j/R),bevel=j===R+1?.986:j===R+2?.951:1;
  const x=3.5+29*r*Math.cos(angle)*bevel,z=-2+17.2*r*Math.sin(angle)*bevel,y=height(x,z)-(j===R+1?.40:j===R+2?.78:0);
  landVertex(x,y,z,clamp((j/R-.84)*3,0,1));
  const a=id(j,i),b=id(j,i+1);
  if(j===1)ix.push(0,b,a);else{const c=id(j-1,i),d=id(j-1,i+1);ix.push(c,b,a,c,d,b)}
 }
 const soil=new T.BufferGeometry();soil.setAttribute('position',new T.Float32BufferAttribute(pos,3));soil.setAttribute('color',new T.Float32BufferAttribute(color,3));soil.setIndex(ix);soil.computeVertexNormals();
 soil.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 let stoneMap=null,stoneNormal=null;
 if(typeof document!=='undefined'){
  const texture=name=>{const m=new T.TextureLoader().load(new URL('./planting/'+name,import.meta.url).href,()=>window.dispatchEvent(new Event('model-material-ready')));m.wrapS=m.wrapT=T.RepeatWrapping;m.anisotropy=4;return m};
  stoneMap=texture('grass-rock.webp');stoneMap.colorSpace=T.SRGBColorSpace;stoneNormal=texture('grass-rock-normal.webp');
 }
 layer('Weathered grass and granite shoulder',soil,new T.MeshStandardMaterial({map:stoneMap,normalMap:stoneNormal,normalScale:new T.Vector2(.5,.5),roughness:.97,vertexColors:true,side:T.DoubleSide}),true);
 // Three batched meshes for the whole plant community. Sprays occupy real
 // angled planes in the crown (not viewer-facing billboards). Taller plants
 // are deliberately off-axis; the near and pool-facing shoulders remain open.
 const wood={p:[],c:[]},fol={p:[],c:[],uv:[],n:[],i:[]},stones={p:[],c:[]};
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 function tri(batch,a,b,c,tone){batch.p.push(...a.toArray(),...b.toArray(),...c.toArray());for(let i=0;i<3;i++)batch.c.push(tone.r,tone.g,tone.b)}
 function branch(a,b,ra,rb,tone){
  const dir=b.clone().sub(a).normalize(),u=V(1,0,0).cross(dir).normalize(),v=dir.clone().cross(u);
  const at=(p,r,k)=>p.clone().addScaledVector(u,r*Math.cos(k*TAU/5)).addScaledVector(v,r*Math.sin(k*TAU/5));
  for(let k=0;k<5;k++){const p=at(a,ra,k),q=at(a,ra,k+1),s=at(b,rb,k),t=at(b,rb,k+1);tri(wood,p,q,t,tone);tri(wood,p,t,s,tone)}
 }
 function spray(p,size,yaw,pitch,shade){
  const u=V(Math.cos(yaw),0,Math.sin(yaw)).multiplyScalar(size),v=V(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(size*range(.76,1.07));
  const normal=v.clone().cross(u).normalize();if(normal.y<0)normal.negate();normal.lerp(V(0,1,0),.68).normalize();const tile=Math.floor(rand()*4),b=fol.p.length/3;
  for(const [a,s]of [[0,0],[1,0],[1,1],[0,1]]){const q=p.clone().addScaledVector(u,a-.5).addScaledVector(v,s-.5);fol.p.push(...q.toArray());fol.n.push(...normal.toArray());fol.c.push(shade*.99,shade,shade*.93);fol.uv.push(((tile%2)+a)*.5,((tile>>1)+s)*.5)}
  fol.i.push(b,b+1,b+2,b,b+2,b+3);
 }
 const bark=new T.Color(0x787566),trees=[],rockPalette=[0xa49d89,0xaca68d,0xb7b09c,0xb1a997];
 function plant(x,z,h,shrub=false){
  const y=height(x,z)-.085,base=V(x,y,z),w=h*(shrub?.72:range(.38,.53)),join=V(x+range(-.08,.08)*h,y+h*.45,z+range(-.08,.08)*h);
  if(!shrub)branch(base,join,h*.039,h*.025,bark);
  const n=shrub?5:8,start=rand()*TAU;
  for(let j=0;j<n;j++){
   const a=j*2.4+start,r=j===0?.08:range(.40,.83),tip=V(join.x+w*r*Math.cos(a),y+h*(j===0?.98:range(.64,.91)),join.z+w*r*Math.sin(a));
   if(!shrub){const knee=join.clone().lerp(tip,.54);knee.y-=.07*h;branch(join,knee,.022*h,.013*h,bark);branch(knee,tip,.013*h,.004*h,bark)}
   const count=shrub?9:12;
   for(let k=0;k<count;k++){const az=k*2.4+a,dist=Math.sqrt((k+.4)/count)*w*.52;
    const p=V(tip.x+dist*Math.cos(az),tip.y+h*(range(-.11,.045)-.09*dist/w),tip.z+dist*Math.sin(az));
    spray(p,w*(shrub?range(.62,1.03):range(.62,.93)),az+range(-.7,.7),range(.36,1.38)*(k%3===0?-1:1),range(.78,1.18));}
  }
 }
 for(const [x,z,h]of [[-19,-5.5,2.9],[-19.7,-1.1,2.15],[-12,-9.7,2.9],[-9.9,-10.9,2.3],[-5,-12.8,3.3],[-2.6,-13.0,2.5],[5,-10.6,2.31],[7.5,-10.2,1.85],[26.4,-2.4,2.55],[23,3.2,2.2],[20.7,4.4,1.83],[-11,4.6,2.25],[-14,4.2,1.7],[-5.7,10.3,1.85]]){
  if(clearance(x,z)>1.1&&radial(x,z)<.94){plant(x,z,h);trees.push([x,z]);}
 }
 const patches=[[-20,-3],[-13,-9],[-6,-11.7],[2,-11],[8,-10.6],[16,-13.4],[24,-11.8],[24.8,1.2],[19,4.5],[14,9.3],[1,10],[-8,6.2],[-14.4,2.4]];
 for(const [cx,cz]of patches)for(let i=0;i<12;i++){
  const a=rand()*TAU,r=Math.sqrt(rand()),x=cx+3.15*Math.cos(a)*r,z=cz+1.77*Math.sin(a)*r;
  if(clearance(x,z)<.78||radial(x,z)>.93||trees.some(([u,v])=>Math.hypot(u-x,v-z)<.65))continue;
  plant(x,z,range(.39,1.02),true);
 }
 // Low, partly buried granite outcrops, not regular spheres or boundary fencing.
 for(let i=0;i<42;i++){
  const [cx,cz]=patches[i%patches.length],x=cx+range(-2.9,2.9),z=cz+range(-1.65,1.65);
  if(clearance(x,z)<.8||radial(x,z)>.95)continue;
  const y=height(x,z)-.12,w=range(.28,1.02),h=w*range(.32,.66),a=rand()*TAU,ring=[],top=[],tone=new T.Color(rockPalette[i%4]);
  for(let k=0;k<7;k++){const b=a+TAU*k/7,dx=Math.cos(b)*w*range(.75,1.22),dz=Math.sin(b)*w*.69;ring.push(V(x+dx,y-.12,z+dz));top.push(V(x+.62*dx,y+h*range(.55,.94),z+.62*dz))}
  const peak=V(x+w*.1,y+h,z);for(let k=0;k<7;k++){const j=(k+1)%7;tri(stones,ring[k],top[k],ring[j],tone);tri(stones,ring[j],top[k],top[j],tone);tri(stones,top[k],peak,top[j],tone)}
 }
 function packed(batch){const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(batch.p,3));o.setAttribute('color',new T.Float32BufferAttribute(batch.c,3));if(batch.i){o.setIndex(batch.i);o.setAttribute('normal',new T.Float32BufferAttribute(batch.n,3));o.setAttribute('uv',new T.Float32BufferAttribute(batch.uv,2))}else o.computeVertexNormals();return o}
 const solid=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});layer('Granite outcrops',packed(stones),solid);layer('Woodland branches',packed(wood),solid);
 let map=null;
 if(typeof document!=='undefined'){map=new T.TextureLoader().load(new URL('./planting/leaf-sprays.webp',import.meta.url).href,()=>globalThis.dispatchEvent?.(new Event('model-material-ready')));map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;}
 layer('Broadleaf thickets · Poly Haven tree atlas',packed(fol),new T.MeshLambertMaterial({map,vertexColors:true,alphaTest:.22,alphaToCoverage:true,side:T.DoubleSide}),true);
 return g;
}
