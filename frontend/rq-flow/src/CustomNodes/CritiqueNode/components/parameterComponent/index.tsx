import { Handle, Position, useUpdateNodeInternals } from "reactflow"
import Tooltip from "../../../../components/TooltipComponent"
import { classNames, isValidConnection } from "../../../../utils"
import { useContext, useEffect, useRef, useState } from "react"
import InputComponent from "../../../../components/inputComponent"
import ToggleComponent from "../../../../components/toggleComponent"
import InputListComponent from "../../../../components/inputListComponent"
import TextAreaComponent from "../../../../components/textAreaComponent"
import { typesContext } from "../../../../contexts/typesContext"
import { ParameterComponentType } from "../../../../types/components"
import FloatComponent from "../../../../components/floatComponent"
import Dropdown from "../../../../components/dropdownComponent"
import InputFileComponent from "../../../../components/inputFileComponent"
import { TabsContext } from "../../../../contexts/tabsContext"
import IntComponent from "../../../../components/intComponent"
import PromptAreaComponent from "../../../../components/promptComponent"
import { contextMenuContext } from "../../../../contexts/contextMenuContext"
import { Button } from "@mui/material"

import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined"

export default function ParameterComponent({
  left,
  id,
  data,
  tooltipTitle,
  title,
  color,
  type,
  name = "",
  required = false,
  selected = false,
}: ParameterComponentType) {
  const ref = useRef(null)
  const updateNodeInternals = useUpdateNodeInternals()
  const [position, setPosition] = useState(0)
  useEffect(() => {
    if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
      setPosition(ref.current.offsetTop + ref.current.clientHeight / 2)
      updateNodeInternals(data.id)
    }
  }, [data.id, ref, updateNodeInternals])

  useEffect(() => {
    updateNodeInternals(data.id)
  }, [data.id, position, updateNodeInternals])

  const [enabled, setEnabled] = useState(
    data.node.template[name]?.value ?? false,
  )

  const { reactFlowInstance } = useContext(typesContext)
  let disabled = false
  if (reactFlowInstance && reactFlowInstance.getEdges) {
    disabled =
      reactFlowInstance?.getEdges().some((e) => e.targetHandle === id) ?? false
  }

  const { save } = useContext(TabsContext)

  const { generateRQFromCritique, currentNode } = useContext(contextMenuContext)
  const [isGeneratingNextNode, setIsGeneratingNextNode] = useState(false)

  return (
    <div
      ref={ref}
      className="w-full flex flex-wrap justify-between items-center dark:text-black mt-1 px-5 py-2"
    >
      <>
        <div className={"text-xxl truncate w-full " + (left ? "" : "text-end")}>
          {title ? title + ":" : ""}
          <span className="text-red-600">{required ? " *" : ""}</span>
        </div>

        {left &&
        (type === "str" ||
          type === "bool" ||
          type === "float" ||
          type === "code" ||
          type === "prompt" ||
          type === "file" ||
          type === "int") ? (
          <></>
        ) : (
          <>
            {!left && selected ? (
              <div className="flex items-center justify-end gap-4 text-xxl w-full text-end">
                {/* <span className="font-bold">Actions: </span> */}
                <Tooltip
                  title={
                    "Revise Previous RQ: Revise the previous RQ based on the persona, critique, and the literatures."
                  }
                >
                  <Button
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsGeneratingNextNode(true)

                      // TODO: current the node must be clicked once to triger state change
                      generateRQFromCritique(currentNode).finally(() => {
                        setIsGeneratingNextNode(false)
                      })
                    }}
                    variant="outlined"
                    color = "info"
                    sx={{
                      // minHeight: 0,
                      // minWidth: 0,
                      // height: "3rem",
                      // width: "3rem",
                      // padding: 0.5,
                      backgroundColor: "#f5f5f5",
                      // color: "#000000",
                      // border: "1px solid gray",
                    }}
                    disabled={isGeneratingNextNode}
                  >
                    {/* <ContactSupportOutlinedIcon
                      sx={{
                        fontSize: "2rem",
                      }}
                    /> */}
                    Next
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <></>
            )}

            <Tooltip
              title={
                // tooltipTitle + (required ? " (required)" : "")
                "Connect this node to a critique node or a persona node"
              }
            >
              <Handle
                type={left ? "target" : "source"}
                position={left ? Position.Left : Position.Right}
                id={id}
                isValidConnection={(connection) =>
                  isValidConnection(connection, reactFlowInstance)
                }
                className={classNames(
                  left ? "-ml-0.5 " : "-mr-0.5 ",
                  "w-3 h-3 rounded-full border-2 bg-white dark:bg-gray-800",
                )}
                style={{
                  borderColor: color,
                  top: position,
                }}
              ></Handle>
            </Tooltip>
          </>
        )}

        {left === true &&
        type === "str" &&
        !data.node.template[name].options ? (
          <div className="mt-2 w-full">
            {data.node.template[name].list ? (
              <InputListComponent
                disabled={disabled}
                value={
                  !data.node.template[name].value ||
                  data.node.template[name].value === ""
                    ? [""]
                    : data.node.template[name].value
                }
                onChange={(t: string[]) => {
                  data.node.template[name].value = t
                  save()
                }}
              />
            ) : data.node.template[name].multiline ? (
              <TextAreaComponent
                disabled={disabled}
                // value={data.value ?? ""}
                // value={data.valueDict[name] ?? ""}
                value={data.node.template[name].value ?? ""}
                onChange={(t: string) => {
                  // data.value = t;
                  // data.valueDict[name] = t;
                  data.node.template[name].value = t
                  save()
                }}
              />
            ) : (
              <InputComponent
                disabled={disabled}
                password={data.node.template[name].password ?? false}
                value={data.node.template[name].value ?? ""}
                // value={data.valueDict[name] ?? ""}
                onChange={(t) => {
                  data.node.template[name].value = t
                  // data.valueDict[name] = t;
                  save()
                }}
              />
            )}
          </div>
        ) : left === true && type === "bool" ? (
          <div className="mt-2">
            <ToggleComponent
              disabled={disabled}
              enabled={enabled}
              setEnabled={(t) => {
                data.node.template[name].value = t
                setEnabled(t)
                save()
              }}
            />
          </div>
        ) : left === true && type === "float" ? (
          <FloatComponent
            disabled={disabled}
            value={data.node.template[name].value ?? ""}
            onChange={(t) => {
              data.node.template[name].value = t
              save()
            }}
          />
        ) : left === true &&
          type === "str" &&
          data.node.template[name].options ? (
          <Dropdown
            options={data.node.template[name].options}
            onSelect={(newValue) => (data.node.template[name].value = newValue)}
            value={data.node.template[name].value ?? "Choose an option"}
          ></Dropdown>
        ) : left === true && type === "file" ? (
          <InputFileComponent
            disabled={disabled}
            value={data.node.template[name].value ?? ""}
            onChange={(t: string) => {
              data.node.template[name].value = t
            }}
            fileTypes={data.node.template[name].fileTypes}
            suffixes={data.node.template[name].suffixes}
            onFileChange={(t: string) => {
              data.node.template[name].content = t
              save()
            }}
          ></InputFileComponent>
        ) : left === true && type === "int" ? (
          <IntComponent
            disabled={disabled}
            value={data.node.template[name].value ?? ""}
            onChange={(t) => {
              data.node.template[name].value = t
              save()
            }}
          />
        ) : left === true && type === "prompt" ? (
          <PromptAreaComponent
            disabled={disabled}
            value={data.node.template[name].value ?? ""}
            onChange={(t: string) => {
              data.node.template[name].value = t
              save()
            }}
          />
        ) : (
          <></>
        )}
      </>
    </div>
  )
}
