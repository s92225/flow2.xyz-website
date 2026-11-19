import * as T from 'three';
// Custom low-slung brushed-brass bands and opal diffusers on the fitted orbital pendant suspension.
export function fitDiffusers(scene){
 const brass=new T.MeshStandardMaterial({color:0x98754c,metalness:.77,roughness:.34});
 const opal=new T.MeshStandardMaterial({color:0xe9d9b3,roughness:.66,emissive:0xffdf9d,emissiveIntensity:.43});
 function band(radius,thickness,depth,mat){
  return new T.Mesh(new T.LatheGeometry([[radius-thickness,-depth/2],[radius,-depth/2],[radius,depth/2],[radius-thickness,depth/2],[radius-thickness,-depth/2]].map(q=>new T.Vector2(...q)),96),mat)
 }
 const stem=(a,b,rad)=>{const d=b.clone().sub(a),m=new T.Mesh(new T.CylinderGeometry(rad,rad,d.length(),8),brass);m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());scene.add(m)};
 for(const x of [3.72,12.32]){
  const cap=new T.Mesh(new T.CylinderGeometry(.14,.14,.045,40),brass);cap.position.set(x,3.76,-.02);scene.add(cap);
  for(const [i,r,dy,offset,tilt] of [[0,.79,2.83,-.09,.095],[1,.53,2.995,.18,-.14]]){
   const group=new T.Group();group.position.set(x+offset,dy,-.03);group.rotation.z=tilt;group.rotation.x=i?.11:-.11;
   const rim=band(r,.033,.063,brass),lens=band(r-.006,.021,.010,opal);lens.position.y=-.033;rim.castShadow=true;group.add(rim,lens);scene.add(group);group.updateMatrixWorld();
   for(const ang of [0,2.0944,4.1888]){
    const anchor=group.localToWorld(new T.Vector3((r-.017)*Math.cos(ang),.029,(r-.017)*Math.sin(ang)));stem(anchor,new T.Vector3(x+.10*Math.cos(ang),3.75,-.02+.10*Math.sin(ang)),.0028);
   }
  }
 }
}
