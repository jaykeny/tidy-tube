# Tidy Tube

**My feed for YouTube has become useless, so after months of hitting not interested on member videos and videos under 1000 views that were bots, I decided to build something that would make my feed and recommendations actually useful.**

---

## Description

Tidy Tube lets you:
- Hide "Members only" videos
- Filter videos below a specified view count
- Hide live streams with fewer viewers than a set threshold
- Hide videos older than one month
- Hide videos that have a progress bar

This is a simple, customizable tool you can run in your browser console or as a user script.

---


## Installation
You can run this script using extensions like Tampermonkey and installing via [Greasy Fork](https://greasyfork.org/en/scripts/551895-tidy-tube).

## Script
```
// Settings
const SETTINGS = {
  hideMembersOnly: true,  // hide member videos
  minViews: 100000,       // hide normal videos under this
  hideLiveUnder: 100000,  // hide live streams with fewer viewers than this
  hideOlderThanMonths: 1, // hide videos older than this number of months
  hideWatched: true       // hide videos with watched progress bar
};

// Helper function to hide element + parent if applicable
function hideElement(el) {
  const parent = el.closest('ytd-rich-item-renderer') || el;
  parent.style.display = 'none';
  parent.style.height = '0';
  parent.style.margin = '0';
  parent.style.padding = '0';
}

// Helper function to check video age
function isOlderThanMonths(text, months) {
  const match = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!match) return false;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit === "month" && value >= months) return true;
  if (unit === "year") return true;
  if (unit === "week" && (value / 4) >= months) return true;
  if (unit === "day" && (value / 30) >= months) return true;
  if (unit === "hour" && (value / (24 * 30)) >= months) return true;
  if (unit === "minute" && (value / (60 * 24 * 30)) >= months) return true;
  if (unit === "second" && (value / (60 * 60 * 24 * 30)) >= months) return true;

  return false;
}

// Core filter function
function filterVideos() {
  const isChannelVideosPage = location.pathname.includes("/videos");

  document.querySelectorAll('ytd-rich-item-renderer').forEach(function(el) {
    const text = el.textContent;

    // For channel video pages: ONLY hide Members only videos
    if (isChannelVideosPage) {
      if (SETTINGS.hideMembersOnly && text.includes('Members only')) {
        hideElement(el);
      }
      return; // skip other filters
    }

    // Normal pages: all filters apply

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

    // Hide videos older than specified months
    if (SETTINGS.hideOlderThanMonths && isOlderThanMonths(text, SETTINGS.hideOlderThanMonths)) {
      hideElement(el);
      return;
    }

    // Hide watched videos
    if (SETTINGS.hideWatched && el.querySelector('.ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment')) {
      hideElement(el);
      return;
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

observer.observe(document.body, { childList: true, subtree: true });
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
