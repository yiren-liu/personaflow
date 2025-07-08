from typing import List, Any, Dict

import os
# add working directory to python path
import sys

sys.path.append(os.getcwd())

import logging

import json_repair


from langchain.prompts import PromptTemplate
from block_app.chains.llm_chain import RQFlowLLMChain


from block_app.prompts.node_prompts import suggestionTableTemplate, addFieldTemplate, generateHypotheticalAbstractTemplate, generateLiteratureReviewTemplate, generateResearchScenarioTemplate

from request_constants import USER_INFO


# setting up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# setting up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




class SuggestionTableGenerator():
    def __init__(self):
        llm_gpt4 = USER_INFO.get().llm_gpt4
        self.suggestionTemplate=PromptTemplate(
            input_variables=["persona","rq","critiqueNode","literature"], template=suggestionTableTemplate
        )

        self.fieldTemplate=PromptTemplate(
            input_variables=["title","persona","rq","critiqueNode","literature","tableData"], template=addFieldTemplate
        )

        self.hypotheticalAbstractTemplate=PromptTemplate(
            input_variables=["persona","rq","critiqueNode","literature","tableData"], template=generateHypotheticalAbstractTemplate
        )

        self.literatureReviewTemplate=PromptTemplate(
            input_variables=["abstracts", "rq"], template=generateLiteratureReviewTemplate
        )

        self.researchScenarioTemplate=PromptTemplate(
            input_variables=["persona","rq","critiqueNode","literature","tableData"], template=generateResearchScenarioTemplate
        )

        self.input_to_suggestion = RQFlowLLMChain(llm=llm_gpt4, prompt=self.suggestionTemplate)

        self.field_new = RQFlowLLMChain(llm=llm_gpt4, prompt=self.fieldTemplate)

        self.hypothetical_abstract_chain = RQFlowLLMChain(llm=llm_gpt4, prompt=self.hypotheticalAbstractTemplate)

        self.literature_review_chain = RQFlowLLMChain(llm=llm_gpt4, prompt=self.literatureReviewTemplate)

        self.research_scenario_chain = RQFlowLLMChain(llm=llm_gpt4, prompt=self.researchScenarioTemplate)


    
    def generate_suggestion_table(self, persona, rq, critiqueNode, literature, scenario, context):
        input_data = {
            "persona": persona,
            "rq": rq,
            "critiqueNode": critiqueNode,
            "literature": literature,
            "scenario": scenario,
            "context": context
        }
        # print("input data:",input_data)
        res=self.input_to_suggestion(input_data)
        # print("results:",res['text'])
        req=json_repair.loads(res['text'])
        return req
    
    def add_new_field(self, field, persona, rq, critiqueNode, literature, tableData, scenario, context):
        input_data = {
            "title":field,
            "persona": persona,
            "rq": rq,
            "critiqueNode": critiqueNode,
            "literature": literature,
            "tableData":tableData,
            "scenario": scenario,
            "context": context
        }
        # print("input data:",input_data)
        res=self.field_new(input_data)
        # print("results:",res['text'])
        req=json_repair.loads(res['text'])
        return req
    

    def generate_hypothetical_abstract(self, persona: str, rq: str, critiqueNode: str, literature: str, tableData: str, scenario: str, context: str):
        input_data = {
            "persona": persona,
            "rq": rq,
            "critiqueNode": critiqueNode,
            "literature": literature,
            "tableData":tableData,
            "scenario": scenario,
            "context": context
        }
        # print("input data:",input_data)
        res=self.hypothetical_abstract_chain(input_data)
        # print("results:",res['text'])
        req=json_repair.loads(res['text'])
        return req
    
    def generate_literature_review(self, abstracts: str, rq: str, context: str):
        input_data = {
            "abstracts": abstracts,
            "rq": rq,
            "context": context
        }
        # print("input data:",input_data)
        res=self.literature_review_chain(input_data)
        # print("results:",res['text'])
        req=json_repair.loads(res['text'])
        return req
    
    def generate_research_scenario(self, abstracts: str, rq: str, context: str):
        input_data = {
            "rq": rq,
            "abstracts": abstracts,
            "context": context
        }
        # print("input data:",input_data)
        res=self.research_scenario_chain(input_data) # {"research_scenarios": ["RESEARCH SCENARIO 1", "RESEARCH SCENARIO 2", ...]}
        # print("results:",res['text'])
        req=json_repair.loads(res['text'])
        return req


# if __name__=="__main__":
#     sg=SuggestionTableGenerator()
#     persona={"persona_description":"This researcher specializes in the development of advanced compression techniques, including near-lossless quantization, low-rank, and sparse matrix approximations. They are deeply invested in optimizing the performance of large language models (LLMs) in memory-constrained environments, focusing on throughput and memory reduction without compromising the integrity of the model's output."}
#     rq={"rq_text":"In what ways can integrating insights from GEAR into LLM inferencing improve computational and memory efficiency?"}
#     critiqueNode={"critique_detail":"The proposal could be strengthened by integrating insights from the provided literature on KV cache compression and efficient memory management. For example, adopting a multi-faceted approach that combines quantization, low-rank, and sparse matrix approximations, similar to GEAR, could offer a novel angle on optimizing LLM inferencing for memory efficiency."}
#     literature={"literature":"""On the Efficacy of Eviction Policy for Key-Value Constrained Generative Language Model Inference \n Large language models (LLMs) are notably cost-prohibitive to deploy in resource constrained environments due to their excessive memory and computational demands. In addition to model parameters, the key-value cache is also stored in GPU memory, growing linearly with batch size and sequence length. As a remedy, recent works have proposed various eviction policies for maintaining the overhead of key-value cache under a given budget. This paper embarks on the efficacy of existing eviction policies in terms of importance score calculation and eviction scope construction. We identify the deficiency of prior policies in these two aspects and introduce RoCo, a robust cache omission policy based on temporal attention scores and robustness measures. Extensive experimentation spanning prefilling and auto-regressive decoding stages validates the superiority of RoCo. Finally, we release EasyKV, a versatile software package dedicated to user-friendly key-value constrained generative inference \n\n\n Efficient Memory Management for Large Language Model Serving with PagedAttention
#                 High throughput serving of large language models (LLMs) requires batching sufficiently many requests at a time. However, existing systems struggle because the key-value cache (KV cache) memory for each request is huge and grows and shrinks dynamically. When managed inefficiently, this memory can be significantly wasted by fragmentation and redundant duplication, limiting the batch size. To address this problem, we propose PagedAttention, an attention algorithm inspired by the classical virtual memory and paging techniques in operating systems. On top of it, we build vLLM, an LLM serving system that achieves (1) near-zero waste in KV cache memory and (2) flexible sharing of KV cache within and across requests to further reduce memory usage. Our evaluations show that vLLM improves the throughput of popular LLMs by 2-4× with the same level of latency compared to the state-of-the-art systems, such as FasterTransformer and Orca. The improvement is more pronounced with longer sequences, larger models, and more complex decoding algorithms.
#                 """
# }
#     print(sg.generate_suggestion_table(persona,rq,critiqueNode,literature))