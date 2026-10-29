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
      const fields = [c.id, c.nameJa, c.nameEn, c.formula, c.note, ...c.functionalGroups, c.skeletonCategory, ...c.tags];
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
  const api = {shuffle, filterCompounds, sortCompounds};
  if (typeof module !== 'undefined') module.exports = api; else root.OrgoCore = api;
})(globalThis);
