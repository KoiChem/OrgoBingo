#!/usr/bin/env python3
"""Compare new teaching layouts with PubChem's stored connectivity."""
import json,re,sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/structures'))
import generate as g

def from_smiles(smiles):
    tokens=re.findall(r'Cl|Br|[BCNOFPSI]|[0-9]|[()=#/\\.-]',smiles)
    if ''.join(tokens)!=smiles:raise ValueError(('unsupported SMILES',smiles,tokens))
    nodes=[];edges={};branches=[];rings={};last=None;order=1
    def link(a,b,o):edges[tuple(sorted((a,b)))]=o
    for tok in tokens:
        if tok in ('=','#'):order={'=':2,'#':3}[tok]
        elif tok in ('/','\\'):pass
        elif tok=='(':branches.append(last)
        elif tok==')':last=branches.pop()
        elif tok=='.':last=None
        elif tok.isdigit():
            if tok in rings:
                node,bond=rings.pop(tok);link(node,last,order if order!=1 else bond);order=1
            else:rings[tok]=(last,order);order=1
        else:
            node=len(nodes);nodes.append(tok)
            if last is not None:link(last,node,order)
            last=node;order=1
    assert not rings and not branches,smiles
    return nodes,edges

def from_drawing(d):
    nodes=[];indices={};edges={}
    for i,n in enumerate(d.nodes):
        counts=g.atom_counts(n['text']);heavy={e:k for e,k in counts.items() if e!='H' and k}
        if not heavy:continue
        if len(heavy)!=1 or next(iter(heavy.values()))!=1:raise ValueError((n['text'],heavy))
        indices[i]=len(nodes);nodes.append(next(iter(heavy)))
    for a,b,o in d.bonds:
        if a in indices and b in indices:edges[tuple(sorted((indices[a],indices[b])))]=o
    return nodes,edges

def isomorphic(left,right):
    n1,e1=left;n2,e2=right
    if len(n1)!=len(n2) or Counter(n1)!=Counter(n2) or len(e1)!=len(e2):return False
    def neighbors(nodes,edges,i):return sorted((nodes[b if a==i else a],o) for (a,b),o in edges.items() if i in (a,b))
    candidates={i:[j for j in range(len(n2)) if n1[i]==n2[j] and neighbors(n1,e1,i)==neighbors(n2,e2,j)] for i in range(len(n1))}
    def match(mapping,used):
        if len(mapping)==len(n1):return True
        i=min((k for k in range(len(n1)) if k not in mapping),key=lambda k:sum(j not in used for j in candidates[k]))
        for j in candidates[i]:
            if j in used:continue
            if any(e1.get(tuple(sorted((i,k))))!=e2.get(tuple(sorted((j,v)))) for k,v in mapping.items()):continue
            mapping[i]=j;used.add(j)
            if match(mapping,used):return True
            used.remove(j);del mapping[i]
        return False
    return match({},set())
items=json.loads((ROOT/'docs/structure-review/hydrocarbon-pubchem.json').read_text())['entries'];master={c['id']:c for c in json.loads((ROOT/'data/compounds.json').read_text())};drawings=g.build();errors=[]
for item in items:
    if item['formula']!=master[item['id']]['formula']:errors.append((item['id'],'formula/source',item));continue
    try:
        if not isomorphic(from_drawing(drawings[item['id']]),from_smiles(item['smiles'])):errors.append((item['id'],'connectivity',item['smiles']))
    except Exception as e:errors.append((item['id'],'comparison',str(e)))
print('compared',len(items),'errors',errors)
if errors:sys.exit(1)
