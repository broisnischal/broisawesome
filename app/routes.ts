import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import { typedFilePath } from "./utils/typedRoute";
import { flatRoutes } from "@react-router/fs-routes";

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
    route("writing", typedFilePath("routes/writing.tsx")),
    ...prefix("blog", [
      index(typedFilePath("routes/blogs.tsx")),
      route(":slug", typedFilePath("routes/blogs.$slug.tsx")),
    ]),
    route("*", typedFilePath("routes/$.tsx")),
    ...(await flatRoutes({
      rootDirectory: "routes/_",
      // /use is off for now; delete this line to bring the page back.
      ignoredRouteFiles: ["routes/_/use", "routes/_/use/**"],
    })),
  ]),
  ...(await flatRoutes({
    rootDirectory: "routes/_utils",
  })),
  route(
    "resources/theme-switch",
    typedFilePath("routes/resources/theme-switch.tsx"),
  ),
  route(
    "resources/newsletter",
    typedFilePath("routes/resources/newsletter.tsx"),
  ),
  route(
    "resources/gallery-image",
    typedFilePath("routes/resources/gallery-image.tsx"),
  ),
  route(
    "resources/github-auth",
    typedFilePath("routes/resources/github-auth.tsx"),
  ),
  route(
    "resources/github-callback",
    typedFilePath("routes/resources/github-callback.tsx"),
  ),
  route(
    "resources/github-star",
    typedFilePath("routes/resources/github-star.tsx"),
  ),
  route("resources/post-text", typedFilePath("routes/resources/post-text.tsx")),
  route(
    "resources/album-preview",
    typedFilePath("routes/resources/album-preview.tsx"),
  ),
  route(
    "resources/album-photo",
    typedFilePath("routes/resources/album-photo.tsx"),
  ),
  route(
    "resources/recent-commits",
    typedFilePath("routes/resources/recent-commits.tsx"),
  ),
  route(
    "resources/contributions",
    typedFilePath("routes/resources/contributions.tsx"),
  ),
] satisfies RouteConfig;
