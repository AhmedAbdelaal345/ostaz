import { describe, expect, it } from "vitest";
import { calculateObjectiveQuizScore } from "../shared/quizScoring";

describe("objective weekly quiz scoring", () => {
  it("adds only points for correct multiple-choice and true/false answers", () => {
    const score = calculateObjectiveQuizScore([
      { id: "q1", points: 2, correctAnswer: 1 },
      { id: "q2", points: 3, correctAnswer: true },
      { id: "q3", points: 1, correctAnswer: false },
    ], { q1: 1, q2: true, q3: true });

    expect(score).toBe(5);
  });
});
