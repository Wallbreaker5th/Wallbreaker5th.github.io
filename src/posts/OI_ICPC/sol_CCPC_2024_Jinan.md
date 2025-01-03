---
date: 2024-12-07
category:
    - OI×ICPC
tag:
    - OI×ICPC
    - OI×ICPC - 题解
    - OI×ICPC - 搜索
    - OI×ICPC - 枚举
    - OI×ICPC - 构造
    - OI×ICPC - 计算几何
    - OI×ICPC - 凸包
    - OI×ICPC - 扫描线
    - OI×ICPC - 数位 DP

title: CCPC 2024 济南区域赛（Jinan Regional）部分题解
excerpt: CCPC 2024 济南区域赛（Jinan Regional）部分题目的题解：<br>A. The Fool<br>B. The Magician<br>C. The Empress<br>E. The Chariot<br>G. The Wheel of Fortune<br>H. Strength
---


::: warning
题解写得可能非常抽象。

「如果一个题解你看不懂，那是题解垃圾而不是你垃圾。」
:::

比赛链接：[UCup](https://contest.ucup.ac/contest/1843), [Codeforces Gym](https://codeforces.com/gym/105540)

## B. The Magician
### 题意
有若干张扑克牌（没有大小王，只关心花色）和六种塔罗牌（每种有至多一张）。每张塔罗牌可以选择使用、顺序任意，分别可以：
- 把至多三张牌变为方片（梅花、红桃、黑桃）
- 把一张牌变为通配符
- 把一张牌复制到另一张牌上
求能凑出至多多少 flush（五张同花色）。多组数据、多组数据总共凑出来不超过一副牌。

### 题解
将操作简化为：先通过前四种塔罗牌调整花色，凑出已有的 flush，再视情况使用后两种（每张牌都几乎相当于一次任意的把一张牌变为另一花色的操作）。前一部分直接 $17^4$ 暴力，后一部分稍微分类讨论一下。

## C. The Empress
### 题意
有一个初始为空的栈。你可以用以下两种指令编写程序：
- `POP a GOTO x; PUSH b GOTO y`：如果栈顶是 $a$，则弹出栈顶并跳转到 $x$；否则，将 $b$ 入栈并跳转到 $y$。
- `HALT; PUSH b GOTO y`：如果栈为空，则停机；否则，将 $b$ 入栈并跳转到 $y$。
构造一个不超过 $64$ 行的程序，执行恰好 $k$ 条指令。$k\leq 2^{31}-1$ 且为奇数。

### 题解
下文考虑计数 `PUSH` 的次数；总的指令数即为 `PUSH` 次数乘二加一。有两种循环，分别可以让内层的 `PUSH` 次数乘二加一和乘二加二：
```
// * 2 + 2
i    |    POP a_k GOTO j+1; PUSH a_k GOTO i+1
i+1  |    // 循环体
...
j    |    POP b_k GOTO i; PUSH b_k GOTO i+1
j+1  |    // 外层循环
```

```
// * 2 + 1
i    |    // 循环体
...
j    |    POP c_k GOTO j+1; PUSH c_k GOTO i
j+1  |    // 外层循环
```

其中 $a_k$、$b_k$、$c_k$ 互不相同。

## E. The Chariot
### 题意
某地出租车收费方式为：前 $x$ 公里为起步价 $a$ 元，之后 $y$ 公里为每公里 $b$ 元，之后为每公里 $c$ 元。你要前进 $d$ 公里、可以多段乘坐。求最小花费。值域 $10^{2077}$。

### 题解
在放弃繁琐的分类讨论后，我们采取了以下做法：
- 取一个 $n$，代表要走 $n$ 段。$n$ 取 $0$、$d/x$、$d/(x+y)$ 左右的若干整数。
- $d$ 公里不一定能被均分，我们将余数尽量均匀地分配。~~实际上我们还写了把余数全都给一段的策略，但好像不需要。~~
- 各种策略取 $\min$。

## G. The Wheel of Fortune
### 题意
有一个凸多边形的转盘，单位面积质量为一。其中一个点被钉住，从这个点向各个顶点连线，得到若干个三角形区域。在转盘上等概率随机一个点，贴上一个砝码，质量为 $w$。求转盘重心落在各个区域的概率。$n\leq 10^5$。

### 题解
口胡出来了，没写。

首先可以求出转盘本身的重心和质量。组合后，转盘的重心是两个坐标的加权平均，因此重心在一个【原转盘以原重心为基准点缩放一定倍数】得到的多边形内部均匀随机；特别地，这个多边形完全在原多边形内部。现在以转盘中心为原点，每个区域可以看作是一个极角的区间（本来是三角形，但远处的边没有意义），要求每个区域各自与多边形的交。把多边形再拆成若干个过原点的三角形，且将两条过原点的边的极角做扫描线；考虑扫两个区域的交界，同时累计边界顺时针方向的三角形面积之和，除此之外还有至多两个三角形是被交界切开的单独处理。从而可以各个面积。

## H. Strength
### 题意
对于一个十进制数 $\overline{x_k x_{k-1} \cdots x_1}$，将其「激进舍入」，指做一次或多次以下操作：
- 选择一位 $x_i$
- 如果 $x_i<5$，则将这个数减去 $x_i \times 10^{i-1}$；否则，将这个数加上 $(10-x_i) \times 10^{i-1}$。

求 $0$ 到 $z$ 有多少个数能激进舍入到 $x$，值域 $10^{18}$，$10^5$ 组数据。

### 题解
从低位往高位数位 DP。状态上除了记录位数和当前是否超出上界以外，还记录当前能不能往更高位进位（不能、可以、必须三种情况），存储相应的方案数。转移时，如果之前可以不进位，则当前位可以选择舍入、不舍入；如果之前可以进位，则当前位在进位前后可以分别选择是否舍入；这样可以知道当前能不能转移、转移到哪里（能不能进位、能不能不进位）。




