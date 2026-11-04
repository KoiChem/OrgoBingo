// macOS-only font provenance step; normal SVG generation uses glyphs.json.
import Foundation
import CoreText
import CoreGraphics
let root = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "tools/structures")
let url = root.appendingPathComponent("fonts/LiberationSans-Regular.ttf")
let provider = CGDataProvider(url: url as CFURL)!
let cgFont = CGFont(provider)!
let font = CTFontCreateWithGraphicsFont(cgFont, 48, nil, nil)
var result: [String: Any] = [:]
func n(_ v: CGFloat) -> String { String(format: "%.4f", Double(v)) }
for char in "CHOINSalBrn1234567890()" {
    var u = String(char).utf16.first!
    var glyph: CGGlyph = 0
    precondition(CTFontGetGlyphsForCharacters(font, &u, &glyph, 1))
    let path = CTFontCreatePathForGlyph(font, glyph, nil)!
    var d = ""
    path.applyWithBlock { p in
        let e = p.pointee
        switch e.type {
        case .moveToPoint: d += "M\(n(e.points[0].x)) \(n(-e.points[0].y))"
        case .addLineToPoint: d += "L\(n(e.points[0].x)) \(n(-e.points[0].y))"
        case .addQuadCurveToPoint: d += "Q\(n(e.points[0].x)) \(n(-e.points[0].y)) \(n(e.points[1].x)) \(n(-e.points[1].y))"
        case .addCurveToPoint: d += "C\(n(e.points[0].x)) \(n(-e.points[0].y)) \(n(e.points[1].x)) \(n(-e.points[1].y)) \(n(e.points[2].x)) \(n(-e.points[2].y))"
        case .closeSubpath: d += "Z"
        @unknown default: fatalError()
        }
    }
    var advance = CGSize.zero
    CTFontGetAdvancesForGlyphs(font, .horizontal, &glyph, &advance, 1)
    let b = path.boundingBoxOfPath
    result[String(char)] = ["path": d, "advance": advance.width, "bounds": [b.minX, -b.maxY, b.maxX, -b.minY]]
}
// Distinctive halogen labels: bars for iodine I and a curved foot for chlorine l.
result["I"] = ["path": "M0.8000 -33.0234L12.5000 -33.0234L12.5000 -29.5000L8.9062 -29.5000L8.9062 -3.5000L12.5000 -3.5000L12.5000 0.0000L0.8000 0.0000L0.8000 -3.5000L4.4297 -3.5000L4.4297 -29.5000L0.8000 -29.5000Z", "advance": 13.3359375, "bounds": [0.8, -33.0234375, 12.5, 0.0]]
result["l"] = ["path": "M3.2344 -34.7812L7.4531 -34.7812L7.4531 -5.5000Q7.4531 -3.1000 9.5000 -3.1000L10.0000 -3.1000L10.0000 0.0000L8.7000 0.0000Q3.2344 0.0000 3.2344 -5.5000Z", "advance": 10.6640625, "bounds": [3.234375, -34.78125, 10.0, 0.0]]
let data = try JSONSerialization.data(withJSONObject: ["font": CTFontCopyFullName(font), "version": CTFontCopyName(font, kCTFontVersionNameKey) ?? "unknown" as CFString, "size": 48, "glyphs": result], options: [.prettyPrinted, .sortedKeys])
try data.write(to: root.appendingPathComponent("glyphs.json"))
