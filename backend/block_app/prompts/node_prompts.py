PaperRelevancyTemplateAbstract = """
You are an expert in determining the relevance of research papers to a given research question (RQ). Using your expertise as a {persona_name}, analyze the information provided for each research paper and assess its relevance to the research question (RQ) based on the following instructions:

<instruction>

1. University Affiliation: If the university associated with the research paper is included in the University List (U1), assign 3 to its "university_score" else 0. Do not search from exact match of the university name. The name might be speeled differently so  infer from the provided information.
2. Journal Venue: If the journal venue of the paper is included in the Venue List (V1), assign 3 to its "journal_score" else assign 0.
3. Abstract Analysis: Using the abstract (A1) and the research question (RQ), assign additional scores based on the following criteria. If the paper is a simple application or working system with no research significance, assign a flat score of 1 to all metrics:
   - Novelty: If the abstract (A1) is novel, assign a score between 1-5 based on novelty, and assign it to its "novelty_score".
   - Significance: If the abstract (A1) demonstrates the importance of the paper's contributions to the RQ, assign a score between 1-5 based on significance, and assign it to its "significance_score".
   - Relevance: If the abstract (A1) aligns with the research question (RQ), assign a score between 1-5 based on relevance, and assign it to its "relevance_score".

The provided research question (RQ) is:
{rq}

The University List (U1) is:
{top_universities}

The journal Venue List (V1) is:
{venue_names}

The following are the research paper IDs, Journal Venue and their corresponding abstracts:
{paper_information}

</instruction>

The response format must strictly be:
[{{"paper_id": "PAPER ID", "university_score": UNIVERSITY SCORE, "journal_score": JOURNAL SCORE, "novelty_score": NOVELTY SCORE, "significance_score": SIGNIFICANCE SCORE, "relevance_score": RELEVANCE SCORE}}, ...]

Only output the JSON response. Do not include any additional text or commentary.
"""

# PaperRelevancyTemplateAbstract = """
# You are an expert in determining the relevance of research papers to a given research question (RQ). Using your expertise as a {persona_name}, analyze the information provided for each research paper and assess its relevance to the research question (RQ) based on the following instructions:

# <instruction>

# 1. University Affiliation: If the university associated with the research paper is included in the University List (U1), add 3 to its relevance score. Do not search from exact match but infer from the provided information.
# 2. Journal Venue: If the journal venue of the paper is included in the Venue List (V1), add 3 to its relevance score.
# 3. Abstract Analysis: Using the abstract (A1) and the research question (RQ), assign additional scores based on the following criteria. If the paper is a simple application or working system with no research significance, assign a flat score of 1 to all metrics:
#    - Novelty: If the abstract (A1) is novel, assign a score between 1-5 based on novelty.
#    - Significance: If the abstract (A1) demonstrates the importance of the paper's contributions to the RQ, assign a score between 1-5 based on significance.
#    - Relevance: If the abstract (A1) aligns with the research question (RQ), assign a score between 1-5 based on relevance.

# The total relevance score is the sum of the scores from the above criteria.

# The provided research question (RQ) is:
# {rq}

# The University List (U1) is:
# {top_universities}

# The journal Venue List (V1) is:
# {venue_names}

# The following are the research paper IDs, Journal Venue and their corresponding abstracts:
# {paper_information}

# </instruction>

# The response format must strictly be:
# [{{"paper_id": "PAPER ID", "relevance_score": RELEVANCE SCORE}}, ...]

# Only output the JSON response. Do not include any additional text or commentary.
# """

PaperAbstract2Markdown="""
I have the following three papers and their abstracts:
<formatted_papers>
{formatted_paper1}

{formatted_paper2}

{formatted_paper3}
</formatted_papers>

-------

Can you help me generate a mind-map in the syntax of markmap.js, to capture the relations and major findings from the three provided papers, given their abstracts? 

The mind map will be presented in a newsletter, so make any task very short and concise. Do not output any code links or reference the code in the markdown.

<important_instructions>
1. organize the mind map by paper title, and use the exact title of the paper as the main node.
</important_instructions>

Return the final output as:
{{"makrdown_result": "YOUR_MARKDOWN_GENERATED"}}
"""

PaperAbstract2Markdown_2="""
I have the following three papers and their abstracts:
<formatted_papers>
{formatted_paper1}

{formatted_paper2}

{formatted_paper3}

{formatted_paper4}

</formatted_papers>

-------

Can you help me generate a mind-map in the syntax of markmap.js, to capture the relations and major findings from the three provided papers, given their abstracts? 

The mind map will be presented in a newsletter, so make any task very short and concise. Do not output any code links or reference the code in the markdown.

<important_instructions>
1. organize the mind map by paper title, and use the exact title of the paper as the main node.
</important_instructions>


Return the final output as:
{{"makrdown_result": "YOUR_MARKDOWN_GENERATED"}}

"""

top_universities = [
    "Massachusetts Institute of Technology (MIT)",
    "Carnegie Mellon University",
    "Stanford University",
    "University of Oxford",
    "University of California, Berkeley (UCB)",
    "National University of Singapore (NUS)",
    "Harvard University",
    "University of Cambridge",
    "ETH Zurich",
    "Nanyang Technological University, Singapore",
    "EPFL",
    "University of Toronto",
    "Princeton University",
    "Imperial College London",
    "Cornell University",
    "University of Washington",
    "University of California, Los Angeles",
    "The University of Edinburgh",
    "University of Waterloo",
    "University College London",
    "Columbia University",
    "New York University",
    "University of Illinois at Urbana-Champaign",
    "University of British Columbia",
    "Georgia Institute of Technology",
    "University of Texas at Austin",
    "Technical University of Munich",
    "The Hong Kong University of Science and Technology",
    "Yale University",
    "McGill University",
    "The Chinese University of Hong Kong",
    "Institut Polytechnique de Paris",
    "University of Amsterdam",
    "The University of Tokyo",
    "University of Pennsylvania",
    "California Institute of Technology",
    "University of Michigan-Ann Arbor",
    "The University of Sydney",
    "Delft University of Technology",
    "The University of Melbourne",
    "Université de Montréal",
    "Université Paris-Saclay",
    "Politecnico di Milano",
    "University of Maryland, College Park",
    "Korea Advanced Institute of Science & Technology",
    "University of California, San Diego",
    "Sorbonne University",
    "The University of Hong Kong",
    "KU Leuven",
    "The Australian National University",
    "University of Chicago",
    "University of Southern California",
    "Université PSL",
    "The University of New South Wales",
    "KTH Royal Institute of Technology",
    "King's College London",
    "Lomonosov Moscow State University",
    "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Bombay",
    "The University of Manchester",
    "King Abdulaziz University",
    "Johns Hopkins University",
    "Monash University",
    "Purdue University",
    "Sapienza University of Rome",
    "Seoul National University",
    "University of Technology Sydney",
    "Technische Universität Berlin",
    "Eindhoven University of Technology",
    "Universiti Malaya",
    "City University of Hong Kong",
    "ITMO University",
    "National Taiwan University",
    "The University of Warwick",
    "Universidade de São Paulo",
    "Technische Universität Wien",
    "Duke University",
    "Indian Institute of Technology Kanpur",
    "Tecnológico de Monterrey",
    "Alma Mater Studiorum - University of Bologna",
    "Indian Institute of Technology Madras",
    "The Hong Kong Polytechnic University",
    "Universitat Politècnica de Catalunya · BarcelonaTech",
    "Ludwig-Maximilians-Universität München",
    "Harbin Institute of Technology",
    "Indian Institute of Technology Kharagpur",
    "Politecnico di Torino",
    "Pennsylvania State University",
    "Indian Institute of Science",
    "Shanghai Jiao Tong University",
    "Peking University",
    "Tsinghua University",
    "Zhejiang University",
    "Fudan University",
    "University of Science and Technology of China",
    "Xi’an Jiaotong University",
    "Huazhong University of Science and Technology",
    "Nanjing University",
    "Beijing Institute of Technology",
    "University of Chinese Academy of Sciences",
    "University of Electronic Science & Technology of China",
    "University of Science & Technology of China",
    "Wuhan University",
    "Xidian University"

    #https://www.topuniversities.com/university-subject-rankings/computer-science-information-systems
    #https://www.topuniversities.com/university-rankings-articles/university-subject-rankings/top-universities-china-computer-science
]

venue_names = [
    "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
    "Neural Information Processing Systems",
    "Advanced Materials",
    "International Conference on Learning Representations",
    "IEEE/CVF International Conference on Computer Vision",
    "Journal of Cleaner Production",
    "International Conference on Machine Learning",
    "IEEE Access",
    "Advanced Functional Materials",
    "Advanced Energy Materials",
    "Chemical engineering journal",
    "ACS Nano",
    "AAAI Conference on Artificial Intelligence",
    "Meeting of the Association for Computational Linguistics (ACL)",
    "Energy & Environmental Science",
    "Applied Catalysis B: Environmental",
    "Renewable and Sustainable Energy Reviews",
    "European Conference on Computer Vision",
    "Journal of Hazardous Materials",
    "IEEE Transactions on Pattern Analysis and Machine Intelligence"
]

PaperRelevancyFiltersTemplate = """
You are a {persona_name}, an expert in determining the relevance of research papers to a given research question based on a given set of instructions. Using your expertise as a {persona_name}, you will evaluate each paper and assign a score based on a set of detailed instructions.

<instruction>
Evaluation and Scoring Criteria:

1. Relevance: How closely the paper aligns with the research question.
2. Novelty: The originality and uniqueness of the insights in the abstract.
3. Significance: The importance of the paper's contributions to the research question.

For each paper, provide a relevance score on a scale of 0 to 10, where:

1. 0 means not relevant at all.
2. 10 means highly relevant, novel, and significant.

The following is the research question:
{rq}

The following are the research paperId and their corresponding abstracts:
{paper_information}
</instruction>

The format of your response should be as follows:
[{{"paper_id": "PAPER ID", "relevance_score": "RELEVANCE SCORE"}}, ...]

Remember to strictly follow the format and only output the json itself. Do not generate any other content besides the json.
"""



UserIntstructions2RQTemplate = """You are a research assistant that assists users to create a comprehensive research question based on user provided instructions.
You will be provided with a set of user instructions which will include a research topic, and a set of user instructions that the user wants to research about within the topic. 

Your task is to use the research topic and user instructions to create a comprehensive research question that will help the user to find relevant information on the topic using scholarly search engines like Semantic Scholar or Google Scholar.
Make sure to use all the information provided in the user instructions to create a research question that is specific and relevant to the user's research needs.

The format of the research question should strictly follow the following format:
{{"research_ques": "YOUR_RESEARCH_QUERY"}}
Do not generate other content besides the json itself.

Now you are provided with the following research topic:
{topic}

And the user instructions are as follows:
{instructions}

Your research question:
"""

SimplePersona2CritiqueTemplate = """You are a research assistant agent that assists user by providing critiques on their research idea and questions.
You will be provided with a original research idea/question provided by user, and a persona based on which you would need to play the role as and provide critiques as if you are the persona.

You should provide critiques from multiple different aspects.
The format of the critiques should strictly follow the following format:
[{{"critique_aspect": "...", "critique_detail": "..."}}, ...]
Keep the number of critiques to be 3. Do not generate other content besides the json itself.

Now you are provided with the following research idea/question:
{rq}
And you are playing the role of the persona as:
{persona}

Your critiques:
"""
Persona2CritiqueWithLitsTemplate = """You are a research assistant agent that assists user by providing critiques on their research idea and questions.
You will be provided with a original research idea/question provided by user, and a persona based on which you would need to play the role as and provide critiques as if you are the persona.
You will also be provided with a list of literatures, based on which you would need to provide critiques as if you are the persona.

You should provide critiques from multiple different aspects.
The format of the critiques should strictly follow the following format:
[{{"critique_aspect": "...", "critique_detail": "..."}}, ...]
Keep the number of critiques to be 3. Do not generate other content besides the json itself.

Now you are provided with the following research idea/question:
{rq}
And you are playing the role of the persona as:
{persona}
And you are provided with the following literatures (if any):
{lits}

Your critiques:
"""

# This is not used anymore keeping it in case we need to have separate calls later
Persona2LitsQueryTemplate = """You are a research assistant agent that assists user by proposing literature search queries on their research idea and questions.
You will be provided with a original research idea/question provided by user, and a persona based on which you would need to play the role as and propose literature search queries as if you are the persona.
You may also be provided with a list of literatures, in which case you would need to propose literature search queries by considering the scope of the provided literatures.
Your role is to help users craft optimized search queries and terms for scholarly search engines like Semantic Scholar or Google Scholar, based on unstructured information they provide. 
You should guide users in refining their ideas or descriptions into precise, relevant search terms. 

You should provide search queries from multiple different aspects.
The format of the queries should strictly follow the following format:
[{{"search_query": "..."}}, ...]
Keep the number of queries to be 3. Do not generate other content besides the json itself.

Some examples of outputs could be: 
[{{"search_query": "AI for healthcare"}}, {{"search_query": "Machine learning for medical imaging"}}, {{"search_query": "Deep learning for cancer detection"}}]
Queries should be short and concise, if a query is too long, consider breaking it down into multiple queries.

Now you are provided with the following research idea/question:
{rq}
And you are playing the role of the persona as:
{persona}
And you are provided with the following literatures (if any):
{lits}

Your search queries:
"""

# This is not used anymore keeping it in case we need to have separate calls later
PersonaLitsQueryBreakdownTemplate = """You are a research assistant agent that assists user by breaking down their literature search queries into more specific terms and sub-queries.
You will play the following persona:
{persona}

You will be provided with a literature search query that represents user's interest and a persona based on which you would need to play the role as and break down the search query into more specific terms and phrases as if you are the persona.
You will also be provided with the user's initial research question/idea they would like to explore through the literature search query.
Your role is to help users craft optimized search queries and terms for scholarly search engines like Semantic Scholar, based on unstructured information they provide.
You should provide both the breakdown of the original query and a short rationale of what information you are looking for. The rationale will be later used to rerank the search results.

You should provide search queries from multiple different aspects to provide a comprehensive breakdown of the original query.
The format of the queries should strictly follow the following format:
[{{"search_query": "SEARCH_QUERY_1", "rationale": "RATIONALE_1"}}, {{"search_query": "SEARCH_QUERY_2", "rationale": "RATIONALE_2"}}, ...]
Do not generate other content besides the json itself.

Some examples of outputs could be: 
    User's original research question/idea:
        "How to address the lack of engagement of users using online the art platforms by simulating multi-persona?"
    Original query: 
        "Multi-Persona Simulation For Enhancing User Interaction"
    
    Breakdown queries:
        [{{"search_query": "Multi-Persona Simulation", "rationale": "What are the existing methods for simulating multiple personas?"}}, {{"search_query": "Simulated personas for user interaction", "rationale": "How are simulated personas used to enhance user interaction?"}}, ...]
Queries should be short and concise, if a query is too long, consider breaking it down into multiple queries or keywords.

Now you are provided with the following research idea/question:
{rq}

The user provided the following original search query:
{search_query}

Now generate a list of more specific search queries based on the provided search query.
"""

Persona2LitsQueryAndSubQueryNewsletter = """
You are a research assistant agent that helps users craft highly optimized and relevant literature search queries for their research idea or question, as well as break these queries into specific terms and phrases. 

Your goal is to propose search queries that are **very strongly related to the user's original research question (RQ)**, but framed from the perspective of the persona you are playing. These queries should reflect the persona's unique viewpoint, expertise, or focus while maintaining alignment with the original RQ.

<instructions>
You need to follow the following two steps:

### Step 1:
If provided with a list of related literatures, consider their scope to ensure your proposed queries are contextual and relevant. Your queries should guide users in refining their research question into **precise and targeted search queries** for scholarly search engines such as Semantic Scholar or Google Scholar. 

- Create search queries that are **strongly aligned with the original research question** but represent **multiple distinct perspectives or aspects** of the problem.
- Each query must reflect the specific knowledge or perspective of the given persona.
- Keep the number of search queries to 3.
- Queries should be concise, relevant, and highly specific to the research question.

**Examples of search queries:**
- "AI for healthcare"
- "Machine learning for medical imaging"
- "Deep learning for cancer detection"

### Step 2:
For each search query, break it down into **sub queries** to provide a comprehensive perspective on the query. Sub queries should:
- Be closely related to the original query and the research question.
- Cover multiple dimensions or angles of the topic.
- Be concise and, if necessary, broken into smaller specific queries or keywords.

**Example of Step 2:**
User's original research question/idea:
    "How to address the lack of engagement of users using online art platforms by simulating multi-persona?"

Original query:
    "Multi-Persona Simulation For Enhancing User Interaction"

Breakdown queries:
    1. Sub Query: Multi-Persona Simulation
    2. Sub Query: Simulated personas for user interaction
    3. Sub Query: Persona-based modeling in online platforms

Sub queries should not be overly lengthy. If a sub query feels too broad, break it down into smaller components or keywords.

### Output Format:
Your output must strictly follow this JSON format:
[{{"search_query": "QUERY_1", "sub_queries": [{{"sub_query": "QUERY_1_SUB_QUERY_1"}}, {{"sub_query": "QUERY_1_SUB_QUERY_2"}}, ...]}}, {{"search_query": "QUERY_2", "sub_queries": [{{"sub_query": "QUERY_2_SUB_QUERY_1"}}, {{"sub_query": "QUERY_2_SUB_QUERY_2"}}, ...]}}, ...]

- Generate **exactly 3 search queries**.
- For each search query, provide exactly **3 sub queries**.
- Avoid generating any additional content outside the JSON response.

</instructions>

<context>
Now you are provided with the following research idea/question:
{rq}
And you are playing the role of the persona as:
{persona}
And you are provided with the following literatures (if any):
{lits}
</context>

Now generate your search queries and their breakdown:
"""

Persona2LitsQueryAndSubQuery = """You are a research assistant agent that assists user by proposing literature search queries on their research idea and questions as well as help them break down the search queries into more specific terms and phrases.
You will be provided with a original research idea/question provided by user, and a persona based on which you would need to play the role as and propose literature search queries as well as break down the search queries into more specific terms and phrases as if you are the persona.
Your role is to help users craft optimized search queries and terms for scholarly search engines like Semantic Scholar or Google Scholar, based on unstructured information they provide. 

<instructions>
You need to follow the following two steps:

Step 1:
You may also be provided with a list of literatures, in which case you would need to propose literature search queries by considering the scope of the provided literatures.
You should guide users in refining their ideas or descriptions into precise, relevant search querie. 

You should create search queries from multiple different aspects.
Keep the number of queries to be 3.

Some examples of queries could be: "AI for healthcare", "Machine learning for medical imaging", "Deep learning for cancer detection"
Queries should be short and concise.

Step 2:
Based on the persona, you should provide both the breakdown of the query created above into sub queries.
You should provide sub queries from multiple different aspects to provide a comprehensive breakdown of the original query.
One examples of this could be: 
    User's original research question/idea:
        "How to address the lack of engagement of users using online the art platforms by simulating multi-persona?"
    Original query: 
        "Multi-Persona Simulation For Enhancing User Interaction"
    
    Breakdown queries:
        1. Sub Query: Multi-Persona Simulation
        2. Sub Query: Simulated personas for user interaction
Sub queries should be short and concise, if a sub query is too long, consider breaking it down into multiple queries or keywords.

Format your output in the following format:
[{{"search_query": "QUERY_1", "sub_queries": [{{"sub_query": "QUERY_1_SUB_QUERY_1"}}, {{"sub_query": "QUERY_1_SUB_QUERY_2"}}, ...]}}, {{"search_query": "QUERY_2", "sub_queries": [{{"sub_query": "QUERY_2_SUB_QUERY_1"}}, {{"sub_query": "QUERY_2_SUB_QUERY_2"}}, ...]}}, ...]
Do not generate other content besides this json itself. Generate 3 search queries, and for each search query, provide 3 sub queries.
</instructions>

<context>
Now you are provided with the following research idea/question:
{rq}
And you are playing the role of the persona as:
{persona}
And you are provided with the following literatures (if any):
{lits}
</context>

Now generate your search queries and their breakdown:
"""

SimpleCritique2RQTemplate = """You are a research assistant agent that assists user by revising their original research idea and questions, based on the critiques provided.
You will be provided with a original research idea/question provided by user, and a list of critiques provided by other peer researchers, based on which you would need to revise the original research idea/question.

You should revise the original research idea/question based on the critiques provided into several different potential new versions.
The format of the revised research idea/question should strictly follow the following format:
[{{"revised_rq": "..."}}, ...]
Keep the number of revised research idea/question to be 3. Do not generate other content besides the json itself.
The generated output should always be research questions, not statements.

Now you are provided with the following original research idea/question:
{original_rq}
And you are provided with the following critiques:
{critiques}

Your revised research ideas/questions:
"""
SimpleRQ2PersonasTemplate = """You are a research assistant agent that assists user by hypothesizing personas that are best fitted to provide feedback based on their research idea and questions.
You will be provided with a original research idea/question provided by user, based on which you would need to hypothesize personas that are best fitted to provide feedback.

You should hypothesize personas that are best fitted to provide feedback based on the research idea/question provided.
Do NOT use real names for the personas. Use high-level roles instead. Persona names should be informative and capture the essence of the persona's expertise and focus. Both the persona names and descriptions should be presented in a human-readable format.
The format of the personas should strictly follow the following format:
[{{"persona_description": {{"role_fields": {{"Role": "...", "Goal": "", ... }}, "background_fields":{{"Domain": "...", ... }}}}, "persona_name": "..."}}, ...]
Keep the number of personas to be 3. Do not generate other content besides the json itself.

Note that the user has already been provided with the following past personas:
{history_personas}
Try to generate personas that are different from the past personas.

Now you are provided with the following research idea/question:
{rq}

Generate your hypothesized personas:
"""
SimpleLitSummary2PersonasTemplate = """You are a research assistant agent that assists user by hypothesizing researchers' personas based on the literature summary provided.
You will be provided with a literature summary provided by user, based on which you would need to hypothesize researchers' personas as the author of the literature included in the summary.

You should hypothesize researchers' personas as the author of the literature included in the summary, think about the methods they used, the expertises they have, and the research domains they are interested in.
Do NOT use real names for the personas. Use high-level roles instead. Persona names should be informative and capture the essence of the persona's expertise and focus. Both the persona names and descriptions should be presented in a human-readable format.
The format of the personas should strictly follow the following format:
[{{"persona_description": {{"role_fields": {{"Role": "...", "Goal": "", ... }}, "background_fields":{{"Domain": "...", ... }}}}, "persona_name": "..."}}, ...]
Keep the number of personas to be 3. Do not generate other content besides the json itself.

Now you are provided with the following literature summary:
{summary}
"""

SimpleLitSummary2PersonasTemplate_2 = """You are a research assistant agent that assists user by hypothesizing researchers' personas based on the literature summary provided.
You will be provided with a literature summary provided by user, based on which you would need to hypothesize researchers' personas as the author of the literature included in the summary.

You should hypothesize researchers' personas as the author of the literature included in the summary, think about the methods they used, the expertises they have, and the research domains they are interested in.
Do NOT use real names for the personas. Use specifically high-level roles only. Persona names should be informative and capture the essence of the persona's expertise and focus. Both the persona names and descriptions should be presented in a human-readable format.
The format of the personas should strictly follow the following format:
[{{"persona_description": {{"role_fields": {{"Role": "...", "Goal": "", ... }}, "background_fields":{{"Domain": "...", ... }}}}, "persona_name": "..."}}, ...]
Keep the number of personas to be exactly 1.

Now you are provided with the following literature summary:
{summary}
"""

PersonaNameGeneration="""You are tasked with generating unique persona names for a set of personas based on their descriptions. The names you provide should not only be distinct from each other but also appropriately reflect the expertise and focus described for each persona. Do not alter the descriptions or the number of personas.
These personas are domain experts so use names that are suitable for professionals in the field. Do NOT use real names for the personas. Use specifically high-level roles only. Persona names should be informative and capture the essence of the persona's expertise and focus. Both the persona names and descriptions should be presented in a human-readable format.
Your output should strictly adhere to the following format:
[{{"persona_description": {{"role_fields": {{"Role": "...", "Goal": "", ... }}, "background_fields":{{"Domain": "...", ... }}}}, "persona_name": "..."}}, ...]
You are provided with the following persona descriptions:
{results}
Please generate new persona names that are unique and suitable for each description. Ensure that the new names are not repetitive and align well with the described roles and expertise. Return only the new persona names and descriptions.

"""

# suggestionTableTemplate = """
# You are an experienced researcher tasked with assuming a specific persona based on the provided background information. Your objective is to navigate through interconnected elements of a research scenario, including a research question, a critique node, and a literature node. The research question evolves from the critique node, which in turn, is informed by the literature node.
# You should hypothesize researchers' personas as the author of the literature included in the summary, and provide suggestions for all the topics discussed below. Remember you need to provide suggestions based on the persona you are assuming, and not directly state the information provided in the nodes.
# Remember to keep a suggestive tone throughout and not directly state the information. Your responses should reflect the depth and insight of the persona you embody and cover the following key sections:
# 1. Introduction: Craft a suggestion for the introduction that outlines the central themes of the research. Utilize insights from the research question and the critique node to highlight the significance and scope of the study.
# 2. Literature Review: Suggest and provide a succinct review of existing literature, referencing the provided literature node. Offer guidance on potential sources and areas for further investigation that align with the themes of the literature node.
# 3. Methodology: Suggest a suitable methodology for pursuing the research. This section should integrate elements from the research question, critique node, and literature node to propose a coherent approach for data collection and analysis.
# 4. Case Study: Discuss relevant case studies that illustrate the research theme and provide steps on how to explore more relevant case studies. Use the research question, critique node, and literature node as a basis for selection and analysis of case studies. Provide recommendations for expanding upon these examples in future research.
# Please adhere strictly to the following output format:
# [{{"title": "TITLE OF THE SECTION", "description": "DESCRIPTION OF THE SECTION"}},...]

# Additional details for your persona and research components are as follows:
# Persona Description:
# {persona}
# Research Question:
# {rq}
# Critique Node:
# {critiqueNode}
# Literature Node:
# {literature}
# """
suggestionTableTemplate = """
You are an experienced researcher tasked with assuming a specific persona based on the provided background information. 
Imagine you are playing the role of the persona described below:
{persona}

You will be provided with a research question, a specific research scenario, a critique node, and a literature node. The research question evolves from the critique node, which in turn, is informed by the literature node.
Your objective is to propose a structured outline for a research project based on the provided information. 
Focus on the feasibility and present clear hypothesis and actionable steps for each section in a narrative format. 
Be concise and brief in your responses, ensuring that each section is well-defined and contributes to the overall research project.
Remember to keep a suggestive tone throughout and not directly state the information. 

The user has previously engaged in a discussion with the following historical context:
{context}

Additional details for your persona and research components are as follows:
Research Question:
{rq}
Research Scenario:
{scenario}
Critique Node:
{critiqueNode}
Literature Node:
{literature}


Now, based on the provided information, generate a structured outline for a research project in the following format:
    The outline is a table where each row includes a section title and a brief description of the content to be included in that section.
    Pick a suitable outline structure based on the expertise/domain of the persona or literatures provided. 
    Focus on sections that are practical and actionable, always start with "Motivation and Research Gap", do not inlcude sections such as "Introduction", "Literature Review", "Conclusion", and "References".
    The description should be concise and informative in bullet points of short sentences each within 20-30 words.
    Please adhere strictly to the following output format for the outline:
    [{{"title": "TITLE OF THE SECTION", "description": "1. DESCRIPTION OF THE SECTION BULLET 1\n\n2. DESCRIPTION OF THE SECTION BULLET 2\n\n..."}}, ...]
    Only output the outline in the json format. Do not include any other content besides the json itself.
"""

addFieldTemplate="""
You are an experienced researcher tasked with assuming a specific persona based on the provided background information. Your objective is to navigate through interconnected elements of a research scenario, including a research question, a critique node, and a literature node. The research question evolves from the critique node, which in turn, is informed by the literature node. We have further generated a table including necessary sections to the user.
You should hypothesize researchers' personas as the author of the literature included in the summary, and provide suggestions for {title} topic based on the research question, a critique node, a literature node, and also the provided table which is given. Remember you need to provide suggestions based on the persona you are assuming, and not directly state the information provided in the nodes.
Remember to keep a suggestive tone throughout and not directly state the information. Your responses should not exceed 100 words and should reflect the depth and insight of the persona you embody and answer the following section only:
1.{title}: Craft a suggestion for the {title} that outlines the central themes of the research. Utilize insights from the research question, critique node and literature node to highlight the significance and scope of the study.

The user has previously engaged in a discussion with the following historical context:
{context}

Additional details for your persona and research components are as follows:
Persona Description:
{persona}
Research Question:
{rq}
Research Scenario:
{scenario}
Critique Node:
{critiqueNode}
Literature Node:
{literature}
Table Data already given:
{tableData}

Please adhere strictly to the following output format:
{{"title": "TITLE OF THE SECTION", "description": "DESCRIPTION OF THE SECTION"}}
"""

generateHypotheticalAbstractTemplate = """
You are a research assistant agent tasked with generating a hypothetical research abstract for a research paper based on the provided information. 
You will be provided with a persona description, a research question, a critique, a literature review, and a table of research outline.
Your objective is to craft a concise and informative hypothetical abstract that based on the table of research outline.
The abstract should be concise and informative, reflecting the research scenario and aligning with the persona's expertise and focus.
Your abstract should be structured and simulate a real-world research abstract, avoid using direct quotes and citations from the provided information.

The user has previously engaged in a discussion with the following historical context:
{context}

Additional details for your persona and research components are as follows:
Research Question:
{rq}
Research Scenario:
{scenario}
Literature Review:
{literature}
Table of research outline:
{tableData}


Now play the role of the following persona:
{persona}
You have already come up with the following critique for the research question:
{critiqueNode}

Generate a hypothetical abstract for the research paper based on the provided information in the following format:
{{"hypothetical_abstract": "YOUR HYPOTHETICAL ABSTRACT"}}
"""

# generateLiteratureReviewTemplate = """
# You are a research assistant agent tasked with generating a literature review based on the provided information. 
# You will be provided with abstracts of several research papers. 
# Your objective is to craft a concise and informative literature review that summarizes the key findings, methodologies, and contributions of the provided papers. 
# The literature review should be well-organized, highlighting the current state of research on the topic, identifying trends, gaps, and suggesting future research directions.

# The entire literature review can focus on the following key sections:
# 1. Introduction: Briefly introduce the overall topic and the importance of the research area.
# 2. Key Findings: Summarize the main findings from each paper.
# 3. Methodologies: Describe the research methodologies used in the studies.
# 4. Contributions: Highlight the unique contributions of each paper.
# 5. Trends and Gaps: Identify any common trends and gaps in the research.
# 6. Future Directions: Suggest potential areas for future research based on the gaps identified.

# Additional details for the abstracts are as follows:
# {abstracts}

# Output only plain text. Do not output markdown. Generate a literature review for the provided papers in the format as follows:
# {{"literature_review": "YOUR LITERATURE REVIEW"}}

# """
generateLiteratureReviewTemplate = """
You are a research assistant agent tasked with generating a literature review based on the provided information. 
You will be provided with abstracts of several research papers, and a research question the literature review should be conducted to address.
Your objective is to craft a concise and informative literature review that summarizes the key findings, methodologies, and contributions of the provided papers. 
The literature review should be well-organized in bullet points, highlighting the current state of research on the topic, identifying trends, gaps, and suggesting future research directions.
The literature review should contain the following key points:
- Relevant Past Findings: Summarize the main findings from each paper.
- Existing Methods: Describe the research methodologies used in the studies.
- Contributions from Prior Works: Highlight the unique contributions of each paper.
- Research Gap and Motivation: Identify the research gap and the motivation for the study.
Each point should be concise and short, focusing on the key takeaways from the papers.


The user has previously engaged in a discussion with the following historical context:
{context}


Now with the literature abstracts are as follows:
-----------
{abstracts}
-----------
And given the following research question:
{rq}
Generate a single-paragraph literature review based on the provided papers in the format as follows:
{{"literature_review": {{"Relevant Past Findings": "...", "Existing Methods": "...", "Contributions from Prior Works": "...", "Research Gap and Motivation": "..."}}}}
Output only json format. Do not output markdown. For citations, use the following format: "Author et al. (Year)(URL) found that..."

"""
generateResearchScenarioTemplate = """
You are a research assistant agent tasked with generating a few research scenarios suggestions based on the provided information.
Some examples of research scenarios could be new research directions, potential studies, or innovative approaches based on the research question and literature abstracts provided.
Each research scenario should be short and concise, and within 20 words.

The user has previously engaged in a discussion with the following historical context:
{context}

Now with the literature abstracts are as follows:
-----------
{abstracts}
-----------
And given the following research question:
{rq}

Generate 3 research scenarios based on the provided information in the format as follows:
{{"research_scenarios": ["RESEARCH SCENARIO 1", "RESEARCH SCENARIO 2", ...]}}
Output only json format. Do not output markdown. Be creative and think of different research directions based on the research question and literature abstracts provided.

"""




Task_rq="""Using the following research question, give your perspective on how a researcher such as yourself, can help address the research question. Remember to speak from the perspective of your persona and not just advocate for the research context. Give strong points and reasons why someone with similar persona as you would be better suited to perform research on the provided research idea.

The following is the research question:

{rq}"""

PersonaAgent="""You are a {persona_description}."""

def persona_temp(persona_name, persona_description):
    return PersonaAgent.format(persona_name=persona_name, persona_description=persona_description)

def task_rq_temp(rq):
    return Task_rq.format(rq=rq)


generatePodcastTemplate_org = """Create a transcript for a podcast of two people discussing the research paper below. At first one person gives a 50 word introduction of the paper then two people start discussing the paper, be explicit what you are discussing about the paper for example if you are discussing limitations somehow mention you will be discussing limitations now.

Please also follow these additional guidelines:
1. Add to the introduction that this is SALT Lab podcast
2. Keep the paper introduction a bit detailed however do not include author information, where it is going to be published, who created this product, etc keep it about the paper.
3. Keep each of the utterance after the introduction short so it sounds more like a conversation.
4. The podcast should be interesting and engaging.

Output the transcript in the following json format:

{{
  "transcript": [
    {{
      "speaker": "Speaker 1",
      "text": "..."
    }},
    {{
      "speaker": "Speaker 2",
      "text": "..."
    }}
  ]
}}

Research Paper in md format:
{research_paper}
"""

generatePodcastTemplate = """Create a transcript for a podcast of two people having a conversation about the research paper below. At first one person gives a 75 word introduction of the paper then two people start discussing the paper, be explicit what they are discussing about the paper for example if they are discussing limitations somehow mention they will be discussing limitations now.

Please also follow these additional guidelines:
1. Add to the introduction that this is SALT Lab podcast
2. In the paper introduction do not include author information, where it is going to be published, who created this product, etc keep it about the paper.
3. It is important the discussion after the introduction is a conversation between the two speakers. Where both speakers share their insights and ask each other questions.
4. If possible use things like analogy, humour to make the podcast should be interesting to hear.
5. Also keep each of the utterance after the introduction short to make the podcast engaging  .


Output the transcript in the following json format:

{{
  "transcript": [
    {{
      "speaker": "Speaker 1",
      "text": "..."
    }},
    {{
      "speaker": "Speaker 2",
      "text": "..."
    }}
  ]
}}

Research Paper in md format:
{research_paper}
"""

generatePodcastTemplate_conversation = """Create a transcript for a podcast of two people having a conversation about the research paper below. At first one person gives a 75 word introduction of the paper then two people start discussing the paper, be explicit what they are discussing about the paper for example if they are discussing limitations somehow mention they will be discussing limitations now.

Please also follow these additional guidelines:
1. Add to the introduction that this is SALT Lab podcast
2. It is important the discussion after the introduction is a conversation between the two speakers.
3. Keep each of the utterance after the introduction short to make the podcast engaging.
4. The podcast should be interesting to hear.

Output the transcript in the following json format:

{{
  "transcript": [
    {{
      "speaker": "Speaker 1",
      "text": "..."
    }},
    {{
      "speaker": "Speaker 2",
      "text": "..."
    }}
  ]
}}

Research Paper in md format:
{research_paper}
"""

generatePodcastTemplate_engaging = """Create a transcript for a podcast episode from the SALT Lab Podcast, where two speakers discuss the research paper below. Start with a brief, engaging 30-second introduction summarizing the key focus and purpose of the paper, but do not include specific details about the authors, publication venue, or creators. Ensure the introduction is clear, captivating, and focused on the paper’s content.

After the introduction, the two speakers begin an in-depth discussion. They should clearly introduce each topic they’re discussing, such as limitations, applications, or results, to guide listeners through the conversation. Emphasize engaging storytelling techniques to keep listeners entertained and informed; include humor, metaphors, analogies, or relatable examples to make complex ideas more accessible and enjoyable.

Output the conversation transcript in the following JSON format:

{
  "transcript": [
    {
      "speaker": "Speaker 1",
      "text": "..."
    },
    {
      "speaker": "Speaker 2",
      "text": "..."
    }
  ]
}
Research Paper in md format: 
{research_paper}
"""

generatePodcastTemplate_structured = """Create a transcript for a podcast of two people discussing the research paper below.

Please follow these guidelines to generate the podcast transcript:
1. This is SALT Lab podcast use it in the introduction.
2. At first one person gives a 30 seconds introduction of the paper
3. Keep the paper introduction a bit detailed however do not include author information, where it is going to be published, who created this product, etc keep it about the paper. 
4. Then two people start discussing the paper.
5. They first discuss the novelty of the paper.
6. Then they discuss the strengths of the paper.
7, Then they discuss the weaknesses of the paper.
8. Finally, they discuss the potential future directions of the paper.
9. Keep each utterances in the discussion after the introduction short to make the conversation more engaging.

Output the transcript in the following json format:

{
  "transcript": [
    {
      "speaker": "Speaker 1",
      "text": "..."
    },
    {
      "speaker": "Speaker 2",
      "text": "..."
    }
  ]
}

Research Paper in md format:
{research_paper}
"""


# Randomly select different types of story telling techniques to generate the story, so all generated stories do not start the same.
# generateStoryTemplate = """You are an expert in Human-Computer Interaction (HCI) and a world-renowned storyteller celebrated for your ability to transform complex ideas into captivating narratives. You are highly familiar with the types of research contributions recognized by the HCI community (e.g., artifact/technique development, understanding users, systems and infrastructure, methodology, theory, innovation and vision, argumentation, validation/replication). Using the research paper provided below, please analyze and create a compelling story transcript by following these steps:

# 1. **Identify HCI Contribution Types:** Determine the specific type(s) of contribution the paper makes, such as developing a novel interface artifact, exploring user understanding, proposing new methodologies, advancing theoretical frameworks, presenting innovative design visions, introducing new arguments, or replicating/validating previous findings.

# 2. **Evaluate Alignment with CHI Guidelines:** Assess how the paper aligns with the CHI reviewing criteria for the identified contribution type(s). For example:
#    - **Artifacts/Techniques:** Does it address a real-world problem, emphasize inclusivity, and provide thorough validation?
#    - **Understanding Users:** How well does it define the studied population, detail the methodology, and offer new insights for HCI?
#    - **Systems/Infrastructure:** Does it contextualize the contribution, consider inclusivity, and demonstrate feasibility and impact?
#    - **Other Contributions (e.g., Methodology, Theory, etc.):** Evaluate against relevant criteria, including originality, depth, and practical implications.

# 3. **Craft the Narrative:** Integrate key insights from your analysis into an engaging story. Ensure the story conveys:
#    - The research paper's unique contribution to HCI.
#    - Why this contribution is significant and its potential to shape the field (e.g., influencing interfaces, enhancing user understanding, advancing methodologies, or informing theory).
#    - Evidence of its credibility and value, such as rigorous validation, inclusivity, contextual relevance, and impact.

# 4. **Compose the Story:** As a world-renowned storyteller celebrated for transforming complex ideas into captivating narratives, create a transcript (approximately 150 words) that:
#    - **Captivates the Listener:** Hooks the audience with a compelling opening and keeps their attention. {existing_start}
#    - **Simplifies Complexity:** Clearly explains the essence of the paper's contribution in an accessible and engaging manner.
#    - **Highlights Meaning and Impact:** Illustrates why the contribution matters and its potential influence.


# **Output Format:** Output the transcript in the following JSON structure:

# {{
#   "transcript": [
#     {{
#       "speaker": "Story Narrator",
#       "text": "<your story here>"
#     }}
#   ]
# }}

# Research Paper (Markdown Format):
# {research_paper}
# """

generateBaseStoryTemplate = """
You are an expert in Human-Computer Interaction (HCI) tasked with creating an engaging story about a research paper. Your goal is to transform complex technical content into an accessible and compelling narrative that resonates with both technical and non-technical audiences.

<analysis_phase>
Before crafting your story, analyze the paper through these HCI research contribution lenses:

1. CONTRIBUTION TYPE
Identify the primary contribution category:
- Artifact/Interface Development
- User Understanding/Behavioral Insights  
- System/Infrastructure Innovation
- Methodological Advancement
- Theoretical Framework
- Design Vision/Future Direction
- Replication/Validation Study

2. IMPACT ASSESSMENT
Evaluate the work's significance by considering:
- Problem Importance: What real-world challenge does it address?
- Technical Innovation: How does it advance beyond existing solutions?
- Validation Approach: What evidence supports its effectiveness?
- Broader Implications: How might it influence future HCI work?

3. KEY NARRATIVE ELEMENTS
Identify compelling aspects that will engage listeners:
- Surprising or counterintuitive findings
- Novel technical approaches or insights
- Practical applications or implications
- Human-centered impact
</analysis_phase>

<story_guidelines>
Create a 1-minute audio story transcript that:
1. Opens with a hook that immediately captures attention
2. Presents the core contribution clearly and concisely
3. Illustrates impact through concrete examples or scenarios
4. Maintains focus on the research without mentioning authors/institutions
5. Uses accessible language while preserving technical accuracy
6. Concludes with the broader significance for HCI

Length: Aim for 150-200 words
Tone: Engaging, clear, and professional
</story_guidelines>

Output Format:
{
  "transcript": [
    {
      "speaker": "Story Narrator",
      "text": "<your story here>"
    }
  ]
}

Research Paper in md format:
{research_paper}
"""

generateDramaticStoryTemplate = """You are a world-renowned, award-winning storyteller, celebrated for your exceptional ability to weave intricate ideas into captivating and memorable narratives. Over the years, your stories have earned you accolades for their unique blend of creativity, clarity, and emotional resonance. Your task is to harness these skills to rewrite the given story about a research paper into a compelling story of approximately 150 words that is engaing to hear.

The story should:

Be Captivating: Draw the listener in from the very first line, making them eager to hear more. {existing_start}
Simplify Complexity: Break down the intricate concepts from the research paper into a narrative that is both accessible and engaging for a broad audience.
Be Relatable: Frame the story in a way that connects with the audience, whether through real-world scenarios, vivid metaphors, or imaginative storytelling techniques.

Your output must be formatted as a JSON object with the following structure:

{{
  "transcript": [
    {{
      "speaker": "Story Narrator",
      "text": "<your engaging story here>"
    }}
  ]
}}

Current Story:
{story}
"""

generateStoryOrgPrompt = """You are a world-renowned, award-winning storyteller, celebrated for your ability to transform complex ideas into captivating narratives. Your task is to craft a 150-word transcript for an engaging and intriguing story that creatively explains the essence of the research paper provided below.

The story should:

1. Be Captivating: Draw the listener in from the very first line, making them eager to hear more.
2. Simplify Complexity: Break down the intricate concepts from the research paper into a narrative that is both accessible and engaging for a broad audience.
3. Be Relatable: Frame the story in a way that connects with the audience, whether through real-world scenarios, vivid metaphors, or imaginative storytelling techniques.
{existing_start}


Your output must be formatted as a JSON object with the following structure:

{{
  "transcript": [
    {{
      "speaker": "Story Narrator",
      "text": "<your story here>"
    }}
  ]
}}

Research Paper in md format:
{research_paper}
"""

generatePodcastTransitionTemplate = """I have a video which consists of multiple podcasts each discussing a research paper. Create a transcript of a host that will be played during the transition from one podcast to another. There will no break between the two podcasts, the host will introduce the next podcast and the research paper that will be discussed in the next podcast.

The title of the paper played before the transition is: {title_1}

The title of the paper after the transition is: {title_2}

Output in the following format:
{{
"transcript": ".."
}}
"""

generateStoryStartTemplate = """I have a video which consists of multiple stories each discussing a research paper. Create a transcript of a host that will be played during the start of the video. 

The title of the paper played at the start is: {title}

Output in the following format:
{{
"transcript": ".."
}}
"""

generateStoryTransitionTemplate = """I have a video which consists of multiple stories each discussing a research paper. Create a transcript of a host that will be the played at the start of the video and will introduce the papers that are going to be discussed.

The titles of the research papers played in the videos are: 
Research Paper 1: {title_1}
Research Paper 2: {title_2}
Research Paper 3: {title_3}

Output in the following format:
{{
"transcript": ".."
}}
"""