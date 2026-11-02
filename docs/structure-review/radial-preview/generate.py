"""Review-only examples of the radial attachment convention; does not update master SVGs."""
import sys, math, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'tools/structures'))
import generate as g
OUT=Path(__file__).resolve().parent

def ring(d,angle):
    ns=[d.carbon(100*math.cos(angle+i*math.pi/3),100*math.sin(angle+i*math.pi/3)) for i in range(6)]
    for i in range(6):
        a,b=ns[i],ns[(i+1)%6];d.bond(a,b,2 if i%2==0 else 1);d.ringBonds[(a,b)]=(0,0)
    return ns

def attach(d,ns,i,s,a=0,length=130):
    p=d.nodes[ns[i]];n=d.add(s,p['x']*(1+length/100),p['y']*(1+length/100),a);d.bond(ns[i],n);return n

examples={}
d=g.Drawing();ns=ring(d,-math.pi/2)
attach(d,ns,0,'OH')
for i in [1,3,5]:attach(d,ns,i,'O2N' if i==5 else 'NO2',2 if i==5 else 0)
examples['picric-acid']=d

d=g.Drawing();ns=ring(d,-math.pi/2)
# Ortho disubstitution: acetoxy at 2 o'clock, carboxyl at 4 o'clock.
o=attach(d,ns,1,'O');p=d.nodes[o];x,y=p['x'],p['y']
c=d.add('C',x+110,y);d.bond(o,c)
ox=d.add('O',x+110,y-88);m=d.add('CH3',x+220,y);d.bond(c,ox,2);d.bond(c,m)
c=attach(d,ns,2,'C');p=d.nodes[c]
o=d.add('O',p['x'],p['y']+88);h=d.add('OH',p['x']+110,p['y']);d.bond(c,o,2);d.bond(c,h)
examples['aspirin']=d

d=g.Drawing();ns=ring(d,0);attach(d,ns,0,'CH3');attach(d,ns,3,'H3C',2)
examples['p-xylene']=d
master=json.loads((ROOT/'data/compounds.json').read_text())
all_drawings=g.build();all_drawings.update(examples)
g.validate(all_drawings,master)
for c in master:
    if c['id'] in examples:
        d=examples[c['id']]
        # Every ring-to-label bond is collinear with its center-to-vertex radius.
        for a,b,order in d.bonds:
            p,q=d.nodes[a],d.nodes[b]
            if not p['text'] and q['text']:
                assert abs(p['x']*q['y']-p['y']*q['x'])<1e-6
            elif p['text'] and q['text']:
                assert abs(p['x']-q['x'])<1e-6 or abs(p['y']-q['y'])<1e-6
        (OUT/(c['id']+'.svg')).write_text(g.render(c['id'],d,c['nameJa']))
print('3 previews: formula, valence, collisions, radial bonds and orthogonal side chains checked')
