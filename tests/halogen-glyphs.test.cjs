const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const compounds=require('../data/compounds.json');
const layouts=require('../tools/structures/layouts.json');
const glyphs=require('../tools/structures/glyphs.json').glyphs;

test('halogen glyphs distinguish iodine with bars and chlorine with a curved l',()=>{
  assert.ok((glyphs.I.path.match(/L/g)||[]).length>=8,'I needs horizontal bars');
  assert.match(glyphs.l.path,/Q/,'l needs a curved foot');
});

test('every chlorine or iodine structure uses the current distinctive glyph outlines',()=>{
  const affected=compounds.filter(c=>layouts[c.id].labels.some(n=>/Cl|I/.test(n.text)));
  assert.ok(affected.some(c=>c.id==='iodoform'));
  assert.ok(affected.some(c=>c.id==='chloromethane'));
  for(const c of affected){
    const svg=fs.readFileSync(c.structureSvg,'utf8');
    for(const label of layouts[c.id].labels){
      if(label.text.includes('Cl'))assert.ok(svg.includes(glyphs.l.path),c.id+' chlorine');
      if(label.text.includes('I'))assert.ok(svg.includes(glyphs.I.path),c.id+' iodine');
    }
  }
});
