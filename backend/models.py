from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import BaseModel

# === 数据库表模型 ===
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    agent_code: str = Field(index=True, unique=True)
    username: str = Field(default='未设置用户名')
    # 存储 Argon2 哈希后的字符串
    hashed_password: str

# === Pydantic 交互模型 (用于 API 请求/响应) ===
class UserCreate(BaseModel):
    username: str
    agent_code: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    agent_code: Optional[str] = None