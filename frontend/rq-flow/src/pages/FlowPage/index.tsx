import { useCallback, useContext, useEffect, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  updateEdge,
  EdgeChange,
  Connection,
  Edge,
  Node,
  SelectionMode,
} from "reactflow"
import { locationContext } from "../../contexts/locationContext"
import ExtraSidebar from "./components/extraSidebarComponent"
// import Chat from "../../components/chatComponent";

import GenericNode from "../../CustomNodes/GenericNode"
import PersonaNode from "../../CustomNodes/PersonaNode"
import RQNode from "../../CustomNodes/RQNode"
import CritiqueNode from "../../CustomNodes/CritiqueNode"
import LiteratureNode from "../../CustomNodes/LiteratureNode"
import GroupNode from "../../CustomNodes/GroupNode"

import { InteractiveTutorialContext } from "../../contexts/InteractiveTutorialContext"
import { alertContext } from "../../contexts/alertContext"
import { TabsContext } from "../../contexts/tabsContext"
import { typesContext } from "../../contexts/typesContext"
import ConnectionLineComponent from "./components/ConnectionLineComponent"
import { FlowType, NodeType } from "../../types/flow"
import { APIClassType } from "../../types/api"
import { isValidConnection } from "../../utils"

// context menus
import ContextMenus from "../../ContextMenus"
import { contextMenuContext } from "../../contexts/contextMenuContext"

import RightPanel from "../../components/RightPanelComponent"

import { useApi } from "../../controllers/API"

import "./styles.css"
import { set } from "lodash"
import * as _ from "lodash"
import { Backdrop, Box, Button, Modal, Typography } from "@mui/material"
import InteractiveTooltip from "./components/InteractiveTutorialComponent/components/TutorialTooltipComponent"
import InteractiveTutorialComponent from "./components/InteractiveTutorialComponent"

const nodeTypes = {
  genericNode: GenericNode,
  RQNode: RQNode,
  PersonaNode: PersonaNode,
  CritiqueNode: CritiqueNode,
  LiteratureNode: LiteratureNode,
  group: GroupNode,
}

// var _ = require("lodash");

export default function FlowPage({ flow }: { flow: FlowType }) {
  const { saveLog } = useApi()
  const { setCenter } = useReactFlow()
  const snapGrid = [50, 50] as [number, number];

  let { updateFlow, incrementNodeId, hardReset } = useContext(TabsContext)
  const {
    types,
    reactFlowInstance,
    setReactFlowInstance,
    templates,
    getNodeAllAncestors,
  } = useContext(typesContext)
  const reactFlowWrapper = useRef(null)

  const { setExtraComponent, setExtraNavigation, isBlockMode, isMindMapMode } =
    useContext(locationContext)
  const { setErrorData } = useContext(alertContext)
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.data?.nodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.data?.edges ?? [])
  const { setViewport } = useReactFlow()
  const edgeUpdateSuccessful = useRef(true)

  const [isModalOpen, setIsModalOpen] = useState(false)

  // context for the context menus
  const {
    setIsNodeMenuOpen,
    setIsEdgeMenuOpen,
    setNodeContextMenuPostion,
    setEdgeContextMenuPostion,
    setContextMenuNode,
    // setContextMenuEdge,
    filterPaperIDs,
    setFilterPaperIDs,
    lockedPaperIDs,
    setLockedPaperIDs,
    setCurrentNode,
    currentNode,
    setCurrentEdge,
    currentEdge,
  } = useContext(contextMenuContext)

  const { searchParams } = useContext(locationContext)

  const {
    isInteractiveTutorialOpen,
    setIsInteractiveTutorialOpen,
    setIsInteractiveTutorialDone,
    currentStep,
    setCurrentStep,
    setTargetNodeIds,
  } = useContext(InteractiveTutorialContext)
  // if reset=true, reset the flow
  // useEffect(() => {
  //   if (searchParams.includes("reset=true")) {
  //     hardReset();
  //   }
  // }, []);

  // the current node selected
  // const [currentNode, setCurrentNode] = useState<Node | null>(null);

  useEffect(() => {
    if (reactFlowInstance?.toObject && flow) {
      flow.data = reactFlowInstance.toObject()
      updateFlow(flow)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])
  //update flow when tabs change
  useEffect(() => {
    setNodes(flow?.data?.nodes ?? [])
    setEdges(flow?.data?.edges ?? [])
    if (reactFlowInstance) {
      setViewport(flow?.data?.viewport ?? { x: 1, y: 0, zoom: 0.5 })
    }
  }, [flow, reactFlowInstance, setEdges, setNodes, setViewport])
  //set extra sidebar
  useEffect(() => {
    setExtraComponent(<ExtraSidebar />)
    setExtraNavigation({ title: "Components" })
  }, [setExtraComponent, setExtraNavigation])

  const onEdgesChangeMod = useCallback(
    (s: EdgeChange[]) => {
      onEdgesChange(s)
      setNodes((x) => {
        let newX = _.cloneDeep(x)
        return newX
      })
    },
    [onEdgesChange, setNodes],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, className: "animate-pulse" }, eds))
      setNodes((x) => {
        let newX = _.cloneDeep(x)
        return newX
      })
    },
    [setEdges, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      // Helper function to generate a unique node ID
      function getId() {
        return `dndnode_` + incrementNodeId()
      }

      // Get the current bounds of the ReactFlow wrapper element
      const reactflowBounds = reactFlowWrapper.current.getBoundingClientRect()

      // Extract the data from the drag event and parse it as a JSON object
      let data: { type: string; node?: APIClassType } = JSON.parse(
        event.dataTransfer.getData("json"),
      )

      // If data type is not "chatInput" or if there are no "chatInputNode" nodes present in the ReactFlow instance, create a new node
      if (
        data.type !== "chatInput" ||
        (data.type === "chatInput" &&
          !reactFlowInstance.getNodes().some((n) => n.type === "chatInputNode"))
      ) {
        // Calculate the position where the node should be created
        const position = reactFlowInstance.project({
          x: event.clientX - reactflowBounds.left,
          y: event.clientY - reactflowBounds.top,
        })

        // Generate a unique node ID
        let newId = getId()

        // Send to backend and create a new agent checkpoint?

        // Create a new node object
        let nodeType = data.type
        if (nodeTypes[nodeType] === undefined) {
          nodeType = "genericNode"
        }
        const newNode: NodeType = {
          id: newId,
          // type: "genericNode",
          type: nodeType,
          position,
          data: {
            ...data,
            id: newId,
            value: null,
            filterIDs: null,
            lockedIDs: [],
            userInput: null,
            valueDict: {},
            autoGenerated: data.type === "RQNode" ? false : undefined,
          },
        }

        // Add the new node to the list of nodes in state
        setNodes((nds) => nds.concat(newNode))

        // saveLog
        saveLog("drop_create_node", {
          node: newNode,
          searchParams: searchParams,
        })
      } else {
        // If a chat input node already exists, set an error message
        setErrorData({
          title: "Error creating node",
          list: ["There can't be more than one chat input."],
        })
      }
    },
    // Specify dependencies for useCallback
    [incrementNodeId, reactFlowInstance, setErrorData, setNodes],
  )

  const onDelete = (mynodes) => {
    setEdges(
      edges.filter(
        (ns) => !mynodes.some((n) => ns.source === n.id || ns.target === n.id),
      ),
    )

    // also reset the currentnode and context menu node
    setCurrentNode(null)
    setContextMenuNode(null)
  }

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (isValidConnection(newConnection, reactFlowInstance)) {
        edgeUpdateSuccessful.current = true
        setEdges((els) => updateEdge(oldEdge, newConnection, els))
      }
    },
    [],
  )

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
    }

    edgeUpdateSuccessful.current = true
  }, [])

  // const onEdgeContextMenu = (event: React.MouseEvent, edge: Edge) => {
  //     event.preventDefault();
  //     // console.log("edge context menu", edge);
  //     setEdgeContextMenuPostion({ x: event.clientX, y: event.clientY });
  //     setIsEdgeMenuOpen(true);
  //     setContextMenuEdge(edge);
  // };

  const onNodesSelectionContextMenu = (
    event: React.MouseEvent,
    nodes: Node[],
  ) => {
    event.preventDefault()
    // console.log("node context menu", node);

    setNodeContextMenuPostion({ x: event.clientX, y: event.clientY })
    setIsNodeMenuOpen(true)

    // set the context menu node to null to avoid confusion
    setContextMenuNode(null)

    // save log
    saveLog("OpenNodesSelectionContextMenu", {
      nodes_id: nodes.map((n) => n.id),
      nodes_data: nodes.map((n) => n.data),
      searchParams: searchParams,
    })
  }

  const onNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    // console.log("node context menu", node);

    setNodeContextMenuPostion({ x: event.clientX, y: event.clientY })
    setIsNodeMenuOpen(true)
    setContextMenuNode(node)

    // // save log
    // saveLog("OpenNodeContextMenu", {
    //   node_id: node.id,
    //   node_data: node.data,
    //   searchParams: searchParams,
    // })
  }

  const focusNode = (node: Node) => {
    const x = node.position.x + node.width / 2 + window.innerWidth / 4
    const y = node.position.y + node.height / 2 + 200
    const zoom = 0.5

    setCenter(x, y, { zoom, duration: 1000 })
  }
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    setCurrentNode(node)
    focusNode(node)

    // get and highlight all ancestors
    let ancestors = getNodeAllAncestors(node)
    console.log("ancestors: ", ancestors)

    // for (const ancestor of ancestors) {
    // }

    // save log
    saveLog("ClickNode", {
      node_id: node.id,
      node_data: node.data,
      searchParams: searchParams,
    })
  }

  const onPaneClickClearNodeSelection = (event: React.MouseEvent) => {
    // event.preventDefault();

    // if current node is not null, save log
    if (currentNode !== null) {
      saveLog("PaneClickClearNodeSelection", { searchParams: searchParams })
    }

    setCurrentNode(null)
    setCurrentEdge(null)
  }

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setCurrentEdge(edge)

    // console.log("edge click", currentEdge);

    // save log
    saveLog("ClickEdge", {
      edge_id: edge.id,
      edge_label: edge.label,
      edge_data: edge.data,
      searchParams: searchParams,
    })
  }

  // save log
  // saveLog(
  //   "PageLoad",
  //   {}
  // );
  useEffect(() => {
    if (currentStep === 13 && isInteractiveTutorialOpen) {
      setIsModalOpen(true)
    }
  })

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      {Object.keys(templates).length > 0 && Object.keys(types).length > 0 ? (
        <>
          {isInteractiveTutorialOpen && (
            <Backdrop
              sx={{
                color: "#fff",
                // zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={true}
            >
                            <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setIsInteractiveTutorialOpen(false)
                  setIsInteractiveTutorialDone(true)
                  setCurrentStep(0)
                  setTargetNodeIds([])
                }}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "#f50057", // Custom background color
                  color: "#fff", // Text color
                  padding: "8px 16px", // Padding for a larger button
                  borderRadius: "8px", // Rounded corners
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
                  '&:hover': {
                    backgroundColor: "#c51162", // Darker shade on hover
                  },
                  transition: "background-color 0.3s ease", // Smooth transition
                }}
              >
                Close Tutorial
              </Button>
            </Backdrop>
          )}

          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 600,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" gutterBottom>
                Congratulations!
              </Typography>
              <Typography variant="h6" gutterBottom>
                You have successfully completed the tutorial. Please navigate to
                the "New Flow" tab to continue.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsModalOpen(false)
                  setIsInteractiveTutorialOpen(false)
                  setIsInteractiveTutorialDone(true)
                  setCurrentStep(0)
                  setTargetNodeIds([])
                }}
              >
                Close
              </Button>
            </Box>
          </Modal>

          <ReactFlow
            nodes={nodes}
            onMove={() => {
              if (reactFlowInstance?.toObject) {
                updateFlow({ ...flow, data: reactFlowInstance.toObject() })
              }
            }}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChangeMod}
            onConnect={onConnect}
            onLoad={setReactFlowInstance}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            connectionLineComponent={ConnectionLineComponent}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodesDelete={onDelete}
            selectNodesOnDrag={false}
            // selectionOnDrag
            selectionMode={SelectionMode.Partial}
            // onEdgeContextMenu={onEdgeContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            onSelectionContextMenu={onNodesSelectionContextMenu}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClickClearNodeSelection}
            onEdgeClick={onEdgeClick}
            minZoom={0.1}
            snapToGrid={true}
            snapGrid={snapGrid}
          >
            <Background className="dark:bg-gray-900" />
            {!isInteractiveTutorialOpen && (
              <Controls
                className="[&>button]:text-black  [&>button]:dark:border-gray-600 [&>button]:dark:bg-gray-800 [&>button]:dark:fill-gray-400 [&>button]:dark:text-gray-400 hover:[&>button]:dark:bg-gray-700"
                fitViewOptions={{ duration: 1000 }}
              ></Controls>
            )}

            {isBlockMode && <RightPanel />}
            {/* Why wasnt RightPanel triggered before in the BlockMode? How is BlockMode different from the MindMapMode */}
            {/* {isBlockMode && <RightPanel />} */}
          </ReactFlow>
          <ContextMenus />
          {/* <Chat flow={flow} reactFlowInstance={reactFlowInstance} /> */}
        </>
      ) : (
        <></>
      )}
    </div>
  )
}
