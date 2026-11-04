# 初期化合物の出典

2026-10-30追記：無水マレイン酸（`maleic-anhydride`）を追加。PubChem PUG RESTのCID 7923から分子式 `C4H2O3` とConnectivitySMILES `C1=CC(=O)OC1=O` を取得し、五員環、2個のC=O、1個のC=C、架橋酸素を確認した。

- [PubChem CID 7923](https://pubchem.ncbi.nlm.nih.gov/compound/7923)
- [PubChem PUG REST](https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/7923/property/MolecularFormula,CanonicalSMILES/JSON)
- [NIOSH：Maleic anhydride](https://www.cdc.gov/niosh/npg/npgd0376.html)

マスターと初期セットの末尾へ追加し、任意セットへの自動追加はしない。分類は酸無水物・炭素間不飽和結合、骨格は脂肪族（非芳香族）、タグなし。

2026-10-29にPubChem PUG RESTで31件の分子式とSMILESを取得し、初期データと構造表記を照合。フマル酸・マレイン酸は幾何異性も確認。

| ID | PubChem |
|---|---|
| methanol | [CID 887](https://pubchem.ncbi.nlm.nih.gov/compound/887) |
| ethanol | [CID 702](https://pubchem.ncbi.nlm.nih.gov/compound/702) |
| 1-propanol | [CID 1031](https://pubchem.ncbi.nlm.nih.gov/compound/1031) |
| 2-propanol | [CID 3776](https://pubchem.ncbi.nlm.nih.gov/compound/3776) |
| 2-butanol | [CID 6568](https://pubchem.ncbi.nlm.nih.gov/compound/6568) |
| ethylene-glycol | [CID 174](https://pubchem.ncbi.nlm.nih.gov/compound/174) |
| glycerol | [CID 753](https://pubchem.ncbi.nlm.nih.gov/compound/753) |
| dimethyl-ether | [CID 8254](https://pubchem.ncbi.nlm.nih.gov/compound/8254) |
| diethyl-ether | [CID 3283](https://pubchem.ncbi.nlm.nih.gov/compound/3283) |
| acetone | [CID 180](https://pubchem.ncbi.nlm.nih.gov/compound/180) |
| methyl-ethyl-ketone | [CID 6569](https://pubchem.ncbi.nlm.nih.gov/compound/6569) |
| formaldehyde | [CID 712](https://pubchem.ncbi.nlm.nih.gov/compound/712) |
| acetaldehyde | [CID 177](https://pubchem.ncbi.nlm.nih.gov/compound/177) |
| propionaldehyde | [CID 527](https://pubchem.ncbi.nlm.nih.gov/compound/527) |
| formic-acid | [CID 284](https://pubchem.ncbi.nlm.nih.gov/compound/284) |
| acetic-acid | [CID 176](https://pubchem.ncbi.nlm.nih.gov/compound/176) |
| propionic-acid | [CID 1032](https://pubchem.ncbi.nlm.nih.gov/compound/1032) |
| lactic-acid | [CID 612](https://pubchem.ncbi.nlm.nih.gov/compound/612) |
| fumaric-acid | [CID 444972](https://pubchem.ncbi.nlm.nih.gov/compound/444972) |
| maleic-acid | [CID 444266](https://pubchem.ncbi.nlm.nih.gov/compound/444266) |
| methyl-formate | [CID 7865](https://pubchem.ncbi.nlm.nih.gov/compound/7865) |
| methyl-acetate | [CID 6584](https://pubchem.ncbi.nlm.nih.gov/compound/6584) |
| ethyl-acetate | [CID 8857](https://pubchem.ncbi.nlm.nih.gov/compound/8857) |
| acetic-anhydride | [CID 7918](https://pubchem.ncbi.nlm.nih.gov/compound/7918) |
| iodoform | [CID 6374](https://pubchem.ncbi.nlm.nih.gov/compound/6374) |
| palmitic-acid | [CID 985](https://pubchem.ncbi.nlm.nih.gov/compound/985) |
| stearic-acid | [CID 5281](https://pubchem.ncbi.nlm.nih.gov/compound/5281) |
| oxalic-acid | [CID 971](https://pubchem.ncbi.nlm.nih.gov/compound/971) |
| 2-methyl-2-propanol | [CID 6386](https://pubchem.ncbi.nlm.nih.gov/compound/6386) |
| 1-butanol | [CID 263](https://pubchem.ncbi.nlm.nih.gov/compound/263) |
| butyric-acid | [CID 264](https://pubchem.ncbi.nlm.nih.gov/compound/264) |

## 追加資料（2026-11-02）

- 2,4,6-トリニトロトルエン（TNT）：[NIST Chemistry WebBook, CAS 118-96-7](https://webbook.nist.gov/cgi/cbook.cgi?ID=C118967)。分子式C7H5N3O6、メチル基に対して2,4,6位のニトロ基を照合。

## 脂肪族化合物の追加（2026-11-02）

PubChemの分子式と重原子の結合・結合次数を図の結合グラフと照合した。シス・トランスは別途幾何配置を検査した。2-ペンテンはシス体を登録する。

| ID | PubChem |
| --- | --- |
| methane | [CID 297](https://pubchem.ncbi.nlm.nih.gov/compound/297) |
| ethane | [CID 6324](https://pubchem.ncbi.nlm.nih.gov/compound/6324) |
| propane | [CID 6334](https://pubchem.ncbi.nlm.nih.gov/compound/6334) |
| butane | [CID 7843](https://pubchem.ncbi.nlm.nih.gov/compound/7843) |
| pentane | [CID 8003](https://pubchem.ncbi.nlm.nih.gov/compound/8003) |
| hexane | [CID 8058](https://pubchem.ncbi.nlm.nih.gov/compound/8058) |
| 2-methylpropane | [CID 6360](https://pubchem.ncbi.nlm.nih.gov/compound/6360) |
| 2-methylbutane | [CID 6556](https://pubchem.ncbi.nlm.nih.gov/compound/6556) |
| 23-dimethylbutane | [CID 6589](https://pubchem.ncbi.nlm.nih.gov/compound/6589) |
| cyclopropane | [CID 6351](https://pubchem.ncbi.nlm.nih.gov/compound/6351) |
| cyclobutane | [CID 9250](https://pubchem.ncbi.nlm.nih.gov/compound/9250) |
| cyclopentane | [CID 9253](https://pubchem.ncbi.nlm.nih.gov/compound/9253) |
| cyclohexane | [CID 8078](https://pubchem.ncbi.nlm.nih.gov/compound/8078) |
| ethylene | [CID 6325](https://pubchem.ncbi.nlm.nih.gov/compound/6325) |
| propene | [CID 8252](https://pubchem.ncbi.nlm.nih.gov/compound/8252) |
| 1-butene | [CID 7844](https://pubchem.ncbi.nlm.nih.gov/compound/7844) |
| cis-2-butene | [CID 5287573](https://pubchem.ncbi.nlm.nih.gov/compound/5287573) |
| trans-2-butene | [CID 62695](https://pubchem.ncbi.nlm.nih.gov/compound/62695) |
| 2-methylpropene | [CID 8255](https://pubchem.ncbi.nlm.nih.gov/compound/8255) |
| 2-pentene（シス体） | [CID 5326160](https://pubchem.ncbi.nlm.nih.gov/compound/5326160) |
| 13-butadiene | [CID 7845](https://pubchem.ncbi.nlm.nih.gov/compound/7845) |
| cyclopentene | [CID 8882](https://pubchem.ncbi.nlm.nih.gov/compound/8882) |
| cyclohexene | [CID 8079](https://pubchem.ncbi.nlm.nih.gov/compound/8079) |
| acetylene | [CID 6326](https://pubchem.ncbi.nlm.nih.gov/compound/6326) |
| propyne | [CID 6335](https://pubchem.ncbi.nlm.nih.gov/compound/6335) |
| 1-butyne | [CID 7846](https://pubchem.ncbi.nlm.nih.gov/compound/7846) |
| 2-butyne | [CID 10419](https://pubchem.ncbi.nlm.nih.gov/compound/10419) |
| 3-methyl-1-butyne | [CID 69019](https://pubchem.ncbi.nlm.nih.gov/compound/69019) |
| chloromethane | [CID 6327](https://pubchem.ncbi.nlm.nih.gov/compound/6327) |
| dichloromethane | [CID 6344](https://pubchem.ncbi.nlm.nih.gov/compound/6344) |
| trichloromethane | [CID 6212](https://pubchem.ncbi.nlm.nih.gov/compound/6212) |
| tetrachloromethane | [CID 5943](https://pubchem.ncbi.nlm.nih.gov/compound/5943) |
| chloroethane | [CID 6337](https://pubchem.ncbi.nlm.nih.gov/compound/6337) |
| 12-dichloroethane | [CID 11](https://pubchem.ncbi.nlm.nih.gov/compound/11) |
| 12-dibromoethane | [CID 7839](https://pubchem.ncbi.nlm.nih.gov/compound/7839) |
| 1122-tetrabromoethane | [CID 6588](https://pubchem.ncbi.nlm.nih.gov/compound/6588) |
| vinyl-chloride | [CID 6338](https://pubchem.ncbi.nlm.nih.gov/compound/6338) |
| vinyl-acetate | [CID 7904](https://pubchem.ncbi.nlm.nih.gov/compound/7904) |
| acrylonitrile | [CID 7855](https://pubchem.ncbi.nlm.nih.gov/compound/7855) |

繰り返し単位は [PubChem: Polyethylene](https://pubchem.ncbi.nlm.nih.gov/compound/polyethylene) と [ACS: Polyacetylene](https://pubs.acs.org/doi/10.1021/jp011611w) を参照した。

## 性質・特徴（2026-11-04）

添付の脂肪族化合物32種の記述を使用。文字数は添付資料に合わせ、全角1字・半角0.5字として最大30字。以下は資料の記述を物性・条件に合わせて調整した。

- ジメチルエーテルと酢酸メチルの「水に難溶」は削除。後者の水への溶解度は20℃で約25 g/100 mL。[NIOSH](https://www.cdc.gov/niosh/npg/npgd0391.html)、[PubChem](https://pubchem.ncbi.nlm.nih.gov/compound/8254)
- グリセリンの「無毒」は削除。[NIOSH](https://www.cdc.gov/niosh/npg/npgd0302.html)
- 食酢に含まれる酢酸は「主成分」ではなく「酸味成分」と記載。
- フマル酸の「加熱しても脱水せず昇華のみ」および無水マレイン酸の「フマル酸からは生じない」は条件を限定しない断定を避けた。フマル酸は昇華するが、蒸留条件で無水マレイン酸を生じる記述もある。[PubChem](https://pubchem.ncbi.nlm.nih.gov/compound/444972)、[National Library of Medicine収蔵書籍](https://digirepo.nlm.nih.gov/ext/dw/04710900R/PDF/04710900R.pdf)
- 無水酢酸の「酸性なし」は削除。水と反応して酢酸となる。[NIOSH](https://www.cdc.gov/niosh/npg/npgd0003.html)
- ヨードホルムの「CH3CO-などをもつ化合物」は酢酸や酢酸エチルまで対象と誤解されるため、陽性例のアセトンを用いた表現に変更。[大学の有機化学実験資料](https://faculty.kfupm.edu.sa/CHEM/hmuallem/courses/Chem303/Classification_Tests_Handout.pdf)
