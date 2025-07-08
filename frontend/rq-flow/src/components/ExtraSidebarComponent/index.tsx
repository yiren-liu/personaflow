import React, { useEffect, useState } from "react"

import { Stack, IconButton, Button } from "@mui/material"
import { ChevronLeft, ChevronRight, ArrowUpward } from "@mui/icons-material"
import { Disclosure } from "@headlessui/react"
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { useContext } from "react"
import { Link } from "react-router-dom"
import { classNames } from "../../utils"
import { locationContext } from "../../contexts/locationContext"

import { Card, CardContent, Typography } from "@mui/material"

import { alertContext } from "../../contexts/alertContext"
import { contextMenuContext } from "../../contexts/contextMenuContext"
import { TabsContext } from "../../contexts/tabsContext"

export default function ExtraSidebar() {
  const {
    current,
    isStackedOpen,
    setIsStackedOpen,
    extraNavigation,
    extraComponent,
    searchParams,
    setSearchParams,
    isBlockMode,
    isMindMapMode,
  } = useContext(locationContext)

  const { ratedNodes } = useContext(contextMenuContext)

  const { hardReset } = useContext(TabsContext)

  const { setNoticeData } = useContext(alertContext)

  const handleToggleCollapse = () => {
    setIsStackedOpen(!isStackedOpen)
  }

  // time every 5 mins, popup a notification
  const [time, setTime] = useState(0)
  useEffect(() => {
    const interval = setInterval(
      () => {
        setTime((time) => time + 1)
      },
      1000 * 60 * 1,
    )
    return () => clearInterval(interval)
  }, [])
  // useEffect(() => {
  //   if (isMindMapMode || isBlockMode) {
  //     if (time % 5 === 0) {
  //       setNoticeData({
  //         title: "Feeling lost? Check out our interactive tutorial for ideas!",
  //         // link: "/tutorial",
  //       });
  //     }
  //   }
  // }, [time]);

  function getNextSessionURL() {
    // get the next session
    // two possible cases for searchParams: '?tempid=15sgt2' or '?tempid=245gse'
    // if searchParams is one of the two, change to the other one and redirect
    // if searchParams is neither, randomly assign to a group
    // console.log("searchParams", searchParams);
    let nextSessionURL = "/app?"

    if (searchParams.includes("tempid=15sgt2")) {
      nextSessionURL += "tempid=245gse"
    } else if (searchParams.includes("tempid=245gse")) {
      nextSessionURL += "tempid=15sgt2"
    } else {
      // randomly assign to a group
      let random = Math.random()
      if (random < 0.5) {
        nextSessionURL += "tempid=15sgt2"
      } else {
        nextSessionURL += "tempid=245gse"
      }
    }

    if (searchParams.includes("topic=1")) {
      nextSessionURL += "&topic=2"
    } else if (searchParams.includes("topic=2")) {
      nextSessionURL += "&topic=1"
    } else {
      // randomly assign to a group
      let random = Math.random()
      if (random < 0.5) {
        nextSessionURL += "&topic=1"
      } else {
        nextSessionURL += "&topic=2"
      }
    }

    // if reset is already true, redirect to the thank you page
    if (searchParams.includes("reset=true")) {
      nextSessionURL = "/thankyou"
      return nextSessionURL
    } else {
      nextSessionURL += "&reset=true"
      return nextSessionURL
    }
  }

  function getTaskTopic() {
    if (searchParams.includes("topic=1")) {
      return "VR/AR for education and learning"
    } else if (searchParams.includes("topic=2")) {
      return "Crowdsourcing and AI"
    }
  }

  return (
    <>
      <div
        className={` ${
          isStackedOpen ? "w-52" : "w-6 "
        } relative flex flex-shrink-0 flex-row overflow-hidden border-r 
          transition-all duration-500 dark:border-r-gray-700`}
      >
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            position: "absolute", // position it absolutely
            right: ` ${isStackedOpen ? "0px" : "-12px"}`,
            top: "calc(50% - 24px)", // center it vertically
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#FBFBFB",
            "&:hover": {
              backgroundColor: "#BFBFBF",
            },
            // zIndex: "1000 !important",
          }}
        >
          {isStackedOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
        <div
          className={`${isStackedOpen ? "w-52" : "w-0 "} flex h-full flex-col  items-start overflow-y-auto border scrollbar-hide dark:border-gray-700 dark:bg-gray-800`}
        >
          <div className="select-none bg-gray-50 dark:bg-gray-700 dark:border-y-gray-600 w-full flex justify-between items-center -mt-px px-3  border-y border-y-gray-200">
            <span className="text-lg font-medium mt-2 mb-2">
              {extraNavigation.title}
            </span>
          </div>
          <div className="flex w-full flex-grow flex-col">
            {extraNavigation.options ? (
              <div className="p-4">
                <nav className="flex-1 space-y-1">
                  {extraNavigation.options.map((item) =>
                    !item.children ? (
                      <div key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            item.href.split("/")[2] === current[4]
                              ? "bg-gray-100 text-gray-900"
                              : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex w-full items-center rounded-md py-2 pl-2 text-sm font-medium",
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.href.split("/")[2] === current[4]
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-3 h-6 w-6 flex-shrink-0",
                            )}
                          />
                          {item.name}
                        </Link>
                      </div>
                    ) : (
                      <Disclosure
                        as="div"
                        defaultOpen
                        key={item.name}
                        className="space-y-1"
                      >
                        {({ open }) => (
                          <>
                            <Disclosure.Button
                              className={classNames(
                                item.href.split("/")[2] === current[4]
                                  ? "bg-gray-100 text-gray-900"
                                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                "group flex w-full items-center rounded-md py-2 pl-2 pr-1 text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500",
                              )}
                            >
                              <item.icon
                                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="flex-1">{item.name}</span>
                              <svg
                                className={classNames(
                                  open
                                    ? "rotate-90 text-gray-400"
                                    : "text-gray-300",
                                  "transition-rotate ml-3 h-5 w-5 flex-shrink-0 duration-150 ease-in-out group-hover:text-gray-400",
                                )}
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 6L14 10L6 14V6Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </Disclosure.Button>
                            <Disclosure.Panel className="space-y-1">
                              {item.children.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.href}
                                  className={classNames(
                                    subItem.href.split("/")[3] === current[5]
                                      ? "bg-gray-100 text-gray-900"
                                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    "group flex w-full items-center rounded-md py-2 pl-11 pr-2 text-sm font-medium",
                                  )}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ),
                  )}
                </nav>
              </div>
            ) : (
              extraComponent
            )}

            {/* toturial and task reminder for user study */}
            {isMindMapMode && (
              <>
                <Card
                  className="flex flex-col items-center justify-center bg-gray-200"
                  sx={{
                    maxWidth: 345,
                    m: 2,
                    bgcolor: "background.default",
                    boxShadow: 3,
                  }}
                >
                  {/* up arrow here */}
                  <ArrowUpward className="mt-2 text-cyan-500" />
                  <CardContent className="flex flex-col items-center justify-center">
                    <Typography component="div" className="font-bold">
                      Tutorial
                    </Typography>
                    <Typography component="div" className="text-sm">
                      Drag and Drop the tag above to create a new idea
                      <br />
                    </Typography>
                    <br />
                    <Link
                      target="_blank"
                      to="/tutorial"
                      className="border-b border-cyan-500 text-cyan-500 hover:border-cyan-600"
                    >
                      See more tutorials
                    </Link>
                    {/* <Typography variant="body2" color="text.secondary">
                    You can rearrange your items here
                  </Typography> */}
                  </CardContent>
                </Card>

                <Card
                  className="mt-auto flex flex-col items-center justify-center bg-gray-200"
                  sx={{
                    maxWidth: 345,
                    m: 2,
                    bgcolor: "background.default",
                    boxShadow: 3,
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center">
                    <Typography component="div" className="font-bold">
                      Task Reminder
                    </Typography>
                    <Typography component="div" className="text-sm">
                      Your current task topic is:
                      <br />
                      <br />
                      <span className="text-lg font-bold text-orange-500">
                        {getTaskTopic()}
                      </span>
                      <br />
                      <br />
                    </Typography>
                    <Typography component="div" className="text-sm">
                      To finish this session, rate at least 6 RQs.
                      <br />
                      Currently progress:
                      <br />
                      <br />
                      <span className="font-bold text-cyan-500">
                        Rated {ratedNodes.size}/6 RQs
                      </span>
                    </Typography>
                    <br />
                    {/* display time here */}
                    <Typography component="div" className="text-sm">
                      Time used: {time} minutes
                    </Typography>

                    <br />

                    {
                      // ratedNodes.size >= 6 && !searchParams.includes("reset=true") ? (
                      ratedNodes.size >= 6 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          href={getNextSessionURL()}
                          target="_blank"
                        >
                          Next Session
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          href={getNextSessionURL()}
                          target="_blank"
                          disabled
                        >
                          Next Session
                        </Button>
                      )
                    }
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
