import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { typedLayout, typedRoute } from "./utils/typedRoute";
import { flatRoutes } from "@react-router/fs-routes"




export default [
    // index("routes/home.tsx"),
    // ...prefix("blogs", [
    //     index("./projects/home.tsx"),
    //     layout("./projects/project-layout.tsx", [
    //         route(":pid", "./projects/project.tsx"),
    //         route(":pid/edit", "./projects/edit-project.tsx"),
    //     ]),
    // ]),


    layout(typedLayout("routes/layout.tsx"), [
        layout("routes/auth/layout.tsx", [
            typedRoute("login", "routes/auth/login.tsx"),
            typedRoute("signup", "routes/auth/signup.tsx"),
        ]),
        ...(await flatRoutes({
            ignoredRouteFiles: ["routes/layout.tsx", "routes/auth/layout.tsx", "routes/_utils/route.tsx"],
        }))
    ]),
    ...(await flatRoutes({
        rootDirectory: "routes/_utils",
    })),




] satisfies RouteConfig;
