import * as T from 'three';
import {refitGround} from './joinery.js';
import {dressWing,correctedFit} from './finishing.js';
const file=n=>new URL('./assets/'+n,import.meta.url).href;
function useBounce(m,maps,fixed,textile,oak){
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 roomP;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nroomP=(modelMatrix*vec4(transformed,1.)).xyz;'+(textile?'\n#ifdef USE_MAP\nvMapUv=roomP.xz/.82;\n#endif\n#ifdef USE_NORMALMAP\nvNormalMapUv=roomP.xz/.82;\n#endif\n':''));
 // Sample grain per *fragment*: board offsets in a vertex shader interpolate
 // through neighbouring boards. Metre UVs run along the boards' long axis.
 if(oak)s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`float row=floor(roomP.z/.193+0.0001);vec2 oakUV=vec2(roomP.z/1.21+fract(sin(row*12.91)*298.41),roomP.x/2.40+fract(sin(row*3.71)*127.18));diffuseColor*=texture2D(map,oakUV);`);
 const anchor=oak?'diffuseColor*=texture2D(map,oakUV);':'#include <map_fragment>';
 s.uniforms.bounce={value:maps[fixed]};
 s.fragmentShader='varying vec3 roomP;uniform sampler2D bounce;\n'+s.fragmentShader.replace(anchor,anchor+`
 vec2 uvLight=clamp(vec2((roomP.x+4.35)/19.30,(7.55-roomP.z)/10.50),vec2(.001),vec2(.999));
 vec3 lightSample=texture2D(bounce,uvLight).rgb;
 float floorMask=1.-smoothstep(.02,.40,abs(roomP.y-${[0,4.20,7.95][fixed].toFixed(2)}));
 vec3 wingBounce=.37+1.24*lightSample;
 ${fixed?`// Floor-plan irradiance is not a wall texture. Never project it up the skirting.
 vec3 face=cross(dFdx(roomP),dFdy(roomP));floorMask*=smoothstep(.72,.96,abs(face.y)/max(length(face),1e-12));
 float hall=smoothstep(1.68,2.02,roomP.z)*(1.-smoothstep(4.16,4.54,roomP.x)*smoothstep(3.16,3.51,roomP.z))*smoothstep(-.35,.12,roomP.x);
 wingBounce=mix(wingBounce,vec3(.79)+.53*textureLod(bounce,uvLight,4.).rgb,hall);`:''}
 diffuseColor.rgb*=mix(vec3(1.),wingBounce,floorMask);`)};
 m.customProgramCacheKey=()=>'fitroom-v2-'+fixed+':'+textile+':'+oak
}
export async function wings({scene,loader,kit,glass,rayMeshes,render,updateShadow,rug,rugBump}){
 const sets={},jobs={},mirrors=[],tex=new T.TextureLoader();
 const [maps,fit,oakMap]=await Promise.all([Promise.all([0,1,2].map(i=>tex.loadAsync(file('bounce-'+i+'.webp')))),fetch(file('floor-fit.json')).then(r=>{if(!r.ok)throw Error('House floor data');return r.json()}),tex.loadAsync(file('upper-oak.webp'))]);
 oakMap.colorSpace=T.SRGBColorSpace;oakMap.wrapS=oakMap.wrapT=T.RepeatWrapping;
 function load(key){
  if(jobs[key])return jobs[key];
  jobs[key]=loader.loadAsync(file(key+'.glb')).then(async({scene:group})=>{
   kit.place(key,group,scene);if(key==='ground')refitGround(group);
   group.name='House / '+key;scene.add(group);group.updateWorldMatrix(true,true);
   dressWing(key,group,scene,render,{stone:new T.MeshStandardMaterial({color:0xbba990,roughness:.6})});group.updateWorldMatrix(true,true);const saved=new Map();
   group.traverse(o=>{
    if(!o.isMesh)return;if(o.isReflector){mirrors.push(o);rayMeshes.push(o);return}
    let f=key==='second'?2:key==='first'?1:0;
    if(key==='shell'){let n=o;while(n){if(n.name==='SM_UP_FirstFloor'){f=1;break}if(n.name==='SM_UP_SecondFloor'){f=2;break}n=n.parent}}
    let mat=o.material;const name=mat.name||'';let textile=false;for(let n=o;n&&n!==group;n=n.parent){if(/rug|runner/i.test(n.name)){textile=true;break}}
    if(mat.isMeshBasicMaterial){rayMeshes.push(o);o.userData.wing=key;return}
    
    if(/GlassMarker|GlazingMarker/.test(name))mat=glass;
    else{const tag=mat.uuid+':'+f+':'+textile;if(!saved.has(tag)){
     const v=mat.clone();
     if(textile){v.color.set(0xd6c9b4);v.roughness=.99;v.metalness=0;v.metalnessMap=v.roughnessMap=null;v.map=rug;v.normalMap=rugBump;v.normalScale.set(.23,.23)}
     if(/bathtub_Baked/.test(name)){v.color.set(0xe4d8c3);v.metalness=.12;v.metalnessMap=null;v.roughness=.29}

     if(/Projection/i.test(name)){v.emissive=new T.Color(0xffffff);v.emissiveMap=v.map;v.emissiveIntensity=.76;v.roughness=.95}
     if(/Glass|Mirror/i.test(name)&&!(/Smoked|Bottle|Perfume/.test(name))){v.roughness=Math.max(.11,Math.min(v.roughness,.38))}
     if(/Rug|Weave|Felt|Wool|Linen|Velvet/i.test(name)){v.metalness=0;v.roughness=Math.max(v.roughness,.83)}
     if(/SilverWoven|Material\.005/.test(name)&&o.parent?.name?.includes('Rug')){v.metalness=0;v.roughness=.97;v.normalScale?.set(.13,.13)}
     const oak=f>0&&/^M_Oak\d+$/.test(name);
     if(oak){v.map=oakMap;v.normalMap=v.roughnessMap=v.metalnessMap=null;v.roughness=.66;v.metalness=0}
     useBounce(v,maps,f,textile,oak);saved.set(tag,v)
    }mat=saved.get(tag)}
    o.material=mat;o.castShadow=mat!==glass;o.receiveShadow=mat!==glass;
    o.userData.wing=key;rayMeshes.push(o)
   });
   if(key==='ground'){
    // The envelope remains separately addressable for architectural checks.
    const envelope=new T.Group();envelope.name='Permanent ground-floor shell';scene.add(envelope);
    for(const n of ['SM_KG_NewRooms','SM_UP_OpenFoyer']){const o=group.getObjectByName(n);if(o)envelope.attach(o)}
   }
   sets[key]=group;updateShadow();render();return group
  }).catch(e=>{delete jobs[key];throw e});return jobs[key]
 }
 await Promise.all([load('shell'),load('ground')]);
 // A small fixed light rig follows the occupied room; no dozens of per-fixture point lights on phones.
 const lights=Array.from({length:3},()=>{const a=new T.PointLight(0xffe4be,0,5,2);scene.add(a);return a});
 const landingLights=[[1.10,6.61,2.64,5,0xffefd9],[3.2,3.99,2.81,4,0xffebd4]];
 const looks={
  landing1:landingLights,landing2:landingLights,
  cinema:[[-.7,.80,2.55,8,0xffad65],[-3.75,-.40,2.13,6,0xf8ba77],[-2.01,-2.04,1.58,8,0xa6bdff]],
  salon:[[12.97,-.46,2.8,16,0xffdfab],[11.57,-.65,1.65,4,0xffcb9c],[14.0,.52,1.80,4,0xffcd99]],
  primary:[[6.46,1.09,1.18,4,0xffcb91],[9.30,1.07,1.2,4,0xffcb91],[7.6,-.3,2.65,9,0xffead7]],
  guest:[[-3.8,2.3,1.1,3,0xffcea2],[-1.2,2.3,1.1,3,0xffcea2],[-2,-.52,2.72,8,0xffe4c6]],
  kitchen:[[10.37,6.01,1.61,4,0xffcf9b],[12.75,5.22,2.80,10,0xffe6c9],[10.4,3.88,2.84,6,0xffefd8]],
  reading:[[9.12,-1.75,1.4,4,0xffca95],[8.3,.61,2.6,9,0xffe7d1]],family:[[1.28,-1.70,1.22,4,0xffd19c],[3.48,.60,2.68,9,0xffe4c3]]
 };
 let last='';
 function activate(f,zone,p){
  const signature=f+zone;if(last===signature)return;last=signature;
  // Start on the approach, before the stairs reveal either storey. Once
  // loaded the wings stay in the building; the camera frustum still culls meshes.
  if(zone==='foyer'||zone.startsWith('landing'))ensure(1).catch(()=>{}); // entry gate handles retries
  for(const mirror of mirrors)mirror.visible=mirror.userData.mirrorRoom===zone;
  const baseline=[0,4.2,7.95][f],fallback=f||['gardenStudy','foyer'].includes(zone)?[[p.x,p.z,2.62,8,0xffe8cf]]:[];
  const spec=zone.startsWith('stair')?[[6.60,5.60,2.80,13,0xffd6b1],[3,5.6,2.8,6,0xffecd0]]:(looks[zone]||fallback);
  lights.forEach((o,i)=>{const a=spec[i];o.intensity=a?a[3]:0;if(a){o.position.set(a[0],baseline+a[2],a[1]);o.color.setHex(a[4])}});updateShadow();render()
 }
 const ready=l=>l===0||!!(sets.first&&sets.second);
 const ensure=l=>l===0?Promise.resolve():Promise.all([load('first'),load('second')]);
 return {fit:correctedFit(fit),activate,ready,ensure}
}
