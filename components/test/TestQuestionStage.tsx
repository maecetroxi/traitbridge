import React from "react";
import type { Question as PackageQuestion } from "@bigfive-org/questions";

type Choice = {
  score: number;
  text: string;
};

type TestQuestionStageProps = {
  questions: PackageQuestion[];
  fallbackChoices: Choice[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, score: number) => void;
};

const TestQuestionStage: React.FC<TestQuestionStageProps> = ({
  questions,
  fallbackChoices,
  answers,
  onAnswer,
}) => (
  <ol className="questions-list test-stage-questions">
    {questions.map((question) => {
      const choices = (question.choices || fallbackChoices) as Choice[];

      return (
        <li
          key={question.id}
          id={`question-${question.id}`}
          className="question-item"
          tabIndex={-1}
        >
          <fieldset>
            <legend className="question-item-text">
              <span className="question-number">{question.num}</span>
              <span>{question.text}</span>
            </legend>
            <div className="answer-scale-legend" aria-hidden="true">
              <span>{choices[0]?.text}</span>
              <span>{choices[choices.length - 1]?.text}</span>
            </div>
            <div className="answer-scale">
              {choices.map((choice) => {
                const checked = answers[question.id] === choice.score;

                return (
                  <label
                    key={choice.score}
                    className={`answer-pill${checked ? " answer-pill-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={choice.score}
                      checked={checked}
                      aria-label={choice.text}
                      onChange={() => onAnswer(question.id, choice.score)}
                    />
                    <span className="answer-pill-score" aria-hidden="true">
                      {choice.score}
                    </span>
                    <span className="answer-pill-text">{choice.text}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </li>
      );
    })}
  </ol>
);

export default TestQuestionStage;
