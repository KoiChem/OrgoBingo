(function(root) {
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function filterCompounds(items, filters) {
    const query = (filters.query || '').trim().toLocaleLowerCase();
    return items.filter(c => {
      const fields = [c.id, c.nameJa, c.nameEn, c.formula, c.note, c.properties || '', ...c.functionalGroups, c.skeletonCategory, ...c.tags];
      return (!query || fields.some(x => x.toLocaleLowerCase().includes(query))) &&
        ['functionalGroups','skeletonCategories','tags'].every(axis => {
          const selected = filters[axis] || [];
          const values = axis === 'skeletonCategories' ? [c.skeletonCategory] : c[axis];
          return !selected.length || selected.some(value => values.includes(value));
        });
    });
  }
  function sortCompounds(items, key, categories) {
    if (!key || key === 'original') return [...items];
    const compare = (a,b) => {
      if (key === 'functionalGroups') {
        const list = categories.functionalGroups;
        const x = a.functionalGroups.map(v => list.indexOf(v)).sort((p,q)=>p-q);
        const y = b.functionalGroups.map(v => list.indexOf(v)).sort((p,q)=>p-q);
        for(let i=0; i<Math.max(x.length,y.length); i++) {
          if(i>=x.length) return -1;
          if(i>=y.length) return 1;
          if(x[i]!==y[i]) return x[i]-y[i];
        }
        return 0;
      }
      return String(a[key]).localeCompare(String(b[key]), 'ja');
    };
    return items.map((value,index)=>({value,index})).sort((a,b)=>compare(a.value,b.value)||a.index-b.index).map(x=>x.value);
  }
  const elements = new Set(('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' '));
  const simpleMolecules = new Set(['H2','N2','O2','F2','Cl2','Br2','I2','P4','S8']);
  function parseChemical(text, formulaOnly) {
    const subs = []; let i=0, depth=0, atomCount=0;
    const leading = text.match(/^\d+(?=[A-Z(])/);
    if(leading) i=leading[0].length;
    while(i<text.length) {
      if(text[i]==='(') {depth++; i++; continue;}
      if(text[i]===')') {
        if(!depth) return null;
        depth--; const start=++i;
        while(/\d/.test(text[i]||'')) i++;
        if(i>start) subs.push({start,end:i,atomStart:start-1});
        if(text[i]==='n' && i===text.length-1) {subs.push({start:i,end:i+1,atomStart:i-1}); i++;}
        continue;
      }
      const match=text.slice(i).match(/^[A-Z][a-z]?/);
      if(!match || !elements.has(match[0])) return null;
      const atomStart=i; i+=match[0].length; atomCount++;
      const start=i; while(/\d/.test(text[i]||'')) i++;
      if(i>start) subs.push({start,end:i,atomStart});
    }
    const bare=text.slice(leading?.[0].length||0).replace(/^\(+/,'').replace(/\)+$/,'');
    if(depth || !atomCount || (!formulaOnly && atomCount===1 && !simpleMolecules.has(bare))) return null;
    return subs;
  }
  function chemicalTokens(text, formulaOnly=false) {
    if(formulaOnly) return [{text,subs:parseChemical(text,true)||[]}];
    const result=[]; let last=0;
    for(const match of text.matchAll(/[A-Za-z0-9()]+/g)) {
      if(match.index>last) result.push({text:text.slice(last,match.index),subs:[]});
      const unmatched=[],stack=[];
      for(let i=0;i<match[0].length;i++) {
        if(match[0][i]==='(') stack.push(i);
        else if(match[0][i]===')') {if(stack.length) stack.pop();else unmatched.push(i);}
      }
      unmatched.push(...stack);unmatched.sort((a,b)=>a-b);
      let start=0;
      for(const index of [...unmatched,match[0].length]) {
        const part=match[0].slice(start,index);
        if(part) result.push({text:part,subs:parseChemical(part,false)||[]});
        if(index<match[0].length) result.push({text:match[0][index],subs:[]});
        start=index+1;
      }
      last=match.index+match[0].length;
    }
    if(last<text.length || !result.length) result.push({text:text.slice(last),subs:[]});
    return result;
  }
  function chemicalHistoryTokens(text, limit=15) {
    const tokens=chemicalTokens(text);
    const chars=Array.from(text);
    if(chars.length<=limit) return tokens;
    const originalCut=chars.slice(0,limit).join('').length;
    let cut=originalCut, offset=0;
    for(const token of tokens) {
      for(const sub of token.subs) {
        if(offset+sub.start<cut && cut<offset+sub.end) cut=offset+sub.atomStart;
      }
      offset+=token.text.length;
    }
    if(cut===originalCut) for(const match of text.matchAll(/[0-9０-９]+(?:[.．,，][0-9０-９]+)*/g)) {
      if(match.index<cut && cut<match.index+match[0].length) {cut=match.index;break;}
    }
    const result=[];offset=0;
    for(const token of tokens) {
      const length=Math.min(token.text.length,Math.max(0,cut-offset));
      if(length) result.push({text:token.text.slice(0,length),subs:token.subs.filter(sub=>sub.end<=length)});
      offset+=token.text.length;
      if(offset>=cut) break;
    }
    result.push({text:'…',subs:[]});return result;
  }
  function chemicalHistory(text, limit=15) {return chemicalHistoryTokens(text,limit).map(t=>t.text).join('');}
  const api = {shuffle, filterCompounds, sortCompounds, chemicalTokens, chemicalHistory, chemicalHistoryTokens};
  if (typeof module !== 'undefined') module.exports = api; else root.OrgoCore = api;
})(globalThis);
