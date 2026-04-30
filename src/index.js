// Bootstrap: wires our DealMaker components into Builder's web-component
// SDK so they show up in the visual editor's "Add Block" menu and render
// on the live page.
//
// Two responsibilities:
//   1. Define a custom HTML element per component. Builder's web component
//      creates these elements when rendering a page; we read the input
//      values off the element (as attributes / properties) and call our
//      render(props) function to produce the actual HTML.
//   2. Register each component with Builder via the official
//      `window.builderWcLoadCallbacks` hook so the editor knows about
//      them. Builder calls the callback once its CDN script has loaded.

import './index.css';
import { components } from './components';

// 1. Define a custom element per component.
for (const c of components) {
  if (!customElements.get(c.tag)) {
    customElements.define(c.tag, makeRenderElement(c));
  }
}

// 2. Register each component with Builder once its SDK loads.
// Push (don't overwrite) — the SDK may have already swapped this array
// for a live tracker if the script loaded before our bundle.
window.builderWcLoadCallbacks = window.builderWcLoadCallbacks || [];
window.builderWcLoadCallbacks.push(({ Builder }) => {
  for (const c of components) {
    // First arg must be a non-null function/class — the SDK assigns
    // `builderOptions` onto it. We don't use it for rendering (the
    // `tag` option points the SDK at our custom element instead),
    // so a no-op function is enough.
    Builder.registerComponent(function noop() {}, {
      name: c.name,
      friendlyName: c.friendlyName,
      description: c.description,
      image: c.image,
      tag: c.tag,
      inputs: c.inputs,
    });
  }
  console.log(
    '[DealMaker] Registered with Builder:',
    components.map(c => c.name).join(', ')
  );
});

// Generic bridge: a custom element that reads its inputs (attributes
// or properties — Builder uses both, attributes for primitives and
// properties for arrays/objects) and re-renders by calling the render
// function whenever they change.
function makeRenderElement(component) {
  return class extends HTMLElement {
    static get observedAttributes() {
      return component.inputs.map(i => i.name);
    }

    constructor() {
      super();
      this._props = {};
      // Expose a property setter for each input so Builder can pass
      // complex (non-string) values directly without JSON-encoding.
      for (const input of component.inputs) {
        if (input.name in HTMLElement.prototype) continue; // skip name clashes
        Object.defineProperty(this, input.name, {
          get: () => this._props[input.name],
          set: val => {
            this._props[input.name] = val;
            if (this.isConnected) this._render();
          },
        });
      }
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      const input = component.inputs.find(i => i.name === name);
      if (!input) return;
      this._props[name] = parseAttr(newVal, input.type);
      if (this.isConnected) this._render();
    }

    _render() {
      const props = {};
      for (const input of component.inputs) {
        const fromProp = this._props[input.name];
        props[input.name] = fromProp != null ? fromProp : input.defaultValue;
      }
      this.innerHTML = component.render(props);
    }
  };
}

// HTML attributes are always strings; JSON-decode the ones that
// represent non-string Builder input types.
function parseAttr(val, type) {
  if (val == null) return undefined;
  if (type === 'list' || type === 'number' || type === 'boolean' || type === 'object') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}
