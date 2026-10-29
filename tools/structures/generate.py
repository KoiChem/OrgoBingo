#!/usr/bin/env python3
"""Generate the 31 teaching semi-structural SVGs; no third-party dependencies."""
import json, math, re, html, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
FONT=json.loads((HERE/'glyphs.json').read_text())
G=FONT['glyphs']
STYLE={'fontSize':48,'subscriptScale':.64,'subscriptDrop':9,'bondLength':36,'bondWidth':1.8,'doubleGap':7,'labelGap':7,'branchStep':88,'padding':10}

def label(text,x,y,anchor=0):
    chars=[]; cursor=0; baseline=y+16.5
    for i,c in enumerate(text):
        sub=c.isdigit(); s=STYLE['subscriptScale'] if sub else 1
        g=G[c]; b=g['bounds']; by=baseline+(STYLE['subscriptDrop'] if sub else 0)
        chars.append({'char':c,'x':cursor,'y':by,'s':s,'box':[cursor+b[0]*s,by+b[1]*s,cursor+b[2]*s,by+b[3]*s]})
        cursor+=g['advance']*s
    # x is the center of the actual bonded atom, never the whole CH3/OH label.
    a=chars[anchor]['box']; dx=x-(a[0]+a[2])/2
    for c in chars:
        c['x']+=dx;c['box'][0]+=dx;c['box'][2]+=dx
    box=[min(c['box'][0] for c in chars),min(c['box'][1] for c in chars),max(c['box'][2] for c in chars),max(c['box'][3] for c in chars)]
    return {'text':text,'x':x,'y':y,'anchor':anchor,'chars':chars,'box':box,'atomBox':chars[anchor]['box']}

def atom_counts(s):
    m=re.fullmatch(r'\(CH2\)(\d+)',s)
    if m:return {'C':int(m[1]),'H':2*int(m[1])}
    out={}
    for e,n in re.findall(r'([A-Z][a-z]?)(\d*)',s):out[e]=out.get(e,0)+int(n or 1)
    return out

def molecular_formula(counts):
    return ''.join(e+(str(counts[e]) if counts[e]!=1 else '') for e in ['C','H','I','O'] if counts.get(e))

class Drawing:
    def __init__(self):self.nodes=[];self.bonds=[]
    def add(self,s,x,y=0,a=0):self.nodes.append(label(s,x,y,a));return len(self.nodes)-1
    def bond(self,a,b,order=1):self.bonds.append((a,b,order))
    def chain(self,labels):
        ids=[]
        for s in labels:
            n=self.add(s,0)
            if ids:
                prev=self.nodes[ids[-1]];curr=self.nodes[n]
                dx=prev['box'][2]+STYLE['bondLength']+2*STYLE['labelGap']-curr['box'][0]
                self.nodes[n]=label(s,dx,0)
                self.bond(ids[-1],n)
            ids.append(n)
        return ids
    def branch(self,n,s,up=True,order=1):
        p=self.nodes[n];b=self.add(s,p['x'],p['y']+(-1 if up else 1)*STYLE['branchStep']);self.bond(n,b,order);return b


def build():
    drawings={}
    def chain(id,ls,branches=()):
        d=Drawing();ns=d.chain(ls)
        for i,s,up,order in branches:d.branch(ns[i],s,up,order)
        drawings[id]=d
    for id,n in [('methanol',1),('ethanol',2),('1-propanol',3),('1-butanol',4)]:chain(id,['CH3']+['CH2']*(n-1)+['OH'])
    chain('2-propanol',['CH3','CH','CH3'],[(1,'OH',True,1)])
    chain('2-butanol',['CH3','CH','CH2','CH3'],[(1,'OH',True,1)])
    chain('ethylene-glycol',['CH2','CH2'],[(0,'OH',True,1),(1,'OH',True,1)])
    chain('glycerol',['CH2','CH','CH2'],[(0,'OH',True,1),(1,'OH',True,1),(2,'OH',True,1)])
    chain('2-methyl-2-propanol',['CH3','C','CH3'],[(1,'OH',True,1),(1,'CH3',False,1)])
    chain('dimethyl-ether',['CH3','O','CH3'])
    chain('diethyl-ether',['CH3','CH2','O','CH2','CH3'])
    chain('acetone',['CH3','C','CH3'],[(1,'O',True,2)])
    chain('methyl-ethyl-ketone',['CH3','C','CH2','CH3'],[(1,'O',True,2)])
    for id,ls in [('formaldehyde',['H','C','H']),('acetaldehyde',['CH3','C','H']),('propionaldehyde',['CH3','CH2','C','H'])]:chain(id,ls,[(len(ls)-2,'O',True,2)])
    for id,ls in [('formic-acid',['H','C','OH']),('acetic-acid',['CH3','C','OH']),('propionic-acid',['CH3','CH2','C','OH']),('butyric-acid',['CH3','CH2','CH2','C','OH']),('palmitic-acid',['CH3','(CH2)14','C','OH']),('stearic-acid',['CH3','(CH2)16','C','OH'])]:chain(id,ls,[(len(ls)-2,'O',True,2)])
    chain('lactic-acid',['CH3','CH','C','OH'],[(1,'OH',False,1),(2,'O',True,2)])
    chain('oxalic-acid',['HO','C','C','OH'],[(1,'O',True,2),(2,'O',False,2)])
    for id,ls in [('methyl-formate',['H','C','O','CH3']),('methyl-acetate',['CH3','C','O','CH3']),('ethyl-acetate',['CH3','C','O','CH2','CH3'])]:chain(id,ls,[(1,'O',True,2)])
    chain('acetic-anhydride',['CH3','C','O','C','CH3'],[(1,'O',True,2),(3,'O',True,2)])
    chain('iodoform',['I','CH','I'],[(1,'I',True,1)])
    for id,cis in [('maleic-acid',True),('fumaric-acid',False)]:
        d=Drawing();left=d.add('C',0);right=d.add('C',95);d.bond(left,right,2)
        for center,side,up in [(left,-1,True),(right,1,cis)]:
            p=d.nodes[center]; cy=-84 if up else 84
            car=d.add('C',p['x']+side*65,cy);d.bond(center,car)
            h=d.add('H',p['x']+side*43,-cy*.78);d.bond(center,h)
            d.branch(car,'O',up,2)
            # OH points outwards; HO bonds via its rightmost oxygen.
            acid=d.add('HO' if side<0 else 'OH',d.nodes[car]['x']+side*90,cy,1 if side<0 else 0);d.bond(car,acid)
        drawings[id]=d
    return drawings


def bond_segments(d):
    result=[]
    for a,b,order in d.bonds:
        p,q=d.nodes[a],d.nodes[b];dx=q['x']-p['x'];dy=q['y']-p['y'];length=math.hypot(dx,dy);ux,uy=dx/length,dy/length
        def endpoint(n,vx,vy):
            box=n['box'] if abs(vy)<.01 else n['atomBox'];cx,cy=n['x'],n['y']
            ts=[]
            if vx>0:ts.append((box[2]-cx)/vx)
            elif vx<0:ts.append((box[0]-cx)/vx)
            if vy>0:ts.append((box[3]-cy)/vy)
            elif vy<0:ts.append((box[1]-cy)/vy)
            t=min(ts)+STYLE['labelGap'];return cx+vx*t,cy+vy*t
        x1,y1=endpoint(p,ux,uy);x2,y2=endpoint(q,-ux,-uy)
        assert (x2-x1)*ux+(y2-y1)*uy>12,(p['text'],q['text'])
        for offset in ([0] if order==1 else [-STYLE['doubleGap']/2,STYLE['doubleGap']/2]):result.append((x1-uy*offset,y1+ux*offset,x2-uy*offset,y2+ux*offset))
    return result


def render(id,d,name):
    segments=bond_segments(d);boxes=[n['box'] for n in d.nodes]
    pad=STYLE['padding'];x=min(b[0] for b in boxes)-pad;y=min(b[1] for b in boxes)-pad;w=max(b[2] for b in boxes)-x+pad;h=max(b[3] for b in boxes)-y+pad
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.3f} {y:.3f} {w:.3f} {h:.3f}" role="img" aria-labelledby="title"><title id="title">{html.escape(name)}の構造式</title>', '<!-- Generated by tools/structures/generate.py; Liberation Sans Regular outlines; see tools/structures/fonts/OFL.txt. -->',f'<g fill="none" stroke="#000" stroke-width="{STYLE["bondWidth"]}" stroke-linecap="butt">']
    for line in segments:parts.append('<line '+ ' '.join(f'{k}="{v:.3f}"' for k,v in zip(['x1','y1','x2','y2'],line))+'/>')
    parts.append('</g><g fill="#000">')
    for n in d.nodes:
        parts.append(f'<g data-label="{n["text"]}" data-anchor-x="{n["x"]:.3f}" data-anchor-y="{n["y"]:.3f}">')
        for c in n['chars']:parts.append(f'<path transform="translate({c["x"]:.4f} {c["y"]:.4f}) scale({c["s"]})" d="{G[c["char"]]["path"]}"/>')
        parts.append('</g>')
    parts.append('</g></svg>\n')
    return '\n'.join(parts)


def validate(drawings,master):
    assert set(drawings)=={m['id'] for m in master}
    report=[]
    for m in master:
        id=m['id'];d=drawings[id];counts={};degree=[0]*len(d.nodes)
        for a,b,o in d.bonds:degree[a]+=o;degree[b]+=o
        for n,v in zip(d.nodes,degree):
            atoms=atom_counts(n['text'])
            for e,num in atoms.items():counts[e]=counts.get(e,0)+num
            expected=(4-atoms.get('H',0)) if atoms.get('C')==1 else (2 if n['text'].startswith('(') else (2-atoms.get('H',0) if 'O' in atoms else 1))
            # HO / OH contain one terminal oxygen; H and I are monovalent.
            assert v==expected,(id,n['text'],v,expected)
        assert molecular_formula(counts)==m['formula'],(id,counts,m['formula'])
        # Distinct label glyph bounding boxes must not overlap.
        for i,a in enumerate(d.nodes):
            for b in d.nodes[i+1:]:
                p,q=a['box'],b['box'];assert min(p[2],q[2])<=max(p[0],q[0]) or min(p[3],q[3])<=max(p[1],q[1]),(id,a['text'],b['text'])
        for line in bond_segments(d):
            # Sample each bond's interior against all glyph bounds, including subscripts.
            for t in [i/30 for i in range(31)]:
                x=line[0]+t*(line[2]-line[0]);y=line[1]+t*(line[3]-line[1])
                for n in d.nodes:
                    for c in n['chars']:
                        b=c['box'];assert not (b[0]-.9<x<b[2]+.9 and b[1]-.9<y<b[3]+.9),(id,'bond/glyph collision',n['text'])
        report.append({'id':id,'formula':m['formula'],'labels':[n['text'] for n in d.nodes],'bonds':len(d.bonds),'bondLines':len(bond_segments(d))})
    # The actual acid-carbon sides encode and verify the geometric isomer pair.
    for id,cis in [('maleic-acid',True),('fumaric-acid',False)]:
        d=drawings[id];cars=[n for n in d.nodes if n['text']=='C'][2:];assert (cars[0]['y']*cars[1]['y']>0)==cis
    return report

if __name__=='__main__':
    master=json.loads((ROOT/'data/compounds.json').read_text());drawings=build();report=validate(drawings,master)
    for m in master:(ROOT/m['structureSvg']).write_text(render(m['id'],drawings[m['id']],m['nameJa']))
    (HERE/'layouts.json').write_text(json.dumps({id:{'labels':[{k:n[k] for k in ['text','x','y','anchor']} for n in d.nodes],'bonds':d.bonds} for id,d in drawings.items()},ensure_ascii=False,indent=2)+'\n')
    (ROOT/'docs/structure-review/checks.json').write_text(json.dumps({'style':STYLE,'font':{k:FONT[k] for k in ['font','version','size']},'fontSHA256':hashlib.sha256((HERE/'fonts/LiberationSans-Regular.ttf').read_bytes()).hexdigest(),'checks':['31 master IDs and formulas','group valence','distinct label bounds','bond/glyph clearance including subscripts','positive bond length','cis/trans acid positions'],'structures':report},ensure_ascii=False,indent=2)+'\n')
    print(f'Generated and checked {len(drawings)} SVGs.')
