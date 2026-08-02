#import "../../.vuepress/typst/packages/local/wdoc-post-to-blog/0.1.0/lib.typ": *
#show: init.with(blog_metadata: (
  title: "这个博客（又）能写 Typst 了！",
  description: "经过又一番神秘的折腾，在 Codex 的大手下，现在这个博客调整了 Typst 的支持方式，终于是一个比较正常的流程了。这篇文章即为基于 Typst 的 HTML 导出的示例。",
  keywords: ("Category: Typst", "Typst", "Meta"),
  date: datetime(year: 2026, month: 6, day: 17),
))

#title()

= 测试 1

滚滚长江东逝水，*浪花淘尽英雄*。

是非成败转头空，
- 青山依旧在，
- 几度夕阳红。

```cpp
// 这是一个 C++ 代码示例
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

= 测试 2

设 $a=1, b=2$，则 $a+b=3$。

$ integral_0^oo e^(-x^2) dif x = sqrt(pi)/2 $

= 测试 3

```typst-render-as-svg
#circle(fill: blue, radius: 1cm)
```

```typst-render-as-artifact
滚滚长江东逝水，*浪花淘尽英雄*。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。
```

= 测试 4

#let show-exmaple(it) = {
  it + raw(it.text, block: true, lang: "typst-render-as-svg")
}

#show-exmaple(```typ
#show: block.with(width: 210mm)

#set heading(numbering: "一、")

= 兰亭集序
#align(left)[
#let zhi = counter("zhi")
#show "之": it =>  {
  zhi.step()
  context{
    text(
      fill: gradient.linear(..color.map.turbo).sample(
        zhi.at(here()).at(0) / zhi.final().at(0) * 100%),
      it
    )
    super(str(zhi.at(here()).at(0)))
  }
}

#set par(first-line-indent: (amount: 2em, all: true))

永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右，引以为流觞曲水，列坐其次。虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。

是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。

夫人之相与，俯仰一世，或取诸怀抱，悟言一室之内；或因寄所托，放浪形骸之外。虽趣舍万殊，静躁不同，当其欣于所遇，暂得于己，快然自足，不知老之将至。及其所之既倦，情随事迁，感慨系之矣。向之所欣，俯仰之间，已为陈迹，犹不能不以之兴怀。况修短随化，终期于尽。古人云：“死生亦大矣。”岂不痛哉！

每览昔人兴感之由，若合一契，未尝不临文嗟悼，不能喻之于怀。固知一死生为虚诞，齐彭殇为妄作。后之视今，亦犹今之视昔。悲夫！故列叙时人，录其所述，虽世殊事异，所以兴怀，其致一也。后之览者，亦将有感于斯文。
]

```)
