type Role = {
  company: string;
  title: string;
  location: string;
  period: string;
  points: string[];
};

const ROLES: Role[] = [
  {
    company: "Joveo",
    title: "Software Engineer Intern",
    location: "Remote",
    period: "Feb 2026 – Present",
    points: [
      "Built and shipped third-party ATS integrations in Java/Spring Boot — REST contracts, OAuth token refresh and idempotent webhook handling for 1M+ monthly events.",
      "Designed a transparent SASL/SSL Kafka layer over AWS MSK across two services, securing three high-throughput pipelines with no business-logic changes.",
      "Owned an internal dashboard end-to-end (Spring Boot + React) surfacing sync failures and webhook delivery, cutting mean detection time for broken integrations by 60%.",
      "Debugged and fixed 12+ production defects across live client integrations — pagination, schema drift, ID-mapping edge cases — shipping via Docker/Kubernetes release cycles.",
    ],
  },
  {
    company: "Equal",
    title: "Software Developer Intern",
    location: "Hyderabad, India",
    period: "Jan 2025 – Jul 2025",
    points: [
      "Refactored a legacy stateful backend into a stateless AWS architecture (S3, RDS, Redis), improving horizontal scalability 50% under production load.",
      "Reduced API cost 20% and P95 latency 40% through request batching, caching and optimised routing.",
      "Shipped low-latency REST and WebSocket services sustaining 1000+ peak concurrent connections.",
      "Integrated an LLM assistant with retrieval-augmented context and fallback model routing, sustaining a 92% successful query rate in production.",
    ],
  },
];

export function Experience() {
  return (
    <div className="space-y-6">
      <p className="text-lg font-medium">Work Experience</p>

      <div className="space-y-6">
        {ROLES.map((role) => (
          <div key={role.company} className="space-y-2">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h3 className="font-medium">
                {role.title} ·{" "}
                <span className="text-primary">{role.company}</span>
              </h3>
              <p className="text-xs text-muted-foreground">{role.period}</p>
            </div>
            <p className="text-xs text-muted-foreground">{role.location}</p>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
