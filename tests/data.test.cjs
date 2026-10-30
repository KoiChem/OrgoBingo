const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const compounds = require('../data/compounds.json');
const sets = require('../data/bingo-sets.json');
const categories = require('../data/categories.json');
test('initial master, structures, vocabularies and sets are consistent', () => {
  assert.equal(compounds.length, 32);
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
  const anhydride=compounds.find(c=>c.id==='maleic-anhydride');
  assert.equal(anhydride.formula,'C4H2O3');
  assert.deepEqual(anhydride.functionalGroups,['酸無水物','炭素間不飽和結合']);
  assert.equal(sets.find(s=>s.id==='oxygenated-aliphatic').compoundIds.at(-1),'maleic-anhydride');
});
test('C1 and C2 structures show every hydrogen as a bonded atom', () => {
  const layouts = require('../tools/structures/layouts.json');
  const targets = compounds.filter(c => /^C(?:H|2H)/.test(c.formula));
  assert.equal(targets.length, 11);
  for (const c of targets) {
    const d = layouts[c.id];
    assert(d.labels.every(n => ['C','H','O','I'].includes(n.text)), c.id);
    const expected = Number(c.formula.match(/H(\d*)/)[1] || 1);
    assert.equal(d.labels.filter(n=>n.text==='H').length, expected, c.id);
    d.labels.forEach((n,i)=>{if(n.text==='H')assert.equal(d.bonds.filter(b=>b[0]===i||b[1]===i).length,1,c.id);});
  }
});
