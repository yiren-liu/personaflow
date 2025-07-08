from semanticscholar import SemanticScholar
from settings import app_settings

class FilterPaper():
    def __init__(self):
        self.sch=SemanticScholar(
        api_key=app_settings.s2_api_key,
        timeout=60
    )
    
    def get_author_info(self,authorInfoList):
        authorIdList=[]
        
        for authInfo in authorInfoList:
            authorIdList.append(authInfo.authorId)

        info=self.sch.get_authors(author_ids=authorIdList)
        all_auth_citations_count=0
        all_auth_paper_count=0
        number_of_auth=0

        for i in range(len(info)):
            number_of_auth+=1
            all_auth_citations_count+=info[i].citationCount
            all_auth_paper_count+=info[i].paperCount
        
        return {'num_authors':number_of_auth, 'citation_counts':all_auth_citations_count, 'paper_counts':all_auth_paper_count}


# sch = SemanticScholar(
#         api_key=app_settings.s2_api_key,
#         timeout=60
#     )
# text="LLM hallucinations in AI"
# papers = sch.search_paper(text, limit=10,open_access_pdf=True)
# res = []

# # info=sch.get_authors(author_ids=['1741101'])
# # print(info[0].citationCount)

# for paper in papers[:3]:
#     v1={
#         "title": paper.title,
#         "authors": [a.name for a in paper.authors],
#         "abstract": paper.abstract,
#         "url": paper.url,
#         "topic": text,
#         "year": str(paper.year),
#         "venue": str(paper.venue),
#         "citationCount": str(paper.citationCount),
#         "openaccess_url":paper.openAccessPdf,
#         "paperId":paper.paperId,
#         "bibtex":paper.citationStyles,
#         "author_info":paper.authors,
#         "journal":paper.journal
#     }

#     auth_list=paper.authors
#     auth_ids=[]
#     for lst in auth_list:
#         # print(lst)
#         # dic_lst=dict(lst)
#         auth_ids.append(lst.authorId)
    
#     info=sch.get_authors(author_ids=auth_ids)

#     author_results=[]
#     for i in range(len(info)):
#         v2={
#             "name":info[i].name,
#             "citationCount":info[i].citationCount,
#             "affiliations": info[i].affiliations,
#             "paperCount": info[i].paperCount
#         }
#         author_results.append(v2)
    

#     print(v1)
#     print('\n')
#     print(author_results)
    