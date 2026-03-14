---
date: 2026-03-14
category:
    - 突发奇想
tag:
    - AI - LLM
title: 花了一晚上纯手写了一个比 NanoGPT 还 Nano 而且很丑的而且出了一堆错的 Autoregressive Transformer
excerpt: 如题，只是想试试自己不靠 AI 还能不能写动代码。勉强写完了。
---

晚上突然想试试自己不靠 AI 还能不能写得动代码，于是决定复刻一个比 [NanoGPT](https://github.com/karpathy/nanoGPT) 还 Nano 的项目。使用 character-level tokenizer，能在 [Shakespeare 数据集](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt) 上训起来就是胜利。

过程中没有使用 AI，尽量少参考网络资料，花了接近两小时写完代码，但是查完错花了差不多三个半小时。除去那些一跑就能看出来的问题，如 shape 不匹配，还犯了以下憨憨错误：
- 给统计的 loss 多除了一个 batch size 导致提前开香槟
- 没有写 `optimizer.zero_grad()`
- 不知道 `cross_entropy` 传入的是 logits（而非概率）
- 打算待会实现 RoPE 然后忘了
- RoPE 直接作用到输入上去了

以及，是的，事后检查发现我的 RoPE 里面把一个 `sin` 写成了 `cos` 而且根本没有去旋转向量导致它不知道在算什么但它还是跑起来了！!1

最后稍微训了一下，点到为止，Train Loss 为 1.487636334067308，Val Loss 为 1.487932456742733。

下面是生成的文本示例：
```
SICINIUS:
I am the grave to the dead the father.

KING EDWARD IV:
What may mercy and with the battle well.

MENENIUS:
What shall be the be the day of my liege.

KING RICHARD II:
What is the cause of men his father when we stray
Which you what the world o

------



PETRUCHIO:
Then thou art thou wilt a be the death of the foul
fel with the fater of the world and the breather
Than the soulders and friends and things and the
senter the sender and the face of the world of mine
mater and the prince of my power and the fa

------



MENENIUS:
Believe the own that is the world with the face.

ROMEO:
Where is the stand with the basents the sees,
Where with the cause of the seek the world,
That do for the reason the batter the face,
And my lords both met with the brother's be that
Is ha
```

下面是代码：

:::warning
代码里包括混乱的变量名、丑陋的码风、不存在的封装、直接注释掉的调试信息、~~可能有误~~明显有误的模型结构实现。不建议阅读。
:::

```py
# config.py
max_len = 256
n_dim = 384
n_head = 6
mlp_hidden = n_dim // 3 * 8
eps = 1e-6
n_layers = 6
vocabulary = 128
batch_size = 32
learning_rate = 1e-3
```

```py
# model.py
import torch
from torch.nn.functional import silu, softmax
from torch.nn import Parameter, Linear, Module, ModuleList, Embedding

from config import *

class RoPE():
    def __init__(self):
        d = n_dim // n_head // 2
        theta = torch.tensor([10000 ** (-i / d) for i in range(d)])
        self.cos = torch.cos(torch.arange(0, max_len).view((-1, 1)).to(torch.float32) @ theta.view(1, -1)).to("cuda")
        self.sin = torch.cos(torch.arange(0, max_len).view((-1, 1)).to(torch.float32) @ theta.view(1, -1)).to("cuda")

    def forward(self, x: torch.Tensor):
        B, H, T, C = x.shape
        return torch.cat((
            x[:, :, :, ::2] * self.cos[:T, :].view(1, 1, T, C // 2),
            x[:, :, :, 1::2] * self.sin[:T, :].view(1, 1, T, C // 2),
        ), dim = -1)

class SelfAttn(Module):
    def __init__(self):
        super().__init__()
        self.mat_q = Linear(n_dim, n_dim)
        self.mat_k = Linear(n_dim, n_dim)
        self.mat_v = Linear(n_dim, n_dim)
        self.proj = Linear(n_dim, n_dim)
        self.mask = torch.tensor(
            [[i < j for j in range(max_len)] for i in range(max_len)]
        )
        self.rope = RoPE()

    def forward(self, x: torch.Tensor):
        B, T, C = x.size()
        q: torch.Tensor = (
            self.mat_q(x).reshape((B, T, n_head, C // n_head)).transpose(1, 2)
        )
        q = self.rope.forward(q)
        k: torch.Tensor = (
            self.mat_k(x).reshape((B, T, n_head, C // n_head)).transpose(1, 2)
        )
        k = self.rope.forward(k)
        v: torch.Tensor = (
            self.mat_v(x).reshape((B, T, n_head, C // n_head)).transpose(1, 2)
        )
        attn = q @ k.transpose(-1, -2) / (C // n_head) ** 0.5
        attn[:, :, self.mask[:T, :T]] = -torch.inf
        attn = softmax(attn, dim=-1)
        # print(attn[0,0,:4,:4])
        out = (attn @ v).transpose(1, 2).reshape((B, T, C))
        out = self.proj(out)
        # print(out[0, 0, :4])
        return out


class FFN(Module):
    def __init__(self):
        super().__init__()
        self.in1 = Linear(n_dim, mlp_hidden)
        self.in2 = Linear(n_dim, mlp_hidden)
        self.out = Linear(mlp_hidden, n_dim)

    def forward(self, x: torch.Tensor):
        return self.out(silu(self.in1(x)) * self.in2(x))


class RMSNorm(Module):
    def forward(self, x: torch.Tensor):
        rms = (x**2).mean(dim=-1).sqrt() + 1e-6
        return x / rms.unsqueeze(-1)


class Block(Module):
    def __init__(self):
        super().__init__()
        self.norm1 = RMSNorm()
        self.norm2 = RMSNorm()
        self.attn = SelfAttn()
        self.ffn = FFN()

    def forward(self, x: torch.Tensor):
        x = x + self.attn(self.norm1(x))
        x = x + self.ffn(self.norm2(x))
        return x


class Transformer(Module):
    def __init__(self):
        super().__init__()
        self.embedding = Embedding(vocabulary, n_dim)
        self.unembedding = Linear(n_dim, vocabulary, bias=False)
        self.blocks = ModuleList([Block() for _ in range(n_layers)])
        self.norm = RMSNorm()

    def forward(self, tokens: torch.Tensor):
        x = self.embedding(tokens)
        for block in self.blocks:
            x = block(x)
        x = self.norm(x)
        return self.unembedding(x)

    def loss(self, tokens: torch.Tensor):
        out = self(tokens)
        return torch.nn.functional.cross_entropy(
            out[:, :-1, :].reshape(-1, vocabulary), tokens[:, 1:].flatten()
        )


if __name__ == "__main__":
    # model = Transformer()
    # model(torch.tensor([[1, 2, 3], [4, 5, 6]]))
    t = torch.tensor([[1, 2, 3], [4, 5, 6]])
    print(t)
    print(t.transpose(0, 1))
    print(t.transpose(0, 1).reshape(2, 3))

```

```py
# prepare_data.py
import torch
import json
from config import *

f = open("Shakespeare.txt")
s = f.read()
s = torch.tensor([ord(i) for i in s], dtype=torch.int32)
chrs = set(s.tolist())
print(chrs)
n_voc = len(chrs)
mx_chr_id = max(*chrs) + 1
chr_id_to_tok = torch.zeros(mx_chr_id, dtype=torch.int32)
mp = {}
for idx, i in enumerate(chrs):
    mp[idx] = chr(i)
    chr_id_to_tok[i] = idx

s_tokenized: torch.Tensor = chr_id_to_tok[s]

n_samples = s_tokenized.shape[0] // max_len
s_tokenized = s_tokenized[: n_samples * max_len]
s_tokenized = s_tokenized.reshape((-1, max_len))
s_tokenized = s_tokenized[torch.randperm(n_samples), :]

n_train = int(n_samples * 0.9)
s_train = s_tokenized[:n_train]
s_val = s_tokenized[n_train:]

torch.save(s_train, open("train.pt", "wb"))
torch.save(s_val, open("val.pt", "wb"))
json.dump(mp, open("map.json", "w"))

```

```py
# run.py
import torch
from model import Transformer
from config import *
import json

temp = 0.3
mp = json.load(open("map.json"))

model = torch.load("model.pt", weights_only=False).to("cuda")

start = [0]
for i in range(10):
    seq = start.copy()
    while len(seq) <= max_len:
        output = torch.nn.functional.softmax(
            model(torch.tensor([seq]).to("cuda"))[0, -1, : len(mp)] / temp, dim=-1
        )
        new = torch.distributions.Categorical(output).sample().item()
        seq.append(new)
        print(mp[str(new)], end="", flush=True)

    print("\n\n------\n\n")

```

```py
# train.py
import torch
from model import Transformer
from config import *
import tqdm

train = torch.load("train.pt").to("cuda").to(torch.long)
val = torch.load("val.pt").to("cuda").to(torch.long)

model = Transformer().to("cuda")
for parameter in model.parameters():
    torch.nn.init.normal_(parameter, 0, 0.03)

optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

for epoch in range(4):
    model.train()
    sum_loss = 0
    n_samples = 0
    for st in tqdm.tqdm(range(0, train.shape[0], batch_size)):
        ed = min(st + batch_size, train.shape[0])
        data = train[st:ed, :]
        optimizer.zero_grad()
        loss = model.loss(data)
        print("Loss:", loss.item(), end="\r")
        sum_loss += loss.item() * (ed - st)
        n_samples += ed - st
        loss.backward()
        optimizer.step()

    print("Train Loss: ", sum_loss / n_samples)

    model.eval()
    with torch.no_grad():
        sum_loss = 0
        n_samples = 0
        for st in tqdm.tqdm(range(0, val.shape[0], batch_size)):
            ed = min(st + batch_size, val.shape[0])
            data = val[st:ed, :]
            loss = model.loss(data)
            sum_loss += loss.item() * (ed - st)
            n_samples += ed - st
    
    print("Val Loss: ", sum_loss / n_samples)
    
    torch.save(model, "model.pt")

```

