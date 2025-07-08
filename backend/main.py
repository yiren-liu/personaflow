import dotenv
dotenv.load_dotenv(".env.block")

import logging
logging.basicConfig(level=logging.INFO)

import os
import uuid
import shutil
import json
import copy
from typing import List

import numpy as np

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Body



from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware

from routers.base import baseRouter

from block_app.chains.custom_openai_exception import CustomOpenAIException


# from autogpt.agent.agent import Agent

# from agents import create_new_agent

# from autogpt.retriever.retriever import OpenAIRetriever
# from autogpt.db_utils.aws_rds import RDSClient


# RETRIEVER = OpenAIRetriever()

logger = logging.getLogger(__name__)

SessionID2Agent = {}
HTTP_USER_ERROR = 491

app = FastAPI()
app.include_router(baseRouter, prefix="/api/v1", tags=["api/v1"])

origins = [
    "*",
]

app.add_middleware(SessionMiddleware, secret_key="SECRET_KEY")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
	exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
	logging.error(f"{request}: {exc_str}")
	content = {'status_code': 10422, 'message': exc_str, 'data': None}
	return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

@app.exception_handler(CustomOpenAIException)
async def openai_exception_handler(request: Request, exc: CustomOpenAIException):
    content = {'error_type': str(exc.args[0])[8:-2], 'message': exc.args[1]}
    return JSONResponse(content=content, status_code = HTTP_USER_ERROR)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="0.0.0.0", port=8321, 
        workers=1, 
        loop="asyncio",
        log_level="info",
        # reload=True, 
    )
