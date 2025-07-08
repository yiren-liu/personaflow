import asyncio
from semanticscholar import SemanticScholar
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
import bisect
from settings import app_settings

def auth_search(auth_name):
    try:
        sch = SemanticScholar(api_key=app_settings.s2_api_key)
        results = sch.search_author(auth_name)
        if not results:
            raise ValueError("No results found")  # Raise an error if no results
        return results
    except Exception as e:
        print(f"Error occurred: {e}")
        return -1  # Return -1 in case of any error

async def auth_profile_faiss(auth_name,topic,process):
    loop = asyncio.get_running_loop()
    try:
        results = await loop.run_in_executor(None, auth_search, auth_name)
        if results == -1:
            return -1  # Immediately return if error is encountered
        
    except Exception as e:
        print(f"Error in processing {process}: {e}")
        return -1
    print(f"list of authors received for {process}")

    all_results=[]
    for i in range(len(results)):
        all_results.extend(dicn for dicn in results[i].papers)

    print("total results:",len(all_results))
    paper_lst=[]
    for paper in all_results:
        if paper.abstract==None:
            continue
        val=paper.title+"\n\n"+paper.abstract
        paper_lst.append(Document(page_content=val))

    if not paper_lst:
        print("No valid papers found.")
        return

    embeddings = OpenAIEmbeddings(api_key=app_settings.openai_api_key,openai_api_base=app_settings.openai_api_base)

    db = await FAISS.afrom_documents(paper_lst, embeddings)
    print(f"Index contains {db.index.ntotal} documents for process {process}")
    print('\n')

    docs = await db.asimilarity_search_with_score(topic,k=10)
    print(f"Similarity search done for process {process}")
    print('\n')

    results_lst=[]

    
    for d in docs:
        if d[1]>.42: #score threshold at .42
            continue
        if len(d[0].page_content)<20: #checking if the document length is <20
            print('Less than 20')
            continue
        print(f'Starting to get results for process:{process}')
        result_tuple = (d[1], d[0].page_content)
        position = bisect.bisect([x[0] for x in results_lst], d[1])
        results_lst.insert(position, result_tuple)
        print(d[1])
        print(d[0].page_content)
        print('\n')
    
    return results_lst
        

# async def main_fun():
#     tasks = [
#         auth_profile_faiss("Siyu Ren", "Key-Value caching in Large Language Model inference","A"),
#         auth_profile_faiss("Souvik Kundu", "Key-Value caching in Large Language Model inference","B"),
#         auth_profile_faiss("Tianyi Zhang", "Key-Value caching in Large Language Model inference","C"),
#         auth_profile_faiss("Woosuk Kwon", "Key-Value caching in Large Language Model inference","D"),
#         auth_profile_faiss("Jeongin Bae", "Key-Value caching in Large Language Model inference","E"),
#     ]
#     results=await asyncio.gather(*tasks)
#     print(results)
#     print(len(results))

#     pq=PriorityQueue()
#     for i in range(len(results)):
#         print(results[i][0])
#         pq.put((results[i][0][0],i))
    
#     final_lst = {}
#     for _ in range(3):
#         v = pq.get()
#         print(v)
#         key = v[1]
#         if key not in final_lst:
#             final_lst[key] = []
#         for item in results[key]:
#             final_lst[key].append(item[1])
#     print(final_lst)
    
# if __name__ == '__main__':

#     asyncio.run(main_fun())

    