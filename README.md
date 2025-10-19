# Tidy Tube

My feed for YouTube has become cluttered with videos that were either member only or made by bots, so after months of hitting not interested on them, I decided to build something that would make my feed and recommendations actually show things I would watch.


## Description
Tidy Tube lets you:
- Hide "Members only" videos
- Filter videos below a specified view count
- Hide live streams with fewer viewers than a set threshold
- Hide videos older than one month
- Hide videos that have a progress bar

This is a simple, customizable tool you can run in your browser console or as a user script.


## Installation
You can run this script using extensions like Tampermonkey and installing via [Greasy Fork](https://greasyfork.org/en/scripts/551895-tidy-tube).

## Script
```
// Settings
const SETTINGS = {
  hideMembersOnly: true, // hide member videos
  minViews: 1000, // hide normal videos under this view count
  hideLiveUnder: 100000, // hide live streams with fewer viewers than this
  hideOlderThanMonths: 1, // hide videos older than this number of months
  hideWatched: true, // hide videos with watched progress bar
};

// Helper function to hide element + parent if applicable
function hideElement(el) {
  const parent = el.closest("ytd-rich-item-renderer") || el;
  parent.style.display = "none";
  parent.style.height = "0";
  parent.style.margin = "0";
  parent.style.padding = "0";
}

// Helper function to check video age
function isOlderThanMonths(text, months) {
  const match = text.match(
    /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i
  );
  
  if (!match) return false;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit === "month" && value >= months) return true;
  if (unit === "year") return true;
  if (unit === "week" && value / 4 >= months) return true;
  if (unit === "day" && value / 30 >= months) return true;
  if (unit === "hour" && value / (24 * 30) >= months) return true;
  if (unit === "minute" && value / (60 * 24 * 30) >= months) return true;
  if (unit === "second" && value / (60 * 60 * 24 * 30) >= months) return true;

  return false;
}

// Get view count from the new YouTube layout
function getViewCount(el) {
  const span = Array.from(el.querySelectorAll('span[role="text"]')).find((s) =>
    /\bviews?\b/i.test(s.textContent)
  );

  if (!span) return null;

  const match = span.textContent.match(/([\d,.]+)\s*(K|M)?\s*views?/i);

  if (!match) return null;

  let num = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2];

  if (unit === "K") num *= 1000;

  else if (unit === "M") num *= 1000000;
  
  return num;
}

// Core filter logic
function filterVideos() {
  const isChannelVideosPage = location.pathname.includes("/videos");

  document
    .querySelectorAll("ytd-rich-section-renderer")
    .forEach(function (section) {
      hideElement(section);
    });

  document.querySelectorAll("ytd-rich-item-renderer").forEach(function (el) {
    const text = el.textContent;

    // Channel Videos tab: only hide members-only content
    if (isChannelVideosPage && SETTINGS.hideMembersOnly) {
      if (
        text.includes("Members only") ||
        el.querySelector(".sponsorThumbnailLabelVisible") ||
        text.includes("Exclusive Access")
      ) {
        hideElement(el);
      }
      return;
    }

    // Hide YouTube Mixes (auto-generated playlists)
    if (/Mix\s*-\s*/i.test(text) || text.includes("Mix –")) {
      hideElement(el);
      return;
    }

    // Hide members-only videos
    if (SETTINGS.hideMembersOnly) {
      if (
        text.includes("Members only") ||
        el.querySelector(".sponsorThumbnailLabelVisible") ||
        text.includes("Exclusive Access")
      ) {
        hideElement(el);
        return;
      }
    }

    // Hide videos under minViews
    const views = getViewCount(el);
    if (views !== null && views < SETTINGS.minViews) {
      hideElement(el);
      return;
    }

    // Hide live videos under hideLiveUnder
    const liveMatch = text.match(/([\d,.]+)\s*(K|M)?\s*watching/i);
    if (liveMatch) {
      let num = parseFloat(liveMatch[1].replace(/,/g, ""));
      const unit = liveMatch[2];
      if (unit === "K") num *= 1000;
      else if (unit === "M") num *= 1000000;
      if (num < SETTINGS.hideLiveUnder) {
        hideElement(el);
        return;
      }
    }

    // Hide videos older than specified months
    if (
      SETTINGS.hideOlderThanMonths &&
      isOlderThanMonths(text, SETTINGS.hideOlderThanMonths)
    ) {
      hideElement(el);
      return;
    }

    // Hide watched videos
    if (
      SETTINGS.hideWatched &&
      el.querySelector(
        ".ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment"
      )
    ) {
      hideElement(el);
      return;
    }
  });
}

// Run once and then watch for DOM changes
filterVideos();

const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
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
  hideMembersOnly: true,  // hide member videos
  minViews: 100000,       // hide normal videos under this
  hideLiveUnder: 100000,  // hide live streams with fewer viewers than this
  hideOlderThanMonths: 1, // hide videos older than this number of months
  hideWatched: true       // hide videos with watched progress bar
};
```

## Changelog

### 1.2.0
* Added: Support for latest UI
* Added: Hiding of playlists
* Added: Hiding of recommended videos, games, and various other sections
* Bugfix: Sometimes there would be a gap where videos should be

### 1.1.1
* Bugfix: Channel videos were showing member videos

### 1.1.0
* Added: Ability to hide videos older than X months
* Added: Ability to hide videos that have a progress bar

### 1.0.0
* Initial Release
