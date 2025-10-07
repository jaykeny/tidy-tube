// Settings
const SETTINGS = {
  hideMembersOnly: true,
  minViews: 100000,    // hide normal videos under this
  hideLiveUnder: 100000 // hide live streams with fewer viewers than this
};

// Helper function to hide element + parent if applicable
function hideElement(el) {
  const parent = el.closest('ytd-rich-item-renderer') || el;
  parent.style.display = 'none';
  parent.style.height = '0';
  parent.style.margin = '0';
  parent.style.padding = '0';
}

// Core filter function
function filterVideos() {
  document.querySelectorAll('yt-lockup-view-model').forEach(function(el) {
    const text = el.textContent;

    // Hide "Members only"
    if (SETTINGS.hideMembersOnly && text.includes('Members only')) {
      hideElement(el);
      return;
    }

    // Hide normal videos under minViews
    const viewsMatch = text.match(/([\d,.]+)\s*(K|M)?\s*views/i);
    if (viewsMatch) {
      let num = parseFloat(viewsMatch[1].replace(/,/g, ''));
      const unit = viewsMatch[2];
      if (unit === 'K') num *= 1000;
      else if (unit === 'M') num *= 1000000;

      if (num < SETTINGS.minViews) {
        hideElement(el);
        return;
      }
    }

    // Hide live videos under hideLiveUnder
    const liveMatch = text.match(/([\d,.]+)\s*(K|M)?\s*watching/i);
    if (liveMatch) {
      let num = parseFloat(liveMatch[1].replace(/,/g, ''));
      const unit = liveMatch[2];
      if (unit === 'K') num *= 1000;
      else if (unit === 'M') num *= 1000000;

      if (num < SETTINGS.hideLiveUnder) {
        hideElement(el);
        return;
      }
    }
  });
}

// Run once and then watch for changes
filterVideos();

const observer = new MutationObserver(function(mutationsList) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      filterVideos();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
