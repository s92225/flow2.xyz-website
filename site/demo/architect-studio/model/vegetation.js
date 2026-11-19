import data from './planting/small-tree-data.js';

// Instanced web LOD of Poly Haven Tree Small 02. Real trunk, branch and canopy
// coordinates with double-sided textured sprays, not camera-facing sprites.
function bytes(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
function shorts(s){return new Int16Array(bytes(s).buffer)}
let atlas;
function plantGeometry(T){
 const wood=new T.BufferGeometry(), v=shorts(data.wood), rgb=bytes(data.rgb), linear=new Float32Array(rgb.length);
 const col=new T.Color();
 for(let i=0;i<rgb.length;i+=3){col.setRGB(rgb[i]/255,rgb[i+1]/255,rgb[i+2]/255,T.SRGBColorSpace);col.toArray(linear,i)}
 wood.setAttribute('position',new T.BufferAttribute(Float32Array.from(v,x=>x/3000),3));wood.setAttribute('color',new T.BufferAttribute(linear,3));
 wood.setIndex(new T.BufferAttribute(new Uint16Array(bytes(data.ind).buffer),1));wood.computeVertexNormals();
 const sprigs=new T.BufferGeometry(), source=shorts(data.canopy), pos=[],norm=[],uv=[],tint=[],idx=[];
 let seed=80415;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const a=new T.Vector3(),b=new T.Vector3(),n=new T.Vector3(),up=new T.Vector3(0,1,0);
 for(let k=0;k<source.length;k+=7){
  const x=source[k]/3000,y=source[k+1]/3000,z=source[k+2]/3000;
  n.set(source[k+3]/200,source[k+4]/200,source[k+5]/200);if(n.y<0)n.negate();
  n.y+=.11;n.normalize();a.crossVectors(up,n);if(a.lengthSq()<.005)a.set(1,0,0);a.normalize().applyAxisAngle(n,(random()-.5)*2.8);b.crossVectors(n,a);
  const span=.26+.0014*source[k+6]+random()*.10;a.multiplyScalar(span*.52);b.multiplyScalar(span*.64);
  const tile=Math.floor(random()*4),u0=(tile%2)/2,v0=(tile<2?.5:0);
  const shade=.65+(.26*Math.min(1,Math.max(0,(y-1.55)/3)))+random()*.30;
  const tilt=n.clone().lerp(up,.68).normalize();const start=pos.length/3;
  for(const [u,w] of [[0,0],[1,0],[1,1],[0,1]]){
   const aa=u*2-1,bb=w*2-1;
   pos.push(x+aa*a.x+bb*b.x,y+aa*a.y+bb*b.y,z+aa*a.z+bb*b.z);
   norm.push(tilt.x,tilt.y,tilt.z);uv.push(u0+.5*u,v0+.5*w);tint.push(shade,shade*(.99+random()*.035),shade*.92);
  }
  idx.push(start,start+1,start+2,start,start+2,start+3);
 }
 for(const [name,arr,size] of [['position',pos,3],['normal',norm,3],['color',tint,3],['uv',uv,2]])sprigs.setAttribute(name,new T.Float32BufferAttribute(arr,size));
 sprigs.setIndex(idx);return {wood,sprigs};
}
export function addTrees(T,group,positions){
 if(!positions.length)return;
 if(!atlas){atlas=new T.TextureLoader().load(new URL('./planting/leaf-sprays.webp',import.meta.url).href,()=>window.dispatchEvent(new Event('model-material-ready')));atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=4}
 const {wood,sprigs}=plantGeometry(T), woodMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.95});
 const foliageMat=new T.MeshLambertMaterial({map:atlas,vertexColors:true,alphaTest:.17,alphaToCoverage:true,side:T.DoubleSide});
 const skeleton=new T.InstancedMesh(wood,woodMat,positions.length),foliage=new T.InstancedMesh(sprigs,foliageMat,positions.length);
 const obj=new T.Object3D();positions.forEach(([x,z,h],i)=>{
  obj.position.set(x,-.07,z);obj.rotation.y=(i*2.4+.45);const s=h/4.55;obj.scale.set(s*(1+(i%3)*.04),s,s);obj.updateMatrix();
  skeleton.setMatrixAt(i,obj.matrix);foliage.setMatrixAt(i,obj.matrix);
 });
 for(const g of [skeleton,foliage]){g.instanceMatrix.needsUpdate=true;g.receiveShadow=g.castShadow=true;g.computeBoundingSphere();group.add(g)}
}
