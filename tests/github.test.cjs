const {test} = require('node:test');
const assert = require('node:assert/strict');
const {save,checkResult} = require('../github.js');
const baseline={sha:'base',tree:'tree',compounds:[{id:'a'}],sets:[]};
function mock({head='base',patchError=false,contains=false}={}) {
 const calls=[];
 const request=async (path, options={})=>{ calls.push([path,options]);
  if(path==='/git/ref/heads/main') return {object:{sha:head}};
  if(path==='/git/blobs') return {sha:'blob'};
  if(path==='/git/trees') return {sha:'newtree'};
  if(path==='/git/commits') return {sha:'newcommit'};
  if(path==='/git/refs/heads/main' && options.method==='PATCH') {if(patchError) throw new Error('network'); return {};}
  if(path.startsWith('/compare/')) return {status: contains ? 'ahead' : 'diverged'};
  throw Error(path);
 }; return {calls,request};
}
test('two files save in one commit based on baseline with fast forward', async()=>{
 const m=mock(); const r=await save(m.request,baseline,{compounds:[{id:'b'}],sets:[{id:'s'}]});
 assert.equal(r.sha,'newcommit');
 const tree=JSON.parse(m.calls.find(x=>x[0]==='/git/trees')[1].body); assert.equal(tree.base_tree,'tree'); assert.equal(tree.tree.length,2);
 const commit=JSON.parse(m.calls.find(x=>x[0]==='/git/commits')[1].body); assert.deepEqual(commit.parents,['base']);
 const ref=JSON.parse(m.calls.find(x=>x[0]==='/git/refs/heads/main')[1].body); assert.equal(ref.force,false);
});
test('changed head refuses before write',async()=>{const m=mock({head:'other'});await assert.rejects(save(m.request,baseline,{compounds:[1],sets:[]}),/競合/); assert.equal(m.calls.length,1);});
test('lost update response preserves commit for checking',async()=>{const m=mock({patchError:true});await assert.rejects(save(m.request,baseline,{compounds:[1],sets:[]}),e=>e.pending.sha==='newcommit'); assert.equal((await checkResult(mock({head:'newcommit'}).request,{sha:'newcommit',base:'base'})).status,'success'); assert.equal((await checkResult(mock().request,{sha:'newcommit',base:'base'})).status,'retry'); assert.equal((await checkResult(mock({head:'other'}).request,{sha:'newcommit',base:'base'})).status,'conflict');});
