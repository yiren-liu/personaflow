import React from "react";
import ReactDOM from "react-dom/client";

import { ThemeProvider, createTheme } from '@mui/material/styles';


import App from "./App";
import IntroPage from "./IntroPage";
import TutorialPage from "./pages/Tutorial";
import ThankYouPage from "./pages/Finish";

import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  createRoutesFromElements,
  BrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import ContextWrapper from "./contexts";
import NewsletterSignup from "./pages/NewsletterSignup";


const THEME = createTheme({
  typography: {
   "fontFamily": `sans-serif, "Roboto", "Helvetica", "Arial"`,
   "fontSize": 14,
   "fontWeightLight": 300,
   "fontWeightRegular": 400,
   "fontWeightMedium": 500
  }
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* <Route path="/" element={<IntroPage />} /> */}
      {/* <Route path="/app" element={<App mindMapMode={true}/>} /> */}
      <Route path="/block" element={<App blockMode={true} />} />
      <Route path="/" element={<App blockMode={true} />} />
      <Route path="/_tutorial" element={<TutorialPage />} />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/newsletter_signup" element={<NewsletterSignup />} />
    </>,
  ),
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  // <React.StrictMode>
  <ThemeProvider theme={THEME}>
    <ContextWrapper>
      {/* <BrowserRouter>
            <App />
        </BrowserRouter> */}
      <RouterProvider router={router} />
    </ContextWrapper>
  </ThemeProvider>,
  // </React.StrictMode>
);
reportWebVitals();
