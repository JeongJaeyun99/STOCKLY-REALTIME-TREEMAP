from fastapi import FastAPI
from routers import theme

app = FastAPI()
app.include_router(theme.router)