// import external dependencies
import Velocity from 'velocity-animate';

// import local dependencies
import Router from './util/Router';
import colorChanges from './util/colorChanges';
import common from './routes/common';
import homepage from './routes/homepage';
import project from './routes/project';
import about from './routes/about';
import work from './routes/work';
import contact from './routes/contact';

/** Populate Router instance with DOM routes */
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

// Load Events
$(document).ready(() => routes.loadEvents());

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
