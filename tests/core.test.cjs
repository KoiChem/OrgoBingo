const {test} = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');
const categories = require('../data/categories.json');
const compounds = require('../data/compounds.json');
test('filter combines OR within axes and AND across axes and keyword', () => {
 const result = core.filterCompounds(compounds, {query:'acid', functionalGroups:['カルボン酸','エーテル'], skeletonCategories:['脂肪族'],tags:['第二級アルコール','cis']});
 assert.deepEqual(result.map(c => c.id),['lactic-acid','maleic-acid']);
});
test('sorting preserves source, stable ties and category order', () => {
 const src=[compounds[18],compounds[17],compounds[19]]; const copy=[...src];
 assert.deepEqual(core.sortCompounds(src,'functionalGroups',categories).map(c=>c.id),['lactic-acid','fumaric-acid','maleic-acid']);
 assert.deepEqual(src,copy);
});
test('shuffle is a permutation for boundary sizes and random choices', () => {
 for(const a of [[],[1],[1,2,3,4]]) for(const v of [0,0.999]) assert.deepEqual(core.shuffle(a,()=>v).sort(),[...a].sort());
 assert.deepEqual(core.shuffle([1,2,3,4],()=>0),[2,3,4,1]);
});
