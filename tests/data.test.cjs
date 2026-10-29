const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const compounds = require('../data/compounds.json');
const sets = require('../data/bingo-sets.json');
const categories = require('../data/categories.json');
test('initial master, structures, vocabularies and sets are consistent', () => {
  assert.equal(compounds.length, 31);
  const ids = new Set(compounds.map(c => c.id));
  assert.equal(ids.size, compounds.length);
  for (const c of compounds) {
    assert(fs.existsSync(c.structureSvg));
    assert(c.functionalGroups.every(x => categories.functionalGroups.includes(x)));
    assert(categories.skeletonCategories.includes(c.skeletonCategory));
    assert(c.tags.every(x => categories.tags.includes(x)));
  }
  for (const s of sets) {
    assert.equal(new Set(s.compoundIds).size, s.compoundIds.length);
    assert(s.compoundIds.every(id => ids.has(id)));
  }
  for (const id of ['fumaric-acid','maleic-acid']) assert(compounds.find(c => c.id === id).functionalGroups.includes('炭素間不飽和結合'));
  assert(compounds.find(c => c.id === 'lactic-acid').tags.includes('第二級アルコール'));
});
