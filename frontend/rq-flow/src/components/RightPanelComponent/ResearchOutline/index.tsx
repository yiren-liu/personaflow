import React, { useEffect, useState, useContext } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  TextField,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
// import {
//   GoogleOAuthProvider,
//   googleLogout,
//   useGoogleLogin,
// } from "@react-oauth/google"

import { contextMenuContext } from "../../../contexts/contextMenuContext"
import { TabsContext } from "../../../contexts/tabsContext"
import OutlineTable from "./components/ResearcherPersona"

import "./index.css"
import { typesContext } from "../../../contexts/typesContext"
import {
  // getLiteratureReview,
  // getTableSuggestion,
  // getAdditionalField,
  // getHypotheticalAbstract,
  // getResearchScenarios,
  // saveLog,
  // createGoogleDoc,
  // getSessionId,
  useApi,
} from "../../../controllers/API"
import {
  CritiqueNodeData,
  PersonaNodeData,
  RQNodeData,
} from "../../../types/api"

import { OutlineTableRow, ScenarioItem } from "../../../types/blocks"
import { alertContext } from "../../../contexts/alertContext"
import LiteratureReview from "./components/LiteratureReview"
import { color } from "d3"
import ProgressModal from "./components/ProgressModal"
import InteractiveTutorialComponent from "../../../pages/FlowPage/components/InteractiveTutorialComponent"
import { InteractiveTutorialContext } from "../../../contexts/InteractiveTutorialContext"
import { locationContext } from "../../../contexts/locationContext"
import { IosShareOutlined } from "@mui/icons-material"

const ResearchOutline = ({ isCollapsed }) => {
  const { getLiteratureReview, getTableSuggestion, getHypotheticalAbstract, getResearchScenarios, saveLog, createGoogleDoc, getSessionId } = useApi()
  const { setErrorData } = useContext(alertContext)
  const { searchParams } = useContext(locationContext)

  const { getNodeAllAncestors } = useContext(typesContext)
  const { save } = useContext(TabsContext)
  const { currentNode } = useContext(contextMenuContext)

  const [isLiteratureReviewLoading, setIsLiteratureReviewLoading] =
    useState(true)
  const [isLiteratureReviewReady, setIsLiteratureReviewReady] = useState(false)
  const [literatureReview, setLiteratureReview] = useState<Map<string, string>>(
    currentNode?.data?.literature_review,
  )

  // process ancestor nodes
  const ancestorNodesWithDepth = getNodeAllAncestors(currentNode)
  const ancestorNodes = ancestorNodesWithDepth.map((item) => item.node)
  // closest ancestor of LiteratureNode
  const ancestorLitNodes = ancestorNodes.filter(
    (node) => node.data.type === "LiteratureNode",
  )
  const latestLitNode = ancestorLitNodes.length > 0 ? ancestorLitNodes[0] : null
  const latestLitNodeDataList =
    latestLitNode?.data?.node?.template?.paper_list?.value || []
  const ancestorLitNodeDataList = ancestorLitNodes
    .map((node) => node.data.node?.template.paper_list.value || [])
    .flat()

  // closest ancestor of CritiqueNode
  const ancestorCritNodes = ancestorNodes.filter(
    (node) => node.data.type === "CritiqueNode",
  )
  const latestCritNode =
    ancestorCritNodes.length > 0 ? ancestorCritNodes[0] : null
  // closest ancestor of PersonaNode
  const ancestorPersonaNodes = ancestorNodes.filter(
    (node) => node.data.type === "PersonaNode",
  )
  const latestPersonaNode =
    ancestorPersonaNodes.length > 0 ? ancestorPersonaNodes[0] : null

  const [currRQNodeData, setCurrRQNodeData] = useState<RQNodeData>({
    rq_text: currentNode?.data?.userInput || "",
  })
  const [latestCritNodeData, setLatestCritNodeData] =
    useState<CritiqueNodeData>({
      critique_aspect:
        latestCritNode?.data?.node?.template?.critique_aspect?.value || "",
      critique_detail:
        latestCritNode?.data?.node?.template?.critique_detail?.value || "",
    })
  const [latestPersonaNodeData, setLatestPersonaNodeData] =
    useState<PersonaNodeData>({
      persona_name:
        latestPersonaNode?.data?.node?.template?.persona_name?.value || "",
      persona_description:
        latestPersonaNode?.data?.node?.template?.persona_description?.value ||
        "",
    })

  const { isInteractiveTutorialOpen, currentStep } = useContext(
    InteractiveTutorialContext,
  )

  useEffect(() => {
    if (!currentNode?.data?.literature_review) {
      setLiteratureReview(new Map<string, string>())
      setIsLiteratureReviewLoading(true)
      setIsLiteratureReviewReady(false)
    }
    if (!currentNode?.data?.scenarioDetails) {
      setCurrScenarioes([
        {
          scenario: "",
          scenarioSuggestions: [],
          researchOutline: null,
          hypotheticalAbstract: null,
        },
      ])
      // setIsScenarioLoading(true)
      setIsScenarioReady(false)
      return
    }
    if (!currentNode?.data?.scenarioDetails[currScenarioIndex].scenario) {
      setIsScenarioReady(false)
      return
    }

    setIsScenarioReady(true)
    if (
      !currentNode?.data?.scenarioDetails ||
      !currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline
    ) {
      setResearchOutline(null)
      setIsResearchOutlineLoading(true)
      setIsResearchOutlineReady(false)
    }
    if (
      !currentNode?.data?.scenarioDetails ||
      !currentNode?.data?.scenarioDetails[currScenarioIndex]
        .hypothetical_abstract
    ) {
      setHypotheticalAbstract("")
      setIsHypotheticalAbstractLoading(true)
      setIsHypotheticalAbstractReady(false)
    }
  }, [currentNode])

  useEffect(() => {
    if (!latestLitNode) {
      setTimeout(() => {
        setLiteratureReview(
          new Map<string, string>([
            ["title", "Add Literature Nodes to generate Literature Review"],
            ["abstract", ""],
          ]),
        )
        setIsLiteratureReviewLoading(false)
        setIsLiteratureReviewReady(true)
        setResearchOutline([new Map<string, string>()])
        setIsResearchOutlineLoading(false)
        setIsResearchOutlineReady(true)
        setHypotheticalAbstract(
          "Add Literature Nodes to generate Hypothetical Abstract",
        )
        setIsHypotheticalAbstractLoading(false)
        setIsHypotheticalAbstractReady(true)
      }, 1000)
    }
  }, [currentNode])

  useEffect(() => {
    if (
      currentNode?.data?.literature_review &&
      currentNode?.data?.literature_review !== ""
    ) {
      setLiteratureReview(currentNode?.data?.literature_review)

      setIsLiteratureReviewLoading(false)
      setIsLiteratureReviewReady(true)
    } else {
      // logic to get literature review
      if (latestLitNode && latestLitNodeDataList.length > 0) {
        getLiteratureReview(
          ancestorLitNodeDataList,
          currRQNodeData,
          ancestorNodesWithDepth,
        )
          .then((response) => {
            currentNode.data.literature_review =
              response.data["literature_review"]

            console.log("response", response.data["literature_review"])
            setLiteratureReview(response.data["literature_review"])
            setIsLiteratureReviewLoading(false)
            setIsLiteratureReviewReady(true)
            save()
            handleGetScenarioSuggestions()

            saveLog("GetLiteratureReview", {
              node_data: currentNode.data,
              literature_review: currentNode.data.literature_review,
              searchParams: searchParams,
            })
          })
          .catch((error) => {
            setErrorData({
              title: "Error",
              list: [error.message],
            })
          })
      }
    }
  }, [currentNode, latestLitNodeDataList, isLiteratureReviewReady])

  const [isScenarioLoading, setIsScenarioLoading] = useState(true)
  const [isScenarioReady, setIsScenarioReady] = useState(false)
  const [currScenarioIndex, setCurrScenarioIndex] = useState(0)
  const [currScenarioes, setCurrScenarioes] = useState<ScenarioItem[]>(
    currentNode?.data?.scenarioDetails ||
      ([
        {
          scenario: "",
          researchOutline: null,
          hypotheticalAbstract: null,
        },
      ] as ScenarioItem[]),
  )
  const [scenarioInput, setScenarioInput] = useState<string>(
    currScenarioes[currScenarioIndex]
      ? currScenarioes[currScenarioIndex].scenario
      : "",
  )
  const [isScenarioInputChanged, setIsScenarioInputChanged] = useState(false)
  const [isScenarioInputActive, setIsScenarioInputActive] = useState(true)
  const handleScenarioEdit = () => {
    let scenario = currScenarioes[currScenarioIndex]
    scenario.scenario = scenarioInput
    setCurrScenarioes([
      ...currScenarioes.slice(0, currScenarioIndex),
      scenario,
      ...currScenarioes.slice(currScenarioIndex + 1),
    ])
    setIsScenarioInputChanged(false)

    setIsScenarioReady(true)
    resetResearchOutline()
    resetHypotheticalAbstract()

    saveLog("EditResearchScenario", {
      scenario: scenarioInput,
      node_data: currentNode.data,
      searchParams: searchParams,
    })
  }
  useEffect(() => {
    if (
      currScenarioes[currScenarioIndex].scenario !== scenarioInput &&
      scenarioInput !== ""
    ) {
      setIsScenarioInputChanged(true)
    } else {
      setIsScenarioInputChanged(false)
    }
  }, [scenarioInput])
  const handleScenarioCreate = () => {
    if (currScenarioes === null) {
      setCurrScenarioes([])
    }
    setCurrScenarioes([
      ...currScenarioes,
      {
        scenario: "",
        scenarioSuggestions: [],
        researchOutline: null,
        hypotheticalAbstract: null,
      },
    ])
    setScenarioInput("")
    setCurrScenarioIndex(currScenarioes.length - 1)
  }
  const handleScenarioDelete = (index: number) => {
    setCurrScenarioes(currScenarioes.filter((_, i) => i !== index))
    if (currScenarioIndex > currScenarioes.length - 1) {
      setCurrScenarioIndex(currScenarioes.length - 1)
    }
  }
  const handleScenarioSelect = (index: number) => {
    // TODO
  }
  const handleGetScenarioSuggestions = () => {
    getResearchScenarios(
      ancestorLitNodeDataList,
      currRQNodeData,
      ancestorNodesWithDepth,
    )
      .then((response) => {
        setCurrScenarioes(
          currScenarioes.map((scenario, index) => {
            return {
              ...scenario,
              scenarioSuggestions: response.data.research_scenarios,
            }
          }),
        )

        saveLog("GetResearchScenarioSuggestions", {
          scenario_suggestions: response.data.research_scenarios,
          node_data: currentNode.data,
          searchParams: searchParams,
        })
      })
      .catch((error) => {
        setErrorData({
          title: "Error",
          list: [error.message],
        })
      })
  }

  useEffect(() => {
    currentNode.data.scenarioDetails = currScenarioes
    save()
  }, [currScenarioes])

  const [isResearchOutlineLoading, setIsResearchOutlineLoading] = useState(true)
  const [isResearchOutlineReady, setIsResearchOutlineReady] = useState(false)
  const [researchOutline, setResearchOutline] = useState<
    Map<string, string>[] | null
  >(
    currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline,
  )
  const [outlineTableRows, setOutlineTableRows] = useState<OutlineTableRow[]>(
    [],
  )
  // react hook for parsing outline table rows from research outline
  useEffect(() => {
    console.log("researchOutline", researchOutline)
    if (researchOutline) {
      currentNode.data.scenarioDetails[currScenarioIndex].researchOutline =
        researchOutline
      setOutlineTableRows(
        researchOutline.map((row) => {
          return {
            section: row["title"],
            description: row["description"],
            isNew: false,
            isEditing: false,
            isLoading: false,
          }
        }),
      )
      // setOutlineTableRows(outlineTableRows);
    }
  }, [researchOutline])

  useEffect(() => {
    if (!isLiteratureReviewReady) {
      return
    }

    if (!isScenarioReady) {
      setIsResearchOutlineLoading(false)
      setIsHypotheticalAbstractLoading(false)
      return
    }

    if (
      currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline &&
      currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline
        .length > 0
    ) {
      setResearchOutline(
        currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline,
      )

      setIsResearchOutlineLoading(false)
      setIsResearchOutlineReady(true)
    } else {
      // logic to get research outline
      if (latestLitNode && latestLitNodeDataList.length > 0) {
        getTableSuggestion(
          currRQNodeData,
          latestPersonaNodeData,
          latestCritNodeData,
          ancestorLitNodeDataList,
          ancestorNodesWithDepth,
          [currScenarioes[currScenarioIndex].scenario],
        )
          .then((response) => {
            setResearchOutline(response.data)
            setIsResearchOutlineLoading(false)
            setIsResearchOutlineReady(true)
            save()

            saveLog("GetResearchOutline", {
              research_outline: response.data,
              node_data: currentNode.data,
              searchParams: searchParams,
            })
          })
          .catch((error) => {
            setErrorData({
              title: "Error",
              list: [error.message],
            })
          })
      }
    }
  }, [
    currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex].researchOutline,
    isLiteratureReviewReady,
    isScenarioReady,
  ])

  const [isHypotheticalAbstractLoading, setIsHypotheticalAbstractLoading] =
    useState(true)
  const [isHypotheticalAbstractReady, setIsHypotheticalAbstractReady] =
    useState(false)
  const [hypotheticalAbstract, setHypotheticalAbstract] = useState(
    currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex]
        .hypothetical_abstract,
  )

  useEffect(() => {
    if (!isResearchOutlineReady) {
      return
    }

    if (
      currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex]
        .hypothetical_abstract
    ) {
      setHypotheticalAbstract(
        currentNode?.data?.scenarioDetails[currScenarioIndex]
          .hypothetical_abstract,
      )

      setIsHypotheticalAbstractLoading(false)
      setIsHypotheticalAbstractReady(true)
    } else {
      const tableData = {
        text: outlineTableRows
          .map(
            (row) =>
              "Section: " + row.section + "\t Description: " + row.description,
          )
          .join("\n"),
      }
      getHypotheticalAbstract(
        currRQNodeData,
        latestPersonaNodeData,
        latestCritNodeData,
        ancestorLitNodeDataList,
        tableData,
        ancestorNodesWithDepth,
        [currScenarioes[currScenarioIndex].scenario],
      )
        .then((response) => {
          currentNode.data.scenarioDetails[
            currScenarioIndex
          ].hypothetical_abstract = response.data.hypothetical_abstract
          setHypotheticalAbstract(response.data.hypothetical_abstract)
          setIsHypotheticalAbstractLoading(false)
          setIsHypotheticalAbstractReady(true)
          save()

          saveLog("GetHypotheticalAbstract", {
            hypothetical_abstract: response.data.hypothetical_abstract,
            node_data: currentNode.data,
            searchParams: searchParams,
          })
        })
        .catch((error) => {
          setErrorData({
            title: "Error",
            list: [error.message],
          })
        })
    }
  }, [
    currentNode?.data?.scenarioDetails &&
      currentNode?.data?.scenarioDetails[currScenarioIndex]
        .hypothetical_abstract,
    isResearchOutlineReady,
  ])

  // for monitoring the readiness of the outline panel
  const [isOutlinePanelReady, setIsOutlinePanelReady] = useState(false)
  useEffect(() => {
    if (
      isLiteratureReviewReady &&
      isResearchOutlineReady &&
      isHypotheticalAbstractReady
    ) {
      setIsOutlinePanelReady(true)
    } else {
      setIsOutlinePanelReady(false)
    }
  }, [
    isLiteratureReviewReady,
    isResearchOutlineReady,
    isHypotheticalAbstractReady,
  ])

  // for exporting google doc
  const [googleDocData, setGoogleDocData] = useState({})

  // const [token, setToken] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  useEffect(() => {
    if (
      isLiteratureReviewReady ||
      isResearchOutlineReady ||
      isHypotheticalAbstractReady
    ) {
      setGoogleDocData({
        sessionId: sessionId || "",
        literatureReview: literatureReview || "",
        researchOutline: researchOutline || "",
        hypotheticalAbstract: hypotheticalAbstract || "",
        researchQuestion: currentNode?.data?.userInput || "",
        scenarioInput: scenarioInput || "",
      })
    }
  }, [
    isLiteratureReviewReady,
    isResearchOutlineReady,
    isHypotheticalAbstractReady,
    literatureReview,
    researchOutline,
    hypotheticalAbstract,
    currentNode?.data,
    scenarioInput,
  ])

  // const login = useGoogleLogin({
  //   onSuccess: (tokenResponse) => {
  //     const accessToken = tokenResponse.access_token
  //     setToken(accessToken)
  //     exportToGoogleDoc(accessToken)
  //   },
  //   onError: () => {
  //     console.log("Login Failed")
  //   },
  //   scope: "https://www.googleapis.com/auth/documents",
  // })
  const exportToGoogleDoc = async () => {
    setIsExporting(true)
    createGoogleDoc(googleDocData)
      .then((response) => {
        console.log(response)
        const docUrl = `https://docs.google.com/document/d/${response.data.documentId}/edit`
        window.open(docUrl, "_blank")
        setIsExporting(false)
      })
      .catch((error) => {
        console.log(error)
        setIsExporting(false)
      })
  }

  const [sessionId, setSessionId] = useState<string | null>(null)
  useEffect(() => {
    getSessionId()
      .then((res) => {
        setSessionId(res.data.session_id)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  // functions to handle regeneration
  const resetLiteratureReview = () => {
    setLiteratureReview(new Map<string, string>())
    currentNode.data.literature_review = ""
    setIsLiteratureReviewLoading(true)
    setIsLiteratureReviewReady(false)
    save()
  }
  const resetScenario = () => {
    setCurrScenarioes([
      {
        scenario: "",
        scenarioSuggestions: [],
        researchOutline: null,
        hypotheticalAbstract: null,
      },
    ])
    setIsScenarioLoading(true)
    setIsScenarioReady(false)
    save()
  }
  const resetResearchOutline = () => {
    setResearchOutline(null)
    currentNode.data.scenarioDetails[currScenarioIndex].researchOutline = null
    setIsResearchOutlineLoading(true)
    setIsResearchOutlineReady(false)
    save()
  }
  const resetHypotheticalAbstract = () => {
    setHypotheticalAbstract("")
    currentNode.data.scenarioDetails[currScenarioIndex].hypothetical_abstract =
      ""
    setIsHypotheticalAbstractLoading(true)
    setIsHypotheticalAbstractReady(false)
    save()
  }
  const handleRegenerateLiteratureReview = () => {
    resetLiteratureReview()
    resetScenario()
    resetResearchOutline()
    resetHypotheticalAbstract()
  }
  const handleRegenerateResearchOutline = () => {
    resetResearchOutline()
    resetHypotheticalAbstract()
  }
  const handleRegenerateHypotheticalAbstract = () => {
    resetHypotheticalAbstract()
  }

  if (isCollapsed) {
    return null
  }

  if (currentNode?.data?.id === "dndnode_1") {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Typography variant="body1" ml={1}>
          Click on other RQ nodes to generate research outline.
        </Typography>
      </Box>
    )
  }

  return isInteractiveTutorialOpen &&
    currentStep === 12 &&
    isHypotheticalAbstractReady &&
    isLiteratureReviewReady &&
    isResearchOutlineReady ? (
    <InteractiveTutorialComponent>
      <div className="overflow-y-auto bg-slate-100">
        <div className="flex flex-col">
          <Box
            // variant="outlined"

            style={{
              margin: "1em 1em",
              // padding: "1em",
              // border: "2px dashed #ccc",
              borderRadius: "10px",
              overflow: "initial",
              backgroundColor: "white",
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                className="mb-4 font-sans font-bold capitalize tracking-wide subpixel-antialiased"
              >
                Research Question
              </Typography>
              <Typography variant="body1" className="mx-4">
                {currentNode?.data?.userInput}
              </Typography>
            </CardContent>
          </Box>

          <Divider>
            {isLiteratureReviewLoading && (
              <span className="dots mr-2">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            )}
            {isLiteratureReviewReady && (
              <IconButton
                onClick={handleRegenerateLiteratureReview}
                color="primary"
                style={{ marginLeft: "0", color: "grey" }}
                aria-label="refresh"
              >
                <RefreshIcon />
              </IconButton>
            )}
            Digest Prior Literature
          </Divider>
          {isLiteratureReviewReady && (
            <>
              <Box
                // variant="outlined"
                style={{
                  margin: "1em 1em",
                  // padding: "1em",
                  // border: "2px dashed #ccc",
                  borderRadius: "10px",
                  overflow: "initial",
                  backgroundColor: "white",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h4"
                    className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                  >
                    Literature Review
                  </Typography>
                  {/* <Typography variant="body2">{literatureReview} </Typography> */}
                  <LiteratureReview content={literatureReview} />
                </CardContent>
              </Box>

              <Divider>
                {/* {isScenarioLoading && (
                  <span className="dots mr-2">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                )} */}
                {/* {isOutlinePanelReady && (
                  <IconButton
                    // onClick={handleRegenerateLiteratureReview}
                    color="primary"
                    style={{ marginLeft: "0", color: "grey" }}
                    aria-label="refresh"
                  >
                    <RefreshIcon />
                  </IconButton>
                )} */}
                Propose Research Scenario
              </Divider>

              <Box
                // variant="outlined"
                style={{
                  margin: "1em 1em",
                  // padding: "1em",
                  // border: "2px dashed #ccc",
                  borderRadius: "10px",
                  overflow: "initial",
                  backgroundColor: "white",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h4"
                    className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                  >
                    Research Scenario
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mb-4 tracking-wide subpixel-antialiased"
                  >
                    Based on the above gap, you can further refine the research
                    scope by further refining the research scenario…
                  </Typography>
                  {currScenarioes &&
                    currScenarioes[currScenarioIndex].scenarioSuggestions
                      ?.length > 0 && (
                      <div className="my-4">
                        <Typography variant="body2" className="font-bold">
                          Suggestions:
                        </Typography>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currScenarioes[
                            currScenarioIndex
                          ].scenarioSuggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              onClick={() => setScenarioInput(suggestion)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  <Paper
                    style={{
                      padding: "1em",
                      borderRadius: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    <div className="flex justify-between">
                      <TextField
                        value={scenarioInput}
                        onChange={(e) => setScenarioInput(e.target.value)}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        size="small"
                        multiline
                      />
                      {isScenarioInputChanged && (
                        // <IconButton
                        //   onClick={handleScenarioEdit}
                        //   color="primary"
                        //   style={{ marginLeft: "0", color: "grey" }}
                        //   aria-label="refresh"
                        // >
                        //   <CheckCircleOutlineIcon />
                        // </IconButton>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleScenarioEdit}
                          style={{ marginLeft: "1rem" }}
                        >
                          Generate Research Outline
                        </Button>
                      )}
                    </div>
                  </Paper>
                </CardContent>
              </Box>

              {isScenarioReady && (
                <>
                  <Divider>
                    {isResearchOutlineLoading && (
                      <span className="dots mr-2">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    )}
                    {isOutlinePanelReady && (
                      <IconButton
                        onClick={handleRegenerateResearchOutline}
                        color="primary"
                        style={{ marginLeft: "0", color: "grey" }}
                        aria-label="refresh"
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                    Plan Your Research
                  </Divider>

                  {isResearchOutlineReady && (
                    <>
                      <Box
                        // variant="outlined"
                        style={{
                          margin: "1em 1em",
                          // padding: "1em",
                          // border: "2px dashed #ccc",
                          borderRadius: "10px",
                          overflow: "initial",
                          backgroundColor: "white",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h4"
                            className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                          >
                            Potential Research Outline
                          </Typography>
                          {/* <Typography variant="body1">{researchOutline}</Typography> */}
                          <OutlineTable
                            rows={outlineTableRows}
                            setRows={setOutlineTableRows}
                            researchOutline={researchOutline}
                            setResearchOutline={setResearchOutline}
                            rqNodeData={currRQNodeData}
                            personaNodeData={latestPersonaNodeData}
                            critiqueNodeData={latestCritNodeData}
                            literatureNodeDataList={ancestorLitNodeDataList}
                            ancestorNodesWithDepth={ancestorNodesWithDepth}
                            currScenarioes={currScenarioes}
                            currScenarioIndex={currScenarioIndex}
                          />
                        </CardContent>
                      </Box>

                      <Divider>
                        {isHypotheticalAbstractLoading && (
                          <span className="dots mr-2">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </span>
                        )}
                        {isOutlinePanelReady && (
                          <IconButton
                            onClick={handleRegenerateHypotheticalAbstract}
                            color="primary"
                            style={{ marginLeft: "0", color: "grey" }}
                            aria-label="refresh"
                          >
                            <RefreshIcon />
                          </IconButton>
                        )}
                        Hypothesize Outcome
                      </Divider>

                      {isHypotheticalAbstractReady && (
                        <>
                          <Box
                            // variant="outlined"
                            style={{
                              margin: "1em 1em",
                              // padding: "1em",
                              // border: "2px dashed #ccc",
                              borderRadius: "10px",
                              overflow: "initial",
                              backgroundColor: "white",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="h4"
                                className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                              >
                                Expected Outcomes
                              </Typography>
                              <Typography variant="body2">
                                {hypotheticalAbstract}
                              </Typography>
                            </CardContent>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <ProgressModal
          open={
            isLiteratureReviewLoading ||
            isResearchOutlineLoading ||
            isHypotheticalAbstractLoading
          }
          message={
            isLiteratureReviewLoading
              ? "Generating Literature Review..."
              : isResearchOutlineLoading
                ? "Generating Research Outline..."
                : "Generating Hypothetical Abstract..."
          }
          progress={
            isLiteratureReviewLoading
              ? 0
              : isResearchOutlineLoading
                ? 34
                : isHypotheticalAbstractLoading
                  ? 67
                  : 100
          }
        />
      </div>
    </InteractiveTutorialComponent>
  ) : (
    <div className="overflow-y-auto bg-slate-100">
      <div className="flex flex-col">
        <Box
          // variant="outlined"

          style={{
            margin: "1em 1em",
            // padding: "1em",
            // border: "2px dashed #ccc",
            borderRadius: "10px",
            overflow: "initial",
            backgroundColor: "white",
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              className="mb-4 font-sans font-bold capitalize tracking-wide subpixel-antialiased"
            >
              Research Question
            </Typography>
            <Typography variant="body1" className="mx-4">
              {currentNode?.data?.userInput}
            </Typography>
          </CardContent>
        </Box>

        <Divider>
          {isLiteratureReviewLoading && (
            <span className="dots mr-2">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          )}
          {isLiteratureReviewReady && (
            <IconButton
              onClick={handleRegenerateLiteratureReview}
              color="primary"
              style={{ marginLeft: "0", color: "grey" }}
              aria-label="refresh"
            >
              <RefreshIcon />
            </IconButton>
          )}
          Digest Prior Literature
        </Divider>
        {isLiteratureReviewReady && (
          <>
            <Box
              // variant="outlined"
              style={{
                margin: "1em 1em",
                // padding: "1em",
                // border: "2px dashed #ccc",
                borderRadius: "10px",
                overflow: "initial",
                backgroundColor: "white",
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                >
                  Literature Review
                </Typography>
                {/* <Typography variant="body2">{literatureReview} </Typography> */}
                <LiteratureReview content={literatureReview} />
              </CardContent>
            </Box>

            <Divider>
              {/* {isScenarioLoading && (
                <span className="dots mr-2">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              )} */}
              {/* {isOutlinePanelReady && (
                <IconButton
                  // onClick={handleRegenerateLiteratureReview}
                  color="primary"
                  style={{ marginLeft: "0", color: "grey" }}
                  aria-label="refresh"
                >
                  <RefreshIcon />
                </IconButton>
              )} */}
              Propose Research Scenario
            </Divider>

            <Box
              // variant="outlined"
              style={{
                margin: "1em 1em",
                // padding: "1em",
                // border: "2px dashed #ccc",
                borderRadius: "10px",
                overflow: "initial",
                backgroundColor: "white",
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                >
                  Research Scenario
                </Typography>
                <Typography
                  variant="caption"
                  className="mb-4 tracking-wide subpixel-antialiased"
                >
                  Based on the above gap, you can further refine the research
                  scope by further refining the research scenario…
                </Typography>
                {currScenarioes &&
                  currScenarioes[currScenarioIndex].scenarioSuggestions
                    ?.length > 0 && (
                    <div className="my-4">
                      <Typography variant="body2" className="font-bold">
                        Suggestions:
                      </Typography>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currScenarioes[
                          currScenarioIndex
                        ].scenarioSuggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            onClick={() => setScenarioInput(suggestion)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                <Paper
                  style={{
                    padding: "1em",
                    borderRadius: "10px",
                    backgroundColor: "white",
                  }}
                >
                  <div className="flex justify-between">
                    <TextField
                      value={scenarioInput}
                      onChange={(e) => setScenarioInput(e.target.value)}
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      size="small"
                      multiline
                    />
                    {isScenarioInputChanged && (
                      // <IconButton
                      //   onClick={handleScenarioEdit}
                      //   color="primary"
                      //   style={{ marginLeft: "0", color: "grey" }}
                      //   aria-label="refresh"
                      // >
                      //   <CheckCircleOutlineIcon />
                      // </IconButton>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleScenarioEdit}
                        style={{ marginLeft: "1rem" }}
                      >
                        Generate Research Outline
                      </Button>
                    )}
                  </div>
                </Paper>
              </CardContent>
            </Box>

            {isScenarioReady && (
              <>
                <Divider>
                  {isResearchOutlineLoading && (
                    <span className="dots mr-2">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  )}
                  {isOutlinePanelReady && (
                    <IconButton
                      onClick={handleRegenerateResearchOutline}
                      color="primary"
                      style={{ marginLeft: "0", color: "grey" }}
                      aria-label="refresh"
                    >
                      <RefreshIcon />
                    </IconButton>
                  )}
                  Plan Your Research
                </Divider>

                {isResearchOutlineReady && (
                  <>
                    <Box
                      // variant="outlined"
                      style={{
                        margin: "1em 1em",
                        // padding: "1em",
                        // border: "2px dashed #ccc",
                        borderRadius: "10px",
                        overflow: "initial",
                        backgroundColor: "white",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h4"
                          className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                        >
                          Potential Research Outline
                        </Typography>
                        {/* <Typography variant="body1">{researchOutline}</Typography> */}
                        <OutlineTable
                          rows={outlineTableRows}
                          setRows={setOutlineTableRows}
                          researchOutline={researchOutline}
                          setResearchOutline={setResearchOutline}
                          rqNodeData={currRQNodeData}
                          personaNodeData={latestPersonaNodeData}
                          critiqueNodeData={latestCritNodeData}
                          literatureNodeDataList={ancestorLitNodeDataList}
                          ancestorNodesWithDepth={ancestorNodesWithDepth}
                          currScenarioes={currScenarioes}
                          currScenarioIndex={currScenarioIndex}
                        />
                      </CardContent>
                    </Box>

                    <Divider>
                      {isHypotheticalAbstractLoading && (
                        <span className="dots mr-2">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </span>
                      )}
                      {isOutlinePanelReady && (
                        <IconButton
                          onClick={handleRegenerateHypotheticalAbstract}
                          color="primary"
                          style={{ marginLeft: "0", color: "grey" }}
                          aria-label="refresh"
                        >
                          <RefreshIcon />
                        </IconButton>
                      )}
                      Hypothesize Outcome
                    </Divider>

                    {isHypotheticalAbstractReady && (
                      <>
                        <Box
                          // variant="outlined"
                          style={{
                            margin: "1em 1em",
                            // padding: "1em",
                            // border: "2px dashed #ccc",
                            borderRadius: "10px",
                            overflow: "initial",
                            backgroundColor: "white",
                          }}
                        >
                          <CardContent>
                            <Typography
                              variant="h4"
                              className="mb-4 font-bold capitalize tracking-wide subpixel-antialiased"
                            >
                              Expected Outcomes
                            </Typography>
                            <Typography variant="body2">
                              {hypotheticalAbstract}
                            </Typography>
                          </CardContent>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {isExporting ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => exportToGoogleDoc()}
            style={{
              margin: "1rem 1rem",
              width: "fit-content",
              alignSelf: "center",
            }}
            disabled={
              !isOutlinePanelReady ||
              !isHypotheticalAbstractReady ||
              !isLiteratureReviewReady ||
              !isResearchOutlineReady ||
              !isScenarioReady
            }
            endIcon={<IosShareOutlined />}
          >
            Export Study
          </Button>
        )}
      </div>
      <ProgressModal
        open={
          isLiteratureReviewLoading ||
          isResearchOutlineLoading ||
          isHypotheticalAbstractLoading
        }
        message={
          isLiteratureReviewLoading
            ? "Generating Literature Review..."
            : isResearchOutlineLoading
              ? "Generating Research Outline..."
              : "Generating Hypothetical Abstract..."
        }
        progress={
          isLiteratureReviewLoading
            ? 0
            : isResearchOutlineLoading
              ? 34
              : isHypotheticalAbstractLoading
                ? 67
                : 100
        }
      />
    </div>
  )
}

export default ResearchOutline
