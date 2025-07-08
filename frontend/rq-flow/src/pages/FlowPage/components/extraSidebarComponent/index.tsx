import React from "react"
import { Bars2Icon } from "@heroicons/react/24/outline"
import DisclosureComponent from "../DisclosureComponent"
import { nodeColors, nodeIcons, nodeNames } from "../../../../utils"
import { useContext, useEffect, useState } from "react"
import { typesContext } from "../../../../contexts/typesContext"
import { APIClassType, APIObjectType } from "../../../../types/api"
import { Button } from "@mui/material"
import { TabsContext } from "../../../../contexts/tabsContext"
import { InteractiveTutorialContext } from "../../../../contexts/InteractiveTutorialContext"
import InteractiveTutorialComponent from "../InteractiveTutorialComponent"
import { Dehaze } from "@mui/icons-material"

export default function ExtraSidebar() {
  const _ignore_d = ["group"] // ignore the rendering of nodes
  const { data, reactFlowInstance } = useContext(typesContext)
  const { addFlow } = useContext(TabsContext)

  function onDragStart(
    event: React.DragEvent<any>,
    data: { type: string; node?: APIClassType },
  ) {
    // start drag event
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("json", JSON.stringify(data))
  }

  // states for managing interactive tutorial
  const {
    isInteractiveTutorialOpen,
    setIsInteractiveTutorialOpen,
    currentStep,
  } = useContext(InteractiveTutorialContext)

  const renderNodes = () => {
    const nodes = reactFlowInstance?.getNodes() || []
    if (nodes.length === 0) {
      // Display only RQNode
      return (
        <div className="flex flex-col gap-4 p-2">
          {Object.keys(data)
            .sort()
            .reverse()
            .filter((d) => !_ignore_d.includes(d))
            .map(
              (d: keyof APIObjectType, i) =>
                Object.keys(data[d]).includes("RQNode") && (
                  <div key={i}>
                    {Object.keys(data[d])
                      .filter((t) => t === "RQNode")
                      .map((t: string, k) => {
                        const IconComponent = nodeIcons[d] ?? nodeIcons.unknown
                        return (
                          <div key={k}>
                            {isInteractiveTutorialOpen &&
                            currentStep === 0 &&
                            t === "RQNode" ? (
                              <InteractiveTutorialComponent
                                targetTutorialStep={0}
                                additionalData={{ type: t, node: data[d][t] }}
                              >
                                <div
                                  draggable
                                  className="cursor-grab rounded-l-md"
                                  style={{
                                    borderLeftWidth: "24px",
                                    borderLeftColor:
                                      nodeColors[d] ?? nodeColors.unknown,
                                  }}
                                  onDragStart={(event) =>
                                    onDragStart(event, {
                                      type: t,
                                      node: data[d][t],
                                    })
                                  }
                                >
                                  <div className="flex w-full items-center justify-between rounded-md rounded-l-none border border-l-0 border-dashed border-gray-400 px-3 py-2 text-sm dark:border-gray-600">
                                    {IconComponent &&
                                      React.createElement(IconComponent, {
                                        className:
                                          "w-6 text-gray-800 dark:text-white",
                                      })}
                                    <span className="w-36 truncate text-xs text-black dark:text-white ml-2">
                                      {t}
                                    </span>
                                    <Dehaze className="w-4 text-gray-600 dark:text-gray-200" />
                                  </div>
                                </div>
                              </InteractiveTutorialComponent>
                            ) : (
                              <div
                                draggable
                                className="cursor-grab rounded-l-md"
                                style={{
                                  borderLeftWidth: "24px", // Increase the width of the left border
                                  borderLeftColor:
                                    nodeColors[d] ?? nodeColors.unknown,
                                }}
                                onDragStart={(event) =>
                                  onDragStart(event, {
                                    type: t,
                                    node: data[d][t],
                                  })
                                }
                              >
                                <div className="flex w-full items-center justify-between rounded-md rounded-l-none border border-l-0 border-dashed border-gray-400 px-3 py-2 text-sm dark:border-gray-600">
                                  {IconComponent &&
                                    React.createElement(IconComponent, {
                                      className:
                                        "w-6 text-gray-800 dark:text-white",
                                    })}
                                  <span className="w-36 truncate font-normal font-sans capitalize text-xs text-black dark:text-white ml-2">
                                    {t}
                                  </span>
                                  <Dehaze className="w-4 text-gray-600 dark:text-gray-200" />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ),
            )}
        </div>
      )
    } else {
      // Display all nodes
      return (
        <div>
          {Object.keys(data)
            .sort()
            .reverse()
            .filter((d) => !_ignore_d.includes(d))
            .map((d: keyof APIObjectType, i) => (
              <div className="flex flex-col gap-4 p-2" key={i}>
                {Object.keys(data[d])
                  .sort()
                  .map((t: string, k) => {
                    const IconComponent = nodeIcons[d] ?? nodeIcons.unknown
                    return (
                      <div key={k}>
                        {isInteractiveTutorialOpen &&
                        currentStep === 0 &&
                        t === "RQNode" ? (
                          <InteractiveTutorialComponent
                            targetTutorialStep={0}
                            additionalData={{ type: t, node: data[d][t] }}
                          >
                            <div
                              draggable
                              className="cursor-grab rounded-l-md border-l-8"
                              style={{
                                borderLeftWidth: "12px", // Increase the width of the left border
                                borderLeftColor:
                                  nodeColors[d] ?? nodeColors.unknown,
                              }}
                              onDragStart={(event) =>
                                onDragStart(event, {
                                  type: t,
                                  node: data[d][t],
                                })
                              }
                            >
                              <div className="flex w-full items-center justify-between rounded-md rounded-l-none border border-l-0 border-dashed border-gray-400 px-3 py-2 text-sm dark:border-gray-600">
                                {IconComponent &&
                                  React.createElement(IconComponent, {
                                    className:
                                      "w-6 text-gray-800 dark:text-white",
                                  })}
                                <span className="w-36 truncate text-xs text-black dark:text-white ml-2">
                                  {t}
                                </span>
                                <Dehaze className="w-4 text-gray-600 dark:text-gray-200" />
                              </div>
                            </div>
                          </InteractiveTutorialComponent>
                        ) : (
                          <div
                            draggable
                            className="cursor-grab rounded-l-md border-l-12"
                            style={{
                              borderLeftWidth: "12px", // Increase the width of the left border
                              borderLeftColor:
                                nodeColors[d] ?? nodeColors.unknown,
                            }}
                            onDragStart={(event) =>
                              onDragStart(event, {
                                type: t,
                                node: data[d][t],
                              })
                            }
                          >
                            <div className="flex w-full items-center justify-between rounded-md rounded-l-none border border-l-0 border-dashed border-gray-400 px-3 py-2 text-sm dark:border-gray-600">
                              {IconComponent &&
                                React.createElement(IconComponent, {
                                  className:
                                    "w-6 text-gray-800 dark:text-white",
                                })}
                              <span className="w-36 truncate font-normal font-sans capitalize text-xs text-black dark:text-white ml-2">
                                {t}
                              </span>
                              <Dehaze className="w-4 text-gray-600 dark:text-gray-200" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {Object.keys(data[d]).length === 0 && (
                  <div className="text-center text-gray-400">Coming soon</div>
                )}
              </div>
            ))}
        </div>
      )
    }
  }

  return (
    <div className="mt-1 w-full">
      {renderNodes()}
      {/* <Button
        onClick={() => {
          addFlow({
            name: "Tutorial",
            id: "tutorial",
            data: { edges: [], nodes: [], viewport: { x: 1, y: 0, zoom: 0.5 } },
            description: "",
          })
          setIsInteractiveTutorialOpen(true)
        }}
        sx={{ marginTop: "1rem" }}
        fullWidth
      >
        Interactive Tutorial
      </Button> */}
    </div>
  )
}
