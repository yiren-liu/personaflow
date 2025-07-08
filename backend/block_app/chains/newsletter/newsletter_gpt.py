
from langchain_openai import ChatOpenAI
from settings import app_settings
from block_app.prompts.node_prompts import generateBaseStoryTemplate, generateDramaticStoryTemplate, generatePodcastTemplate, generatePodcastTransitionTemplate, generateStoryTransitionTemplate, generateStoryOrgPrompt
from langchain.prompts import PromptTemplate
import json_repair
from langchain.chains import LLMChain

class Newsletter():
    def __init__(self):
        self.llm_gpt4 = ChatOpenAI(
            openai_api_key=app_settings.openai_api_key,
            model_name="gpt-4o",
            base_url= app_settings.openai_api_base,
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
        self.persona_to_podcast_template = PromptTemplate(
            input_variables=["research_paper"], template=generatePodcastTemplate
        )
        self.persona_to_base_story_template = PromptTemplate(
            input_variables=["research_paper"], template=generateBaseStoryTemplate
        )

        self.persona_to_original_story_template = PromptTemplate(
            input_variables=["research_paper", "existing_start"], template=generateStoryOrgPrompt
        )

        self.persona_to_dramatic_story_template = PromptTemplate(
            input_variables=["story", "existing_start"], template=generateDramaticStoryTemplate
        )

        self.podcast_transition_template = PromptTemplate(
            input_variables=["title_1", "title_2"], template=generatePodcastTransitionTemplate
        )

        self.story_transition_template = PromptTemplate(
            input_variables=["title_1", "title_2"], template=generateStoryTransitionTemplate
        )

        self.persona_to_podcast = LLMChain(
            llm=self.llm_gpt4,prompt=self.persona_to_podcast_template
        )

        self.persona_to_base_story = LLMChain(
            llm=self.llm_gpt4,prompt=self.persona_to_base_story_template
        )

        self.persona_to_dramatic_story = LLMChain(
            llm=self.llm_gpt4,prompt=self.persona_to_dramatic_story_template
        )

        self.persona_to_story_original = LLMChain(
            llm=self.llm_gpt4,prompt=self.persona_to_original_story_template
        )

        self.podcast_transition = LLMChain(
            llm=self.llm_gpt4,prompt=self.podcast_transition_template
        )

        self.story_transition = LLMChain(
            llm=self.llm_gpt4,prompt=self.story_transition_template
        )

        self.num_tries = 0

    def is_valid_transcript(self, transcript, num_speakers_expected):
        if "transcript" not in transcript:
            return False
        num_speakers_transcript = len(list(set([utterance['speaker'] for utterance in transcript['transcript']])))
        if (num_speakers_transcript != num_speakers_expected):
            return False
        return True
    
    def generate_podcast(self, research_paper):
        if self.num_tries > 2:
            raise Exception("Error: Failed to generate podcast")
        res = self.persona_to_podcast({"research_paper": research_paper})
        rqs = json_repair.loads(res['text'])
        if not self.is_valid_transcript(rqs,2):
            self.num_tries += 1
            return self.generate_podcast(research_paper)
        self.num_tries = 0
        return rqs
    
    def build_existing_starts(self, existing_starts):
        if len(existing_starts) == 0:
            return ""
        return f"4. Avoid existing starts: This story is part of a multi-story video, the existing stories in this video already starts with: {', '.join(existing_starts)}. Avoid starting with these and use different types of story telling techniques to generate this story."

    # def generate_story(self, research_paper, existing_starts):
    #     if self.num_tries > 2:
    #         raise Exception("Error: Failed to generate podcast")
    #     res = self.persona_to_base_story({"research_paper": research_paper})
    #     res = json_repair.loads(res['text'])
    #     if not self.is_valid_transcript(res,1):
    #         self.num_tries += 1
    #         return self.generate_story(research_paper, existing_starts)
    #     res_dramatic = self.persona_to_dramatic_story({"story": res['transcript'][0]['text'], "existing_start": self.build_existing_starts(existing_starts)})
    #     res_dramatic = json_repair.loads(res_dramatic['text'])
    #     if not self.is_valid_transcript(res_dramatic,1):
    #         self.num_tries += 1
    #         return self.generate_story(research_paper, existing_starts)

    #     self.num_tries = 0
    #     return res_dramatic

    def generate_story(self, research_paper, existing_starts):
        if self.num_tries > 2:
            raise Exception("Error: Failed to generate podcast")
        res = self.persona_to_story_original({"research_paper": research_paper, "existing_start": self.build_existing_starts(existing_starts)})
        res = json_repair.loads(res['text'])
        if not self.is_valid_transcript(res,1):
            self.num_tries += 1
            return self.generate_story(research_paper, existing_starts)
        self.num_tries = 0
        return res
    
    def generate_podcast_transition(self, title_1, title_2):
        res = self.podcast_transition({"title_1": title_1, "title_2": title_2})
        rqs = json_repair.loads(res['text'])
        return rqs
    
    def generate_story_transition(self, title_1, title_2, title_3):
        res = self.story_transition({"title_1": title_1, "title_2": title_2, "title_3": title_3})
        rqs = json_repair.loads(res['text'])
        return rqs
    
    def generate_story_start(self, title):
        res = self.story_start({"title": title})
        rqs = json_repair.loads(res['text'])
        return rqs
