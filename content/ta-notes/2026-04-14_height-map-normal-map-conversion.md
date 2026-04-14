---
title: "Height Map 与 Normal Map 的相互转换"
date: "2026-04-14"
tags: ["TA", "Python", "数学", "法线贴图", "高度图"]
description: "Monolith Soft（异度神剑系列开发商）TA 廣瀬的技术博客翻译。详解 Height Map 与 Normal Map 的相互转换原理，包括线积分、泊松方程、FFT 最小化三种方法，附 NumPy/SciPy 实现代码。"
source_url: "https://www.monolithsoft.co.jp/techblog/articles/000637.html"
---

# Height Map 与 Normal Map 的相互转换

![文章封面](/images/ta-notes/tech_46_01.jpg)

> 📌 **原文信息**
> - 原文：[Height MapとNormal Mapの相互変換 — Monolith Soft TECH BLOG](https://www.monolithsoft.co.jp/techblog/articles/000637.html)
> - 作者：廣瀬（Monolith Soft 技术美术，主要负责特效相关业务）
> - 发布日期：2026.04.14
> - 标签：Python / 中级以上 / 数学
>
> 以下为 1:1 忠实翻译。文末附有译者的延伸讨论。

---

## 前言

大家好，我是 Monolith Soft 的技术美术（TA）廣瀬。这次我想解说 CG 中常用的 Height Map 和 Normal Map 之间的相互转换方法。

首先，我会解说从 Height Map 创建 Normal Map 的方法。Normal Map 只需通过简单的计算即可创建。

接下来，我会解说从 Normal Map 创建 Height Map 的方法。由于从 Normal Map 创建 Height Map 是一个困难的问题，因此已有多种方法被提出。

本文将解说以下几种方法：

- **线积分**
- **泊松方程**
- **最小化问题**

对于上述各方法，我也附上了使用 NumPy 和 SciPy 的实现代码。

---

## Height Map → Normal Map

> **验证使用的 Height Map：**
> [File:Approximate Earth Heigh Map.png - Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Approximate_Earth_Heigh_Map.png)

首先解说从 Height Map 创建 Normal Map 的方法。

请注意，Normal Map 会因坐标系的取法不同而导致正负方向相反（即常说的 OpenGL 格式与 DirectX 格式）。

将 Height Map 设为 *z*(*x*,*y*)，Normal Map 设为三维单位向量 **n**(*x*,*y*)。

对 Height Map *z*(*x*,*y*) 在 x 轴和 y 轴方向进行偏微分。这里使用 *z*(*x*,*y*) 的中心差分：

$$
\frac{\partial z}{\partial x} = \frac{z(x+1,y) - z(x-1,y)}{2\Delta x}, \quad
\frac{\partial z}{\partial y} = \frac{z(x,y+1) - z(x,y-1)}{2\Delta y}. \quad (1)
$$

根据式 (1) 的偏微分值，创建 x-z 轴方向的向量 **x**(*x*,*y*) 和 y-z 轴方向的向量 **y**(*x*,*y*)：

$$
\vec{x}(x,y) = (\Delta x, 0, \frac{\partial z}{\partial x}), \quad
\vec{y}(x,y) = (0, \Delta y, \frac{\partial z}{\partial y}). \quad (2)
$$

对式 (2) 的两个向量取外积并归一化，即为 Normal Map 的向量 **n**(*x*,*y*)：

$$
\vec{n}(x,y) = \frac{\vec{x}(x,y) \times \vec{y}(x,y)}{\| \vec{x}(x,y) \times \vec{y}(x,y) \|}. \quad (3)
$$

由于单位向量 **n**(*x*,*y*) 的各分量范围在 -1 到 1 之间，因此在保存为纹理时，通常对各分量执行 `* 0.5 + 0.5` 运算，将值重映射到 0 到 1 的范围。

![Height Map → Normal Map 的公式示意](/images/ta-notes/tech_46_02.jpg)

| | |
|:---:|:---:|
| ![Height Map](/images/ta-notes/tech_46_03.jpg) | ![生成的 Normal Map](/images/ta-notes/tech_46_04.jpg) |
| 【左】Height Map | 【右】生成的 Normal Map |

### 源代码

```python
import os
import numpy as np
import matplotlib.image as mpimg
import matplotlib.pyplot as plt

filename = 'C:/Users/%USER%/Downloads/Approximate_Earth_Heigh_Map.png'
reverse = True  # 纹理颜色 G 通道反转  OpenGL or DirectX

img = mpimg.imread(filename, format='png')
img = img[:,:,:3]  # 删除 Alpha 通道

ny, nx, _ = img.shape

dy, dx = np.gradient(img[:,:,0], 2.0/ny, 2.0/nx)
if reverse:
    dy *= -1

norm = np.sqrt(dx*dx + dy*dy + 1.0*1.0)
img[:,:,0] = -dx / norm
img[:,:,1] = -dy / norm
img[:,:,2] = 1.0 / norm
img = img * 0.5 + 0.5  # 从 -1~1 转换到 0~1 范围

mpimg.imsave(os.path.splitext(filename)[0] + '_output.png', np.clip(img, 0, 1))
plt.imshow(img, interpolation='nearest')
plt.show()
```

---

## Normal Map → Height Map

> **验证使用的 Normal Map：**
> [File:Normal map example - Map.png - Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Normal_map_example_-_Map.png)
> Image by Julian Herzog, [licensed under CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

> **注意：** 创建 Normal Map 时使用的差分法对于创建精确的 Height Map 来说是一个重要因素，但在大多数情况下，我们没有这些详细信息，因此将其作为数值误差忽略。

接下来是从 Normal Map 创建 Height Map 的方法。

将 Height Map 设为 *z*(*x*,*y*)，Normal Map 设为范围在 -1 到 1 的三维向量 **n**(*x*,*y*)。

从 Normal Map **n**(*x*,*y*) 还原 x 轴方向的偏微分值 *p*(*x*,*y*) 和 y 轴方向的偏微分值 *q*(*x*,*y*)：

$$
p(x,y) = -\frac{n_x}{n_z} \simeq \frac{\partial z}{\partial x}, \quad
q(x,y) = -\frac{n_y}{n_z} \simeq \frac{\partial z}{\partial y}. \quad (4)
$$

请注意，这里还原的 *p*(*x*,*y*) 和 *q*(*x*,*y*) 与创建 Normal Map 时原始 Height Map 的偏微分值之间，由于纹理压缩等原因会包含误差。

下面以 *p*(*x*,*y*)、*q*(*x*,*y*) 为基础来创建 Height Map。

### 方法一：线积分

最简单的方法是沿各轴进行线积分：

$$
z(u,v) = \int_{0}^{v} q(0,y) \, dy + \int_{0}^{u} p(x,v) \, dx + C. \quad (5)
$$

*C* 是在偏微分过程中消失的积分常数，相当于 Height Map 整体的偏移量。由于此偏移量在本次讨论中不重要，我们将其忽略。

这种方法简单明了、实现也很容易，但缺点是受数值误差影响较大，生成的 Height Map 上会出现条纹状噪声。

![线积分计算结果](/images/ta-notes/tech_46_05.jpg)

| | |
|:---:|:---:|
| ![线积分计算结果](/images/ta-notes/tech_46_06.jpg) | ![加伽马后可视化噪声](/images/ta-notes/tech_46_07.jpg) |
| 【左】式 (5) 的计算结果 | 【右】加伽马后可视化噪声的效果 |

![线积分 3D 化结果](/images/ta-notes/tech_46_08.jpg)
*图像 3D 化结果*

#### 源代码

```python
import os
import numpy as np
import matplotlib.image as mpimg
import matplotlib.pyplot as plt

filename = 'C:/Users/%USER%/Downloads/Normal_map_example_-_Map.png'
reverse = True  # 纹理颜色 G 通道反转  OpenGL or DirectX

img = mpimg.imread(filename, format='png')
img = img[:,:,:3]  # 删除 Alpha 通道
img = img * 2.0 - 1.0  # 从 0~1 转换到 -1~1 范围

ny, nx, _ = img.shape

# 式(4)
p = -img[:,:,0] / img[:,:,2]
q = -img[:,:,1] / img[:,:,2]

if reverse:
    q *= -1
p *= 2.0 / nx
q *= 2.0 / ny

# 式(5)
C = 0.0
zy = 0.0
for y in range(ny):
    zy += q[y,0]
    zx = 0.0
    for x in range(nx):
        zx += p[y,x]
        img[y,x,0:3] = zy + zx + C

mpimg.imsave(os.path.splitext(filename)[0] + '_output.png', np.clip(img, 0, 1))
plt.imshow(img, interpolation='nearest')
plt.show()
```

### 方法二：泊松方程

另一种方法是通过求解泊松方程来获得 Height Map。

定义二维向量场 **r** 如下：

$$
\textbf{r}(x,y) = (p(x,y), q(x,y)). \quad (6)
$$

求解以 **r** 的散度为右端项的方程，即可创建 Height Map：

$$
\Delta z = -(\text{div} \; \textbf{r}). \quad (7)
$$

该泊松方程可以通过多种方法求解。

关于泊松方程解法的示例，详见「[在 Houdini 中玩泊松](https://www.monolithsoft.co.jp/techblog/houdini/000456.html)」一文。

本文使用 SciPy 的稀疏矩阵直接法进行求解。

![泊松方程计算结果](/images/ta-notes/tech_46_09.jpg)
*式 (7) 的计算结果*

![泊松方程 3D 化结果](/images/ta-notes/tech_46_10.jpg)
*图像 3D 化结果*

#### 源代码

```python
import os
import numpy as np
import matplotlib.image as mpimg
import matplotlib.pyplot as plt
from scipy.sparse import diags, kronsum
from scipy.sparse.linalg import spsolve

filename = 'C:/Users/%USER%/Downloads/Normal_map_example_-_Map.png'
reverse = True  # 纹理颜色 G 通道反转  OpenGL or DirectX

img = mpimg.imread(filename, format='png')
img = img[:,:,:3]  # 删除 Alpha 通道
img = img * 2.0 - 1.0  # 从 0~1 转换到 -1~1 范围

ny, nx, _ = img.shape

# 式(4)
p = -img[:,:,0] / img[:,:,2]
q = -img[:,:,1] / img[:,:,2]

if reverse:
    q *= -1
p *= 2.0 / nx
q *= 2.0 / ny

# 式(7)
# 诺伊曼边界条件的二维拉普拉斯算子
tx = diags([-1.0, 2.0, -1.0], [-1, 0, 1], shape=(nx, nx), format='lil')
ty = diags([-1.0, 2.0, -1.0], [-1, 0, 1], shape=(ny, ny), format='lil')
tx[0,0] = tx[-1,-1] = 1.0
ty[0,0] = ty[-1,-1] = 1.0
A = kronsum(tx.tocsr(), ty.tocsr(), format='csr')

# -(div r)
divr = -(np.gradient(p, axis=1) + np.gradient(q, axis=0))
divr = divr.reshape(-1)

# 为使解唯一，在边界上的一点施加狄利克雷条件
A = A.tolil()
A[0,:] = 0.0
A[0,0] = 1.0
A = A.tocsr()
divr[0] = 0.0  # Height Map 整体的偏移量

# 求解泊松方程
z = spsolve(A, divr).reshape(ny, nx)

img[:,:,0] = z
img[:,:,1] = img[:,:,0]
img[:,:,2] = img[:,:,0]

mpimg.imsave(os.path.splitext(filename)[0] + '_output.png', np.clip(img, 0, 1))
plt.imshow(img, interpolation='nearest')
plt.show()
```

### 方法三：最小化问题

最后介绍通过求解最小化问题来获得 Height Map 的方法。

求使以下目标函数 *W* 最小化的 *z*：

$$
W = \iint_{\Omega} \left( \left|\frac{\partial z}{\partial x} - p\right|^{2} + \left|\frac{\partial z}{\partial y} - q\right|^{2} \right) dx \, dy. \quad (8)
$$

为求解上述方程，使用傅里叶变换。

二维傅里叶变换的定义如下（*j* 为虚数单位）：

$$
\hat{z}(u,v) = \iint_{\Omega} z(x,y) e^{-j(ux + vy)} \, dx \, dy \quad (9)
$$

二维逆傅里叶变换的定义如下：

$$
z(x,y) = \frac{1}{2\pi} \iint_{\Omega} \hat{z}(u,v) e^{j(ux + vy)} \, du \, dv \quad (10)
$$

傅里叶变换的导数性质如下：

$$
\mathscr{F}\left[\frac{\partial}{\partial x} z(x,y)\right] = ju \; \mathscr{F}[z(x,y)], \quad
\mathscr{F}\left[\frac{\partial}{\partial y} z(x,y)\right] = jv \; \mathscr{F}[z(x,y)]. \quad (11)
$$

由帕塞瓦尔定理，以下等式成立：

$$
\iint_{\Omega} |z(x,y)|^{2} \, dx \, dy = \frac{1}{2\pi} \iint_{\Omega} |\hat{z}(u,v)|^{2} \, du \, dv. \quad (12)
$$

由式 (8)(11)(12) 得：

$$
\frac{1}{2\pi} \iint_{\Omega} \left( |ju\hat{z}(u,v) - \hat{p}(u,v)|^{2} + |jv\hat{z}(u,v) - \hat{q}(u,v)|^{2} \right) du \, dv \to \text{minimum}. \quad (13)
$$

展开上式（其中 \* 表示共轭）：

$$
\frac{1}{2\pi} \iint_{\Omega} (u^{2}\hat{z}\hat{z}^{*} - ju\hat{z}\hat{p}^{*} + ju\hat{z}^{*}\hat{p} + \hat{p}\hat{p}^{*} + v^{2}\hat{z}\hat{z}^{*} - jv\hat{z}\hat{q}^{*} + jv\hat{z}^{*}\hat{q} + \hat{q}\hat{q}^{*}) \, du \, dv \to \text{minimum}. \quad (14)
$$

对上式分别关于 *ẑ* 和 *ẑ\** 求导，得到式 (8) 的最小化条件：

$$
(u^{2} + v^{2})\hat{z} + ju\hat{p} + jv\hat{q} = 0, \quad
(u^{2} + v^{2})\hat{z}^{*} - ju\hat{p}^{*} - jv\hat{q}^{*} = 0. \quad (15)
$$

分别取式 (15) 两式的和与差：

$$
(u^{2}+v^{2})(\hat{z}+\hat{z}^{*}) + ju(\hat{p}-\hat{p}^{*}) + jv(\hat{q}-\hat{q}^{*}) = 0, \quad (16a)
$$

$$
(u^{2}+v^{2})(\hat{z}-\hat{z}^{*}) + ju(\hat{p}+\hat{p}^{*}) + jv(\hat{q}+\hat{q}^{*}) = 0. \quad (16b)
$$

对 *u*² + *v*² ≠ 0 求解上式，得到：

$$
\hat{z}(u,v) = \frac{-ju\hat{p}(u,v) - jv\hat{q}(u,v)}{u^{2} + v^{2}}. \quad (17)
$$

*u*² + *v*² = 0 对应频率为 0 时的值，相当于图像整体的偏移值。

也就是说，对 *p*(*x*,*y*) 和 *q*(*x*,*y*) 进行傅里叶变换，代入式 (17) 求解，再进行逆傅里叶变换，即可创建 Height Map。

**当图像不具有周期性时，通过零填充（zero-padding）可以创建更精确的 Height Map。**

![最小化问题计算结果](/images/ta-notes/tech_46_11.jpg)
*最小化问题的计算结果*

![最小化问题 3D 化结果](/images/ta-notes/tech_46_12.jpg)
*图像 3D 化结果*

#### 源代码

```python
import os
import numpy as np
import matplotlib.image as mpimg
import matplotlib.pyplot as plt

filename = 'C:/Users/%USER%/Downloads/Normal_map_example_-_Map.png'
reverse = True  # 纹理颜色 G 通道反转  OpenGL or DirectX
zeropadding = 3  # 零填充的图像尺寸倍数  为 1 时不进行零填充
zeropadding = max(1, zeropadding)

img = mpimg.imread(filename, format='png')
img = img[:,:,:3]  # 删除 Alpha 通道
img = img * 2.0 - 1.0  # 从 0~1 转换到 -1~1 范围

ny, nx, _ = img.shape

# 式(4)
p = -img[:,:,0] / img[:,:,2]
q = -img[:,:,1] / img[:,:,2]

if reverse:
    q *= -1
p *= 2.0 / nx
q *= 2.0 / ny

# 零填充
if zeropadding >= 2:
    pady = ny * (zeropadding - 1)
    padx = nx * (zeropadding - 1)
    p = np.pad(p, ((0, pady), (0, padx)), mode='constant')
    q = np.pad(q, ((0, pady), (0, padx)), mode='constant')

# 定义 u, v
u = (2.0 * np.pi * np.fft.fftfreq(nx * zeropadding)).reshape(1, nx * zeropadding)
v = (2.0 * np.pi * np.fft.fftfreq(ny * zeropadding)).reshape(ny * zeropadding, 1)

# 正向二维快速傅里叶变换
P = np.fft.fft2(p)
Q = np.fft.fft2(q)

# 式(17)
denom = u*u + v*v
mask = denom <= 1e-12
denom[mask] = 1.0  # 避免除以零

Z = ( u * P.imag + v * Q.imag) / denom \
  + (-u * P.real - v * Q.real) / denom * 1.0j
Z[mask] = 0.0 + 0.0j

# 逆向二维快速傅里叶变换
z = np.fft.ifft2(Z)

img[:,:,0] = z.real[:ny,:nx]
img[:,:,1] = img[:,:,0]
img[:,:,2] = img[:,:,0]

mpimg.imsave(os.path.splitext(filename)[0] + '_output.png', np.clip(img, 0, 1))
plt.imshow(img, interpolation='nearest')
plt.show()
```

---

## 总结

本文解说了 Height Map 与 Normal Map 相互转换的几种方法。希望这篇文章能帮助大家更深入地理解 Height Map 和 Normal Map。

## 参考文献

- [Tiangong Wei and Reinhard Klette "Height from Gradient Using Surface Curvature and Area Constraints", 2002](https://www.researchgate.net/publication/2552608_Height_from_Gradient_Using_Surface_Curvature_and_Area_Constraints)
- [Reinhard Klette, Karsten Schluns, "Height data from gradient fields", Jan 1996](https://www.researchgate.net/publication/37987514_Height_data_from_gradient_fields)
- [Rafael Saracchini et al., "A robust multi-scale integration method to obtain the depth from gradient maps", Aug 2012](https://www.researchgate.net/publication/257484772_A_robust_multi_scale_integration_method_to_obtain_the_depth_from_gradient_maps)

---

## 作者简介

**廣瀬** — 从影像行业转入 Monolith Soft。此后作为技术美术（TA）主要负责特效相关业务。喜欢的食物是软冰淇淋。

---
---

## 📝 译者延伸讨论

*以下内容为译者（非凡像素）在阅读本文后与 AI 进行的延伸讨论整理，非原文内容。*

### 一、为什么不直接用 Substance Designer 来做转换？

这篇文章用 Python + NumPy/SciPy 手写转换，而非使用 Substance Designer 内置的节点，原因有三：

**1. SD 的转换是「黑盒」，本文的目的是理解原理**

SD 的 Normal 节点一键就能转，但你不会知道它内部到底用的是哪种算法、有什么局限性。作者的目标是用数学推导让读者**真正理解**背后的原理。

**2. Normal Map → Height Map 是一个病态逆问题**

- **Height → Normal** 很简单：偏微分 + 外积 + 归一化，SD 可以完美处理
- **Normal → Height** 则是数学上的难题（从导数还原原函数）。SD 内置的 Normal to Height 节点效果往往不够理想，尤其是对复杂法线图。作者给出的泊松方程和 FFT 方法**精度更高、可定制性更强**。

**3. TA 的工作需要可编程、可批量化的管线工具**

Python 脚本可以批量处理大量贴图、集成到 CI/CD 或资产管线中、针对特定项目需求调参——这些都是 SD 作为交互式工具难以胜任的。

### 二、这些技术在哪里会用到？

#### Normal Map → Height Map（逆向还原）

| 场景 | 说明 |
|------|------|
| 从扫描/照片测量数据恢复高度信息 | 照片测量法有时只能提取到法线信息，需要反推高度图 |
| 遗留资产修复 | 老项目只留下了 Normal Map，原始 Height Map 丢失 |
| PBR 材质的 Parallax Occlusion Mapping (POM) | POM 需要 Height Map，但手头只有 Normal Map |
| 地形生成 | 从法线图反推地形高度数据 |
| Decal 系统 | 贴花系统需要从法线反推高度来做正确的混合 |

#### Height Map → Normal Map（正向生成）

| 场景 | 说明 |
|------|------|
| 程序化纹理管线 | Houdini/Python 程序化生成的高度图需要自动计算法线图 |
| 地形渲染 | 开放世界游戏运行时需要从高度图计算法线 |
| 雕刻细节烘焙 | ZBrush 雕刻导出的高度图转法线图用于游戏内低模 |

### 三、流体/粒子模拟中的高度场→法线→实时光照

这是一条从物理模拟到视觉呈现的渲染管线：

1. **流体模拟产生高度场**：流体模拟（SPH、浅水方程等）计算出每一帧水面每个点的高度值，排列成 2D 网格就是高度场
2. **高度场转法线图**：高度场只告诉你「这里有多高」，但光照计算需要知道「表面朝哪个方向」。通过对高度场求偏导数得到法线
3. **必须实时完成**：水面每帧都在变化，法线图也必须每帧重新计算。这个转换在 GPU Shader 中实时完成：

```hlsl
// GPU Compute Shader 中实时计算水面法线
float h_left  = heightMap.Sample(uv + float2(-texelSize, 0));
float h_right = heightMap.Sample(uv + float2( texelSize, 0));
float h_up    = heightMap.Sample(uv + float2(0,  texelSize));
float h_down  = heightMap.Sample(uv + float2(0, -texelSize));

float3 normal = normalize(float3(h_left - h_right, h_down - h_up, 2.0));
```

### 四、UE 中的封装 vs 自研引擎

如果使用 **Unreal Engine**，这些功能大部分已经封装好了：
- **Landscape 系统**：自动计算地形法线
- **Material Editor**：`Normal From HeightMap` 节点
- **水体插件 (Water Plugin)**：Gerstner 波的 Height→Normal 全在 Shader 里完成
- **Niagara Fluids**：流体模拟到渲染的完整管线

Monolith Soft 的 TA 之所以要自己写这些底层工具，正是因为他们使用**自研引擎**。自研引擎没有 UE 那样完善的可视化工具链，TA 需要直接写代码实现。这也是自研引擎团队 TA 的核心价值——不只是「连节点」，而是要**理解底层数学并实现它**。

考虑到 Monolith Soft 开发异度神剑系列这种开放世界大作，最可能的应用场景是大规模地形管线和特效系统中的实时光照计算。
