from datetime import datetime, timedelta
from datetime import datetime, timedelta
from typing import Union, Any
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from database import get_session
from models import User
from schemas import TokenData

# === 配置 ===
SECRET_KEY = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# === 1. 密码哈希配置 (切换为 argon2) ===
# deprecated="auto" 会自动升级旧算法的哈希，非常安全
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# 定义 OAuth2 流程获取 Token 的地址是 /token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# === 工具函数 ===
def verify_password(plain_password, hashed_password):
    """验证密码是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """生成 Argon2 哈希"""
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """生成 JWT Token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# === 关键依赖注入 (Dependency) ===
async def get_current_user(access_token: str | None = Cookie(default=None), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    
    # 1. 如果 Cookie 里根本没有 token，直接报错
    if access_token is None:
        raise credentials_exception

    try:
        # 2. 解码 (直接解，不需要处理 Bearer 了)
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        agent_code: str = payload.get("sub")
        if agent_code is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # 3. 查库
    user = session.exec(select(User).where(User.agent_code == agent_code)).first()
    if user is None:
        raise credentials_exception
        
    return user