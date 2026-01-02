from pydantic import BaseModel
from typing import Optional

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