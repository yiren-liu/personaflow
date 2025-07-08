import autogen
from autogen import AssistantAgent,UserProxyAgent
import os
import dotenv
from block_app.prompts.node_prompts import persona_temp,task_rq_temp
import asyncio
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore import InMemoryDocstore
from langchain.docstore.document import Document
import faiss
import asyncio
import logging
from settings import app_settings

class AgentTeam():
    def __init__(self):
        self.initialized = True
        self.agent_team={}
        self.embeddings = OpenAIEmbeddings(api_key=app_settings.openai_api_key,openai_api_base=app_settings.openai_api_base)
        self.id={}
        self.run_cnt=0
        example_embedding = self.embeddings.embed_query("example text")
        embedding_dim = len(example_embedding) 
        index = faiss.IndexFlatL2(embedding_dim)  
        docstore = InMemoryDocstore()
        index_to_docstore_id = {}

        self.vector_store = FAISS(
            embedding_function=self.embeddings,
            index=index,
            docstore=docstore,
            index_to_docstore_id=index_to_docstore_id
        )
        self.cnt=0

    def add_agent(self,pname,pdesc):
        self.agent_team[pname]=pdesc
        text=pname+"\n"+pdesc
        vectors = self.embeddings.embed_query(text)
        self.vector_store.add_texts(texts=[text], embeddings=vectors, metadatas=[{"name": pname}])
        self.cnt+=1
        print("Team:",self.agent_team)
        print("Count:",self.cnt)

    
    def create_agent(self,rq_node):
        config_list=[
            {
            'model':'gpt-4o',
            'api_key':app_settings.openai_api_key,
            'base_url':app_settings.openai_api_base
            }
        ]

        llm_config={
        "seed":42,
        "config_list":config_list,
        "temperature":0.5,
        }
        k_val=self.cnt
        if k_val<=0:
            k_val=len(self.agent_team.keys())

        if k_val>=3:
            res=self.vector_store.similarity_search_with_score(rq_node,k=k_val)
            print("Similarity search is done")
            k=3
            pnames=[]
            pdescs=[]
            ass_message=[]

            print(res)
            print("k:",k)
            for i in range(self.cnt-1,self.cnt-1-k,-1):
                print(res[i][0])
                doc=res[i][0]
                metadata=doc.metadata
                name=metadata.get('name')
                pnames.append(name)
            
            print(pnames)
            for pn in pnames:
                val=persona_temp(pn,self.agent_team[pn])
                ass_message.append(val)

            chat_results=asyncio.run(self.run_agent(pnames,ass_message,rq_node,llm_config))
            return chat_results
        else:
            logging.info(f'K value smaller than 3')
            return {}

    async def run_agent(self,pnames,ass_message,rq_node,llm_config):
        assistant1=AssistantAgent(
        name=pnames[0],
        llm_config=llm_config,
        system_message=ass_message[0]
        )

        assistant2=AssistantAgent(
        name=pnames[1],
        llm_config=llm_config,
        system_message=ass_message[1]
        )

        assistant3=AssistantAgent(
        name=pnames[2],
        llm_config=llm_config,
        system_message=ass_message[2]
        )

        user_proxy=UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
        is_termination_msg=lambda x:x.get("content","").rstrip().endswith("TERMINATE"),
        code_execution_config={"work_dir":"new_dir","use_docker":False},
        llm_config=llm_config,
        system_message="""Reply TERMINATE if the task has been solved at full satisfaction. Otherwise, reply Continue, or the reason why the task is not solved yet."""
        )

        task=task_rq_temp(rq_node)
        print(task)
        self.id[0+self.run_cnt]=pnames[0]
        self.id[1+self.run_cnt]=pnames[1]
        self.id[2+self.run_cnt]=pnames[2]

        chat_results = await user_proxy.a_initiate_chats(  # noqa: F704
            [
                {
                    "chat_id": 0+self.run_cnt,
                    "recipient": assistant1,
                    "message": task,
                    "silent": False,
                    "summary_method": "reflection_with_llm",
                    "summary_args":{"summary_prompt":"Your task is to extract the key points from this conversation and present them in your own words in first person, focusing on why the given agent is better suited for the task. Ensure the summary is within 50 words, professional, and without any introductory sentences or additional context"},
                    "name":pnames[0],
                },
                {
                    "chat_id": 1+self.run_cnt,
                    "recipient": assistant2,
                    "message": task,
                    "silent": False,
                    "summary_method": "reflection_with_llm",
                    "summary_args":{"summary_prompt":"Your task is to extract the key points from this conversation and present them in your own words in first person, focusing on why the given agent is better suited for the task. Ensure the summary is within 50 words, professional, and without any introductory sentences or additional context"},
                    "name":pnames[1],
                },
                {
                    "chat_id": 2+self.run_cnt,
                    "recipient": assistant3,
                    "message": task,
                    "silent": False,
                    "summary_method": "reflection_with_llm",
                    "summary_args":{"summary_prompt":"Your task is to extract the key points from this conversation and present them in your own words in first person, focusing on why the given agent is better suited for the task. Ensure the summary is within 50 words, professional, and without any introductory sentences or additional context"},
                    "name":pnames[2],
                },
            ]
        )
        self.run_cnt+=3
        return chat_results


# if __name__=="__main__":
#     ag=AgentTeam()
#     ag.add_agent("HCI_Psychologist","A cognitive psychologist with expertise in human-computer interaction, specifically how users interact with generative AI and the psychological effects of these interactions.")
#     ag.add_agent("Tech_Industry_Analyst","A technology industry analyst who tracks the advancements in generative AI technologies, and their impact on businesses and consumer markets.")
#     ag.add_agent("AI_Ethics_Expert","A computer scientist specializing in artificial intelligence and machine learning, with a focus on the development and ethical implications of large language models.")
#     ag.add_agent("Framework Innovator","An innovative AI developer with expertise in creating novel frameworks and metrics for bias evaluation in LLMs. This persona has a keen interest in enhancing traditional bias mitigation approaches with cutting-edge techniques, such as counterfactual inputs and unique metrics like the Bias Intelligence Quotient.")
#     chat_results=ag.create_agent("What specific methods do LLMs utilize in identifying and mitigating bias in multilingual contexts that differ from those used by General AI?")
#     # cnt=ag.self.cnt
#     # print(chat_results)
#     for i, chat_res in chat_results.items():
#         print(f"*****{i}th chat*******:")
#         print(ag.id[i])
#         print(chat_res.summary)
    
#     ag.add_agent("Content Writer","An exemplary content writer with a flair for creating engaging and informative content across various domains. This persona is adept at conducting in-depth research and crafting compelling narratives that resonate with diverse audiences.")
#     chat_results=ag.create_agent("What specific methods do LLMs utilize in identifying and mitigating bias in multilingual contexts that differ from those used by General AI?")
#     # cnt=ag.self.cnt
#     # print(chat_results)
#     for i, chat_res in chat_results.items():
#         print(f"*****{i}th chat*******:")
#         print(ag.id[i])
#         print(chat_res.summary)
        
