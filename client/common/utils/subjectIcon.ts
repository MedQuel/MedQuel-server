import { subjectCatalog, type SubjectId } from '../constants/subject';


export function subjectNameToId(name: string): SubjectId | null {
  const id = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return id in subjectCatalog ? (id as SubjectId) : null;
}
