const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const compounds = require('../data/compounds.json');
const sets = require('../data/bingo-sets.json');
const categories = require('../data/categories.json');
test('initial master, structures, vocabularies and sets are consistent', () => {
  assert.equal(compounds.length, 80);
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
  const targets = compounds.filter(c => /^C(?:H|2H)/.test(c.formula) && !c.formula.includes('Na'));
  assert.equal(targets.length, 11);
  for (const c of targets) {
    const d = layouts[c.id];
    assert(d.labels.every(n => ['C','H','O','I'].includes(n.text)), c.id);
    const expected = Number(c.formula.match(/H(\d*)/)[1] || 1);
    assert.equal(d.labels.filter(n=>n.text==='H').length, expected, c.id);
    d.labels.forEach((n,i)=>{if(n.text==='H')assert.equal(d.bonds.filter(b=>b[0]===i||b[1]===i).length,1,c.id);});
  }
});

test('requested aromatic master and sodium salts are included', () => {
  assert.equal(compounds.length,80);
  assert.equal(compounds.filter(c=>c.skeletonCategory==='芳香族').length,47);
  const layouts=require('../tools/structures/layouts.json');
  for(const [id,label] of [['sodium-ethoxide','ONa'],['sodium-phenoxide','ONa'],['sodium-benzenesulfonate','SO3Na'],['sodium-benzoate','ONa'],['sodium-salicylate','ONa']]) {
    assert(compounds.some(c=>c.id===id),id);
    assert(layouts[id].labels.some(n=>n.text===label),id);
  }
  for(const family of ['xylene','dichlorobenzene','cresol']) {
    for(const prefix of ['o','m','p']) assert(compounds.some(c=>c.id===`${prefix}-${family}`));
  }
});

test('aromatic drawing convention uses radial attachments and 2/4 ortho sites',()=>{
 const layouts=require('../tools/structures/layouts.json');
 for(const id of ['o-xylene','o-dichlorobenzene','o-cresol','o-nitrotoluene','phthalic-acid','salicylic-acid','sodium-salicylate','methyl-salicylate','aspirin']) {
  const d=layouts[id], external=d.bonds.filter(([a,b])=>!d.labels[a].text&&d.labels[b].text);
  assert.equal(external.length,2,id);
  const ys=external.map(([a,b])=>{const p=d.labels[a],q=d.labels[b];assert(Math.abs(p.x*q.y-p.y*q.x)<1e-5,id);assert(p.x>0,id);return p.y;});
  assert(ys.some(y=>y<0)&&ys.some(y=>y>0),id);
 }
 assert(layouts['p-xylene'].labels.some(n=>n.text==='H3C'));
});

test('ring inner double lines keep the approved reference proportions',()=>{
 const layouts=require('../tools/structures/layouts.json');
 for(const c of compounds.filter(c=>c.skeletonCategory==='芳香族')) {
  const d=layouts[c.id];
  const lines=[...fs.readFileSync(c.structureSvg,'utf8').matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
  let offset=0;
  for(const [a,b,order] of d.bonds) {
   if(order===2&&!d.labels[a].text&&!d.labels[b].text) {
    const [x,y,X,Y]=lines[offset], [u,v,U,V]=lines[offset+1],length=Math.hypot(X-x,Y-y);
    assert(Math.abs(Math.hypot(U-u,V-v)/length-.76)<.0001,c.id);
    assert(Math.abs(Math.abs((X-x)*(v-y)-(Y-y)*(u-x))/(length*length)-.12)<.0001,c.id);
   }
   offset+=order;
  }
 }
});

test('benzene monosubstituents attach at 2 oclock on a vertical vertex ring',()=>{
 const layouts=require('../tools/structures/layouts.json');
 for(const c of compounds.filter(c=>c.skeletonCategory==='芳香族'&&!['naphthalene','1-naphthol','2-naphthol'].includes(c.id))) {
  const d=layouts[c.id],links=d.bonds.filter(([a,b])=>a<6&&b>=6&&d.labels[b].text);
  if(links.length!==1)continue;
  const [a,b]=links[0],p=d.labels[a],q=d.labels[b];
  assert(p.x>0&&p.y<0,c.id);
  assert(Math.abs(p.y/p.x+1/Math.sqrt(3))<1e-5,c.id);
  assert(d.labels.slice(0,6).some(n=>Math.abs(n.x)<1e-5&&n.y<0),c.id);
  assert(Math.abs(p.x*q.y-p.y*q.x)<1e-5,c.id);
 }
});
test('TNT has methyl and three nitro groups at 2,4,6',()=>{
 const c=compounds.find(c=>c.id==='246-trinitrotoluene');assert(c);
 assert.equal(c.formula,'C7H5N3O6');assert(c.functionalGroups.includes('ニトロ化合物'));
 const d=require('../tools/structures/layouts.json')[c.id];
 const attachments=d.bonds.filter(([a,b])=>a<6&&b>=6).map(([a,b])=>[a,d.labels[b].text]);
 assert.deepEqual(attachments,[[0,'CH3'],[1,'NO2'],[3,'NO2'],[5,'O2N']]);
});
