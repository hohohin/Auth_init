from typing import Optional
from sqlmodel import SQLModel, Field

# === 数据库表模型 ===
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    agent_code: str = Field(index=True, unique=True)
    username: str = Field(default='未设置用户名')
    # 存储 Argon2 哈希后的字符串
    hashed_password: str

