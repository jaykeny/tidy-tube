# Tidy Tube

**A lightweight script to declutter YouTube by hiding unwanted videos, filtering recommendations, and improving your browsing experience.**

---

## Description

Tidy Tube lets you:
- Hide "Members only" videos
- Filter videos below a specified view count
- Hide live streams with fewer viewers than a set threshold

This is a simple, customizable tool you can run in your browser console or as a user script.

---


## Installation
You can run this script using extensions like Tampermonkey.

## Script
```
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
```


## Settings

You can adjust the behavior in the `SETTINGS` object in the script:


```
javascript
const SETTINGS = {
  hideMembersOnly: true,    // Hide "Members only" videos
  minViews: 100000,         // Hide normal videos under this view count
  hideLiveUnder: 100000     // Hide live streams with fewer viewers than this
};
```
