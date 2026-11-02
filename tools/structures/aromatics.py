"""Fixed teaching layouts for the requested aromatic master additions.

Ring vertices are real graph carbons, not decorative SVG paths. The generator
checks their implicit hydrogens and substitution valences with all other atoms.
"""
import math

# id, Japanese name, English name, molecular formula, functional groups, tags
COMPOUNDS=[
('benzene','ベンゼン','Benzene','C6H6',[],[]),
('toluene','トルエン','Toluene','C7H8',[],[]),
('ethylbenzene','エチルベンゼン','Ethylbenzene','C8H10',[],[]),
('styrene','スチレン','Styrene','C8H8',['炭素間不飽和結合'],[]),
*[(f'{p}-xylene',f'{p}-キシレン',f'{p}-Xylene','C8H10',[],[]) for p in ['o','m','p']],
('naphthalene','ナフタレン','Naphthalene','C10H8',[],[]),
('cumene','クメン','Cumene','C9H12',[],[]),
('cumene-hydroperoxide','クメンヒドロペルオキシド','Cumene hydroperoxide','C9H12O2',['ヒドロペルオキシド'],[]),
('chlorobenzene','クロロベンゼン','Chlorobenzene','C6H5Cl',['ハロゲン化合物'],[]),
*[(f'{p}-dichlorobenzene',f'{p}-ジクロロベンゼン',f'{p}-Dichlorobenzene','C6H4Cl2',['ハロゲン化合物'],[]) for p in ['o','m','p']],
('benzenesulfonic-acid','ベンゼンスルホン酸','Benzenesulfonic acid','C6H6O3S',['スルホン酸'],[]),
('sodium-benzenesulfonate','ベンゼンスルホン酸ナトリウム','Sodium benzenesulfonate','C6H5NaO3S',['スルホン酸塩'],[]),
('nitrobenzene','ニトロベンゼン','Nitrobenzene','C6H5NO2',['ニトロ化合物'],[]),
*[(f'{p}-nitrotoluene',f'{p}-ニトロトルエン',f'{p}-Nitrotoluene','C7H7NO2',['ニトロ化合物'],[]) for p in ['o','p']],
('phenol','フェノール','Phenol','C6H6O',['フェノール類'],[]),
*[(f'{p}-cresol',f'{p}-クレゾール',f'{p}-Cresol','C7H8O',['フェノール類'],[]) for p in ['o','m','p']],
*[(f'{p}-naphthol',f'{p}-ナフトール',f'{p}-Naphthol','C10H8O',['フェノール類'],[]) for p in [1,2]],
('sodium-phenoxide','ナトリウムフェノキシド','Sodium phenoxide','C6H5NaO',['フェノキシド'],[]),
('246-tribromophenol','2,4,6-トリブロモフェノール','2,4,6-Tribromophenol','C6H3Br3O',['フェノール類','ハロゲン化合物'],[]),
('picric-acid','ピクリン酸','Picric acid','C6H3N3O7',['フェノール類','ニトロ化合物'],[]),
('phenyl-acetate','酢酸フェニル','Phenyl acetate','C8H8O2',['エステル'],[]),
('benzyl-alcohol','ベンジルアルコール','Benzyl alcohol','C7H8O',['アルコール'],['1価アルコール','第一級アルコール']),
('benzaldehyde','ベンズアルデヒド','Benzaldehyde','C7H6O',['アルデヒド'],[]),
('benzoic-acid','安息香酸','Benzoic acid','C7H6O2',['カルボン酸'],[]),
('sodium-benzoate','安息香酸ナトリウム','Sodium benzoate','C7H5NaO2',['カルボン酸塩'],[]),
('phthalic-acid','フタル酸','Phthalic acid','C8H6O4',['カルボン酸'],['ジカルボン酸']),
('isophthalic-acid','イソフタル酸','Isophthalic acid','C8H6O4',['カルボン酸'],['ジカルボン酸']),
('terephthalic-acid','テレフタル酸','Terephthalic acid','C8H6O4',['カルボン酸'],['ジカルボン酸']),
('phthalic-anhydride','無水フタル酸','Phthalic anhydride','C8H4O3',['酸無水物'],[]),
('salicylic-acid','サリチル酸','Salicylic acid','C7H6O3',['カルボン酸','フェノール類'],[]),
('sodium-salicylate','サリチル酸ナトリウム','Sodium salicylate','C7H5NaO3',['カルボン酸塩','フェノール類'],[]),
('methyl-salicylate','サリチル酸メチル','Methyl salicylate','C8H8O3',['エステル','フェノール類'],[]),
('aspirin','アセチルサリチル酸','Acetylsalicylic acid','C9H8O4',['カルボン酸','エステル'],[]),
('aniline','アニリン','Aniline','C6H7N',['アミン'],[]),
('anilinium-chloride','アニリン塩酸塩','Anilinium chloride','C6H8ClN',['アミン塩'],[]),
('acetanilide','アセトアニリド','Acetanilide','C8H9NO',['アミド'],[]),
('benzenediazonium-chloride','塩化ベンゼンジアゾニウム','Benzenediazonium chloride','C6H5ClN2',['ジアゾニウム塩'],[]),
('p-phenylazophenol','p-フェニルアゾフェノール','4-(Phenylazo)phenol','C12H10N2O',['フェノール類','アゾ化合物'],[]),
('sodium-ethoxide','ナトリウムエトキシド','Sodium ethoxide','C2H5NaO',['アルコキシド'],[]),
]

def add_aromatics(drawings, Drawing):
    def ring(d,cx=0,cy=0):
        ids=[d.carbon(cx+90*math.cos(-i*math.pi/3),cy+90*math.sin(-i*math.pi/3)) for i in range(6)]
        for i in range(6):
            a,b=ids[i],ids[(i+1)%6];d.bond(a,b,2 if i%2==0 else 1);d.ringBonds[(a,b)]=(cx,cy)
        return ids
    def attach(d,ns,pos,text):
        p=d.nodes[ns[pos]];x,y=p['x'],p['y'];dx,dy=x/90,y/90
        # Vertical branches at the upper/lower vertices leave room for expanded groups.
        if pos in [1,2,4,5]:dx=0;dy=-1 if pos in [1,2] else 1
        n=d.add(text,x+dx*100,y+dy*100,2 if text=='O2N' else 0);d.bond(ns[pos],n);return n
    def acid(d,ns,pos,end='OH'):
        c=attach(d,ns,pos,'C');p=d.nodes[c];x,y=p['x'],p['y'];up=pos in [1,2]
        o=d.add('O',x,y+(-88 if up else 88));d.bond(c,o,2)
        direction=-1 if pos in [2,3,4] else 1
        e=d.add('HO' if end=='OH' and direction<0 else end,x+direction*110,y,1 if end=='OH' and direction<0 else 0);d.bond(c,e)
        return c,e
    def acetoxy(d,ns,pos):
        o=attach(d,ns,pos,'O');p=d.nodes[o];c=d.add('C',p['x']+110,p['y']);d.bond(o,c)
        ox=d.add('O',p['x']+110,p['y']-88);d.bond(c,ox,2)
        m=d.add('CH3',p['x']+210,p['y']);d.bond(c,m)
    def naphthalene(d):
        # Two hexagons sharing a vertical edge, 10 distinct carbons, 5 C=C.
        pts=[(0,-78),(90,-130),(180,-78),(180,26),(90,78),(0,26),(-90,78),(-180,26),(-180,-78),(-90,-130)]
        ns=[d.carbon(x,y) for x,y in pts]
        for i in range(10):
            a,b=ns[i],ns[(i+1)%10];d.bond(a,b,2 if i%2==0 else 1)
            d.ringBonds[(a,b)]=(90,-26) if i<5 else (-90,-26)
        d.bond(ns[0],ns[5]);return ns
    for id,ja,en,formula,groups,tags in COMPOUNDS:
        d=Drawing()
        if id=='sodium-ethoxide':
            ns=d.chain(['H','C','C','ONa'])
            for i in [1,2]:d.branch(ns[i],'H');d.branch(ns[i],'H',False)
        elif id in ['naphthalene','1-naphthol','2-naphthol']:
            ns=naphthalene(d)
            if id!='naphthalene':
                # alpha (1) is adjacent to a fused carbon; beta (2) is next along perimeter.
                p=ns[1 if id=='1-naphthol' else 2];n=d.nodes[p]
                o=d.add('OH',n['x']+(100 if id=='2-naphthol' else 0),n['y']+(-100 if id=='1-naphthol' else 0));d.bond(p,o)
        else:
            ns=ring(d)
            if id=='benzene':pass
            elif id=='toluene':attach(d,ns,0,'CH3')
            elif id=='ethylbenzene':
                a=attach(d,ns,0,'CH2');b=d.add('CH3',310,0);d.bond(a,b)
            elif id=='styrene':
                a=attach(d,ns,0,'CH');b=d.add('CH2',310,0);d.bond(a,b,2)
            elif id.endswith('-xylene'):
                attach(d,ns,0,'CH3');attach(d,ns,{'o':1,'m':2,'p':3}[id[0]],'CH3')
            elif id in ['cumene','cumene-hydroperoxide']:
                c=attach(d,ns,0,'CH' if id=='cumene' else 'C')
                a=d.add('CH3',300,0);d.bond(c,a)
                a=d.add('CH3',190,-100);d.bond(c,a)
                if id!='cumene':
                    o=d.add('O',190,100);h=d.add('OH',300,100);d.bond(c,o);d.bond(o,h)
            elif id=='chlorobenzene':attach(d,ns,0,'Cl')
            elif id.endswith('-dichlorobenzene'):
                attach(d,ns,0,'Cl');attach(d,ns,{'o':1,'m':2,'p':3}[id[0]],'Cl')
            elif id in ['benzenesulfonic-acid','sodium-benzenesulfonate']:attach(d,ns,0,'SO3Na' if id.startswith('sodium') else 'SO3H')
            elif id=='nitrobenzene':attach(d,ns,0,'NO2')
            elif id.endswith('-nitrotoluene'):
                attach(d,ns,0,'CH3');attach(d,ns,1 if id[0]=='o' else 3,'NO2' if id[0]=='o' else 'O2N')
            elif id in ['phenol','sodium-phenoxide','aniline','anilinium-chloride']:
                attach(d,ns,0,{'phenol':'OH','sodium-phenoxide':'ONa','aniline':'NH2','anilinium-chloride':'NH3Cl'}[id])
            elif id.endswith('-cresol'):
                attach(d,ns,0,'OH');attach(d,ns,{'o':1,'m':2,'p':3}[id[0]],'CH3')
            elif id in ['246-tribromophenol','picric-acid']:
                attach(d,ns,0,'OH')
                for pos in [1,3,5]:attach(d,ns,pos,'Br' if id.startswith('246') else ('O2N' if pos==3 else 'NO2'))
            elif id=='phenyl-acetate':acetoxy(d,ns,0)
            elif id=='benzyl-alcohol':
                a=attach(d,ns,0,'CH2');b=d.add('OH',310,0);d.bond(a,b)
            elif id=='benzaldehyde':acid(d,ns,0,'H')
            elif id in ['benzoic-acid','sodium-benzoate']:acid(d,ns,0,'ONa' if id.startswith('sodium') else 'OH')
            elif id in ['phthalic-acid','isophthalic-acid','terephthalic-acid']:
                acid(d,ns,0);acid(d,ns,{'phthalic-acid':1,'isophthalic-acid':2,'terephthalic-acid':3}[id])
            elif id=='phthalic-anhydride':
                # Adjacent ring carbons fused to a five-membered cyclic anhydride.
                a=d.add('C',185,22);b=d.add('C',110,-168);o=d.add('O',235,-125)
                d.bond(ns[0],a);d.bond(ns[1],b);d.bond(a,o);d.bond(b,o)
                oa=d.add('O',185,110);ob=d.add('O',110,-256);d.bond(a,oa,2);d.bond(b,ob,2)
            elif id in ['salicylic-acid','sodium-salicylate','methyl-salicylate','aspirin']:
                c,e=acid(d,ns,0,'ONa' if id=='sodium-salicylate' else ('O' if id=='methyl-salicylate' else 'OH'))
                if id=='methyl-salicylate':
                    m=d.add('CH3',410,0);d.bond(e,m)
                if id=='aspirin':acetoxy(d,ns,1)
                else:attach(d,ns,1,'OH')
            elif id=='acetanilide':
                n=attach(d,ns,0,'NH');c=d.add('C',310,0);d.bond(n,c);m=d.add('CH3',410,0);d.bond(c,m);o=d.add('O',310,88);d.bond(c,o,2)
            elif id=='benzenediazonium-chloride':attach(d,ns,0,'N2Cl')
            elif id=='p-phenylazophenol':
                n=attach(d,ns,0,'N');n2=d.add('N',280,70);d.bond(n,n2,2);rs=ring(d,470,70);d.bond(n2,rs[3]);oh=d.add('OH',660,70);d.bond(rs[0],oh)
            else:raise ValueError(id)
        drawings[id]=d
