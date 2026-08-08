import Link from "next/link";

export default function GCApp() {
  return (
    <div className="space-y-5">
      <p>
        The <span className="text-primary">General Championship App</span> is
        the scoreboard for IIT Mandi’s inter-hostel championship — 2000+
        students following 40+ events across a week.
      </p>

      <p>
        The interesting constraint was live scores without hammering the server.
        Express.js REST services sit behind Firebase real-time listeners, so
        updates get pushed to every connected client instead of everyone
        polling. Client-side caching, request de-duplication and batched reads
        on the hot paths cut backend API calls by a further 20%.
      </p>

      <p>
        The other half was data modelling: 40+ event formats — knockouts,
        leagues, points-per-position — all had to run through a single scoring
        pipeline rather than 40 special cases.
      </p>

      <p className="text-sm text-muted-foreground">
        Express.js · Node.js · Firebase · REST APIs
      </p>

      <div>
        <p>
          repo:{" "}
          <Link
            target="_blank"
            href="https://github.com/GauravAhuja7"
            className="text-primary hover:underline"
          >
            github.com/GauravAhuja7
          </Link>
        </p>
      </div>
    </div>
  );
}
