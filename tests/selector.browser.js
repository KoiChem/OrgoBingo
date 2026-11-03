// Run with Playwright MCP browser_run_code_unsafe(filename: "tests/selector.browser.js").
async page => {
 const assert=(value,message)=>{if(!value)throw Error(message)};
 await page.setViewportSize({width:393,height:852});
 await page.reload();await page.waitForFunction(()=>!!data);
 await page.locator('#choose-set').click();
 const choices=page.locator('#choices button');
 assert(await choices.count()>=2,'At least two sets are available');
 assert(await choices.first().getAttribute('aria-pressed')==='true','Current set is identified as selected');
 assert(await choices.nth(1).getAttribute('aria-pressed')==='false','Other set is identified as unselected');
 const styles=await choices.evaluateAll(buttons=>buttons.slice(0,2).map(b=>({background:getComputedStyle(b).backgroundColor,border:getComputedStyle(b).borderColor})));
 assert(styles[0].background!==styles[1].background&&styles[0].border!==styles[1].border,'Selected set is visually distinct');
 assert(await choices.first().locator('[aria-hidden=true]').innerText()==='✓','Selected set has checkmark');
 await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const focus=await choices.first().evaluate(b=>{const list=b.parentElement,r=b.getBoundingClientRect(),p=list.getBoundingClientRect(),s=getComputedStyle(b);const required=parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset);return {left:r.left-p.left,right:p.right-r.right,top:r.top-p.top,bottom:p.bottom-r.bottom,required,visible:b.matches(':focus-visible'),active:b===document.activeElement};});
 assert(focus.visible&&focus.active&&focus.required>=5&&focus.left>=focus.required&&focus.right>=focus.required&&focus.top>=focus.required&&focus.bottom>=focus.required,'Focus ring remains inside scroll area '+JSON.stringify(focus));
 await choices.nth(1).click();
 await page.locator('#choose-set').click();
 assert(await choices.nth(1).getAttribute('aria-pressed')==='true'&&await choices.first().getAttribute('aria-pressed')==='false','Selection updates after switching');
 await page.locator('[data-close=selector]').click();
 await page.locator('#display').click();await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
 await page.locator('#choose-set').click();await page.evaluate(()=>window.confirm=()=>false);
 await choices.first().click();
 assert(await page.locator('#selector').isVisible()&&await choices.nth(1).getAttribute('aria-pressed')==='true','Cancelling a switch preserves the selected set and dialog');
 await page.reload();await page.waitForFunction(()=>!!data);
 await page.evaluate(()=>{for(let i=0;i<20;i++)data.sets.push({...structuredClone(data.sets[0]),id:'test-'+i,name:'長いセット名の確認'.repeat(8)+i});});
 await page.locator('#choose-set').click();await page.keyboard.press('Tab');
 const last=page.locator('#choices button').last();await last.focus();
 const scrollFocus=await last.evaluate(b=>{const list=b.parentElement,r=b.getBoundingClientRect(),p=list.getBoundingClientRect(),s=getComputedStyle(b);return {visible:b.matches(':focus-visible'),bottom:p.bottom-r.bottom,required:parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset),scrolled:list.scrollTop>0,overflow:list.scrollWidth>list.clientWidth};});
 assert(scrollFocus.visible&&scrollFocus.required>=5&&scrollFocus.bottom>=scrollFocus.required&&scrollFocus.scrolled&&!scrollFocus.overflow,'Long scrollable list keeps last focus ring visible '+JSON.stringify(scrollFocus));
 return {selection:true,focus:true,switching:true,cancel:true,longList:true};
}
