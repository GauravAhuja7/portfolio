const GROUPS: { label: string; items: string }[] = [
  { label: "Languages", items: "Java, TypeScript, JavaScript, Python, SQL, C++" },
  {
    label: "Backend",
    items:
      "Spring Boot, Node.js, Express.js, REST APIs, WebSockets, Kafka, OAuth 2.0, JWT, microservices",
  },
  { label: "Frontend", items: "React, Next.js, React Native, Tailwind" },
  {
    label: "Cloud & data",
    items: "AWS (EC2, S3, RDS, Lambda, MSK), PostgreSQL, MySQL, Redis, Firebase",
  },
  {
    label: "Ops & testing",
    items:
      "Docker, Kubernetes, Terraform, CI/CD, Grafana, Prometheus, Loki, JUnit, pytest",
  },
];

export function Skills() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-secondary text-sm">{group.label}</p>
            <p className="text-sm">{group.items}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 pt-2">
        <p className="text-secondary text-sm">Elsewhere</p>
        <ul className="list-disc ml-5 text-sm space-y-1">
          <li>
            1st at AiHack 2025 — feature-engineered CatBoost model, 0.6788 AUC,
            beating the ensemble entries
          </li>
          <li>1900+ on LeetCode, peak 1550 on Codeforces</li>
        </ul>
      </div>
    </div>
  );
}
