// Run with Playwright MCP browser_run_code_unsafe(filename: "tests/settings.browser.js").
// Uses an in-memory editing baseline; GitHub save behavior is tested separately.
async (page) => {
  await page.setViewportSize({width:1024,height:768});
  await page.locator('#settings').click();
  await page.locator('#master-tab').click();
  await page.evaluate(() => {
    baseline={sha:'fixture',tree:'fixture',compounds:structuredClone(data.compounds),sets:structuredClone(data.sets),categories:structuredClone(data.categories)};
    renderSettings();
  });
  await page.locator('#master-rows button').first().click();
  await page.locator('#master-filters summary').first().click();
  await page.locator('#master-filters .choice-buttons label').filter({hasText:'アルコール'}).first().click();
  await page.locator('#master-filters summary').first().click();
  await page.locator('#compound-editor input[type=text]').first().fill('編集確認');
  await page.locator('#compound-editor input[type=text]').nth(1).click();
  const checks=await page.evaluate(() => {
    const assert=(value,message)=>{if(!value)throw Error(message);};
    assert(document.querySelectorAll('#settings-dialog select').length===0,'Visible settings choices');
    assert(document.querySelectorAll('#compound-editor input[type=radio]').length===data.categories.skeletonCategories.length,'Skeleton radio choices');
    assert(filterState.master.functionalGroups.includes('アルコール')&&!filterOpen.master.functionalGroups,'Closed filter preserves selection');
    assert(data.compounds[0].nameJa==='編集確認'&&masterEditing===data.compounds[0].id,'Detail edit and selection preserved');
    const set=findSet(editing),order=[...set.compoundIds],previous=structuredClone(onOff),print=window.OrgoPrint;
    try{
      setActive(set.id,order[0],false);filterState.set.sort='nameJa';filterState.set.query='メタ';renderSettings();
      assert(JSON.stringify(order)===JSON.stringify(set.compoundIds),'Display sorting preserves registered order');
      let result;window.OrgoPrint={open:(items,options)=>result={ids:items.map(c=>c.id),options}};
      document.querySelector('#print-set').click();
      assert(JSON.stringify(result.ids)===JSON.stringify(order),'Print ignores search and sort');
      assert(!result.options.enabledIds.includes(order[0]),'Print preserves enabled selection');
      document.querySelector('#print-master').click();
      assert(result.ids.length===data.compounds.length&&result.options.mode==='master','Print full master');
    }finally{
      window.OrgoPrint=print;onOff=previous;saveOnOff();data.compounds=structuredClone(baseline.compounds);baseline=null;filterState.master.functionalGroups=[];filterState.set.query='';filterState.set.sort='original';renderSettings();
    }
    return 8;
  });
  await page.setViewportSize({width:768,height:1024});
  const geometry=await page.locator('#settings-dialog').evaluate(d=>({dialogWidth:d.offsetWidth,editorWidth:d.querySelector('#compound-editor').offsetWidth,listWidth:d.querySelector('.master-list').offsetWidth,overflow:document.documentElement.scrollWidth>innerWidth}));
  if(geometry.overflow||geometry.editorWidth<340||geometry.listWidth<240)throw Error('Tablet portrait geometry');
  await page.locator('[data-close=settings-dialog]').click();
  return {checks,geometry};
}
