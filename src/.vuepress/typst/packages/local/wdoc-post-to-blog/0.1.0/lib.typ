#import "@preview/cuti:0.4.0": show-cn-fakebold

#let mono = "DejaVu Sans Mono"
#let serif = "LXGW Neo XiHei"
#let math-font = "New Computer Modern Math"
#let cjk = "LXGW Neo XiHei"
#let cjk-mono = "LXGW WenKai GB"
#let cjk-italic = "LXGW WenKai GB"

#let export-target = sys.inputs.at("wdoc-export-target", default: "paged")
#let is-html-export = export-target == "html"
#let page-width = sys.inputs.at("x-page-width", default: 210mm)

#let style-settings(doc) = {
  if is-html-export {
    doc
  } else {
    set page(fill: white)
    show: show-cn-fakebold
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

    doc
  }
}

#let render-preview(raw-block, inline: false) = {
  if is-html-export {
    raw-block
  } else {
    let body = eval("[" + raw-block.text + "]")
    if inline {
      body
    } else {
      align(center, block(align(left, body)))
    }
  }
}

#let blog-date(date) = {
  if date == none {
    none
  } else {
    date.display("[year]-[month]-[day]")
  }
}

#let blog-metadata-config(blog_metadata) = {
  let title = blog_metadata.at("title", default: none)
  let description = blog_metadata.at("description", default: none)
  let keywords = blog_metadata.at("keywords", default: ())
  let date = blog_metadata.at("date", default: none)

  (
    title: title,
    description: description,
    keywords: keywords,
    date: date,
    query: (
      title: title,
      description: description,
      keywords: keywords,
      date: blog-date(date),
    ),
  )
}

#let init(doc, width: page-width, page_margin: 5mm, blog_metadata: (:)) = {
  let metadata-config = blog-metadata-config(blog_metadata)

  set document(
    title: metadata-config.title,
    description: metadata-config.description,
    keywords: metadata-config.keywords,
    date: metadata-config.date,
  )

  set page(width: width, height: auto, margin: page_margin)

  show: style-settings

  show title: it => {
    if is-html-export {
      none
    } else {
      it
    }
  }

  show raw.where(block: true, lang: "typst-render-as-svg"): it => render-preview(it)
  show raw.where(block: true, lang: "typst-render-as-artifact"): it => render-preview(it, inline: true)

  if metadata-config != none {
    [#metadata(metadata-config.query) <blog-metadata>]
  }

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
