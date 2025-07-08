import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline"
import {
  classNames,
  nodeColors,
  nodeIcons,
  snakeToNormalCase,
} from "../../utils"
import ParameterComponent from "./components/parameterComponent"
import { typesContext } from "../../contexts/typesContext"
import { useContext, useState, useEffect, useRef } from "react"
import { NodeDataType } from "../../types/flow"
import { alertContext } from "../../contexts/alertContext"
import { PopUpContext } from "../../contexts/popUpContext"
import NodeModal from "../../modals/NodeModal"
import { useCallback } from "react"
import { TabsContext } from "../../contexts/tabsContext"

import { contextMenuContext } from "../../contexts/contextMenuContext"
import { background } from "@chakra-ui/system"

// import RobotIcon from '../../../public/RobotIcon.svg';

import { Textarea, Button, IconButton } from "@material-tailwind/react"
import { LinkIcon } from "@heroicons/react/24/outline"

import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { CircularProgress } from "@mui/material"

import Likert from "react-likert-scale"
import AccordionLikert from "../components/AccordionLikert"

import { type } from "os"
import InteractiveTutorialComponent from "../../pages/FlowPage/components/InteractiveTutorialComponent"
import { InteractiveTutorialContext } from "../../contexts/InteractiveTutorialContext"
import { Box, Chip, Typography } from "@mui/material"
import FavButton from "../components/FavButton"

export default function PersonaNode({
  data,
  selected,
}: {
  data: NodeDataType
  selected: boolean
}) {
  const { setErrorData } = useContext(alertContext)
  const showError = useRef(true)
  const { types, deleteNode } = useContext(typesContext)
  const { openPopUp } = useContext(PopUpContext)
  const Icon = nodeIcons[types[data.type]]
  const [validationStatus, setValidationStatus] = useState("idle")
  // State for outline color
  const [isValid, setIsValid] = useState(false)
  const { save } = useContext(TabsContext)
  const { reactFlowInstance } = useContext(typesContext)
  const [params, setParams] = useState([])

  const [roleTasks, setRoleTasks] = useState([])
  const [background, setBackground] = useState([])
  useEffect(() => {
    if (data && data.node && data.node.template) {
      setRoleTasks(data?.node?.template?.roleTasks || [])
      setBackground(data?.node?.template?.background || [])
    }
  }, [data, data?.node?.template?.roleTasks, data?.node?.template?.background])

  const { isInteractiveTutorialOpen, currentStep } = useContext(
    InteractiveTutorialContext,
  )

  // add mapping of nodeid --> loading props to context
  const {
    loadingStates,
    setLoadingForNode,
    setCurrentNode,
    currentNode,
    setRatedNodesById,
  } = useContext(contextMenuContext)

  const likertConfigs = {
    items: [
      {
        question: "This persona is relevant to the research topic.",
        tag: "relevance",
      },
      {
        question: "This persona is useful for my exploration.",
        tag: "usefulness",
      },
      {
        question: "The information used to describe the persona is specific.",
        tag: "specificity",
      },
      {
        question:
          "The persona’s profile contains elements and traits that I had not considered before.",
        tag: "inspiration",
      },
      {
        question: "The persona is credible or believeable.",
        tag: "credibility",
      },
      {
        question: "I'm familiar with the persona's background or domain.",
        tag: "familiarity",
      },
    ],
    responses: [
      { value: 1, text: "Strongly Disagree" },
      { value: 2, text: "Disagree" },
      { value: 3, text: "Neutral" },
      { value: 4, text: "Agree" },
      { value: 5, text: "Strongly Agree" },
    ],
  }

  console.log()

  useEffect(() => {
    if (reactFlowInstance?.toObject) {
      setParams(Object.values(reactFlowInstance.toObject()))
    }
  }, [save])

  useEffect(() => {
    // 	try {
    // 		fetch(`/validate/node/${data.id}`, {
    // 			method: "POST",
    // 			headers: {
    // 				"Content-Type": "application/json",
    // 			},
    // 			body: JSON.stringify(reactFlowInstance.toObject()),
    // 		}).then((response) => {
    // 			console.log(response.status, response.body);

    // 			if (response.status === 200) {
    // 				setValidationStatus("success");
    // 			} else if (response.status === 500) {
    // 				setValidationStatus("error");
    // 			}
    // 		});
    // 	} catch (error) {
    // 		console.error("Error validating node:", error);
    // 		setValidationStatus("error");
    // 	}

    // TODO: override this behavior for now
    if (
      data.node.template.persona_name?.value
      // && data.node.template.persona_description?.value
    ) {
      setValidationStatus("success")
    } else {
      setValidationStatus("failed")
    }
  }, [params])

  useEffect(() => {
    if (validationStatus === "success") {
      setIsValid(true)
    } else {
      setIsValid(false)
    }

    // // check if node.data.value and node.data.userInput are both null
    // // if so, set current node to self
    // if (data.value === null && data.userInput === null) {
    // 	let node = reactFlowInstance.getNode(data.id);
    // 	selected = true;
    // 	// node.click();
    // }
  }, [validationStatus])

  if (!Icon) {
    if (showError.current) {
      setErrorData({
        title: data.type
          ? `The ${data.type} node could not be rendered, please review your json file`
          : "There was a node that can't be rendered, please review your json file",
      })
      showError.current = false
    }
    deleteNode(data.id)
    return
  }

  const childComponent = (
    <div
      className={classNames(
        isValid
          ? "animate-pulse-green"
          : "border-red-outline animate-pulse-red",
        // isValid ? "animate-pulse-green" : "animate-pulse-red",
        selected ? "border border-blue-500" : "border dark:border-gray-700",
        "prompt-node relative bg-yellow-100 dark:bg-yellow-100 w-128 rounded-lg flex flex-col justify-center text-xl",
      )}
    >
      {loadingStates[data.id] && (
        <>
          <div className="absolute top-0 right-0 m-6">
            <svg width={0} height={0}>
              <defs>
                <linearGradient
                  id="custom_gradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  {/* blue to green */}
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#38A169" />
                </linearGradient>
              </defs>
            </svg>
            <CircularProgress
              size={50}
              thickness={4}
              sx={{
                "svg circle": { stroke: "url(#custom_gradient)" },
              }}
            />
          </div>
        </>
      )}

      {/* check if hide header in schema and is true */}
      {data.node.hide_header ? null : (
        <div className="w-full dark:text-white flex items-center justify-between p-4 gap-8 bg-gray-50 rounded-t-lg dark:bg-gray-800 border-b dark:border-b-gray-700 ">
          <div className="w-full flex items-center truncate gap-4 text-lg">
            <Icon
              className="w-10 h-10 p-1 rounded"
              style={{
                color: nodeColors[types[data.type]] ?? nodeColors.unknown,
              }}
            />
            <div className="truncate">{data.type}</div>
          </div>
          <div className="flex gap-3">
            <button
              className="relative"
              onClick={(event) => {
                event.preventDefault()
                openPopUp(<NodeModal data={data} />)
              }}
            >
              <div className=" absolute text-red-600 -top-2 -right-1">
                {Object.keys(data.node.template).some(
                  (t) =>
                    data.node.template[t].advanced &&
                    data.node.template[t].required,
                )
                  ? " *"
                  : ""}
              </div>
              <Cog6ToothIcon
                className={classNames(
                  Object.keys(data.node.template).some(
                    (t) =>
                      data.node.template[t].advanced &&
                      data.node.template[t].show,
                  )
                    ? ""
                    : "hidden",
                  "w-6 h-6  dark:text-gray-500  hover:animate-spin",
                )}
              ></Cog6ToothIcon>
            </button>
            <button
              onClick={() => {
                deleteNode(data.id)
              }}
            >
              <TrashIcon className="w-6 h-6 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"></TrashIcon>
            </button>
          </div>
        </div>
      )}

      <div className="py-5 px-5 rounded-lg border-sky-900 shadow-xl bg-[#BBF0FB] shrink-0">
        <div className="w-full flex items-center gap-2 text-2xl">
          <Icon
            className="w-14 h-14 p-1 rounded"
            style={{
              color: nodeColors.unknown,
            }}
          />
          {/* <div className="truncate font-bold">{data.type}</div> */}
          <div className="font-bold">
            {data.node?.template["persona_name"].value
              ? data.node?.template["persona_name"].value
              : "Custom Persona"}
          </div>

          <FavButton nodeData={data} />

        </div>

        {/* TODO: a weird bug here, when using img, its onLoad function gets set as reactFlowInstance */}
        {/* <img className="w-full" src="RobotResearcher.png" alt="Persona avatar" onLoad={()=>{
  console.log("image loaded");
} }/> */}

        {selected ? (
          // <div className="w-full h-full py-5">
          <div>
            <div className="w-full text-gray-500 px-5 pb-3 text-sm">
              {data.node.description}
            </div>

            <>
              {Object.keys(data.node.template)
                .filter((t) => t.charAt(0) !== "_")
                .map((t: string, idx) => (
                  <div key={idx}>
                    {data.node.template[t].show &&
                    !data.node.template[t].advanced ? (
                      <ParameterComponent
                        data={data}
                        color={
                          nodeColors[types[data.node.template[t].type]] ??
                          nodeColors.unknown
                        }
                        title={data.node.template[t].name}
                        name={t}
                        tooltipTitle={
                          "Type: " +
                          data.node.template[t].type +
                          (data.node.template[t].list ? " list" : "")
                        }
                        required={data.node.template[t].required}
                        id={
                          data.node.template[t].type + "|" + t + "|" + data.id
                        }
                        left={true}
                        type={data.node.template[t].type}
                        selected={selected}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                ))}
              <div
                className={classNames(
                  Object.keys(data.node.template).length < 1 ? "hidden" : "",
                  "w-full flex justify-center",
                )}
              >
                {" "}
              </div>
              {/* <div className="px-5 py-2 mt-2 dark:text-white text-center">
    Output
  </div> */}

              {AccordionLikert({
                likertConfigs: likertConfigs,
                validationStatus: validationStatus,
                nodeData: data,
              })}

              <ParameterComponent
                data={data}
                color={nodeColors[types[data.type]] ?? nodeColors.unknown}
                // title={data.type}
                title={""}
                tooltipTitle={`Type: ${data.node.base_classes.join(" | ")}`}
                id={[data.type, data.id, ...data.node.base_classes].join("|")}
                type={data.node.base_classes.join("|")}
                left={false}
                selected={selected}
              />
            </>
          </div>
        ) : (
          // Only display data.value if not selected
          <div>
            {Object.keys(data.node.template)
              .filter((t) => t.charAt(0) !== "_")
              .slice(0, 1)
              .map((t: string, idx) => (
                <div key={idx}>
                  {data.node.template[t].show &&
                  !data.node.template[t].advanced ? (
                    <ParameterComponent
                      data={data}
                      color={
                        nodeColors[types[data.node.template[t].type]] ??
                        nodeColors.unknown
                      }
                      title={data.node.template[t].name}
                      name={t}
                      tooltipTitle={
                        "Type: " +
                        data.node.template[t].type +
                        (data.node.template[t].list ? " list" : "")
                      }
                      required={data.node.template[t].required}
                      id={data.node.template[t].type + "|" + t + "|" + data.id}
                      left={true}
                      type={data.node.template[t].type}
                      selected={selected}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            {roleTasks.some((field) => field.value !== "") && (
              <Box mb={2}>
                <Typography variant="body1">Role/Task:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {roleTasks.map(
                    (field, index) =>
                      field.value && (
                        <Chip
                          color="warning"
                          key={index}
                          label={`${field.key}: ${field.value}`}
                          variant="filled"
                          style={{
                            maxWidth: "12rem",
                            fontSize: 16,
                          }}
                        />
                      ),
                  )}
                </Box>
              </Box>
            )}

            {background.some((field) => field.value !== "") && (
              <Box mb={2}>
                <Typography variant="body1">Background:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {background.map(
                    (field, index) =>
                      field.value && (
                        <Chip
                          color="info"
                          key={index}
                          label={`${field.key}: ${field.value}`}
                          variant="filled"
                          style={{
                            maxWidth: "12rem",
                            fontSize: 16,
                          }}
                        />
                      ),
                  )}
                </Box>
              </Box>
            )}
            {data.node.template["persona_name"].value ? (
              <>
                {/* <div className="line-clamp-3">
              {data.node.template["persona_description"].value}
            </div> */}
                <div className="mt-4 text-md font-bold">
                  Click for Detailed Persona
                </div>
              </>
            ) : (
              ""
            )}
            <ParameterComponent
              data={data}
              color={nodeColors[types[data.type]] ?? nodeColors.unknown}
              title={""}
              tooltipTitle={`Type: ${data.node.base_classes.join(" | ")}`}
              id={[data.type, data.id, ...data.node.base_classes].join("|")}
              type={data.node.base_classes.join("|")}
              left={false}
              selected={selected}
            />
          </div>
        )}
      </div>
    </div>
  )

  return isInteractiveTutorialOpen && currentStep < 6 ? (
    <InteractiveTutorialComponent targetTutorialStep={4} childNodeId={data.id}>
      {childComponent}
    </InteractiveTutorialComponent>
  ) : childComponent
}
