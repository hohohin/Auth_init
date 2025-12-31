from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. 导入这个
from sqlmodel import Session, select

# 导入自定义模块
from database import create_db_and_tables, get_session
from models import User, UserCreate, Token
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
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)
):
    # 1. 查用户
    user = session.exec(select(User).where(User.agent_code == form_data.username)).first()
    
    # 2. 验证密码 (Argon2)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. 生成 Token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.agent_code}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# === 受保护的接口 ===
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    """
    只要加了 Depends(auth.get_current_user)，
    没有 Token 或 Token 过期都会自动被挡在外面
    """
    return current_user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)