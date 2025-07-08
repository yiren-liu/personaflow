import { ArrowTopRightOnSquareIcon, CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import TextAreaModal from "../../modals/textAreaModal";
import { TextAreaComponentType } from "../../types/components";
import { Button } from "@mui/material";


import { contextMenuContext } from "../../contexts/contextMenuContext";

// import { agent_n_step } from "../../ContextMenus";

// export default function TextAreaComponent({ value, onChange, disabled }:TextAreaComponentType) {
//   const [myValue, setMyValue] = useState(value);
//   const { openPopUp } = useContext(PopUpContext);
//   useEffect(() => {
//     if (disabled) {
//       setMyValue("");
//       onChange("");
//     }
//   }, [disabled, onChange]);
//   return (
//     <div className={disabled ? "pointer-events-none cursor-not-allowed" : ""}>
//       <div className="w-full flex items-center gap-3">
//         <span onClick={()=>{openPopUp(<TextAreaModal value={myValue} setValue={(t:string) => {setMyValue(t); onChange(t);}}/>)}}
//           className={
//             "truncate block w-full text-gray-500 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" +
//             (disabled ? " bg-gray-200" : "")
//           }
//         >
//             {myValue !== "" ? myValue : 'Text empty'}
//         </span>
//         <button onClick={()=>{openPopUp(<TextAreaModal value={myValue} setValue={(t:string) => {setMyValue(t); onChange(t);}}/>)}}>
//             <ArrowTopRightOnSquareIcon className="w-6 h-6 hover:text-blue-600" />
//         </button>
//       </div>
//     </div>
//   );
// }

export default function TextAreaComponent({ value, onChange, disabled }: TextAreaComponentType) {
  const [myValue, setMyValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // context for the context menus
  const {
    setIsNodeMenuOpen, setIsEdgeMenuOpen,
    setNodeContextMenuPostion, setEdgeContextMenuPostion,
    setContextMenuNode,
    // setContextMenuEdge,
    filterPaperIDs, setFilterPaperIDs,
    lockedPaperIDs, setLockedPaperIDs,
    setCurrentNode, currentNode,
    setCurrentEdge, currentEdge,
  } = useContext(contextMenuContext);


  useEffect(() => {
    if (disabled) {
      setMyValue("");
      onChange("");
    }
  }, [disabled, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMyValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div className={disabled ? "pointer-events-none cursor-not-allowed" : ""}>
      <div className={`w-full flex flex-col items-start 
      gap-3 form-input rounded-md border-gray-300 shadow-sm 
      ${
        // myValue && !isFocused ? 'bg-green-100' : ''
        isFocused ? 'border-2 border-indigo-500 ring-indigo-500' : ''
      }`}>
        <textarea
          name="" id="" rows={3} 
          className={
            `nowheel nodrag w-full h-64 resize-none ${
              // myValue && !isFocused ? 'bg-green-100' : ''
              myValue && !isFocused ? '' : ''
            } focus:outline-none`
          }
          value={myValue} onChange={handleChange}
          onBlur={() => { setIsFocused(false) }}
          onFocus={() => { setIsFocused(true) }}
          // in user hit enter, prevent default and blur the textarea
          // onKeyUp={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          // onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); } }}
        ></textarea>
      </div>
    </div>
  );
}