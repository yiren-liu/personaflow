from semanticscholar import SemanticScholar

sch = SemanticScholar(api_key='')

papers=sch.search_paper('attention is all you need')

for paper in papers[:2]:
    print('authors',paper.authors)
    auth_id_first=paper.authors[0].authorId
    auth_id_last=paper.authors[-1].authorId

    auth1_results=sch.get_author(auth_id_first)
    auth2_results=sch.get_author(auth_id_last)

    print('author1:', auth1_results)
    
    break
