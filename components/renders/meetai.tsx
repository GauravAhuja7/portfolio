import Link from "next/link";

export default function MeetAI() {
  return (
    <div className="space-y-5">
      <p>
        <span className="text-primary">MeetAI</span> is a SaaS platform for
        video calls where the other participant is an AI agent — it joins the
        call, talks in real time, and writes up the meeting afterwards.
      </p>

      <p>
        The frontend is Next.js and React with tRPC, so the client and server
        share types end-to-end and the dashboards render server-side. Underneath
        it’s PostgreSQL with Drizzle ORM, plus Stream SDK for the media layer
        and Inngest for background jobs — together holding up 1000+ concurrent
        connections.
      </p>

      <p>
        Auth is BetterAuth with Google and GitHub OAuth. OpenAI drives the live
        agents and the post-meeting analysis, and Polar handles subscription
        billing in production.
      </p>

      <p className="text-sm text-muted-foreground">
        Next.js · React · TypeScript · tRPC · PostgreSQL · Drizzle · OpenAI ·
        Polar
      </p>

      <div>
        <p>
          site:{" "}
          <Link
            target="_blank"
            href="https://saas-meet-ai-two.vercel.app"
            className="text-primary hover:underline"
          >
            saas-meet-ai-two.vercel.app
          </Link>
        </p>
        <p>
          repo:{" "}
          <Link
            target="_blank"
            href="https://github.com/GauravAhuja7/Saas-meet-ai"
            className="text-primary hover:underline"
          >
            github.com/GauravAhuja7/Saas-meet-ai
          </Link>
        </p>
      </div>
    </div>
  );
}
