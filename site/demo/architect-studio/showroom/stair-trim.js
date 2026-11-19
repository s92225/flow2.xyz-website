import * as T from 'three';

// A single swept centreline also serves as the height datum for every upright.
// Place the posts at tread centres (never at a mitre) and finish them inside the tube.
export function stairTrim(scene){
 const rail=new T.MeshStandardMaterial({color:0x866d50,metalness:.65,roughness:.36}),g=new T.Group();g.name='Continuous stair ironwork';scene.add(g);
 const path=new T.CurvePath(),post=[],v=(x,y,z)=>new T.Vector3(x,y,z),knots=[v(4.10,.98,3.60),v(4.10,.98,6.19)];
 for(const [y,h] of [[0,4.20],[4.20,3.75]]){
  const r=h/24,H=.98;
  knots.push(v(6.54,y+9*r+H,6.19),v(6.54,y+15*r+H,4.67),v(4.10,y+h+H,4.67),v(4.10,y+h+H,y===0?6.19:7.39));
  for(let i=0;i<9;i++){
   const f=(i+.5)/9;post.push([4.10+2.44*f,6.19,y+(i+1)*r,y+9*r*f+H],
    [6.54-2.44*f,4.67,y+(16+i)*r,y+(15+9*f)*r+H]);
  }
  for(let i=0;i<6;i++){const f=(i+.5)/6;post.push([6.54,6.19-1.52*f,y+(10+i)*r,y+(9+6*f)*r+H])}
 }
 // Fabricated swept elbows at each change of direction, including the intermediate landing.
 let from=knots[0];
 for(let i=1;i<knots.length-1;i++){
  const k=knots[i],a=k.clone().addScaledVector(knots[i-1].clone().sub(k).normalize(),.115),b=k.clone().addScaledVector(knots[i+1].clone().sub(k).normalize(),.115);
  path.add(new T.LineCurve3(from,a));path.add(new T.QuadraticBezierCurve3(a,k,b));from=b;
 }
 path.add(new T.LineCurve3(from,knots.at(-1)));
 const mesh=new T.Mesh(new T.TubeGeometry(path,520,.029,12,false),rail);mesh.name='Seamless bronze return rail';mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);
 for(const p of [knots[0],knots.at(-1)]){const end=new T.Mesh(new T.SphereGeometry(.029,12,8),rail);end.position.copy(p);g.add(end)}
 const pickets=new T.InstancedMesh(new T.CylinderGeometry(.011,.012,1,10),rail,post.length),m=new T.Object3D();
 post.forEach(([x,z,a,b],i)=>{m.position.set(x,(a+b)/2,z);m.scale.set(1,b-a,1);m.updateMatrix();pickets.setMatrixAt(i,m.matrix)});pickets.castShadow=true;g.add(pickets);
}

