// src/api/api.ts

import { useContext } from "react";
import axios, { AxiosResponse } from "axios";
import { createClient } from "@supabase/supabase-js";
import { alertContext } from "../../contexts/alertContext";
import { locationContext } from "../../contexts/locationContext";
import {
  APIObjectType,
  NodeData,
  CritiqueNodeData,
  CritiqueNodeDataList,
  LiteratureNodeData,
  LiteratureNodeDataList,
  PersonaNodeData,
  RQNodeData,
  FieldName,
  TableData,
  HypotheticalAbstractResponse,
  ResearchScenarioResponse,
} from "../../types/api";
import { nodesWithDepthType } from "../../types/typesContext";
import { useAuth } from "../../contexts/authContext";
import { useUser } from "../../contexts/userContext";

export function useApi() {
  const { setErrorData } = useContext(alertContext);
  const { token, supabaseClient } = useAuth();
  const { isUsingSelfProvidedKey, encryptedCustomApiKey, customApiBaseUrl } = useUser();

  // Helper function for standardized API calls with error handling
  const apiCall = async <T>(
    url: string, 
    method: string, 
    data: any, 
    additionalHeaders: Record<string, string> = {}
  ): Promise<AxiosResponse<T>> => {
    // prepare headers
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
    };
    if (isUsingSelfProvidedKey) {
      headers["OPENAI-API-KEY"] = encryptedCustomApiKey;
      headers["OPENAI-BASE-URL"] = customApiBaseUrl;
    }

    // Merge additional headers, overriding existing ones if necessary
    const finalHeaders = { ...headers, ...additionalHeaders };

    try {
      const response = await axios({
        url,
        method,
        data,
        headers: finalHeaders,
      });
      return response;
    } catch (error: any) {
      if (error.response.status === 491) {
        setErrorData({
          title: error.response.data.error_type,
          list: [error.response.data.message],
        });
        throw error;
      }
        
      setErrorData({
        title: "Error",
        list: ["Sorry, the server is currently busy. Please try again later."],
      });
      throw error;
    }
  };

  // validate API key
  const validateApiKey = async (encryptedApiKey: string, apiBaseUrl: string): Promise<AxiosResponse<{ message: string }>> => {
    return apiCall(`/api/v1/block/validate_api_key`, "POST", {}, {
      "OPENAI-API-KEY": encryptedApiKey,
      "OPENAI-BASE-URL": apiBaseUrl,
    });
  };

  // quota check
  const getUserQuota = async (): Promise<AxiosResponse<{ quota_usage: string; quota_timestamp: string; refresh_in_seconds: number; quota_limit: number }>> => {
    return apiCall(`/api/v1/block/check_quota`, "GET", {});
  };

  // RQ Generation APIs
  const getNextAction = async (): Promise<AxiosResponse<APIObjectType>> => {
    return apiCall(`/api/v1/test_agent_think_once`, "POST", {});
  };

  const getDummySteps = async (): Promise<AxiosResponse<APIObjectType>> => {
    return apiCall(`/api/v1/generate_dummy_steps`, "POST", {});
  };

  const postAgentSingleStep = async (nodeData: NodeData): Promise<AxiosResponse<APIObjectType>> => {
    return apiCall(`/api/v1/get_next_step`, "POST", nodeData);
  };

  const postCopyNodeCheckpoints = async (
    src_node_id: string,
    tgt_node_ids: string[]
  ): Promise<AxiosResponse<APIObjectType> > => {
    return apiCall(
      `/api/v1/copy_node_checkpoints`, 
      "POST",
      {
        source_node_id: src_node_id,
        target_node_ids: tgt_node_ids,
      }
    );
  };

  // Paper Graph APIs
  const getGraphDemo = async (): Promise<
    AxiosResponse<
      Map<string, Map<string, Map<string, string>> | Map<string, number | string>>
    >
  > => {
    return apiCall(`/api/v1/graph/demo`, "GET", {});
  };

  const getRandomFilter = async (): Promise<
    AxiosResponse<Map<string, [string]>>
  > => {
    return apiCall(`/api/v1/graph/random_filter`, "GET", {});
  };

  const retrievePaperIds = async (
    query: string
  ): Promise<AxiosResponse<[string]>> => {
    return apiCall(
      `/api/v1/graph/retrieve_papers`, 
      "POST",
      {
        query: query,
      }
    );
  };

  // CoQuest Block APIs
  const getLitQuery = async (
    rqData: RQNodeData,
    personaData: PersonaNodeData[],
    ancestorNodes: nodesWithDepthType[]
  ): Promise<AxiosResponse<{ search_query: string; sub_queries: { sub_query: string }[] }[]>> => {
    return apiCall(
      `/api/v1/block/persona_to_lit_query`, 
      "POST",
      {
        rqNodeData: rqData,
        personaNodeData: personaData,
        ancestorNodesWithDepth: ancestorNodes,
      }
    );
  };

  const getPersonaCritique = async (
    rqData: RQNodeData,
    personaData: PersonaNodeData[],
    ancestorNodes: nodesWithDepthType[]
  ): Promise<AxiosResponse<string[]>> => {
    return apiCall(
      `/api/v1/block/persona_to_critique`, 
      "POST",
      {
        rqNodeData: rqData,
        personaNodeData: personaData,
        ancestorNodesWithDepth: ancestorNodes,
      }
    );
  };

  const getTableSuggestion = async (
    rqNodeData: RQNodeData,
    personaNodeData: PersonaNodeData,
    critiqueNodeData: CritiqueNodeData,
    literatureNodeDataList: LiteratureNodeDataList,
    ancestorNodes: nodesWithDepthType[],
    researchScenario: string[]
  ): Promise<AxiosResponse<Map<string, string>[]>> => {
    return apiCall( 
      `/api/v1/block/table_suggestion`, 
      "POST",
      {
        rqNodeData,
        personaNodeData,
        critiqueNodeData,
        literatureNodeDataList,
        ancestorNodesWithDepth: ancestorNodes,
        researchScenario,
      }
    );
  };

  const getAdditionalField = async (
    field: FieldName,
    rqNodeData: RQNodeData,
    personaNodeData: PersonaNodeData,
    critiqueNodeData: CritiqueNodeData,
    literatureNodeDataList: LiteratureNodeDataList,
    tableData: TableData,
    ancestorNodes: nodesWithDepthType[],
    researchScenario: string[]
  ): Promise<AxiosResponse<Map<string, string>>> => {
    return apiCall(     
      `/api/v1/block/add_field`, 
      "POST",
      {
        field,
        rqNodeData,
        personaNodeData,
        critiqueNodeData,
        literatureNodeDataList,
        tableData,
        ancestorNodesWithDepth: ancestorNodes,
        researchScenario,
      }
    );
  };

  const getHypotheticalAbstract = async (
    rqNodeData: RQNodeData,
    personaNodeData: PersonaNodeData,
    critiqueNodeData: CritiqueNodeData,
    literatureNodeDataList: LiteratureNodeDataList,
    tableData: TableData,
    ancestorNodes: nodesWithDepthType[],
    researchScenario: string[]
  ): Promise<AxiosResponse<HypotheticalAbstractResponse>> => {
    return apiCall(
      `/api/v1/block/generate_hypothetical_abstract`, 
      "POST",
      {
        rqNodeData,
        personaNodeData,
        critiqueNodeData,
        literatureNodeDataList,
        tableData,
        ancestorNodesWithDepth: ancestorNodes,
        researchScenario,
      }
    );
  };

  const getLiteratureReview = async (
    literatureNodeDataList: LiteratureNodeDataList,
    rqNodeData: RQNodeData,
    ancestorNodes: nodesWithDepthType[]
  ): Promise<AxiosResponse<Map<string, string>[]>> => {
    return apiCall(   
      `/api/v1/block/generate_literature_review`, 
      "POST",
      {
        literatureNodeDataList,
        rqNodeData,
        ancestorNodesWithDepth: ancestorNodes,
      }
    );
  };

  const getResearchScenarios = async (
    literatureNodeDataList: LiteratureNodeDataList,
    rqNodeData: RQNodeData,
    ancestorNodes: nodesWithDepthType[]
  ): Promise<AxiosResponse<ResearchScenarioResponse>> => {
    return apiCall(
      `/api/v1/block/generate_research_scenario`, 
      "POST",
      {
        literatureNodeDataList,
        rqNodeData,
        ancestorNodesWithDepth: ancestorNodes,
      }
    );
  };

  const getCritiqueRQ = async (
    rqData: RQNodeData,
    critiqueData: CritiqueNodeDataList
  ): Promise<AxiosResponse<string[]>> => {
    return apiCall(
      `/api/v1/block/critique_to_rq`, 
      "POST",
      {
        RQNodeData: rqData,
        critiqueNodeDataList: critiqueData,
      }
    );
  };

  const getRQPersona = async (
    rqData: RQNodeData,
    ancestorNodes: nodesWithDepthType[]
  ): Promise<AxiosResponse<string[]>> => {
    return apiCall(
      `/api/v1/block/rq_to_persona`, 
      "POST",
      {
        RQNodeData: rqData,
        ancestorNodesWithDepth: ancestorNodes,
        dummy: { dummy: "dummy_value" },
      }
    );
  };

  const getLitPersona = async (
    litDataList: LiteratureNodeDataList
  ): Promise<AxiosResponse<string[]>> => {
    return apiCall(
      `/api/v1/block/lit_to_persona`, 
      "POST",
      {
        literatureNodeDataList: litDataList,
      }
    );
  };

  // Paper Info APIs
  const getPaperInfoByDOI = async (
    doi: string
  ): Promise<AxiosResponse<LiteratureNodeData>> => {
    return apiCall(
      `/api/v1/paper_info/doi`,
      "POST",
      {
        doi,
      }
    );
  };

  const getPaperInfoSearch = async (
    text: string
  ): Promise<AxiosResponse<{ paper_list: LiteratureNodeDataList; query: string }>> => {
    return apiCall( 
      `/api/v1/paper_info/search`,
      "POST",
      {
        text,
        num_results: 20,
      }
    );
  };

  const getPersonaLitSearch = async (
    rqNodeData: RQNodeData,
    personaNodeData: PersonaNodeData[],
    query_text: { search_query: string; sub_queries: { sub_query: string }[] }
  ): Promise<AxiosResponse<{ paper_list: LiteratureNodeDataList; query: string }>> => {
    return apiCall(
      `/api/v1/block/persona_lit_search`,
      "POST",
      {
        rqNodeData,
        personaNodeData,
        search_query: {
          search_query: query_text.search_query,
          sub_queries: query_text.sub_queries,
          num_results: 10,
        },
      }
    );
  };

  // Logging APIs
  const saveLog = async (type: string, log_body: {}): Promise<void> => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const user = data.session?.user?.email;
    //   if (user) {
    //     await axios.post(`/api/v1/log/save`, {
    //       type,
    //       user,
    //       log_body: JSON.stringify(log_body),
    //     });
    //   } else {
    //     throw new Error("User not authenticated");
    //   }
    // } catch (error: any) {
    //   setErrorData({
    //     title: "Error",
    //     list: [error.message],
    //   });
    //   throw error;
    // }
      if (user) {
        await apiCall("/api/v1/log/save", "POST", {
          type,
          user,
          log_body: JSON.stringify(log_body),
        });
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error: any) {
      setErrorData({
        title: "Error",
        list: [error.message],
      });
      throw error;
    }
  };

  const getSessionId = async (): Promise<any> => {
    return apiCall(`/api/v1/log/check_session_id`, "GET", {});
  };

  // Example APIs
  const getExamples = async (): Promise<any[]> => {
    try {
      const url =
        "https://api.github.com/repos/logspace-ai/langflow_examples/contents/examples";
      const response = await apiCall(url, "GET", {});
      const jsonFiles = response.data.filter((file: any) => file.name.endsWith(".json"));

      const contentsPromises = jsonFiles.map(async (file: any) => {
        const contentResponse = await apiCall(file.download_url, "GET", {});
        return contentResponse.data;
      });

      return await Promise.all(contentsPromises);
    } catch (error: any) {
      setErrorData({
        title: "Error",
        list: [error.message],
      });
      throw error;
    }
  };

  const createGoogleDoc = async (data: {}, token?: string): Promise<any> => {
    return apiCall("/api/v1/create-google-doc", "POST", { data });
  };


  type NewsletterUser = {
    email: string;
    preferred_topics: string[];
    keywords: string[];
    familiarity: string;
    subscription_frequency: string;
  };
  // newsletter APIs
  const subscribeToNewsletter = async (data: NewsletterUser): Promise<any> => {
    return apiCall("/api/v1/block/subscribe_to_newsletter", "POST", data);
  };

  return {
    // validate API key
    validateApiKey,

    // quota check
    getUserQuota,
    
    // RQ Generation APIs
    getNextAction,
    getDummySteps,
    postAgentSingleStep,
    postCopyNodeCheckpoints,

    // Paper Graph APIs
    getGraphDemo,
    getRandomFilter,
    retrievePaperIds,

    // CoQuest Block APIs
    getLitQuery,
    getPersonaCritique,
    getTableSuggestion,
    getAdditionalField,
    getHypotheticalAbstract,
    getLiteratureReview,
    getResearchScenarios,
    getCritiqueRQ,
    getRQPersona,
    getLitPersona,

    // Paper Info APIs
    getPaperInfoByDOI,
    getPaperInfoSearch,
    getPersonaLitSearch,

    // Logging APIs
    saveLog,
    getSessionId,

    // Example APIs
    getExamples,
    createGoogleDoc,

    // newsletter APIs
    subscribeToNewsletter,
  };
}
