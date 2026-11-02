#!/usr/bin/env python3
"""Generate teaching semi-structural SVGs; no third-party dependencies."""
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
    return ''.join(e+(str(counts[e]) if counts[e]!=1 else '') for e in ['C','H']+sorted(set(counts)-{'C','H'}) if counts.get(e))

class Drawing:
    def __init__(self):self.nodes=[];self.bonds=[];self.ringBonds={};self.ringCenters={};self.repeatPorts=[];self.cyclic=False
    def add(self,s,x,y=0,a=0):self.nodes.append(label(s,x,y,a));return len(self.nodes)-1
    def carbon(self,x,y):
        self.nodes.append({'text':'','x':x,'y':y,'anchor':0,'chars':[],'box':[x,y,x,y],'atomBox':[x,y,x,y]});return len(self.nodes)-1
    def bond(self,a,b,order=1):self.bonds.append((a,b,order))
    def chain(self,labels):
        ids=[]
        for s in labels:
            anchor={'H3C':2,'H2C':2,'H2N':2,'HO':1,'O2N':2}.get(s,0)
            n=self.add(s,0,a=anchor)
            if ids:
                prev=self.nodes[ids[-1]];curr=self.nodes[n]
                dx=prev['box'][2]+STYLE['bondLength']+2*STYLE['labelGap']-curr['box'][0]
                self.nodes[n]=label(s,dx,0,anchor)
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
    for id,n in [('1-propanol',3),('1-butanol',4)]:chain(id,['CH3']+['CH2']*(n-1)+['OH'])
    chain('2-propanol',['CH3','CH','CH3'],[(1,'OH',True,1)])
    chain('2-butanol',['CH3','CH','CH2','CH3'],[(1,'OH',True,1)])
    chain('glycerol',['CH2','CH','CH2'],[(0,'OH',True,1),(1,'OH',True,1),(2,'OH',True,1)])
    chain('2-methyl-2-propanol',['CH3','C','CH3'],[(1,'OH',True,1),(1,'CH3',False,1)])
    chain('diethyl-ether',['CH3','CH2','O','CH2','CH3'])
    chain('acetone',['CH3','C','CH3'],[(1,'O',True,2)])
    chain('methyl-ethyl-ketone',['CH3','C','CH2','CH3'],[(1,'O',True,2)])
    for id,ls in [('formaldehyde',['H','C','H']),('propionaldehyde',['CH3','CH2','C','H'])]:chain(id,ls,[(len(ls)-2,'O',True,2)])
    for id,ls in [('propionic-acid',['CH3','CH2','C','OH']),('butyric-acid',['CH3','CH2','CH2','C','OH']),('palmitic-acid',['CH3','(CH2)14','C','OH']),('stearic-acid',['CH3','(CH2)16','C','OH'])]:chain(id,ls,[(len(ls)-2,'O',True,2)])
    chain('lactic-acid',['CH3','CH','C','OH'],[(1,'OH',False,1),(2,'O',True,2)])
    for id,ls in [('methyl-acetate',['CH3','C','O','CH3']),('ethyl-acetate',['CH3','C','O','CH2','CH3'])]:chain(id,ls,[(1,'O',True,2)])
    chain('acetic-anhydride',['CH3','C','O','C','CH3'],[(1,'O',True,2),(3,'O',True,2)])
    # C1/C2: every H is an independent atom, including hydroxyl hydrogens.
    chain('methanol',['H','C','O','H'],[(1,'H',True,1),(1,'H',False,1)])
    chain('ethanol',['H','C','C','O','H'],[(1,'H',True,1),(1,'H',False,1),(2,'H',True,1),(2,'H',False,1)])
    chain('ethylene-glycol',['H','O','C','C','O','H'],[(2,'H',True,1),(2,'H',False,1),(3,'H',True,1),(3,'H',False,1)])
    chain('dimethyl-ether',['H','C','O','C','H'],[(1,'H',True,1),(1,'H',False,1),(3,'H',True,1),(3,'H',False,1)])
    chain('acetaldehyde',['H','C','C','H'],[(1,'H',True,1),(1,'H',False,1),(2,'O',True,2)])
    chain('formic-acid',['H','C','O','H'],[(1,'O',True,2)])
    chain('acetic-acid',['H','C','C','O','H'],[(1,'H',True,1),(1,'H',False,1),(2,'O',True,2)])
    chain('oxalic-acid',['H','O','C','C','O','H'],[(2,'O',True,2),(3,'O',False,2)])
    chain('methyl-formate',['H','C','O','C','H'],[(1,'O',True,2),(3,'H',True,1),(3,'H',False,1)])
    chain('iodoform',['I','C','I'],[(1,'I',True,1),(1,'H',False,1)])
    # Five-membered cyclic anhydride: O-C(=O)-C(H)=C(H)-C(=O).
    d=Drawing()
    oxygen=d.add('O',0,-95)
    left=d.add('C',-100,-25);right=d.add('C',100,-25)
    alkene_left=d.add('C',-65,90);alkene_right=d.add('C',65,90)
    d.bond(oxygen,left);d.bond(oxygen,right)
    d.bond(left,alkene_left);d.bond(right,alkene_right);d.bond(alkene_left,alkene_right,2)
    for carbon,side in [(left,-1),(right,1)]:
        out=d.add('O',side*190,-80);d.bond(carbon,out,2)
    for carbon,side in [(alkene_left,-1),(alkene_right,1)]:
        hydrogen=d.add('H',side*125,165);d.bond(carbon,hydrogen)
    drawings['maleic-anhydride']=d
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
    from aromatics import add_aromatics
    add_aromatics(drawings, Drawing)
    from hydrocarbons import add_hydrocarbons
    add_hydrocarbons(drawings, Drawing)
    return drawings


def bond_segments(d):
    result=[]
    for a,b,order in d.bonds:
        p,q=d.nodes[a],d.nodes[b];dx=q['x']-p['x'];dy=q['y']-p['y'];length=math.hypot(dx,dy);ux,uy=dx/length,dy/length
        def endpoint(n,vx,vy):
            if not n['text']:return n['x'],n['y']
            box=n['box'] if abs(vy)<.01 or d.ringBonds or d.cyclic else n['atomBox'];cx,cy=n['x'],n['y']
            ts=[]
            if vx>0:ts.append((box[2]-cx)/vx)
            elif vx<0:ts.append((box[0]-cx)/vx)
            if vy>0:ts.append((box[3]-cy)/vy)
            elif vy<0:ts.append((box[1]-cy)/vy)
            t=min(ts)+STYLE['labelGap'];return cx+vx*t,cy+vy*t
        x1,y1=endpoint(p,ux,uy);x2,y2=endpoint(q,-ux,-uy)
        assert (x2-x1)*ux+(y2-y1)*uy>12,(p['text'],q['text'])
        if (a,b) in d.ringBonds and order==2:
            cx,cy=d.ringBonds[(a,b)];side=1 if (-uy*(cx-(x1+x2)/2)+ux*(cy-(y1+y2)/2))>0 else -1
            result.append((x1,y1,x2,y2));off=side*length*.12;trim=length*.12
            result.append((x1+ux*trim-uy*off,y1+uy*trim+ux*off,x2-ux*trim-uy*off,y2-uy*trim+ux*off))
        else:
            for offset in ([0] if order==1 else ([-STYLE['doubleGap']/2,STYLE['doubleGap']/2] if order==2 else [-STYLE['doubleGap'],0,STYLE['doubleGap']])):result.append((x1-uy*offset,y1+ux*offset,x2-uy*offset,y2+ux*offset))
    if d.repeatPorts:
        # The open bonds cross the brackets and connect to the next repeat unit.
        left=d.nodes[d.repeatPorts[0][0]];right=d.nodes[d.repeatPorts[1][0]]
        lx=left['box'][0]-35;rx=right['box'][2]+35;top=-47;bottom=47
        result.extend([(lx-24,0,left['box'][0]-STYLE['labelGap'],0),
                       (right['box'][2]+STYLE['labelGap'],0,rx+24,0),
                       (lx,top,lx,bottom),(lx,top,lx+10,top),(lx,bottom,lx+10,bottom),
                       (rx,top,rx,bottom),(rx-10,top,rx,top),(rx-10,bottom,rx,bottom)])
    return result


def render(id,d,name):
    segments=bond_segments(d);boxes=[n['box'] for n in d.nodes]
    if d.repeatPorts:
        # Include brackets, continuation bonds and subscript n in the viewBox.
        right=d.nodes[d.repeatPorts[1][0]]['box'][2]+35
        n_x=right+9;n_baseline=65;scale=STYLE['subscriptScale'];bounds=G['n']['bounds']
        boxes.append([min(line[0] for line in segments),-47,max(line[2] for line in segments),47])
        boxes.append([n_x+bounds[0]*scale,n_baseline+bounds[1]*scale,n_x+bounds[2]*scale,n_baseline+bounds[3]*scale])
    pad=STYLE['padding'];x=min(b[0] for b in boxes)-pad;y=min(b[1] for b in boxes)-pad;w=max(b[2] for b in boxes)-x+pad;h=max(b[3] for b in boxes)-y+pad
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.3f} {y:.3f} {w:.3f} {h:.3f}" role="img" aria-labelledby="title"><title id="title">{html.escape(name)}の構造式</title>', '<!-- Generated by tools/structures/generate.py; Liberation Sans Regular outlines; see tools/structures/fonts/OFL.txt. -->',f'<g fill="none" stroke="#000" stroke-width="{STYLE["bondWidth"]}" stroke-linecap="butt">']
    for line in segments:parts.append('<line '+ ' '.join(f'{k}="{v:.3f}"' for k,v in zip(['x1','y1','x2','y2'],line))+'/>')
    parts.append('</g><g fill="#000">')
    for n in d.nodes:
        parts.append(f'<g data-label="{n["text"]}" data-anchor-x="{n["x"]:.3f}" data-anchor-y="{n["y"]:.3f}">')
        for c in n['chars']:parts.append(f'<path transform="translate({c["x"]:.4f} {c["y"]:.4f}) scale({c["s"]})" d="{G[c["char"]]["path"]}"/>')
        parts.append('</g>')
    if d.repeatPorts:
        parts.append(f'<g data-repeat-unit="true" data-label="n"><path transform="translate({n_x:.4f} {n_baseline:.4f}) scale({scale})" d="{G["n"]["path"]}"/></g>')
    parts.append('</g></svg>\n')
    return '\n'.join(parts)


def validate(drawings,master):
    assert set(drawings)=={m['id'] for m in master}
    report=[]
    for m in master:
        id=m['id'];d=drawings[id];counts={};degree=[0]*len(d.nodes)
        for a,b,o in d.bonds:degree[a]+=o;degree[b]+=o
        for n,side in d.repeatPorts:
            assert side in (-1,1);degree[n]+=1
        for n,v in zip(d.nodes,degree):
            atoms=atom_counts(n['text']) if n['text'] else {'C':1,'H':4-v}
            assert n['text'] or 0<=4-v<=1,(id,'aromatic carbon valence',v)
            for e,num in atoms.items():counts[e]=counts.get(e,0)+num
            expected=(4-atoms.get('H',0)) if atoms.get('C')==1 else (2 if n['text'].startswith('(') else (2-atoms.get('H',0) if 'O' in atoms else 1))
            # HO / OH contain one terminal oxygen; H and I are monovalent.
            if not n['text']:expected=v
            expected={'ONa':1,'SO3H':1,'SO3Na':1,'NO2':1,'O2N':1,'NH2':1,'NH3Cl':1,'N2Cl':1,'NH':2,'N':3,'Cl':1,'Br':1}.get(n['text'],expected)
            assert v==expected,(id,n['text'],v,expected)
        actual=molecular_formula(counts)
        if d.repeatPorts:
            assert len(d.repeatPorts)==2 and [side for _,side in d.repeatPorts]==[-1,1],(id,'repeat ports')
            actual=f'({actual})n'
        assert actual==m['formula'],(id,counts,m['formula'])
        # User drawing convention: radial ring attachments and orthogonal side chains.
        for a,b,order in d.bonds:
            p,q=d.nodes[a],d.nodes[b]
            if not p['text'] and q['text'] and a in d.ringCenters:
                cx,cy=d.ringCenters[a];rx,ry=p['x']-cx,p['y']-cy
                dx,dy=q['x']-p['x'],q['y']-p['y']
                assert abs(rx*dy-ry*dx)<1e-5 and rx*dx+ry*dy>0,(id,'radial attachment')
            elif p['text'] and q['text'] and d.ringBonds and m['skeletonCategory']=='芳香族' and id!='phthalic-anhydride':
                if order==2 and p['text'].startswith(('C','N')) and q['text'].startswith(('C','N')):continue
                assert abs(p['x']-q['x'])<1e-5 or abs(p['y']-q['y'])<1e-5,(id,'orthogonal side chain')

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
    (HERE/'layouts.json').write_text(json.dumps({id:{'labels':[{k:n[k] for k in ['text','x','y','anchor']} for n in d.nodes],'bonds':d.bonds,**({'repeatPorts':d.repeatPorts} if d.repeatPorts else {})} for id,d in drawings.items()},ensure_ascii=False,indent=2)+'\n')
    (ROOT/'docs/structure-review/checks.json').write_text(json.dumps({'style':STYLE,'font':{k:FONT[k] for k in ['font','version','size']},'fontSHA256':hashlib.sha256((HERE/'fonts/LiberationSans-Regular.ttf').read_bytes()).hexdigest(),'checks':[f'{len(master)} master IDs and formulas','group valence','distinct label bounds','bond/glyph clearance including subscripts','positive bond length','cis/trans acid positions'],'structures':report},ensure_ascii=False,indent=2)+'\n')
    print(f'Generated and checked {len(drawings)} SVGs.')
