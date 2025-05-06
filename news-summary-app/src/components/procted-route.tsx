import { withAuthenticationRequired } from "@auth0/auth0-react";
import { FC, ComponentType } from "react";

interface ProtectedRouteProps {
    component: ComponentType<object>;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component }) => {
    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => <div>Loading...</div>
    });

    return <Component/>;
};

export default ProtectedRoute;