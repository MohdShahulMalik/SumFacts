import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Auth0Provider
        domain = { import.meta.env.VITE_AUTH0_DOMAIN ?? "dev-f7jmc8ey6m6ef1vm.au.auth0.com"}
        clientId = { import.meta.env.VITE_AUTH0_CLIENT_ID ?? "AA6OmN36VFjacDRKN9U8u1oqBbjairsy"}
        authorizationParams = {{
          redirect_uri: `${window.location.origin}/summaries`
        }}>
          <App/>
        </Auth0Provider>
    </BrowserRouter>,
);
