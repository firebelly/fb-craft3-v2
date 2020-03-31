// Common js

import jQueryBridget from 'jquery-bridget';
import Flickity from 'flickity/dist/flickity.pkgd.js';
require('flickity-imagesloaded');
import Waypoints from 'waypoints/lib/jquery.waypoints.js';
import Lazysizes from 'lazysizes';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import fitvids from 'fitvids';

import appState from '../util/appState';

// Shared vars
let isTouchDevice,
    vimeoPlayers = [],
    $window = $(window),
    $body = $('body'),
    $document = $(document),
    $siteNav,
    $blobs,
    mousedownTimer;

let blobFps = {
  stop: false,
  frameCount: 0,
  fpsInterval: 0,
  startTime: 0,
  now: 0,
  then: 0,
  elapsed: 0
};

const common = {
  // JavaScript to be fired on all pages
  init() {
    // Set up libraries to be used with jQuery
    jQueryBridget('flickity', Flickity, $);

    // Init shared vars
    $siteNav = $('.site-nav');
    isTouchDevice = _isTouchDevice();

    $blobs = $('#blobs');

    // Add is-touch class for styling (hide carousel pagination divs on ipads, no Next Project rollover images, etc)
    $body.toggleClass('-is-touch', isTouchDevice);

    // Run resize functions on load
    _resize();

    _initCustomCursor();
    _initBigClicky();
    _initSmoothScroll();
    _initSiteNav();
    _initBlobs();
    _initFlickity();
    _initVideos();
    _initForms();
    _initNewsletterForm();

    // Ajaxify newsletter form
    function _initNewsletterForm() {
      $('form.newsletter').each(function() {
        let $form = $(this);
        let $status = $form.find('.status');
        $form.on('submit', e => {
          e.preventDefault();
          $status.removeClass('error success');
          $form.addClass('working');
          if ($form.find('input[name=EMAIL]').val()=='') {
            $status.addClass('error').text('Please enter your email.');
          } else {
            $.getJSON($form.attr('action'), $form.serialize())
              .done(function(data) {
                if (data.result != 'success') {
                  if (data.msg.match(/already subscribed/)) {
                    $status.addClass('error').text('Oops! You’re already subscribed to our newsletter.');
                  } else {
                    $status.addClass('error').text('Oops! ' + data.msg);
                  }
                } else {
                  $status.removeClass('error').addClass('success').text('Success! Check your email to confirm.');
                }
              })
              .fail(() => $status.addClass('error').text('There was an error subscribing. Please try again.'))
              .always(() => $form.removeClass('working'));
          }
        });
      });
    }

    // Forms handling: add has-input to input-wrap after typing for styling labels
    function _initForms() {
      // Add .has-input for styling when field is changed
      $document.on('keyup.forms change.forms blur.forms', 'input,select,textarea', _checkFormInput);

      // Check initial state of fields on load
      $('form').find('input,select,textarea').each(function() {
        let $this = $(this);
        if ($this.val()!=='' && $this.attr('type')!=='hidden') {
          $this.addClass('has-input').parents('.input-wrap:first').addClass('has-input');
        }
      });

      // Check form fields on state change for has-input or invalid for required
      function _checkFormInput(e) {
        // Ignore tab keyup (would trigger error class when tabbing into field for the first time)
        if (e.which === 9) {
          return;
        }

        let has_input = $(e.target).val() !== '';
        $(e.target).toggleClass('has-input', has_input).parents('.input-wrap:first').toggleClass('has-input', has_input);
        $(e.target).parents('.input-wrap:first').toggleClass('invalid', ($(e.target).prop('required') && $(e.target).val() === ''));
      }

    }

    // Bigclicky™ (large clickable area that pulls first a[href] as URL)
    function _initBigClicky() {
      $document.on('click.bigClicky', '.bigclicky', function(e) {
        if (!$(e.target).is('a')) {
          e.preventDefault();
          let link = $(this).find('a:first');
          let href = link[0].href;
          if (href) {
            if (e.metaKey || link.attr('target')) {
              window.open(href);
            } else {
              // Use swup if available
              if (typeof swup !== 'undefined') {
                swup.loadPage({ url: link[0].pathname });
              } else {
                location.href = href;
              }
            }
          }
        }
      });
    }

    // Keyboard navigation and esc handlers
    $document.keyup(function(e) {
      // esc
      if (e.keyCode === 27) {
        _closeNav();
        // Unfocus any focused elements
        if (document.activeElement != document.body) {
          document.activeElement.blur();
        }
      }
    }).on('click.closeNav', 'body.nav-open', function(e) {
      // Clicking outside of nav closes nav
      let $target = $(e.target);
      // Make sure target inside nav content
      if ($target.parents('.nav-toggle').length === 0 && !$target.hasClass('site-nav')  && !$target.hasClass('nav-toggle') && $target.parents('.site-nav').length === 0) {
        _closeNav();
      }
    });

    function _isTouchDevice() {
      var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
      var mq = function(query) {
          return window.matchMedia(query).matches;
      }

      if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          return true;
      }

      // include the 'heartz' as a way to have a non matching MQ to help terminate the join
      // https://git.io/vznFH
      var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
      return mq(query);
    }

    // Big ol' juicy custom cursors for your "pleasure"
    function _initCustomCursor() {
      if (isTouchDevice || !$('.js-cursor').length) {
        return;
      }

      let $customCursor = $('#cursor');
      let lastMousePosition = { x: 0, y: 0 };

      // Update the mouse position
      function onMouseMove(evt) {
        lastMousePosition.x = evt.clientX;
        lastMousePosition.y = evt.clientY;
        requestAnimationFrame(update);
      }

      function update() {
        // Get the element we're hovering over
        let hoveredEl = document.elementFromPoint(lastMousePosition.x, lastMousePosition.y),
            $hoveredEl = $(hoveredEl);

        // Check if element is js-cursor or child of js-cursor
        if (!$hoveredEl.hasClass('js-cursor') && !$hoveredEl.parents('.js-cursor').length) {
          $body.removeClass('-cursor-active');
          return;
        }
        if (!$hoveredEl.hasClass('js-cursor')) {
          $hoveredEl = $hoveredEl.parents('.js-cursor');
        }

        // Enable custom cursor visibility
        $body.addClass('-cursor-active');

        // Set class of custom cursor
        let hoveredClass = $hoveredEl.data('cursor') ? $hoveredEl.data('cursor') : 'view';
        let nextPrevClass = hoveredEl.className.match(/ (next|previous)$/);
        if (nextPrevClass) {
          hoveredClass = nextPrevClass[0].trim();
        }
        $customCursor[0].className = hoveredClass;

        // Now position cursor at lastMousePosition
        $customCursor.css({
          'transform': 'translate3d(' + lastMousePosition.x + 'px, ' + lastMousePosition.y + 'px, 0)'
        });
      }

      $document.on('mousedown.customCursor', () => {
        $body.addClass('-mousedown');
        if (mousedownTimer) { clearTimeout(mousedownTimer); }
        mousedownTimer = setTimeout(() => $body.removeClass('-mousedown'), 150);
      });

      // Listen for mouse movement
      $document.on('mousemove.customCursor', onMouseMove);
      // Make sure a user is still hovered on an element scrolling or resizing window
      $document.on('scroll.customCursor resize.customCursor', update);
    }

    // Smooth scroll to an element
    function _scrollBody(element) {
      let offset = $('.site-header').outerHeight();

      if ($(element).length) {
        appState.isAnimating = true;
        element.velocity('scroll', {
          duration: 500,
          offset: -offset,
          complete: function(elements) {
            appState.isAnimating = false;
          }
        }, 'easeOutCubic');
      }
    }

    function _initSmoothScroll() {
      $document.on('click.smoothScroll', '.smooth-scroll', function(e) {
        e.preventDefault();
        _scrollBody($(this.hash));
      });
    }

    function _initSiteNav() {
      $document.on('click.siteNavOpen', '#nav-open', _openNav);
      $document.on('click.siteNavClose', '#nav-close', _closeNav);
    }

    function _openNav() {
      $body.addClass('nav-open');
      appState.navOpen = true;
      $siteNav.velocity(
        { opacity: 1 }, {
        display: 'flex',
        complete: function() {
          $siteNav.addClass('-active');
        }
      });
    }

    function _closeNav() {
      if (!appState.navOpen) {
        return;
      }
      appState.navOpen = false;
      $siteNav.velocity(
        { opacity: 0 }, {
        display: 'none',
        complete: function() {
          $body.removeClass('nav-open');
          $siteNav.removeClass('-active');
        }
      });
    }

    // Superfluous flesh!
    function _initBlobs() {
      if (!$body.is('.with-blobs')) {
        return;
      }
      $blobs.removeClass('-fading');

      let minAmount = 4,
          maxAmount = (appState.breakpoints.nav ? 14 : 6);

      let blobs = [];
      let amount = Math.ceil(Math.random() * (maxAmount - minAmount) + minAmount);

      for (let i = 0; i < amount; i++) {
        let num = Math.ceil(Math.random() * 10);
        let x = Math.ceil(Math.random() * window.innerWidth * 1.1);
        let y = Math.ceil(Math.random() * window.innerHeight * 1.1);
        let d = Math.ceil(Math.random() * 180);
        $('<div style="left:'+x+'px;top:'+y+'px;" class="blob"><img style="transform:rotate('+d+'deg)" src="/assets/dist/images/blobs/blob-'+num+'.png" role="presentation" alt=""></div>').appendTo($blobs);
      }

      common.startBlobs(30);
    }

    // Carousels
    function _initFlickity() {
      $('.flickity').flickity({
        pageDots: false,
        imagesLoaded: true,
        wrapAround: true,
      });
    }

    // Responsive videos, Vimeo API
    function _initVideos() {
      fitvids();

      // Init vimeo videos using js api
      if (typeof Vimeo === 'undefined') {
        return false;
      }
      $('.vimeo-block').each(function(i) {
        var $this = $(this);
        var el;
        var isBackgroundVideo = $this.is('.background-video');
        var isBannerVideo = $this.is('.banner-video');
        // Set vimeo player options
        // Note: embed options seem to overwrite these, so autoplay=0
        // must be in embed for video to stay paused until waypoint triggers play()
        var opts = {
          autoplay: false,
          loop: false,
          background: false,
          muted: false,
          title: false,
          byline: false,
          portrait: false
        };
        // If background video is switched on, mute video, loop, and autoplay
        if (isBackgroundVideo || isBannerVideo) {
          opts.autoplay = true;
          opts.loop = true;
          opts.muted = true;
          opts.background = true;
        }
        if ($this.find('iframe').length) {
          // Iframe embed
          el = $this.find('iframe')[0];
        } else if ($this.attr('data-url').length) {
          // Div from embeddedAssets
          el = $this[0];
          opts.url = $this.attr('data-url');
          opts.width = $this.attr('data-width');
          opts.height = $this.attr('data-height');
        }
        if (el) {
          vimeoPlayers[i] = {
            player: new Vimeo.Player(el, opts),
            status: 'pause'
          };
          vimeoPlayers[i].player.ready().then(function() {
            if ($this.attr('data-url')) {
              // Hide image once loaded
              $this.find('img').remove();
            }
            // Run fitvids again in case this wasn't an embed
            fitvids();
          });
          // Add waypoint to trigger play when video block scrolls into view
          // todo: add support for pausing when exiting viewport w/ rewind, make loop an option
          // Only autoplay with waypoints if background video
          if (isBackgroundVideo) {
            vimeoPlayers[i].waypoint = $this.waypoint({
              handler: function(direction) {
                if (vimeoPlayers[i].status !== 'play') {
                  vimeoPlayers[i].player.play();
                  vimeoPlayers[i].status = 'play';
                }
              },
              offset: '50%'
            });
          }
          if (isBannerVideo) {
            vimeoPlayers[i].player.play();
          }
        }
      });
    }

    // Called in quick succession as window is resized
    function _resize() {
      // Reset inline styles for navigation for medium breakpoint
      if (appState.breakpoints.nav) {
        $siteNav.attr('style', '');
      }
    }

    $window.resize(_resize);
  },

  startBlobs(fps) {
    blobFps.fpsInterval = 1000 / fps;
    blobFps.then = window.performance.now();
    blobFps.startTime = blobFps.then;
    common.moveBlobs();
  },

  moveBlobs(newtime) {
    if (blobFps.stop) {
      return;
    }
    requestAnimationFrame(common.moveBlobs);
    blobFps.now = newtime;
    blobFps.elapsed = blobFps.now - blobFps.then;

    if (blobFps.elapsed > blobFps.fpsInterval) {
      blobFps.then = blobFps.now - (blobFps.elapsed % blobFps.fpsInterval);
      $('#blobs .blob').each(function() {
        let $this = $(this);
        let x = (Math.random() * -1) + 0.25;
        let y = -0.25;
        $this.css('left', parseFloat($this.css('left').replace('px','')) + x);
        $this.css('top', parseFloat($this.css('top').replace('px','')) + y);
      });
    }
  },

  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },

  unload() {
    // JavaScript to clean up before live page reload

    // Clear out newsletter form
    $('form.newsletter').find('.status').removeClass('error success').end().trigger('reset');

    // Remove blobs if present
    if ($('#blobs .blob').length) {
      $blobs.addClass('-fading');
      setTimeout(function() {
        $('#blobs .blob').remove();
      }, 500);
    }

    // Remove flickity instances
    $('.flickity').each(function() {
      $(this).css({'opacity': 0}).flickity('destroy');
    });

    // Remove custom event watchers
    $document.off('mousedown.customCursor mousemove.customCursor scroll.customCursor resize.customCursor click.smoothScroll click.siteNavOpen click.siteNavClose click.bigClicky keyup.forms change.forms blur.forms');

    // Remove vimeo players
    $.each(vimeoPlayers, function(){
      if (this.waypoint) {
        this.waypoint[0].destroy();
      }
      this.player.destroy();
    });
    vimeoPlayers = [];
  },
};

export default common;