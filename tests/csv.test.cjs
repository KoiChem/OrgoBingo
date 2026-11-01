const {test}=require('node:test');const assert=require('node:assert/strict');const {encode}=require('../csv.js');
test('CSV preserves Japanese, commas, quotes and embedded newlines',()=>{assert.equal(encode([['日本語','a,b','a"b','a\nb']]),'\uFEFF"日本語","a,b","a""b","a\nb"\r\n');});
test('CSV neutralizes spreadsheet formulas including whitespace prefixes',()=>{for(const s of ['=1+1',' +1','-1','@SUM(A1)','\t=1'])assert.ok(encode([[s]]).startsWith('\uFEFF"\''));});
