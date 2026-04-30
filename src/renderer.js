// Minimal Builder content renderer for plain JS.
//
// Turns a Builder `content.data.blocks` JSON tree into an HTML string,
// wrapping each block in a div with `builder-id` so the Builder editor's
// click-to-select overlay can detect it on the page.
//
// Anything we don't explicitly handle falls back to rendering children,
// which is enough to make layout blocks (Section, Columns, …) work.

import { componentRegistry } from './components';

export function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(renderBlock).join('');
}

function renderBlock(block) {
  if (!block) return '';
  const { component, id } = block;
  const name = component && component.name;
  const options = (component && component.options) || {};

  let inner;
  if (name && componentRegistry[name]) {
    // Our locally-registered custom component.
    try {
      inner = componentRegistry[name].render(options);
    } catch (err) {
      console.warn('Render error for', name, err);
      inner = '';
    }
  } else if (name === 'Text') {
    inner = `<div class="builder-text">${options.text || ''}</div>`;
  } else if (name === 'Image') {
    inner = `<img class="builder-image" src="${options.image || ''}" alt="${options.altText || ''}" />`;
  } else if (name === 'Core:Button') {
    inner = `<a class="btn btn-primary" href="${options.link || '#'}">${options.text || 'Button'}</a>`;
  } else {
    // Layout blocks (Section, Columns, Box, …): just render children.
    inner = block.children ? renderBlocks(block.children) : '';
  }

  // The `builder-id` attribute is what the Builder editor uses to
  // map a clicked DOM element back to a block in the layers tree.
  // Without it, you can only select blocks via the Layers panel.
  return `<div builder-id="${id || ''}" class="builder-block">${inner}</div>`;
}
