import jQueryBridget from 'jquery-bridget';
import Flickity from 'flickity/dist/flickity.pkgd.js';
require('flickity-imagesloaded');
import Waypoints from 'waypoints/lib/jquery.waypoints.js';
import Lazysizes from 'lazysizes';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import * as p5 from 'p5';
import fitvids from 'fitvids';

import appState from '../util/appState';
import Breakpoints from '../util/Breakpoints';

export default {
  // JavaScript to be fired on all pages
  init() {
    // Set up libraries to be used with jQuery
    jQueryBridget('flickity', Flickity, $);

    const $document = $(document);
    const $body = $('body');
    const $window = $(window);
    const $html = $('html');
    const pageAt = window.location.pathname;
    const $siteNav = $('.site-nav');

    let $customCursor,
        players = [];

    // Run resize functions on load
    _resize();

    _initCustomCursor();
    _initBigClicky();
    _initSmoothScroll();
    _initActiveToggle();
    _initSiteNav();
    _initBlobs();
    _initFlickity();
    _initVideos();
    // _initForms();

    // Bigclicky™ (large clickable area that pulls first a[href] as URL)
    function _initBigClicky() {
      $document.on('click', '.bigclicky', function(e) {
        if (!$(e.target).is('a')) {
          e.preventDefault();
          var link = $(this).find('a:first');
          var href = link.attr('href');
          if (href) {
            if (e.metaKey || link.attr('target')) {
              window.open(href);
            } else {
              location.href = href;
            }
          }
        }
      });
    }

    // Keyboard navigation and esc handlers
    $(document).keyup(function(e) {
      // esc
      if (e.keyCode === 27) {
        _closeNav();
        // Unfocus any focused elements
        if (document.activeElement != document.body) {
          document.activeElement.blur();
        }
      }
    }).on('click', 'body.nav-open', function(e) {
      // Clicking outside of nav closes nav
      let $target = $(e.target);
      // Make sure target inside nav content
      if ($target.parents('.nav-toggle').length === 0 && !$target.hasClass('site-nav')  && !$target.hasClass('nav-toggle') && $target.parents('.site-nav').length === 0) {
        _closeNav();
      }
    });



    // Big ol' juicy custom cursors for your "pleasure"
    function _initCustomCursor() {
      if (!$('.js-cursor').length) {
        return;
      }

      $customCursor = $('<div id="cursor"></div>').appendTo($body);

      var lastMousePosition = { x: 0, y: 0 };

      // Update the mouse position
      function onMouseMove(evt) {
        lastMousePosition.x = evt.clientX;
        lastMousePosition.y = evt.clientY;
        requestAnimationFrame(update);
      }

      function update() {
        // Get the element we're hovered on
        var hoveredEl = document.elementFromPoint(lastMousePosition.x, lastMousePosition.y);

        // Check if the element or any of its parents have a .js-cursor class
        if ($(hoveredEl).parents('.js-cursor').length || $(hoveredEl).hasClass('js-cursor')) {
          $body.addClass('-cursor-active');

          if ($(hoveredEl).is('.previous')) {
            $customCursor.addClass('previous');
          } else {
            $customCursor.removeClass('previous');
          }

          if ($(hoveredEl).is('.next')) {
            $customCursor.addClass('next');
          } else {
            $customCursor.removeClass('next');
          }
        } else {
          $body.removeClass('-cursor-active');
        }

        // now draw object at lastMousePosition
        $customCursor.css({
          'transform': 'translate3d(' + lastMousePosition.x + 'px, ' + lastMousePosition.y + 'px, 0)'
        });
      }

      // Listen for mouse movement
      $document.on('mousemove', onMouseMove);
      // Make sure a user is still hovered on an element when they start scrolling
      $document.on('scroll', update);
    }

    // Smooth scroll to an element
    function _scrollBody(element, offset, duration, delay) {
      var headerOffset = $siteHeader.outerHeight();
      if (typeof offset === "undefined" || offset === null) {
        offset = headerOffset;
      }
      if (typeof duration === "undefined" || duration === null) {
        duration = 300;
      }

      if ($(element).length) {
        appState.isAnimating = true;
        element.velocity("scroll", {
          duration: duration,
          delay: delay,
          offset: -offset,
          complete: function(elements) {
            appState.isAnimating = false;
          }
        }, "easeOutSine");
      }
    }

    function _initSmoothScroll() {
      $body.on('click', '.smooth-scroll', function(e) {
        e.preventDefault();
        _scrollBody($($(this).attr('href')));
      });
    }

    function _initActiveToggle() {
      $(document).on('click', '[data-active-toggle].-active', function(e) {
        if ($(this).attr('data-active-toggle') !== '') {
          $(this).removeClass('-active');
          $($(this).attr('data-active-toggle')).removeClass('-active');
        }
      });
      $(document).on('click', '[data-active-toggle]:not(.-active)', function(e) {
        if ($(this).attr('data-active-toggle') !== '') {
          $(this).addClass('-active');
          $($(this).attr('data-active-toggle')).addClass('-active');
        }
      });
    }

    function _initSiteNav() {
      $(document).on('click', '#nav-open', _openNav);
      $(document).on('click', '#nav-close', _closeNav);
    }

    function _openNav() {
      $body.addClass('nav-open');
      appState.navOpen = true;
      $siteNav.velocity(
        { opacity: 1 }, {
        display: "flex",
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
        display: "none",
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

      const sketch = p5 => {
        let maxWidth = 110,
            color = $body.attr('data-blob-color') || '#FF3D00',
            speed = 0.05,
            frameSpeed = 30,
            thickness = 48,
            minAmount = 4,
            maxAmount = 14,
            trail = false;

        // make library globally available
        window.p5 = p5;

        let blobs = []; // array of Jitter objects
        let amount = Math.ceil(p5.random(minAmount,maxAmount));

        p5.setup = () => {
          p5.createCanvas(window.innerWidth * 1.1, window.innerHeight * 1.1);
          p5.angleMode(p5.DEGREES);
          p5.noStroke();
          p5.frameRate(frameSpeed);
          // Create objects
          for (let i = 0; i < amount; i++) {
            blobs.push(new Jitter());
          }
        }

        p5.draw = () => {
          if (trail === false) {
            p5.clear();
          }
          for (let i = 0; i < blobs.length; i++) {
            p5.push();
            blobs[i].move();
            blobs[i].display();
            p5.pop();
          }
        }

        p5.windowResized = () => {
          p5.resizeCanvas(window.innerWidth * 1.1, window.innerHeight * 1.1, false);
        }

        // Jitter class
        class Jitter {
          constructor() {
            this.h = Math.random() * (maxWidth - thickness) + thickness;
            this.x = p5.random(p5.width - thickness);
            this.y = p5.random(p5.height - this.h);
            this.speed = p5.random(speed, speed + (speed * 3));
            this.rotation = p5.random(0,360);
          }

          move() {
            this.x += p5.random(-this.speed * 2, this.speed);
            this.y += -this.speed;
            // if (this.y + (this.h / 2) < 0) {
            //   this.y = p5.height + this.h;
            //   this.x = p5.random(p5.width);
            // }
          }

          display() {
            p5.fill(color);
            p5.push();
              p5.translate(this.x, this.y);
              p5.rotate(this.rotation);
              p5.rectMode(p5.CENTER);
              p5.rect(0, 0, thickness, this.h, 24, 24, 24, 24);
            p5.pop();
          }
        }
      }

      new p5(sketch);
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
          players[i] = {
            player: new Vimeo.Player(el, opts),
            status: 'pause'
          };
          players[i].player.ready().then(function() {
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
            $this.waypoint({
              handler: function(direction) {
                if (players[i].status !== 'play') {
                  players[i].player.play();
                  players[i].status = 'play';
                }
              },
              offset: '50%'
            });
          }
          if (isBannerVideo) {
            players[i].player.play();
          }
        }
      });
    }

    // Called in quick succession as window is resized
    function _resize() {
      // Reset inline styles for navigation for medium breakpoint
      if (Breakpoints.nav) {
        $siteNav.attr('style', '');
      }
    }

    $(window).resize(_resize);
  },
  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
};
