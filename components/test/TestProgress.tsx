import React from "react";
import { formatTranslation } from "../../lib/i18n";

type TestProgressProps = {
  stage: number;
  stageCount: number;
  answered: number;
  total: number;
  percentage: number;
  stageLabel: string;
  progressLabel: string;
  answeredLabel: string;
};

const TestProgress: React.FC<TestProgressProps> = ({
  stage,
  stageCount,
  answered,
  total,
  percentage,
  stageLabel,
  progressLabel,
  answeredLabel,
}) => (
  <section className="test-progress" aria-label={progressLabel}>
    <div className="test-progress-copy">
      <strong>
        {formatTranslation(stageLabel, {
          current: String(stage + 1),
          total: String(stageCount),
        })}
      </strong>
      <span>
        {formatTranslation(answeredLabel, {
          answered: String(answered),
          total: String(total),
        })}
      </span>
    </div>
    <div
      className="progress-shell"
      role="progressbar"
      aria-label={progressLabel}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={answered}
      aria-valuetext={`${percentage}%`}
    >
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
    </div>
  </section>
);

export default TestProgress;
