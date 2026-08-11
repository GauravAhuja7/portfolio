import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

export function AboutMe() {
  return (
    <div className="space-y-5">
      <p>Hey 👋, I’m Gaurav.</p>

      <p>
        I like building stuff on the internet and, somewhere along the way, got
        way too interested in what happens behind the scenes.
      </p>

      <p>
        I recently graduated from <span className="text-primary">IIT Mandi</span>{" "}
        and work as a backend engineer at{" "}
        <span className="text-primary">Joveo</span>, where I mostly deal with
        Java, Spring Boot, Kafka, AWS, and a bunch of third-party systems that
        don’t always behave the way you want them to 😭. A lot of my work is
        around APIs, OAuth, webhooks, async processing, retries, idempotency,
        and generally making sure things don’t fall apart when something
        unexpected happens.
      </p>

      <p>
        Before Joveo, I worked at <span className="text-primary">Equal</span>,
        where I got to work on a pretty large codebase and help move parts of a
        legacy backend towards a more scalable AWS setup.
      </p>

      <p>
        Outside work, I’m usually building some random project, trying out a new
        technology, or going down a rabbit hole because I wanted to understand
        how something works. I’m especially into backend systems, distributed
        stuff, and lately, AI/LLM-based projects.
      </p>

      <p>
        I’m not really into building things just to say I built them. I like
        making things that are actually useful, figuring out why they break, and
        then trying to make them a little better.
      </p>

      <p>
        Anyway, this is my little corner of the internet — have a look around :)
      </p>

      <div className="flex items-center gap-4 text-xs pt-1">
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
          <FaGithub className="size-4" /> GitHub
        </Link>

        <Link
          target="_blank"
          href="https://linkedin.com/in/gauravahuja-iitmandi"
          className="flex gap-1 items-center hover:underline"
        >
          <FaLinkedin className="size-4" /> LinkedIn
        </Link>
      </div>
    </div>
  );
}
