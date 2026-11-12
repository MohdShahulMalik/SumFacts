import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Auth0Provider
        domain = {import.meta.env.VITE_AUTH0_DOMAIN ?? "dev-177sgpdkd45cm6vm.au.auth0.com"}
        clientId = {import.meta.env.VITE_AUTH0_CLIENT_ID ?? "bnQc00L1WDzfQPIFyVPKhGNpot2TFBfx"}
        authorizationParams = {{
          redirect_uri: `${window.location.origin}/summaries`
        }}>
          <App/>
        </Auth0Provider>
    </BrowserRouter>,
);
