import * as T from 'three';

const unit=new T.BoxGeometry(1,1,1),surface=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
function box(g,n,x,y,z,w,h,d,mat){
 const o=new T.Mesh(unit,mat);o.name=n;o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
export function refitGround(g,stock){
 let walnut,ceiling;const obsolete=[];
 g.traverse(o=>{
  if(o.material?.name==='Kitchen_Rich_Walnut')walnut=o.material;
  if(o.material?.name==='Kitchen_Opal_Linear')obsolete.push(o);
 });
 // This material primitive contains the four welded ceiling boxes, including the
 // full deck through the new shaft. Rebuild their measured footprints, rather than
 // concealing the deck from the camera while riding through it.
 g.getObjectByName('SM_UP_OpenFoyer')?.traverse(o=>{if(o.material?.name==='M_CeilingChalk'){ceiling=o.material;obsolete.push(o)}});
 for(const n of ['SM_KG_KitchenWallCabinets','SM_KG_KitchenTallPantry']){const o=g.getObjectByName(n);if(o)obsolete.push(o)}
 for(const o of obsolete)o.removeFromParent();
 const chalk=ceiling||surface(0xd5cbb9);
 for(const [a,b,c,d] of [[.02,4.10,3.055,6.18],[1.86,4.10,6.18,7.4],[-1,.02,5.29,6.32],[-4.16,-.90,3.055,6.28],[2.215,4.015,2.87,3.055]])
  box(g,'Trimmed ground soffit',(a+b)/2,3.425,(c+d)/2,b-a,.15,d-c,chalk);
 const wood=walnut||surface(0x725138),linen=surface(0xb9aa96,.46),steel=surface(0xb3aba0,.34,.65),dark=surface(0x393631,.43,.48),brass=surface(0x9e8059,.38,.68);
 const opal=surface(0xffe0aa);opal.emissive.setHex(0xffc783);opal.emissiveIntensity=.70;
 const k=new T.Group();k.name='Fitted kitchen fittings';g.add(k);
 // Datum-built worktop and plumbing clearances are architecture. Appliances,
 // drawer banks, cupboards and accessories here are actual catalogue meshes.
 const put=(id,name,x,y,z,w,h,d,yaw=0)=>stock.put(k,id,name,x,y,z,w,h,d,yaw);
 for(let i=0;i<3;i++)put('wall-cabinet','Wall-fixed upper cabinet',9.71+.675*i,1.62,6.476,.669,.86,.345,Math.PI);
 box(k,'Rebated underside light',10.385,1.617,6.38,1.91,.008,.016,opal);
 for(let i=0;i<9;i++){if(i===4)continue;put('base-cabinet','Base drawer bank',9.67+i*.598,.002,6.318,.592,.864,.620,Math.PI)}
 box(k,'Oven carcase',12.065,.435,6.33,.592,.86,.61,wood);
 put('oven','Fitted oven',12.062,.17,6.22,.558,.54,.48,Math.PI);
 put('fridge','Counter-depth refrigerator',14.47,.002,4.7,.89,2.18,.65,-Math.PI/2).name='Counter-depth refrigerator';
 // Form the sink opening with four pieces of stone rather than overlaying a bowl.
 const quartz=surface(0xd0c7b8,.37),q=(a,b,c,d)=>box(k,'Honed stone counter',(a+b)/2,.894,(c+d)/2,b-a,.058,d-c,quartz);
 q(9.37,12.98,5.974,6.65);q(13.59,14.77,5.974,6.65);q(12.98,13.59,5.974,6.13);q(12.98,13.59,6.51,6.65);
 box(k,'Stone splashback',12.07,1.238,6.658,5.4,.63,.025,quartz);
 put('sink','Undermount basin and mixer',13.285,.716,6.321,.637,.53,.40,Math.PI);
 put('hob','Flush induction',11.88,.923,6.32,.64,.005,.463,Math.PI);
 put('pan','Saute pan',11.86,.929,6.32,.29,.158,.239);
 put('board','Fitted_Cutting_board',10.79,.926,6.30,.41,.024,.258);
 put('knife','Riveted kitchen knife',10.79,.951,6.30,.033,.013,.267,.18);
 put('knife-block','Knife block',9.70,.923,6.41,.16,.34,.18,.12);
 for(let i=0;i<2;i++)put('spice','Spice jar',10.19+i*.144,.923,6.46,.101,.125,.099);
 put('bowl','Ceramic prep bowl',14.16,.923,6.33,.217,.105,.215);
}
