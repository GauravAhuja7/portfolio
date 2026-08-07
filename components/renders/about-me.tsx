import Link from "next/link";
import { Kbd } from "../ui/kbd";
import { Github } from "lucide-react";

export function AboutMe() {
  return (
    <div className="space-y-5">
      <p>
        Hello 👋, I’m Gaurav(<span className="text-secondary">gaurav</span>).
        I’ve been super excited about computers ever since I was a kid.
      </p>

      <p>
        I’m a software engineer and I mostly build for the web. I like tools
        that are fast, quiet, and stay out of the way.
      </p>

      <p>
        You can find my recent work in the <Kbd>~/projects</Kbd> directory.
      </p>

      <div className="flex items-center gap-2 text-xs">
        <span className="relative flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-primary/70"></span>
        </span>
        <Link
          target="_blank"
          href="https://github.com/GauravAhuja7"
          className="flex gap-1 items-center hover:underline"
        >
          Open to new opportunities <Github className="size-4" />
        </Link>
      </div>
    </div>
  );
}
