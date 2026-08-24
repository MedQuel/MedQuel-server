export function formatStudyTime(studyHours: number | null | undefined): string {
  if (studyHours == null || isNaN(studyHours) || studyHours <= 0) {
    return '0 sec';
  }

  const totalSeconds = Math.round(studyHours * 3600);

  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  if (totalSeconds < 3600) {
    const minutes = Math.round((totalSeconds / 60) * 100) / 100;
    return `${minutes} min`;
  }

  const hours = Math.round(studyHours * 100) / 100;
  return `${hours} hr`;
}
