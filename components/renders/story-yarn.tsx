import Link from "next/link";

export default function StoryYarn() {
  return (
    <div className="space-y-5">
      <p>
        <span className="text-primary">Story-Yarn</span> is a
        retrieval-augmented pipeline for generating long-form narrative — the
        kind of task where a plain LLM loses the thread after a few thousand
        tokens.
      </p>

      <p>
        It pairs vector search over a 10K+ passage corpus with
        prompt-conditioned generation. I built the retrieval and chunking layer
        — semantic chunking and top-k reranking — which lifted narrative
        coherence 18% over a non-retrieval baseline, and ran 40+ prompt and
        model-configuration sweeps with automated evaluation to pick the final
        setup.
      </p>

      <p>
        It was <span className="text-primary">published at ICON 2024</span>, the
        International Conference on Natural Language Processing.
      </p>

      <p className="text-sm text-muted-foreground">
        Python · RAG · vector search · LLMs · prompt engineering
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
