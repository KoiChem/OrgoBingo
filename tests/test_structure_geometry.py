"""Regressions for the user-visible ring drawing conventions."""
import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools/structures'))
from generate import build, bond_segments


class RingGeometryTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.drawings = build()

    def test_aromatic_attachment_centers_are_just_over_one_ring_edge_away(self):
        for id, d in self.drawings.items():
            for a, b, _ in d.bonds:
                if d.nodes[a]['text'] and not d.nodes[b]['text']:
                    a, b = b, a
                p, q = d.nodes[a], d.nodes[b]
                if a not in d.ringCenters or not q['text']:
                    continue
                edge = next(math.dist((p['x'], p['y']), (d.nodes[j]['x'], d.nodes[j]['y']))
                            for i, j in list(d.ringBonds) + [(j, i) for i, j in d.ringBonds]
                            if i == a)
                distance = math.dist((p['x'], p['y']), (q['x'], q['y']))
                with self.subTest(id=id, atom=q['text']):
                    self.assertAlmostEqual(distance / edge, 1.1, delta=.001)

    def test_left_cyclic_carbons_put_hydrogen_left_of_the_carbon(self):
        for id, d in self.drawings.items():
            if not d.cyclic:
                continue
            for n in d.nodes:
                with self.subTest(id=id, x=n['x']):
                    if n['x'] < -1e-6:
                        self.assertIn(n['text'], ('H2C', 'HC'))
                        self.assertEqual(n['chars'][n['anchor']]['char'], 'C')
                    else:
                        self.assertIn(n['text'], ('CH2', 'CH'))

    def test_labeled_ring_double_bonds_straddle_the_edge_and_extend_to_labels(self):
        for id in ('cyclopentene', 'cyclohexene'):
            d = self.drawings[id]
            a, b, _ = d.bonds[0]
            p, q = d.nodes[a], d.nodes[b]
            length = math.dist((p['x'], p['y']), (q['x'], q['y']))
            ux, uy = (q['x']-p['x'])/length, (q['y']-p['y'])/length
            offsets = []
            for line in bond_segments(d)[:2]:
                x, y, X, Y = line
                with self.subTest(id=id, line=line):
                    offset = -uy*(x-p['x']) + ux*(y-p['y'])
                    offsets.append(offset)
                    self.assertAlmostEqual(abs(offset), 3.5)
                    self.assertAlmostEqual(-uy*(X-p['x']) + ux*(Y-p['y']), offset)
                    # Extending 8 units toward either atom must enter its label box:
                    # the specified clearance is 7, with no additional ring trim.
                    for n, ex, ey, direction in ((p,x,y,-1),(q,X,Y,1)):
                        bx, by = ex+direction*8*ux, ey+direction*8*uy
                        left, top, right, bottom = n['box']
                        self.assertTrue(left <= bx <= right and top <= by <= bottom)
            self.assertAlmostEqual(sum(offsets), 0)


if __name__ == '__main__':
    unittest.main()
