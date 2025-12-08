import { ArrowUpRightIcon } from "lucide-react";
import type { Route } from "./+types/route";
import { Link } from "react-router";

export async function loader({}: Route.LoaderArgs) {
  const stacks = [
    {
      title: "Coolify",
      description: "goto PAAS provider for mine usecase",
      link: "https://coolify.io",
    },
    {
      title: "1Password",
      description: "Password Manager",
      link: "https://1password.com",
    },
    {
      title: "Cursor",
      description: "Code Editor",
      link: "https://cursor.com",
    },
  ];

  return { stacks };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        Stacks
      </h1>

      <p className="text-muted-foreground mb-2">
        Here is my go-to list of tools & software that I enjoy using and have
        helped me level up my skills.
      </p>

      <ul className="list-disc list-inside">
        {loaderData.stacks.map((stack) => (
          <StackItem key={stack.title} {...stack} />
        ))}
      </ul>
    </div>
  );
}

function StackItem({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <li className="flex gap-2 items-start">
      <Link
        to={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 group text-primary hover:text-primary/80 transition-colors"
      >
        {title}
        <ArrowUpRightIcon className="w-4 h-4 group-hover:text-primary transition-colors" />
      </Link>
      <p className="text-sm text-muted-foreground">{description}</p>
    </li>
  );
}
