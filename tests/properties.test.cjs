const {test}=require('node:test');
const assert=require('node:assert/strict');
const compounds=require('../data/compounds.json');
const sets=require('../data/bingo-sets.json');
const categories=require('../data/categories.json');
const {validate}=require('../validation.js');

test('the 32 supplied compounds have descriptions within the stated 30-character width',()=>{
 const filled=compounds.filter(c=>c.properties);
 assert.equal(filled.length,32);
 assert.equal(compounds.find(c=>c.id==='methanol').properties,'無色・有毒の液体。燃料に利用。酸化でホルムアルデヒド生成。');
 for(const c of filled) assert([...c.properties].reduce((n,ch)=>n+(/[\x00-\x7f\uff61-\uff9f]/u.test(ch)?0.5:1),0)<=30,c.id);
});
test('editable descriptions preserve old records and reject text beyond 30-character width',()=>{
 const copy=structuredClone(compounds); delete copy[0].properties;
 assert.doesNotThrow(()=>validate(copy,sets,categories,compounds));
 copy[0].properties='あ'.repeat(31);
 assert.throws(()=>validate(copy,sets,categories,compounds));
 copy[0].properties='A'.repeat(60);
 assert.doesNotThrow(()=>validate(copy,sets,categories,compounds));
 copy[0].properties='性質\n特徴';
 assert.throws(()=>validate(copy,sets,categories,compounds));
 copy[0].properties=42;
 assert.throws(()=>validate(copy,sets,categories,compounds));
});
