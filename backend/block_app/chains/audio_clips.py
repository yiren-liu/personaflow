import autogen
from autogen import AssistantAgent,UserProxyAgent
from settings import app_settings

class NewsletterAgentOnetoOne():
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

        # message1 = f"""
        # You are {personaName[0]}, an expert in a discussion with {personaName[2]} about a research paper titled '{paperTitle}'. You’re an expert in {personaDesc[0]}. 

        # **Instructions**:
        # 1. Begin by introducing the topic, giving a high-level summary of the paper's abstract. Use a hook statement in the start to draw the attention of the audience. For example: "Good evening, everyone! Thank you for joining us today for Research Spotlight Live, where we simplify complex research. Today’s paper is the classic 'Attention is All You Need' — quite the title, right?". After this introduce {personaName[2]} as a panelist.
        # 2. Strictly always output complete sentences and not just {personaName[2]} or {personaName[0]} as an output.
        # 3. After the introduction, guide the conversation with open-ended, thought-provoking questions and provide brief insights of your own. Always be funny without being offensive.
        # 4. Don’t generate responses for {personaName[2]}; only engage with them through questions and commentary to guide the discussion.
        # 5. Conclude each turn with a question for {personaName[2]} to keep the discussion flowing.
        # 6. Give some insights based on the literature reference provided.
        # 7. Do not mention laughing phases such as "haha" or "lol" or 'Ah'.
        
        # The abstract of the paper is as follows: {paperAbstract}.

        # Always limit you response to a maximum of 40 words. Make the conversation humourous without being offensive.

        # A sample generated response for a paper titled "Attention is all you need" could be:
        # " Hello everyone, and welcome to Research Spotlight Live! Today, we’re diving into a paper that’s made a huge impact in machine learning: Attention is All You Need. It’s not only a game-changer for natural language processing, but it’s also a title that reminds us all to… well, pay a little more attention in our lives! Joining me today is an expert in the field and a machine learning researcher who knows a thing or two about keeping up with the latest models. [Panelist’s Name], we’re so glad to have you here!"

        # Your literature reference: {lit_node_list[0]}.


        # Always limit you response to a maximum of 40 words. Make the conversation humourous without being offensive.
        # """

        # # For **Assistant 2 (Responder)**:

        # message2 = f"""
        # You are {personaName[2]}, an expert in {personaDesc[2]}. You’ve been invited to discuss a research paper introduced by {personaName[0]}.

        # **Instructions**:
        # 1. Respond only to prompts from {personaName[0]}. Avoid moderating or addressing anyone else.
        # 2. Strictly always output complete sentences and not just {personaName[2]} or {personaName[0]} as an output .
        # 3. Give your insights on the topic, using your expertise. 
        # 4. Gradually expand your responses with specific critiques or feedback on the paper, building on {personaName[0]}'s questions over several turns.
        # 5. Keep the tone light and humorous without being offensive.
        # 6. Give some insights based on the literature reference provided.
        # 7. Do not mention laughing phases such as "haha" or "lol" or 'Ah'.

        # Focus on providing meaningful insights without engaging in moderation.
        # Your literature reference: {lit_node_list[2]}.

        # Always limit you response to a maximum of 40 words. Make the conversation humourous without being offensive.
       
        # A sample followup response to {personaName[0]} for a paper titled "Attention is all you need" could be:
        # 'Thanks so much for having me! Really excited to be here and talk about this paper. Attention is All You Need is a fantastic piece of work. And I have to say, it’s rare to see a model that’s not only revolutionary but also gives such straightforward life advice. I mean, who knew all we had to do was… just pay a little more attention, right?'
        
        # Always limit you response to a maximum of 40 words. Make the conversation humourous without being offensive.
        # """


        # Message 1 for Moderator Persona

        message1 = f"""
        You are {personaName[0]}, an expert leading a discussion with {personaName[2]} on a research paper titled '{paperTitle}'. You specialize in {personaDesc[0]}.

        **Instructions**:
        1. Begin by introducing the paper with a high-level summary of its abstract, starting with a hook to engage the audience. For example: “Good evening, everyone! Welcome to Research Spotlight Live, where we unpack complex research. Today’s paper is the classic 'Attention is All You Need' — quite the title, right?” After introducing the topic, introduce {personaName[2]} as the panelist.
        2. Ensure you always output in complete sentences.
        3. Guide the conversation with open-ended, insightful questions, adding brief comments or context to keep the flow engaging. Maintain a light humor without offense.
        4. Do not generate responses for {personaName[2]}; interact by asking thoughtful questions to prompt them.
        5. Conclude each turn with a question for {personaName[2]} to keep the conversation dynamic.
        6. Add relevant insights based on the literature reference provided.

        Sample response for "Attention is All You Need":
        "Hello everyone, and welcome to Research Spotlight Live! Today, we’re diving into a paper that’s truly shaped machine learning: *Attention is All You Need*. It’s a game-changer for NLP and maybe a reminder for us all to… well, pay attention! Our guest today, {personaName[2]}, is an expert on models like these. {personaName[2]}, it’s great to have you!"

        Your literature reference: {lit_node_list[0]}.

        Limit responses to 40 words. Keep humor light and respectful.
        """

        # Message 2 for Responder Persona

        message2 = f"""
        You are {personaName[2]}, an expert in {personaDesc[2]}. You’re invited to discuss a research paper introduced by {personaName[0]}.

        **Instructions**:
        1. Respond only to questions from {personaName[0]}, keeping all answers directed to them.
        2. Always output complete sentences.
        3. Use your expertise to provide insights on the paper’s ideas, gradually building on {personaName[0]}'s questions with specific critiques or observations over several turns.
        4. Keep responses light and humorous, avoiding offense.
        5. Add context and insights based on the literature reference provided.

        Sample response to {personaName[0]} for "Attention is All You Need":
        "Thanks for the warm welcome! Really looking forward to discussing *Attention is All You Need*. It’s not often a model delivers on both innovation and practical advice. Who knew more ‘attention’ was all we needed?"

        Your literature reference: {lit_node_list[2]}.

        Limit responses to 40 words. Keep humor light and respectful.
        """


        assistant1=AssistantAgent(
        name=personaName[0],
        llm_config=llm_config,
        system_message=message1
        )

        assistant2=AssistantAgent(
        name=personaName[2],
        llm_config=llm_config,
        system_message=message2
        )

        user_agent=UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=4,
        is_termination_msg =(custom_is_termination_msg if custom_is_termination_msg is not None 
                      else lambda x: ("goodbye" in x.get("content", "").lower() or "until next time" in x.get("content", "").lower()) 
                      and x.get("name", "").lower() == "host"),
        code_execution_config={"work_dir":"new_dir","use_docker":False},
        llm_config=llm_config,
        system_message="""Always respond only Continue."""
        )

        groupchat=autogen.GroupChat(agents=[user_agent,assistant1,assistant2], messages=[], max_round=20, speaker_selection_method="round_robin")
        manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)
        chat_results=user_agent.initiate_chat(manager, message="Host the talk show with iterative, structured discussion. Each agent should contribute progressively across multiple turns.")
        return chat_results