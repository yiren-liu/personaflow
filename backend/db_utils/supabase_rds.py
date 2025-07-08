import os
import time
from datetime import datetime

import json

from supabase import create_client, Client
import platform

from autogpt.config.singleton import Singleton
from settings import app_settings

supabase_url: str = app_settings.supabase_url
supabase_service_key: str = app_settings.supabase_service_key



class RDSClient(metaclass=Singleton):
    """
    Supabase Client.
    """

    def __init__(self) -> None:
        print("Initializing Supabase Client...")
        start = time.time()

        self.client: Client = create_client(supabase_url, supabase_service_key)

        end = time.time()
        print(f"Supabase Client initialized in {end - start} seconds.")

    def write_log(self, session_id: str, type: str, log_body: dict, user: str):
        data = {
            "user": user,
            "session_id": session_id,
            "type": type,
            "log_body": json.dumps(log_body),
            "client_name": platform.node(),
        }
        try:
            response = self.client.table("coquest_block_dev").insert(data).execute()
            # if response.error:
            #     raise Exception(response.error)
        except Exception as e:
            print("Error when writing log to database: " + str(e))
        return data

    def create_user_settings(self, user_id: str, quota_limit: int = 50):
        """
        Create a new user settings in the database, table user_settings.
        """
        try:
            self.client.table("user_settings").insert({"user_id": user_id, "quota_limit": quota_limit, "last_updated": datetime.now().isoformat()}).execute()
            return True
        except Exception as e:
            raise Exception("Error when creating new user settings: " + str(e))
    
    
    def insert_paper_newsletter(self, paper_id:str, rq_index:str, openacess:str, date_used:str, title:str, status:bool,dateTime):
        """
        Insert's a record of the paper, which has been used in newsletter
        """
        try:
            self.client.table("newsletter_paper_used").insert({"paper_id_semantic_scholar":paper_id,"RQ_index": rq_index ,"OpenAccess":openacess,"date_generated":date_used, "paper_name":title, "status_used":status, "timestamp":dateTime}).execute()
            return True
        except Exception as e:
            raise Exception("Error when inserting a record for adding a paper for newsletter: "+ str(e))

    def check_used_papers_newsletter(self, paper_id:str,rq_index:str,openacess:str):
        """
        Check for already used papers, previously used in newsletter.
        """
        try:
            response = self.client.table("newsletter_paper_used").select("*").eq("paper_id_semantic_scholar", paper_id).eq("RQ_index", rq_index).eq("OpenAccess",openacess).execute()
            if len(response.data)>0:
                return True
            else:
                return False
        except Exception as e:
            raise Exception("Error when checking for previously used papers from newsletter table: " + str(e))


    def delete_paper_newsletter(self,paper_id:str,rq_index:str):
        """
        Delete a paper from the newsletter
        """
        try:
            self.client.table('newsletter_paper_used').delete().eq('paper_id_semantic_scholar', paper_id).eq("RQ_index", rq_index).execute()
            return True
        except Exception as e:
            raise Exception("Error when trying to delete a record from newsletter table: "+str(e))


    def get_user_quota(self, user_id: str):
        """
        Get the user's quota from the database, table user_settings.
        If the user does not exist in the database, create a new user with default quota. 
        """
        try:
            # first check if the user exists in the database
            response = self.client.table("user_settings").select("*").eq("user_id", user_id).execute()
            if len(response.data) > 0:
                return response.data[0]["quota_limit"]
            else:
                # Create a new user with default quota
                self.create_user_settings(user_id, 50)
                return 50
        except Exception as e:
            raise Exception("Error when getting user quota: " + str(e))
        
    def get_user_id(self, user_email: str):
        """
        Get the user's quota from the database, table user_settings.
        If the user does not exist in the database, create a new user with default quota. 
        """
        try:
            # first check if the user exists in the database
            response = self.client.table("auth").select("*").eq("Email", user_email).execute()
            if len(response.data) > 0:
                return response.data[0]["email"]
            else:
                return None
        except Exception as e:
            return None
        

    def update_user_quota(self, user_id: str, quota_limit: int):
        """
        Update the user's quota in the database, table user_settings.
        """
        try:    
            self.client.table("user_settings").update({"quota_limit": quota_limit, "last_updated": datetime.now().isoformat()}).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            raise Exception("Error when updating user quota: " + str(e))
    
    def add_newsletter_user(self, email: str, preferred_topics:list, keywords:list, familiarity, subscription_frequency):
        """
        Adds new user to the newsletter table in the database.
        """
        try:
            self.client.table("newsletter").insert({"email": email, "preferred_topics": preferred_topics, "keywords": keywords, "subscription_frequency": subscription_frequency, "familiarity": familiarity}).execute()
            return True
        except Exception as e:
            raise Exception("Error when adding new newsletter user: " + str(e)) 
        
    def get_newsletter_user(self, email: str):
        """
        Adds new user to the newsletter table in the database.
        """
        try:
            response = self.client.table("newsletter").select("*").eq("email", email).execute()
            if len(response.data) > 0:
                return response.data[0]
            else:
                raise Exception("User not found")
        except Exception as e:
            raise Exception("Error when getting newsletter user: " + str(e)) 
        
    def get_all_newsletter_users(self):
        """
        Adds new user to the newsletter table in the database.
        """
        try:
            response = self.client.table("newsletter").select("*").execute()
            return response.data
        except Exception as e:
            raise Exception("Error when getting all newsletter users: " + str(e))
        
    def get_newsletter_from_cache(self, title):
        """
        Adds new user to the newsletter table in the database.
        """
        try:
            response = self.client.table("newsletter_cache").select("*").eq("title", title.strip().replace(" ", "_")).execute()
            return response.data[0]
        except Exception as e:
            return {}
    
    def get_default_if_none(self, value, default):
        if value is None:
            return default
        return value

    def add_newsletter_to_cache(self, title, podcast_link = None, story_link = None):
        """
        Adds new user to the newsletter table in the database.
        """
        title = title.strip().replace(" ", "_")
        response = self.client.table("newsletter_cache").select("*").eq("title", title).execute()
        try:
            if len(response.data) > 0:
                self.client.table("newsletter_cache").update({
                    "podcast_link" : self.get_default_if_none(podcast_link, response.data[0]["podcast_link"]), 
                    "story_link" : self.get_default_if_none(podcast_link, response.data[0]["story_link"])
                     }
                ).eq("title", title.strip().replace(" ", "_")).execute()
            else:
                self.client.table("newsletter_cache").insert({"title": title.strip().replace(" ", "_"), "podcast_link" : podcast_link, "story_link" : story_link}).execute()
            return True
        except Exception as e:
            raise Exception("Error when adding newsletter to cache: " + str(e))

if __name__ == "__main__":
    client = RDSClient()
    # print(client.add_newsletter_user("tsharma7@illinois.edu", ["business", "technology"], ["AI", "blockchain"], "beginner", "weekly"))
    print(client.check_used_papers_newsletter('54389728C45'))
    