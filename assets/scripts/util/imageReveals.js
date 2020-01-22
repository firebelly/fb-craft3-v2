// Image reveal treatment as you scroll
//
// Fades and slides in images as they appear in the viewport

import appState from '../util/appState';

let $reveals,
    activated = [],
    $window = $(window),
    windowHeight,
    scrollTop,
    ticking;

const imageReveals = {

  // Init sticky headers
  init() {
    if ($('.-reveal').length) {
      // Reset activated
      activated = [];
      $reveals = $('.-reveal');

      imageReveals.resize();
      imageReveals.update();

      $window.on('scroll.reveals', imageReveals.scrolling);
      $window.on('resize.reveals', imageReveals.resize);
      $window.on('load.reveals', imageReveals.resize);
    }

    // Reposition after lazyloaded images show
    document.addEventListener('lazyloaded', function(e){
      imageReveals.resize();
    });
  },

  // Request update using requestAnimationFrame
  requestTick() {
    if(!ticking) {
      requestAnimationFrame(imageReveals.update);
    }
    ticking = true;
  },

  // Update image reveal
  update() {
    ticking = false;
    scrollTop = $window.scrollTop();
    // Find current sticky section title based on scroll position
    $reveals.each(function(i) {
      if (!activated[i] && this.getAttribute('data-originalPosition') <= (scrollTop + windowHeight - (windowHeight * 0.05))) {
        $(this).addClass('-active');
        if (appState.popState) {
          $(this).addClass('-instant');
        }
        activated[i] = 1;
      }
    });
  },

  // Resize, recalculate positions
  resize(event) {
    windowHeight = $window.height();
    $reveals.each(function(i) {
      let $this = $(this);
      $this.attr('data-originalPosition', $this.offset().top);
    });
  },

  // Scrolling
  scrolling(event) {
    imageReveals.requestTick();
  },

  // Garbage collection
  unload() {
    $window.off('scroll.reveals resize.reveals load.reveals');
  },

};

export default imageReveals
