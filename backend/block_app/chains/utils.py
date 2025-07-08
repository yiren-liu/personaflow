from typing import List
import re
import logging

import tiktoken


from block_app.models.nodes import LiteratureNodeData, NodesWithDepth

logger = logging.getLogger(__name__)

enc = tiktoken.encoding_for_model("gpt-4o")

def format_lit_data(litDataList: List[LiteratureNodeData], maxLitTokenLen: int=50000) -> str:
    litDataStr = ""
    tokenCount = 0
    for lit in litDataList:
        # litDataStr += f"Title: {lit.title}\n"
        # litDataStr += f"Authors: {lit.authors}\n"
        # litDataStr += f"Abstract: {lit.abstract}\n\n"
        newStr = f"Title: {lit.title}\nAuthors: {lit.authors}\nAbstract: {lit.abstract}\n\n"
        tokenCount += len(enc.encode(newStr))
        if tokenCount > maxLitTokenLen:
            logger.warning(f"Lit data token count exceeds {maxLitTokenLen}, breaking")
            logger.warning(f"Total number of lits added: {len(litDataStr)}")
            break
        litDataStr += newStr
    return litDataStr


def format_flow_context(nodesWithDepth: List[NodesWithDepth]) -> str:
    """
    This function serializes the context of the target flow into a string prompt for LLM to understand the semantics.
    The nodes in the flow are serialized in an ascending order of their depth in the flow.
    """
    flowContextStr = ""
    stepCnt = 0
    for nodeWithDepth in nodesWithDepth[::-1]: # reverse order to follow the chronological order
        node = nodeWithDepth.node
        depth = nodeWithDepth.depth

        if depth == 0:
            continue

        if node.type == "RQNode":
            nodeStr = f"Step #{stepCnt}: User developed a research question: {node.data.userInput}\n\n\n\n"
            flowContextStr += nodeStr
        elif node.type == "PersonaNode":
            nodeStr = f"Step #{stepCnt}: User developed a persona: \n- Persona Name: {node.data.node['template']['persona_name']['value']}\n- Persona Description: {node.data.node['template']['persona_description']['value']}\n\n\n\n"
            flowContextStr += nodeStr
        elif node.type == "LiteratureNode":
            litDataList = [LiteratureNodeData.model_validate(d) for d in node.data.node['template']['paper_list']['value']]
            nodeStr = f"Step #{stepCnt}: User added the following literature: \n{format_lit_data(litDataList)}\n\n\n\n"
            flowContextStr += nodeStr
        elif node.type == "CritiqueNode":
            nodeStr = f"Step #{stepCnt}: The previous persona provided a critique: \n- Critique Aspect: {node.data.node['template']['critique_aspect']['value']}\n- Critique Details: {node.data.node['template']['critique_detail']['value']}\n\n\n\n"
            flowContextStr += nodeStr
        

        stepCnt += 1


    return flowContextStr

# def format_bibtex_to_citation(bibtex):
#     author_match = re.search(r'author = {(.*?)}', bibtex, re.DOTALL)
#     title_match = re.search(r'title = {(.*?)}', bibtex, re.DOTALL)
#     journal_match = re.search(r'journal = {(.*?)}', bibtex, re.DOTALL)
#     year_match = re.search(r'year = {(.*?)}', bibtex, re.DOTALL)
#     volume_match = re.search(r'volume = {(.*?)}', bibtex, re.DOTALL)
#     pages_match = re.search(r'pages = {(.*?)}', bibtex, re.DOTALL)

#     authors = author_match.group(1) if author_match else "Unknown Authors"
#     title = title_match.group(1) if title_match else "Unknown Title"
#     journal = journal_match.group(1) if journal_match else "Unknown Journal"
#     year = year_match.group(1) if year_match else "Unknown Year"
#     volume = volume_match.group(1) if volume_match else ""
#     pages = pages_match.group(1).strip() if pages_match else ""

#     authors_list = [author.strip() for author in authors.split(" and ")]
#     if len(authors_list) > 1:
#         authors_formatted = ", ".join(authors_list[:-1]) + ", & " + authors_list[-1]
#     else:
#         authors_formatted = authors_list[0]

#     # APA format: Author(s). (Year). Title of the article. Title of the Journal, volume(issue), pages.
#     citation = f"{authors_formatted} ({year}). {title}. {journal}, {volume}, {pages}."
#     return citation

def bibtex_to_dict(bibtex_entry):
    bib_dict = {}
    for line in bibtex_entry.splitlines():
        line = line.strip()
        if '=' in line:
            key, value = line.split('=', 1)
            key = key.strip().lower() 
            value = value.strip().replace('{','').replace('}','').strip(',')
            bib_dict[key] = value
    return bib_dict


def format_bibtex_to_citation(bibtex_entry):
    # Convert BibTeX string to dictionary
    bib_dict = bibtex_to_dict(bibtex_entry['bibtex'])

    # Extract fields
    authors = bib_dict.get('author', "")
    title = bib_dict.get('title', "")
    journal = bib_dict.get('journal', "").lower()
    year = bib_dict.get('year', "")
    volume = bib_dict.get('volume', "")
    booktitle = bib_dict.get('booktitle', "").lower()

    # Process authors: split and initialize names
    authors_list = [author.strip() for author in authors.split(" and ")] if authors else []
    formatted_authors = []
    for author in authors_list:
        parts = author.split()
        if len(parts) > 1:
            formatted_authors.append(f"{parts[-1]}, {' '.join([p[0] + '.' for p in parts[:-1]])}")
        else:
            formatted_authors.append(author)
    
    if len(formatted_authors) > 1:
        authors_formatted = ", ".join(formatted_authors[:-1]) + ", & " + formatted_authors[-1]
    elif formatted_authors:
        authors_formatted = formatted_authors[0]
    else:
        authors_formatted = "Unknown Authors"

    # Format citation
    volume_text = f", {volume}" if volume else ""
    citation = f"{authors_formatted} ({year}). {title}. {journal if journal else booktitle}{volume_text if volume else '.'}"

    return citation
