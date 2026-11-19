(() => {
  'use strict';
  const floors = ['地下・共享空間','一樓・私人娛樂','二樓・主人套房'];
  const rooms = [
    [0,'house03-garden-living','客廳','沿窗排座，梳化後方留作通往花園趟門的通道。'],
    [0,'dining','飯廳','六席餐桌放在客廳長軸的另一端。兩區之間不設間牆，拉開餐椅後仍須留位通行。'],
    [0,'kitchen','廚房','工作枱沿牆排列，從廚房門到飯桌不必繞過客廳座席。'],
    [0,'foyer','玄關','從客廳回到玄關後轉向樓梯。這個轉角分開會客區和上樓的路線。'],
    [0,'study','書房','書枱設在主要會客動線以外，工作時不面向穿過客廳的人流。'],
    [0,'garden','庭園','花園入口與客廳相接。趟門打開後，門扇不佔用室內通道。'],
    [0,'pool','泳池','泳池沿庭園邊界斜放，池畔的鋪石位置可回望客廳。'],
    [1,'cinema','私人影院','兩排座位共用一側走道；銀幕兩旁用深色飾面，避開明亮反光。'],
    [1,'wardrobe','衣帽間','燈條藏在兩側木櫃的層架。試行時要繞過中央珠寶島，檢查打開櫃門的位置。'],
    [1,'family','家庭起居室','低身座席沿毯邊排列，閱讀燈照向梳化扶手；由樓梯口入房毋須繞過茶几。'],
    [1,'reading','閱覽室','深木層架前留出雙椅對坐的位置。細圓几和低光源把角落留給閱讀。'],
    [2,'primary','主人套房','軟墊和黃銅收邊集中在床頭；床側通道連接書房與浴室。'],
    [2,'upper-study','主人書房','書桌朝向窗邊，木書架與工作區連成一列。'],
    [2,'upper-dressing','主人更衣室','中央的軟墊長凳留作試鞋，兩側保留通往衣櫃的路。'],
  ];
  const byId = id => document.getElementById(id);
  const buttons = [...document.querySelectorAll('[data-floor]')];
  const list = byId('room-list');
  function selectRoom(index) {
    const [floor, image, title, text] = rooms[index];
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i===floor)));
    byId('floor-name').textContent=floors[floor];
    if(list.dataset.currentFloor!==String(floor)){
      list.dataset.currentFloor=String(floor);
      list.replaceChildren();
      rooms.forEach(([roomFloor,,name],i) => {
        if(roomFloor!==floor)return;
        const button=document.createElement('button');
        button.type='button';button.dataset.index=String(i);button.setAttribute('aria-controls','room-view');
        button.textContent=name;
        const arrow=document.createElement('span');arrow.className='arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='→';button.append(arrow);
        button.addEventListener('click',()=>selectRoom(i));list.append(button);
      });
    }
    [...list.children].forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.index)===index)));
    const img=byId('room-picture');img.alt=title+'的 Unreal 空間模擬';img.src='../media/'+image+'.jpg';
    byId('room-title').textContent=title;byId('room-text').textContent=text;
    byId('figure-count').textContent=String(index+1).padStart(2,'0')+' / '+rooms.length;
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>selectRoom(rooms.findIndex(x=>x[0]===i))));
  selectRoom(0);
})();
