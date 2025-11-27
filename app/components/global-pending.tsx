import { Outlet, useNavigation } from "react-router";

export function GlobalSpinner() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50" />
  );
}   

