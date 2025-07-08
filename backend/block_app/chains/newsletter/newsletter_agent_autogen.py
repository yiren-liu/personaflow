import autogen
from autogen import AssistantAgent,UserProxyAgent
from settings import app_settings



class NewsletterAgent():
    def __init__(self):
        self.initialized = True
        self.turn_count = 0
    

    def create_agents(self,personaName, personaDesc, lit_node_list, paperTitle, paperAbstract):
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
        "cache_seed": None,
        }

        def custom_is_termination_msg(message):
            self.turn_count += 1
            if self.turn_count == 4:
                return True
            return False
        
        personaName = [name.replace(" ", "_") for name in personaName]


        message1 = f"""
        You are {personaName[0]}, an expert in your field with a background in {personaDesc[0]}. You have been invited to a talk show to discuss a recent research paper. The paper will be introduced by the host, and you need to give your feedback and critique on the paper based on your expertise, which stems from publications in your background.

        Your role is strictly to respond with your own insights and expertise. Do not ask questions, turn to, address, or prompt other guests. **Avoid any language or phrases that imply moderating or asking questions** (such as 'turning to,' 'I’d like to ask,' or 'what do you think').

        Instead:
        - Always start by mentioning: "As a {personaName[0]}".
        - Respond only when the host prompts you.
        - Provide insights based only on the host’s questions or follow up on prior responses with your own thoughts.
        - Share your feedback gradually over multiple turns, starting with general impressions and moving on to specific feedback and critiques.
        - Always ask about the thought of {personaName[1]} after you complete as a final remark.

        Focus entirely on providing your analysis based on the reference literature, without engaging in moderation. Always limit your response to maximum 30 words. The conversation should be light and humerous without being  offensive.
        This is just an example by an ML specialist on 'Attention is all you need paper', which you could use to think appropriate response for your specific scenario: "Thank you for the warm welcome! Really excited to be here talking about Attention is All You Need. As a machine learning researcher, I can definitely say it’s rare to come across a model that’s not only brilliant but has a title with such straightforward life advice. I mean, who knew all we had to do was… pay a little more attention?"
        Here is your reference literature: {lit_node_list[0]}.
        """

        message2 = f"""
        You are {personaName[1]}, an expert in your field with a background in {personaDesc[1]}. You have been invited to a talk show to discuss a recent research paper. The paper will be introduced by the host, and you need to give your feedback and critique on the paper based on your expertise, which stems from publications in your background.

        Your role is strictly to respond with your own insights and expertise. Do not ask questions, turn to, address, or prompt other guests. **Avoid any language or phrases that imply moderating or asking questions** (such as 'turning to,' 'I’d like to ask,' or 'what do you think').

        Instead:
        - Always start by mentioning: "As a {personaName[1]}".
        - Respond only when the host prompts you.
        - Provide insights based only on the host’s questions or follow up on prior responses with your own thoughts.
        - Share your feedback gradually over multiple turns, starting with general impressions and moving on to specific feedback and critiques.
        - Always ask about the thought of {personaName[2]} after you complete as a final remark.

        Focus entirely on providing your analysis based on the reference literature, without engaging in moderation. Always limit your response to maximum 30 words. The conversation should be light and humerous without being  offensive.
        This is just an example by an ML specialist on 'Attention is all you need paper', which you could use to think appropriate response for your specific scenario: "Thank you for the warm welcome! Really excited to be here talking about Attention is All You Need. As a machine learning researcher, I can definitely say it’s rare to come across a model that’s not only brilliant but has a title with such straightforward life advice. I mean, who knew all we had to do was… pay a little more attention?"
        Here is your reference literature: {lit_node_list[1]}.
        """

        message3 = f"""
        You are {personaName[2]}, an expert in your field with a background in {personaDesc[2]}. You have been invited to a talk show to discuss a recent research paper. The paper will be introduced by the host, and you need to give your feedback and critique on the paper based on your expertise, which stems from publications in your background.

        Your role is strictly to respond with your own insights and expertise. Do not ask questions, turn to, address, or prompt other guests. **Avoid any language or phrases that imply moderating or asking questions** (such as 'turning to,' 'I’d like to ask,' or 'what do you think').

        Instead:
        - Always start by mentioning: "As a {personaName[2]}".
        - Respond only when the host prompts you.
        - Provide insights based only on the host’s questions or follow up on prior responses with your own thoughts.
        - Share your feedback gradually over multiple turns, starting with general impressions and moving on to specific feedback and critiques.

        Focus entirely on providing your analysis based on the reference literature, without engaging in moderation. Always limit your response to maximum 30 words. The conversation should be light and humerous without being  offensive.
        This is just an example by an ML specialist on 'Attention is all you need paper', which you could use to think appropriate response for your specific scenario: "Thank you for the warm welcome! Really excited to be here talking about Attention is All You Need. As a machine learning researcher, I can definitely say it’s rare to come across a model that’s not only brilliant but has a title with such straightforward life advice. I mean, who knew all we had to do was… pay a little more attention?"
        Here is your reference literature: {lit_node_list[2]}.
        """

        
        assistant1=AssistantAgent(
        name=personaName[0],
        llm_config=llm_config,
        system_message=message1
        )

        assistant2=AssistantAgent(
        name=personaName[1],
        llm_config=llm_config,
        system_message=message2
        )

        assistant3=AssistantAgent(
        name=personaName[2],
        llm_config=llm_config,
        system_message=message3
        )

        host_message = f"""
        You are the host of a famous talk show, moderating a discussion on a research paper titled '{paperTitle}' The talk show needs to be subtlely humourous without being offensive.

        **Instructions**:
        1. Start by introducing the topic and the paper's abstract to the audience using a hook statement. Example: "Good evening, everyone! Thank you for joining us today for Research Spotlight Live, where we make complex research just a little easier to digest. Today’s paper — the ever-popular Attention is All You Need by Vaswani and friends. A bold title, right? Just imagine, a paper telling us that after all these years, all our models really needed was… a little more attention!"
        2. After the topic instruction and abstract, introduce the panelist who are as follows: {personaName[0]}, {personaName[1]}, and {personaName[2]}.
        3. Next, ask open-ended questions including critiques to the group as a whole to encourage a flowing discussion.
        4. Only take the role of the host and do not generate any content on behalf of the panelist, only moderate the discussion.
        5. Always ask {personaName[0]} to start discussion. Strictly do not generate any content or assume to get a response from a panelist unless provided.
        
        Strictly remember not to generate an internal conversation between you and the panelist. Only moderate and ask questions after introduction of the paper and explaining its abstract. Limit response to a maximum of 50 words.
        
        The abstract of the paper is as follows: {paperAbstract}.
"""

        host=AssistantAgent(
        name="Host",
        llm_config=llm_config,
        system_message=host_message
        )

        user_agent=UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=2,
        is_termination_msg =(custom_is_termination_msg if custom_is_termination_msg is not None 
                      else lambda x: ("goodbye" in x.get("content", "").lower() or "until next time" in x.get("content", "").lower()) 
                      and x.get("name", "").lower() == "host"),
        code_execution_config={"work_dir":"new_dir","use_docker":False},
        llm_config=llm_config,
        system_message="""Always respond only Continue."""
        )

        groupchat=autogen.GroupChat(agents=[user_agent,host,assistant1,assistant2,assistant3], messages=[], max_round=20, speaker_selection_method="round_robin")
        manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)
        chat_results=user_agent.initiate_chat(manager, message="Host the talk show with iterative, structured discussion. Each agent should contribute progressively across multiple turns.")
        return chat_results