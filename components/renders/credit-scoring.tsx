import Link from "next/link";

export default function CreditScoring() {
  return (
    <div className="space-y-5">
      <p>
        Our <span className="text-primary">1st place</span> solution for AiHack
        2025, hosted by AIFUL Corporation and IIT Mandi.
      </p>

      <p>
        The task was credit scoring on an unsecured loan dataset — predict the
        probability that a customer defaults, so lenders can price risk without
        collateral to fall back on. Final AUC:{" "}
        <span className="text-primary">0.6788</span>, ahead of the ensemble
        submissions.
      </p>

      <p>
        Most of the gain came from feature engineering rather than model
        choice — a tuned CatBoost on well-built features beat heavier ensembles
        on stock inputs. The dataset itself was under a confidentiality
        affidavit, so it isn’t in the repo.
      </p>

      <p className="text-sm text-muted-foreground">
        Python · CatBoost · feature engineering · Jupyter
      </p>

      <p className="text-sm text-muted-foreground">
        Team of four — I led. With Arman, Jatin and Anirudh.
      </p>

      <div>
        <p>
          repo:{" "}
          <Link
            target="_blank"
            href="https://github.com/GauravAhuja7/Credit-Scoring-AiHack-India-2025"
            className="text-primary hover:underline"
          >
            github.com/GauravAhuja7/Credit-Scoring-AiHack-India-2025
          </Link>
        </p>
      </div>
    </div>
  );
}
