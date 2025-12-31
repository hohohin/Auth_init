from sqlmodel import SQLModel, create_engine, Session

# 依然用 SQLite 演示，生产环境换成 PostgreSQL
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session