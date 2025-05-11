import { withAuthenticationRequired } from "@auth0/auth0-react";
import { FC, ComponentType } from "react";
import { useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    component: ComponentType<object>;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component }) => {
    const location = useLocation();
    const Component = withAuthenticationRequired(component, {
        appState: { returnTo: location.pathname + location.search },
        onRedirecting: () => <div>Loading...</div>
    });

    return <Component/>;
};

export default ProtectedRoute;