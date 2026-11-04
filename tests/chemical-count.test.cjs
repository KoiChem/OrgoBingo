const {test}=require('node:test');
const assert=require('node:assert/strict');
const {propertyLength,validProperties}=require('../validation.js');
test('live counter uses the exact same width rules as the 30-character validator',()=>{
 assert.equal(typeof propertyLength,'function');
 for(const [value,length,ok] of [['',0,true],['あ'.repeat(30),30,true],['あ'.repeat(30)+'A',30.5,false],['C15H31COOH',5,true],['ｱｲ',1,true]]) {
  assert.equal(propertyLength(value),length);
  assert.equal(validProperties(value),ok);
 }
});
