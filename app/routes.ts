import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";
import { typedFilePath } from "./utils/typedRoute";
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
        ...prefix("blog", [
            index(typedFilePath("routes/blogs.tsx")),
            route(':slug', typedFilePath("routes/blogs.$slug.tsx")),
        ]),
        ...(await flatRoutes({
            rootDirectory: "routes/_",
        })),
    ]),
    // ...(await flatRoutes({
    //     rootDirectory: "routes/_utils",
    // })),
    route("resources/theme-switch", typedFilePath("routes/resources/theme-switch.tsx")),
    route("resources/newsletter", typedFilePath("routes/resources/newsletter.tsx")),

] satisfies RouteConfig;
