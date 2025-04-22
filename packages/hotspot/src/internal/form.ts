export function setFormValue(form: HTMLFormElement, name: string, value: string): void {
  const element = form.elements.namedItem(name);
  if (isInput(element)) element.value = value;
}

export function getFormValue(form: HTMLFormElement, name: string): string {
  const element = form.elements.namedItem(name);
  return isInput(element) ? element.value : '';
}

export function submitForm(form: HTMLFormElement): void {
  form.submit();
}

function isInput(element: Element | RadioNodeList | null): element is HTMLInputElement {
  return element !== null && 'value' in element;
}
