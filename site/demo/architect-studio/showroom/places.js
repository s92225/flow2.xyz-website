export const rooms=[
 ['living',0,'花園客廳','Garden living room',.64,1.08,4.6,-.1],['sitting',0,'起居區','Sitting area',7.45,.55,8.81,-.05],['dining',0,'飯廳','Dining room',10.16,1.94,12.35,-.08],['kitchen',0,'廚房','Kitchen',10.14,3.77,12.26,6.12],['guest',0,'地下客套房','Guest suite',-1.45,-1.92,-2.50,1.78],['foyer',0,'門廳與主樓梯','Entrance & main stair',2.76,6.70,6.85,6.85],['gardenStudy',0,'客層書房','Garden-level study',-1.57,5.64,-3.28,3.81],['terrace',0,'花園露台','Garden terrace',3.01,-4.12,11.6,-2.74],['garden',0,'西花園','West garden',-8.05,-4.70,-12.2,-2.2],['pool',0,'泳池平台','Pool terrace',23.96,-6.41,14.1,-5.65],
 ['landing1',2,'一樓梯廳','First-floor landing',2.85,6.99,1.86,6.73],['family',2,'家庭起居室','Family lounge',3.82,1.29,3.1,-1.75],['cinema',2,'私人影院','Private cinema',-1.03,1.37,-2.04,-2.31],['reading',2,'閱覽室','Reading room',8.36,1.37,9.25,-.70],['salon',2,'女士衣帽間','Dressing salon',12.07,1.30,13.28,-1.23],['westDressing',2,'西翼衣櫃間','West dressing room',-1.13,3.89,-3.55,4.50],['westBath',2,'西翼浴室','West bathroom',.94,4.60,-.36,4.43],['eastDressing',2,'東翼衣櫃間','East dressing room',11.36,3.98,14.05,4.44],['eastBath',2,'東翼浴室','East bathroom',10.07,3.91,8.63,5.13],
 ['landing2',4,'二樓梯廳','Second-floor landing',2.85,6.99,1.86,6.73],['primary',4,'主人睡房','Primary bedroom',5.48,-1.44,7.94,.86],['study',4,'私人書房','Private study',1.24,.73,2.60,-1.71],['wardrobe',4,'主人更衣室','Private dressing room',-.70,-1.36,-3.42,-.35],['mainBath',4,'主人浴室','Primary bathroom',11.89,1.15,13.16,-1.81],['bath2',4,'西側浴室','West en suite',-1.55,3.91,-3.16,5.0],['wardrobe2',4,'南側更衣室','South dressing room',9.11,3.99,13.82,4.47]
].map(([id,l,zh,en,x,z,tx,tz])=>({id,l,zh,en,x,z,tx,tz,pitch:id.startsWith('landing')?-.015:undefined}));
export const byId=Object.fromEntries(rooms.map(r=>[r.id,r]));
export function where({l,x,z}){
 if(l%2)return l===1?'stair1':'stair2';
 if(l===0){
  if(z< -2.91||x>15||x< -4.40)return x>15?'pool':x<-.5?'garden':'terrace';
  if(z>2.97)return x>8.8?'kitchen':x<-.12?'gardenStudy':'foyer';
  return x<-.07?'guest':x>9.66?'dining':x>7.02?'sitting':'living';
 }
 if(z>=1.88&&z<3.4||x>0&&x<4.19&&z>5.45)return l===2?'landing1':'landing2';
 if(l===2){if(z>=3.4)return x<-.36?'westDressing':x<1.88?'westBath':x<7.9?'landing1':x<10.87?'eastBath':'eastDressing';return x<.14?'cinema':x<6.48?'family':x<10.78?'reading':'salon'}
 if(z>=3.4)return x< -1.08?'bath2':x>7.9?'wardrobe2':'landing2';return x<.20?'wardrobe':x<4.20?'study':x<10.76?'primary':'mainBath';
}
