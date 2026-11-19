import * as T from 'three';

const unit=new T.BoxGeometry(1,1,1),surface=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
function box(g,n,x,y,z,w,h,d,mat){
 const o=new T.Mesh(unit,mat);o.name=n;o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
export function refitGround(g){
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
 // One carcass from the finish face of the masonry to the back of the doors;
 // visible gables, underside, finger rail and strip are attached, not floating.
 box(k,'Wall-fixed walnut back',10.385,2.067,6.649,2.04,.88,.034,wood);
 for(const y of [1.643,2.491])box(k,'Cabinet deck',10.385,y,6.48,2.04,.032,.36,wood);
 for(const x of [9.377,10.893,11.393])box(k,'Walnut cabinet gable',x,2.067,6.48,.024,.82,.36,wood);
 for(let i=0;i<3;i++){
  const x=9.636+i*.50;box(k,'Satin sand cabinet front',x,2.08,6.303,.494,.835,.022,linen);
  box(k,'Flush bronze edge pull',x,1.669,6.286,.35,.012,.017,brass);
 }
 box(k,'Rebated underside light',10.385,1.624,6.36,1.91,.008,.016,opal);
 box(k,'Open crockery shelf',11.143,2.055,6.48,.482,.022,.347,wood);
 const china=surface(0xe2dfd1,.24),celadon=surface(0x75887c,.31);
 function vessel(n,x,y,z,profile,mat){
  const o=new T.Mesh(new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),48),mat);
  o.name=n;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;k.add(o);
 }
 for(let i=0;i<4;i++)vessel('Stacked porcelain plate',11.15,1.659+.014*i,6.465,[[.001,.002],[.078,.002],[.108,.009],[.122,.018],[.121,.022],[.080,.010],[.001,.009]],china);
 for(let i=0;i<2;i++)vessel('Celadon bowl',11.15,2.066+.035*i,6.475,[[.001,.001],[.039,.001],[.059,.015],[.08,.04],[.089,.068],[.086,.070],[.076,.043],[.055,.023],[.001,.009]],celadon);
 const fridge=new T.Group();fridge.name='Counter-depth refrigerator';k.add(fridge);fridge.position.set(14.777,0,4.70);fridge.rotation.y=-Math.PI/2;
 const b=(...args)=>box(fridge,...args);
 b('Recessed appliance plinth',0,.058,.32,.83,.116,.57,dark);b('Insulated refrigerator body',0,1.066,.318,.89,1.91,.621,dark);
 for(const sign of [-1,1]){
  b('Satin stainless refrigerator door',sign*.219,1.387,.644,.431,1.248,.035,steel);
  b('Solid handle',sign*.041,1.22,.694,.019,.54,.028,dark);
  for(const y of [.963,1.478])b('Handle foot',sign*.041,y,.675,.021,.032,.026,dark);
 }
 b('Freezer drawer',0,.427,.644,.87,.637,.035,steel);b('Freezer pull',0,.70,.679,.52,.018,.036,dark);
 for(const side of [-1,1])b('Tall walnut end panel',side*.463,1.155,.33,.024,2.31,.66,wood);
 b('Appliance bridge cupboard',0,2.181,.34,.904,.29,.65,linen);
 b('Ventilation grille',0,.067,.611,.77,.063,.014,dark);
 for(let i=0;i<3;i++)b('Vent louvre',0,.049+i*.017,.62,.75,.004,.012,steel);
 // A spun-steel saute pan on the actual imported induction glass.
 const pan=new T.Group();pan.name='Saucepan on induction';k.add(pan);pan.position.set(11.85,.9234,6.37);
 const spun=new T.Mesh(new T.LatheGeometry([[.002,.001],[.099,.001],[.117,.012],[.129,.081],[.13,.091],[.125,.092],[.119,.078],[.107,.018],[.002,.018]].map(([x,y])=>new T.Vector2(x,y)),48),steel);pan.add(spun);
 const lid=new T.Mesh(new T.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2),dark);lid.position.y=.091;lid.scale.set(.128,.027,.128);pan.add(lid);
 box(pan,'Lid handle',0,.131,0,.058,.022,.015,brass);
 const handle=box(pan,'Pan handle',.196,.08,0,.182,.021,.028,steel);handle.rotation.z=.09;
 // Back run: independently built joinery, in the same wall datum as the uppers.
 box(k,'Recessed toe kick',12.07,.065,6.35,5.35,.13,.51,dark);
 box(k,'Walnut casework',12.07,.49,6.33,5.40,.72,.60,wood);
 for(let i=0;i<9;i++){const x=9.69+i*.596;if(i===4)continue;for(let j=0;j<2;j++){const y=.32+j*.359;
  box(k,'Fitted base drawer',x,y,6.015,.583,.345,.034,wood);box(k,'Drawer finger pull',x,y+.135,5.990,.28,.013,.022,brass)}}
 // Form the sink opening with four pieces of stone rather than overlaying a bowl.
 const quartz=surface(0xd0c7b8,.37),q=(a,b,c,d)=>box(k,'Honed stone counter',(a+b)/2,.894,(c+d)/2,b-a,.058,d-c,quartz);
 q(9.37,12.98,5.974,6.65);q(13.59,14.77,5.974,6.65);q(12.98,13.59,5.974,6.13);q(12.98,13.59,6.51,6.65);
 box(k,'Stone splashback',12.07,1.238,6.658,5.4,.63,.025,quartz);
 box(k,'Undermount stainless sink bottom',13.285,.773,6.32,.61,.028,.382,steel);
 for(const x of [12.986,13.584])box(k,'Sink return',x,.844,6.32,.012,.148,.38,steel);
 for(const z of [6.138,6.503])box(k,'Sink return',13.285,.844,z,.59,.148,.012,steel);
 const mixer=new T.CatmullRomCurve3([[13.29,.92,6.56],[13.29,1.17,6.56],[13.29,1.245,6.51],[13.29,1.24,6.40],[13.29,1.15,6.36]].map(p=>new T.Vector3(...p)));
 k.add(new T.Mesh(new T.TubeGeometry(mixer,24,.013,10,false),steel));
 box(k,'Oven fascia',12.074,.49,6.009,.583,.69,.045,dark);box(k,'Smoked oven window',12.074,.43,5.982,.495,.40,.014,surface(0x262a2b,.22,.29));box(k,'Oven rail',12.074,.705,5.956,.43,.025,.046,steel);
 for(const x of [11.882,12.265]){const knob=new T.Mesh(new T.CylinderGeometry(.029,.029,.02,24),steel);knob.rotation.x=Math.PI/2;knob.position.set(x,.785,5.971);k.add(knob)}
 box(k,'Induction glass',11.88,.925,6.32,.628,.004,.462,dark);
 for(const x of [11.72,12.03])for(const z of [6.207,6.421]){const o=new T.Mesh(new T.TorusGeometry(.080,.0017,5,40),steel);o.position.set(x,.928,z);o.rotation.x=Math.PI/2;k.add(o)}
 box(k,'Fitted_Cutting_board',10.79,.938,6.30,.41,.024,.258,wood);box(k,'Bread knife',10.80,.955,6.275,.163,.007,.021,steel);box(k,'Riveted handle',10.94,.96,6.275,.107,.014,.023,dark);
 for(let i=0;i<2;i++)vessel('Stoneware seasoning jar',10.27+i*.15,.923,6.47,[[.001,0],[.046,0],[.047,.085],[.037,.098],[.037,.112],[.001,.112]],i?celadon:china);
 const h=new T.CatmullRomCurve3([[13.24,0,-1.44],[13.24,.69,-1.44],[13.24,.76,-1.50],[13.24,.73,-1.61]].map(p=>new T.Vector3(p[0],p[1]+7.95,p[2])));const spout=new T.Mesh(new T.TubeGeometry(h,28,.014,12,false),steel);spout.name='Deck mounted bath filler';g.add(spout);

}