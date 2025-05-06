import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <Auth0Provider 
      domain = "dev-f7jmc8ey6m6ef1vm.au.auth0.com"
      clientId = "AA6OmN36VFjacDRKN9U8u1oqBbjairsy"
      authorizationParams = {{
        redirect_uri: `http://localhost:${import.meta.env.VITE_PORT}/summaries`
      }}>
        <App/>
      </Auth0Provider>
      {/* <App/> */}
    </BrowserRouter>
  </StrictMode>,
);
