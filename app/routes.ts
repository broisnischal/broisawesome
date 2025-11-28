import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { typedFilePath, typedRoute } from "./utils/typedRoute";
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

    layout(typedFilePath("routes/layout.tsx"), [
        // layout("routes/auth/layout.tsx", [
        //     typedRoute("login", "routes/auth/login.tsx"),
        //     typedRoute("signup", "routes/auth/signup.tsx"),
        // ]),
        ...prefix("blogs", [
            index(typedFilePath("routes/_blog/route.tsx")),
            ...(await flatRoutes({
                rootDirectory: "routes/_blog/_contents",
            }))
        ]),
        ...(await flatRoutes({
            rootDirectory: "routes/_",
        })),
    ]),
    ...(await flatRoutes({
        rootDirectory: "routes/_utils",
    })),

] satisfies RouteConfig;
