import { Edge, ReactFlowInstance } from "reactflow";
import { NodeType } from "../flow";

const types:{[char: string]: string}={};
const template:{[char: string]: string}={}
const data:{[char: string]: string}={}


export type nodesWithDepthType = {
	depth: number;
	node: NodeType;
};

export type typesContextType = {
	reactFlowInstance: ReactFlowInstance|null;
	setReactFlowInstance: any;
	deleteNode: (idx: string) => void;
	deleteNodes: (idx: string[]) => void;
	addNodes: (nodes: NodeType[]) => void;
	addEdges: (edges: Edge[]) => void;
	types: typeof types;
	setTypes: (newState: {}) => void;
	templates: typeof template;
	setTemplates: (newState: {}) => void;
	data: typeof data;
	setData: (newState: {}) => void;
	softReset: () => void;
	getSelectedNodes: () => NodeType[];
	getNodeAllAncestors: (node: NodeType) => nodesWithDepthType[];
	updateNodes: (newNodes: NodeType[]) => void;
};
