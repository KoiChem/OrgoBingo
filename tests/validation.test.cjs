const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validate} = require('../validation.js');
const compounds = require('../data/compounds.json');
const sets = require('../data/bingo-sets.json');
const categories = require('../data/categories.json');
const copy = x => structuredClone(x);
test('valid baseline and empty set are accepted', () => {
  assert.doesNotThrow(() => validate(compounds, sets, categories, compounds));
  assert.doesNotThrow(() => validate(compounds, [{id:'empty',name:'空',compoundIds:[]}], categories, compounds));
});
test('master identity, structure, categories and sets are protected', () => {
  for (const mutation of [c=>c.pop(),c=>c[0].id='other',c=>c[0].structureSvg='bad',c=>c[0].tags=['bad'],c=>c[0].nameJa=' ']) {
    const c=copy(compounds); mutation(c); assert.throws(()=>validate(c,sets,categories,compounds));
  }
  for(const bad of [[{id:'a',name:' ',compoundIds:[]}],[{id:'a',name:'x',compoundIds:['unknown']}],[{id:'a',name:'x',compoundIds:['ethanol','ethanol']}],[{id:'a',name:'x',compoundIds:[]},{id:'a',name:'y',compoundIds:[]}]]) assert.throws(()=>validate(compounds,bad,categories,compounds));
});
