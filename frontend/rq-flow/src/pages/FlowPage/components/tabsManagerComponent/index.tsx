import { useCallback, useContext, useEffect, useState } from "react";
import { Card, IconButton, Menu, MenuItem } from "@mui/material";
import {
  BookImage,
  EllipsisVertical,
  Eraser,
  Info,
  LogOut,
  ArrowUpToLine,
  ArrowDownToLine,
  RefreshCw,
  SettingsIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ReactFlowProvider } from "reactflow";
import TabComponent from "../tabComponent";
import { TabsContext } from "../../../../contexts/tabsContext";
import FlowPage from "../..";
import { darkContext } from "../../../../contexts/darkContext";
import { PopUpContext } from "../../../../contexts/popUpContext";
import AlertDropdown from "../../../../alerts/alertDropDown";
import { alertContext } from "../../../../contexts/alertContext";
import ImportModal from "../../../../modals/importModal";
import ExportModal from "../../../../modals/exportModal";
import { typesContext } from "../../../../contexts/typesContext";

import { useApi } from "../../../../controllers/API";

import { createClient } from "@supabase/supabase-js";
import { InteractiveTutorialContext } from "@/contexts/InteractiveTutorialContext";
import { useUser } from "@/contexts/userContext";
import SettingsComponent from "./components/SettingsComponent";
const supabase = createClient(
  import.meta.env.VITE_APP_SUPABASE_URL,
  import.meta.env.VITE_APP_SUPABASE_KEY,
);
export default function TabsManagerComponent() {
  const { getSessionId, saveLog } = useApi();
  const { checkQuota, quotaUsage, quotaLimit, refreshInSeconds, settingsOpen, setSettingsOpen, isUsingSelfProvidedKey } = useUser();
  const {
    flows,
    addFlow,
    tabIndex,
    setTabIndex,
    uploadFlow,
    downloadFlow,
    hardReset,
  } = useContext(TabsContext);
  const { openPopUp } = useContext(PopUpContext);
  const { templates, softReset } = useContext(typesContext);
  const AlertWidth = 256;
  const { dark, setDark } = useContext(darkContext);
  const {
    notificationCenter,
    setNotificationCenter,
    setNoticeData,
    setErrorData,
    setSuccessData,
  } = useContext(alertContext);

  const [isDebugBGOpen, setIsDebugBGOpen] = useState(false);
  const {
    isInteractiveTutorialOpen,
    setIsInteractiveTutorialOpen,
    currentStep,
  } = useContext(InteractiveTutorialContext)

  const handleToggleBG = () => {
    setIsDebugBGOpen(!isDebugBGOpen);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchSessionId = useCallback(() => {
    getSessionId()
      .then((res) => {
        setSessionId(res.data.session_id);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [getSessionId]);

  useEffect(() => {
    //create the first flow
    if (flows.length === 0 && Object.keys(templates).length > 0) {
      addFlow();
    }
  }, [addFlow, flows.length, templates]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    getSessionId()
      .then((res) => {
        setSessionId(res.data.session_id);
      })
      .catch((error) => {
        console.log(error);
      });

    checkQuota().catch((error) => {
      console.log(error);
    });
  }, []);

  // a dialog panel for confirming flow reset
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const handleResetDialogOpen = () => {
    setResetDialogOpen(true);
  };
  const handleResetDialogConfirm = () => {
    softReset()
    saveLog("FlowReset", {})
    setResetDialogOpen(false);
    setSuccessData({
      title: "Your flow has been reset.",
    })
  };
  const handleResetDialogCancel = () => {
    setResetDialogOpen(false);
  };

  // dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    if (dropdownOpen) {
      checkQuota().catch((error) => {
        console.log(error)
      })
    }
  }, [dropdownOpen])


  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex w-full flex-row items-center bg-gray-100 px-2 pr-2 text-center dark:bg-gray-800">
        {flows.map((flow, index) => {
          return (
            <TabComponent
              onClick={() => setTabIndex(index)}
              selected={index === tabIndex}
              key={index}
              flow={flow}
            />
          )
        })}
        {/* <TabComponent
          onClick={() => {
            addFlow();
          }}
          selected={false}
          flow={null}
        /> */}
        <div className="ml-auto mr-2 flex gap-3">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <IconButton
                aria-label="more"
                id="long-button"
                style={{ padding: "2px" }}
              >
                <EllipsisVertical className="h-5 w-5" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{ width: "20ch", margin: "0 2ch 0 0" }}
              side="bottom"
            >
              <DropdownMenuGroup>
                <div className="px-2 py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Session ID
                  </span>
                  <br />
                  <span className="font-medium text-sm">{sessionId}</span>
                </div>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {!isUsingSelfProvidedKey && (
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Quota Usage
                        </span>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <IconButton
                                aria-label="info"
                                size="small"
                                className="ml-1"
                              >
                                <Info className="h-3 w-3" />
                              </IconButton>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Quota will be renewed in:{" "}
                                {Math.floor(refreshInSeconds / 60)}m
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center px-2">
                        <span className="font-medium">
                          {quotaUsage} / {quotaLimit}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 mx-2 my-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            checkQuota().catch((error) => {
                              console.log(error)
                            })
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => {
                    addFlow({
                      name: "Tutorial",
                      id: "tutorial",
                      data: {
                        edges: [],
                        nodes: [],
                        viewport: { x: 1, y: 0, zoom: 0.5 },
                      },
                      description: "",
                    })
                    setIsInteractiveTutorialOpen(true)
                  }}
                >
                  <BookImage className="mr-2 h-5 w-5" />
                  Interactive Tutorial
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <SettingsIcon className="mr-2 h-5 w-5" />
                      API Settings
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>API Settings</DialogTitle>
                      <DialogDescription>
                        Configure your OpenAI API settings. Choose between the
                        platform-provided service or your own API key.
                      </DialogDescription>
                    </DialogHeader>
                    <SettingsComponent />
                  </DialogContent>
                </Dialog>

                <DropdownMenuItem
                  onSelect={() => {
                    uploadFlow()
                    saveLog("FlowImport", {})
                  }}
                >
                  <ArrowUpToLine className="mr-2 h-5 w-5" />
                  Import Flow
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    downloadFlow(flows[tabIndex])
                    saveLog("FlowExport", {})
                  }}
                >
                  <ArrowDownToLine className="mr-2 h-5 w-5" />
                  Export Flow
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Dialog
                  open={resetDialogOpen}
                  onOpenChange={setResetDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <Eraser className="mr-2 h-5 w-5" />
                      Reset Flow
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Flow</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reset your flow? You will lose all your changes.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleResetDialogConfirm}
                      >
                        Reset
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem
                  onSelect={async () => {
                    await supabase.auth.signOut()
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-full w-full">
        <ReactFlowProvider>
          {flows[tabIndex] ? (
            <FlowPage flow={flows[tabIndex]}></FlowPage>
          ) : (
            <></>
          )}
        </ReactFlowProvider>
      </div>
    </div>
  )
}

function unsecuredCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Unable to copy to clipboard", err);
  }
  document.body.removeChild(textArea);
}
