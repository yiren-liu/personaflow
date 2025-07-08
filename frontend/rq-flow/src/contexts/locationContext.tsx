import { createContext, ReactNode, useEffect, useState } from "react"

//types for location context
type locationContextType = {
  current: Array<string>
  setCurrent: (newState: Array<string>) => void
  isStackedOpen: boolean
  setIsStackedOpen: (newState: boolean) => void
  showSideBar: boolean
  setShowSideBar: (newState: boolean) => void
  extraNavigation: {
    title: string
    options?: Array<{
      name: string
      href: string
      icon: any
      children?: Array<any>
    }>
  }
  setExtraNavigation: (newState: {
    title: string
    options?: Array<{
      name: string
      href: string
      icon: any
      children?: Array<any>
    }>
  }) => void
  extraComponent: any
  setExtraComponent: (newState: any) => void
  searchParams: string
  setSearchParams: (newState: any) => void
  conditionIndex?: number | null
  setConditionIndex?: (newState: number | null) => void
  isBlockMode?: boolean
  setIsBlockMode?: (newState: boolean) => void
  isMindMapMode?: boolean
  setIsMindMapMode?: (newState: boolean) => void
}

//initial value for location context
const initialValue = {
  //actual
  current: window.location.pathname.replace(/\/$/g, "").split("/"),
  isStackedOpen:
    window.innerWidth > 1024 && window.location.pathname.split("/")[1]
      ? true
      : false,
  // isStackedOpen: false,
  setCurrent: () => {},
  setIsStackedOpen: () => {},
  showSideBar: window.location.pathname.split("/")[1] ? true : false,
  setShowSideBar: () => {},
  extraNavigation: { title: "" },
  setExtraNavigation: () => {},
  extraComponent: <></>,
  setExtraComponent: () => {},
  searchParams: "",
  setSearchParams: () => {},
  conditionIndex: null,
  setConditionIndex: () => {},
  isBlockMode: false,
  setIsBlockMode: () => {},
  isMindMapMode: false,
  setIsMindMapMode: () => {},
}

export const locationContext = createContext<locationContextType>(initialValue)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(initialValue.current)
  const [isStackedOpen, setIsStackedOpen] = useState(initialValue.isStackedOpen)
  const [showSideBar, setShowSideBar] = useState(initialValue.showSideBar)
  const [extraNavigation, setExtraNavigation] = useState({ title: "" })
  const [extraComponent, setExtraComponent] = useState(<></>)

  // new states
  const [searchParams, setSearchParams] = useState("")
  const [conditionIndex, setConditionIndex] = useState<number | null>(null)
  useEffect(() => {
    if (searchParams.includes("tempid=15sgt2")) {
      setConditionIndex(1)
    } else if (searchParams.includes("tempid=245gse")) {
      setConditionIndex(2)
    } else if (searchParams.includes("tempid=0412d3")) {
      setConditionIndex(0)
    } else {
	  setConditionIndex(null)
	}
  }, [searchParams])

  const [isMindMapMode, setIsMindMapMode] = useState(false)
  const [isBlockMode, setIsBlockMode] = useState(false)

  return (
    <locationContext.Provider
      value={{
        isStackedOpen,
        setIsStackedOpen,
        current,
        setCurrent,
        showSideBar,
        setShowSideBar,
        extraNavigation,
        setExtraNavigation,
        extraComponent,
        setExtraComponent,
        searchParams,
        setSearchParams,
		conditionIndex,
		setConditionIndex,
        isBlockMode,
        setIsBlockMode,
        isMindMapMode,
        setIsMindMapMode,
      }}
    >
      {children}
    </locationContext.Provider>
  )
}
