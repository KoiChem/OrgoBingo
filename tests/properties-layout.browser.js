async page=>{
 const assert=(x,m)=>{if(!x)throw Error(m)};
 await page.goto('http://127.0.0.1:8765/');await page.waitForFunction(()=>!!data);
 await page.locator('#properties-mode').click();await page.locator('#display').click();await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
 let records=[];
 for(const size of [{width:375,height:812},{width:768,height:1024},{width:1024,height:768}]){
  await page.setViewportSize(size);
  const results=await page.evaluate(async()=>{
   let all=[];for(const c of [...data.compounds.filter(x=>x.properties),{id:'test',nameJa:'test',properties:'A'.repeat(60)}]){
    round.display=c;renderRound();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    let v=document.querySelector('#value'),b=document.querySelector('#display'),p=document.querySelector('#progress'),vr=v.getBoundingClientRect(),br=b.getBoundingClientRect(),pr=p.getBoundingClientRect();
    all.push({id:c.id,font:parseFloat(getComputedStyle(v).fontSize),fits:v.scrollWidth<=v.clientWidth+1&&v.scrollHeight<=v.clientHeight+1&&vr.top>=br.top&&vr.bottom<=br.bottom&&vr.bottom<=pr.top,text:v.textContent===c.properties});
   }return all;
  });
  assert(results.every(r=>r.fits&&r.text&&r.font>=14),JSON.stringify({size,failed:results.filter(r=>!r.fits||!r.text||r.font<14)}));records.push({size,count:results.length,minFont:Math.min(...results.map(r=>r.font))});
 }
 await page.evaluate(()=>{baseline={sha:'test',tree:'test',compounds:clone(data.compounds),sets:clone(data.sets),categories:clone(data.categories)}});
 await page.locator('#settings').click();await page.locator('#master-tab').click();await page.locator('#master-rows button').first().click();
 let field=page.locator('#compound-editor label').filter({hasText:'性質・特徴'}).locator('input');await field.fill('あ'.repeat(31));await field.blur();
 assert((await page.locator('#edit-status').innerText()).includes('30字以内'),'Reject too long on edit');assert(await page.evaluate(()=>data.compounds[0].properties!=='あ'.repeat(31)),'Overlong text must not be used in a round');
 field=page.locator('#compound-editor label').filter({hasText:'性質・特徴'}).locator('input');await field.fill('検証用の性質');await field.blur();await page.locator('#save').click();
 assert((await page.locator('#diff').innerText()).includes('性質・特徴'),'Save preview includes field');await page.locator('#save-cancel').click();
 await page.locator('#export-master').click();await page.getByText('選択を解除',{exact:true}).click();await page.locator('label').filter({hasText:'性質・特徴'}).last().locator('input').check();
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'CSVをダウンロード'}).click()]);
 const stream=await download.createReadStream();let chunks=[];for await(const c of stream)chunks.push(c);const csv=Buffer.concat(chunks).toString('utf8');
 assert(csv.includes('性質・特徴')&&csv.includes('検証用の性質'),'CSV exports edited data');
 return {records,editorValidation:true,savePreview:true,csvEditedValue:true};
}
