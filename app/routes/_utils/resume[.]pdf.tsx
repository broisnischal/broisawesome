import { redirect } from "react-router";

export function loader() {
  return redirect("/pdfs/resume.pdf");
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}
