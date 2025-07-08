import { ReactNode } from "react"
import { AlertProvider } from "./alertContext"
import { DarkProvider } from "./darkContext"
import { LocationProvider } from "./locationContext"
import PopUpProvider from "./popUpContext"
import { TabsProvider } from "./tabsContext"
import { TypesProvider } from "./typesContext"

import { ContextMenuContextProvider } from "./contextMenuContext"
import { CoTInspectorContextProvider } from "./CoTInspectorContext"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { InteractiveTutorialContextTypeProvider } from "./InteractiveTutorialContext"
import { AuthProvider } from "./authContext"
import { UserProvider } from "./userContext"

export default function ContextWrapper({ children }: { children: ReactNode }) {
  //element to wrap all context
  return (
    <>
      {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
      <AuthProvider>
        <UserProvider>
          <InteractiveTutorialContextTypeProvider>
            <DarkProvider>
              <TypesProvider>
                <LocationProvider>
                  <AlertProvider>
                    <TabsProvider>
                      <PopUpProvider>
                        <ContextMenuContextProvider>
                          <CoTInspectorContextProvider>
                            {children}
                          </CoTInspectorContextProvider>
                        </ContextMenuContextProvider>
                      </PopUpProvider>
                    </TabsProvider>
                  </AlertProvider>
                </LocationProvider>
              </TypesProvider>
            </DarkProvider>
          </InteractiveTutorialContextTypeProvider>
        </UserProvider>
      </AuthProvider>
      {/* </GoogleOAuthProvider> */}
    </>
  )
}
