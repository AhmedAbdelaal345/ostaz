export type ObjectiveQuizQuestion = { id: string; points: number; correctAnswer?: number | boolean };

export function calculateObjectiveQuizScore(questions: ObjectiveQuizQuestion[], answers: Record<string, unknown>) {
  return questions.reduce((total, question) => total + (answers[question.id] === question.correctAnswer ? Number(question.points) : 0), 0);
}
