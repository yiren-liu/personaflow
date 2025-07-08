from typing import List, Any, Dict

import os
# add working directory to python path
import sys

sys.path.append(os.getcwd())

import logging

import json
import json_repair

from settings import app_settings


from langchain.prompts import PromptTemplate
from langchain.docstore.document import Document

from langchain_core.output_parsers import JsonOutputParser

from block_app.prompts.node_prompts import SimplePersona2CritiqueTemplate, SimpleCritique2RQTemplate, SimpleRQ2PersonasTemplate, SimpleLitSummary2PersonasTemplate, Persona2CritiqueWithLitsTemplate, Persona2LitsQueryTemplate, SimpleLitSummary2PersonasTemplate_2, PersonaNameGeneration, PersonaLitsQueryBreakdownTemplate, Persona2LitsQueryAndSubQuery, UserIntstructions2RQTemplate, PaperRelevancyTemplateAbstract,PaperAbstract2Markdown, PaperAbstract2Markdown_2, Persona2LitsQueryAndSubQueryNewsletter


from block_app.models.nodes import LiteratureNodeDataList, LiteratureNodeData
from block_app.chains.lit_summarizer_chains import get_summarizer_chain

from block_app.chains.utils import format_lit_data


import boto3

from block_app.chains.auth_profile import auth_profile_faiss
import asyncio
from queue import PriorityQueue
import time
from semanticscholar import SemanticScholar

from block_app.chains.rerankers import create_reranker
from request_constants import USER_INFO
from block_app.chains.llm_chain import RQFlowLLMChain
from langchain.chains import LLMChain

# setting up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# if app_settings.openai_api_type == "openai":
#     openai.api_type = "openai"
#     openai.api_base = "https://api.openai.com/v1"
#     openai.api_version = None
#     llm_gpt4 = ChatOpenAI(
#         openai_api_key=app_settings.openai_api_key,
#         model_name="gpt-4o",
#         base_url=app_settings.openai_api_base,
#         # model_name="gpt-3.5-turbo",
#         temperature=.7,
#         max_tokens=1000,
#         model_kwargs = {
#             "presence_penalty": 0,
#             "frequency_penalty": 0,
#             "stop": None,
#             "top_p": 0.95
#         }
#     )
#     llm_gpt35 = ChatOpenAI(
#         openai_api_key=app_settings.openai_api_key,
#         model_name="gpt-4o",
#         base_url=app_settings.openai_api_base,
#         # model_name="gpt-3.5-turbo",
#         temperature=.7,
#         max_tokens=1000,
#         model_kwargs = {
#             "presence_penalty": 0,
#             "frequency_penalty": 0,
#             "stop": None,
#             "top_p": 0.95
#         }
#     )
# elif app_settings.openai_api_type == "azure":
#     # use azure api key
#     llm_gpt4 = AzureChatOpenAI(
#         openai_api_key=app_settings.openai_api_key,
#         azure_endpoint=app_settings.openai_api_base,
#         openai_api_version=app_settings.openai_api_version,
#         openai_api_type=app_settings.openai_api_type,
#         deployment_name="gpt-4",
#         max_tokens=1000,
#         temperature=.7,
#         model_kwargs = {
#             "presence_penalty": 0,
#             "frequency_penalty": 0,
#             "stop": None,
#             "top_p": 0.95
#         }
#     )
#     llm_gpt35 = AzureChatOpenAI(
#         openai_api_key=app_settings.openai_api_key,
#         azure_endpoint=app_settings.openai_api_base,
#         openai_api_version=app_settings.openai_api_version,
#         openai_api_type=app_settings.openai_api_type,
#         deployment_name="gpt-35-turbo",
#         max_tokens=1000,
#         temperature=.7,
#         model_kwargs = {
#             "presence_penalty": 0,
#             "frequency_penalty": 0,
#             "stop": None,
#             "top_p": 0.95
#         }
#     )
# elif app_settings.openai_api_type == "tgi":
#     llm = HuggingFaceTextGenInference(
#         inference_server_url=app_settings.tgi_url,
#         max_new_tokens=1024,
#         # top_k=10,
#         top_p=0.95,
#         # typical_p=0.95,
#         temperature=0.2,
#         # repetition_penalty=1.03,
#         streaming=False,
#         stop_sequences=["<|eot_id|>"],
#     )
#     llm_gpt4 = Llama3Chat(llm=llm, model_id=app_settings.hf_model_id)
#     llm_gpt35 = Llama3Chat(llm=llm, model_id=app_settings.hf_model_id)

def invoke_sagemaker_endpoint(data, content_type='application/json'):
    payload = json.dumps(data)
    endpoint_name = app_settings.sagamaker_cls_endpoint
    client = boto3.client('sagemaker-runtime', region_name='us-east-1')
    try:
        response = client.invoke_endpoint(
            EndpointName=endpoint_name,
            Body=payload,
            ContentType=content_type
        )
        prediction = response['Body'].read().decode('utf-8')
        return prediction
    except Exception as e:
        print(f"An error occurred while invoking the endpoint: {str(e)}")
        return None

def run_asyncio_tasks(tasks):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:  
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(asyncio.gather(*tasks))

async def main_fun(input_lst, topic):
    tasks = [
        auth_profile_faiss(input_lst[i], topic, i) for i in range(len(input_lst))
    ]
    results = await asyncio.gather(*tasks)
    ans = []

    for i, result in enumerate(results):
        ans.append(result)
    return ans

async def generate_main(lst1,lst2,lst3,start):
    tasks =[
        generate_persona(lst1,start),generate_persona(lst2,start),generate_persona(lst3,start)
    ]
    results=await asyncio.gather(*tasks)
    return

async def generate_persona(doc_list):
    per=PersonaGenerator()
    res_list = await per.lit_summarizer.abatch([{"input_documents": a} for a in doc_list], return_only_outputs=True)
    per_res_list = await per.lit_2_persona_auth.abatch([{"summary": r} for r in res_list], return_only_outputs=True)
    return per_res_list

def auth_search(auth_name):
    try:
        sch = SemanticScholar(api_key=app_settings.s2_api_key)
        results = sch.search_author(auth_name)
        if not results:
            raise ValueError("No results found")  # Raise an error if no results
        return results
    except Exception as e:
        print(f"Error occurred: {e}")
        return -1  # Return -1 in case of any error

async def top_authors(auth_name):
    loop = asyncio.get_running_loop()
    try:
        results = await loop.run_in_executor(None, auth_search, auth_name)
        if results == -1:
            return -1  # Immediately return if error is encountered
        
    except Exception as e:
        print(f"Error in processing{e}")
    #     return -1


    all_results=[]
    for i in range(len(results)):
        all_results.extend(dicn for dicn in results[i].papers)
    
    pq=PriorityQueue()
    for paper in all_results:
        pq.put((-paper.citationCount,auth_name))
    
    return pq.get()

async def citation_cnt(auth_lst):
    tasks=[
        top_authors(auth_name) for auth_name in auth_lst
    ]
    results=await asyncio.gather(*tasks)
    pq=PriorityQueue()
    for res in results:
        pq.put(res)
    
    a1=pq.get()
    a2=pq.get()

    return a1,a2

class MarkdownGenerator():
    def __init__(self) -> None:
        llm_gpt4 = USER_INFO.get().llm_gpt4
        self.markdown_template=PromptTemplate(
            input_variables=["formatted_paper1","formatted_paper2","formatted_paper3"], template=PaperAbstract2Markdown
        )

        self.markdown_template_2=PromptTemplate(
            input_variables=["formatted_paper1","formatted_paper2","formatted_paper3","formatted_paper4"], template=PaperAbstract2Markdown_2
        )
        self.paper2markdown=RQFlowLLMChain(llm=llm_gpt4,prompt=self.markdown_template)

        self.paper2markdown_2=RQFlowLLMChain(llm=llm_gpt4,prompt=self.markdown_template)

    def generate_markdown_from_paper(self,paper1,paper2,paper3):
        res=self.paper2markdown({"formatted_paper1":paper1,"formatted_paper2":paper2,"formatted_paper3":paper3})
        final_res=json_repair.loads(res['text'])
        return final_res
    
    def generate_markdown_from_paper_2(self,paper1,paper2,paper3,paper4):
        res=self.paper2markdown_2({"formatted_paper1":paper1,"formatted_paper2":paper2,"formatted_paper3":paper3,"formatted_paper4":paper4})
        final_res=json_repair.loads(res['text'])
        return final_res

class RQueryGenerator():
    def __init__(self) -> None:
         
        llm_gpt4 = USER_INFO.get().llm_gpt4
        self.instruction2rq_template = PromptTemplate(
            input_variables=["topic", "instructions"], template=UserIntstructions2RQTemplate
        )
        self.instruction2rq= RQFlowLLMChain(llm=llm_gpt4, prompt=self.instruction2rq_template)
    
    def generate_rq_from_instructions(self, topic, instructions):
        res = self.instruction2rq({"topic": topic, "instructions": instructions})
        rqs = json_repair.loads(res['text'])
        return rqs

class CritiqueGenerator():
    def __init__(self) -> None:
        llm_gpt4 = USER_INFO.get().llm_gpt4
        self.persona_2_critique_template = PromptTemplate(
            input_variables=["rq", "persona"], template=SimplePersona2CritiqueTemplate
        )
        self.persona_2_critique = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_2_critique_template)

        self.persona_2_critique_with_lits_template = PromptTemplate(
            input_variables=["rq", "persona", "lits"], template=Persona2CritiqueWithLitsTemplate
        )
        # self.persona_2_critique_with_lits = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_2_critique_with_lits_template, verbose=True)
        self.persona_2_critique_with_lits = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_2_critique_with_lits_template)
    
    # def generate_critiques_from_rq_persona(self, rq, persona) -> List[Dict[str, str]]:
    #     res = self.persona_2_critique({"rq": rq, "persona": persona})
    #     crits = json.loads(res['text'])
    #     return crits
    
    def generate_critiques_from_rq_persona_with_lits(self, rq, persona, litDataList: List[LiteratureNodeData]) -> List[Dict[str, str]]:
        crits = [] # [{"critique_aspect": "...", "critique_detail": "..."}, ...]
        if len(litDataList) > 0:
            lit_string = format_lit_data(litDataList)
            res = self.persona_2_critique_with_lits({"rq": rq, "persona": persona, "lits": lit_string})
            crits = json_repair.loads(res['text'])
        else:
            res = self.persona_2_critique({"rq": rq, "persona": persona})
            crits = json_repair.loads(res['text'])
        return crits


class RQGenerator():
    def __init__(self) -> None:
        self.critique_2_rq_template = PromptTemplate(
            input_variables=["original_rq", "critiques"], template=SimpleCritique2RQTemplate
        )
        self.critique_2_rq = RQFlowLLMChain(llm=USER_INFO.get().llm_gpt4, prompt=self.critique_2_rq_template)
    
    def generate_rqs_from_critiques(self, original_rq, critiques) -> List[str]:
        res = self.critique_2_rq({"original_rq": original_rq, "critiques": critiques})
        rqs = json_repair.loads(res['text'])
        return rqs

    
    def generate_rq_from_persona(self, persona) -> str:
        raise NotImplementedError
    

class PersonaGenerator():
    def __init__(self) -> None:
        self.output_parser = JsonOutputParser()
        llm_gpt4 = USER_INFO.get().llm_gpt4
        self.rq_2_persona_template = PromptTemplate(
            input_variables=["rq", "history_personas"], template=SimpleRQ2PersonasTemplate
        )
        self.rq_2_persona = RQFlowLLMChain(llm=llm_gpt4, prompt=self.rq_2_persona_template)

        self.lit_2_persona_template = PromptTemplate(
            input_variables=["summary"], template=SimpleLitSummary2PersonasTemplate
        )
        self.lit_2_persona = RQFlowLLMChain(llm=llm_gpt4, prompt=self.lit_2_persona_template)

        # self.lit_summarizer = get_refine_summarizer_chain(llm_gpt35)
        self.lit_summarizer = get_summarizer_chain(llm_gpt4)

        self.persona_2_lit_query_template = PromptTemplate(
            input_variables=["rq", "persona", "lits"], template=Persona2LitsQueryAndSubQuery
        )
        self.persona_2_lit_query = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_2_lit_query_template)

        self.persona_2_lit_query_template_newsletter=PromptTemplate(
            input_variables=["rq", "persona", "lits"], template=Persona2LitsQueryAndSubQueryNewsletter
        )
        self.persona_2_lit_query_newsletter = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_2_lit_query_template_newsletter)

        # This is not used anymore keeping it in case we need to have separate calls later
        self.persona_lit_query_breakdown_template = PromptTemplate(
            input_variables=["rq", "persona", "search_query"], template=PersonaLitsQueryBreakdownTemplate
        )
        # This is not used anymore keeping it in case we need to have separate calls later
        self.persona_lit_query_breakdown = RQFlowLLMChain(llm=llm_gpt4, prompt=self.persona_lit_query_breakdown_template)

        self.lit_2_persona_template_auth = PromptTemplate(
            input_variables=["summary"], template=SimpleLitSummary2PersonasTemplate_2
        )

        self.lit_2_persona_template_name = PromptTemplate(
            input_variables=["results"], template=PersonaNameGeneration
        )

        self.paper2relevance_template = PromptTemplate(
            input_variables=["persona_name", "rq", "top_universities", "venue_names", "paper_information"], template=PaperRelevancyTemplateAbstract
        )

        self.lit_2_persona_auth = RQFlowLLMChain(llm=llm_gpt4, prompt=self.lit_2_persona_template_auth)

        self.lit_2_persona_name = RQFlowLLMChain(llm=llm_gpt4, prompt=self.lit_2_persona_template_name)

        self.paper2relevance = LLMChain(llm=llm_gpt4, prompt=self.paper2relevance_template)

        self.flag=2

    def relevance_score_paper(self, persona_name, rq, top_universities, venue_names, paper_information):
        res = self.paper2relevance({"persona_name": persona_name, "rq": rq,"top_universities":top_universities, "venue_names": venue_names, "paper_information": paper_information})
        final_scores = json_repair.loads(res['text'])
        return final_scores

    async def generate(self, result):
        try:
            res = await self.lit_2_persona_auth({"summary":result})
            return res
        except Exception as e:
            print("Error during LLMChain execution:", e)
            return None
        
    def generate_names(self, result):
        try:
            res = self.lit_2_persona_name({"results":result})
            return res
        except Exception as e:
            print("Error during LLMChain execution:", e)
            return None
    
    def generate_old(self, result):
        try:
            res = self.lit_2_persona({"summary":result})
            return res
        except Exception as e:
            print("Error during LLMChain execution:", e)
            return None
    
    def generate_personas_from_rq(self, rq: str, history_personas: str) -> List[Dict[str, str]]:
        res = self.rq_2_persona({"rq": rq, "history_personas": history_personas})
        personas = json_repair.loads(res['text'])

        for persona in personas:
            new_desc = {}
            for field_type in persona['persona_description']:
                for field_name in persona['persona_description'][field_type]:
                    if field_type not in new_desc:
                        new_desc[field_type] = []
                    new_desc[field_type].append({"key": field_name, "value": persona['persona_description'][field_type][field_name], "default": False})
            persona['persona_description'] = new_desc

        return personas
    
    def generate_persona_from_lits(self, litDataList: LiteratureNodeDataList) -> str:
        # format literature data
        split_docs = []
        # print("literature data list:",LiteratureNodeDataList)
        if self.flag==1:
            for lit in litDataList:
                doc = f"{lit.title}\n{', '.join(lit.authors)}\n{lit.abstract}"
                try:
                    input_data={"text":lit.abstract}
                    pred=invoke_sagemaker_endpoint(input_data)
                    if pred is not None and pred!="":
                        print('Using sentence cls')
                        split_docs.append(Document(page_content=pred))
                    else:
                        split_docs.append(Document(page_content=doc))
                except:
                    print('Unable to use sagemaker')
                    split_docs.append(Document(page_content=doc))
            result = self.lit_summarizer({"input_documents": split_docs}, return_only_outputs=True)
            print(result)
            res = self.lit_2_persona({"summary": result})
            personas = json_repair.loads(res['text'])
            for persona in personas:
                new_desc = {}
                for field_type in persona['persona_description']:
                    for field_name in persona['persona_description'][field_type]:
                        if field_type not in new_desc:
                            new_desc[field_type] = []
                        new_desc[field_type].append({"key": field_name, "value": persona['persona_description'][field_type][field_name], "default": False})
                persona['persona_description'] = new_desc
            print(personas)
            return personas
        
        elif self.flag==2:
            for lit in litDataList:
                doc = f"{lit.title}\n{', '.join(lit.authors)}\n{lit.abstract}"
                split_docs.append(Document(page_content=doc))
                result = self.lit_summarizer({"input_documents": split_docs}, return_only_outputs=True)
                print(result)
            res = self.lit_2_persona({"summary": result})
            personas = json_repair.loads(res['text'])
            for persona in personas:
                new_desc = {}
                for field_type in persona['persona_description']:
                    for field_name in persona['persona_description'][field_type]:
                        if field_type not in new_desc:
                            new_desc[field_type] = []
                        new_desc[field_type].append({"key": field_name, "value": persona['persona_description'][field_type][field_name], "default": False})
                persona['persona_description'] = new_desc
            print(personas)
            return personas
        
        else:
            topic=""
            input_lst=[]
            for lit in litDataList:
                topic=lit.topic
                a1,a2=asyncio.run(citation_cnt(lit.authors))
                print(a1,a2)
                input_lst.append(a1[1])
                input_lst.append(a2[1])
            tasks = [
                main_fun(input_lst,topic)
            ]
            results = run_asyncio_tasks(tasks)[0]
            print(results)

            #checking for errors when the author name is wrong
            for r in results:
                if r==-1:
                    print('Error in one author name')
                    self.flag=2
                    persona=self.generate_persona(litDataList)
                    return persona
            
            #to check case where we get lesser than 3 results but more than 0
            if len(results)>0 and len(results)<3:
                self.flag=2
                persona=self.generate_persona(litDataList)
                return persona
                
            #when we get more than equal to 3 results
            elif len(results)>=3:
                pq=PriorityQueue()
                # print("length of results:",len(results))
                for i in range(len(results)):
                    if len(results[i])==0:
                        continue
                    print(results[i][0])
                    pq.put((results[i][0][0],i))
                
                final_lst = {}
                f_process=[]
                for _ in range(3):
                    v = pq.get()
                    print(v)
                    key = v[1]
                    f_process.append(key)
                    if key not in final_lst:
                        final_lst[key] = []
                    for item in results[key]:
                        final_lst[key].append(item[1])
        
                doc_list = []
                for i in f_process:
                    ans=[]
                    docs = final_lst[i]
                    for d in docs:
                        ans.append(Document(page_content=d))
                    doc_list.append(ans)
                per_res_list = run_asyncio_tasks([generate_persona(doc_list)])
                ans=[]
                for lst in per_res_list:
                    ans.append(lst)
                print('ans:',ans)
                per=PersonaGenerator()
                result=per.generate_names(ans)
                
                personas=json_repair.loads(result['text'])
                for persona in personas:
                    new_desc = {}
                    for field_type in persona['persona_description']:
                        for field_name in persona['persona_description'][field_type]:
                            if field_type not in new_desc:
                                new_desc[field_type] = []
                            new_desc[field_type].append({"key": field_name, "value": persona['persona_description'][field_type][field_name], "default": False})
                    persona['persona_description'] = new_desc
                return personas

    def mocked_query_sub_query(self):
        """
        This function mocks the output of OpenAI call use this to save cost when possible in your testing
        """
        time.sleep(6)
        return '[\n    {\n        "search_query": "Fine-Tuning Language Models for Health Behavior Change",\n        "sub_queries": [\n            {"sub_query": "Fine-Tuning Language Models", "rationale": "What are the current methods and techniques for fine-tuning large language models?"},\n            {"sub_query": "Health Behavior Change", "rationale": "What are the key psychological principles behind promoting health behavior change?"},\n            {"sub_query": "Language Models for Health Interventions", "rationale": "How have language models been used in health interventions to date?"}\n        ]\n    },\n    {\n        "search_query": "Preventive Health Behavior and AI",\n        "sub_queries": [\n            {"sub_query": "Preventive Health Behavior", "rationale": "What are the commonly accepted preventive health behaviors?"},\n            {"sub_query": "AI in Health Behavior Promotion", "rationale": "How has AI been utilized to promote health behavior changes?"},\n            {"sub_query": "Behavior Change Techniques", "rationale": "What behavior change techniques are most effective in preventive health?"}\n        ]\n    },\n    {\n        "search_query": "Psychological Principles in Health AI",\n        "sub_queries": [\n            {"sub_query": "Psychological Principles in AI", "rationale": "What psychological principles are applied in AI systems to influence behavior?"},\n            {"sub_query": "AI for Health Promotion", "rationale": "How are AI technologies being leveraged to promote health and well-being?"},\n            {"sub_query": "Behavioral AI Models", "rationale": "What models exist for integrating behavioral science into AI?"}\n        ]\n    }\n]'

    
    def generate_lit_queries_from_rq_persona(self, rq, persona, litDataList: List[LiteratureNodeData]) -> List[Dict[str, str]]:
        lit_queries = [] # [{"search_query": "..."}, ...]
        lit_string = ""
        if len(litDataList) > 0:
            lit_string = format_lit_data(litDataList)
        res = self.persona_2_lit_query.invoke({"rq": rq, "persona": persona, "lits": lit_string})
        #res = self.mocked_query_sub_query()
        lit_queries = json_repair.loads(res['text'])
        return lit_queries
    
    def generate_lit_queries_from_persona_newsletter(self, rq, persona, litDataList: List[LiteratureNodeData]) -> List[Dict[str, str]]:
        lit_queries = [] # [{"search_query": "..."}, ...]
        lit_string = ""
        if len(litDataList) > 0:
            lit_string = format_lit_data(litDataList)
        res = self.persona_2_lit_query_newsletter.invoke({"rq": rq, "persona": persona, "lits": lit_string})
        #res = self.mocked_query_sub_query()
        lit_queries = json_repair.loads(res['text'])
        return lit_queries
    
    # This is not used anymore keeping it in case we need to have separate calls later
    def generate_lit_query_breakdown(self, rq, persona, search_query: str, max_sub_queries: int=3) -> List[Dict[str, str]]:
        res = self.persona_lit_query_breakdown({"rq": rq, "persona": persona, "search_query": search_query})
        breakdown = json_repair.loads(res['text']) # [{"search_query": "...", "rationale": "..."}, ...]
        return breakdown[:max_sub_queries]
    

    
    def rerank_papers(self, query: str, papers: List, sub_queries: List[Dict[str, str]], rq_text: str, persona_text: str, topk: int=10) -> List[Dict[str, Any]]:
        try:
            reranker = create_reranker()
            reranker.connect()
        except Exception as e:
            logger.error(f"Failed to connect to reranker: {e}")
            reranker = None
        if reranker is None:
            return papers[:topk] # return top-k papers if reranker is not available
        
        try:
            papers = reranker.rerank_papers(query, papers, sub_queries, rq_text, persona_text, topk) 
        except Exception as e:
            logger.error(f"Failed to rerank papers: {e}")
            papers = papers[:topk] # return top-k papers if reranking fails
        
        return papers
    
    


if __name__ == "__main__":
    cg = CritiqueGenerator()
    rq = "How to make a good research question?"
    persona = "You are a research assistant agent that assists user by providing critiques on their research idea and questions."
    res = cg.generate_critiques_from_rq_persona(rq, persona)
    print(res)
