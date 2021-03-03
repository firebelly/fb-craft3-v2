// Project page js

export default {
  init() {
    // JavaScript to be fired on project pages
    _initTypeTester();
    _initCopyAnchorToClipboard();

    // Add hover class to rollover images on hover for Next Project links (if not touch)
    if (!document.body.classList.contains('-is-touch')) {
      $('.pagination.-next-project').each(function() {
        let $this = $(this);
        let $rolloverImages = $this.find('.rollover-images');
        $this.find('a').hover(function() {
          $rolloverImages.toggleClass('hover');
        });
      });
    }

    function _initTypeTester() {
      // If there's a type tester present
      $('.type-tester').each(function() {
        let $typeTester = $(this),
            $typeTesterInner = $typeTester.find('.-inner'),
            $para = $typeTester.find('.test-para'),
            $svgContainer = $('.type-tester').find('.typeTesterSvgFont'),
            $glyphChart = $('.type-tester').find('.glyphChart'),

            fontFamily = $typeTester.attr('data-font'),
            startingFontSize = $typeTester.attr('data-font-size'),
            lineHeight = $typeTester.attr('data-line-height'),
            svgUrl = $typeTester.attr('data-svg-url');

        // Initialize CSS for tester
        $typeTesterInner.css({
          'font-family': fontFamily+', "AdobeBlank"',
          'line-height': lineHeight
        });

        // Set Up Tools
        let $tools = $('<div class="typetools"></div>').prependTo($typeTester);
        let $toolsContainer = $('<div class="typetools-container block-wrap"></div>').appendTo($tools);

        // Get SVG font file if it is set and generate the glyph chart
        if ($typeTester.attr('data-svg-url')) {

          // Add glyphs button to toolbar
          $toolsContainer.append('<div class="type-tool glyphsTypeToggle"><h4>View</h4><button class="typeToggle" data-target=".test-para">Type Tester</button><button class="glyphsToggle" data-target=".glyphChart">Glyphs</button></div>');

          // Watch for glyphs/type toggle
          $(document).on('click', '.glyphsTypeToggle button', function() {
            var $targetElem = $typeTester.find($(this).attr('data-target'));
            $typeTester.find('.glyphChart.-active, .test-para.-active, .glyphsTypeToggle button.-active').removeClass('-active');
            $targetElem.addClass('-active');
            $(this).addClass('-active');

            // Add/remove -hidden class on type-only tools
            if ($targetElem.hasClass('.test-para')) {
              $('.type-tool.type-only').removeClass('hidden');
            } else {
              $('.type-tool.type-only').addClass('hidden');
            }
          });

          $svgContainer.load(svgUrl, function(svgUrl) {
            // Find all glyph nodes in the SVG file
            var svg = $svgContainer.find('svg glyph[unicode][d]');

            // Add unicode escaping for CSS
            var unicodePrefix = '\\';
            var glyphs = {'glyphsLowercase': [], 'glyphsUppercase': [], 'glyphsOther': []};
            var lowercase = new RegExp("^([a-z])$");
            var uppercase = new RegExp("^([A-Z])$");

            for (var i=0; i < svg.length; i++) {
              var unicode = svg[i].getAttribute('unicode').toString();
              if (lowercase.test(unicode)) {
                glyphs.glyphsLowercase.push(unicode);
              } else if (uppercase.test(unicode)) {
                glyphs.glyphsUppercase.push(unicode);
              } else {
                glyphs.glyphsOther.push(unicode);
              }
            }

            $.each(glyphs, function(group, groupArray) {
              var glyphsOutput = '';

              for (var i=0; i < groupArray.length; i++) {
                var glyphChar = groupArray[i].charCodeAt();

                glyphChar = glyphChar.toString(16); // Convert to string format
                glyphsOutput += '<li class="glyph-' + groupArray[i] + '">' + groupArray[i] + '</li>';
              }

              $glyphChart.find('.' + group).append(glyphsOutput);
            });

          });
        }

        // Add style button to toolbar
        $toolsContainer.append('<div class="type-tool"><h4>Style</h4><button class="styleToggle -active" data-style="lowercase">Sans-serif</button><button class="styleToggle" data-style="uppercase">Serif</button></div>');
        $para.addClass('lowercase');
        $typeTester.addClass('lowercase');

        // Font Size
        // Get min/max from data attributes
        var minSize = $typeTester.attr('data-min-size');
        var maxSize = $typeTester.attr('data-max-size');

        $toolsContainer.append('<div class="type-tool type-only fontSizeTool"><label for="fontSize" class="fontSizeLabel">Size: <span class="currentFontSize"></span></label><input type="range" name="fontSize" class="fontSize" min="'+minSize+'" max="'+maxSize+'" step="6"></div>');
        var $fontSize = $tools.find('.fontSize');
        var $currentFontSize = $tools.find('.currentFontSize');
        // Set starting font size
        $typeTesterInner.css('font-size', startingFontSize+'px');
        $fontSize.val(startingFontSize);
        $currentFontSize.html(startingFontSize+'px');

        // Font Weights
        if ($typeTester.attr('data-weights')) {
          $toolsContainer.append('<div class="type-tool"><label for="fontWeight">Weight</label><select name="fontWeight" class="fontWeight"></select></div>');
          var $fontWeight = $tools.find('.fontWeight');

          var dataStyles = $typeTester.attr('data-weights');
          var weights = dataStyles.split('-');
          $.each(weights, function(i) {
            $fontWeight.append('<option value="'+this+'">'+this+'</option>');
          });

          // Weight
          $fontWeight.on('change', function(e) {
            var currentStyle = $(this).val();
            $typeTesterInner.css('font-weight', currentStyle);
          });
        }

        // Paragraph Style
        $toolsContainer.append('<div class="type-tool type-only textAlignment"><label>Align</label><button class="alignment -left" data-alignment="left"><span class="visually-hidden">Left</span><span class="lines"></span></button><button class="alignment -center" data-alignment="center"><span class="visually-hidden">Center</span><span class="lines"></span></button><button class="alignment -right" data-alignment="right"><span class="visually-hidden">Right</span><span class="lines"></span></button></div>');
        var $textAlignment = $tools.find('.textAlignment');
        var initialAlignment = $typeTester.attr('data-initial-alignment');
        $para.css('text-align', initialAlignment);
        $textAlignment.find('button[data-alignment='+initialAlignment+']').addClass('-active');

        // Color Pairs
        if ($typeTester.attr('data-color-pairs') !== 'undefined') {
          var colorData = $typeTester.attr('data-color-pairs');
          var colorPairs = colorData.split(' ');

          if (colorPairs.length > 1) {
            $toolsContainer.append('<div class="type-tool colorPairs"><label>Color</label><div class="colorPairsContainer"></div></div>');
            var $colorPairs = $tools.find('.colorPairs');

            $.each(colorPairs, function(i) {
              var colors = this.split('-');
              var textColor = colors[0];
              var backgroundColor = colors[1];

              $typeTester.find('.colorPairsContainer').append('<button class="color-pair" data-text-color="'+textColor+'" data-background-color="'+backgroundColor+'"><span style="color:'+textColor+';background-color:'+backgroundColor+';">A</span></button>');
            });

            $typeTester.find('.colorPairs .color-pair:first').addClass('-active');
            var textColor = $typeTester.find('.colorPairs .color-pair:first').attr('data-text-color');
            var backgroundColor = $typeTester.find('.colorPairs .color-pair:first').attr('data-background-color');
            $typeTesterInner.css({
              'color': textColor,
              'background-color': backgroundColor
            });

            $colorPairs.on('click', 'button', function() {
              $('.color-pair.-active').removeClass('-active');
              $(this).addClass('-active');
              var textColor = $(this).attr('data-text-color');
              var backgroundColor = $(this).attr('data-background-color');
              $typeTesterInner.css({
                'color': textColor,
                'background-color': backgroundColor
              });
            });
          }

        }

        // Set Active state
        if ($para.is('.-active')) {
          $tools.find('.typeToggle').addClass('-active');
        } else if ($glyphChart.is('.-active')) {
          $tools.find('.glyphsToggle').addClass('-active');
          $tools.find('.type-tool.type-only').addClass('hidden');
        }

        // Watch for changes on individual tools
        // Style
        $('.styleToggle').on('click', function(e) {
          var style = $(this).attr('data-style');
          $typeTester.removeClass('lowercase uppercase');
          $typeTester.addClass(style);
          $tools.find('button.styleToggle.-active').removeClass('-active');
          $(this).addClass('-active');
        });

        // Size
        $fontSize.on('input', function(e) {
          var currentSize = $(this).val();
          $currentFontSize.html(currentSize+'px');
          $para.css('font-size', currentSize+'px');
          $typeTesterInner.css('font-size', currentSize+'px');
        });

        // Text Alignment
        $textAlignment.on('click', 'button', function(e) {
          $textAlignment.find('button.-active').removeClass('-active');
          $(this).addClass('-active');
          var alignment = $(this).attr('data-alignment');
          $para.css('text-align', alignment);
        });

        // Type Tester Activation
        $para.on('focus', function(e) {
          $(this).find('.type-cursor').remove();
        }).on('blur', function(e) {
          var $paraText = $(this).html().replace(/(<br>\s*)+$/,'');
          $(this).html($paraText);
          $(this).append('<span class="type-cursor"></span>');
        });

      });
    }

    // Copy anchor link on click
    function _initCopyAnchorToClipboard() {
      $('.copy-anchor-link').on('click', function() {
        navigator.clipboard.writeText($(this).attr('data-link'));
      });
    }
  },

  finalize() {
    // JavaScript to be fired on project pages, after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
  },

};
