// Import external dependencies
import Velocity from 'velocity-animate';
import Swup from 'swup';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupGaPlugin from '@swup/ga-plugin'
// import SwupDebugPlugin from '@swup/debug-plugin';

// Import local dependencies
import Router from './util/Router';
import colorChanges from './util/colorChanges';
import imageReveals from './util/imageReveals';
import appState from './util/appState';
import modals from './util/modals';

// Routes
import common from './routes/common';
import homepage from './routes/homepage';
import project from './routes/project';
import about from './routes/about';
import work from './routes/work';
import contact from './routes/contact';
import careers from './routes/careers';

// Store hash and remove before swup init to avoid ingesting it, so back works on initial modal
if (window.location.hash) {
  appState.initialHash = window.location.hash;
  history.replaceState(null, null, ' ');
}

const swup = new Swup({
  plugins: [
    new SwupBodyClassPlugin(),
    new SwupScrollPlugin({
      animateScroll: false
    }),
    // new SwupDebugPlugin(),
    new SwupGaPlugin(),
  ],
  linkSelector:
    'a[href^="' +
    window.location.origin +
    '"]:not([href*="/admin"]):not([data-no-swup]), a[href^="/"]:not([href*="/admin"]):not([data-no-swup])',
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
  careers,
});

// Inits
colorChanges.init();
imageReveals.init();
appState.init();

// Load events
$(document).ready(() => routes.loadEvents());

// Reload events when swup replaces content
swup.on('contentReplaced', () => {
  routes.loadEvents();
  colorChanges.init();
  imageReveals.init();
});

swup.on('popState', () => {
  // Triggers image reveals to be instant to avoid re-animating them in on back/next
  appState.popState = true;
});

swup.on('transitionEnd', () => {
  about.checkModal();
  careers.checkAccordion();
  appState.popState = false;
});

swup.on('transitionStart', () => {
  // Cleanup calls for js
  routes.unload();
  colorChanges.unload();
  imageReveals.unload();

  // Disable custom cursor to make it not seem like site has frozen
  document.body.classList.remove('-cursor-active');
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
