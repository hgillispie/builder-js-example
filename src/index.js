import './index.css';
import { builder } from '@builder.io/sdk';
import './components'; // side-effect: registers custom components with Builder
import { renderBlocks } from './renderer';

const BUILDER_API_KEY = '830f2ea53ad547e9a848a1be9006b414';
builder.init(BUILDER_API_KEY);

// Every route is a catch-all for Builder pages. The header/footer live
// in index.html as the global shell; Builder controls the <main> contents.
updatePage();
window.addEventListener('popstate', updatePage);

// Client-side routing for the static header links.
for (const link of document.querySelectorAll('.site-header .link, .logo')) {
  link.addEventListener('click', e => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || href.startsWith('http')) return;
    e.preventDefault();
    history.pushState({}, '', href);
    updatePage();
  });
}

function updatePage() {
  // .subscribe() (not .promise()) so the Builder visual editor's
  // drag/drop/edit updates re-render the preview in real time.
  builder
    .get('page', { url: location.pathname || '/' })
    .subscribe(content => {
      const blocks = content && content.data && content.data.blocks;
      document.querySelector('#app').innerHTML = blocks
        ? renderBlocks(blocks)
        : `<div class="empty-state">
             <h2>No page found at <code>${location.pathname}</code></h2>
             <p>Create one in the Builder editor — the DealMaker components are registered and ready to drag in.</p>
           </div>`;
    });
}
