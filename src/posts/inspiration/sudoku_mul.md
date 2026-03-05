---
date: 2026-03-05
category:
    - 突发奇想
tag:
    - 数学
    - OI×ICPC - 数论
    - AI - LLM
title: 两个数独的乘积是否可能也是数独？
excerpt: 将两个数独在 mod 9 的意义下做矩阵乘法，可以得到一个数字在 0 到 8 之间的矩阵。是否存在两个数独，使得它们的乘积也是一个数独？GPT-5.? Pro 构造出了一对满足条件的数独。本文将简述构造的思路。
---

## 问题

这个问题由 孔明七星 在 2024 年 11 月 21 日提出。

数独一般由数字 1 到 9 组成，这里我们将其变为由数字 0 到 8 组成。我们将两个数独在 $\mod 9$ 的意义下做矩阵乘法，可以得到一个新的数字在 0 到 8 之间的矩阵。

问题是：是否存在两个数独，使得它们的乘积也是一个数独？

## 解决

我的直觉告诉我不存在，但我的数学水平不支持自己证明这个结论。作为一个有趣的 open problem，每当新 AI 发布时，我都会测试它这个问题。结果一直是找不到、“大概率”不存在。

直到 2026 年 3 月 3 日，我再次尝试 GPT Pro（有传言说这时 GPT 5.4 Pro 在灰度测试，但我无法验证这个说法），它竟然构造出了一对满足条件的数独。

那么下面我们来看一看 GPT 的思路。下文的“我们”只是作者的口癖，不代表我参与了构造过程。

---

首先我们尝试考虑这样的数独：
$$
A_{r,c} = \phi(T r + c)
$$
GPT 认为，把矩阵元素写成“行变量和列变量的线性组合”，有利于让乘法的结果也符合类似形式。GPT 自己是这么表述的：
> 矩阵乘法本身是双线性的。只要你把矩阵元素写成“行变量和列变量的线性组合”，乘法时中间那个求和指标就有机会被变量代换吃掉，最后还能保留同样的结构。这个想法在很多地方都出现过：你想让某个对象在卷积、相关、矩阵乘法下面尽量封闭，就会优先试线性或仿射形式。

但这还不够，为了刻画宫的约束，GPT 将 $\mathbb F_9$ 上的问题转化为 $\mathbb F_3^2$ 上的问题。我们将行和列都用 $\mathbb F_3^2$ 上的元素来编号，依次为 $(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)$。

现在我们正式地描述这类特殊的数独：
$$
A_{r,c} = \phi(T r + c)
$$

其中 $T$ 是 $\mathbb F_3$ 上的一个 $2\times 2$ 的矩阵。其满足 $T$ 可逆、且 $T_{1,2} \neq 0$。$\phi$ 是 $\mathbb F_3^2$ 到 $\mathbb F_9$ 的一个双射。这样的矩阵一定是数独，因为：
- 对于同一行，$c$ 互不相同，从而 $T r + c$ 也互不相同；
- 对于同一列，$r$ 互不相同，从而 $T r$ 也互不相同，从而 $T r + c$ 也互不相同；
- 对于同一宫，$c$ 增加时 $T r + c$ 增加 $\begin{pmatrix} 0 \\ 1 \end{pmatrix}$，$r$ 增加时 $T r + c$ 增加 $\begin{pmatrix} T_{1,2} \\ T_{2,2} \end{pmatrix}$，由于 $\begin{pmatrix} T_{1,2} \\ T_{2,2} \end{pmatrix}$ 与 $\begin{pmatrix} 0 \\ 1 \end{pmatrix}$ 线性无关，所以 $T r + c$ 也互不相同。

我们设两个数独分别为
$$ A = \phi(T r + c), B = \psi(M r + c) $$

则
$$
\begin{aligned}
(A B)_{r, c} = & \sum_{x} \phi(Tr + x) \psi(Mx + c)\\
             \xlongequal{u = Tr + x} & \sum_{u} \phi(u) \psi(Mu + c - MTr)
\end{aligned}
$$

定义 $h(t) = \sum_{u} \phi(u) \psi(Mu + t)$，则 $(A B)_{r, c} = h(c - MTr)$，其同样符合上面定义的数独的形式。为此我们只需要构造 $T, M, \phi, \psi$，使其满足上面的条件即可。

先找到一组 $T$ 和 $M$，让 $-MT$ 也满足上面的条件，GPT 给出的构造是
$$
T=\begin{pmatrix}0&1\\ 1&0\end{pmatrix}, \qquad
M=\begin{pmatrix}2&2\\ 1&2\end{pmatrix},
$$

这时我们可以固定 $\phi$，只需要枚举 $\psi$，使得 $h(t)$ 是 $\mathbb F_3^2$ 上的一个双射即可。 

GPT 寻找到的三个排列为：
$$
\begin{aligned}
\phi=&(8,2,5,0,1,6,4,3,7)\\
\psi=&(7,6,3,8,2,1,4,0,5)\\
h=&(0,4,6,5,8,3,2,7,1).
\end{aligned}
$$

对应的数独为
$$
\begin{aligned}
A=
\begin{pmatrix}
8&2&5&0&1&6&4&3&7\\
0&1&6&4&3&7&8&2&5\\
4&3&7&8&2&5&0&1&6\\
2&5&8&1&6&0&3&7&4\\
1&6&0&3&7&4&2&5&8\\
3&7&4&2&5&8&1&6&0\\
5&8&2&6&0&1&7&4&3\\
6&0&1&7&4&3&5&8&2\\
7&4&3&5&8&2&6&0&1
\end{pmatrix}\\
B=
\begin{pmatrix}
7&6&3&8&2&1&4&0&5\\
1&8&2&5&4&0&3&7&6\\
0&5&4&6&3&7&2&1&8\\
5&4&0&3&7&6&1&8&2\\
6&3&7&2&1&8&0&5&4\\
8&2&1&4&0&5&7&6&3\\
2&1&8&0&5&4&6&3&7\\
4&0&5&7&6&3&8&2&1\\
3&7&6&1&8&2&5&4&0
\end{pmatrix}\\
C=
\begin{pmatrix}
0&4&6&5&8&3&2&7&1\\
8&3&5&7&1&2&4&6&0\\
1&2&7&6&0&4&3&5&8\\
7&1&2&4&6&0&8&3&5\\
6&0&4&3&5&8&1&2&7\\
5&8&3&2&7&1&0&4&6\\
3&5&8&1&2&7&6&0&4\\
2&7&1&0&4&6&5&8&3\\
4&6&0&8&3&5&7&1&2
\end{pmatrix}
\end{aligned}
$$

这是一份我随手写的代码，也能很快找到一组解：
```python
import numpy as np
import itertools
import random

random.seed(42)

T = np.array([[0, 1], [1, 0]])
M = np.array([[2, 2], [1, 2]])

to_vec_ = [np.array([i // 3, i % 3]) for i in range(9)]

def to_vec(x):
    return to_vec_[x]


def to_idx(v):
    return v[0] * 3 + v[1]


def val_permutation(phi, psi):
    hset = set()
    for t in range(9):
        h = sum(phi[u] * psi[to_idx((M @ to_vec(u) + to_vec(t)) % 3)] for u in range(9)) % 9
        if h in hset:
            return False
        hset.add(h)
    return True

def construct(T, phi):
     return np.array([[phi[to_idx((T @ to_vec(r) + to_vec(c)) % 3)] for c in range(9)] for r in range(9)])

def is_sudoku(A):
    for i in range(9):
        if len(set(A[i, :])) != 9:
            return False
        if len(set(A[:, i])) != 9:
            return False
    for r in range(0, 9, 3):
        for c in range(0, 9, 3):
            block = A[r:r+3, c:c+3].flatten()
            if len(set(block)) != 9:
                return False
    return True

def report(phi, psi):
    print("Found a pair of valid permutation:", phi, psi)
    A = construct(T, phi)
    B = construct(M, psi)
    print("Matrix A:")
    print(A)
    print("Matrix B:")
    print(B)
    C = A @ B % 9
    print("Matrix C (A @ B % 9):")
    print(C)

    assert is_sudoku(A)
    assert is_sudoku(B)
    assert is_sudoku(C)

idx = 0
phis = list(itertools.permutations(range(9)))
random.shuffle(phis)
for phi in phis:
    for psi in itertools.permutations(range(9)):
        idx += 1
        if val_permutation(phi, psi):
            report(phi, psi)
            exit()
```

```
Found a pair of valid permutation: (6, 4, 2, 7, 5, 8, 1, 3, 0) (0, 1, 2, 3, 7, 8, 4, 6, 5)
Matrix A:
[[6 4 2 7 5 8 1 3 0]
 [7 5 8 1 3 0 6 4 2]
 [1 3 0 6 4 2 7 5 8]
 [4 2 6 5 8 7 3 0 1]
 [5 8 7 3 0 1 4 2 6]
 [3 0 1 4 2 6 5 8 7]
 [2 6 4 8 7 5 0 1 3]
 [8 7 5 0 1 3 2 6 4]
 [0 1 3 2 6 4 8 7 5]]
Matrix B:
[[0 1 2 3 7 8 4 6 5]
 [5 4 6 2 0 1 8 3 7]
 [7 8 3 6 5 4 1 2 0]
 [6 5 4 1 2 0 7 8 3]
 [3 7 8 4 6 5 0 1 2]
 [2 0 1 8 3 7 5 4 6]
 [8 3 7 5 4 6 2 0 1]
 [1 2 0 7 8 3 6 5 4]
 [4 6 5 0 1 2 3 7 8]]
Matrix C (A @ B % 9):
[[1 0 8 2 4 3 5 7 6]
 [3 2 4 6 5 7 8 1 0]
 [7 6 5 0 8 1 4 3 2]
 [4 3 2 7 6 5 0 8 1]
 [5 7 6 1 0 8 2 4 3]
 [8 1 0 3 2 4 6 5 7]
 [6 5 7 8 1 0 3 2 4]
 [0 8 1 4 3 2 7 6 5]
 [2 4 3 5 7 6 1 0 8]]
```
