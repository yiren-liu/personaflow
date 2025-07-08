import "reactflow/dist/style.css";
import { useState, useEffect, useContext } from "react";
import "./App.css";
// import "./index.css";
import { useLocation } from "react-router-dom";
import ErrorAlert from "./alerts/error";
import NoticeAlert from "./alerts/notice";
import SuccessAlert from "./alerts/success";
import ExtraSidebar from "./components/ExtraSidebarComponent";
import { alertContext } from "./contexts/alertContext";
import { locationContext } from "./contexts/locationContext";
import TabsManagerComponent from "./pages/FlowPage/components/tabsManagerComponent";
import { ErrorBoundary } from "react-error-boundary";
import CrashErrorComponent from "./components/CrashErrorComponent";
import { TabsContext } from "./contexts/tabsContext";
import { set } from "lodash";


import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Auth } from "@supabase/auth-ui-react";
import { useAuth } from "./contexts/authContext";

import * as _ from "lodash";

import { Toaster } from "@/components/ui/toaster"


export default function App({ mindMapMode = false, blockMode = false }) {
  const { supabaseClient } = useAuth();
  // var _ = require("lodash");

  let {
    setCurrent,
    setShowSideBar,
    setIsStackedOpen,
    setSearchParams,
    setIsBlockMode,
    setIsMindMapMode,
  } = useContext(locationContext);

  useEffect(() => {
    setIsMindMapMode(mindMapMode);
    setIsBlockMode(blockMode);
  });

  let location = useLocation();
  useEffect(() => {
    setCurrent(location.pathname.replace(/\/$/g, "").split("/"));
    setShowSideBar(true);
    setIsStackedOpen(true);
    // setIsStackedOpen(false);

    setSearchParams(location.search);
  }, [
    location.pathname,
    location.search,
    setCurrent,
    setIsStackedOpen,
    setShowSideBar,
    setSearchParams,
  ]);
  const { hardReset } = useContext(TabsContext);
  const {
    errorData,
    errorOpen,
    setErrorOpen,
    noticeData,
    noticeOpen,
    setNoticeOpen,
    successData,
    successOpen,
    setSuccessOpen,
  } = useContext(alertContext);

  // Initialize state variable for the list of alerts
  const [alertsList, setAlertsList] = useState<
    Array<{
      type: string;
      data: { title: string; list?: Array<string>; link?: string };
      id: string;
    }>
  >([]);

  const [session, setSession] = useState(null);

  // Use effect hook to update alertsList when a new alert is added
  useEffect(() => {
    // If there is an error alert open with data, add it to the alertsList
    if (errorOpen && errorData) {
      setErrorOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "error", data: _.cloneDeep(errorData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
    // If there is a notice alert open with data, add it to the alertsList
    else if (noticeOpen && noticeData) {
      setNoticeOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "notice", data: _.cloneDeep(noticeData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
    // If there is a success alert open with data, add it to the alertsList
    else if (successOpen && successData) {
      setSuccessOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "success", data: _.cloneDeep(successData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
  }, [
    _,
    errorData,
    errorOpen,
    noticeData,
    noticeOpen,
    setErrorOpen,
    setNoticeOpen,
    setSuccessOpen,
    successData,
    successOpen,
  ]);

  const removeAlert = (id: string) => {
    setAlertsList((prevAlertsList) =>
      prevAlertsList.filter((alert) => alert.id !== id),
    );
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      // <div className="auth-card">
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
          <Auth
            supabaseClient={supabaseClient}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "orange",
                    brandAccent: "darkorange",
                  },
                },
              },
            }}
            view="sign_in"
            providers={["google"]}
            redirectTo={`${window.location.origin}/block`}
          />
        </div>
      </div>
    );
  }

  return (
    //need parent component with width and height
    <div className="flex h-full flex-col">
      <div className="flex shrink grow-0 basis-auto"></div>
      <ErrorBoundary
        onReset={() => {
          window.localStorage.removeItem("tabsData");
          window.localStorage.clear();
          hardReset();
          window.location.href = window.location.href;
        }}
        FallbackComponent={CrashErrorComponent}
      >
        <div className="flex min-h-0 flex-1 shrink grow basis-auto overflow-hidden">
          <ExtraSidebar />
          {/* Main area */}
          <main className="flex min-w-0 flex-1 border-t border-gray-200 dark:border-gray-700">
            {/* Primary column */}
            <div className="h-full w-full">
              <TabsManagerComponent></TabsManagerComponent>
            </div>
            <Toaster />
          </main>
        </div>
      </ErrorBoundary>
      <div></div>
      <div className="fixed bottom-5 left-5 z-40 flex flex-col-reverse">
        {alertsList.map((alert) => (
          <div key={alert.id}>
            {alert.type === "error" ? (
              <ErrorAlert
                key={alert.id}
                title={alert.data.title}
                list={alert.data.list}
                id={alert.id}
                removeAlert={removeAlert}
              />
            ) : alert.type === "notice" ? (
              <NoticeAlert
                key={alert.id}
                title={alert.data.title}
                link={alert.data.link}
                id={alert.id}
                removeAlert={removeAlert}
              />
            ) : (
              <SuccessAlert
                key={alert.id}
                title={alert.data.title}
                id={alert.id}
                removeAlert={removeAlert}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
