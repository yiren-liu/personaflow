import { useContext, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowInstance,
  ReactFlowProvider,
  useStore,
  useNodesState,
  useEdgesState,
  getIncomers,
} from "reactflow";

import NodeContextMenuComponent from "./components/NodeContextMenuComponent";
import { typesContext } from "../contexts/typesContext";
import { contextMenuContext } from "../contexts/contextMenuContext";
import { TabsContext } from "../contexts/tabsContext";

import { NodeDataType, NodeType } from "../types/flow";
import {
  APIClassType,
  CritiqueNodeData,
  NodeData,
  PersonaNodeData,
  RQNodeData,
} from "../types/api";

import { locationContext } from "../contexts/locationContext";

import {
  // saveLog,
  // getPersonaCritique,
  // getCritiqueRQ,
  // getRQPersona,
  // getLitPersona,
  // getLitQuery,
  // getPaperInfoSearch,
  useApi,
} from "../controllers/API";
import ErrorAlert from "../alerts/error";
import { alertContext } from "../contexts/alertContext";

import { createAndGroupNodes, ungroupNodes } from "./grouping_utils";

// import NODETYPES from "../contexts/types/rqgen_types.json"

// var _ = require("lodash");
import * as _ from "lodash";
import { formatPersonaData } from "./utils";

export default function ContextMenus({}: {}) {
  const {
    saveLog,
    getPersonaCritique,
    getCritiqueRQ,
    getRQPersona,
    getLitPersona,
    getLitQuery,
    getPaperInfoSearch,
  } = useApi();
  const {
    types,
    templates,
    deleteNode,
    deleteNodes,
    addNodes,
    addEdges,
    updateNodes,
    reactFlowInstance,
    getSelectedNodes,
    getNodeAllAncestors,
  } = useContext(typesContext);
  let { updateFlow, incrementNodeId } = useContext(TabsContext);
  const { setErrorData } = useContext(alertContext);

  // const [edgeContextMenuPostion, setEdgeContextMenuPostion] = useState({ x: 0, y: 0 });
  // const [nodeContextMenuPostion, setNodeContextMenuPostion] = useState({ x: 0, y: 0 });
  // const [isOpen, setIsOpen] = useState(false);
  // const [ , setEdges, ] = useEdgesState(edges);

  const {
    isNodeMenuOpen,
    setIsNodeMenuOpen,
    isEdgeMenuOpen,
    setIsEdgeMenuOpen,
    edgeContextMenuPostion,
    setEdgeContextMenuPostion,
    nodeContextMenuPostion,
    setNodeContextMenuPostion,
    contextMenuNode,
    setContextMenuNode,
    // contextMenuEdge, setContextMenuEdge,
    loadingStates,
    setLoadingForNode,
    filterPaperIDs,
    setFilterPaperIDs,
    createNodeAndConnect,
    generatePersonaFromRQ,
  } = useContext(contextMenuContext);

  const { searchParams, isBlockMode, isMindMapMode, conditionIndex } =
    useContext(locationContext);

  const NODETYPES = templates;

  // const deleteEdge = () => {
  //     removeEdge(edge.id);
  //     setIsOpen(false);
  // };
  const removeContextMenuNode = () => {
    if (contextMenuNode.type === "group") {
      // if the current node is a group node
      // findout the child nodes, and then delete nodes including the group node
      let nodes = reactFlowInstance.getNodes();
      let childNodes = nodes.filter(
        (node) => node.parentNode === contextMenuNode.id,
      );
      let childNodeIDs = childNodes.map((node) => node.id);

      removeNodesById(childNodeIDs.concat(contextMenuNode.id));

      setIsNodeMenuOpen(false);
      setContextMenuNode(null);
      return;
    }

    removeNodesById([contextMenuNode.id]);
    setIsNodeMenuOpen(false);
    setContextMenuNode(null);
  };
  const removeNodesById = (nodeIDs: string[]) => {
    let nodesToDelete = [];

    // check if the node is a group node, if so, remove the child nodes first
    let nodes = reactFlowInstance.getNodes();
    let groupNodes = nodes.filter((node) => node.type === "group");
    let groupNodeIDs = groupNodes.map((node) => node.id);
    let groupNode = groupNodes.filter((node) => nodeIDs.includes(node.id));
    if (groupNode.length > 0) {
      let childNodes = nodes.filter((node) =>
        groupNodeIDs.includes(node.parentNode),
      );
      let childNodeIDs = childNodes.map((node) => node.id);
      // deleteNodes(childNodeIDs);
      nodesToDelete = nodesToDelete.concat(childNodeIDs);
      console.log("removeNodesById: ", childNodeIDs);
    }

    // console.log("removeNodesById: ", nodeIDs);
    // deleteNodes(nodeIDs);
    nodesToDelete = nodesToDelete.concat(nodeIDs);
    deleteNodes(nodesToDelete);

    saveLog("RemoveNodes", {
      nodeIDs: nodeIDs,
      flow_snapshot: reactFlowInstance.toObject(),
      searchParams: searchParams,
    });
  };



  // functions for grouping
  const groupNodes = () => {
    function getId() {
      return `groupnode_` + incrementNodeId();
    }
    let selectedNodes = getSelectedNodes();

    // check for grouping constraints
    let nodeTypes = selectedNodes.map((node) => node.data.type);
    let nodeTypeSet = new Set(nodeTypes);
    if (nodeTypeSet.size > 1) {
      setErrorData({
        title: "Grouping failed. Please select nodes of the same type.",
      });
      setIsNodeMenuOpen(false);
      return;
    }
    // check if the node type is PersonaNode
    if (!nodeTypeSet.has("PersonaNode")) {
      setErrorData({
        title: "Grouping failed. You can only group Persona Nodes.",
      });
      setIsNodeMenuOpen(false);
      return;
    }

    let [parentNode, childNodes] = createAndGroupNodes(selectedNodes, getId());
    // addNodes([parentNode]);
    // reactFlowInstance.setNodes((nodes) => nodes.concat([parentNode]));

    // update the parent node id for the child nodes
    reactFlowInstance.setNodes((nodes) => {
      return nodes
        .map((n) => {
          if (childNodes.map((node) => node.id).includes(n.id)) {
            n = childNodes.filter((node) => node.id === n.id)[0];
          }
          return n;
        })
        .concat([parentNode]);
    });

    console.log(
      "grouping nodes: ",
      selectedNodes.map((node) => node.id),
    );
    console.log("grouping parentNode: ", parentNode);
    setIsNodeMenuOpen(false);
  };

  // initialize the context menu actions
  let acts: { label: string; effect: () => void }[] = [];
  acts = [{ label: "Delete", effect: removeContextMenuNode }];

  // if current selected node contains multiple RQs, add a quick action to group them
  let selectedNodes = getSelectedNodes();
  if (selectedNodes?.length > 1) {
    acts = [
      {
        label: "Group",
        effect: () => {
          groupNodes();
        },
      },
      {
        label: "Delete",
        effect: () => {
          removeNodesById(selectedNodes.map((node) => node.id));
          setIsNodeMenuOpen(false);
        },
      },
    ];
  }

  // TODO: functions for a group node
  if (contextMenuNode?.type === "group") {
    acts = [
      {
        label: "Ungroup",
        effect: () => {
          let nodes = reactFlowInstance.getNodes();
          let childNodes = nodes.filter(
            (node) => node.parentNode === contextMenuNode.id,
          );
          let newChildNodes = ungroupNodes(contextMenuNode, childNodes);

          // cannot do this, need to manually update the nodes
          // updateNodes(newChildNodes);
          // deleteNodes([contextMenuNode.id]);

          reactFlowInstance.setNodes((nodes) => {
            let newNodes = nodes.map((n) => {
              if (newChildNodes.map((node) => node.id).includes(n.id)) {
                n = newChildNodes.filter((node) => node.id === n.id)[0];
              }
              return n;
            });
            newNodes = newNodes.filter((n) => n.id !== contextMenuNode.id);
            return newNodes;
          });

          setIsNodeMenuOpen(false);
        },
      },
      ...acts,
    ];
  }

  // add actions for specific node types
  // if (contextMenuNode?.data?.type === "PersonaNode") {
  //   acts = [
  //     {
  //       label: "Find Relevant Literatures",
  //       effect: generateLitNodesFromPersona,
  //     },
  //     // { label: "Generate Critique", effect: generateCritiqueFromPersona },
  //     ...acts,
  //   ];
  // } else if (contextMenuNode?.data?.type === "CritiqueNode") {
  //   acts = [{ label: "Generate RQ", effect: generateRQFromCritique }, ...acts];
  // } else if (contextMenuNode?.data?.type === "RQNode") {
  //   acts = [
  //     // determine which persona generation method to use based on the condition
  //     { label: "Generate Personas", effect: ()=>{generatePersonaFromRQ(contextMenuNode)} },
  //     ...acts,
  //   ];
  // } else if (contextMenuNode?.data?.type === "LiteratureNode") {
  //   acts = [
  //     { label: "Generate Critique", effect: generateCritiqueFromLiterature },
  //     { label: "Generate Personas", effect: () => {
  //       if (conditionIndex === 0) {
  //         generateGenericPersona();
  //       } else if (conditionIndex === 1) {
  //         generatePersonaFromLiteratureClosestAncestor();
  //       } else {
  //         generatePersonaFromLiterature();
  //       }
  //     }},
  //     ...acts,
  //   ];
  // }

  return (
    <div>
      <NodeContextMenuComponent
        isOpen={isNodeMenuOpen}
        position={nodeContextMenuPostion}
        onMouseLeave={() => setIsNodeMenuOpen(false)}
        actions={acts}
      />
    </div>
  );
}
