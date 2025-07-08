import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useContext, useState } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
import { FlowType } from "../../../../types/flow";

// var _ = require("lodash");
import * as _ from "lodash";

export default function TabComponent({
  selected,
  flow,
  onClick,
}: {
  flow: FlowType;
  selected: boolean;
  onClick: () => void;
}) {
  const { removeFlow, updateFlow, flows } = useContext(TabsContext);
  const [isRename, setIsRename] = useState(false);
  const [value, setValue] = useState("");

  const handleBlur = () => {
    setIsRename(false);
    if (value !== "") {
      let newFlow = _.cloneDeep(flow);
      newFlow.name = value;
      updateFlow(newFlow);
    }
  };

  const handleDoubleClick = () => {
    if (flow.name !== "Tutorial") {
      setIsRename(true);
      setValue(flow.name);
    }
  };

  return (
    <>
      {flow ? (
        !selected ? (
          <div
            className="my-1.5 -ml-px flex w-44 select-none items-center justify-between truncate border-x-gray-300 px-4 dark:border-x-gray-600 dark:text-white"
            onClick={onClick}
          >
            <span className="w-32 truncate text-left">{flow.name}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFlow(flow.id);
              }}
            >
              <XMarkIcon className="h-4 rounded-full hover:bg-white dark:hover:bg-gray-600" />
            </button>
          </div>
        ) : (
          <div className="-ml-px flex w-44 select-none items-center justify-between rounded-t-xl border border-b-0 border-gray-300 bg-white px-4 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            {isRename ? (
              <input
                autoFocus
                className="w-28 rounded-md bg-transparent outline-gray-300 hover:outline focus:border-none focus:outline active:outline"
                onBlur={handleBlur}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="w-32 truncate text-left"
                  onDoubleClick={handleDoubleClick}
                >
                  {flow.name}
                </span>
              </div>
            )}
            <button onClick={() => removeFlow(flow.id)}>
              {flows.length > 1 && (
                <XMarkIcon className="h-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600" />
              )}
            </button>
          </div>
        )
      ) : (
        <div className="flex h-full items-center justify-center py-1.5">
          <button
            className="-ml-px flex h-full items-center border-x-gray-300 px-3 pb-0.5 pt-0.5 dark:border-x-gray-600 dark:text-white"
            onClick={onClick}
          >
            <PlusIcon className="h-5 rounded-full hover:bg-white dark:hover:bg-gray-600" />
          </button>
        </div>
      )}
    </>
  );
}
