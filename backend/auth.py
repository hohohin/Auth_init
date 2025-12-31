from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from database import get_session
from models import User, TokenData

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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """生成 JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# === 关键依赖注入 (Dependency) ===
async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    """
    解码 Token -> 拿到用户名 -> 查库 -> 返回 User 对象
    如果 Token 无效或过期，直接抛出 401 错误
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    statement = select(User).where(User.username == token_data.username)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
        
    return user