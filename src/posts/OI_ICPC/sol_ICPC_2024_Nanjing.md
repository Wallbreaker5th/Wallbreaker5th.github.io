---
date: 2024-11-10
category:
    - OI×ICPC
tag:
    - OI×ICPC
    - OI×ICPC - 题解
    - OI×ICPC - 基环树
    - OI×ICPC - 换根 DP
    - OI×ICPC - 计数 DP
    - OI×ICPC - 单调栈
    - OI×ICPC - 凸包
    - OI×ICPC - 图论 - 最短路
    - OI×ICPC - 交互题
    - OI×ICPC - 图论 - 重心
    - OI×ICPC - FFT
    - OI×ICPC - min-max 容斥
    - OI×ICPC - 贪心
    - OI×ICPC - 计算几何
    - OI×ICPC - 扫描线
title: ICPC 2024 南京区域赛（Nanjing Regional）部分题解
excerpt: ICPC 2024 南京区域赛（Nanjing Regional）部分题目的题解：<br>A. Hey, Have You Seen My Kangaroo?<br>B. Birthday Gift<br>C. Topology<br>E. Left Shifting 3<br>F. Subway<br>G. Binary Tree<br>I. Bingo<br>K. Strips<br>M. Ordainer of Inexorable Judgment
---

::: warning
题解写得可能非常抽象。

「如果一个题解你看不懂，那是题解垃圾而不是你垃圾。」
:::

比赛链接：[UCup](https://contest.ucup.ac/contest/1828)

## A. Hey, Have You Seen My Kangaroo?
### 题意
（一年一度的袋鼠题）

一个 $n\times m$ 的网格，初始边界外和某些格子是墙，空格子都各有一只袋鼠。输入一个长为 $k$ 的字符串，字符为 `LRUD`，代表每只袋鼠同时向某个方向跳一格（撞到墙则停留原地）。现无限循环执行这个字符串，对于每个 $i$，求出第一个时刻，使得恰有 $i$ 个格子有袋鼠。$nm\leq 2\times 10^5, k\leq 200$。

### 题解
（场上没开这道题）

先转化为求每次操作后有多少格子有袋鼠。先考虑整周期处的答案：经过一整个循环节，这样每个格子会有一个到达的格子，会连成一个内向的基环树森林；求出每个点到环的距离 $h_u$，可以得到每个点经过多少循环节后贡献会消失（环上的点距离看作 $+\infty$）。接着考虑非整周期的答案：先模拟前 $k$ 次操作，记录答案，并记录每一次操作会导致的合并操作；考虑之后每一轮这些合并操作还存不存在：$u$ 和 $v$ 的合并可以在前 $\min(h_u,h_v)$ 轮里都发生，从而让答案减一，合并后得到的新点的深度为 $\max(h_u,h_v)$。复杂度 $O(nmk)$。

## B. Birthday Gift
### 题意
一个长为 $n$ 的串，包含 0,1,2 三种字符。你可以多次三选一操作：将 2 变为 0 或者 1；删除子串 11；删除子串 00。求最后得到的串的最小长度。$n\leq 2\times 10^5$。

### 题解
（被 PKU 队伍带偏以为这是最签到的题了。一开始想了个假贪心，然后想了个 DP 记到当前为止的最短的 01 交错串，但其实要记的是可能达成的 01 交错串长度的一个区间）

先把所有 2 变成 0 还是 1 决定了。将奇数位置的字符翻转，这样一次操作是删除相邻两个不同字符，则最后剩下的串一定是全 0 或者全 1。于是先把奇数位置的 0/1 翻转，然后每个 2 都变为 0/1 中的较少者。

## C. Topology
### 题意
给定一棵外向树，对于每个 $i$，求有多少拓扑序 $p$，满足 $p_i=i$。$n\leq 5000$。

### 题解
首先设 $f[u]$ 表示以 $u$ 为根的子树的拓扑序数量。设 $g[u, i]$ 表示：考虑整棵树除了 $u$ 的子树外的部分，这些部分使得 $u$ 在拓扑序里的第 $i$ 位的方案数。转移时推一推大概怎么换根，并发现可以前缀和优化。

## D. Toe-Tac-Tics
一眼（？）超现实数，但是不会。

## E. Left Shifting 3
### 题意
给定一长为 $n$ 的字符串，求其循环移位 $\leq k$ 次后，至少能有多少个 `nanjing` 子串。$n\leq 2\times 10^5$。

### 题解
由于 `nanjing` 串很短且没有 border，因此枚举 $7$ 以内的循环移位即可。~~当然也可以对于每个 `nanjing` 考虑其能贡献到哪个循环移位次数的区间，然后差分前缀和做。~~

## F. Subway
### 题意
有 $n$ 个站，$k$ 条地铁线，每条地铁线有 $a_i$、$b_i$、以及经过的一串站点（单向，相邻站点之间有距离）。你从 $1$ 号站出发，坐上任意一条地铁线，最后：
- 你可以沿着一条地铁线坐，代价为相邻站点的距离的累积；
- 在某个站点从 $x$ 号线换乘到 $y$ 号线，代价为 $a_y b_x$。

求到每个点的最小代价。$n,k \leq 2\times 10^5$，线路段数 $\leq 10^6$。

### 题解
（还有接近两个小时的时候，队友写完 I 非常上头，上来就写这题，结果最后没调出来）

对于每个 (站点, 线路) 当做一个点，可以行 Dijkstra，这是需要数据结构来维护换乘。对于每个站点，我们在 $x$ 号线距离 $d_x$ 落定时，把 $d_x + a b_x$ 放进这个点（每次放的 $d$ 会单调递增），然后这个站点上 $a_y$ 最小的线（当然是还未落定的线）会有最小的 $d_x + a_y b_x$，我们需要把这个东西放进堆里面。（大概是可以单调栈维护凸包/半平面交来维护的？）


## G. Binary Tree
### 题意
交互题。给定一棵二叉树，存在一个关键点，未知。一次询问你可以给出点 $u,v$，返回关键点离 $u$ 近、离 $v$ 近还是一样近。询问次数不超过 $\lfloor \log_2 n \rfloor$。$n\leq 2 \times 10^5$。

### 题解
找到重心，取出重心最重的两个儿子，作为 $u,v$，这样一次询问可以递归到三个部分之一（$u$ 所在的子树/ $v$ 所在的子树/重心+剩下一个子树）。度数为 $2$ 时不要特判~~否则就会像我一样询问次数可能取到上取整然后 WA~~。

## H. Border Jump 2
没开。

## I. Bingo
### 题意
给定长为 $nm$ 的序列 $a$，将其打乱之后填入 $n\times m$ 的网格中。定义一个填了数的网格的 Bingo 数为：最小的 $k$ 满足存在一行或存在一列全部小于等于 $k$。求 $(nm)!$ 种填法的 Bingo 数之和。$nm\leq 2\times 10^5$。

### 题解
（队友做的，我不是特别熟，只口胡一下）

Bingo 数为所有行/列的 $\max$ 取 $\min$，取 $\min$ 不好处理，考虑 min-max 容斥。$\min_{x\in S} x = \sum_{T\subseteq S} (-1)^{|T|} \max_{x\in T} x$，我们取行/列的一个子集 $T$，这个 $\max$ 即为被覆盖部分格子的 $\max$。枚举答案，枚举行的子集的大小、枚举列的子集的大小，钦定答案在被覆盖的格子里，而小于答案的数都在不被覆盖的格子里，推出式子，借助卷积快速求值。

## J. Social Media
（队友做的签到题）

## K. Strips
### 题意
一个长条长为 $w$，$n$ 个红色格子，$m$ 个黑色格子，其他格子为白色。你要用尽可能少的长为 $k$ 的段覆盖所有红色格子，且不能覆盖黑色格子，且每个段要完全在长条内，且不能重叠。求最少段数。$w,k\leq 10^9$，$n,m\leq 10^5$。

### 题解
（队友做的，我不是特别熟，只口胡一下）

首先黑色格子将整个长条分成了若干段，每段可以独立处理。记 $f_i$ 表示覆盖了第 $i$ 个红色格子的最少段数，以及在段数最少的情况下，最后一段的右端点最靠左的位置。求 $f_i$ 时，在 set 里二分找到最合适的上个右端点。


## L. P ⊕ Q=R
类似形式的题我搬过到联考，因此知道这种题可能比较简单，但难度上限深不可测。看过一会推不出来做法。讲评一看难度评级 Impossible，告辞。

## M. Ordainer of Inexorable Judgment
### 题意
平面上 $(0,0)$ 处有一个水神，其初始面向方向给定，以每秒钟 $1$ 弧度的速度逆时针旋转。其攻击范围为其面向的射线，以及距离这条射线不超过 $d$ 的区域。有一个凸多边形，其所有点都离原点超过 $d$。求接下来 $t$ 秒内，有多少时间多边形与攻击范围相交。$n\leq 100$。

### 题解
（榜被带偏了，还有一个半小时的时候才看题会的，还有一个小时的时候决定把写完 F 准备调试的队友拖下机，断断续续半个小时写完了这题）

考虑每条边（其实考虑每个点也可以）在什么个时间段会被攻击；把边的两个端点按照先后排，分别拿三角函数求出两个端点最早和最晚被攻击的时间，拿 $l$ 和 $r$ 取 $\min$ 和 $\max$ 得到边对应的区间。然后把所有区间合并，得到整个多边形对应的时间区间（实际实现是找到了没有被覆盖的区间然后取反）。然后借助 $2\pi$ 的循环节计算出答案。

（场上实现非常不优雅但非常不容易写错，包括但不限于把一个区间复制 $5$ 份覆盖 $\pm 2\pi$ 的范围然后扫描线）