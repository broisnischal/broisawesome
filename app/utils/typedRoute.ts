import { route as _route } from "@react-router/dev/routes";
import type { RouteFilePath } from "../route-files";

export function typedRoute(id: string, file: RouteFilePath) {
    return _route(id, file);
}


export function typedLayout(file: RouteFilePath) {
    return file;
}