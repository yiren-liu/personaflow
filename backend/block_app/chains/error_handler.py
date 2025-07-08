from langchain.callbacks.base import BaseCallbackHandler
from block_app.chains.custom_openai_exception import CustomOpenAIException
from request_constants import USER_INFO
from openai import OpenAIError

class LLMChainCustomCallback(BaseCallbackHandler):
    def on_chain_error(self, response, **kwargs):
        if USER_INFO.get().use_custom_key:
            self.raise_error = True
            raise CustomOpenAIException(type(response), self._map_message(response))
    
    def _format_message(self, response):
        return str(response) if response.body is None else response.body['message']

    def _map_message(self, response):
        if(isinstance(response, OpenAIError)):
            message = self._format_message(response)
            message = "The OpenAI Request threw the following error: " + message
        else:
            message = "The OpenAI Request threw an error please check your OpenAI Key and the Base URL."
        return message
    
