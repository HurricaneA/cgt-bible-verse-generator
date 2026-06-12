// Convert every src/bible/*.json (Unicode Tamil) to src/bible_legacy/*.json
// (Bamini bytes that the Tharmini font renders), preserving the JSON schema.
//
// Uses the standard Unicode->Bamini converter (scripts/unicode-bamini.js). Two
// Tharmini/source-specific adjustments are applied, neither of which is a glyph
// patch:
//   1. Semicolon: Bamini uses the ';' slot (0x3b) for pulli, so a literal ';'
//      would vanish. Remap it to Tharmini's semicolon glyph at 0x40.
//   2. Double-matra: the source JSON has a systematic typo where long-uu was
//      double-keyed as  ு + ூ  (e.g. "அல்லேலுூயா" for "அல்லேலூயா"). Collapse it.
//
// Writes corruption_report.txt listing any verse whose converted text still
// contains a byte Tharmini cannot render (pre-existing source corruption).

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { unicodeToBamini } = require('./unicode-bamini.cjs')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src', 'bible')
const DST = path.join(ROOT, 'src', 'bible_legacy')

const U = 'ு' // ு
const UU = 'ூ' // ூ
const SEMI_SENTINEL = ''

function toTharmini(text) {
  text = text.split(U + UU).join(UU) // normalize double-matra
  text = text.split(';').join(SEMI_SENTINEL) // protect literal semicolons
  let out = unicodeToBamini(text)
  out = out.split(SEMI_SENTINEL).join(String.fromCharCode(0x40)) // Tharmini ';'
  return out
}

// --- read the set of byte values Tharmini actually has glyphs for ---
function tharminiCmap() {
  const buf = fs.readFileSync(path.join(ROOT, 'src', 'font', 'Tharmini.ttf'))
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const numTables = dv.getUint16(4)
  let cmapOff = 0
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16
    const tag = String.fromCharCode(...[0, 1, 2, 3].map((k) => buf[rec + k]))
    if (tag === 'cmap') cmapOff = dv.getUint32(rec + 8)
  }
  const codes = new Set()
  const nSub = dv.getUint16(cmapOff + 2)
  for (let i = 0; i < nSub; i++) {
    const subOff = cmapOff + dv.getUint32(cmapOff + 4 + i * 8 + 4)
    const fmt = dv.getUint16(subOff)
    if (fmt === 0) {
      for (let c = 0; c < 256; c++) if (buf[subOff + 6 + c] !== 0) codes.add(c)
    } else if (fmt === 6) {
      const first = dv.getUint16(subOff + 6)
      const count = dv.getUint16(subOff + 8)
      for (let k = 0; k < count; k++)
        if (dv.getUint16(subOff + 10 + k * 2) !== 0) codes.add(first + k)
    } else if (fmt === 4) {
      const segX2 = dv.getUint16(subOff + 6)
      const segCount = segX2 / 2
      const endO = subOff + 14
      const startO = endO + segX2 + 2
      const deltaO = startO + segX2
      const rangeO = deltaO + segX2
      for (let s = 0; s < segCount; s++) {
        const end = dv.getUint16(endO + s * 2)
        const start = dv.getUint16(startO + s * 2)
        const delta = dv.getUint16(deltaO + s * 2)
        const rangeOffset = dv.getUint16(rangeO + s * 2)
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let g
          if (rangeOffset === 0) g = (c + delta) & 0xffff
          else {
            const gi = dv.getUint16(rangeO + s * 2 + rangeOffset + (c - start) * 2)
            g = gi === 0 ? 0 : (gi + delta) & 0xffff
          }
          if (g !== 0) codes.add(c)
        }
      }
    }
  }
  return codes
}

const CMAP = tharminiCmap()
const report = []

function convert(node, ctx) {
  if (Array.isArray(node)) return node.map((x) => convert(x, ctx))
  if (node && typeof node === 'object') {
    if ('chapter' in node) ctx = { ...ctx, chapter: node.chapter }
    if ('verse' in node) ctx = { ...ctx, verse: node.verse }
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === 'text' && typeof v === 'string') {
        const leg = toTharmini(v)
        const bad = [...leg].filter((c) => !CMAP.has(c.charCodeAt(0)))
        if (bad.length)
          report.push([ctx.book, ctx.chapter, ctx.verse, v, [...new Set(bad)].join('')])
        out[k] = leg
      } else out[k] = convert(v, ctx)
    }
    return out
  }
  return node
}

fs.mkdirSync(DST, { recursive: true })
const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json')).sort()
let count = 0
for (const name of files) {
  const data = JSON.parse(fs.readFileSync(path.join(SRC, name), 'utf8'))
  // Skip non-book files (e.g. Books.json — a table-of-contents index with no verses).
  if (!data || !Array.isArray(data.chapters)) continue
  count++
  let book = data?.book
  if (book && typeof book === 'object') book = book.english || book.tamil
  if (!book) book = name.replace(/\.json$/, '')
  const conv = convert(data, { book })
  fs.writeFileSync(path.join(DST, name), JSON.stringify(conv, null, 2))
}
console.log(`converted ${count} books -> src/bible_legacy`)

const rp = path.join(ROOT, 'corruption_report.txt')
let txt = `Source corruption report — ${report.length} verses with unrenderable chars\n`
txt += `(these characters render wrong in the original Unicode too)\n\n`
for (const [book, ch, vs, text, bad] of report)
  txt += `${book} ${ch}:${vs}  bad=${JSON.stringify(bad)}\n    ${text}\n`
fs.writeFileSync(rp, txt)
console.log(`wrote corruption report: ${report.length} verses -> corruption_report.txt`)
