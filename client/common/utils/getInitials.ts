export function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
