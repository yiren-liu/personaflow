from functools import reduce
from typing import List, Optional

import os
import uuid
import time
import shutil
import json
import logging
from typing import Dict
from pathlib import Path
import asyncio
from dotenv import load_dotenv
from queue import PriorityQueue
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, Security, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from datetime import datetime, timedelta
from starlette.requests import Request
import requests

from pydantic import BaseModel
from semanticscholar import SemanticScholar
from semanticscholar.Paper import Paper

from block_app.chains.node_chains import CritiqueGenerator, RQGenerator, PersonaGenerator, RQueryGenerator, MarkdownGenerator
from block_app.models.nodes import PersonaNodeData, CritiqueNodeData, CritiqueNodeDataList, RQNodeData, DummyData, LiteratureNodeDataList, NodesWithDepth, LiteratureNodeData, FieldName, TableData, AgentSuggestion
from block_app.right_pane.rightTable import SuggestionTableGenerator
from block_app.prompts.node_prompts import top_universities, venue_names
# from block_app.chains.agent_workflow import AgentTeam
from block_app.chains.utils import format_lit_data, format_flow_context, format_bibtex_to_citation
from block_app.chains.text_to_speech.openai_text_to_audio import TTS

from user import User

from settings import app_settings

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import concurrent.futures
import redis 
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64

from request_constants import USER_INFO
from cryptography.hazmat.primitives import padding



from block_app.chains.paper_recommendation import FilterPaper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



# from db_utils.aws_rds import RDSClient
from db_utils.supabase_rds import RDSClient
RDS_CLIENT = RDSClient()
# test write
RDS_CLIENT.write_log("server_init_session_id", "server_init_type", {"server_init_log_body": ""}, "user_email_address")

# check for S2 API key
if app_settings.s2_api_key is None:
    logger.error("Semantic Scholar API key not found in .env file. Please provide Semantic Scholar API key in .env file.")
    raise Exception("Semantic Scholar API key not found in .env file. Please provide Semantic Scholar API key in .env file.")


# initialize reranker
reranker = None
if app_settings.reranker_type != "none":
    from block_app.chains.rerankers import create_reranker
    try:
        reranker = create_reranker()
        reranker.connect()
    except Exception as e:
        logger.error(f"Failed to initialize reranker: {e}")
        reranker = None

baseRouter = APIRouter()



current_dir = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = os.path.join(current_dir.parent, 'service_account_key.json')
SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']

class NodeData(BaseModel):
    node_id: str
    type: str
    command_name: str
    arguments: dict[str, str]
    rq_text: str | None
    user_input: str | None



# source_node_id: str, target_node_ids: list[str]
class CopyNodeCkptData(BaseModel):
    source_node_id: str
    target_node_ids: list[str]

class RetrievalQueryData(BaseModel):
    query: str

class LogData(BaseModel):
    type: str
    user: str
    log_body: str

class PaperInfoQueryDOI(BaseModel):
    doi: str

class PaperInfoQuerySearch(BaseModel):
    text: str
    num_results: Optional[int] = 10
    publication_date_range: Optional[str] = None
    is_open_access: Optional[bool] = None

class LiteratureSearchQuerySubQuery(BaseModel):
    search_query: str
    sub_queries: list[dict]
    num_results: Optional[int] = 10
    publication_date_range: Optional[str] = None
    is_open_access: Optional[bool] = None


class GoogleAuthRequest(BaseModel):
    # token: str
    data: dict

class UserInstructions(BaseModel):
    topic: str
    instructions: str
    numberOfDays: str
    openaccess: str
    rq_list: list[str]
    rq_index: list[str]

class paperIDs(BaseModel):
    IDs: list[str]

# class Persona2CritiquePayload(BaseModel):
#     RQNodeData: RQNodeData
#     personaNodeData: PersonaNodeData
#     ancestorNodesWithDepth: NodesWithDepth

# class Persona2LitQueryPayload(BaseModel):
#     RQNodeData: RQNodeData
#     personaNodeData: PersonaNodeData
#     ancestorNodesWithDepth: NodesWithDepth


def get_session_id(request: Request) -> str:
    request.session["session_id"] = request.session.get("session_id")
    session_id = request.session["session_id"]

    if session_id is None:
        session_id = str(uuid.uuid4())  # Or your own method of generating a unique session ID
        request.session["session_id"] = session_id
    return session_id


# Add these constants for JWT configuration
JWT_SECRET = app_settings.jwt_secret
JWT_ALGORITHM = "HS256"
decrypt_key = app_settings.decrypt_key
security = HTTPBearer()

def decrypt_data(encrypted_data, key):
    if not encrypted_data.strip():
        return encrypted_data.strip()
    encrypted_data_bytes = base64.b64decode(encrypted_data)
    key_bytes = key.encode('utf-8')
    backend = default_backend()
    cipher = Cipher(algorithms.AES(key_bytes), modes.ECB(), backend=backend)
    decryptor = cipher.decryptor()
    decrypted_padded_data = decryptor.update(encrypted_data_bytes) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()
    return decrypted_data.decode()

def decode_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], audience="authenticated")
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

def set_user_var(openai_key, openai_base_url):
    user = User()
    user.initialize_LLM(openai_key, openai_base_url)
    USER_INFO.set(user)

def set_user_info(request: Request):
    openai_key = decrypt_data(request.headers.get('OPENAI-API-KEY', ''), decrypt_key)
    openai_base_url = request.headers.get('OPENAI-BASE-URL', '')
    set_user_var(openai_key, openai_base_url)


def init_request(request: Request):
    """
    Request can be None if things are being called internally
    """
    if request is not None:
        set_user_info(request)

def quota_and_auth_middleware(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    decoded_token = decode_jwt(credentials.credentials)
    if not decoded_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return decoded_token


# Initialize Redis connection
# redis_client = redis.Redis(
#     host=app_settings.redis_host,
#     port=app_settings.redis_port,
#     password=app_settings.redis_password
# )
redis_client = redis.Redis(
    host="localhost",
    port=6379,
)
#Define user quota limit
USER_QUOTA_LIMIT = 1000  # Set your quota limit here
TIME_WINDOW = 3600  # 60 minutes
QUOTA_LIMIT = 50
QUOTA_USAGE_MAP = {
    "block/persona_to_critique": 1,
    "block/critique_to_rq": 1,
    "block/rq_to_persona": 1,
    "block/lit_to_persona": 1,
    "block/persona_to_lit_query": 1,
    "block/generate_agent_suggestion": 1,
    "block/table_suggestion": 1,
    "block/add_field": 1,
    "block/generate_hypothetical_abstract": 1,
    "block/generate_literature_review": 1,
    "block/generate_research_scenario": 1,
}

# async def quota_and_auth_middleware(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
#     token = credentials.credentials
#     decoded_token = get_current_user(token, request)
#     if not decoded_token:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    

    
#     user_id = decoded_token['sub']


#     # Get the current time
#     current_time = int(datetime.now().timestamp())

#     # Get user's quota usage and timestamp from Redis
#     quota_usage = redis_client.get(f"quota:{user_id}")
#     quota_timestamp = redis_client.get(f"quota_timestamp:{user_id}")

#     if quota_usage is None or quota_timestamp is None:
#         # Initialize quota usage and timestamp if not present
#         quota_usage = 0
#         quota_timestamp = current_time
#         redis_client.set(f"quota:{user_id}", quota_usage)
#         redis_client.set(f"quota_timestamp:{user_id}", quota_timestamp)
#     else:
#         quota_usage = int(quota_usage)
#         quota_timestamp = int(quota_timestamp)

#     # Check if the current time is outside the time window
#     if current_time - quota_timestamp > TIME_WINDOW:
#         # Reset the quota usage and timestamp
#         quota_usage = 0
#         quota_timestamp = current_time
#         redis_client.set(f"quota:{user_id}", quota_usage)
#         redis_client.set(f"quota_timestamp:{user_id}", quota_timestamp)


#     if not request.url.path.lstrip("/api/v1") in QUOTA_USAGE_MAP:
#         return decoded_token

#     if len(request.headers.get('OPENAI-API-KEY', '').strip()) > 0:
#         quota_limit = 999999
#     else: 
#         quota_limit = RDS_CLIENT.get_user_quota(user_id)

#     if quota_usage >= quota_limit:
#         return Response("Quota exceeded", status_code=429)

#     # Increment quota usage for specific endpoints
#     if request.url.path.lstrip("/api/v1") in QUOTA_USAGE_MAP:
#         quota_usage += QUOTA_USAGE_MAP[request.url.path.lstrip("/api/v1")]
#         redis_client.set(f"quota:{user_id}", quota_usage)
#     return decoded_token

# endpoint for checking user quota limit, current usage
@baseRouter.get("/block/check_quota")
def check_quota(request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    quota_usage = redis_client.get(f"quota:{current_user['sub']}")
    if quota_usage is None:
        quota_usage = 0
    quota_timestamp_bytes = redis_client.get(f"quota_timestamp:{current_user['sub']}")
    quota_timestamp = int(quota_timestamp_bytes.decode('utf-8'))
    current_time = int(datetime.now().timestamp())
    refresh_in_seconds = TIME_WINDOW - (current_time - quota_timestamp)
    if refresh_in_seconds < 0:
        refresh_in_seconds = 0
    quota_limit = QUOTA_LIMIT
    return {
        "quota_usage": quota_usage,
        "quota_timestamp": quota_timestamp,
        "refresh_in_seconds": refresh_in_seconds,
        "quota_limit": quota_limit
    }

# endpoint for checking user quota limit, current usage
@baseRouter.get("/block/check_quota")
def check_quota(request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    quota_usage = redis_client.get(f"quota:{current_user['sub']}")
    if quota_usage is None:
        quota_usage = 0
    quota_timestamp_bytes = redis_client.get(f"quota_timestamp:{current_user['sub']}")
    quota_timestamp = int(quota_timestamp_bytes.decode('utf-8'))
    current_time = int(datetime.now().timestamp())
    refresh_in_seconds = TIME_WINDOW - (current_time - quota_timestamp)
    if refresh_in_seconds < 0:
        refresh_in_seconds = 0
    quota_limit = QUOTA_LIMIT
    return {
        "quota_usage": quota_usage,
        "quota_timestamp": quota_timestamp,
        "refresh_in_seconds": refresh_in_seconds,
        "quota_limit": quota_limit
    }

# create a websocket connection
@baseRouter.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("websocket accepted")
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")



@baseRouter.get("/")
def root_api_v1(request: Request):
    get_session_id(request)
    return {"message": "Hello World from api/v1"}

# endpoint for validating user's API key
@baseRouter.post("/block/validate_api_key")
def validate_api_key(request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    user_info: User = USER_INFO.get()
    llm_gpt4 = user_info.llm_gpt4
    try:
        llm_gpt4.invoke("Hello, world!", max_tokens=1)
    except Exception as e:
        raise HTTPException(status_code=500, detail="The API key or base url you provided is invalid.")
    return {"message": "API key is valid"}


# endpoints for CoQuest-Block
@baseRouter.post("/block/persona_to_critique")
def persona_to_critique(rqNodeData: RQNodeData, personaNodeData: List[PersonaNodeData], ancestorNodesWithDepth: List[NodesWithDepth], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = CritiqueGenerator()

    # TODO: handle if multiple persona nodes are passed
    personaNodeData = personaNodeData[0]

    persona_text = f"Persona Name: {personaNodeData.persona_name}\nPersona Description: {personaNodeData.persona_description}"
    rq_text = f"RQ: {rqNodeData.rq_text}"

    # search if ancestorNodesWithDepth contains any literature nodes
    litNodeDataList: List[LiteratureNodeData] = []
    for nodeWithDepth in ancestorNodesWithDepth:
        node = nodeWithDepth.node
        if node.type == "LiteratureNode":
            for v in node.data.node["template"]["paper_list"]["value"]:
                if type(v) == dict:
                    litNodeDataList.append(LiteratureNodeData(**v))

    crits = generator.generate_critiques_from_rq_persona_with_lits(rq_text, persona_text, litNodeDataList)

    res: List[CritiqueNodeData] = [] 
    for crit in crits:
        res.append({
            "critique_aspect": crit['critique_aspect'],
            "critique_detail": crit['critique_detail']
        })

    return res

@baseRouter.post("/block/critique_to_rq")
def critique_to_rq(RQNodeData: RQNodeData, critiqueNodeDataList: List[CritiqueNodeData], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = RQGenerator()

    rq_text = f"RQ: {RQNodeData.rq_text}"
    crits: List[CritiqueNodeData] = []
    for crit in critiqueNodeDataList:
        crits.append({
            "critique_aspect": crit.critique_aspect,
            "critique_detail": crit.critique_detail
        })
    
    rqs = generator.generate_rqs_from_critiques(rq_text, crits)

    res = []
    for rq in rqs:
        res.append({
            "rq_text": rq['revised_rq']
        })
    
    return res

@baseRouter.post("/block/rq_to_persona")
def rq_to_personas(RQNodeData: RQNodeData, ancestorNodesWithDepth: List[NodesWithDepth], dummy: DummyData, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = PersonaGenerator()

    rq_text = f"RQ: {RQNodeData.rq_text}"
    history_personas = []
    for nodeWithDepth in ancestorNodesWithDepth:
        node = nodeWithDepth.node
        if node.type == "PersonaNode":
            history_personas.append({
                "persona_name": node.data.node["template"]["persona_name"]["value"],
                "persona_description": node.data.node["template"]["persona_description"]["value"]
            })

    personas = generator.generate_personas_from_rq(rq_text, history_personas)

    res: List[PersonaNodeData] = []
    for persona in personas:
        res.append({
            "persona_name": persona['persona_name'],
            "persona_description": persona['persona_description']
        })
    
    return res


@baseRouter.post("/block/lit_to_persona")
def lit_to_persona(lit2PersonaPayload: LiteratureNodeDataList, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = PersonaGenerator()

    personas = generator.generate_persona_from_lits(lit2PersonaPayload.literatureNodeDataList)
    # personas = generator.generate_persona_from_lits(literatureNodeDataList)

    res: List[PersonaNodeData] = []
    for persona in personas:
        res.append({
            "persona_name": persona['persona_name'],
            "persona_description": persona['persona_description']
        })
    
    return res



# Endpoints for generating and manipulating research outline panel
@baseRouter.post('/block/table_suggestion')
def table_suggestion(rqNodeData:RQNodeData, personaNodeData:PersonaNodeData, critiqueNodeData:CritiqueNodeData, literatureNodeDataList: list[LiteratureNodeData], ancestorNodesWithDepth: List[NodesWithDepth], researchScenario: List[str], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = SuggestionTableGenerator()
    rq_text = f"RQ: {rqNodeData.rq_text}"
    persona_text = f"Persona Description: {personaNodeData.persona_description}"
    crits = f"CritiqueData: {critiqueNodeData.critique_detail}"
    lits = literatureNodeDataList
    context = format_flow_context(ancestorNodesWithDepth)
    suggestion_table = generator.generate_suggestion_table(rq_text, persona_text, crits, lits, researchScenario[0], context)

    return suggestion_table

@baseRouter.post("/block/add_field")
def add_field_to_table(field:FieldName, rqNodeData:RQNodeData, personaNodeData:PersonaNodeData, critiqueNodeData:CritiqueNodeData, literatureNodeDataList: list[LiteratureNodeData], tableData:TableData, ancestorNodesWithDepth: List[NodesWithDepth], researchScenario: List[str], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = SuggestionTableGenerator()
    rq_text = f"RQ: {rqNodeData.rq_text}"
    persona_text = f"Persona Description: {personaNodeData.persona_description}"
    crits = f"CritiqueData: {critiqueNodeData.critique_detail}"
    lits = literatureNodeDataList
    field_name=field.name
    context = format_flow_context(ancestorNodesWithDepth)
    new_field=generator.add_new_field(field_name,rq_text, persona_text, crits, lits, tableData, researchScenario[0], context)
    return new_field

@baseRouter.post("/block/generate_hypothetical_abstract")
def generate_hypothetical_abstract(rqNodeData:RQNodeData, personaNodeData:PersonaNodeData, critiqueNodeData:CritiqueNodeData, literatureNodeDataList: list[LiteratureNodeData], tableData:TableData, ancestorNodesWithDepth: List[NodesWithDepth], researchScenario: List[str], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = SuggestionTableGenerator()
    rq_text = f"RQ: {rqNodeData.rq_text}"
    persona_text = f"Persona Description: {personaNodeData.persona_description}"
    crits = f"CritiqueData: {critiqueNodeData.critique_detail}"
    lits = literatureNodeDataList
    context = format_flow_context(ancestorNodesWithDepth)
    hypothetical_abstract=generator.generate_hypothetical_abstract(persona_text, rq_text, crits, lits, tableData, researchScenario[0], context) # {"hypothetical_abstract": "..."}
    return hypothetical_abstract

@baseRouter.post("/block/generate_literature_review")
def generate_literature_review(rqNodeData:RQNodeData, literatureNodeDataList: list[LiteratureNodeData], ancestorNodesWithDepth: List[NodesWithDepth], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = SuggestionTableGenerator()
    lits = literatureNodeDataList
    rq = rqNodeData.rq_text
    context = format_flow_context(ancestorNodesWithDepth)
    literature_review=generator.generate_literature_review(lits, rq, context) # {"literature_review": "..."}
    return literature_review

@baseRouter.post("/block/generate_research_scenario")
def generate_research_scenario(rqNodeData:RQNodeData, literatureNodeDataList: list[LiteratureNodeData], ancestorNodesWithDepth: List[NodesWithDepth], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = SuggestionTableGenerator()
    lits = literatureNodeDataList
    rq = rqNodeData.rq_text
    context = format_flow_context(ancestorNodesWithDepth)
    research_scenarios=generator.generate_research_scenario(lits, rq, context) # {"research_scenarios": ["RESEARCH SCENARIO 1", "RESEARCH SCENARIO 2", ...]}
    return research_scenarios



# @baseRouter.post("/block/generate_agent_suggestion")
# def generate_agent_suggestion(rqNodeData:RQNodeData,personaNodeData: List[PersonaNodeData],request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
#     init_request(request)
#     ag=AgentTeam()
#     for personaNode in personaNodeData:
#         ag.add_agent(personaNode.persona_name,personaNode.persona_description)

#     rq_text=rqNodeData.rq_text
#     chat_results=ag.create_agent(rq_text)
#     res=[]
#     for i, chat_res in chat_results.items():
#         res.append({
#             "persona_name":ag.id[i],
#             "text":chat_res.summary
#         })
#     return res

@baseRouter.post("/block/persona_to_lit_query")
def persona_to_lit_query(rqNodeData: RQNodeData, personaNodeData: List[PersonaNodeData], ancestorNodesWithDepth: List[NodesWithDepth], request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    generator = PersonaGenerator()

    # TODO: handle if multiple persona nodes are passed
    personaNodeData = personaNodeData[0]

    persona_text = f"Persona Name: {personaNodeData.persona_name}\nPersona Description: {personaNodeData.persona_description}"
    rq_text = f"RQ: {rqNodeData.rq_text}"
    
    # search if ancestorNodesWithDepth contains any literature nodes
    litNodeDataList: List[LiteratureNodeData] = []
    for nodeWithDepth in ancestorNodesWithDepth:
        node = nodeWithDepth.node
        if node.type == "LiteratureNode":
            for v in node.data.node["template"]["paper_list"]["value"]:
                if type(v) == dict:
                    litNodeDataList.append(LiteratureNodeData(**v))

    queries = generator.generate_lit_queries_from_rq_persona(
        rq_text, persona_text, litNodeDataList
    )

    res = []
    for query in queries:
        res.append({
            "search_query": query['search_query'],
            "sub_queries": query['sub_queries']
        })
    
    return res

@baseRouter.post("/block/persona_lit_search")
def persona_lit_search(rqNodeData: RQNodeData, personaNodeData: List[PersonaNodeData], search_query: LiteratureSearchQuerySubQuery, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    """
    This endpoint is for advanced lit search with a given persona.
    1. Break down the query into multiple sub-queries and keywords
    2. Search for papers with each sub-query and keywords
    3. rerank the papers based on the persona and RQ
    4. return the top results
    """
    # breakdown the query into sub-queries and keywords
    init_request(request)
    generator = PersonaGenerator()

    # TODO: handle if multiple persona nodes are passed
    personaNodeData = personaNodeData[0]

    persona_text = f"Persona Name: {personaNodeData.persona_name}\nPersona Description: {personaNodeData.persona_description}"
    rq_text = f"RQ: {rqNodeData.rq_text}"
    query = search_query.search_query  
    num_results = search_query.num_results
    filter_date= search_query.publication_date_range   
    open_access=search_query.is_open_access
    sub_queries = search_query.sub_queries # [{"sub_query": "...", "rationale": "..."}, ...]
    # search for papers with each sub-query and keywords
    # papers = []
    # for sub_query in sub_queries:
    #     res = get_paper_info_search(PaperInfoQuerySearch(text=sub_query["sub_query"]), request)
    #     papers.extend(res["paper_list"])

    if len(sub_queries)==0:
        with concurrent.futures.ThreadPoolExecutor(4) as executor:
        # Submit functions for execution
            futures = [
                executor.submit(get_paper_info_search, PaperInfoQuerySearch(text=query,num_results=num_results, publication_date_range=filter_date, is_open_access=open_access), request)
            ]

    else:
        with concurrent.futures.ThreadPoolExecutor(4) as executor:
        # Submit functions for execution
            futures = [
                executor.submit(get_paper_info_search, PaperInfoQuerySearch(text=query,num_results=num_results, publication_date_range=filter_date, is_open_access=open_access), request), 
                executor.submit(get_paper_info_search, PaperInfoQuerySearch(text=sub_queries[0]["sub_query"],num_results=num_results, publication_date_range=filter_date, is_open_access=open_access), request), 
                executor.submit(get_paper_info_search, PaperInfoQuerySearch(text=sub_queries[1]["sub_query"],num_results=num_results, publication_date_range=filter_date, is_open_access=open_access), request), 
                executor.submit(get_paper_info_search, PaperInfoQuerySearch(text=sub_queries[2]["sub_query"],num_results=num_results, publication_date_range=filter_date, is_open_access=open_access), request)
            ]

    # Wait for all functions to complete
    concurrent.futures.wait(futures)
    papers = []
    for future in futures:
        papers.extend(future.result()['paper_list'])

    # deduplicate papers
    papers_dedup = {}
    for paper in papers:
        # remove paper without abstract or empty abstract
        if "abstract" not in paper or not paper["abstract"]:
            continue
        papers_dedup[paper["title"]] = paper
    papers = list(papers_dedup.values())
    # rerank the papers based on the persona and RQ
    papers = generator.rerank_papers(query, papers, sub_queries, rq_text, persona_text, topk=num_results)
    
    return {"paper_list": papers, "query": query}

# endpoints for fetching paper info from semantic scholar
@baseRouter.post("/paper_info/doi")
def get_paper_info_doi(query: PaperInfoQueryDOI, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    doi = query.doi
    sid = get_session_id(request)

    sch = SemanticScholar()
    # paper = sch.get_paper('10.1093/mind/lix.236.433')
    paper = sch.get_paper(doi)

    paper = {
        "title": paper.title,
        "authors": [a.name for a in paper.authors],
        "abstract": paper.abstract,
    }

    return paper

@baseRouter.post("/paper_info/search")
def get_paper_info_search(query: PaperInfoQuerySearch, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    text = query.text
    sch = SemanticScholar(
        api_key=app_settings.s2_api_key,
        timeout=60
    )
    papers = sch.search_paper(text, limit=query.num_results, publication_date_or_year=query.publication_date_range,open_access_pdf=query.is_open_access)
    res = []
    for paper in papers[:query.num_results]:
        res.append({
            "title": paper.title,
            "authors": [a.name for a in paper.authors],
            "abstract": paper.abstract,
            "url": paper.url,
            "topic": query.text,
            "year": str(paper.year),
            "venue": str(paper.venue),
            "citationCount": str(paper.citationCount),
            "openaccess_url":paper.openAccessPdf,
            "paperId":paper.paperId,
            "bibtex":paper.citationStyles,
            "author_info":paper.authors,
            "journal":paper.journal
        })
    return {"paper_list": res, "query": text}

@baseRouter.post("/testing/paper_info/search_and_format")
def get_paper_info_search_and_format(query: PaperInfoQuerySearch, request: Request):
    init_request(request)
    text = query.text
    sch = SemanticScholar(
        api_key=app_settings.s2_api_key,
        timeout=60
    )
    papers = sch.search_paper(text, limit=query.num_results, publication_date_or_year=query.publication_date_range,open_access_pdf=query.is_open_access)
    res = []
    for paper in papers[:query.num_results]:
        if paper.citationStyles:
            res.append(format_bibtex_to_citation(paper.citationStyles['bibtex']))
    return {"paper_citations": res}

# endpoints for logging (json data: {type: str, log_body: dict}})
@baseRouter.post("/log/save")
async def log_data(logData: LogData, request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    sid = get_session_id(request)
    log_type, log_body, user = logData.type, logData.log_body, logData.user

    # load log_body from json string
    log_body = json.loads(log_body)

    RDS_CLIENT.write_log(sid, log_type, log_body, user)

@baseRouter.get("/log/check_session_id")
async def check_session_id(request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    return {"session_id": get_session_id(request)}

# endpoint for google doc
@baseRouter.post("/create-google-doc")
async def create_google_doc(googleAuthRequest: GoogleAuthRequest ,request: Request, current_user: dict = Depends(quota_and_auth_middleware)):
    init_request(request)
    try:
        document_data = googleAuthRequest.data
        # logger.info(f"Creating Google Doc with data: {document_data}")
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        docs_service = build('docs', 'v1', credentials=credentials)

        document = docs_service.documents().create(body={
            'title': 'Research Outline Document'
        }).execute()

        doc_id = document['documentId']

        def format_literature_review(lit_review_data):
            formatted_text = "\n\n"
            for key, value in lit_review_data.items():
                formatted_text += f"{key}:\n"
                
                
                paragraphs = value.split('\n')
                
                for paragraph in paragraphs:
                    
                    words = paragraph.split()
                    for i, word in enumerate(words):
                        if word.endswith(')') and '(' in word:
                            
                            citation_parts = word.split('(')
                            words[i] = f"{citation_parts[0]}({citation_parts[1][:-1]})" 
                    
                    
                    formatted_paragraph = ' '.join(words)
                    
                    
                    formatted_text += f"{formatted_paragraph}\n"
                
                formatted_text += "\n"  
            
            return formatted_text.strip()

        def format_research_outline(research_outline_data):
            formatted_text = "\n\n"
            for section in research_outline_data:
                formatted_text += f"{section['title']}:\n"
                
               
                lines = section['description'].split('\n')
                
                for line in lines:
                    line = line.strip()
                    if line:
                        
                        if line[0].isdigit() and '. ' in line:
                            number, text = line.split('. ', 1)
                            formatted_text += f"{number}. {text}\n"
                        else:
                            formatted_text += f"{line}\n"
                
                formatted_text += "\n"  
            
            return formatted_text.strip()
        def format_document_data(document_data):
            formatted_data = {}
            formatted_data['Session ID'] = document_data['sessionId']
            formatted_data['Research Question'] = document_data['researchQuestion']
            
            formatted_data['Literature Review'] = format_literature_review(document_data['literatureReview'])

            formatted_data['Research Scenario'] = document_data['scenarioInput']
            
            formatted_data['Research Outline'] = format_research_outline(document_data['researchOutline'])

            formatted_data['Hypothetical Abstract'] = document_data['hypotheticalAbstract']
            return formatted_data
        
        formatted_data = format_document_data(document_data)
        logger.info("HERE----",formatted_data)

        requests = []
        current_index = 1  

        for heading, content in formatted_data.items():
            heading_text = f"{heading}:"
            
            
            requests.append({'insertText': {'location': {'index': current_index}, 'text': heading_text + '\n'}})
            
            
            requests.append({'updateTextStyle': {
                'range': {'startIndex': current_index, 'endIndex': current_index + len(heading_text)},
                'textStyle': {'bold': True},
                'fields': 'bold'
            }})
            
            current_index += len(heading_text) + 1 
            
            
            requests.append({'insertText': {'location': {'index': current_index}, 'text': content + '\n\n'}})
            
            current_index += len(content) + 2


        docs_service.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
        
        drive_service = build('drive', 'v3', credentials=credentials)
        drive_service.permissions().create(
            fileId=doc_id,
            body={'type': 'anyone', 'role': 'writer'},
            fields='id'
        ).execute()
        

        return {"status": "Document created", "documentId": doc_id}
    except HttpError as e:
        logger.error(f"Failed to create Google Doc: {e}")
        raise HTTPException(status_code=500, detail="Failed to create Google Doc")
    except Exception as e:
        logger.error(f"Unexpected error creating Google Doc: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error creating Google Doc")

def get_paper_by_names(paper_id):
    sch = SemanticScholar(
        api_key=app_settings.s2_api_key,
        timeout=60
    )
    try:
        # papers = sch.search_paper(text, limit=1, open_access_pdf=True)
        papers=sch.get_papers(paper_ids=[paper_id])
        if not papers:
            return {"error": "No papers found for the given title."}
        res = []
        for paper in papers[:1]:
            res.append({
                "title": paper.title,
                "authors": [a.name for a in paper.authors],
                "abstract": paper.abstract,
                "url": paper.url,
                "year": str(paper.year),
                "venue": str(paper.venue),
                "citationCount": str(paper.citationCount),
                "openaccess_url":paper.openAccessPdf,
                "paperId":paper.paperId,
                "bibtex":paper.citationStyles
            })
        return {"paper_list": res}
    except Exception as e:
        return {"error": str(e)}
