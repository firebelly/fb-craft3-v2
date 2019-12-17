// Color change blocks

export let $colorChangeBlocks = [],
    colorChangeValues = [{'background': '#F2F2F0', 'color': '#232323'}], // Initial project-block bg + color
    $rootElement,
    $window,
    scrollTop,
    windowHeight,
    ticking;

const colorChanges = {

  // Init color changes
  init() {
    if ($('.color-change').length) {
      $window = $(window);
      $rootElement = $('.single-project');
      $colorChangeBlocks = $('.color-change');

      colorChanges.setBlockPositions();

      $window.off('scroll.colorChanges').on('scroll.colorChanges', colorChanges.scrolling);
      $window.off('resize.colorChanges').on('resize.colorChanges', colorChanges.resizing);
      $window.off('load.colorChanges').on('load.colorChanges', colorChanges.resizing);

      // Reposition color changes after lazyloaded images show
      document.addEventListener('lazyloaded', function(e){
        colorChanges.resizing();
      });
    }
  },

  // Request update using requestAnimationFrame
  requestTick() {
    if(!ticking) {
      requestAnimationFrame(colorChanges.update);
    }
    ticking = true;
  },

  // Update request
  update() {
    ticking = false;
    let currentColorValues = colorChangeValues[0];
    // Find current sticky section title based on scroll position
    $colorChangeBlocks.each(function(i) {
      if (this.getAttribute('data-originalPosition') <= scrollTop + (windowHeight * 0.8)) {
        currentColorValues = colorChangeValues[i+1];
      }
    });
    $rootElement.css({
      'background': currentColorValues.background,
      'color': currentColorValues.color
    });
    document.body.style.setProperty('--projectBlockColor', currentColorValues.color);
  },

  // Recalculate positions/sizes
  setBlockPositions() {
    $colorChangeBlocks.each(function(i) {
      let $this = $(this);
      // Cache block values
      colorChangeValues[i+1] = {
        'background': $this.attr('data-background'),
        'color': $this.attr('data-color')
      };
      $this.attr('data-originalPosition', $this.offset().top);
    });
    windowHeight = $window.height();
  },

  // Resizing
  resizing(event) {
    colorChanges.setBlockPositions();
  },

  // Scrolling
  scrolling(event) {
    scrollTop = $window.scrollTop();
    colorChanges.requestTick();
  }

};

export default colorChanges
