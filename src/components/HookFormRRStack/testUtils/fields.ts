/** Test utilities for RRStack UI tests */

/** Find a Form.Field by matching the first child's text (label or InfoLabel) with a prefix. */
export const getFieldByLabel = (root: HTMLElement, labelText: string) => {
  const fields = Array.from(
    root.querySelectorAll<HTMLElement>('[data-testid="form-field"]'),
  );
  for (const f of fields) {
    const first = f.firstElementChild as HTMLElement | null;
    const txt = (first?.textContent ?? '').trim();
    if (txt.startsWith(labelText)) return f;
  }
  throw new Error(`Label not found: ${labelText}`);
};

/** Extract only the value text from a Form.Field whose control is Label. */
export const getFieldValueText = (field: HTMLElement) => {
  const valueNode = field.querySelector('[data-testid="label"]');
  if (valueNode) return (valueNode.textContent ?? '').trim();
  const textNodes = Array.from(field.childNodes).filter(
    (n) => n.nodeType === Node.TEXT_NODE,
  );
  return textNodes
    .map((n) => (n.textContent ?? '').trim())
    .join(' ')
    .trim();
};
