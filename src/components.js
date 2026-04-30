// Dealmaker-branded custom components.
//
// Each component has:
//   - a `name` (what appears in the Builder visual editor)
//   - `inputs` describing its editable fields
//   - a `render(props)` that returns an HTML string
//
// We register the metadata (name + inputs) with the Builder SDK so the
// components show up in the Builder editor's "Add block" menu. We keep
// the render function in a local registry so our plain-JS renderer
// (see renderer.js) can turn a Builder block into real DOM.
//
// To add a new component: copy one of the register(...) calls below,
// change the name/inputs, and write a render function that returns
// an HTML string from the props.

import { Builder } from '@builder.io/sdk';

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

// Inline SVG data URLs so each component has a distinct thumbnail
// in the Builder "Add block" menu.
const toIcon = body =>
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2332" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  );

const ICONS = {
  DealHero: toIcon(
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h8M9 17h6"/>'
  ),
  FeatureGrid: toIcon(
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
  ),
  TwoColumnFeature: toIcon(
    '<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/><path d="M15 9h4M15 12h4M15 15h3"/>'
  ),
  CTABanner: toIcon(
    '<path d="M3 11v2a1 1 0 0 0 1 1h2l6 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M20 6a8 8 0 0 1 0 12"/>'
  ),
};

export const componentRegistry = {};

function register(options, render) {
  componentRegistry[options.name] = { options, render };
  // Register metadata with Builder so the component shows up in the
  // visual editor. Passing a lightweight marker function is enough —
  // the editor only needs the name + inputs to drive its UI.
  Builder.registerComponent(function noop() {}, options);
}

// ─────────────────────────────────────────────────────────────────────
// <DealHero> — branded hero with gradient accent headline + two CTAs.
// Demonstrates: string, longText, url inputs.
// ─────────────────────────────────────────────────────────────────────
register(
  {
    name: 'DealHero',
    friendlyName: 'Deal Hero',
    description: 'Large branded hero with gradient headline + CTAs.',
    image: ICONS.DealHero,
    inputs: [
      { name: 'eyebrow', type: 'string', defaultValue: 'New on DealMaker' },
      {
        name: 'title',
        type: 'string',
        defaultValue: 'Online capital raising,',
      },
      {
        name: 'accentTitle',
        type: 'string',
        friendlyName: 'Accent headline',
        helperText: 'Rendered in the brand gradient',
        defaultValue: 'built for modern issuers.',
      },
      {
        name: 'subtitle',
        type: 'longText',
        defaultValue:
          'Run compliant Reg A+, Reg CF, and Reg D offerings end-to-end — from investor acquisition to closing — on one unified platform.',
      },
      { name: 'primaryCtaText', type: 'string', defaultValue: 'Book a demo' },
      { name: 'primaryCtaHref', type: 'url', defaultValue: '/book-demo' },
      { name: 'secondaryCtaText', type: 'string', defaultValue: 'See offerings' },
      { name: 'secondaryCtaHref', type: 'url', defaultValue: '/offerings' },
    ],
  },
  props => `
    <section class="dm-hero">
      <div class="dm-hero-inner">
        ${props.eyebrow
          ? `<span class="dm-eyebrow">${escapeHtml(props.eyebrow)}</span>`
          : ''}
        <h1 class="dm-hero-title">
          ${escapeHtml(props.title || '')}
          ${props.accentTitle
            ? `<span class="accent">${escapeHtml(props.accentTitle)}</span>`
            : ''}
        </h1>
        <p class="dm-hero-sub">${escapeHtml(props.subtitle || '')}</p>
        <div class="dm-hero-actions">
          ${props.primaryCtaText
            ? `<a class="btn btn-accent" href="${escapeHtml(
                props.primaryCtaHref || '#'
              )}">${escapeHtml(props.primaryCtaText)}</a>`
            : ''}
          ${props.secondaryCtaText
            ? `<a class="btn btn-outline" href="${escapeHtml(
                props.secondaryCtaHref || '#'
              )}">${escapeHtml(props.secondaryCtaText)}</a>`
            : ''}
        </div>
      </div>
    </section>
  `
);

// ─────────────────────────────────────────────────────────────────────
// <FeatureGrid> — section heading + responsive grid of feature tiles.
// Demonstrates: `list` input with `subFields` (the most important
// Builder pattern — lets editors add/remove/reorder repeated items
// without leaving the visual editor) and an `enum` for column count.
// ─────────────────────────────────────────────────────────────────────
register(
  {
    name: 'FeatureGrid',
    friendlyName: 'Feature Grid',
    description: 'Responsive grid that lays out feature cards in 2–4 columns.',
    image: ICONS.FeatureGrid,
    inputs: [
      { name: 'eyebrow', type: 'string', defaultValue: 'Platform' },
      {
        name: 'heading',
        type: 'string',
        defaultValue: 'Everything issuers need to close the raise',
      },
      {
        name: 'subheading',
        type: 'longText',
        defaultValue:
          'Purpose-built tools at every stage of the capital-raising journey.',
      },
      { name: 'columns', type: 'number', enum: [2, 3, 4], defaultValue: 3 },
      {
        name: 'features',
        type: 'list',
        defaultValue: [
          {
            icon: '⚡',
            title: 'Investor-first UX',
            body: 'Checkout-grade flow: KYC, funding, and signing on one screen.',
          },
          {
            icon: '🛡️',
            title: 'Built-in compliance',
            body: 'Reg A+, Reg CF, Reg D — with transfer agent, escrow, and audit trails.',
          },
          {
            icon: '📈',
            title: 'Real-time insights',
            body: 'Live funnel, ad attribution, and cohort analytics out of the box.',
          },
        ],
        subFields: [
          { name: 'icon', type: 'string', defaultValue: '⚡' },
          { name: 'title', type: 'string', defaultValue: 'Headline' },
          { name: 'body', type: 'longText', defaultValue: 'Description…' },
        ],
      },
    ],
  },
  props => {
    const cols = [2, 3, 4].includes(Number(props.columns))
      ? Number(props.columns)
      : 3;
    const items = Array.isArray(props.features) ? props.features : [];
    return `
      <section class="dm-features">
        <div class="dm-section-head">
          ${props.eyebrow
            ? `<span class="dm-eyebrow">${escapeHtml(props.eyebrow)}</span>`
            : ''}
          <h2>${escapeHtml(props.heading || '')}</h2>
          ${props.subheading
            ? `<p>${escapeHtml(props.subheading)}</p>`
            : ''}
        </div>
        <div class="dm-features-grid" style="--dm-cols:${cols}">
          ${items
            .map(
              f => `
            <div class="dm-feature">
              <div class="dm-feature-icon">${escapeHtml(f.icon || '')}</div>
              <h3 class="dm-feature-title">${escapeHtml(f.title || '')}</h3>
              <p class="dm-feature-body">${escapeHtml(f.body || '')}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>
    `;
  }
);

// ─────────────────────────────────────────────────────────────────────
// <TwoColumnFeature> — image on one side, copy + CTA on the other.
// Demonstrates: `file` input (image upload) and `enum` for layout choice.
// ─────────────────────────────────────────────────────────────────────
register(
  {
    name: 'TwoColumnFeature',
    friendlyName: 'Two-Column Feature',
    description: 'Side-by-side media and copy with optional CTA.',
    image: ICONS.TwoColumnFeature,
    inputs: [
      { name: 'eyebrow', type: 'string', defaultValue: 'Compliance' },
      {
        name: 'title',
        type: 'string',
        defaultValue: 'Purpose-built for regulated capital markets',
      },
      {
        name: 'body',
        type: 'longText',
        defaultValue:
          'Built-in transfer agent, escrow, KYC/AML, accreditation and audit trail — so you spend time raising, not integrating.',
      },
      {
        name: 'image',
        type: 'file',
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp', 'svg'],
        defaultValue:
          'https://cdn.builder.io/api/v1/image/assets%2FTEMP%2Fplaceholder-wide',
      },
      {
        name: 'mediaSide',
        type: 'string',
        enum: ['left', 'right'],
        defaultValue: 'right',
      },
      { name: 'ctaText', type: 'string', defaultValue: 'Learn more' },
      { name: 'ctaHref', type: 'url', defaultValue: '#' },
    ],
  },
  props => {
    const reverse = props.mediaSide === 'left';
    const media = props.image
      ? `<img class="dm-twocol-img" src="${escapeHtml(props.image)}" alt="" />`
      : '<div class="dm-twocol-img dm-twocol-img--placeholder"></div>';
    const copy = `
      <div class="dm-twocol-copy">
        ${props.eyebrow
          ? `<span class="dm-eyebrow">${escapeHtml(props.eyebrow)}</span>`
          : ''}
        <h2>${escapeHtml(props.title || '')}</h2>
        <p>${escapeHtml(props.body || '')}</p>
        ${props.ctaText
          ? `<a class="btn btn-primary" href="${escapeHtml(
              props.ctaHref || '#'
            )}">${escapeHtml(props.ctaText)}</a>`
          : ''}
      </div>
    `;
    return `
      <section class="dm-twocol${reverse ? ' dm-twocol--reverse' : ''}">
        ${reverse ? media + copy : copy + media}
      </section>
    `;
  }
);

// ─────────────────────────────────────────────────────────────────────
// <CTABanner> — dark full-width call-to-action.
// Demonstrates: composing the same simple input types as the hero
// into a different layout — useful as a page closer.
// ─────────────────────────────────────────────────────────────────────
register(
  {
    name: 'CTABanner',
    friendlyName: 'CTA Banner',
    description: 'Dark, full-width call-to-action banner.',
    image: ICONS.CTABanner,
    inputs: [
      {
        name: 'heading',
        type: 'string',
        defaultValue: 'Ready to run a smarter raise?',
      },
      {
        name: 'body',
        type: 'longText',
        defaultValue:
          'Join issuers who have raised billions on DealMaker — powered by a modern, investor-first platform.',
      },
      { name: 'primaryCtaText', type: 'string', defaultValue: 'Talk to sales' },
      { name: 'primaryCtaHref', type: 'url', defaultValue: '/contact' },
      {
        name: 'secondaryCtaText',
        type: 'string',
        defaultValue: 'Read case studies',
      },
      { name: 'secondaryCtaHref', type: 'url', defaultValue: '/case-studies' },
    ],
  },
  props => `
    <section class="dm-cta">
      <div class="dm-cta-copy">
        <h3>${escapeHtml(props.heading || '')}</h3>
        <p>${escapeHtml(props.body || '')}</p>
      </div>
      <div class="dm-cta-actions">
        ${props.primaryCtaText
          ? `<a class="btn btn-accent" href="${escapeHtml(
              props.primaryCtaHref || '#'
            )}">${escapeHtml(props.primaryCtaText)}</a>`
          : ''}
        ${props.secondaryCtaText
          ? `<a class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.25)" href="${escapeHtml(
              props.secondaryCtaHref || '#'
            )}">${escapeHtml(props.secondaryCtaText)}</a>`
          : ''}
      </div>
    </section>
  `
);
