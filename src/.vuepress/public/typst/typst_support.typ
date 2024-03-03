#import "@preview/cetz:0.2.0"

#set page(width: json("./page_config.json").width * 1pt, height: auto, margin: 5pt)
#set text(font: ("LXGW Neo XiHei",), size: 12pt, lang: "zh", region: "CN")
#show raw: set text(font: ("DejaVu Sans Mono", "LXGW Neo XiHei",))
#show math.equation: set text(font: "New Computer Modern Math")

如果你用流量点开了这篇文章，那我首先要向你道个歉——因为你大概加载了无数个字体、一个 Typst 编译器和其他一堆乱七八糟的东西。

话说回来，借助 #link("https://github.com/Myriad-Dreamin/typst.ts/", "Typst.ts") 对 #link("https://typst.app", "Typst") 的封装，这个博客现在能够在浏览器中渲染 Typst 代码。你还可以试一试更改浏览器窗口大小，内容排版也会自动适应。不过截至目前，Typst 还不支持 HTML 导出，这个是用 Canvas 渲染的排版结果，效果不够理想。期待 Typst 支持 HTML 导出的一天。

你可以在这个博客的 GitHub Repo 中找到对应的源代码。代码写得很丑（所有与多线程相关的东西我都搞不明白），同时也暂时缺少一些功能（比如加入图片），字体也塞了一大堆，等要用到的时候再加吧。

总之，让我们观赏一下 Typst 的实力吧！!1

#let show-exmaple(raw) = {
  align(center, rect(rect(stroke: none, inset: 1em, fill: luma(95%), raw) + v(1em) + eval("["+raw.text+"]"), radius: 10pt, width: 90%, inset: 0.5cm))
}

#show-exmaple(```typ
#set text(size: 0.9em)
#grid(
  columns: (auto, ) * 5,
  gutter: 8pt,
  ..{
    for i in range(5) {
      range(5).map(j =>
        $ #(i+1) times #(j+1) = #((i+1)*(j+1)) $)
    }
  }
)
```)

#show-exmaple(```typ


#set heading(numbering: "一、")

= 兰亭集序
#align(left)[
#let zhi = counter("zhi")
#show "之": it => {
  zhi.step()
  locate(loc => {
    text(
      fill: gradient.linear(..color.map.turbo).sample(
        zhi.at(loc).at(0) / zhi.final(loc).at(0) * 100%),
      it
    )
    super(str(zhi.at(loc).at(0)))
  })
}

#set par(first-line-indent: 2em)

#par(h(0em))

永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右，引以为流觞曲水，列坐其次。虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。

是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。

夫人之相与，俯仰一世，或取诸怀抱，悟言一室之内；或因寄所托，放浪形骸之外。虽趣舍万殊，静躁不同，当其欣于所遇，暂得于己，快然自足，不知老之将至。及其所之既倦，情随事迁，感慨系之矣。向之所欣，俯仰之间，已为陈迹，犹不能不以之兴怀。况修短随化，终期于尽。古人云：“死生亦大矣。”岂不痛哉！

每览昔人兴感之由，若合一契，未尝不临文嗟悼，不能喻之于怀。固知一死生为虚诞，齐彭殇为妄作。后之视今，亦犹今之视昔。悲夫！故列叙时人，录其所述，虽世殊事异，所以兴怀，其致一也。后之览者，亦将有感于斯文。
]

```)

#show-exmaple(```typ
#import "@preview/cetz:0.2.0"
#align(center, cetz.canvas({
  import cetz.draw: *
  for i in range(0, 360, step: 5) {
    line(
      (0, 0), (i * 1deg, i / 360),
      stroke: blue.lighten(i / 360 * 100%)
    )
  }
  circle((0, 0), radius: 1, stroke: blue, name: "circle")
  content("circle.south", anchor: "north", padding: 1em)[
    $ x^2+y^2=r^2 $
    $ integral_theta dif l = 2 pi r $
    $ (diff y)/(diff x) dot x/y = -1 $
  ]
}, length: 2cm))
```)
