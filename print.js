(function(root){
'use strict';
const VERSION='20261030-5';
function pages(items,capacity){
 if(capacity!==20&&capacity!==30)throw new Error('印刷件数が不正です。');
 const result=[];for(let i=0;i<items.length;i+=capacity)result.push(items.slice(i,i+capacity));return result;
}
function selection(items,mode,enabledIds,onlyEnabled){const enabled=new Set(enabledIds);return mode==='set'&&onlyEnabled?items.filter(c=>enabled.has(c.id)):items.slice();}
function open(compounds,options={}){
 const snapshot=compounds.map(c=>({id:c.id,nameJa:String(c.nameJa),structureSvg:String(c.structureSvg)}));
 const enabledIds=[...(options.enabledIds||[])],mode=options.mode==='set'?'set':'master';
 const win=root.open('','_blank');if(!win){root.alert('印刷プレビューを開けません。ポップアップを許可して再試行してください。');return null;}
 const doc=win.document;doc.open();doc.write('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>印刷プレビュー</title></head><body></body></html>');doc.close();
 const css=doc.createElement('link');css.rel='stylesheet';css.href=new URL('print.css?v='+VERSION,root.document.baseURI).href;const cssReady=new Promise(resolve=>{const timer=win.setTimeout(()=>resolve(false),15000);css.onload=()=>{win.clearTimeout(timer);resolve(true);};css.onerror=()=>{win.clearTimeout(timer);resolve(false);};});doc.head.append(css);
 const controls=doc.createElement('header');controls.className='print-controls';
 const title=doc.createElement('h1');title.textContent=String(options.title||'印刷プレビュー');controls.append(title);
 function group(label,choices,onchange){const field=doc.createElement('fieldset'),legend=doc.createElement('legend');legend.textContent=label;field.append(legend);for(const [value,text,checked]of choices){const l=doc.createElement('label'),radio=doc.createElement('input');radio.type='radio';radio.name=label;radio.value=value;radio.checked=checked;radio.onchange=()=>onchange(value);l.append(radio,doc.createTextNode(text));field.append(l);}controls.append(field);}
 let capacity=30,onlyEnabled=true,generation=0;
 group('1ページの件数',[['30','30件（15行×2列）',true],['20','20件（10行×2列・大きめ）',false]],value=>{capacity=Number(value);render();});
 if(mode==='set')group('印刷対象',[['on','抽選ONのみ',true],['all','セット内すべて',false]],value=>{onlyEnabled=value==='on';render();});
 const print=doc.createElement('button');print.textContent='印刷 / PDF保存';print.disabled=true;print.onclick=()=>win.print();
 const close=doc.createElement('button');close.textContent='閉じる';close.onclick=()=>win.close();
 const actions=doc.createElement('div');actions.className='print-actions';actions.append(print,close);controls.append(actions);
 const status=doc.createElement('p');status.setAttribute('role','status');controls.append(status);
 const hint=doc.createElement('p');hint.textContent='A4・縦向き・倍率100%で印刷し、ブラウザのヘッダーとフッターをOFFにしてください。PDFは印刷画面の保存先で選べます。';controls.append(hint);
 const sheets=doc.createElement('main');sheets.className='print-sheets';doc.body.append(controls,sheets);
 async function render(){
  const current=++generation;print.disabled=true;sheets.replaceChildren();doc.body.classList.remove('print-ready');
  const items=selection(snapshot,mode,enabledIds,onlyEnabled);if(!items.length){status.textContent='印刷対象の化合物がありません。';return;}
  status.textContent='構造式を読み込み中…';
  const failures=[];
  const images=await Promise.all(items.map(c=>new Promise(resolve=>{const im=new win.Image();im.alt=c.nameJa+'の構造式';let settled=false;const finish=ok=>{if(settled)return;settled=true;win.clearTimeout(timer);if(!ok)failures.push(c.nameJa);resolve(im);};const timer=win.setTimeout(()=>finish(false),15000);im.onload=()=>finish(true);im.onerror=()=>finish(false);const url=new URL(c.structureSvg,root.document.baseURI);url.searchParams.set('v',VERSION);im.src=url.href;})));
  if(current!==generation||win.closed)return;
  if(failures.length){status.textContent='構造式を読み込めません：'+failures.join('、')+'。プレビューを開き直して再試行してください。';return;}
  let offset=0;for(const chunk of pages(items,capacity)){const sheet=doc.createElement('section');sheet.className='print-sheet';sheet.style.setProperty('--rows',capacity/2);for(const c of chunk){const entry=doc.createElement('div');entry.className='print-entry';const name=doc.createElement('span');name.className='print-name';name.textContent=c.nameJa;entry.append(name,images[offset++]);sheet.append(entry);}sheets.append(sheet);}
  const cssLoaded=await cssReady;await doc.fonts.ready;if(current!==generation||win.closed)return;
  if(!cssLoaded){status.textContent='印刷レイアウトを読み込めません。プレビューを開き直して再試行してください。';sheets.replaceChildren();return;}
  const overflow=[...sheets.querySelectorAll('.print-name')].filter(name=>name.scrollHeight>name.parentElement.clientHeight-8);
  if(overflow.length){status.textContent='名前が枠内に収まりません：'+overflow.map(name=>name.textContent).join('、')+'。20件表示を選ぶか、設定画面で名前を短くしてください。';return;}
  doc.body.classList.add('print-ready');print.disabled=false;status.textContent=items.length+'件 / '+sheets.children.length+'ページ';
 }
 render();return win;
}
const api={open,pages,selection};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrgoPrint=api;
})(typeof window!=='undefined'?window:globalThis);
