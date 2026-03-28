import type { BlogLog, BookLog, MovieLog } from "./types";

/** Used when `LOG_JSON_URL` is unset or the fetch fails. Replace via remote JSON when possible. */
export const bookLogs: BookLog[] = [
  {
    title: "The Design of Everyday Things",
    author: "Don Norman",
    status: "active",
    note: "Fallback data — point LOG_JSON_URL at your JSON server to edit live.",
    url: "https://www.goodreads.com/book/show/840.The_Design_of_Everyday_Things",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    status: "paused",
    note: "Streams and logs chapter.",
    url: "https://dataintensive.net/",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    status: "done",
  },
];

export const movieLogs: MovieLog[] = [
  {
    title: "Past Lives",
    year: 2023,
    status: "done",
    note: "Fallback row until remote JSON loads.",
  },
  {
    title: "Dune: Part Two",
    year: 2024,
    status: "active",
    url: "https://www.imdb.com/title/tt15239678/",
  },
];

export const blogLogs: BlogLog[] = [
  {
    title: "Local-first software",
    url: "https://www.inkandswitch.com/local-first/",
    status: "active",
    note: "Sync and ownership model.",
  },
  {
    title: "HTTP 103 Early Hints",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/103",
    status: "done",
  },
];
