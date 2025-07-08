from typing import Any, Optional

from pydantic import BaseModel


# CoQuest Block types
class PersonaNodeData(BaseModel):
    persona_name: str | None
    persona_description: str | None
class CritiqueNodeData(BaseModel):
    critique_aspect: str | None
    critique_detail: str | None
class CritiqueNodeDataList(BaseModel): list[CritiqueNodeData]
class RQNodeData(BaseModel):
    rq_text: str
class DummyData(BaseModel):
    dummy: str
class LiteratureNodeData(BaseModel):
    title: str | None
    authors: list[str] | None
    abstract: str | None
    topic: Optional[str]=None
    url: Optional[str]=None
    year: Optional[str]=None
class LiteratureNodeDataList(BaseModel): 
    literatureNodeDataList: list[LiteratureNodeData]

# Node Data Type used in frontend
class NodeData(BaseModel):
    id: str
    type: str
    # label: str | None
    node: Any | None
    value: Any | None
    filterIDs: list[str] | None
    lockedIDs: list[str] | None
    userInput: str | None
    valueDict: dict[str, Any] | None
class Node(BaseModel):
    id: str
    type: str
    position: dict
    positionAbsolute: dict
    data: NodeData
    selected: Optional[bool]=None
    width: Optional[int]=None
    height: Optional[int]=None
    
class NodesWithDepth(BaseModel):
    depth: int
    node: Node

class FieldName(BaseModel):
    name: str

class TableData(BaseModel):
    text: str

class AgentSuggestion(BaseModel):
    persona_name:str
    text:str

class NewsletterUser(BaseModel):
    email: str
    preferred_topics: list[str]
    keywords: list[str]
    familiarity: str
    subscription_frequency: str



# API payload types
