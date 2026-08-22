export function shouldPromptLateAttendanceReview(minutesRemaining: number, lateStudentCount: number) {
  return minutesRemaining > 0 && minutesRemaining <= 10 && lateStudentCount > 0;
}
