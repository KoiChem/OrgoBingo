(function(root) {
 function validate(compounds, sets, categories, baseline) {
  const fail = () => {throw new Error('データ形式が正しくありません。');};
  if (!Array.isArray(compounds) || !Array.isArray(sets) || !categories || !Array.isArray(baseline)) fail();
  for (const key of ['functionalGroups','skeletonCategories','tags']) if (!Array.isArray(categories[key]) || !categories[key].every(x=>typeof x==='string')) fail();
  const base = new Map(baseline.map(c=>[c.id,c]));
  if(base.size!==baseline.length || compounds.length!==baseline.length) fail();
  const ids = new Set();
  for(const c of compounds) {
   if(!c || typeof c.id!=='string' || ids.has(c.id) || !base.has(c.id) || c.structureSvg!==base.get(c.id).structureSvg) fail();
   ids.add(c.id);
   for(const key of ['nameJa','nameEn','formula','note']) if(typeof c[key]!=='string') fail();
   if(!c.nameJa.trim() || !categories.skeletonCategories.includes(c.skeletonCategory)) fail();
   for(const key of ['functionalGroups','tags']) if(!Array.isArray(c[key]) || new Set(c[key]).size!==c[key].length || !c[key].every(x=>categories[key].includes(x))) fail();
  }
  const setIds = new Set();
  for(const s of sets) {
   if(!s || typeof s.id!=='string' || !s.id || setIds.has(s.id) || typeof s.name!=='string' || !s.name.trim() || !Array.isArray(s.compoundIds) || new Set(s.compoundIds).size!==s.compoundIds.length || !s.compoundIds.every(id=>ids.has(id))) fail();
   setIds.add(s.id);
  }
 }
 const api={validate}; if(typeof module!=='undefined') module.exports=api; else root.OrgoValidation=api;
})(globalThis);
