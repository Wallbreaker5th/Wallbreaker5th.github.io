---
date: 2024-03-28
category:
    - 突发奇想
tag:
    - 游戏
    - 游戏 - Minecraft
    - OI×ICPC
    - OI×ICPC - 双指针
title: 算法最有用（没用）的一集——为 Minecraft 快速寻找四联蛮兵塔
excerpt: USTC Minecraft 19 周目正在筹划建造一个四联蛮兵塔，虽然我不懂生电，但写写代码还是没问题的。该文章介绍了给定蛮兵塔坐标后，$O(n \log n)$ 时间内找到四联蛮兵塔的算法。该算法应当很容易扩展到其他联数或其他结构（如四联女巫塔）。
---

## 问题背景
USTC Minecraft 19 周目正在筹划建造一个四联蛮兵塔。群友对着 Chunk Base 盯了几个小时，只找到了一个比较好的一组蛮兵塔坐标（$\Delta x = 240, \Delta z = 224$）。但（据说）理想情况下，蛮兵塔两两之间的切比雪夫距离不能超过 $224$，大家自然希望找到更好的四联蛮兵塔。显然再手动找就不现实了，大家自然决定写代码来找。

## 形式化描述
给定平面上 $n$ 个点 $(x_i, y_i)$，找到若干（所有？）子集 $S$，使得 $|S| = 4$，且 $\max_{(x_i, y_i), (x_j, y_j) \in S} \max(|x_i - x_j|, |y_i - y_j|)$ 小于 $L = 224$。

在实践中，搜索约 $\pm 6.7 \times 10^5$ 的坐标范围，会有 $n \approx 2 \times 10^6$ 个点。这些点通过 [Cubiomes](https://github.com/Cubitect/cubiomes) 找到，且分布较为均匀。

## 算法思路
首先将所有点按照 $x$ 坐标排序，利用双指针，可以扫出 $x$ 坐标之差不超过 $L$ 的区间。

使用一个 `multiset` 维护区间内所有点的 $y$ 坐标；从集合中删除点时无序额外操作；插入点时，找到与这个点排名相邻的前后各 $3$ 个点，带上自身共 $7$ 个点，验证这 $7$ 个点能否选出 $4$ 个满足其 $y$ 坐标之差不超过 $L$。

时间复杂度 $O(n \log n)$。

## 代码实现
```cpp
#include<bits/stdc++.h>
using namespace std;
#define pii pair<int,int>
#define x first
#define y second
const int N=3e6+10;
pii p[N];

int main(){
    ios::sync_with_stdio(0);
    freopen("Bastion.txt","r",stdin);
    int n=0;
    while(cin>>p[n].x>>p[n].y) n++;
    cerr<<"n: "<<n<<endl;
    sort(p,p+n);
    multiset<int> s;
    const int L=224;
    for(int i=0,j=0;i<n;i++){
        while(p[j].x<p[i].x-L){
            s.erase(s.find(p[j].y));
            j++;
        }
        auto t=s.insert(p[i].y);
        vector<int> near;
        auto tl=t,tr=t;
        for(int k=0;k<4;k++){
            near.push_back(*tl);
            if(tl==s.begin()) break;
            tl--;
        }
        reverse(near.begin(),near.end());
        for(int k=0;k<3;k++){
            tr++;
            if(tr==s.end()) break;
            near.push_back(*tr);
        }
        for(int k=0;k+4<near.size();k++){
            if(near[k+3]-near[k]<=L){
                cout<<p[j].x<<" "<<p[i].x<<"  "<<near[k]<<" "<<near[k+3]<<endl;
            }
        }
    }
    return 0;
}
```

## 后记
「或者就不搞四连了吧」\
「感觉性价比不高」\
「通勤代价太大了」\
「二连的效率就差不多了」


