async page=>{
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 await page.goto('http://127.0.0.1:8766/?check=layout-v3');await page.waitForFunction(()=>!!data);
 await page.locator('#properties-mode').click();await page.locator('#display').click();await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
 let sizes=[];
 for(const size of [{width:375,height:812},{width:768,height:1024},{width:1024,height:768},{width:1366,height:768}]){
  await page.setViewportSize(size);
  const rows=await page.evaluate(async()=>{
   let rows=[];for(const id of ['palmitic-acid','stearic-acid','iodoform']){
    const c=data.compounds.find(x=>x.id===id);round.display=c;renderRound();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    const value=document.querySelector('#value'),box=document.querySelector('#display'),vr=value.getBoundingClientRect(),br=box.getBoundingClientRect();
    const subs=[...value.querySelectorAll('sub')].map(sub=>{const r=sub.getBoundingClientRect();return {text:sub.textContent,inside:r.left>=br.left&&r.right<=br.right&&r.top>=br.top&&r.bottom<=br.bottom,ratio:parseFloat(getComputedStyle(sub).fontSize)/parseFloat(getComputedStyle(value).fontSize)}});
    rows.push({id,text:value.textContent===c.properties,fits:value.scrollWidth<=value.clientWidth+1&&value.scrollHeight<=value.clientHeight+1&&vr.bottom<=br.bottom,subs});
   }return rows;
  });
  assert(rows.every(r=>r.text&&r.fits&&r.subs.length&&r.subs.every(s=>s.inside&&Math.abs(s.ratio-.75)<.01)),JSON.stringify({size,rows}));sizes.push(size);
 }
 await page.evaluate(()=>{baseline={sha:'test',tree:'test',compounds:clone(data.compounds),sets:clone(data.sets),categories:clone(data.categories)}});
 await page.locator('#settings').click();await page.locator('#master-tab').click();await page.locator('#master-rows tr').filter({hasText:'メタノール'}).first().locator('button').click();
 let field=page.locator('#compound-editor .editor-field').filter({hasText:'性質・特徴'});let input=field.locator('input');await input.focus();
 await input.evaluate(el=>{el.value='あ'.repeat(30)+'A';el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertCompositionText',isComposing:true}));});
 assert((await field.textContent()).includes('30.5 / 30'),'Counter during composition');assert(await input.evaluate(el=>el===document.activeElement),'Composition keeps the input and focus');
 await input.evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'A'})));
 await input.fill('あ'.repeat(31));await input.blur();assert((await page.locator('#edit-status').textContent()).includes('30字以内'),'Overflow on blur reports rejection');
 field=page.locator('#compound-editor .editor-field').filter({hasText:'性質・特徴'});assert((await field.textContent()).includes('29 / 30'),'Rejected change restores count');
 await page.evaluate(()=>{baseline=null});
 return {sizes,geometry:true,compositionEvents:true,overflowRejection:true};
}
