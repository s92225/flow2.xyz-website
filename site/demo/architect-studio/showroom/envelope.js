import * as T from 'three';
import {stairTrim} from './stair-trim.js';
import {fitLiftFronts} from './lift-fronts.js';

// Ancillary window frames were in the fitted shell, but the native blank
// backdrop cards were deliberately omitted. Fit real panes into each rebate.
export function finishEnvelope(scene,fit,rayMeshes,glass){
  const lift=fitLiftFronts(scene,fit,rayMeshes);
  stairTrim(scene);
  const root=new T.Group();root.name='House envelope repairs';scene.add(root);
  const unit=new T.BoxGeometry(1,1,1),pane=glass.clone();
  pane.name='Fixed architectural glazing';pane.opacity=.14;pane.roughness=.13;
  const render=new T.MeshStandardMaterial({color:0xcfc5b3,roughness:.83});
  const bronze=new T.MeshStandardMaterial({color:0x665548,roughness:.47,metalness:.58});
  function member(n,axis,p,a,b,y,t,thick,m){
    const obj=new T.Mesh(unit,m),mid=(a+b)/2;obj.name=n;
    obj.position.set(axis==='x'?p:mid,(y+t)/2,axis==='z'?p:mid);
    obj.scale.set(axis==='x'?thick:b-a,t-y,axis==='z'?thick:b-a);
    obj.castShadow=obj.receiveShadow=m!==pane;root.add(obj);rayMeshes.push(obj);
    return obj;
  }
  const windows=[
    ['Guest north','z',-2.923,[-3.50,-2.62,-1.72,-.84],.027,[[.137,2.553],[2.607,2.873]]],
    ['Guest west','x',-4.239,[-1.55,-.49,.60,1.68],.026,[[.137,2.553],[2.607,2.883]]],
    ['Study','z',6.345,[-4.14,-3.06,-1.98,-.93],.024,[[.99,2.54]]],
    ['Kitchen','z',6.716,[11.80,12.63,13.46],.024,[[1.084,2.256]]]
  ];
  for(const [n,axis,p,stiles,r,rows] of windows){
    for(let i=1;i<stiles.length;i++)for(const [y,t] of rows)
      member(n+' fixed light',axis,p,stiles[i-1]+r,stiles[i]-r,y,t,.012,pane);
    if(n.startsWith('Guest')){
      const a=stiles[0],b=stiles.at(-1);
      member(n+' sill',axis,p,a,b,0,.083,.13,render);
    }
    const a=stiles[0],b=stiles.at(-1);
    fit.barriers.push([n+' fixed window',...(axis==='x'?[p-.055,p+.055,a,b]:[a,b,p-.055,p+.055]),0,3.1]);
  }
  // Close the void between the *different* finished ceiling heights and
  // the upper slab. Follow the setback of the upper footprint at the roof
  // returns; do not extend room walls across an opening, or over the stairs.
  const closures=[
    ['Guest garden soffit','z',-2.65,-4.18,-.05,3.625,4.02],['Guest west soffit','x',-4.18,-2.65,2.94,3.625,4.02],
    ['Study west soffit','x',-4.18,2.94,5.46,3.50,4.02],['Study roof return','z',5.46,-4.18,.12,3.50,4.02],
    ['Kitchen roof return','z',5.46,9.13,14.79,3.40,4.02],['Kitchen west soffit','x',9.13,3.055,5.46,3.40,4.02],
    ['Kitchen east soffit','x',14.79,3.055,5.46,3.40,4.02],['Foyer west return','x',.12,5.46,7.42,3.50,4.02],
    ['Ground stairwell fascia','x',4.063,3.32,7.48,3.35,4.023],
    ['Upper stairwell fascia','x',4.063,3.32,7.48,7.58,7.772],
    ['Foyer rear return','z',7.42,.12,4.1,3.50,4.02],
    ...[['z',-2.65,-4.18,14.79],['x',-4.18,-2.65,5.46],['x',14.79,-2.65,5.46],['z',5.46,-4.18,.12],['z',5.46,7.91,14.79],['x',.12,5.46,7.48],['z',7.48,.12,4.08]].map(row=>['Upper floor edge',...row,7.58,7.95])
  ];
  for(const [n,axis,p,a,b,y,t] of closures)member(n,axis,p,a,b,y,t,.12,render);
  // Exterior sliding track: the parked terrace handle clears the FIXED
  // mullions and the leaf runs outside their plane, not through their faces.
  member('Terrace head rail','z',-3.035,.908,4.14,2.921,2.952,.085,bronze);
  member('Terrace flush sill track','z',-3.035,.908,4.14,-.019,-.003,.078,bronze);
  member('Terrace receiving stop','x',.922,-3.073,-2.933,.012,2.920,.029,bronze);
  fit.barriers.push(['Fixed front entrance and pulls',1.99,4.02,7.13,7.27,0,2.68],
    ['Fixed terrace sidelight track',2.58,4.12,-3.058,-3.012,0,2.92]);
  root.updateWorldMatrix(true,true);return lift;
}
