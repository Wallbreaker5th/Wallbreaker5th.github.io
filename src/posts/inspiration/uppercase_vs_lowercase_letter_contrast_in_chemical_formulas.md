---
date: 2023-09-08
category:
    - 突发奇想
tag:
    - 化学
    - Mathematica
title: 化学式中的「大小写对立」
---

## 问题
我们知道，书写元素符号时，应当正确使用大小写字母。那我们如果忽略大小写，会造成多少歧义？

例如：$\text{CO}$ 和 $\text{Co}$，前者是一氧化碳，后者是钴。

我们只讨论相对有名的物质，而非泛泛地讨论元素符号的随机组合。

## 解决
通过 Mathematica 我们可以获取到化学品的列表。

```mathematica
li = ChemicalData[];
```

并得到它们的化学式。

```mathematica
prop = "FormulaString";
set = EntityValue[li, prop];
set = Union[set];
```

将字符串按照大写后的结果分组，筛选出大小大于等于 2 的子集。

```mathematica
subsets = GatherBy[set, ToUpperCase];
subsets = Select[subsets, Length[#] >= 2 &]
```

运行结果为
```plain
{{"BaS", "BAs"}, {"Co", "CO"}, {"CoBr2", "COBr2"}, {"CoCl2", 
  "COCl2"}, {"CoS", "COS"}, {"Hf", "HF"}, {"No", "NO"}}
```

也可以找到它们的名称：
```mathematica
names = Map[Entity["Chemical", #]["Name"] &, subsets, {2}]
```

结果为：
```plain
{{"barium sulfide", "boron arsenide"}, {"cobalt", 
  "carbon monoxide"}, {"cobalt dibromide", 
  "carbonyl bromide"}, {"cobalt dichloride", 
  "phosgene"}, {"cobaltous sulfide", "carbonyl sulfide"}, {"hafnium", 
  "hydrogen fluoride"}, {"nobelium", "nitric oxide"}}
```

## 结论
::: note
下面出现的物质中文名称可能不准确。
:::

有 7 对化学式出现了「大小写对立」的情况，它们分别是：
- 硫化钡（$\text{BaS}$） 和 砷化硼（$\text{BAs}$）
- 钴（$\text{Co}$） 和 一氧化碳（$\text{CO}$）
- 溴化钴（$\text{CoBr}_2$） 和 羰基溴（$\text{COBr}_2$）
- 氯化钴（$\text{CoCl}_2$） 和 光气（$\text{COCl}_2$）
- 硫化钴（$\text{CoS}$） 和 羰基硫（$\text{COS}$）
- 铪（$\text{Hf}$） 和 氟化氢（$\text{HF}$）
- 锔（$\text{No}$） 和 一氧化氮（$\text{NO}$）
