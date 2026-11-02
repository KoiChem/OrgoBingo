const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const compounds=require('../data/compounds.json');
const byName=new Map(compounds.map(c=>[c.nameJa,c]));
const expected={
 'メタン':'CH4','エタン':'C2H6','プロパン':'C3H8','ブタン':'C4H10','ペンタン':'C5H12','ヘキサン':'C6H14',
 '2-メチルプロパン':'C4H10','2-メチルブタン':'C5H12','2,3-ジメチルブタン':'C6H14',
 'シクロプロパン':'C3H6','シクロブタン':'C4H8','シクロペンタン':'C5H10','シクロヘキサン':'C6H12',
 'エチレン':'C2H4','プロペン':'C3H6','1-ブテン':'C4H8','シス-2-ブテン':'C4H8','トランス-2-ブテン':'C4H8','2-メチルプロペン':'C4H8','2-ペンテン':'C5H10','1,3-ブタジエン':'C4H6','シクロペンテン':'C5H8','シクロヘキセン':'C6H10',
 'アセチレン':'C2H2','プロピン':'C3H4','1-ブチン':'C4H6','2-ブチン':'C4H6','3-メチル-1-ブチン':'C5H8',
 'クロロメタン':'CH3Cl','ジクロロメタン':'CH2Cl2','トリクロロメタン':'CHCl3','テトラクロロメタン':'CCl4','クロロエタン':'C2H5Cl','1,2-ジクロロエタン':'C2H4Cl2','1,2-ジブロモエタン':'C2H4Br2','1,1,2,2-テトラブロモエタン':'C2H2Br4','塩化ビニル':'C2H3Cl',
 'エタノール':'C2H6O','アセトアルデヒド':'C2H4O','酢酸ビニル':'C4H6O2','ポリエチレン':'(C2H4)n','ポリアセチレン':'(C2H2)n','ベンゼン':'C6H6','アクリロニトリル':'C3H3N'
};
test('all requested substances have the correct formula and occur once',()=>{
 for(const [name,formula] of Object.entries(expected)){
  const matches=compounds.filter(c=>c.nameJa===name);
  assert.equal(matches.length,1,name);assert.equal(matches[0].formula,formula,name);
  assert(fs.existsSync(matches[0].structureSvg),name);
 }
 assert.equal(compounds.length,121);
});
test('C1 and C2 molecules display each hydrogen as a bonded atom',()=>{
 const layouts=require('../tools/structures/layouts.json');
 for(const c of compounds.filter(x=>/^C(?:2(?=[A-Z])|(?=[A-Z]))/.test(x.formula)&&!x.formula.includes('Na'))){
  const d=layouts[c.id];assert(d,c.id);
  assert(d.labels.every(n=>['C','H','O','I','Cl','Br'].includes(n.text)),c.id);
  const expectedH=Number(c.formula.match(/H(\d*)/)?.[1]|| (c.formula.includes('H')?'1':'0'));
  assert.equal(d.labels.filter(n=>n.text==='H').length,expectedH,c.id);
  d.labels.forEach((n,i)=>{if(n.text==='H')assert.equal(d.bonds.filter(b=>b[0]===i||b[1]===i).length,1,c.id);});
 }
});
test('cis and trans 2-butene show opposite stereochemical arrangements',()=>{
 const layouts=require('../tools/structures/layouts.json');
 const side=id=>{const d=layouts[id],bond=d.bonds.find(b=>b[2]===2),[a,b]=bond, p=d.labels[a],q=d.labels[b];const methyls=d.bonds.filter(([i,j])=>(i===a||i===b)&&['H3C','CH3'].includes(d.labels[j].text)).map(([,j])=>d.labels[j]);assert.equal(methyls.length,2,id);return methyls.map(m=>(q.x-p.x)*(m.y-p.y)-(q.y-p.y)*(m.x-p.x));};
 const cis=side('cis-2-butene'),trans=side('trans-2-butene');assert(cis[0]*cis[1]>0);assert(trans[0]*trans[1]<0);
 assert.match(byName.get('2-ペンテン').note,/指定/);
});
test('polymer structures identify connected repeat units',()=>{
 const layouts=require('../tools/structures/layouts.json');
 for(const [id,order,formula] of [['polyethylene',1,'(C2H4)n'],['polyacetylene',2,'(C2H2)n']]){
  const c=compounds.find(x=>x.id===id);assert(c);assert.equal(c.formula,formula);
  const d=layouts[id];assert.equal(d.bonds.filter(b=>b[2]===order).length,1,id);
  assert.equal(d.repeatPorts.length,2,id);assert(fs.readFileSync(c.structureSvg,'utf8').includes('data-repeat-unit'),id);
 }
});
test('acrylonitrile and vinyl acetate retain their distinctive groups',()=>{
 const layouts=require('../tools/structures/layouts.json');
 const a=byName.get('アクリロニトリル'),v=byName.get('酢酸ビニル');
 assert(a.functionalGroups.includes('ニトリル'));assert(a.functionalGroups.includes('炭素間不飽和結合'));
 assert(v.functionalGroups.includes('エステル'));assert(v.functionalGroups.includes('炭素間不飽和結合'));
 assert(layouts[a.id].bonds.some(([i,j,o])=>o===3&&layouts[a.id].labels[j].text==='N'));
});
