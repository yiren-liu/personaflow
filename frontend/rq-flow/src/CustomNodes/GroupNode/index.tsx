import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  classNames,
  nodeColors,
  nodeIcons,
  snakeToNormalCase,
} from "../../utils";

import { typesContext } from "../../contexts/typesContext";
import { useContext, useState, useEffect, useRef } from "react";
import { NodeDataType } from "../../types/flow";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import NodeModal from "../../modals/NodeModal";
import { useCallback } from "react";
import { TabsContext } from "../../contexts/tabsContext";
import {
  NodeProps,
  NodeToolbar,
  useReactFlow,
  useStore,
  useStoreApi,
  NodeResizer,
  NodeResizeControl,
} from "reactflow";
import { contextMenuContext } from "../../contexts/contextMenuContext";
import { getRelativeNodesBounds } from "./util";
import "./groupNode.css";
import { border } from "@chakra-ui/system";

export default function GroupNode({
  data,
  selected,
}: {
  data: NodeDataType;
  selected: boolean;
}) {
  const { setErrorData } = useContext(alertContext);
  const showError = useRef(true);
  const { types, deleteNode } = useContext(typesContext);
  const { openPopUp } = useContext(PopUpContext);
  const Icon = nodeIcons[types[data.type]];
  const [validationStatus, setValidationStatus] = useState("idle");
  // State for outline color
  const [isValid, setIsValid] = useState(false);
  const { save } = useContext(TabsContext);
  const { reactFlowInstance } = useContext(typesContext);
  const [params, setParams] = useState([]);

  // add mapping of nodeid --> loading props to context
  const {
    loadingStates,
    setLoadingForNode,
    setCurrentNode,
    currentNode,
    setRatedNodesById,
  } = useContext(contextMenuContext);

  const store = useStoreApi();
  const { minWidth, minHeight, hasChildNodes } = useStore((store) => {
    const childNodes = Array.from(store.nodeInternals.values()).filter(
      (n) => n.parentNode === currentNode?.id,
    );
    const rect = getRelativeNodesBounds(childNodes);

    return {
      minWidth: rect.x + rect.width,
      minHeight: rect.y + rect.height,
      hasChildNodes: childNodes.length > 0,
    };
  });

  useEffect(() => {
    if (reactFlowInstance?.toObject) {
      setParams(Object.values(reactFlowInstance.toObject()));
    }
  }, [save]);

  // useEffect(() => {
  //   if (currentNode) {
  //     currentNode.style.height = minHeight;
  //     currentNode.style.width = minWidth;
  //   }
  // }, [minHeight, minWidth]);

  // return <div className={`h-[${minHeight}] w-[${minWidth}] bg-red-500`}></div>;

  // return (
  //   <div
  //   // style={{
  //   //   height: `${currentNode.style?.height}px`,
  //   //   width: `${currentNode.style?.width}px`,
  //   //   backgroundColor: "red",
  //   // }}
  //   ></div>
  // );
  const lineStyle = {
    // background: "transparent",
    borderOutline: selected ? "1px solid red" : "none",
    border: "none",
    borderStyle: "none",
    animation: selected ? "pulse-red 0.8s infinite" : "none",
  };

  const controlStyle = {
    border: selected ? "4px solid red" : "4px solid gray",
  };

  return (
    <>
      {/* <div
        style={{
          height: currentNode?.style?.height,
          // width: currentNode?.style?.width,
          background: "blue",
          padding: 0,
          margin: 0,
          resize: "both",
          width: "auto",
          // height: "auto",
        }}
      > */}
      <NodeResizer
        isVisible={selected}
        lineStyle={lineStyle}
        minHeight={minHeight}
        minWidth={minWidth}
        handleStyle={controlStyle}
      />
      {/* </div> */}
    </>
  );
}
type IsEqualCompareObj = {
  minWidth: number;
  minHeight: number;
  hasChildNodes: boolean;
};

function isEqual(prev: IsEqualCompareObj, next: IsEqualCompareObj): boolean {
  return (
    prev.minWidth === next.minWidth &&
    prev.minHeight === next.minHeight &&
    prev.hasChildNodes === next.hasChildNodes
  );
}
