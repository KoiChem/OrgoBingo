async page => {
 const assert=(v,m)=>{if(!v)throw Error(m)};
 await page.setViewportSize({width:1024,height:768});
 await page.reload();await page.waitForFunction(()=>!!data);
 await page.locator('#properties-mode').click();
 await page.locator('#display').click();await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
 let got=await page.evaluate(()=>({text:document.querySelector('#value').textContent, property:round.display.properties,history:document.querySelector('#history li').textContent}));
 assert(got.text===got.property,'Full current text');
 assert(got.history===[...got.property].slice(0,15).join('')+(Array.from(got.property).length>15?'…':''),'History first 15 characters');
 await page.locator('#name-mode').click();assert(await page.locator('#value').innerText()!==got.text,'Mode switches current item');
 await page.keyboard.press('3');assert(await page.locator('#value').innerText()===got.text,'Keyboard selects properties');
 for(const size of [{width:1024,height:768},{width:375,height:812},{width:768,height:1024}]){
  await page.setViewportSize(size);
  const result=await page.evaluate(async()=>{
   const c=data.compounds.filter(x=>x.properties).sort((a,b)=>[...b.properties].length-[...a.properties].length)[0];round.display=c;renderRound();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const value=document.querySelector('#value'),box=document.querySelector('#display'),v=value.getBoundingClientRect(),b=box.getBoundingClientRect();
   const controls=[...document.querySelectorAll('header button')].filter(x=>!x.hidden).map(x=>x.getBoundingClientRect());
   const overlap=controls.some((a,i)=>controls.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));
   return {text:value.textContent,expected:c.properties,within:v.left>=b.left&&v.right<=b.right&&v.top>=b.top&&v.bottom<=b.bottom,overflow:document.documentElement.scrollWidth>innerWidth,overlap};
  });
  assert(result.text===result.expected&&result.within&&!result.overflow&&!result.overlap,'Full text and layout '+JSON.stringify({size,result}));
 }
 const missing=await page.evaluate(()=>{round.display=data.compounds.find(c=>!c.properties);renderRound();return document.querySelector('#value').textContent});
 assert(missing==='性質・特徴は未登録','Missing text');
 await page.locator('#settings').click();await page.locator('#master-tab').click();await page.locator('#master-rows button').first().click();
 assert(await page.locator('#compound-editor').getByText('性質・特徴',{exact:false}).count()>0,'Editor includes properties');
 await page.locator('#export-master').click();assert(await page.getByText('性質・特徴',{exact:true}).count()>0,'CSV field is selectable');
 return {fullText:true,history15:true,keyboard:true,missing:true,editor:true,csv:true};
}
