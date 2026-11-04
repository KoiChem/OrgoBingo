const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../core.js');
const compounds=require('../data/compounds.json');
const subs=(s,formula=false)=>core.chemicalTokens(s,formula).flatMap(t=>t.subs.map(x=>t.text.slice(x.start,x.end)));

test('formats atom counts and polymer repetition without changing raw text',()=>{
 assert.equal(typeof core.chemicalTokens,'function');
 for(const [text,want] of [['C15H31COOH',['15','31']],['I2',['2']],['C4H4O4',['4','4','4']],['(C2H4)n',['2','4','n']],['(CH3)2CHOH',['3','2']]]) {
  const tokens=core.chemicalTokens(text,true);
  assert.equal(tokens.map(t=>t.text).join(''),text);
  assert.deepEqual(subs(text,true),want,text);
 }
 for(const c of compounds) {
  assert.equal(core.chemicalTokens(c.formula,true).map(t=>t.text).join(''),c.formula,c.id);
  const expected=[...c.formula.matchAll(/\d+/g)].map(match=>match[0]);
  if(c.formula.endsWith(')n')) expected.push('n');
  assert.deepEqual(subs(c.formula,true),expected,c.id);
 }
});

test('identifies formulas conservatively in Japanese free text',()=>{
 assert.deepEqual(subs('C15H31COOH。I2で反応。第1級・2-プロパノール・pH7・C1化合物'),['15','31','2']);
 assert.deepEqual(subs('水はH2O。酢酸はCH3COOH。'),['2','3']);
 assert.deepEqual(subs('ビタミンB12、ビタミンK2'),[]);
});

test('history never cuts a multi-digit atom count into a different number',()=>{
 assert.equal(core.chemicalHistory('あ'.repeat(13)+'C15H31COOH'), 'あ'.repeat(13)+'…');
 assert.equal(core.chemicalHistory('C15H31COOH。油脂を構成する高級飽和脂肪酸。'), 'C15H31COOH。油脂を構…');
 assert.equal(core.chemicalHistory('短い文章'), '短い文章');
});

test('formula recognition handles surrounding and following punctuation',()=>{
 for(const text of ['I2(ヨウ素)','(I2)','(I2を用いる','I2(0.1%)']) assert.deepEqual(subs(text),['2'],text);
 assert.deepEqual(subs('C15H31COOH(高級脂肪酸)'),['15','31']);
});

test('history retains formatting from the whole formula and does not split ordinary numbers',()=>{
 const text='あ'.repeat(12)+'C15H31COOH';
 const tokens=core.chemicalHistoryTokens(text);
 assert.equal(tokens.map(t=>t.text).join(''),'あ'.repeat(12)+'C15…');
 assert.deepEqual(tokens.flatMap(t=>t.subs.map(x=>t.text.slice(x.start,x.end))),['15']);
 assert.equal(core.chemicalHistory('あ'.repeat(14)+'12個'), 'あ'.repeat(14)+'…');
 assert.equal(core.chemicalHistory('あ'.repeat(14)+'１２個'), 'あ'.repeat(14)+'…');
});

test('history does not turn a partially truncated decimal into another value',()=>{
 assert.equal(core.chemicalHistory('この水溶液のpHは常温では約7.4を示す'), 'この水溶液のpHは常温では約…');
 assert.equal(core.chemicalHistory('あ'.repeat(13)+'７．４付近'), 'あ'.repeat(13)+'…');
});
