import { createContext, ReactNode, useEffect, useState } from "react";
import { Edge, Node, getIncomers } from "reactflow";
import { typesContextType } from "../types/typesContext";
import { APIKindType } from "../types/api";
import { NodeType } from "../types/flow";

//context to share types adn functions from nodes to flow

const initialValue: typesContextType = {
	reactFlowInstance: null,
	setReactFlowInstance: () => { },
	deleteNode: () => { },
	deleteNodes: () => { },
	addNodes: () => { },
	addEdges: () => { },
	types: {},
	setTypes: () => { },
	templates: {},
	setTemplates: () => { },
	data: {},
	setData: () => { },
	softReset: () => { },
	getSelectedNodes: () => { return [] },
	getNodeAllAncestors: () => { return [] },
	updateNodes: () => { }
};

export const typesContext = createContext<typesContextType>(initialValue);

export function TypesProvider({ children }: { children: ReactNode }) {
	const [types, setTypes] = useState({});
	const [reactFlowInstance, setReactFlowInstance] = useState(null);
	const [templates, setTemplates] = useState({});
	const [data, setData] = useState({});

	useEffect(() => {
		async function getTypes(): Promise<void> {
			// Make an asynchronous API call to retrieve all data.
			// let result = await getAll();

			// override the getAll api
			let result = { data: {} };
			// load json from ./types/rqgen_types.json
			try {
				// result.data = require("./types/rqgen_types.json");
				result.data = await fetch("/types/rqgen_types.json").then((response) => response.json());
			} catch (e) {
				console.log("error loading rqgen_types.json");
				console.log(e);
			}

			// Update the state of the component with the retrieved data.
			setData(result.data);
			setTemplates(
				Object.keys(result.data).reduce((acc, curr) => {
					Object.keys(result.data[curr]).forEach((c: keyof APIKindType) => {
						acc[c] = result.data[curr][c]
					})
					return acc;
				}, {})
			);
			// Set the types by reducing over the keys of the result data and updating the accumulator.
			setTypes(
				Object.keys(result.data).reduce((acc, curr) => {
					Object.keys(result.data[curr]).forEach((c: keyof APIKindType) => {
						acc[c] = curr;
						// Add the base classes to the accumulator as well.
						result.data[curr][c].base_classes?.forEach((b) => {
							acc[b] = curr;
						});
					});
					return acc;
				}, {})
			);
		}
		// Call the getTypes function.
		getTypes();
	}, [setTypes]);

	function deleteNode(idx: string) {
		reactFlowInstance.setNodes(
			reactFlowInstance.getNodes().filter((n: Node) => n.id !== idx)
		);
		reactFlowInstance.setEdges(reactFlowInstance.getEdges().filter((ns) => ns.source !== idx && ns.target !== idx));
	}
	function deleteNodes(idx: string[]) {
		reactFlowInstance.setNodes(
			reactFlowInstance.getNodes().filter((n: Node) => !idx.includes(n.id))
		);
		reactFlowInstance.setEdges(reactFlowInstance.getEdges().filter((ns) => !idx.includes(ns.source) && !idx.includes(ns.target)));
	}
	function softReset() {
		// delete all nodes and edges
		reactFlowInstance.setNodes([]);
		reactFlowInstance.setEdges([]);
	}

	function addNodes(newNodes: NodeType[]) {
		reactFlowInstance.setNodes((nds) => nds.concat(newNodes));
	}
	function addEdges(newEdges: Edge[]) {
		reactFlowInstance.setEdges((eds) => eds.concat(newEdges));
	}

	// update nodes with same id
	function updateNodes(newNodes: NodeType[]) {
		reactFlowInstance.setNodes((nds) => {
			// remove old nodes with same id
			let newNds = nds.filter((n) => !newNodes.map((nn) => nn.id).includes(n.id));
			// add new nodes
			newNds = newNds.concat(newNodes);
			return newNds;
		});
	}


	// function to get all current selected nodes
	function getSelectedNodes() {
		return reactFlowInstance?.getNodes().filter((n: Node) => n.selected);
	}


	// This function can be conducted any nodes
    // and it will recursively find all the ancestors/incomers of the node
    const getNodeAllAncestors = (node: Node, depth: number=0) => {
        let nodes = reactFlowInstance.getNodes();
        let edges = reactFlowInstance.getEdges();
        let incomers = getIncomers(node, nodes, edges);
		let ancestors = [];
        // find all incomers recursively
        if (incomers.length) {
            ancestors = incomers.map((node) => getNodeAllAncestors(node, depth+1));
			ancestors = [{depth: depth, node: node}, ...ancestors.flat()];
			// if depth is 0, which means the node itself is the root node
			// dedup the result based on node.id
			if (depth === 0) {
				let nodeSet = new Set();
				let dedupedAncestors = [];
				// first sort the ancestors by depth in ascending order
				// to make sure the closest ancestor is added first
				ancestors.sort((a, b) => a.depth - b.depth);

				ancestors.forEach((a) => {
					if (!nodeSet.has(a.node.id)) {
						nodeSet.add(a.node.id);
						dedupedAncestors.push(a);
					}
				});
				return dedupedAncestors;
			}
			return ancestors;
        }
        return [{depth: depth, node: node}];
    }

	return (
		<typesContext.Provider
			value={{
				types,
				setTypes,
				reactFlowInstance,
				setReactFlowInstance,
				deleteNode,
				deleteNodes,
				addNodes,
				addEdges,
				setTemplates,
				templates,
				data,
				setData,
				softReset,
				getSelectedNodes,
				getNodeAllAncestors,
				updateNodes
			}}
		>
			{children}
		</typesContext.Provider>
	);
}
