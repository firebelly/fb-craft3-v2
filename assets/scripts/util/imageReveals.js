// Image reveal treatment as you scroll
//
// Fades and slides in images as they appear in the viewport

import appState from '../util/appState';

let $reveals,
    activated = [],
    $scrollEl = $(window),
    scrollElHeight,
    scrollTop,
    ticking;

const imageReveals = {

  // Init image reveals
  init(scrollEl=null) {
    if ($('.-reveal').length) {
      // Override scrollEl?
      if (scrollEl) {
        $scrollEl = scrollEl;
      }
      // Reset activated
      activated = [];
      $reveals = $('.-reveal');

      imageReveals.resize();
      imageReveals.update();

      // Reset listeners in case we init() twice on a page (search)
      $scrollEl.off('scroll.reveals resize.reveals load.reveals');

      // Init scroll listeners
      $scrollEl.on('scroll.reveals', imageReveals.scrolling);
      $scrollEl.on('resize.reveals', imageReveals.resize);
      $scrollEl.on('load.reveals', imageReveals.resize);
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
    scrollTop = $scrollEl.scrollTop();
    // Find current sticky section title based on scroll position
    $reveals.each(function(i) {
      if (!activated[i] && this.offsetTop <= (scrollTop + scrollElHeight - (scrollElHeight * 0.05))) {
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
    scrollElHeight = $scrollEl.height();
  },

  // Scrolling
  scrolling(event) {
    imageReveals.requestTick();
  },

  // Garbage collection
  unload() {
    $scrollEl.off('scroll.reveals resize.reveals load.reveals');
  },

};

export default imageReveals
