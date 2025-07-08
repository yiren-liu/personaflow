from langchain.chains import LLMChain
from block_app.chains.error_handler import LLMChainCustomCallback


class RQFlowLLMChain(LLMChain):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs, callbacks=[LLMChainCustomCallback()])
