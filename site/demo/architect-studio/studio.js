const dialog=document.querySelector('#drawing-view');
if(dialog && typeof dialog.showModal==='function'){
  let opener;
  for(const trigger of document.querySelectorAll('[data-lightbox]')){
    trigger.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
      event.preventDefault();opener=trigger;dialog.showModal();document.body.classList.add('modal-open');
      document.querySelector('#close-drawing').focus();
    });
  }
  document.querySelector('#close-drawing').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(opener)opener.focus({preventScroll:true})});
}
document.querySelector('#brief-form').addEventListener('submit',e=>{e.preventDefault();let form=e.currentTarget,idea=form.elements.brief.value.trim(),status=document.querySelector('#form-status');if(idea.length<3){form.elements.brief.focus();status.textContent='請先寫低你的設計想法（至少三個字）。';return;}let services=new FormData(form).getAll('service');let data='靜築建築事務所 / Stillform Architects\n設計簡介 · Flow2 本機示範\n\n服務：'+(services.join('、')||'待商議')+'\n項目構想：\n'+idea+'\n\n下一次設計討論：準備可分享的平面圖、房間用途、預期時程及優先事項。\n此簡介尚未寄出。';let url=URL.createObjectURL(new Blob(['\uFEFF'+data],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Stillform-設計簡介.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);status.textContent='設計簡介已產生，可在瀏覽器下載紀錄查看。沒有寄出或上載資料。';});
