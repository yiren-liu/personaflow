import { createContext, ReactNode, useState, useEffect } from "react"

import * as _ from "lodash"

type InteractiveTutorialContextType = {
  isInteractiveTutorialOpen: boolean
  setIsInteractiveTutorialOpen: (newState: boolean) => void
  interactiveTutorialSteps: Array<{
    title: string
    content: string
  }>
  setInteractiveTutorialSteps: (
    newState: Array<{
      title: string
      content: string
    }>,
  ) => void
  currentStep: number
  setCurrentStep: (newState: number) => void
  isInteractiveTutorialDone: boolean
  setIsInteractiveTutorialDone: (newState: boolean) => void
  targetNodeIds: Array<string>
  setTargetNodeIds: (newState: Array<string>) => void
}

const InteractiveTutorialContextTypeInitialValue: InteractiveTutorialContextType =
  {
    isInteractiveTutorialOpen: false,
    setIsInteractiveTutorialOpen: () => {},
    interactiveTutorialSteps: [],
    setInteractiveTutorialSteps: () => {},
    currentStep: 0,
    setCurrentStep: () => {},
    isInteractiveTutorialDone: false,
    setIsInteractiveTutorialDone: () => {},
    targetNodeIds: [],
    setTargetNodeIds: () => {},
  }

export const InteractiveTutorialContext =
  createContext<InteractiveTutorialContextType>(
    InteractiveTutorialContextTypeInitialValue,
  )

export const InteractiveTutorialContextTypeProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [isInteractiveTutorialOpen, setIsInteractiveTutorialOpen] =
    useState(false)
  const [interactiveTutorialSteps, setInteractiveTutorialSteps] = useState<
    Array<{
      title: string
      content: string
    }>
  >([
    {
      title: "Add the RQNode to the canvas",
      content: "This is the zeroth step",
    },
    {
      title: "Click on the RQNode to expand the node",
      content: "This is the first step",
    },
    {
      title: "Type in a research idea.",
      content: "This is the second step",
    },
    {
      title: "Click Next to generate persona nodes",
      content: "This is the third step",
    },
    {
      title: "Click on the persona node to expand it",
      content: "This is the fourth step",
    },
    {
      title: "Click Next to generate literature nodes  ",
      content: "This is the fifth step",
    },
    {
      title: "Click on the literature node to expand it",
      content: "This is the sixth step",
    },
    {
      title:
        "This pane shows the relevant literature papers based on the persona nodes. You can also add papers to any literature node simply by searching them.",
      content: "This is the seventh step",
    },
    {
      title:
        "Click Next to generate a critique node based on the previous literature and persona nodes",
      content: "This is the eighth step",
    },
    {
      title: "Click on the critique node to expand it",
      content: "This is the ninth step",
    },
    {
      title:
        "Click Next to generate a research question node based on the critique node",
      content: "This is the tenth step",
    },
    {
      title:
        "Click Next to select a research question and generate the details",
      content: "This is the eleventh step",
    },
    {
      title:
        "This pane shows you the generated literature review, research outline and hypothetical abstract",
      content: "This is the twelfth step",
    },
    // {
    //   title: "Type in a persona name",
    //   content: "This is the fifth step",
    // },
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [isInteractiveTutorialDone, setIsInteractiveTutorialDone] =
    useState(false)
  useEffect(() => {
    if (
      isInteractiveTutorialOpen &&
      currentStep === interactiveTutorialSteps.length
    ) {
      setIsInteractiveTutorialDone(true)
    }
  }, [currentStep, interactiveTutorialSteps, isInteractiveTutorialOpen])

  // the nodes that the tutorial is currently focusing on
  const [targetNodeIds, setTargetNodeIds] = useState<Array<string>>([])

  // useEffect(() => {
  //     console.log("isInteractiveTutorialOpen", isInteractiveTutorialOpen);
  // }, [isInteractiveTutorialOpen]);

  return (
    <InteractiveTutorialContext.Provider
      value={{
        isInteractiveTutorialOpen,
        setIsInteractiveTutorialOpen,
        interactiveTutorialSteps,
        setInteractiveTutorialSteps,
        currentStep,
        setCurrentStep,
        isInteractiveTutorialDone,
        setIsInteractiveTutorialDone,
        targetNodeIds,
        setTargetNodeIds,
      }}
    >
      {children}
    </InteractiveTutorialContext.Provider>
  )
}
