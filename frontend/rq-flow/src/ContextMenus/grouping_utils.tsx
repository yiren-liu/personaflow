import { createContext, ReactNode, useEffect, useState } from "react";
import { Edge, Node } from "reactflow";
import { getNodesBounds, ReactFlowInstance } from "reactflow";
import { NodeType } from "../types/flow";

import * as _ from "lodash";

const _createGroupNode = (
  childNodes: Node[],
  parentNodeId: string,
): [NodeType, Node[]] => {
  const bounds = getNodesBounds(childNodes);
  const padding = 20;

  const newNode: NodeType = {
    id: parentNodeId,
    type: "group",
    position: { x: bounds.x, y: bounds.y },
    data: {
      label: "Group",
      node: {
        base_classes: ["GroupNode"],
        description: "Group Node",
        template: _.cloneDeep(childNodes[0].data.node.template),
      },
      type: childNodes[0].data.type, // TODO: currently only support one type of child nodes
      id: parentNodeId,
      value: null,
      filterIDs: null,
      lockedIDs: null, // inherit from parent node
      userInput: null,
      valueDict: {},
    },
    style: {
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2,
      zIndex: -1,
    },
  };
  // reactFlowInstance.addNode(newNode);
  // reactFlowInstance.setNodes((nodes) => nodes.map((n) => (n.id === newNode.id ? { ...n, position: newNode.position } : n)));
  // reactFlowInstance.fitView();

  childNodes.forEach((n) => {
    n.parentNode = newNode.id;
    n.extent = "parent";
    // n.expandParent = true;
    // n.draggable = false;
    n.position = {
      x: n.position.x - bounds.x + padding,
      y: n.position.y - bounds.y + padding,
    };
  });

  return [newNode, childNodes];
};

// first create a parent group node, then add the child nodes to the parent group node
export const createAndGroupNodes = (
  nodes: Node[],
  parentNodeId: string,
): [NodeType, Node[]] => {
  const childNodes = nodes.filter((n) => n.type !== "group");
  // const childNodes = nodes;
  const [groupNode, newChildNodes] = _createGroupNode(childNodes, parentNodeId);

  return [groupNode, newChildNodes];
};

// ungroup a group node, return the released child nodes
export const ungroupNodes = (groupNode: Node, childNodes: Node[]): Node[] => {
  childNodes = childNodes.map((n) => {
    n.parentNode = null;
    n.extent = null;
    // n.expandParent = false;
    // n.draggable = true;
    n.position = {
      x: n.position.x + groupNode.position.x,
      y: n.position.y + groupNode.position.y,
    };
    return n;
  });

  return childNodes;
};
