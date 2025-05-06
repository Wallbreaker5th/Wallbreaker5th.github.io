---
date: 2025-05-06
category:
    - OI×ICPC
    - OI×ICPC - 题解
    - OI×ICPC - DP
    - OI×ICPC - 交互题
    - OI×ICPC - 二分
    - OI×ICPC - 博弈论
    - OI×ICPC - 位运算
    - OI×ICPC - 贪心
    - OI×ICPC - 高精度
title: The 2nd Universal Cup Semifinals 部分题解
excerpt: The 2nd Universal Cup Semifinals（UCup Semifinals）部分题目的题解：<br>A. Records in Chichén Itzá<br>C. Space Station<br>G. CNOI Knowledge<br>K. Game: Battle of Menjis<br>M. Puzzle: Summon
---

::: warning
题解写得可能非常抽象。

「如果一个题解你看不懂，那是题解垃圾而不是你垃圾。」
:::

比赛链接：[UCup](https://contest.ucup.ac/contest/1708)

## A. Records in Chichén Itzá
### 题意
给定一个度数序列，问是否存在两颗不同构的树都满足这个度数序列。$n\leq 10^5$

### 题解
存在当且仅当：
- 度数序列中存在至少 $4$ 个大于 $2$ 的数；或
- 度数序列中存在至少 $3$ 个大于等于 $2$ 的数，且不完全相同。

## C. Space Station
### 题意
有 $n$ 次攻击，已知 $a_i$，每次的强度为 $a_i$ 的一个 shuffle（$n!$ 种）$b_i$。每次攻击来之前，你可以决定是用 $m$ 的代价拦住这次攻击还是用 $b_i$ 的代价在攻击之后处理；来之后你就知道这次攻击的 $b_i$。求最优策略下的最小期望代价。$n,m\leq 100, a_i\leq 200$

### 题解
每次决策选择 $m$ 和剩余 $b_i$ 平均值中较小的一个。即答案为 $\frac{1}{n!} \sum_{b} \sum_{i=1}^{n} \min \left(m, \frac{\sum_{j=1}^{i} b_j}{i} \right)$。DP $f[i,j]$ 为 $i$ 个数和为 $j$ 的方案数，答案为
$$\frac{1}{n!} \sum_{i=1}^{n} \sum_{j=1}^{V} \min \left(m, \frac{j}{i} \right) f[i,j] i! (n-i)!$$

## G. CNOI Knowledge
### 题意
交互题。有一个长为 $n$ 的串 $s$，内容未知。你可以询问 $10000$ 次，给出 $l,r$，返回 $s[l..r]$ 的不同子串的个数。给出一个可能的 $s$。$n\leq 1000$。

### 题解
一个一个字符加。每次二分当前字符上次出现的位置，靠比较询问 $(m, i)$ 和求 $(m,i-1)$ 的结果来判断。

## K. Game: Battle of Menjis
### 题意
有一个长为 $n$ 的非负整数序列，Alice 和 Bob 轮流操作，共 $k$ 轮：
- Alice 找一个位置，将其加一
- Bob 找一个大于零的位置，将其减一
Alice 希望结果的异或和最大，Bob 希望结果的异或和最小。求最优策略下结果的异或和。$n\leq 10^5, k\leq 10^9, a_i\leq 10^9$。

### 题解
无论 $k$ 等于多少，结果都和 $k=1$ 一样：
- Bob 可以保证结果小于等于它：前 $k-1$ 轮操作，Bob 都把 Alice 的操作抵消掉，从而只在最后一轮用自己的最优策略
- Alice 可以保证结果大于等于它：Alice 在第一次操作，用 $k=1$ 时的最优策略，之后每次 Bob 的操作都抵消掉，最后 Bob 会进行一次操作。

枚举 Alice 的操作，Bob 的操作相当于将结果异或一个 `0...01...1`，可行的操作取决于数的 `ctz`、只有 $\log$ 种，简单维护一下所有数的 `ctz` 的集合即可。

## M. Puzzle: Summon
### 题意
有一个 $2\times 2n$ 的矩阵，每 $2\times 2$ 为一宫。一个合法的填数方案满足：
- 里面只有 $1$、$2$ 和空格子
- 每一宫恰有一个 $1$ 和一个 $2$
- 相同的数不相邻（八连通）
一个填数方案的分数为第一行从左往右读，所有数的和（中间没有空格子的数字可以连成一个多位数）。给出一个已经填入一些数的矩阵，求最大的分数，或输出无解。$n\leq 10^5$

### 题解
先不考虑每一个数在第一行还是第二行，整个矩阵分为三个阶段：
- 宫里的两个数都在左边
- 宫里的两个数一左一右
- 宫里的两个数都在右边

枚举中间阶段是 `12` 交替还是 `21` 交替，让中间阶段尽可能长、然后所有数尽可能放在第一行，即可得到最大的分数。

Python 似乎会因为整数 `+=` 复杂度是两个整数长度较大值而 TLE。
