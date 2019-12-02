export default {
  init() {
    // JavaScript to be fired on the home page
    _initTypeTester();

    function _initTypeTester() {
      // If there's a type tester present
      if ($('.type-tester').length) {
        var $fontStyle;
        var $typeTester = $('.type-tester');
        var $typeTesterInner = $('.type-tester-inner');
        var $para = $typeTester.find('#test-para');
        var $svgContainer = $('#typeTesterSvgFont');
        var $glyphChart = $('#glyphChart');

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
        $typeTester.prepend('<div id="typetools"><div class="typetools-container block-wrap"></div></div>');
        var $tools = $('#typetools');
        var $toolsContainer = $tools.find('.typetools-container');

        // Get SVG font file if it is set and generate the glypgh chart
        if ($typeTester.attr('data-svg-url')) {

          // Add glyphs button to toolbar
          $toolsContainer.append('<div class="type-tool" id="glyphsTypeToggle"><h4>View</h4><button id="typeToggle" data-target=".test-para">Type Tester</button><button id="glyphsToggle" data-target="#glyphChart">Glyphs</button></div>');

          // Watch for glyphs/type toggle
          $(document).on('click', '#glyphsTypeToggle button', function() {
            var targetElem = $(this).attr('data-target');
            $('#glyphChart.-active, .test-para.-active, #glyphsTypeToggle button.-active').removeClass('-active');
            $(targetElem).addClass('-active');
            $(this).addClass('-active');

            // Add/remove -hidden class on type-only tools
            if (targetElem === '.test-para') {
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

              $glyphChart.find('#'+group).append(glyphsOutput);
            });

          });
        }

        // Add style button to toolbar
        $toolsContainer.append('<div class="type-tool" id="styleToggle"><h4>Style</h4><button class="styleToggle -active" data-style="lowercase">Sans-serif</button><button class="styleToggle" data-style="uppercase">Serif</button></div>');
        $para.addClass('lowercase');
        $typeTester.addClass('lowercase');

        // Font Size
        // Get min/max from data attributes
        var minSize = $typeTester.attr('data-min-size');
        var maxSize = $typeTester.attr('data-max-size');

        $toolsContainer.append('<div class="type-tool type-only" id="fontSizeTool"><label for="fontSize" id="fontSizeLabel">Size: <span id="currentFontSize"></span></label><input type="range" name="fontSize" id="fontSize" min="'+minSize+'" max="'+maxSize+'" step="6"></div>');
        var $fontSize = $('#fontSize');
        var $currentFontSize = $('#currentFontSize');
        // Set starting font size
        $typeTesterInner.css('font-size', startingFontSize+'px');
        $fontSize.val(startingFontSize);
        $currentFontSize.html(startingFontSize+'px');

        // Font Weights
        if ($typeTester.attr('data-weights')) {
          $toolsContainer.append('<div class="type-tool"><label for="fontWeight">Weight</label><select name="fontWeight" id="fontWeight"></select></div>');
          var $fontWeight = $('#fontWeight');

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
        $toolsContainer.append('<div class="type-tool type-only" id="textAlignment"><label>Align</label><button class="alignment -left" data-alignment="left"><span class="visually-hidden">Left</span><span class="lines"></span></button><button class="alignment -center" data-alignment="center"><span class="visually-hidden">Center</span><span class="lines"></span></button><button class="alignment -right" data-alignment="right"><span class="visually-hidden">Right</span><span class="lines"></span></button></div>');
        var $textAlignment = $('#textAlignment');
        var initialAlignment = $typeTester.attr('data-initial-alignment');
        $para.css('text-align', initialAlignment);
        $textAlignment.find('button[data-alignment='+initialAlignment+']').addClass('-active');

        // Color Pairs
        if ($typeTester.attr('data-color-pairs') !== 'undefined') {
          var colorData = $typeTester.attr('data-color-pairs');
          var colorPairs = colorData.split(' ');

          if (colorPairs.length > 1) {
            $toolsContainer.append('<div class="type-tool" id="colorPairs"><label>Color</label><div id="colorPairsContainer"></div></div>');
            var $colorPairs = $('#colorPairs');

            $.each(colorPairs, function(i) {
              var colors = this.split('-');
              var textColor = colors[0];
              var backgroundColor = colors[1];

              $('#colorPairsContainer').append('<button class="color-pair" data-text-color="'+textColor+'" data-background-color="'+backgroundColor+'"><span style="color:'+textColor+';background-color:'+backgroundColor+';">A</span></button>');
            });

            $('#colorPairs .color-pair:first').addClass('-active');
            var textColor = $('#colorPairs .color-pair:first').attr('data-text-color');
            var backgroundColor = $('#colorPairs .color-pair:first').attr('data-background-color');
            $('.type-tester-inner').css({
              'color': textColor,
              'background-color': backgroundColor
            });

            $colorPairs.on('click', 'button', function() {
              $('.color-pair.-active').removeClass('-active');
              $(this).addClass('-active');
              var textColor = $(this).attr('data-text-color');
              var backgroundColor = $(this).attr('data-background-color');
              $('.type-tester-inner').css({
                'color': textColor,
                'background-color': backgroundColor
              });
            });
          }

        }

        // Set Active state
        if ($para.is('.-active')) {
          $('#typeToggle').addClass('-active');
        } else if ($glyphChart.is('.-active')) {
          $('#glyphsToggle').addClass('-active');
          $('.type-tool.type-only').addClass('hidden');
        }

        // Watch for changes on individual tools
        // Style
        $('.styleToggle').on('click', function(e) {
          var style = $(this).attr('data-style');
          $typeTester.removeClass('lowercase uppercase');
          $typeTester.addClass(style);
          $('#styleToggle').find('button.-active').removeClass('-active');
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
          paraText = $(this).html().replace(/(<br>\s*)+$/,'');
          $(this).html(paraText);
          $(this).append('<span class="type-cursor"></span>');
        });

      }
    }

    function _hexToRgba(hex, alpha) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return 'rgba('+parseInt(result[1], 16)+', '+parseInt(result[2], 16)+', '+parseInt(result[3], 16)+', '+alpha+')';
      } else {
        return null;
      }
    }

    function _removeEmptyProjectBlocks() {
      // The way we have project blocks set up,
      // full-width blocks might end up adding an empty
      // .block-wrap element after them that only contains
      // white space. This function is a banaid fix to remove
      // those blocks with just white space so they don't
      // create unwanted space between blocks
      var $blockWraps = $('.block-wrap');

      $blockWraps.each(function() {
        var contents = $(this).html();
        if(!contents.replace(/\s/g, '').length) {
          $(this).css('display', 'none');
        }
      });
    }
  },

  finalize() {
    // JavaScript to be fired on the home page, after the init JS
  },
};
