import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react"
import ReactFlow, { Node, Edge } from "reactflow"

// var _ = require("lodash");
import * as _ from "lodash"
import { TabsContext } from "./tabsContext"
import { typesContext } from "./typesContext"
import { NodeDataType, NodeType } from "../types/flow"
import {
  APIClassType,
  CritiqueNodeData,
  NodeData,
  PersonaNodeData,
  RQNodeData,
} from "../types/api"
import {
  // getCritiqueRQ,
  // getLitPersona,
  // getLitQuery,
  // getPaperInfoSearch,
  // getPersonaLitSearch,
  // getPersonaCritique,
  // getRQPersona,
  // saveLog,
  useApi,
} from "../controllers/API"
import { locationContext } from "./locationContext"
import { alertContext } from "./alertContext"
import { formatPersonaData } from "../ContextMenus/utils"

type ContextMenuContextType = {
  isNodeMenuOpen: boolean
  setIsNodeMenuOpen: (value: boolean) => void
  isEdgeMenuOpen: boolean
  setIsEdgeMenuOpen: (value: boolean) => void
  edgeContextMenuPostion: { x: number; y: number }
  setEdgeContextMenuPostion: (value: { x: number; y: number }) => void
  nodeContextMenuPostion: { x: number; y: number }
  setNodeContextMenuPostion: (value: { x: number; y: number }) => void
  contextMenuNode: Node
  setContextMenuNode: (value: Node) => void
  // contextMenuEdge: Edge;
  // setContextMenuEdge: (value: Edge) => void;
  loadingStates: any
  setLoadingForNode: (nodeId: string, isLoading: boolean) => void
  filterPaperIDs: any
  setFilterPaperIDs: (value: any) => void
  lockedPaperIDs: any
  setLockedPaperIDs: (value: any) => void
  currentNode: Node
  setCurrentNode: (value: Node) => void
  currentEdge: Edge
  setCurrentEdge: (value: Edge) => void
  allPapers: any
  setAllPapers: (value: any) => void
  allEdges: any
  setAllEdges: (value: any) => void
  isUserStudy: boolean
  setIsUserStudy: (value: boolean) => void
  ratedNodes: Set<any>
  setRatedNodes: (value: Set<string>) => void
  setRatedNodesById: (value: string) => void
  createNodeAndConnect: (
    node_type: string,
    target_node_id: string,
    node_datas: any[],
    command_name: string,
  ) => [string[], Node[]]
  generatePersonaFromRQ: (node: Node) => Promise<void>
  generateLitNodesFromPersona: (node: Node) => Promise<void>
  generateCritiqueFromLiterature: (node: Node) => Promise<void>
  generateRQFromCritique: (node: Node) => Promise<void>
  generatePersonaFromLiterature: (node: Node) => Promise<void>
}

const ContextMenuContextInitialValue: ContextMenuContextType = {
  isNodeMenuOpen: false,
  setIsNodeMenuOpen: (value: boolean) => {},
  isEdgeMenuOpen: false,
  setIsEdgeMenuOpen: (value: boolean) => {},
  edgeContextMenuPostion: { x: 0, y: 0 },
  setEdgeContextMenuPostion: (value: { x: number; y: number }) => {},
  nodeContextMenuPostion: { x: 0, y: 0 },
  setNodeContextMenuPostion: (value: { x: number; y: number }) => {},
  contextMenuNode: {} as Node,
  setContextMenuNode: (value: Node) => {},
  // contextMenuEdge: {} as Edge,
  // setContextMenuEdge: (value: Edge) => {},
  loadingStates: {},
  setLoadingForNode: (nodeId: string, isLoading: boolean) => {},
  filterPaperIDs: null,
  setFilterPaperIDs: (value: any) => {},
  lockedPaperIDs: [],
  setLockedPaperIDs: (value: any) => {},
  currentNode: null as Node,
  setCurrentNode: (value: Node) => {},
  currentEdge: null as Edge,
  setCurrentEdge: (value: Edge) => {},
  allPapers: [],
  setAllPapers: (value: any) => {},
  allEdges: [],
  setAllEdges: (value: any) => {},
  isUserStudy: false,
  setIsUserStudy: (value: boolean) => {},
  ratedNodes: new Set(),
  setRatedNodes: (value: Set<String>) => {},
  setRatedNodesById: (value: string) => {},
  createNodeAndConnect: (
    node_type: string,
    target_node_id: string,
    node_datas: any[],
    command_name: string,
  ) => {
    return [[], []]
  },
  generatePersonaFromRQ: async (node: Node) => {},
  generateLitNodesFromPersona: async (node: Node) => {},
  generateCritiqueFromLiterature: async (node: Node) => {},
  generateRQFromCritique: async (node: Node) => {},
  generatePersonaFromLiterature: async (node: Node) => {},
}

export const contextMenuContext = createContext<ContextMenuContextType>(
  ContextMenuContextInitialValue,
)

export const ContextMenuContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const {
    getCritiqueRQ,
    getLitPersona,
    getLitQuery,
    getPaperInfoSearch,
    getPersonaLitSearch,
    getPersonaCritique,
    getRQPersona,
    saveLog,
  } = useApi()
  const [isNodeMenuOpen, setIsNodeMenuOpen] = useState(false)
  const [isEdgeMenuOpen, setIsEdgeMenuOpen] = useState(false)

  const [edgeContextMenuPostion, setEdgeContextMenuPostion] = useState({
    x: 0,
    y: 0,
  })
  const [nodeContextMenuPostion, setNodeContextMenuPostion] = useState({
    x: 0,
    y: 0,
  })

  const [contextMenuNode, setContextMenuNode] = useState(null)
  // const [contextMenuEdge, setContextMenuEdge] = useState({} as Edge);
  useEffect(() => {
    console.log("contextMenuNode: ", contextMenuNode)
  }, [contextMenuNode])

  const [loadingStates, setLoadingStates] = useState({})
  const setLoadingForNode = (nodeId, isLoading) => {
    setLoadingStates((prevStates) => ({
      ...prevStates,
      [nodeId]: isLoading,
    }))
  }

  const [filterPaperIDs, setFilterPaperIDs] = useState(null)
  const [lockedPaperIDs, setLockedPaperIDs] = useState(null)

  const [currentNode, setCurrentNode] = useState(null)
  const [currentEdge, setCurrentEdge] = useState(null)
  useEffect(() => {
    setContextMenuNode(currentNode)
    console.log("currentNode: ", currentNode)
  }, [currentNode])

  const [allPapers, setAllPapers] = useState([])
  const [allEdges, setAllEdges] = useState([])

  const [isUserStudy, setIsUserStudy] = useState(true)

  // a Set state, that keeps track of all nodes that have been rated
  const [ratedNodes, setRatedNodes] = useState(new Set())
  const setRatedNodesById = (nodeId: string) => {
    setRatedNodes((prevStates) => {
      const newSet = new Set(prevStates)
      newSet.add(nodeId)
      return newSet
    })
  }

  let { updateFlow, incrementNodeId } = useContext(TabsContext)
  let {
    addNodes,
    addEdges,
    templates,
    reactFlowInstance,
    getNodeAllAncestors,
  } = useContext(typesContext)
  const { searchParams, isBlockMode, isMindMapMode, conditionIndex } =
    useContext(locationContext)
  const { setErrorData } = useContext(alertContext)
  const NODETYPES = templates
  const createNodeAndConnect = (
    node_type: string = "genericNode",
    target_node_id: string = contextMenuNode.id,
    node_datas: any[],
    command_name: string,
  ) => {
    if (!reactFlowInstance) {
      console.error("reactFlowInstance not found")
      return [[], []]
    }

    let num = node_datas.length
    let node = reactFlowInstance
      .getNodes()
      .filter((n: Node) => n.id === target_node_id)[0]

    console.log("createRQNodesAndConnect: ")

    // Helper function to generate a unique node ID
    function getId() {
      return `dndnode_` + incrementNodeId()
    }

    let newNodes = [] as Node[]
    let newEdges = [] as Edge[]
    let nodeIDs = [] as string[]
    for (let i = 0; i < num; i++) {
      // Get the position of the target node
      const nodePosition = { ...node.position }
      // offset the position a bit
      nodePosition.x += 1000

      let gap = 500
      if (node_type === "LiteratureNode") {
        gap = 1000
      }
      nodePosition.y += i * gap - gap // increment y position by 300 for each node

      // Generate a unique node ID
      let newId = getId()
      nodeIDs.push(newId)

      // Create the new node
      if (node_type === "genericNode" || node_type === "RQNode") {
        let nodeData: NodeDataType = {
          node: {
            ..._.cloneDeep(NODETYPES["RQNode"]),
          } as unknown as APIClassType,
          type: "RQNode",
          id: newId,
          value: null,
          filterIDs: null,
          lockedIDs: contextMenuNode.data.lockedIDs, // inherit from parent node
          userInput: null,
          valueDict: {},
          autoGenerated: true,
        }
        // nodeData.value = texts[i];
        // nodeData.value = node_datas[i].rq_text;
        // nodeData.node.template.RQ.value = node_datas[i].rq_text;
        nodeData.userInput = node_datas[i].rq_text
        let newNode = {
          id: newId,
          type: "RQNode",
          position: nodePosition,
          data: {
            ...nodeData,
          },
        }

        newNodes.push(newNode)
      } else if (node_type === "PersonaNode") {
        let nodeData: NodeDataType = {
          node: {
            ..._.cloneDeep(NODETYPES["PersonaNode"]),
          } as unknown as APIClassType,
          type: "PersonaNode",
          id: newId,
          value: null,
          filterIDs: null,
          lockedIDs: contextMenuNode.data.lockedIDs, // inherit from parent node
          userInput: null,
          valueDict: {},
        }
        nodeData.node.template.persona_name.value = node_datas[i].persona_name
        // nodeData.node.template.persona_description.value =
        //   node_datas[i].persona_description;
        nodeData.node.template.roleTasks =
          node_datas[i].persona_description["role_fields"] || []
        nodeData.node.template.background =
          node_datas[i].persona_description["background_fields"] || []
        let newNode = {
          id: newId,
          type: "PersonaNode",
          position: nodePosition,
          data: {
            ...nodeData,
          },
        }

        newNodes.push(newNode)
      } else if (node_type === "CritiqueNode") {
        let nodeData: NodeDataType = {
          node: {
            ..._.cloneDeep(NODETYPES["CritiqueNode"]),
          } as unknown as APIClassType,
          type: "CritiqueNode",
          id: newId,
          value: null,
          filterIDs: null,
          lockedIDs: contextMenuNode.data.lockedIDs, // inherit from parent node
          userInput: null,
          valueDict: {},
        }
        nodeData.node.template.critique_aspect.value =
          node_datas[i].critique_aspect
        nodeData.node.template.critique_detail.value =
          node_datas[i].critique_detail
        let newNode = {
          id: newId,
          type: "CritiqueNode",
          position: nodePosition,
          data: {
            ...nodeData,
          },
        }

        newNodes.push(newNode)
      } else if (node_type === "LiteratureNode") {
        let nodeData: NodeDataType = {
          node: {
            ..._.cloneDeep(NODETYPES["LiteratureNode"]),
          } as unknown as APIClassType,
          type: "LiteratureNode",
          id: newId,
          value: null,
          filterIDs: null,
          lockedIDs: contextMenuNode.data.lockedIDs, // inherit from parent node
          userInput: null,
          valueDict: {},
        }
        nodeData.node.template.paper_list.name = node_datas[i].query
        nodeData.node.template.paper_list.value = node_datas[i].paper_list
        let newNode = {
          id: newId,
          type: "LiteratureNode",
          position: nodePosition,
          data: {
            ...nodeData,
          },
        }

        newNodes.push(newNode)
      }

      // create an edge between the target node and the new node
      let params = {
        source: node.id,
        sourceHandle: `RQ Node|${node.id}|RQNode`,
        target: newId,
        targetHandle: `RQNode|llm|${newId}`,
        labelStyle: {
          fill: "orange",
          fontWeight: 700,
          // "fontSize": 12,
        },
        id: `edge_${node.id}_${newId}`,
        // "edgeUpdaterRadius": 0,
        // "data": {
        //     "command_results": command_result,
        // },
        // type: "smoothstep",
      }
      let newEdge: Edge = {
        ...params,
        // className: "animate-pulse",
      } as unknown as Edge
      newEdges.push(newEdge)
    }

    // add the new nodes and edges to the flow
    addNodes(newNodes)
    addEdges(newEdges)

    setIsNodeMenuOpen(false)

    // save log, but with a delay to ensure the new nodes are added to the flow
    setTimeout(() => {
      saveLog("CreateNodeAndConnect", {
        node_type: node_type, // "PersonaNode", "CritiqueNode
        target_node_id: target_node_id,
        node_datas: node_datas,
        command_name: command_name,
        flow_snapshot: reactFlowInstance.toObject(),
        searchParams: searchParams,
      })
    }, 1000)

    return [nodeIDs, newNodes]
  }
  // This function can be conducted on a RQNode, and it will generate a best-fit persona based on the RQ
  // and create a new PersonaNode with the persona
  const _generatePersonaFromRQ = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const rq_data = {
      rq_text: node.data.userInput,
    } as RQNodeData

    setLoadingForNode(node.id, true)
    // get all ancestor nodes with depth
    const ancestorNodesWithDepth = getNodeAllAncestors(node)
    await getRQPersona(rq_data, ancestorNodesWithDepth)
      .then((result) => {
        console.log("getCritiqueRQ: ", result.data)

        // create a new node, and fill the value with the critique
        let [newNodeIDs, newNodes] = createNodeAndConnect(
          "PersonaNode",
          node.id,
          result.data,
          "None",
        )
      })
      .catch((error) => {
        console.log("getPersonaCritique: ", error)
      })
      .finally(() => {
        setLoadingForNode(node.id, false)
      })
  }
  // the following are two variations of the above function, but one generates a generic persona, and the other copies the closest ancestor persona
  const _generateGenericPersona = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const rq_data = {
      rq_text: node.data.userInput,
    } as RQNodeData

    setLoadingForNode(node.id, true)

    // time delay for loading
    setTimeout(() => {
      let [newNodeIDs, newNodes] = createNodeAndConnect(
        "PersonaNode",
        node.id,
        [
          {
            persona_name: "Helpful Researcher",
            persona_description: {
              role_fields: [
                {
                  key: "Role",
                  value:
                    "A helpful researcher with general knowledge about scientific research.",
                  default: true,
                },
                {
                  key: "Goal",
                  value:
                    "This persona aims to assist your peer to brainstorm and refine ideas.",
                  default: true,
                },
              ],
              background_fields: [
                {
                  key: "Domain",
                  value: "All fields.",
                  default: true,
                },
              ],
            },
          },
        ],
        "None",
      )
      setLoadingForNode(node.id, false)
    }, 1000)
  }
  const _generatePersonaFromRQClosestAncestor = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const rq_data = {
      rq_text: node.data.userInput,
    } as RQNodeData

    setLoadingForNode(node.id, true)

    let ancestorNodesWithDepth = getNodeAllAncestors(node)
    let ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
    let ancestorPersonaNodes = ancestorNodes.filter(
      (node) => node.data.type === "PersonaNode",
    )

    if (ancestorPersonaNodes.length === 0) {
      console.log("no persona node found, generating new persona")
      getRQPersona(rq_data, ancestorNodesWithDepth)
        .then((result) => {
          console.log("getCritiqueRQ: ", result.data)

          // create a new node, and fill the value with the critique
          let [newNodeIDs, newNodes] = createNodeAndConnect(
            "PersonaNode",
            node.id,
            result.data,
            "None",
          )
        })
        .catch((error) => {
          console.log("getPersonaCritique: ", error)
        })
        .finally(() => {
          setLoadingForNode(node.id, false)
        })
      return
    }

    // time delay for loading
    setTimeout(() => {
      let personaData: PersonaNodeData[] = []
      if (ancestorPersonaNodes[0].type === "group") {
        // if the current node is a group node
        // TODO
        setErrorData({
          title: "persona generation for group nodes is not supported yet.",
        })
        return
      } else {
        personaData = personaData.concat({
          persona_name:
            ancestorPersonaNodes[0].data.node.template.persona_name.value,
          persona_description: {
            role_fields: ancestorPersonaNodes[0].data.node.template.roleTasks,
            background_fields:
              ancestorPersonaNodes[0].data.node.template.background,
          },
        })
      }

      // create a new node, and fill the value with the critique
      let [newNodeIDs, newNodes] = createNodeAndConnect(
        "PersonaNode",
        node.id,
        personaData,
        "None",
      )
      setLoadingForNode(node.id, false)
    }, 1000)
  }
  // a function that routes the correct persona generation function based on router url search params
  const generatePersonaFromRQ = async (node: Node) => {
    if (conditionIndex === 0) {
      await _generateGenericPersona(node)
    } else if (conditionIndex === 1) {
      await _generatePersonaFromRQClosestAncestor(node)
    } else {
      await _generatePersonaFromRQ(node)
    }
  }

  // This function takes text queries, and generate new literature nodes based on the queries
  const _generateLitNodesFromQueries = (queries: string[], subQueries: { sub_query: string }[][], node: Node, rqNodeData: RQNodeData, personaData: PersonaNodeData[]) => {
    let newNodesData: any[] = []
    // pack the queries and subQueries into a search query object
    let searchQueries = queries.map((query, index) => ({
      search_query: query,
      sub_queries: subQueries[index],
    }))
    let queriesPromises = searchQueries.map((query) => getPersonaLitSearch(rqNodeData, personaData, query))
    Promise.all(queriesPromises)
      .then((results) => {
        let paperSeen = new Set()
        results.forEach((result) => {
          console.log("getPersonaLitSearch: ", result.data)
          // deduplicate paper IDs
          let paperListDedup = result.data.paper_list.filter((paper) => {
            if (paperSeen.has(paper.title)) {
              return false
            }
            paperSeen.add(paper.title)
            return true
          })

          // create a new node, and fill the value with the critique
          newNodesData.push({
            paper_list: paperListDedup,
            query: result.data.query,
          })
        })
      })
      .finally(() => {
        // clean newNodesData
        newNodesData = newNodesData.filter((item) => item.paper_list.length > 0)

        let [newNodeIDs, newNodes] = createNodeAndConnect(
          "LiteratureNode",
          node.id,
          newNodesData,
          "generateLitNodesFromQueries",
        )
        setLoadingForNode(node.id, false)
      })
  }
  // This function can be conducted on a PersonaNode, and it will generate a literature search based on the persona
  // and create new LiteratureNodes with the literature search results
  const generateLitNodesFromPersona = async (node: Node) => {
    setIsNodeMenuOpen(false)

    // const incomer_nodes = getIncomers(contextMenuNode, reactFlowInstance.getNodes(), reactFlowInstance.getEdges());
    // const incomer_rq_nodes = incomer_nodes.filter((node: Node) => node.data.type === "RQNode");

    const ancestorNodesWithDepth = getNodeAllAncestors(node)
    const ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
    const ancestorRQNodes = ancestorNodes.filter(
      (node) => node.data.type === "RQNode",
    )

    if (ancestorRQNodes.length === 0) {
      console.log("no rq node found")
      setErrorData({
        title:
          "No RQ node found. Please connect a RQ node to the persona node first.",
      })
      return
    }
    const rqNode = ancestorRQNodes[0]
    const rqData = {
      rq_text: rqNode.data.userInput,
    } as NodeData

    let personaData: PersonaNodeData[] = []
    if (node.type === "group") {
      // if the current node is a group node
      // TODO
      setErrorData({
        title: "literature search for group nodes is not supported yet.",
      })
      return
    } else {
      // if the current node is not a group node
      node.data.node.template.persona_description.value =
        formatPersonaData(node)
      personaData = personaData.concat({
        persona_name: node.data.node.template.persona_name.value,
        persona_description: node.data.node.template.persona_description.value,
      })
    }

    setLoadingForNode(node.id, true)
    await getLitQuery(rqData, personaData, ancestorNodesWithDepth)
      .then((result) => {
        console.log("getLitQuery: ", result.data) // [{'search_query': '...'}, ...]

        // TODO: based on the query, use search papers API to retrieve paper IDs, and create new LiteratureNodes
        const queries = result.data.map((item) => item.search_query)
        const subQueries = result.data.map((item) => item.sub_queries)
        _generateLitNodesFromQueries(queries, subQueries, node, rqData, personaData)
      })
      .catch((error) => {
        console.log("getLitQuery: ", error)
      })
      .finally(() => {
        // setLoadingForNode(contextMenuNode.id, false);
      })
  }
  // This function can be conducted on a LiteratureNode, and it will generate a critique based on the literature + a Persona node in context
  // check if the node's ancestors contain a PersonaNode, if not prompt the user to connect a PersonaNode
  const generateCritiqueFromLiterature = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const literatureData = node.data.node.template.paper_list.value.filter(
      (item) => typeof item === "object" && item !== null,
    )

    const ancestorNodesWithDepth = getNodeAllAncestors(node)
    const ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
    const ancestorPersonaNodes = ancestorNodes.filter(
      (node) => node.data.type === "PersonaNode",
    )

    // include self as a ancestor node, with depth=1 as the first of the list
    ancestorNodesWithDepth.unshift({
      node: node,
      depth: 1,
    })

    if (ancestorPersonaNodes.length === 0) {
      console.log("no persona node found")
      setErrorData({
        title:
          "No Persona node found. Please connect a Persona node to the literature node first.",
      })
      return
    }

    let personaData: PersonaNodeData[] = []
    if (ancestorPersonaNodes[0].type === "group") {
      // if the current node is a group node
      // TODO
      setErrorData({
        title: "critique generation for group nodes is not supported yet.",
      })
      return
    } else {
      // if the current node is not a group node
      ancestorPersonaNodes[0].data.node.template.persona_description.value =
        formatPersonaData(ancestorPersonaNodes[0])
      personaData = personaData.concat({
        persona_name:
          ancestorPersonaNodes[0].data.node.template.persona_name.value,
        persona_description:
          ancestorPersonaNodes[0].data.node.template.persona_description.value,
      })
    }

    let rqNode: NodeType | null = null
    let rqData: NodeData = {} as NodeData
    const ancestorRQNodes = ancestorNodes.filter(
      (node) => node.data.type === "RQNode",
    )
    if (ancestorRQNodes.length > 0) {
      rqNode = ancestorRQNodes[0]
    } else {
      console.log("no rq node found")
      setErrorData({
        title:
          "No RQ node found. Please connect a RQ node to the literature node first.",
      })
      return
    }
    if (rqNode) {
      rqData = {
        rq_text: rqNode.data.userInput,
      } as NodeData
    } else {
      console.log("RQ node is null")
      setErrorData({
        title:
          "No RQ node found. Please connect a RQ node to the literature node first.",
      })
      return
    }

    setLoadingForNode(node.id, true)
    await getPersonaCritique(rqData, personaData, ancestorNodesWithDepth)
      .then((result) => {
        console.log("getPersonaCritique: ", result.data)

        // create a new node, and fill the value with the critique
        let [newNodeIDs, newNodes] = createNodeAndConnect(
          "CritiqueNode",
          node.id,
          result.data,
          "None",
        )
      })
      .catch((error) => {
        console.log("getPersonaCritique: ", error)
      })
      .finally(() => {
        setLoadingForNode(node.id, false)
      })
  }
  // This function can be conducted on a CritiqueNode, and it will generate a RQ based on the critique
  // and create a new RQNode with the RQ
  const generateRQFromCritique = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const critiqueData: CritiqueNodeData = {
      critique_aspect: node.data.node.template.critique_aspect.value,
      critique_detail: node.data.node.template.critique_detail.value,
    }

    // const incomer_nodes = getIncomers(contextMenuNode, reactFlowInstance.getNodes(), reactFlowInstance.getEdges());
    // const incomer_rq_nodes = incomer_nodes.filter((node: Node) => node.data.type === "RQNode");

    const ancestorNodesWithDepth = getNodeAllAncestors(node)
    const ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
    const ancestorRQNodes = ancestorNodes.filter(
      (node) => node.data.type === "RQNode",
    )

    if (ancestorRQNodes.length === 0) {
      console.log("no rq node found")
      setErrorData({
        title:
          "No RQ node found. Please connect a RQ node to the critique node first.",
      })
      return
    }
    const rq_node = ancestorRQNodes[0]
    const rq_data = {
      rq_text: rq_node.data.userInput,
    } as NodeData

    setLoadingForNode(node.id, true)
    await getCritiqueRQ(rq_data, [critiqueData])
      .then((result) => {
        console.log("getCritiqueRQ: ", result.data)

        // create a new node, and fill the value with the critique
        let [newNodeIDs, newNodes] = createNodeAndConnect(
          "RQNode",
          node.id,
          result.data,
          "None",
        )
      })
      .catch((error) => {
        console.log("getPersonaCritique: ", error)
      })
      .finally(() => {
        setLoadingForNode(node.id, false)
      })
  }
  // This function can be conducted on a LiteratureNode, and it will generate best-fit personas based on the RQ
  // and create new PersonaNodes with the personas
  const _generatePersonaFromLiterature = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const literatureData = node.data.node.template.paper_list.value.filter(
      (item) => typeof item === "object" && item !== null,
    )

    setLoadingForNode(node.id, true)
    await getLitPersona(literatureData)
      .then((result) => {
        console.log("getCritiqueRQ: ", result.data)

        // create a new node, and fill the value with the critique
        let [newNodeIDs, newNodes] = createNodeAndConnect(
          "PersonaNode",
          node.id,
          result.data,
          "None",
        )
      })
      .catch((error) => {
        console.log("getPersonaCritique: ", error)
      })
      .finally(() => {
        setLoadingForNode(node.id, false)
      })
  }
  // The following is a variation of the above function, but it copies the closest ancestor persona
  const _generatePersonaFromLiteratureClosestAncestor = async (node: Node) => {
    setIsNodeMenuOpen(false)

    const literatureData = node.data.node.template.paper_list.value.filter(
      (item) => typeof item === "object" && item !== null,
    )

    const ancestorNodesWithDepth = getNodeAllAncestors(node)
    const ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
    const ancestorPersonaNodes = ancestorNodes.filter(
      (node) => node.data.type === "PersonaNode",
    )

    if (ancestorPersonaNodes.length === 0) {
      console.log("no persona node found, generating new persona")
      await getLitPersona(literatureData)
        .then((result) => {
          console.log("getCritiqueRQ: ", result.data)

          // create a new node, and fill the value with the critique
          let [newNodeIDs, newNodes] = createNodeAndConnect(
            "PersonaNode",
            node.id,
            result.data,
            "None",
          )
        })
        .catch((error) => {
          console.log("getPersonaCritique: ", error)
        })
        .finally(() => {
          setLoadingForNode(node.id, false)
        })
      return
    }

    let personaData: PersonaNodeData[] = []
    if (ancestorPersonaNodes[0].type === "group") {
      // if the current node is a group node
      // TODO
      setErrorData({
        title: "persona generation for group nodes is not supported yet.",
      })
      return
    } else {
      // if the current node is not a group node
      personaData = personaData.concat({
        persona_name:
          ancestorPersonaNodes[0].data.node.template.persona_name.value,
        persona_description: {
          role_fields: ancestorPersonaNodes[0].data.node.template.roleTasks,
          background_fields:
            ancestorPersonaNodes[0].data.node.template.background,
        },
      })
    }

    setLoadingForNode(node.id, true)

    // time delay for loading
    setTimeout(() => {
      // create a new node, and fill the value with the critique
      let [newNodeIDs, newNodes] = createNodeAndConnect(
        "PersonaNode",
        node.id,
        personaData,
        "None",
      )
      setLoadingForNode(node.id, false)
    }, 1000)
  }
  // a function that routes the correct persona generation function based on router url search params
  const generatePersonaFromLiterature = async (node: Node) => {
    if (conditionIndex === 0) {
      await _generateGenericPersona(node)
    } else if (conditionIndex === 1) {
      await _generatePersonaFromLiteratureClosestAncestor(node)
    } else {
      await _generatePersonaFromLiterature(node)
    }
  }

  return (
    <contextMenuContext.Provider
      value={{
        isNodeMenuOpen: isNodeMenuOpen,
        setIsNodeMenuOpen: setIsNodeMenuOpen,
        isEdgeMenuOpen: isEdgeMenuOpen,
        setIsEdgeMenuOpen: setIsEdgeMenuOpen,
        edgeContextMenuPostion: edgeContextMenuPostion,
        setEdgeContextMenuPostion: setEdgeContextMenuPostion,
        nodeContextMenuPostion: edgeContextMenuPostion,
        setNodeContextMenuPostion: setEdgeContextMenuPostion,
        contextMenuNode: contextMenuNode,
        setContextMenuNode: setContextMenuNode,
        // contextMenuEdge: contextMenuEdge,
        // setContextMenuEdge: setContextMenuEdge,
        loadingStates,
        setLoadingForNode,
        filterPaperIDs,
        setFilterPaperIDs,
        lockedPaperIDs,
        setLockedPaperIDs,
        currentNode,
        setCurrentNode,
        currentEdge,
        setCurrentEdge,
        allPapers,
        setAllPapers,
        allEdges,
        setAllEdges,
        isUserStudy,
        setIsUserStudy,
        ratedNodes,
        setRatedNodes,
        setRatedNodesById,
        createNodeAndConnect,
        generatePersonaFromRQ,
        generateLitNodesFromPersona,
        generateCritiqueFromLiterature,
        generateRQFromCritique,
        generatePersonaFromLiterature,
      }}
    >
      {children}
    </contextMenuContext.Provider>
  )
}
