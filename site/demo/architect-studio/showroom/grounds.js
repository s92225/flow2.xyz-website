import * as T from 'three';
export function landscapeFinishes(model,sky,refresh,reduce){
 const loader=new T.TextureLoader(),url=n=>new URL(n,import.meta.url).href,ground=loader.load(url('../model/planting/grass-rock.webp'),refresh),pave=loader.load(url('./assets/limestone-normal.webp'),refresh);
 ground.wrapS=ground.wrapT=pave.wrapS=pave.wrapT=T.RepeatWrapping;ground.colorSpace=T.SRGBColorSpace;ground.anisotropy=pave.anisotropy=4;
 const timer={value:0},water=new T.MeshPhysicalMaterial({color:0x78c9be,metalness:.08,roughness:.15,clearcoat:.65,clearcoatRoughness:.12,transparent:true,opacity:.69,depthWrite:false,side:T.DoubleSide});
 water.onBeforeCompile=s=>{
  s.uniforms.houseTime=timer;s.vertexShader='varying vec3 poolP;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\npoolP=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec3 poolP;uniform float houseTime;\n'+s.fragmentShader
  .replace('#include <map_fragment>','#include <map_fragment>\nvec2 p=poolP.xz;float time=houseTime;float u=sin(12.0*p.y+2.43*sin(4.1*p.x+time*.55)+time*.92);float v=sin(16.*p.x+4.*sin(3.5*p.y-time*.38)-time*.71);float w=sin(26.*(p.y+.32*p.x)+u*2.0+time*.65);diffuseColor.rgb*=.74+.11*u+.06*v;diffuseColor.rgb+=vec3(.19,.29,.23)*pow(max(0.,abs(.56*u+.44*v)),8.);')
  .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+mat3(viewMatrix)*vec3(.098*u+.045*w,0.,.098*v+.035*w));');
 };
 function surface(m,grass){m.roughness=grass?.96:.72;m.metalness=0;if(grass){m.map=ground;m.color.set(0xbac3a0)}else{m.normalMap=pave;m.normalScale.set(.3,.3)}
  m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec3 siteP=(modelMatrix*vec4(transformed,1.)).xyz;\n'+(grass?'#ifdef USE_MAP\nvMapUv=siteP.xz/5.8;\n#endif':'#ifdef USE_NORMALMAP\nvNormalMapUv=vec2(siteP.x+.39*siteP.y,siteP.z+.6*siteP.y)/1.3;\n#endif'));};m.customProgramCacheKey=()=>grass?'lawn':'stonework'
 }
 const applied=new Set();model.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m.name==='M_GDN_WaterPlaceholder'){o.material=water;o.castShadow=false;o.renderOrder=3}
  else if(!applied.has(m)){if(m.name==='M_GDN_Lawn')surface(m,true);if(/^M_GDN_Limestone|^M_GDN_Coping|^M_GDN_Wall$/.test(m.name))surface(m,false);applied.add(m)}
 });let last=0;return (ms,zone)=>{if(reduce||zone!=='pool'||ms-last<50)return false;last=ms;timer.value=ms/1000;return true}
}
