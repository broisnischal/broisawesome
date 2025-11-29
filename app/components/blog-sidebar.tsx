// import { Link, useLocation, useMatches } from "react-router";
// import { useEffect, useState } from "react";
// import { getBlogs, type BlogListItem } from "~/.server/all-content";

// export function BlogSidebar() {
//     const location = useLocation();
//     const currentPath = location.pathname;
//     const matches = useMatches();
//     const [blogs, setBlogs] = useState<BlogListItem[]>([]);

//     useEffect(() => {
//         // Try to get from route matches first
//         const blogMatch = matches.find(
//             (match) => match.id === "routes/_blog" || match.pathname === "/blogs"
//         );
//         const blogData = blogMatch?.data as { blogs?: BlogListItem[] } | undefined;

//         if (blogData?.blogs && blogData.blogs.length > 0) {
//             setBlogs(blogData.blogs);
//         } else {
//             // Fallback: get blogs directly
//             const allBlogs = getBlogs();
//             const serializable = allBlogs.map((b) => ({
//                 title: b.title,
//                 slug: b.slug,
//                 date: b.date,
//                 excerpt: b.excerpt,
//             })) as BlogListItem[];
//             setBlogs(serializable);
//         }
//     }, [matches]);

//     return (
//         <aside className="fixed left-64 top-0 h-screen w-80 border-r border-border bg-card/95 backdrop-blur-sm text-card-foreground overflow-y-auto z-30 hidden lg:block shadow-lg">
//             {/* <div className="p-6 border-b border-border bg-linear-to-b from-card to-card/50 sticky top-0 z-10"> */}
//             {/* <h2 className="text-lg font-semibold text-foreground">All Blogs</h2> */}
//             {/* <p className="text-sm text-muted-foreground mt-1">
//                     {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
//                 </p> */}
//             {/* <Breadcrumbs />

//             </div> */}

//             <nav className="p-4">
//                 {blogs.length === 0 ? (
//                     <p className="text-sm text-muted-foreground">No blogs available</p>
//                 ) : (
//                     <ul className="space-y-2">
//                         {blogs.map((blog) => {
//                             const isActive = currentPath === `/blogs/${blog.slug}`;

//                             return (
//                                 <li key={blog.slug}>
//                                     <Link
//                                         to={`/blogs/${blog.slug}`}
//                                         className={`block p-3 rounded-lg transition-all duration-200 ${isActive
//                                             ? "bg-primary text-primary-foreground shadow-md"
//                                             : "hover:bg-accent/50 hover:text-accent-foreground text-foreground hover:shadow-sm"
//                                             }`}
//                                     >
//                                         <div className="font-medium text-sm line-clamp-2">
//                                             {blog.title}
//                                         </div>
//                                         {blog.date && (
//                                             <time className="text-xs text-muted-foreground mt-1 block">
//                                                 {new Date(blog.date).toLocaleDateString('en-US', {
//                                                     month: 'short',
//                                                     day: 'numeric',
//                                                     year: 'numeric',
//                                                 })}
//                                             </time>
//                                         )}
//                                     </Link>
//                                 </li>
//                             );
//                         })} 
//                     </ul>
//                 )}
//             </nav>
//         </aside>
//     );
// }

