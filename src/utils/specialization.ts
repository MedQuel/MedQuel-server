export function resolveSpecialization(specialties: unknown, targetExam: unknown): string {
  const list: unknown[] = Array.isArray(specialties) ? specialties : [];
  const primary = list.find(
    (s): s is string => typeof s === 'string' && s.trim().length > 0
  );

  return primary ?? (typeof targetExam === 'string' ? targetExam : '');
}
