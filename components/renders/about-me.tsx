import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { Mail, Phone } from "lucide-react";
import { CONTACT, mailto, tel } from "@/lib/contact";

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
        Outside work I’m usually building some random project or going down a
        rabbit hole because I wanted to know how something works — mostly
        backend, distributed stuff, and lately AI/LLM things. Not to say I built
        them though; I just like making things that are actually useful,
        figuring out why they break, and making them a little better.
      </p>

      <p>
        Anyway, this is my little corner of the internet — have a look around :)
      </p>

      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-primary/70"></span>
          </span>
          <span>Open to new opportunities</span>
        </div>

        {/* Recruiters shouldn't have to hunt — mail and tel are one tap on a
            phone, and both are selectable for copy-paste on desktop. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <Link
            href={mailto}
            className="flex gap-1.5 items-center hover:underline text-primary"
          >
            <Mail className="size-4" /> {CONTACT.email}
          </Link>

          <Link
            href={tel}
            className="flex gap-1.5 items-center hover:underline text-primary"
          >
            <Phone className="size-4" /> {CONTACT.phone}
          </Link>

          <Link
            target="_blank"
            href={CONTACT.github}
            className="flex gap-1.5 items-center hover:underline"
          >
            <FaGithub className="size-4" /> GitHub
          </Link>

          <Link
            target="_blank"
            href={CONTACT.linkedin}
            className="flex gap-1.5 items-center hover:underline"
          >
            <FaLinkedin className="size-4" /> LinkedIn
          </Link>
        </div>
      </div>
    </div>
  );
}
