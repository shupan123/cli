define(function(require) {

    var snapshort, $document = $(document), $selectorDOM = $.fn;

    require('./convert');

    //chrome不支持outHTML
    jQuery.fn.outerHTML = function (s) {
        return (s) ? this.before(s).remove() : jQuery('<p>').append(this.eq(0).clone()).html();
    }

    $document.on('svg2canvas:complete', function(e, $selectorClone, callback, options) {
        var $snapWraper, 
            now = Date.now();

        $snapWraper = $('<div id="snap-wrapper-' + now + '"></div>').prependTo('body');

        $snapWraper.css({
            opacity: 0,
            position: 'absolute',
            zIndex: -1,
            width: '100%',
            height: '100%'
        });

        $selectorClone.attr('id', now).prependTo($snapWraper);


        $document.trigger('html2canvas:start', [$selectorClone, callback, options, $snapWraper]);
    });

    $document.on('html2canvas:start', function(e, $selector, callback, options, $snapWraper) {
        useHtml2Canvas($selector[0], callback, options, $snapWraper);
    });

    $document.on('html2canvas:complete', function(e, $snapWraper) {
        // $snapWraper && $snapWraper.remove();
    });


    function download(base64, downloadSelector, options) {
        var $download = $(downloadSelector);
        if (!$download.is('a')) {
            throw new Error('Download button need to be <a>');
        }


        var a = document.createElement('a');

        if ('download' in $download[0]) {

            $download.attr('href', base64);
            $download.attr('download', options.startName + '.' + options.format);

        } else { //IE
            $download.addClass('disabled');
        }
    }


    function convert(selector, callback, options) {

        var $selector = $(selector), $selectorClone = $selector.clone(),
            $svg, length;

        $svg = $selectorClone.is('svg') ? $selectorClone: $selectorClone.find('svg');

        $selectorClone.css({
            width: $selector.width(),
            height: $selector.height()
        })

        length = $svg.length;

        if (length) {
            $svg.each(function(k, v) {
                var $v = $(v);
                useSvg2Canvas($v.outerHTML(), function(canvas) {

                    if ($selectorClone.is('svg')) {
                        $selectorClone = $(canvas);
                    } else {
                        $(canvas).insertBefore(v);
                        $v.remove();
                    }
                    
                    length--;

                    if (!length) {

                        $document.trigger('svg2canvas:complete', [$selectorClone, callback, options]);
                    }

                }, options);
            });
        } else {

            $document.trigger('html2canvas:start', [$selector, callback, options]);
        }
    }

    function useSvg2Canvas(svg, callback, options) {
        var canvas = document.createElement('canvas');

        canvg(canvas, svg, {
            renderCallback: function() {
                if (typeof callback == 'function') {
                    callback(canvas);
                }
            }
        });
    }

    function useHtml2Canvas(element, callback, options, $snapWraper) {
        html2canvas(element, {
            onrendered: function(canvas) {
                if (typeof callback == 'function') {
                    callback(canvas.toDataURL('image/' + options.format));
                     $document.trigger('html2canvas:complete', [$snapWraper]);
                }
            }
        })
    }

    function SnapShot() {}

    SnapShot.prototype.defaultSetting = function(options) {
        var defaults = {
            format: 'png',
            startName: 'snap_'
        };

        this.options = $.extend(defaults, options);

        this.options.startName += Date.now();

        return this;
    };
    SnapShot.prototype.getImgBase64 = function(selector, callback) {

        convert(selector, callback, this.options);
        
        return this;
    };
    SnapShot.prototype.saveToImg = function(selector, downloadSelector, callback) {
        var self = this;

        convert(selector, function(base64) {

            download(base64, downloadSelector, self.options);

        }, this.options);
    };

    snapshort = new SnapShot();

    snapshort.defaultSetting();

    return snapshort;
});