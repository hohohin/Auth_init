from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. 导入这个
from sqlmodel import Session, select

# 导入自定义模块
from database import create_db_and_tables, get_session
from models import User
from schemas import UserCreate, Token
import auth

app = FastAPI()

# === 2. 配置 CORS 中间件 (插入在这里) ===
# 允许的来源列表
origins = [
    "http://localhost:5173",    # Vite 开发环境默认端口
    "http://127.0.0.1:5173",    # 以防万一用 IP 访问
    "http://localhost:3000",    # React CRA 默认端口 (备用)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # 允许前端的地址
    allow_credentials=True,     # 允许携带 Cookie/Token
    allow_methods=["*"],        # 允许所有方法 (POST, GET, PUT, DELETE...)
    allow_headers=["*"],        # 允许所有 Header (Authorization, Content-Type...)
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# === 注册 ===
@app.post("/register", response_model=User)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    # 检查重名
    existing_user = session.exec(select(User).where(User.username == user_in.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 关键：使用 Argon2 哈希密码
    hashed_pw = auth.get_password_hash(user_in.password)
    
    user = User(agent_code=user_in.agent_code, hashed_password=hashed_pw)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# === 登录 (获取 Token) ===
@app.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.agent_code == form_data.username)).first()
    
    # 验证账号密码
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # 生成 Token
    access_token = auth.create_access_token(subject=user.agent_code)
    
    # 🌟 核心变化：设置 HttpOnly Cookie
    response.set_cookie(
        key="access_token",          # Cookie 的名字
        value=access_token, # Cookie 的值
        httponly=True,               # 关键！禁止 JS 读取 🛡️
        max_age=1800,                # 过期时间 (秒)，这里设为 30 分钟
        expires=1800,
        samesite="lax",              # 防止 CSRF 的一种机制
        secure=False,                # 开发环境设为 False，生产环境必须设为 True (仅 HTTPS)
    )
    
    # 响应体里不再需要 token 了，返回个成功信息即可
    return {"message": "Login successful"}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")      # 和上面的Cookie名字一样喔
    return {"message": "Logout successful"}

# === 受保护的接口 ===
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    """
    自动拦截 (Depends): 当请求到达这个接口时，FastAPI 会先暂停，转而去运行 get_current_user。
    安全检查: 如果 Token 无效或过期，get_current_user 会直接抛出 HTTP 401 错误，read_users_me 根本不会被执行（保护了接口）。
    数据传递: 如果验证通过，get_current_user 返回的那个 user 数据库对象，会直接赋值给参数 current_user。
    直接返回: 我们只需要把这个拿到的用户对象直接 return 出去即可。
    """
    return current_user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)