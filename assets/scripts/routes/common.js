// Common js

import jQueryBridget from 'jquery-bridget';
import Flickity from 'flickity/dist/flickity.pkgd.js';
require('flickity-imagesloaded');
import Waypoints from 'waypoints/lib/jquery.waypoints.js';
import Lazysizes from 'lazysizes';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import * as p5 from 'p5';
import fitvids from 'fitvids';

import appState from '../util/appState';

// Shared vars
let blobMaster,
    vimeoPlayers = [],
    $window,
    $body,
    $document,
    $siteNav;

export default {
  // JavaScript to be fired on all pages
  init() {
    // Set up libraries to be used with jQuery
    jQueryBridget('flickity', Flickity, $);

    // Init shared vars
    $document = $(document);
    $body = $('body');
    $window = $(window);
    $siteNav = $('.site-nav');

    // Run resize functions on load
    _resize();

    _initCustomCursor();
    _initBigClicky();
    _initSmoothScroll();
    _initScrollToTop();
    _initSiteNav();
    _initBlobs();
    _initFlickity();
    _initVideos();
    _initForms();
    _initNewsletterForm();
    _initAccordions();

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
                  } else if (data.msg.match(/Too many subscribe attempts/)) {
                    $status.addClass('error').text('You’ve tried too many times. Check your email to confirm.');
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

    // Simple accordions used on careers page
    function _initAccordions() {
      $('.accordion').each(function() {
        let $this = $(this);
        $this.find('a.expand,a.collapse').on('click', (e) => {
          e.preventDefault();
          $this.toggleClass('active');
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
      if (_isTouchDevice() || !$('.js-cursor').length) {
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
      $document.on('mousemove.customCursor', onMouseMove);
      // Make sure a user is still hovered on an element when they start scrolling
      $document.on('scroll.customCursor', update);
    }

    // Smooth scroll to an element
    function _scrollBody(element, offset, duration, delay) {
      if (typeof duration === 'undefined' || duration === null) {
        duration = 300;
      }

      if ($(element).length) {
        appState.isAnimating = true;
        element.velocity('scroll', {
          duration: duration,
          delay: delay,
          offset: -offset,
          complete: function(elements) {
            appState.isAnimating = false;
          }
        }, 'easeOutSine');
      }
    }

    function _initSmoothScroll() {
      $document.on('click.smoothScroll', '.smooth-scroll', function(e) {
        e.preventDefault();
        _scrollBody($($(this).attr('href')));
      });
    }

    function _initScrollToTop() {
      $document.on('click.scrollToTop', '.scroll-to-top', function(e) {
        e.preventDefault();
        _scrollBody($body);
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
      $('canvas').removeClass('-fading');

      const bloblob = (p5) => {
        let maxWidth,
            color = $body.attr('data-blob-color') || '#FF3D00',
            speed = 0.05,
            thickness,
            frameSpeed = 30,
            minAmount = 4,
            maxAmount,
            trail = false;

        // Set thickness based on viewport size
        if (appState.breakpoints.nav) {
          maxWidth = 110;
          thickness = 48;
          maxAmount = 14;
        } else {
          maxWidth = 78;
          thickness = 38;
          maxAmount = 6;
        }

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

      blobMaster = new p5(bloblob);
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
            $this.waypoint({
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
  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
  unload() {
    // JavaScript to clean up before live page reload

    // Clear out newsletter form
    $('form.newsletter').find('.status').removeClass('error success').end().trigger('reset');

    // Remove blobs if present
    if (blobMaster) {
      $('canvas').addClass('-fading');
      setTimeout(blobMaster.remove, 500);
    }

    // Remove flickity instances
    $('.flickity').each(function() {
      $(this).flickity('destroy');
    });

    // Remove custom event watchers
    $document.off('mousemove.customCursor scroll.customCursor click.smoothScroll click.scrollToTop click.siteNavOpen click.siteNavClose click.bigClicky keyup.forms change.forms blur.forms');

    // Remove vimeo players
    $.each(vimeoPlayers, function(){
      this.player.destroy();
    });
  },
};
