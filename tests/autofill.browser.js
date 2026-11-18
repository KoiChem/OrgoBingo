async page => {
 const assert=(v,m)=>{if(!v)throw Error(m);};
 await page.reload();await page.waitForFunction(()=>typeof data!=='undefined'&&data);
 assert(await page.locator('input[type=password]').count()===0,'No credential field during normal operation');
 await page.locator('#settings').click();
 await page.locator('#load-edit').click();await page.waitForFunction(()=>baseline!==null);
 await page.locator('#master-tab').click();await page.locator('#master-rows button').first().click();
 assert(await page.locator('#compound-editor input[type=text],#compound-editor textarea,input[type=search]').evaluateAll(xs=>xs.every(x=>x.autocomplete==='off')),'Normal fields disable autocomplete');
 await page.locator('[name=compound-note]').fill('自動補完テスト');await page.locator('[name=compound-note]').dispatchEvent('change');
 for(const close of ['cancel','escape','empty']){
  await page.locator('#save').click();
  assert(await page.locator('#token').inputValue()==='','New token field is empty');
  assert(await page.locator('#token').evaluate(x=>x.type==='password'&&x.form.id==='token-form'),'Token is masked and isolated in its own form');
  if(close==='empty')await page.locator('#save-confirm').click();
  else {await page.locator('#token').fill('test-only-not-a-token');if(close==='cancel')await page.locator('#save-cancel').click();else await page.keyboard.press('Escape');}
  await page.waitForFunction(()=>!document.getElementById('token'));
 }
 return {noIdlePassword:true,normalAutocompleteOff:true,tokenIsolated:true,cancel:true,escape:true,emptySubmit:true};
}
