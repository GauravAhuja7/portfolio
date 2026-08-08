import Link from "next/link";
import { Kbd } from "../ui/kbd";
import { Github, Linkedin } from "lucide-react";

export function AboutMe() {
  return (
    <div className="space-y-5">
      <p>
        Hello 👋, I’m Gaurav(<span className="text-secondary">gaurav</span>).
        I’ve been super excited about computers ever since I was a kid.
      </p>

      <p>
        I’m in my final year of Computer Science at{" "}
        <span className="text-primary">IIT Mandi</span> (2022–2026, CGPA 8.14),
        and right
        now I’m a backend engineer at{" "}
        <span className="text-primary">Joveo</span>, building third-party
        integrations in Java and Spring Boot — REST contracts, OAuth token
        refresh, idempotent webhooks, and Kafka pipelines on AWS MSK carrying a
        few million events a month.
      </p>

      <p>
        Before that I was at <span className="text-primary">Equal</span>, where
        I refactored a legacy stateful backend into a stateless AWS
        architecture and spent a good chunk of time chasing down latency.
      </p>

      <p>
        Most of what I enjoy is the unglamorous part — retries, idempotency,
        why the P95 is bad, what happens when a third party changes their
        schema without telling you. I also build things with LLMs on the side;
        one of them ended up{" "}
        <span className="text-primary">published at ICON 2024</span>.
      </p>

      <p>
        You can find my recent work in the <Kbd>~/projects</Kbd> directory.
      </p>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-primary/70"></span>
          </span>
          <span>Open to new opportunities</span>
        </div>

        <Link
          target="_blank"
          href="https://github.com/GauravAhuja7"
          className="flex gap-1 items-center hover:underline"
        >
          <Github className="size-4" /> GitHub
        </Link>

        <Link
          target="_blank"
          href="https://linkedin.com/in/gauravahuja-iitmandi"
          className="flex gap-1 items-center hover:underline"
        >
          <Linkedin className="size-4" /> LinkedIn
        </Link>
      </div>
    </div>
  );
}
