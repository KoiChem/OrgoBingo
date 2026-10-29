(function(root) {
 async function save(request, baseline, data) {
  const head = (await request('/git/ref/heads/main')).object.sha;
  if (head!==baseline.sha) throw new Error('競合：GitHub側が更新されています。最新データを読み直してください。');
  const changes=[];
  for (const [key,path] of [['compounds','data/compounds.json'],['sets','data/bingo-sets.json']]) {
   if(JSON.stringify(data[key])!==JSON.stringify(baseline[key])) {
    const blob=await request('/git/blobs',{method:'POST',body:JSON.stringify({content:JSON.stringify(data[key],null,2)+'\n',encoding:'utf-8'})});
    changes.push({path,mode:'100644',type:'blob',sha:blob.sha});
   }
  }
  if(!changes.length) return {sha:baseline.sha,unchanged:true};
  const tree=await request('/git/trees',{method:'POST',body:JSON.stringify({base_tree:baseline.tree,tree:changes})});
  const commit=await request('/git/commits',{method:'POST',body:JSON.stringify({message:'Update compounds and bingo sets',tree:tree.sha,parents:[baseline.sha]})});
  try {await request('/git/refs/heads/main',{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});}
  catch(cause){const e=new Error('保存結果を確認してください。');e.pending={sha:commit.sha,base:baseline.sha,tree:tree.sha};e.cause=cause;throw e;}
  return {sha:commit.sha,tree:tree.sha};
 }
 async function checkResult(request,pending) {
  const head=(await request('/git/ref/heads/main')).object.sha;
  if(head===pending.sha) return {status:'success'};
  if(head===pending.base) return {status:'retry'};
  const result=await request(`/compare/${pending.sha}...${head}`);
  return {status:result.status==='ahead'||result.status==='identical'?'success':'conflict'};
 }
 async function retry(request,pending) {
  const status=await checkResult(request,pending);
  if(status.status!=='retry') return status;
  try {await request('/git/refs/heads/main',{method:'PATCH',body:JSON.stringify({sha:pending.sha,force:false})});return {status:'success'};}
  catch(e) {return checkResult(request,pending);}
 }
 const api={save,checkResult,retry}; if(typeof module!=='undefined') module.exports=api; else root.OrgoGitHub=api;
})(globalThis);
