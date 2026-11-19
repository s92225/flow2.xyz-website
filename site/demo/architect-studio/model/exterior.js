// Garden footprint and rotated pool are transcribed from the local reconstruction plan.
// Planting, stonework and furnishings interpret the site as an architectural maquette.
import {addTrees} from './vegetation.js';
const boundary=[[-17.69,-4.97],[-3.03,-9.70],[1.99,-6.47],[11.18,-4.95],[16.316,-8.873],[22.804,-11.712],[25.033,-6.417],[19.74,-4.39],[21.326,-.795],[14.9,-.795],[14.9,6.65],[9.19,6.65],[9.19,2.87],[7.86,2.87],[7.86,7.44],[0,7.44],[0,6.41],[-4.25,6.41],[-4.25,-.334],[-13.775,-.190],[-14.524,-2.063],[-15.908,-3.879]];
const pool=[[17.32,-8.461],[22.392,-10.680],[24.006,-6.847],[18.790,-4.772]];
const patio=[[16.316,-8.873],[22.804,-11.712],[25.033,-6.417],[18.354,-3.759]];
const canopy=[[-14,-3.5,3.55],[-10.5,-5.85,3.1],[-4,-8.25,3.5],[-.7,-7.2,2.35],[15.66,-7.07,2.1],[19.60,-1.95,2.78]];
const mix=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
const at=(p,u,v)=>mix(mix(p[0],p[1],u),mix(p[3],p[2],u),v);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const world=(a,y)=>[a[0],y,a[1]];
const outside=([x,z],poly)=>!poly.reduce((c,p,i)=>{const q=poly.at(i-1);return (p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0]?!c:c},false);
const PALETTE=[0xb9b3a1,0xc1bba9,0xc4bdac,0xb6b09e,0xc5bfad,0xbeb9a6];
export function buildExterior(T,group){
 const site=new T.Group();site.name='Garden • cut site with planted terrace';group.add(site);
 let seed=8451367;const rand=()=>((seed=Math.imul(1664525,seed)+1013904223>>>0)/4294967296),one=a=>a[Math.floor(rand()*a.length)];
 const material=(col,extra={})=>new T.MeshStandardMaterial({color:col,roughness:.89,side:T.DoubleSide,...extra});
 const mesh=(geo,mat,name,shadow=true)=>{const m=new T.Mesh(geo,mat);m.name=name;m.castShadow=shadow;m.receiveShadow=true;site.add(m);return m};
 const path=(points,Cls)=>{const p=new Cls();points.forEach(([x,z],i)=>i?p.lineTo(x,-z):p.moveTo(x,-z));p.closePath();return p};
 function surface(points,y,mat,name,holes=[]){const shape=path(points,T.Shape);shape.holes=holes.map(h=>path(h,T.Path));const m=mesh(new T.ShapeGeometry(shape),mat,name,false);m.rotation.x=-Math.PI/2;m.position.y=y;return m}
 // Vertex-colour meshes keep several thousand individual courses/leaves in a handful of draws.
 const batches=new Map(),color=new T.Color();
 function triangle(k,a,b,c,col,shade=1){
  if(!batches.has(k))batches.set(k,{p:[],c:[]});const batch=batches.get(k);batch.p.push(...a,...b,...c);color.setHex(col).multiplyScalar(shade);for(let i=0;i<3;i++)batch.c.push(color.r,color.g,color.b);
 }
 function quad(k,a,b,c,d,col,shade=1){triangle(k,a,b,c,col,shade);triangle(k,a,c,d,col,shade)}
 function top(k,pts,y,col,shade=1){
  const area=pts.reduce((sum,a,i)=>{const b=pts[(i+1)%4];return sum+a[0]*b[1]-b[0]*a[1]},0);
  const pp=area>0?[pts[3],pts[2],pts[1],pts[0]]:pts;quad(k,...pp.map(p=>world(p,y)),col,shade)
 }
 function cuboid(k,pts,y,h,col){
  top(k,pts,y+h,col);for(let i=0;i<4;i++){const a=pts[i],b=pts[(i+1)%4];quad(k,world(a,y),world(b,y),world(b,y+h),world(a,y+h),col,.94)}
 }
 function rect(x,z,w,d,theta=0){const c=Math.cos(theta),s=Math.sin(theta);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[x+c*a*w/2-s*b*d/2,z+s*a*w/2+c*b*d/2])}
 const ptIn=(p,q)=>!outside(p,q);
 const noiseShader=`
 float hash2(vec2 p){return fract(sin(mod(dot(p,vec2(127.1,311.7)),6.283185))*43758.5453);}
 float grain(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y);}
 `;
 function mottled(c,key,formula){const m=material(c);m.customProgramCacheKey=()=>key;m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 gardenPosition;').replace('#include <project_vertex>','gardenPosition=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 gardenPosition;\n'+noiseShader).replace('#include <color_fragment>','#include <color_fragment>\n'+formula)};return m}
 surface(boundary,-.088,mottled(0x79915b,'moss-grain-v1','vec2 p=gardenPosition.xz; float n=grain(p*1.8)*.52+grain(p*7.4)*.29+grain(p*41.)*.19; diffuseColor.rgb*=.76+n*.55;'),'Clipped hillside lawn',[pool]);
 // Rock strata, crisp sawn upper edge and a recessed dark plinth foot.
 const sideColors=[0x6a6b5a,0x96927f,0xa5a08b,0xafaa96];
 for(let i=0;i<boundary.length;i++){
  const a=boundary[i],b=boundary[(i+1)%boundary.length];const ys=[-1.49,-1.36,-1.08,-.52,-.089];for(let j=0;j<4;j++)quad('Retaining stone',world(a,ys[j]),world(b,ys[j]),world(b,ys[j+1]),world(a,ys[j+1]),sideColors[j]);
 }
 // Travertine ashlar and deck sets; explicit joints remain legible on zoom.
 function pave(points,n,m,y){top('Stone and timber',points,y,0x9c9a87);for(let j=0;j<m;j++){const shift=j%2?.5:0;for(let i=-1;i<n;i++){
 const l=Math.max(0,(i+shift)/n)+.008/n,r=Math.min(1,(i+1+shift)/n)-.008/n,t=(j+.011)/m,b=(j+.989)/m;if(r<=l)continue;
 top('Stone and timber',[at(points,l,t),at(points,r,t),at(points,r,b),at(points,l,b)],y+.008,one(PALETTE));}}}
 pave([[-4.25,-4.24],[14.85,-4.24],[14.85,-2.85],[-4.25,-2.85]],17,2,-.045);
 pave([[14.84,-4.24],[18.84,-6.12],[20.55,-2.28],[14.84,-1.41]],5,4,-.045);
 // The pool basin is a hole, not an opaque blue slab. Tile surface, dipped steps and recessed water.
 const basinFloor=(v)=>-.73-.33*v;
 const tilePalette=[0x548d89,0x629997,0x508889,0x659793,0x568b8a,0x6c9d96,0x568582];
 for(let j=0;j<14;j++)for(let i=0;i<20;i++){
 const points=[at(pool,i/20,j/14),at(pool,(i+1)/20,j/14),at(pool,(i+1)/20,(j+1)/14),at(pool,i/20,(j+1)/14)];quad('Basin tesserae',world(points[3],basinFloor((j+1)/14)),world(points[2],basinFloor((j+1)/14)),world(points[1],basinFloor(j/14)),world(points[0],basinFloor(j/14)),one(tilePalette));}
 for(let n=0;n<4;n++){
 const a=pool[n],b=pool[(n+1)%4],o=patio[n],p=patio[(n+1)%4];const count=Math.round(dist(a,b)/.55),band=t=>[mix(a,o,t),mix(b,p,t)];
 pave([a,b,p,o],count,2,-.032);
 const [rim0,rim1]=band(.34);pave([a,b,rim1,rim0],count,1,.012);
 for(let k=0;k<count;k++){const l=mix(a,b,k/count),r=mix(a,b,(k+1)/count);for(let h=0;h<5;h++)quad('Basin tesserae',world(l,-1.06+h*.2),world(r,-1.06+h*.2),world(r,-.86+h*.2),world(l,-.86+h*.2),one(tilePalette),.86);quad('Stone and timber',world(l,-.068),world(r,-.068),world(r,.019),world(l,.019),one(PALETTE))}
 }
 for(let i=0;i<3;i++){const uv=(u,v)=>at(pool,u,v);const a=.07*i,b=.07*(i+1);cuboid('Basin tesserae',[uv(a,.07),uv(b,.07),uv(b,.62),uv(a,.62)],-.95,.83-i*.17,0x87aaa0)}
 const waterMaterial=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,uniforms:{deep:{value:new T.Color(0x216e74)},sky:{value:new T.Color(0x92b7ad)}},
 vertexShader:'varying vec3 w;void main(){vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
 fragmentShader:`varying vec3 w;uniform vec3 deep;uniform vec3 sky;${noiseShader}
 void main(){vec2 p=w.xz;float wave=grain(p*vec2(3.,12.)+vec2(0.,grain(p*2.)*1.9));float cr=pow(1.-abs(wave-.52)*1.9,7.);float ripple=sin((p.y*.92+p.x*.20)*48.+5.*grain(p*3.))*0.5+.5;
 vec3 v=normalize(cameraPosition-w);float f=pow(1.-abs(v.y),2.);vec3 col=mix(deep,sky,.14+f*.65+wave*.13);col+=vec3(.059,.087,.083)*cr*ripple;gl_FragColor=vec4(col,.53+f*.27);
 #include <colorspace_fragment>
 }`});
 const film=surface(pool,-.162,waterMaterial,'Translucent celadon water');film.renderOrder=2;
 // A freeform fern border tracks the turn in the hill; a clipped open lawn leads to a tea terrace.
 const northernEdge=[[-17.27,-4.85],[-14.75,-5.55],[-10,-7.07],[-6.7,-8.13],[-3.07,-9.40],[-.5,-7.82],[1.99,-6.24],[5.8,-5.60],[8.6,-5.12],[11.17,-4.79],[13.7,-6.50],[15.93,-7.99]];
 const innerEdge=[[-15.60,-4.20],[-14.42,-3.02],[-10.13,-5.20],[-6.09,-6.72],[-3.94,-7.63],[-.72,-6.69],[1.83,-5.38],[5.74,-5.03],[8.63,-4.66],[11.35,-4.42],[13.95,-5.72],[16.08,-7.36]];
 const eastBed=[[18.21,-2.45],[19.71,-3.88],[21.00,-1.04],[17.22,-1.04],[16.68,-1.46]];
 const bed=[...northernEdge,...innerEdge.slice().reverse()];
 const mulch=mottled(0x5a6347,'mulch-v1','vec2 p=gardenPosition.xz;diffuseColor.rgb*=.74+.55*grain(p*12.);');
 surface(bed,-.074,mulch,'Woodland planting bed');surface(eastBed,-.067,mulch,'Poolside mixed border');
 // Porous gravel court and floating steppers, placed in the lawn rather than through underplanting.
 const tea=[[-13.98,-2.90],[-10.67,-4.26],[-9.58,-1.67],[-12.89,-.47]];
 surface(tea,-.065,mottled(0xb1ab93,'pea-gravel-v1','vec2 p=gardenPosition.xz; diffuseColor.rgb*=.78+grain(p*50.)*.47;'),'Tea garden gravel');
 const stepping=[[-9.76,-2.31],[-8.81,-2.54],[-7.95,-2.76],[-7.05,-3.02],[-6.19,-3.28],[-5.33,-3.54],[-4.46,-3.73]];
 for(const [i,[x,z]] of stepping.entries())cuboid('Stone and timber',rect(x,z,.71,1.03,-.23+Math.sin(i)*.035),-.079,.075,one(PALETTE));
 // Hand-finished teak sun beds, linen squabs, legs, tilted backs, small companion table.
 function chaise(x,z,ang){const xform=([a,b])=>[x+Math.cos(ang)*a-Math.sin(ang)*b,z+Math.sin(ang)*a+Math.cos(ang)*b];const part=(a,b,w,d,y,h,c)=>cuboid('Terrace furniture',rect(a,b,w,d).map(xform),y,h,c);
 for(const a of [-.28,.28])for(const b of [-.75,.75])part(a,b,.075,.095,-.04,.27,0x6d5640);part(0,0,.72,1.9,.19,.095,0x886d4b);
 for(let i=0;i<11;i++)part(0,-.79+i*.134,.70,.11,.287,.034,0x9d7e54);part(0,-.29,.64,1.18,.324,.075,0xddd8c7);
 const a=xform([-.32,.31]),b=xform([.32,.31]),c=xform([.32,.90]),d=xform([-.32,.90]);quad('Terrace furniture',world(d,.77),world(c,.77),world(b,.404),world(a,.404),0xcac4af);quad('Terrace furniture',world(a,.35),world(b,.35),world(c,.705),world(d,.705),0x8c7356)}
 chaise(16.05,-2.91,-.51);chaise(17.31,-3.54,-.51);
 cuboid('Terrace furniture',rect(16.84,-3.01,.39,.39,-.5),-.04,.33,0xbab09a);
 // Low timber lounge bench in the quiet west court.
 for(const a of [-.79,.79])cuboid('Terrace furniture',rect(-12.01+a,-1.88-.38*a,.23,.52,-.38),-.03,.42,0x968c75);
 for(let i=0;i<4;i++)cuboid('Terrace furniture',rect(-12.01-.05*i,-1.69-.125*i,2.04,.092,-.38),.39,.082,0x996f46);
 // Folded lanceolate leaves with individual midribs, plus lower arching grasses and pale granite.
 function rosette(x,z,h,r,blades){
  const tint=one([0x546c49,0x58744d,0x6f8657,0x657d53,0x789366,0x60734b,0x658361]);const turn=rand()*6.28;
  for(let i=0;i<blades;i++){const a=turn+6.28*i/blades+rand()*.37,length=r*(.52+rand()*.62),lift=h*(.63+.44*rand()),width=Math.min(.122,length*(.09+rand()*.13));const dx=Math.cos(a),dz=Math.sin(a),w=[-dz*width,dx*width];const base=[x,-.064,z],mid=[x+dx*length*.55,lift*.81,z+dz*length*.55],tip=[x+dx*length,lift*(.52+.45*rand()),z+dz*length];const l=[mid[0]-w[0],mid[1]-.04,mid[2]-w[1]],rr=[mid[0]+w[0],mid[1]-.04,mid[2]+w[1]];triangle('Garden foliage',base,l,mid,tint,.88);triangle('Garden foliage',base,mid,rr,tint);triangle('Garden foliage',l,tip,mid,tint,.9);triangle('Garden foliage',mid,tip,rr,tint,1.12)}
 }
 const rocks=[];const plantBed=(poly,count,bounds)=>{let i=0;for(let attempts=0;attempts<count*25&&i<count;attempts++){const x=bounds[0]+rand()*(bounds[1]-bounds[0]),z=bounds[2]+rand()*(bounds[3]-bounds[2]);if(!ptIn([x,z],poly))continue;i++;if(i%7===0){rocks.push([x,z,.12+rand()*.25]);continue}const s=.2+rand()*.41;rosette(x,z,s*(.6+rand()*.45),s*.85,6+Math.floor(rand()*7));}};
 plantBed(bed,400,[-17.15,16.06,-9.33,-3.03]);plantBed(eastBed,58,[16.7,21,-3.86,-1.04]);
 const stones=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),material(0xffffff,{flatShading:true}),rocks.length),tmp=new T.Object3D();
 rocks.forEach(([x,z,s],i)=>{tmp.position.set(x,-.061,z);tmp.scale.set(s*1.35,s*.57,s*.83);tmp.rotation.set(rand()*.6,rand()*6.28,rand()*.25);tmp.updateMatrix();stones.setMatrixAt(i,tmp.matrix);stones.setColorAt(i,new T.Color(one([0x999b88,0x929684,0xabaa93,0x969984])))});stones.name='Garden granite';stones.castShadow=stones.receiveShadow=true;site.add(stones);
 for(const [k,{p,c}] of batches){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('color',new T.Float32BufferAttribute(c,3));geo.computeVertexNormals();const mat=material(0xffffff,{vertexColors:true});const m=mesh(geo,mat,k,k!=='Basin tesserae');if(k==='Garden foliage')m.receiveShadow=true}
 addTrees(T,site,canopy);
 // A hidden raycast surface selects the whole exterior without painting over the water.
 const gardenPick=surface([ ...boundary.slice(0,10),[14.9,-2.88],[-4.25,-2.88],...boundary.slice(18)],.065,material(0xffffff),'Garden pick surface');gardenPick.visible=false;
 const outline=new T.LineLoop(new T.BufferGeometry().setFromPoints(pool.map(p=>new T.Vector3(p[0],.065,p[1]))),new T.LineBasicMaterial({color:0x695025}));outline.visible=false;site.add(outline);gardenPick.userData.selectionOutline=outline;return gardenPick;
}
