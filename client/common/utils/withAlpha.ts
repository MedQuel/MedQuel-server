export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');

  const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
