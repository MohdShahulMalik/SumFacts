import { withAuthenticationRequired } from "@auth0/auth0-react";
import { FC, ComponentType } from "react";
import { useLocation } from "react-router-dom";
import Loading from "./loading";

interface ProtectedRouteProps {
  component: ComponentType<object>;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component }) => {
  const location = useLocation();
  const Component = withAuthenticationRequired(component, {
    loginOptions: {
      appState: { returnTo: location.pathname + location.search },
    },
    onRedirecting: () => <Loading />,
  });

  return <Component />;
};

export default ProtectedRoute;
