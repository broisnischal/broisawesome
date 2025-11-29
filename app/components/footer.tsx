import { Link } from "react-router";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card text-card-foreground mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        © {currentYear} Portfolio. All rights reserved.
                    </div>
                    <nav className="flex gap-6 text-sm">
                        <Link
                            to="/"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/blogs"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Blogs
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

