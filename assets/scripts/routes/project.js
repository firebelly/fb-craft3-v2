export default {
  init() {
    // JavaScript to be fired on project pages

    _initTypeTester();

    // Add hover class to rollover images on hover for Next Project links
    $('.pagination.-next').each(function() {
      let $rolloverImages = $(this).find('.rollover-images');
      $(this).find('a').hover(function() {
        $rolloverImages.toggleClass('hover');
      });
    });

    function _initTypeTester() {
      // If there's a type tester present
      $('.type-tester').each(function() {
        var $typeTester = $(this);
        var $typeTesterInner = $typeTester.find('.-inner');
        var $para = $typeTester.find('.test-para');
        var $svgContainer = $('.type-tester').find('.typeTesterSvgFont');
        var $glyphChart = $('.type-tester').find('.glyphChart');

        var fontFamily = $typeTester.attr('data-font');
        var startingFontSize = $typeTester.attr('data-font-size');
        var lineHeight = $typeTester.attr('data-line-height');
        var svgUrl = $typeTester.attr('data-svg-url');

        // Initialize CSS for tester
        $typeTesterInner.css({
          'font-family': fontFamily+', "AdobeBlank"',
          'line-height': lineHeight
        });

        // Set Up Tools
        var $tools = $('<div class="typetools"></div>').prependTo($typeTester);
        var $toolsContainer = $('<div class="typetools-container block-wrap"></div>').appendTo($tools);

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

    function _hexToRgba(hex, alpha) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return 'rgba('+parseInt(result[1], 16)+', '+parseInt(result[2], 16)+', '+parseInt(result[3], 16)+', '+alpha+')';
      } else {
        return null;
      }
    }

  },

  finalize() {
    // JavaScript to be fired on project pages, after the init JS
  },
};
