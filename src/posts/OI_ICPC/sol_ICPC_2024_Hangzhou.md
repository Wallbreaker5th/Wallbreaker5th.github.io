---
date: 2025-04-06
category:
    - OI×ICPC
tag:
    - OI×ICPC
    - OI×ICPC - 题解
    - OI×ICPC - 线段树
    - OI×ICPC - 线段树二分
    - OI×ICPC - 贪心
    - OI×ICPC - Tarjan
    - OI×ICPC - 基环树
    - OI×ICPC - 栈
    - OI×ICPC - 构造
    - OI×ICPC - 交互题
    - OI×ICPC - 笛卡尔树
    - OI×ICPC - 数论
title: ICPC 2024 杭州区域赛（Hangzhou Regional）部分题解
excerpt: ICPC 2024 杭州区域赛（Hangzhou Regional）部分题目的题解：<br>B. Barkeley III<br>E. Elevator II<br>F. Fuzzy Ranking<br>G. Gathering Mushrooms<br>H. Heavy-light Decomposition<br>I. Identify Chord<br>M. Make It Divisible
---

::: warning
题解写得可能非常抽象。

「如果一个题解你看不懂，那是题解垃圾而不是你垃圾。」
:::

比赛链接：[UCup](https://contest.ucup.ac/contest/1893)、[Codeforces Gym](https://codeforces.com/gym/105657)

## B. Barkeley III
### 题意
给定一个长度为 $n$ 的序列，支持区间按位与一个数、单点修改、对于一个区间查询【去掉恰好一个数后按位与的最大值】。$n,q\leq 10^6, a_i < 2^{63}$。

### 题解
首先用线段树维护两个 mask，代表区间全 $1$ 的位和 $0$ 的个数小于等于 $1$ 的位。一次查询，只有【$0$ 的个数小于等于 $1$ 的位】可能为 $1$；找到【$0$ 的个数等于 $1$ 的位】的最高位，我们最希望这一位的 $0$ 被删除，线段树二分一下找到这个 $0$ 的位置，删除这个 $0$ 对应的数。

## E. Elevator II
### 题意
有 $n$ 个人等电梯，第 $i$ 个人要从 $l_i$ 楼到 $r_i$ 楼（$r_i>l_i$）。电梯一次只能载一个人。电梯每上升一层消耗 $1$ 能量、下降不消耗能量。电梯初始在 $k$ 楼。求电梯能量消耗的最小值。$n\leq 10^5, l_i,r_i\leq 10^9$。构造方案。

### 题解
如果我们初始在足够高的楼层，我们可以按照 $r_i$ 从大到小服务，这样每次上升都是在运人，这是理论的下界了。

电梯必须要到达 $\max r_i$。所以还要额外消耗从 $k$ 到 $\max r_i$ 里，没有乘客的区间的电量。这个下界也可以达到：每次选择一个起点小于等于当前楼层，但终点大于当前楼层的乘客运送。

## F. Fuzzy Ranking
### 题意
有 $k$ 个排名表 $A_1, ... A_k$，每个都是 $1$ 到 $n$ 的排名。定义 $i$ 赢了 $j$，当且仅当：
- $i$ 在某个排名表里排在 $j$ 前面，或者
- $i$ 在某个排名表里排在 $k$ 前面，而 $k$ 赢了 $j$。

定义一对 $(i,j)$ 是 Fuzzy 的，当且仅当 $i$ 赢了 $j$，且 $j$ 赢了 $i$。多次询问，强制在线，求 $A_x[l..r]$ 中有多少对 $(i,j)$ 是 Fuzzy 的。$n,k,q \leq 2\times 10^5, nk\leq 2\times 10^5$。

### 题解
若 $i$ 在某个排名表中在 $j$ 前一位，连边 $i\to j$，则 $(i,j)$ 是 Fuzzy 的当且仅当 $i$ 和 $j$ 在同一个强连通分量中。跑 Tarjan。

查询看似是小 Z 的袜子，但注意到若 $i$ 和 $j$ 在同一个强连通分量中，则排名表中在 $i$ 和 $j$ 之间的所有数都在同一个强连通分量中。于是每个排名表是若干段，每段是一个强连通分量；随便怎么维护二分一下就可以查询了（可能还可以 $O(1)$ 查询）。

## G. Gathering Mushrooms
### 题意
$n$ 个结点，每个结点有一条出边。一个结点上有无数个一种蘑菇 $t_i$，走到一个结点就捡起一个这种蘑菇。给定 $k$，对于所有 $i$，求从 $i$ 出发一直走，第一种捡到 $k$ 个的蘑菇是什么。$n\leq 2\times 10^5, k\leq 10^9$。

### 题解
图是一个基环树森林，只需解决一棵基环树的情况即可。

先考虑树的情况：DFS；维护一个 set，记录每种蘑菇第一次捡到 $k$ 个的结点的深度；维护 $n$ 个栈，记录每种蘑菇出现在根到这里的路径上时的深度；每次走到一个结点，往对应的栈里面 push 一下，在 set 里面把对应的元素换成新的【栈上从顶端数起的第 $k$ 个元素】，回溯时 undo 这些操作。

考虑基环树的情况：选一个环上的点 $u$，模拟出已经在环上 DFS 无限长度的算法状态，然后断环为树，像树一样 DFS。为此我们封装一个无限深度的栈（即深的部分为一些深度的带递增的无限循环），初始化对应的栈和 set。

## H. Heavy-light Decomposition
### 题意
给定一个树做重链剖分得到的每条重链的长度，构造出一棵原树，使其存在一种重链剖分满足已知条件，或不存在。$n\leq 10^5$。

### 题解
先找到最长的一条重链，从下往上在它的每个点上挂尽可能多的东西（从小到大考虑其他链）

## I. Identify Chord
### 题意
交互题。给出 $n$，有一个 $n$ 个点的环，有一条未知的额外的边（弦）连接两个环上距离至少为 $2$ 的点。你可以询问 $40$ 次某两个点的距离，求出这条边。$n\leq 10^9$。

### 题解
首先询问 $(1,1+\lfloor n/2 \rfloor), (1,1+\lfloor n/2 \rfloor+1), (1+\lfloor n/4 \rfloor, 1+\lfloor n/4 \rfloor+\lfloor n/2 \rfloor), (1+\lfloor n/4 \rfloor, 1+\lfloor n/4 \rfloor+\lfloor n/2 \rfloor+1)$，找到一个抄近路的点对 $(p,q)$。

固定 $p$，微调 $q$，可以确定弦的靠近 $q$ 的一点 $y$ 在 $q$ 的哪一侧；往这一侧倍增，可以确定 $y$。再根据 $p$ 到 $y$ 的距离，可以得到两个 $x$ 的候选位置，验证即可。

## M. Make It Divisible
### 题意
给定序列 $a_i$。$a_i$ 的一个子段是好的，当且仅当存在一个数可以整除子数组里的所有数；整个序列是好的，当且仅当其所有子段都是好的。给定 $k$，求所有满足 $a_i+x$ 构成的序列是好的的 $1\leq x\leq k$ 之和。$n\leq 5\times 10^4,a_i\leq 10^9$。

### 题解
一个子段是好的，当且仅当其最小值可以整除子数组里的所有数；整个序列是好的，只需要笛卡尔树上的每个区间是好的，只需要笛卡尔树上的每对父子相整除；所有数加 $x$ 不影响笛卡尔树的形态。

考虑一对数，要它们加 $x$ 之后相整除，新的小的数必须是两数之差的约数。从而我们用一对数确定一些可能的 $x$，并在每一对数上验证这些 $x$。
