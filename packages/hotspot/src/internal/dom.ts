export function text(element: Element | null, value: string): void {
  if (element) element.textContent = value;
}

export function html(element: Element | null, value: string): void {
  if (element) element.innerHTML = value;
}

export function show(element: HTMLElement | null): void {
  if (element) element.style.display = 'block';
}

export function hide(element: HTMLElement | null): void {
  if (element) element.style.display = 'none';
}

export function value(element: HTMLInputElement | HTMLSelectElement | null, next?: string): string {
  if (!element) return '';
  if (next !== undefined) element.value = next;
  return element.value;
}
