#let mono = "DejaVu Sans Mono"
#let serif = "LXGW Neo XiHei"
#let math-font = "New Computer Modern Math"
#let cjk = "LXGW Neo XiHei"
#let cjk-mono = "LXGW WenKai GB"
#let cjk-italic = "LXGW WenKai GB"

#let export-target = sys.inputs.at("wdoc-export-target", default: if target() == html { "html" } else { "paged" })
#let is-html-export = export-target == "html"
#let page-width = sys.inputs.at("x-page-width", default: 210mm)

#let style-settings(doc) = {
  if is-html-export {
    doc
  } else {
    set text(font: ((
      name: serif,
      covers: "latin-in-cjk",
    ), cjk))
    show math.equation: set text(font: (math-font, cjk-mono))
    show emph: set text(font: ((
      name: serif,
      covers: "latin-in-cjk",
    ), cjk-italic))
    show raw: set text(font: ((
      name: mono,
      covers: "latin-in-cjk",
    ), cjk-mono), size: 1.25em)

    show heading: set text(font: cjk, weight: 400)

    block(width: 220mm, doc, fill: red)
  }
}

#let render-preview(raw-block, inline: false) = {
  if is-html-export {
    raw-block
  } else {
    show: style-settings
    let body = eval("[" + raw-block.text + "]")
    if inline {
      body
    } else {
      align(center, block(align(left, body)))
    }
  }
}

#let init(doc, width: page-width) = {
  show: style-settings

  if not is-html-export {
    set page(width: width, height: auto, margin: 5mm)
  }

  show title: it => {
    if is-html-export {
      none
    } else {
      it
    }
  }

  show raw.where(block: true, lang: "typst-render-as-svg"): it => render-preview(it)
  show raw.where(block: true, lang: "typst-render-as-artifact"): it => render-preview(it, inline: true)

  doc
}

#let si(val, unit) = {
  val + h(3em / 18) + math.upright(unit)
}

#let up(text) = {
  math.upright(text)
}

#let left-stroke-box(content) = block(stroke: (left: luma(90%) + 5pt), inset: (left: 1em, y: 5pt), content)

#let comment(it) = {
  (
    no-number,
    sym.triangle + " " + text(it, fill: luma(40%)),

    no-number,
    sym.triangle + " " + text(it, fill: luma(40%))
  )
}
