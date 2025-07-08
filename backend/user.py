import openai
from langchain_openai import ChatOpenAI
import dotenv

from settings import app_settings

class User():
    def __init__(self):
        self.api_key = None
        self.llm_gpt4 = None
        self.llm_gpt35 = None
        self.use_custom_key = False
        self.openai_base_url = None
    
    def _set_openai_api_base(self, use_custom_key, openai_api_base):
        if use_custom_key:
            if len(openai_api_base.strip()) == 0:
                self.openai_api_base = 'https://api.openai.com/v1'
            else:
                self.openai_api_base = openai_api_base
        else:
            self.openai_api_base = app_settings.openai_api_base
        return self.openai_api_base

    def initialize_LLM(self, openai_api_key, openai_api_base):
        self.use_custom_key = len(openai_api_key.strip()) > 0
        self.openai_api_key = openai_api_key if self.use_custom_key else app_settings.openai_api_key
        self.openai_api_base = self._set_openai_api_base(self.use_custom_key, openai_api_base)
        openai.api_type = "openai"
        openai.api_version = None
        self.llm_gpt4 = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-4o",
            base_url= self.openai_api_base,
            # model_name="gpt-3.5-turbo",
            temperature=.7,
            max_tokens=1000,
            model_kwargs = {
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "stop": None,
                "top_p": 0.95
            }
        )
        self.llm_gpt35 = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-4o",
            base_url=self.openai_api_base,
            # model_name="gpt-3.5-turbo",
            temperature=.7,
            max_tokens=1000,
            model_kwargs = {
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "stop": None,
                "top_p": 0.95
            }
        )
