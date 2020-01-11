// Import external dependencies
import Velocity from 'velocity-animate';
import Swup from 'swup';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupGaPlugin from '@swup/ga-plugin'
import Waypoint from 'waypoints/lib/jquery.waypoints.js';

// Import local dependencies
import Router from './util/Router';
import colorChanges from './util/colorChanges';
import modals from './util/modals';
import common from './routes/common';
import homepage from './routes/homepage';
import project from './routes/project';
import about from './routes/about';
import work from './routes/work';
import contact from './routes/contact';

const swup = new Swup({
  plugins: [
    new SwupBodyClassPlugin(),
    new SwupScrollPlugin({
      animateScroll: false
    }),
    new SwupGaPlugin(),
  ],
  linkSelector:
    'a[href^="' +
    window.location.origin +
    '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup])',
  containers: ["#page", "#site-nav"]
});

// Set to global to share with modules
window.swup = swup;

// Populate Router instance with DOM routes
const routes = new Router({
  common,
  homepage,
  project,
  about,
  work,
  contact,
});

// Init color changes
colorChanges.init();

// Load events
$(document).ready(() => routes.loadEvents());

// Reload events when swup replaces content
swup.on('contentReplaced', () => {
  routes.loadEvents();
});

swup.on('popState', () => {
  // Close any open modals
  modals.closeModal();
});

// Cleanup call for js
swup.on('transitionStart', () => {
  routes.unload();
});

// Flickity fix for iOS 13
(function() {
  var touchingCarousel = false,
    touchStartCoords;

  document.body.addEventListener('touchstart', function(e) {
    if (e.target.closest('.flickity-slider')) {
      touchingCarousel = true;
    } else {
      touchingCarousel = false;
      return;
    }

    touchStartCoords = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    }
  });

  document.body.addEventListener('touchmove', function(e) {
    if (!(touchingCarousel && e.cancelable)) {
      return;
    }

    var moveVector = {
      x: e.touches[0].pageX - touchStartCoords.x,
      y: e.touches[0].pageY - touchStartCoords.y
    };

    if (Math.abs(moveVector.x) > 7)
      e.preventDefault()

  }, {passive: false});
})();
