async page => {
 await page.setViewportSize({width:1024,height:768});
 await page.reload();await page.waitForFunction(()=>!!data);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const state=()=>page.locator('#value').evaluate(n=>({candidate:n.classList.contains('shuffling'),opacity:getComputedStyle(n).opacity,transform:getComputedStyle(n).transform,color:getComputedStyle(n).color}));
 for(const mode of ['name','structure']){
  await page.locator('#'+mode+'-mode').click();
  await page.locator('#display').click();await page.waitForFunction(()=>round?.shuffling===true);
  let s=await state();if(!s.candidate||s.opacity!=='0.2'||!s.transform.includes('0.95'))throw Error('candidate '+JSON.stringify(s));
  await page.screenshot({path:'docs/structure-review/shuffle-'+mode+'.png'});
  await page.waitForFunction(()=>round&&!round.shuffling&&!busy);
  s=await state();if(s.opacity!=='1'||s.transform!=='none'||s.color!=='rgb(0, 0, 0)')throw Error('final '+JSON.stringify(s));
  if(await page.locator('#history .shuffling').count())throw Error('history style leaked');
 }
 await page.locator('#display').click();await page.waitForFunction(()=>round?.shuffling);
 await page.locator('#name-mode').click();if(!(await state()).candidate)throw Error('mode lost phase');
 await page.evaluate(()=>reset());await page.waitForTimeout(350);
 if((await state()).candidate)throw Error('reset lost phase');
 if(errors.length)throw Error(errors.join('\n'));
 return {modes:2,candidateOpacity:.2,candidateScale:.95,finalBlack:true,reset:true,modeSwitch:true,errors};
}
