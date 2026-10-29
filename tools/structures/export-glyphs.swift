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
for char in "CHOI1234567890()" {
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
let data = try JSONSerialization.data(withJSONObject: ["font": CTFontCopyFullName(font), "version": CTFontCopyName(font, kCTFontVersionNameKey) ?? "unknown" as CFString, "size": 48, "glyphs": result], options: [.prettyPrinted, .sortedKeys])
try data.write(to: root.appendingPathComponent("glyphs.json"))
