/**
 * Hand-rolled mini-markdown renderer used by the blog reader.
 *
 * Supports:
 *  - `###` headings (rendered as <h3>)
 *  - `*` / `-` bullet list items (grouped into a <ul> until a blank line or
 *    any other line closes the list)
 *  - `**bold**` inline spans (rendered as <strong>)
 *  - any other non-empty line (rendered as <p>)
 *
 * Pure function of its input: identical content always produces an identical
 * React element tree, and text nodes are escaped by React exactly as before.
 * Written with createElement (no JSX) so it can live in a plain .ts module.
 */
import { createElement, type ReactNode } from 'react';

const parseInlineStyles = (text: string): ReactNode[] => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return createElement(
        'strong',
        { key: index, className: 'font-semibold text-slate-900 dark:text-white' },
        part
      );
    }
    return part;
  });
};

const createList = (key: string, items: string[]): ReactNode =>
  createElement(
    'ul',
    { key, className: 'list-disc pl-5 space-y-2 my-4 text-slate-600 dark:text-slate-300' },
    items.map((item, itemIdx) =>
      createElement(
        'li',
        { key: itemIdx, className: 'leading-relaxed text-sm sm:text-base font-light' },
        parseInlineStyles(item)
      )
    )
  );

/**
 * Render blog markdown content as an array of React nodes.
 * Mirrors the original inline implementation exactly (keys, classes, ordering).
 */
export function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let currentList: { idx: number; items: string[] } | null = null;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('###')) {
      if (currentList) {
        elements.push(createList(`list-${idx}`, currentList.items));
        currentList = null;
      }
      const headingText = trimmed.replace('###', '').trim();
      elements.push(
        createElement(
          'h3',
          { key: idx, className: 'text-lg font-display font-semibold text-slate-900 dark:text-white pt-6 pb-2' },
          headingText
        )
      );
    } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      const itemText = trimmed.substring(1).trim();
      if (!currentList) {
        currentList = { idx, items: [] };
      }
      currentList.items.push(itemText);
    } else if (trimmed === '') {
      if (currentList) {
        elements.push(createList(`list-${idx}`, currentList.items));
        currentList = null;
      }
    } else {
      if (currentList) {
        elements.push(createList(`list-${idx}`, currentList.items));
        currentList = null;
      }
      elements.push(
        createElement(
          'p',
          { key: idx, className: 'text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-4' },
          parseInlineStyles(trimmed)
        )
      );
    }
  });

  if (currentList) {
    elements.push(createList('list-last', currentList.items));
  }

  return elements;
}
