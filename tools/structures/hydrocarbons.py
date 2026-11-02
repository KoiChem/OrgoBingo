"""Fixed layouts for hydrocarbons, halogen derivatives and polymer units."""
import math

# ID, Japanese name, English name, formula, classifications, tags, note.
COMPOUNDS=[
 ('methane','メタン','Methane','CH4',[],[],''),
 ('ethane','エタン','Ethane','C2H6',[],[],''),
 ('propane','プロパン','Propane','C3H8',[],[],''),
 ('butane','ブタン','Butane','C4H10',[],[],''),
 ('pentane','ペンタン','Pentane','C5H12',[],[],''),
 ('hexane','ヘキサン','Hexane','C6H14',[],[],''),
 ('2-methylpropane','2-メチルプロパン','2-Methylpropane','C4H10',[],[],''),
 ('2-methylbutane','2-メチルブタン','2-Methylbutane','C5H12',[],[],''),
 ('23-dimethylbutane','2,3-ジメチルブタン','2,3-Dimethylbutane','C6H14',[],[],''),
 ('cyclopropane','シクロプロパン','Cyclopropane','C3H6',[],[],''),
 ('cyclobutane','シクロブタン','Cyclobutane','C4H8',[],[],''),
 ('cyclopentane','シクロペンタン','Cyclopentane','C5H10',[],[],''),
 ('cyclohexane','シクロヘキサン','Cyclohexane','C6H12',[],[],''),
 ('ethylene','エチレン','Ethylene','C2H4',['炭素間不飽和結合'],[],''),
 ('propene','プロペン','Propene','C3H6',['炭素間不飽和結合'],[],''),
 ('1-butene','1-ブテン','1-Butene','C4H8',['炭素間不飽和結合'],[],''),
 ('cis-2-butene','シス-2-ブテン','cis-2-Butene','C4H8',['炭素間不飽和結合'],['cis'],''),
 ('trans-2-butene','トランス-2-ブテン','trans-2-Butene','C4H8',['炭素間不飽和結合'],['trans'],''),
 ('2-methylpropene','2-メチルプロペン','2-Methylpropene','C4H8',['炭素間不飽和結合'],[],''),
 ('2-pentene','シス-2-ペンテン','cis-2-Pentene','C5H10',['炭素間不飽和結合'],['cis'],''),
 ('13-butadiene','1,3-ブタジエン','1,3-Butadiene','C4H6',['炭素間不飽和結合'],[],''),
 ('cyclopentene','シクロペンテン','Cyclopentene','C5H8',['炭素間不飽和結合'],[],''),
 ('cyclohexene','シクロヘキセン','Cyclohexene','C6H10',['炭素間不飽和結合'],[],''),
 ('acetylene','アセチレン','Acetylene','C2H2',['炭素間不飽和結合'],[],''),
 ('propyne','プロピン','Propyne','C3H4',['炭素間不飽和結合'],[],''),
 ('1-butyne','1-ブチン','1-Butyne','C4H6',['炭素間不飽和結合'],[],''),
 ('2-butyne','2-ブチン','2-Butyne','C4H6',['炭素間不飽和結合'],[],''),
 ('3-methyl-1-butyne','3-メチル-1-ブチン','3-Methyl-1-butyne','C5H8',['炭素間不飽和結合'],[],''),
 ('chloromethane','クロロメタン','Chloromethane','CH3Cl',['ハロゲン化合物'],[],''),
 ('dichloromethane','ジクロロメタン','Dichloromethane','CH2Cl2',['ハロゲン化合物'],[],''),
 ('trichloromethane','トリクロロメタン','Trichloromethane','CHCl3',['ハロゲン化合物'],['ハロホルム'],''),
 ('tetrachloromethane','テトラクロロメタン','Tetrachloromethane','CCl4',['ハロゲン化合物'],[],''),
 ('chloroethane','クロロエタン','Chloroethane','C2H5Cl',['ハロゲン化合物'],[],''),
 ('12-dichloroethane','1,2-ジクロロエタン','1,2-Dichloroethane','C2H4Cl2',['ハロゲン化合物'],[],''),
 ('12-dibromoethane','1,2-ジブロモエタン','1,2-Dibromoethane','C2H4Br2',['ハロゲン化合物'],[],''),
 ('1122-tetrabromoethane','1,1,2,2-テトラブロモエタン','1,1,2,2-Tetrabromoethane','C2H2Br4',['ハロゲン化合物'],[],''),
 ('vinyl-chloride','塩化ビニル','Vinyl chloride','C2H3Cl',['炭素間不飽和結合','ハロゲン化合物'],[],''),
 ('vinyl-acetate','酢酸ビニル','Vinyl acetate','C4H6O2',['エステル','炭素間不飽和結合'],[],''),
 ('polyethylene','ポリエチレン','Polyethylene','(C2H4)n',[],['高分子'],'繰り返し単位'),
 ('polyacetylene','ポリアセチレン','Polyacetylene','(C2H2)n',['炭素間不飽和結合'],['高分子'],'繰り返し単位、立体配置を指定しない'),
 ('acrylonitrile','アクリロニトリル','Acrylonitrile','C3H3N',['炭素間不飽和結合','ニトリル'],[],''),
]

def add_hydrocarbons(drawings,Drawing):
    def chain(id,labels,orders=None,branches=()):
        d=Drawing();ns=d.chain(labels)
        for i,order in (orders or {}).items():
            d.bonds[i]=(ns[i],ns[i+1],order)
        for i,s,up in branches:d.branch(ns[i],s,up)
        drawings[id]=d
        return d,ns
    # C1/C2 small molecules show all hydrogens as separate atoms.
    chain('methane',['H','C','H'],branches=[(1,'H',True),(1,'H',False)])
    chain('ethane',['H','C','C','H'],branches=[(1,'H',True),(1,'H',False),(2,'H',True),(2,'H',False)])
    for id,labels in [('propane',['H3C','CH2','CH3']),('butane',['H3C','CH2','CH2','CH3']),('pentane',['H3C','CH2','CH2','CH2','CH3']),('hexane',['H3C','CH2','CH2','CH2','CH2','CH3'])]:chain(id,labels)
    chain('2-methylpropane',['H3C','CH','CH3'],branches=[(1,'CH3',True)])
    chain('2-methylbutane',['H3C','CH','CH2','CH3'],branches=[(1,'CH3',True)])
    chain('23-dimethylbutane',['H3C','CH','CH','CH3'],branches=[(1,'CH3',True),(2,'CH3',True)])
    # Aliphatic cyclic structures use explicit CH/CH2 labels and regular polygons.
    for id,size,unsaturated in [('cyclopropane',3,False),('cyclobutane',4,False),('cyclopentane',5,False),('cyclohexane',6,False),('cyclopentene',5,True),('cyclohexene',6,True)]:
        d=Drawing();d.cyclic=True;radius=145;ns=[]
        for i in range(size):
            angle=-math.pi/2+i*2*math.pi/size
            ns.append(d.add('CH' if unsaturated and i in (0,1) else 'CH2',radius*math.cos(angle),radius*math.sin(angle)))
        for i in range(size):
            a,b=ns[i],ns[(i+1)%size];order=2 if unsaturated and i==0 else 1
            d.bond(a,b,order)
            if order==2:d.ringBonds[(a,b)]=(0,0)
        drawings[id]=d
    chain('ethylene',['H','C','C','H'],orders={1:2},branches=[(1,'H',True),(2,'H',True)])
    chain('propene',['H2C','CH','CH3'],orders={0:2})
    chain('1-butene',['H2C','CH','CH2','CH3'],orders={0:2})
    for id,cis in [('cis-2-butene',True),('trans-2-butene',False)]:
        d=Drawing();left=d.add('C',0);right=d.add('C',110);d.bond(left,right,2)
        for center,side,up in [(left,-1,True),(right,1,cis)]:
            p=d.nodes[center];y=-84 if up else 84
            methyl=d.add('H3C' if side<0 else 'CH3',p['x']+side*90,y,2 if side<0 else 0);d.bond(center,methyl)
            hydrogen=d.add('H',p['x']+side*65,-y);d.bond(center,hydrogen)
        drawings[id]=d
    chain('2-methylpropene',['H2C','C','CH3'],orders={0:2},branches=[(1,'CH3',True)])
    # cis-2-pentene: the methyl and ethyl groups lie on the same side.
    d=Drawing();left=d.add('C',0);right=d.add('C',110);d.bond(left,right,2)
    methyl=d.add('H3C',-90,-84,2);ethyl=d.add('CH2',200,-84);terminal=d.add('CH3',320,-84)
    d.bond(left,methyl);d.bond(right,ethyl);d.bond(ethyl,terminal)
    for carbon,x in [(left,-65),(right,175)]:
        hydrogen=d.add('H',x,84);d.bond(carbon,hydrogen)
    drawings['2-pentene']=d
    chain('13-butadiene',['H2C','CH','CH','CH2'],orders={0:2,2:2})
    chain('acetylene',['H','C','C','H'],orders={1:3})
    chain('propyne',['H','C','C','CH3'],orders={1:3})
    chain('1-butyne',['H','C','C','CH2','CH3'],orders={1:3})
    chain('2-butyne',['H3C','C','C','CH3'],orders={1:3})
    chain('3-methyl-1-butyne',['H','C','C','CH','CH3'],orders={1:3},branches=[(3,'CH3',True)])
    chain('chloromethane',['H','C','Cl'],branches=[(1,'H',True),(1,'H',False)])
    chain('dichloromethane',['Cl','C','Cl'],branches=[(1,'H',True),(1,'H',False)])
    chain('trichloromethane',['Cl','C','Cl'],branches=[(1,'H',True),(1,'Cl',False)])
    chain('tetrachloromethane',['Cl','C','Cl'],branches=[(1,'Cl',True),(1,'Cl',False)])
    chain('chloroethane',['H','C','C','Cl'],branches=[(1,'H',True),(1,'H',False),(2,'H',True),(2,'H',False)])
    chain('12-dichloroethane',['Cl','C','C','Cl'],branches=[(1,'H',True),(1,'H',False),(2,'H',True),(2,'H',False)])
    chain('12-dibromoethane',['Br','C','C','Br'],branches=[(1,'H',True),(1,'H',False),(2,'H',True),(2,'H',False)])
    chain('1122-tetrabromoethane',['Br','C','C','Br'],branches=[(1,'Br',True),(1,'H',False),(2,'Br',True),(2,'H',False)])
    chain('vinyl-chloride',['H','C','C','Cl'],orders={1:2},branches=[(1,'H',True),(2,'H',True)])
    # Vinyl acetate: CH3-C(=O)-O-CH=CH2; acyl and vinyl oxygens are not interchanged.
    chain('vinyl-acetate',['H3C','C','O','CH','CH2'],orders={3:2},branches=[(1,'O',True)])
    d=drawings['vinyl-acetate'];a,b,_=d.bonds[-1];d.bonds[-1]=(a,b,2)
    for id,labels,order in [('polyethylene',['CH2','CH2'],1),('polyacetylene',['CH','CH'],2)]:
        d,ns=chain(id,labels,orders={0:order});d.repeatPorts=[(ns[0],-1),(ns[1],1)]
    chain('acrylonitrile',['H2C','CH','C','N'],orders={0:2,2:3})
