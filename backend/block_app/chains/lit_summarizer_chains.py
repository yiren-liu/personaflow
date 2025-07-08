from langchain_openai import ChatOpenAI

from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain

from block_app.chains.error_handler import LLMChainCustomCallback


def get_refine_summarizer_chain(llm: ChatOpenAI) -> LLMChain:
    prompt_template = """Write a concise summary of the following:
    {text}
    CONCISE SUMMARY:"""
    prompt = PromptTemplate.from_template(prompt_template)

    refine_template = (
        "Your job is to produce a final summary\n"
        "We have provided an existing summary up to a certain point: {existing_answer}\n"
        "We have the opportunity to refine the existing summary"
        "(only if needed) with some more context below.\n"
        "Remember, each time you are provided with one paper, but the summary should be about all the papers.\n"
        "------------\n"
        "{text}\n"
        "------------\n"
        "Given the new context, refine the original summary into a summary with insights from multiple perspectives.\n"
        "If the context isn't useful, return the original summary."
    )
    refine_prompt = PromptTemplate.from_template(refine_template)
    chain = load_summarize_chain(
        llm=llm,
        chain_type="refine",
        question_prompt=prompt,
        refine_prompt=refine_prompt,
        # return_intermediate_steps=True,
        input_key="input_documents",
        output_key="output_text",
        callbacks=[LLMChainCustomCallback()]
    )
    return chain
    

def get_summarizer_chain(llm: ChatOpenAI) -> LLMChain:
    # prompt_template = """Write a concise summary of the following:
    # {text}
    # CONCISE SUMMARY:"""
    # prompt = PromptTemplate.from_template(prompt_template)
    chain = load_summarize_chain(
        llm=llm,
        chain_type="stuff",
        # question_prompt=prompt,
        # return_intermediate_steps=True,
        input_key="input_documents",
        output_key="output_text",
        callbacks=[LLMChainCustomCallback()]
    )
    return chain