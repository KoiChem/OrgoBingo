async page => {
 const assert=(v,m)=>{if(!v)throw Error(m)};
 await page.setViewportSize({width:1024,height:768});
 await page.reload(); await page.waitForFunction(()=>!!data);
 const selector=page.locator('#choose-set');
 assert((await selector.innerText()).includes('アルコール～エステル'),'Current set name must be the selector');
 await selector.click(); assert(await page.locator('#selector').isVisible(),'Set selector opens');
 await page.locator('#choices button').nth(1).click();
 assert(!(await selector.innerText()).includes('アルコール～エステル'),'Selected set name updates');
 await page.locator('#display').click(); await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
 const before=await selector.innerText();
 await selector.click();
 await page.evaluate(()=>{window.confirm=()=>false});
 await page.locator('#choices button').first().click();
 assert(await selector.innerText()===before,'Cancelled set switch preserves current set');
 await page.locator('[data-close=selector]').click();
 assert(await page.getByRole('button',{name:'ビンゴセットを選択： '+await page.locator('#set-name').innerText()}).count()===1,'Current set button has an accessible name');
 await page.locator('#structure-mode').click();
 assert(await page.locator('#value img').count()===1,'Structure mode displays a structure');
 assert(await page.locator('#history img').count()===1,'Structure mode updates history');
 await page.locator('#name-mode').click();
 assert(await page.locator('#value img').count()===0,'Name mode displays a name');
 for(const size of [{width:1024,height:768},{width:375,height:812}]){
  await page.setViewportSize(size);
  const geometry=await page.evaluate(()=>{
   const controls=[...document.querySelectorAll('header button')].filter(b=>!b.hidden).map(b=>{const r=b.getBoundingClientRect();return {id:b.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}});
   const collisions=[];for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];if(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y)collisions.push([a.id,b.id]);}
   return {controls,collisions,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!geometry.overflow,'Horizontal overflow '+JSON.stringify(size));
  assert(!geometry.collisions.length,'Overlapping controls '+JSON.stringify(geometry.collisions));
  assert(geometry.controls.every(b=>b.width>=44&&b.height>=44&&b.x>=0&&b.right<=size.width),'Control target geometry '+JSON.stringify(geometry.controls));
 }
 await page.locator('#settings').click();assert(await page.locator('#settings-dialog').isVisible(),'Settings opens');await page.locator('[data-close=settings-dialog]').click();
 return {setSelector:true,cancelPreservesRound:true,modesAndHistory:true,settings:true,sizes:['1024x768','375x812']};
}
