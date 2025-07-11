import React, { useEffect } from "react";
import { useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";

import { Button } from "@mui/material";
import { Transition } from "@headlessui/react";

import ConsentForm from "./pages/Disclosure";
import ParticalBackground from "./pages/Background";
import Tutorial from "./pages/Tutorial/components";

import { locationContext } from "./contexts/locationContext";

const IntroPage = () => {
    const [isConsentFormSigneed, setIsConsentFormSigned] = React.useState(false);
    const [isTutorialShown, setIsTutorialShown] = React.useState(false);

    const { searchParams, setSearchParams } = useContext(locationContext);

    const location = useLocation();
    useEffect(() => {
        setSearchParams(location.search);
    }, [location.search, setSearchParams]);

    function getSessionURL() {
        let sessionURL = "/block";
        sessionURL += searchParams;
        return sessionURL;
    }

    return (
        <>
            <ParticalBackground />
            <div className="absolute z-10 flex h-2/3 w-full flex-col items-center pt-32">
                {/* rollup transition */}
                <Transition
                    show={!isConsentFormSigneed}
                    enter="transition-transform duration-500 ease-out"
                    enterFrom={"transform translate-y-[-100%]"}
                    enterTo={"transform translate-y-0"}
                    leave="transition-transform duration-500 ease-in"
                    leaveFrom={"transform translate-y-0"}
                    leaveTo={"transform translate-y-[-100%]"}
                >
                    <div className="flex w-full flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold">Welcome to RQ Gen!</h2>
                        <ConsentForm setSigned={setIsConsentFormSigned} />
                    </div>
                </Transition>
                <br />

                <Transition
                    show={isConsentFormSigneed}
                    enter="transition-transform duration-500 ease-out"
                    enterFrom={"transform translate-y-[-100%]"}
                    enterTo={"transform translate-y-0"}
                    leave="transition-transform duration-500 ease-in"
                    leaveFrom={"transform translate-y-0"}
                    leaveTo={"transform translate-y-[-100%]"}
                >
                    {/* <div className="flex w-full flex-col items-center justify-center">
                        <Tutorial />
                    </div> */}

                {isConsentFormSigneed && (
                    <Button
                        href={getSessionURL()}
                        variant="contained"
                        color="primary"
                        style={{
                            backgroundColor: "#4A90E2",
                            padding: "12px 36px",
                            borderRadius: "25px",
                            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease 0s",
                            textTransform: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            letterSpacing: "1px",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#356ABD")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#4A90E2")
                        }
                    >
                        Start to use CoQuest
                    </Button>
                )}
                </Transition>
            </div>
        </>
    );
};

export default IntroPage;
