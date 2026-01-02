# 📝 FastAPI Web 登录验证系统学习笔记

## 1. 核心技术栈

* **Web 框架**: FastAPI
* **数据库/ORM**: SQLModel (结合了 SQLAlchemy 和 Pydantic 的优势)
* **密码安全**: Passlib (配合 **Argon2** 算法)
* **身份令牌**: Python-Jose (用于处理 **JWT**)

## 2. 项目结构蓝图

一个清晰的分层结构有助于维护和扩展：

```text
my_app/
├── database.py      # 🔌 数据库连接 (Engine, Session)
├── models.py        # 🗄️ 数据库模型 (User Table)
├── schemas.py       # 📝 API 数据验证模型 (Request/Response Bodies)
├── security.py      # 🔐 安全核心 (Hash, JWT Logic)
└── main.py          # 🚀 API 路由与业务逻辑 (Register, Login, Protected Routes)

```

---

## 3. 关键知识点总结

### A. 数据安全原则

* **密码存储**: **永远不要存储明文密码**。数据库中只存储密码的哈希值 (`hashed_password`)。
* **哈希算法**: 使用现代且抗暴力的算法，如 **Argon2**。
* **数据分离**:
* `UserCreate` (Schema): 用于接收前端请求，包含 `password` (明文)。
* `User` (Model): 用于数据库存储，包含 `hashed_password` (密文)。



### B. 数据库会话 (Session)

* **概念**: 数据库会话就像一个“购物车”或“暂存区”。
* **流程**: `add` (放入暂存区) -> `commit` (提交事务/永久保存) -> `refresh` (刷新对象获取 ID 等新数据)。
* **重要性**: 忘记 `commit()` 数据就会丢失。

### C. JWT (JSON Web Tokens)

* **作用**: 一种无状态的认证机制，相当于用户的“数字手环”。
* **位置**: 客户端需将 Token 放在 HTTP 请求头中发送：`Authorization: Bearer <token>`。
* **防篡改**: JWT 的安全性依赖于 **签名 (Signature)**。
* 只要服务器持有的 `SECRET_KEY` 不泄露，黑客就无法伪造或篡改 Token 中的数据。


* **环境变量**: `SECRET_KEY` 等敏感信息应存储在环境变量中，严禁硬编码在代码里。

---

## 4. 核心代码逻辑速查

### 🔐 1. 密码处理 (`security.py`)

使用 `Passlib` + `Argon2` 实现“入口明文，入库哈希”。

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# 验证：比对明文和哈希
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)

# 加密：生成哈希
def get_password_hash(password): return pwd_context.hash(password)

```

### 🧱 2. 定义模型 (`models.py` & `schemas.py`)

使用 SQLModel 区分输入和存储。

```python
# Database Model
class User(SQLModel, table=True):
    username: str
    hashed_password: str  # 存密文

# Request Schema
class UserCreate(SQLModel):
    username: str
    password: str         # 收明文

```

### 🚪 3. 依赖注入与守门员 (`main.py`)

FastAPI 的核心特性，用于保护接口。

```python
# 定义依赖项：验证 Token 并获取用户
async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    # 1. 解码 Token
    # 2. 验证过期/签名
    # 3. 查库确认用户存在
    return user

# 使用依赖项保护接口
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

```

---

## 5. 常见误区自查 ✅

* [ ] **数据库没数据？** 检查是否执行了 `session.commit()`。
* [ ] **密码不对？** 检查登录逻辑是否还在比较明文，必须使用 `verify_password` 函数。
* [ ] **Token 报错？** 检查 `SECRET_KEY` 编码解码时是否一致，以及 `ALGORITHM` 是否匹配。
* [ ] **依赖注入报错？** 确保在路径操作函数中使用了 `Depends()`。

---

# React + TS 登录验证系统：

开发一个功能模块（尤其是涉及数据交互的），最科学的顺序通常是 **“自底向上” (Bottom-Up)**：先修路（API），再造车（Context/State），最后盖房子（UI 组件）。
---

### 📋 5步开发路线图

#### 第一阶段：基础设施 (Infrastructure)

**思路**：先把“通信线路”铺好。如果连后端都连不上，后面的页面也是瞎写。

**1. 配置环境 (`vite.config.ts`)**

* **动作**：配置 Proxy。
* **目的**：解决跨域问题，打通 Cookie 传输通道。
* **代码重点**：`server: { proxy: { '/api': ... } }`

``` ts
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 后端地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀
      },
    },
  },
```

**2. 封装客户端 (`src/api.ts`)**

* **动作**：配置 Axios 实例。
* **目的**：统一管理 `baseURL` 和 `withCredentials`，之后所有请求都不用操心这些配置了。
* **代码重点**：`baseURL: '/api'`, `withCredentials: true`。
* **附带任务**：在这里顺便定义好接口数据的 TypeScript 类型（如 `interface User`, `interface LoginParams`）。

---

#### 第二阶段：状态大脑 (State Management)

**思路**：有了通信工具，接下来要决定“数据存在哪”。先定义数据，再写页面，这样写页面时才有东西可调。

**3. 构建上下文 (`src/contexts/UserContext.tsx`)**

* **动作**：创建 `UserContext` 和 `UserProvider`。
* **目的**：封装 `user` 状态和 `login/logout` 方法。它是整个 App 的“管家”。
* **代码重点**：
* `useEffect` 初始化检查登录状态。
* 暴露 `useAuth` Hook 给别人用。


* **为什么这一步很关键？**：如果没有它，你在写登录页时，就不知道该调用谁，也没法更新全局状态。

---

#### 第三阶段：骨架结构 (Routing Architecture)

**思路**：数据有了，现在要搭建页面的“承重墙”和“门禁系统”。

**4. 编写路由组件 (`src/components/`)**

* **文件 A：`ProtectedRoute.tsx` (门禁)**
* **目的**：利用 `useAuth` 检查用户，没登录的一律踢回 `/login`。


* **文件 B：`AppLayout.tsx` (相框)**
* **目的**：放置侧边栏和导航栏，利用 `<Outlet />` 给子页面留位置。



---

#### 第四阶段：具体页面 (Pages & Views)

**思路**：架子搭好了，终于可以开始画“装修图纸”了。这时候写页面非常快，因为逻辑都在 Context 里准备好了。

**5. 编写业务页面 (`src/pages/`)**

* **文件 A：`Login.tsx**`
* **核心逻辑**：调用 `const { login } = useAuth()`，成功后 `Maps('/dashboard')`。


* **文件 B：`Dashboard.tsx**`
* **核心逻辑**：展示内容（现在它已经是个受保护的空壳了）。



---

#### 第五阶段：组装 (Assembly)

**思路**：把所有零件拼在一起，按下启动键。

**6. 组装入口 (`src/App.tsx`)**

* **动作**：配置路由表。
* **顺序**：`UserProvider` -> `Routes` -> `Route (Login)` -> `Route (Protected)` -> `Route (Layout)` -> `Dashboard`。

---

### 💡 为什么按这个顺序？

想象一下如果你**反过来**做（先写 `Login.tsx`）：

1. 写 `Login.tsx` -> 发现需要调用登录函数 -> ❌ 还没写。
2. 去写登录函数 -> 发现需要存状态 -> ❌ `UserContext` 还没写。
3. 去写 Context -> 发现需要发请求 -> ❌ `api.ts` 还没写。
4. 去写 API -> 发现跨域报错 -> ❌ `vite.config` 没配。

**结果**：你会一直在文件之间跳来跳去，报错满天飞，挫败感很强。

**按推荐顺序做**：
每一步都是**绿灯** 🟢。写 API 时只关注 API，写 Context 时 API 已经好了，写页面时 Context 已经好了。步步为营！

怎么样，这个思维导图清晰了吗？下次再开新功能，按照这个 **“通信 -> 状态 -> 结构 -> 页面”** 的节奏来，绝对事半功倍！