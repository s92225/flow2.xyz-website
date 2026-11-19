/* Walkable surfaces in house coordinates (metres). The U flights have their own layers:
   the same plan point may be a stair on the way up, a room above it or a room below it. */
export const floors=[0,4.2,7.95],eye=1.50;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),rect=(x,z,a,b,c,d)=>x>=a&&x<=b&&z>=c&&z<=d;
const point=(x,z,p)=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [a,b]=p[i],[c,d]=p[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside}return inside};
const segDist=(x,z,a,b,c,d)=>{const u=clamp(((x-a)*(c-a)+(z-b)*(d-b))/((c-a)**2+(d-b)**2),0,1);return Math.hypot(x-a-u*(c-a),z-b-u*(d-b))};
export function surface(l,x,z){
 if(!(l%2))return floors[l/2];
 let n;if(z>=6.18)n=9*clamp((x-4.10)/2.43,0,1);
 else if(z<=4.68)n=15+9*clamp((6.53-x)/2.43,0,1);
 else n=9+6*(6.18-z)/1.50;
 const f=(l-1)/2;return floors[f]+(floors[f+1]-floors[f])*n/24
}
export function makeNavigation(fit,lounge){
 const {garden}=fit,bar=[[],[],[]],pad=.145;
 for(const [name,a,b,c,d,y,h] of fit.barriers){
  for(let f=0;f<3;f++)if(h>floors[f]+.085 && y<floors[f]+1.47)bar[f].push([a,b,c,d])
 }
 bar[0].push(...lounge,[-12.95,-11.05,-2.48,-1.29],[15.36,16.73,-3.78,-2.05],[16.65,17.98,-4.30,-2.68]);
 const block=(f,x,z)=>bar[f].some(([a,b,c,d])=>x>a-pad&&x<b+pad&&z>c-pad&&z<d+pad);
 const stair=(x,z)=>rect(x,z,3.90,7.68,6.37,7.25)||rect(x,z,6.71,7.68,3.60,7.25)||rect(x,z,3.90,7.68,3.60,4.49);
 const pool=garden.pool,outer=garden.pool_outer;
 const ground=(x,z,open)=>{
  if(!open&&rect(x,z,.80,2.66,-3.035-.17,-3.035+.17))return false;
  if(rect(x,z,.15,14.64,-2.66,2.70)||rect(x,z,-4.02,-.22,-2.68,2.70)||rect(x,z,-.25,.19,2.10,2.65))return true;
  if(rect(x,z,2.39,3.84,2.67,3.29)||rect(x,z,9.98,10.42,2.67,3.32)||rect(x,z,9.36,14.61,3.22,6.48))return true;
  if(rect(x,z,.31,4.13,3.19,7.23)||rect(x,z,-4.00,-1.16,3.23,6.10)||rect(x,z,-1.20,.35,5.48,6.11))return true;
  if(open&&rect(x,z,1.14,2.31,-3.43,-2.59))return true;
  if(!(z< -3.08||x< -4.51||x>15.03))return false;
  if(!point(x,z,garden.outline)&&!point(x,z,outer))return false;
  if(point(x,z,pool)||pool.some(([a,b],i)=>segDist(x,z,a,b,...pool[(i+1)%4])<.16))return false;
  if(garden.wall_segments.some(([[a,b],[c,d]],i)=>!(i>=4&&i<=6)&&segDist(x,z,a,b,c,d)<.22))return false;
  return true
 };
 function inside(l,x,z,open){if(l%2)return stair(x,z);
  const f=l/2;if(!f){if(!ground(x,z,open))return false}else{
   if(!(rect(x,z,-3.98,14.58,-2.44,3.28)||rect(x,z,-3.98,4.12,3.18,5.35)||rect(x,z,8.05,14.58,3.18,5.35)||rect(x,z,.29,4.12,5.19,7.26)))return false
  }return !block(f,x,z)
 }
 function links(l,x,z){
  if(x<3.885||x>4.145)return [];
  const low=z>=6.38&&z<=7.24,high=z>=3.61&&z<=4.48;if(!(low||high))return [];
  if(l%2)return [low?l-1:l+1];
  return (low&&l<4)?[l+1]:(high&&l>0)?[l-1]:[]
 }
 function line(a,b,open=true){if(a.l!==b.l)return false;const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.062));for(let i=1;i<=n;i++)if(!inside(a.l,a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,open))return false;return true}
 function manual(a,x,z,open){let b={l:a.l,x,z};if(line(a,b,open))return b;
  for(const l of links(a.l,a.x,a.z)){const p={...a,l};b={x,z,l};if(line(p,b,open))return b}
  return a
 }
 const S=.145,X=-18.43,Y=-12.29,C=306,R=140,N=C*R,total=N*5,cache=[];
 const key=(l,ix,iz)=>l*N+iz*C+ix,coord=k=>({x:X+(k%N%C)*S,z:Y+Math.floor(k%N/C)*S,l:Math.floor(k/N)});
 function grid(open){
  const tag=+open;if(cache[tag])return cache[tag];const valid=new Uint8Array(total);
  for(let l=0;l<5;l++)for(let j=0;j<R;j++)for(let i=0;i<C;i++){let x=X+i*S,z=Y+j*S;if(l%2 && ((x<3.88||x>7.7)||(z<3.59||z>7.27)))continue;valid[key(l,i,j)]=+inside(l,x,z,open)}
  cache[tag]=valid;return valid
 }
 const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
 function path(a,b,open=true){
  if(!inside(b.l,b.x,b.z,open))return null;if(line(a,b,open))return [b];
  const valid=grid(open);
  function snap(p){let k=-1,dmin=.38;const cx=Math.round((p.x-X)/S),cz=Math.round((p.z-Y)/S);for(let i=cx-2;i<=cx+2;i++)for(let j=cz-2;j<=cz+2;j++){
   const n=key(p.l,i,j);if(i<0||i>=C||j<0||j>=R||!valid[n])continue;const v=coord(n),d=Math.hypot(v.x-p.x,v.z-p.z);if(d<dmin&&line(p,v,open)){k=n;dmin=d}
  }return k}
  const start=snap(a),end=snap(b);if(start<0||end<0)return null;
  const prev=new Int32Array(total).fill(-1),q=new Int32Array(total);prev[start]=start;q[0]=start;let count=1;
  for(let h=0;h<count&&prev[end]===-1;h++){
   const k=q[h],v=coord(k),i=k%N%C,j=Math.floor(k%N/C);
   for(const [u,w] of neighbors){const ii=i+u,jj=j+w,t=k+u+w*C;if(ii<0||ii>=C||jj<0||jj>=R||!valid[t]||prev[t]!==-1||(u&&w&&(!valid[k+u]||!valid[k+w*C])))continue;
    prev[t]=k;q[count++]=t}
   for(const l of links(v.l,v.x,v.z)){const n=k+(l-v.l)*N;if(valid[n]&&prev[n]===-1){prev[n]=k;q[count++]=n}}
  }
  if(prev[end]===-1)return null;let points=[b];for(let k=end;k!==start;k=prev[k])points.push(coord(k));points.push(coord(start),a);points.reverse();
  const sm=[];for(let i=0;i<points.length-1;){let j=i+1;if(points[i].l===points[j].l){while(j+1<points.length&&points[j+1].l===points[i].l&&line(points[i],points[j+1],open))j++}sm.push(points[j]);i=j}return sm
 }
 return {inside,path,manual,line,surface};
}
