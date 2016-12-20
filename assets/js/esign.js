window.esign = window.esign || {};

esign.cacheSelectors = function () {
	esign.cache = {
		// general
		$html: $('html'),

		// navigation
		$nav: $('.nav-wrap'),

		// const
		IS_MOBILE: esign.isMobile(),

		// country list with iso-a3 values
		$countries: null,

		// world map
		$map: null,

        // Appoaches
        $approaches: null,

		// Map export file name
		$filenameMap: '',

		// second (2°C) dataset check
		$second: null,

		// absolute chart check
		$absolute: false,

		// selected data check
		$dataSelected: null,

		// selected iso-a3
		$isoSelected: '',

        // star filter active check
        $starFilterActive: false,

		// gross average check
		$grossAverageCheck: false,

        $currentFilterSelector: null,

        $currentFilterApproach: null
	};
};

esign.init = function () {
	Response.create({
	    prop: "width", 
	    prefix: "min-width- r src", 
	    breakpoints: [767,0], 
	    lazy: true
	});
	
	esign.cacheSelectors();
	esign.navigation();
	esign.responsiveVideos();
	esign.blockLink();
	esign.newsletter();
	esign.matchHeight();
	esign.placeholder();
	esign.scrollSpy();
	esign.modals();
	esign.countryList();
	esign.map();
    esign.starListeners();
    esign.qtip();
};

esign.isMobile = function () {
	var deviceAgent = navigator.userAgent.toLowerCase(),
		isMobile = (deviceAgent.match(/(iphone|ipod|ipad)/) ||
			deviceAgent.match(/(android)/)  ||
			deviceAgent.match(/(iemobile)/) ||
			deviceAgent.match(/blackberry/i) ||
			deviceAgent.match(/bada/i)) ||
			(/OS [1-4]_[0-9_]+ like Mac OS X/i.test(navigator.userAgent));

	if(isMobile) {
		$('html').addClass('mobile');
	} else {
		$('html').addClass('no-mobile');
	}

	return isMobile;
};

esign.navigation = function () {
	$('.main-nav .trigger').click(function(e) {
		e.preventDefault();
		$(this).next('.nav-wrap').slideToggle('fast');
	});
	
	Response.crossover('width', function() {
		if(Response.band(767)) {
			esign.cache.$nav.css('display', 'block');
		} else {
			esign.cache.$nav.css('display', 'none');
		}
	});
};

esign.responsiveVideos = function () {
	$('iframe[src*="youtube.com/embed"], iframe[src*="youtube-nocookie.com/embed"], iframe[src*="player.vimeo"]').wrap('<div class="video-container"></div>');
};

esign.blockLink = function () {
	$('.block-link').click(function(e) {
		e.preventDefault();
		var url = $(this).find('.target').attr('href');
		window.location = url;
	});
};

/* ajax newsletter subscribe */
esign.newsletter = function () {
	$('.form-newsletter').submit(function(e) {
		$form = $(this);
		
		$.post($form.attr('action'), $form.serializeArray(), function(data) {
			if(data.errors === false) {
				$form.html(data.result);
			} else {
				$form.find('.result').html(data.result);
			}
		});
		
		e.preventDefault();
		return false;
	});
};

esign.matchHeight = function () {
	$('.mh > *').matchHeight();
};

/* IE placeholder text */
esign.placeholder = function () {
	$('input, textarea').placeholder();
};

/* Bootstrap scroll position */
esign.scrollSpy = function () {
	$('body').scrollspy({
		target: '.bs-docs-sidebar',
		offset: 80
	});
};

/* Modals */
esign.modals = function () {
    $dataSelected = false;

	// btns
	$('.modal-button, .main-modal-trigger').click(function(e) {
		e.preventDefault();
		var $modal;

		if($(this).hasClass('main-modal-trigger')) {
			$modal = $('#main-modal');
		} else {
			$modal = $($(this).attr('href'));
		}

		/* convert to md-cover if height > window height or device is mobile */
		if($modal.height() > $(window).height() || esign.cache.IS_MOBILE) {

			if(!$modal.hasClass('md-cover')) {

				var $close = $modal.find('.md-close');

				$modal
					.addClass('md-cover')
					.find('.md-content')
					.wrapInner('<div class="md-center"><div class="container small"></div></div>')
					.after($close);

				$close.wrap('<div class="md-topbar"></div>');

			}
		}

		if($modal) {
			// remove current modal
			$('.md-show').removeClass('md-show');
			esign.cache.$html.removeClass('noscroll');

			// show modal
			$modal.toggleClass('md-show');
			if($modal.hasClass('md-cover')) {
				esign.cache.$html.addClass('noscroll');
			}

			location.hash = '#open-' + $modal.attr('id');
		}

	});

	// open modal from hash
	var hash = window.location.hash;
	if(hash.indexOf('#open-') >= 0) {
		var itemId = hash.replace('open-',''),
			$modal = $(itemId);

		if($modal.length && $dataSelected) {
			$modal.addClass('md-show');
			if($modal.hasClass('md-cover')) {
				esign.cache.$html.addClass('noscroll');
			}
		} else {
            location.hash = '';
			esign.resetState();
        }
	}

	// close modal
	$('.md-close-trigger, .md-overlay').click(function(e) {
		$('.md-show').removeClass('md-show');
		esign.cache.$html.removeClass('noscroll');
		location.hash = '';
		esign.resetState();
	});

	// handle keyboard events
	$(document).on('keydown', function(e) {
		var tag = e.target.tagName.toLowerCase();

		if (tag != 'input' && tag != 'textarea') {
			// hide modal on escape
			if(e.which === 27 && $('.md-show').length) {
				$('.md-show').removeClass('md-show');
				esign.cache.$html.removeClass('noscroll');
				location.hash = '';
				esign.resetState();
			}

			if(e.which === 77) {
				$('.main-modal-trigger').trigger('click');
			}

		}
	});

};

/* Country list */
esign.countryList = function () {
	if($('#country-list').length) {
		$.getJSON('assets/data/countries.json', function(data) {
			$countries = data;

			for(var i = 0; i < $countries.length; i++ ) {
				if($countries[i]['iso-a3'] != 'EARTH') {
					$countries[i]['country'] = $countries[i]['country'].toLowerCase().replace(/(^|\s)[a-z]/g,function(f){return f.toUpperCase();});
					$('#country-list ul').append('<li data-iso="' + $countries[i]['iso-a3'] + '" data-country="' + $countries[i]['country'] + '"><p class="country">' + $countries[i]['country'] + '</p></li>');
				}
				if($countries[i]['country'].includes(',')) $countries[i]['country'] = $countries[i]['country'].split(',')[1].trim() + ' ' + $countries[i]['country'].split(',')[0];
			}

			var list = new List('country-list', {
				valueNames: ['country'],
				sort:['country'],
				plugins: [ ListFuzzySearch() ]
			}).sort('country', { asc: true });
		});
	}
};

/* World map */
esign.map = function () {

	if($('#map').length) {
		esign.resetState();
		$second = true;
        esign.loadMapData();

		// 1.5 °C
		$('#one').click(function (e) {
			e.preventDefault();

			if($second) {
                $second = false;
                $('#two').removeClass('active');
                $('#one').addClass('active');

                $('#two-graph').removeClass('active');
                $('#one-graph').addClass('active');
                esign.loadMapData();
			}
		});

		// 2 °C
		$('#two').click(function (e) {
			e.preventDefault();

			if(!$second) {
                $second = true;
                $('#one').removeClass('active');
                $('#two').addClass('active');

                $('#one-graph').removeClass('active');
                $('#two-graph').addClass('active');
                esign.loadMapData();
			}
		});

		// Absolute graph
		$('#absolute').click(function (e) {
			e.preventDefault();

			if (!$absolute) {
				$absolute = true;
				$('#relative').removeClass('active');
				$('#absolute').addClass('active');

				var pathAverages = $second ? 'assets/data/avg_abs_2c.json' : 'assets/data/avg_abs_1p5c.json';
				var pathMin = $second ? 'assets/data/min_abs_2c.json' : 'assets/data/min_abs_1p5c.json';
				var PathMax = $second ? 'assets/data/max_abs_2c.json' : 'assets/data/max_abs_1p5c.json';

				esign.createChart(pathAverages, pathMin, PathMax, 2010);
			}
		});

		// Relative graph
		$('.rel-year').click(function (e) {
			e.preventDefault();

			$absolute = false;
			$('#relative').addClass('active');
			$('#absolute').removeClass('active');

			var year = this.text.replace('rel-', '');
			$('#relative').html('Relative to ' + year + ' <span class="caret"></span><span class="sr-only">Toggle Dropdown</span>');

			var pathAverages = $second ? 'assets/data/avg_abs_2c.json' : 'assets/data/avg_abs_1p5c.json';
			var pathMin = $second ? 'assets/data/min_abs_2c.json' : 'assets/data/min_abs_1p5c.json';
			var PathMax = $second ? 'assets/data/max_abs_2c.json' : 'assets/data/max_abs_1p5c.json';

			esign.createChart(pathAverages, pathMin, PathMax, year);
		});
	}

    $('#export-map-print').click(function () {
        $map.print();
        $('.colour-legend').removeClass('hidden');
    });
    $('#export-map-png').click(function () {
        $map.exportChartLocal({
            type: 'image/png'
        });
        $('.colour-legend').removeClass('hidden');
    });
    $('#export-map-jpg').click(function () {
        $map.exportChartLocal({
            type: 'image/jpeg'
        });
        $('.colour-legend').removeClass('hidden');
    });
    $('#export-map-pdf').click(function () {
        $map.exportChartLocal({
            type: 'application/pdf'
        });
        $('.colour-legend').removeClass('hidden');
    });
    $('#export-map-svg').click(function () {
        $map.exportChartLocal({
            type: 'image/svg+xml'
        });
        $('.colour-legend').removeClass('hidden');
    });
};

/* Load map data */
esign.loadMapData = function() {
    if($second) {
        $.getJSON('assets/data/indc_2c.json', function(dataMap) {
            $filenameMap = 'Paris Equity Check 2°C [Downloaded from Paris-equity-check.org]';

            $.getJSON('assets/data/approach_2c.json', function(dataApproach) {
                $approaches = dataApproach;
                esign.drawMap(dataMap);
            });
        });
    } else {
        $.getJSON('assets/data/indc_1p5c.json', function(dataMap) {
            $filenameMap = 'Paris Equity Check 1.5°C [Downloaded from Paris-equity-check.org]';

            $.getJSON('assets/data/assets/data/approach_1p5c.json', function(dataApproach) {
                $approaches = dataApproach;
                esign.drawMap(dataMap);
            });
        });
    }
};

/* Draw map */
esign.drawMap = function(data) {

    $map = new Highcharts.Map('map', {
        title: {
            text: $filenameMap,
            style: {
                fontSize: '8'
            },
            useHTML: true
        },
        exporting: {
            enabled: false,
            filename: $filenameMap,
            fallbackToExportServer: true,
            chartOptions: {
                chart:{
                    events: null
                }
            }
        },
        chart: {
            margin: [0, 0, 0, 0],
            style: {
                fontFamily: 'Open Sans'
            },
            backgroundColor: '#f6faff',
            pinchType: 'none'
        },
        credits: false,
        mapNavigation: {
            enabled: true,
            enableMouseWheelZoom: false,
            enableDoubleClickZoom: false,
            enableDoubleClickZoomTo: false,
            buttonOptions: {
                align: 'right',
                verticalAlign: 'bottom',
                x: -20,
                theme: {
                    fill: 'white',
                    'stroke-width': 1,
                    stroke: 'silver',
                    r: 0,
                    states: {
                        hover: {
                            fill: '#f5f5f5'
                        }
                    }
                }
            },
            buttons: {
                zoomIn: {
                    y: -20
                },
                zoomOut: {
                    y: 8
                }
            }
        },
        colorAxis: {
            stops: [
                [0.1, '#FFFFFD'],
                [0.2, '#f7f4d7'],
                [0.3, '#dee693'],
                [0.5, '#c5d750'],
                [0.6, '#77af52'],
                [0.8, '#39925c']
            ]
        },

        legend: {
            enabled: false,
            align: 'center',
            x: 0,
            y: 10,
            color: '#fff',
            layout: 'horizontal',
            floating: false,
            verticalAlign: 'bottom',
            shadow: false,
            border: 0,
            borderRadius: 0,
            borderWidth: 0
        },
        tooltip: {
            enabled: !esign.cache.IS_MOBILE,
            useHTML: true,
            borderWidth:0,
            borderRadius:0,
            padding: 5,
            minWidth: 300,
            backgroundColor: false,
            shadow: false,
            hideDelay: 30,
            formatter: function () {
                var iso = this.point['iso-a3'],
                    indc,
                    indcDescription,
                    name,
                    classCer, classGdr, classCap, classCpc, classEpc;

                this.point.options.value != null ? indc = this.point.options.value : indc = 'N/A';

                if(indc == 1) {
                    indcDescription = '(I)NDC consistent with ' + indc + ' equity approach.';
                } else {
                    indcDescription = '(I)NDC consistent with ' + indc + ' equity approaches.';
                }

                for(var i = 0; i < $countries.length; i++ ) {
                    if($countries[i]['iso-a3'] == iso) name = $countries[i]['country'];
                }

                function getCountryIso(value) {
                    return value['iso-a3'] == iso;
                }
                var countryApproaches = $approaches.filter(getCountryIso);

                for(var i = 0; i < countryApproaches.length; i ++) {
                    if(countryApproaches[i]['approach'] == 'CER' && countryApproaches[i]['indc'] == 'X') classCer = 'active';
                    if(countryApproaches[i]['approach'] == 'GDR' && countryApproaches[i]['indc'] == 'X') classGdr = 'active';
                    if(countryApproaches[i]['approach'] == 'CAP' && countryApproaches[i]['indc'] == 'X') classCap = 'active';
                    if(countryApproaches[i]['approach'] == 'CPC' && countryApproaches[i]['indc'] == 'X') classCpc = 'active';
                    if(countryApproaches[i]['approach'] == 'EPC' && countryApproaches[i]['indc'] == 'X') classEpc = 'active';
                }

                return '<div class="tool"><h4>' + name
                    + '</h4><div class="approach">' + indcDescription + '</div><div class="stars">'
                    + '<span class="icon-rand star star--cer ' + classCer + '"><span>CER</span></span>'
                    + '<span class="icon-rand star star--gdr ' + classGdr + '"><span>GDR</span></span>'
                    + '<span class="icon-rand star star--cap ' + classCap + '"><span>CAP</span></span>'
                    + '<span class="icon-rand star star--cpc ' + classCpc + '"><span>CPC</span></span>'
                    + '<span class="icon-rand star star--epc ' + classEpc + '"><span>EPC</span></span></div></div>';
            }
        },
        series: [{
            data: data,
            mapData: Highcharts.geojson(Highcharts.maps['custom/world-eckert3-highres']),
            backgroundColor: '#FCFFC5',
            joinBy: 'iso-a3',
            cursor: 'pointer',
            nullInteraction: true,
            states: {
                hover: {
                    borderColor: 'grey',
                    color: this.color
                }
            },
            dataLabels: {
                enabled: false,
                useHTML: true
            },
            point: {
                events:{
                    click: function () {
                        $dataSelected = true;
                        $isoSelected = this['iso-a3'];

                        for(var i = 0; i < $countries.length; i++ ) {
                            if($countries[i]['iso-a3'] == $isoSelected) $countrySelected = $countries[i]['country'];
                        }

                        esign.openChart();
                    },
                    mouseOver: function () {
                        esign.fillStars(this['iso-a3'], '.stars');
                    },
                    mouseOut: function () {
                        esign.emptyStars('.stars');
                    }
                }
            },
            nullColor: '#fff',
            borderColor: '#D2D2D2',
            borderWidth: 1
        }]
    });

    // Listeners
    var countryListItem = $('#country-list ul li'),
        tooltip, iso;

    countryListItem.click(function (event) {
        $dataSelected = true;
        iso = this.getAttribute('data-iso');
        if($isoSelected != iso) {
            for(var i = 0; i < $map.series[0].data.length; i++) {
                if($map.series[0].data[i]['iso-a3'] == iso) {
                    tooltip = $map.series[0].data[i];
                    tooltip.firePointEvent('click', event);
                }
            }
        }
    });
    countryListItem.mouseover(function () {
        if(!esign.cache.IS_MOBILE) {
            iso = this.getAttribute('data-iso');
            for(var i = 0; i < $map.series[0].data.length; i++) {
                if($map.series[0].data[i]['iso-a3'] == iso) {
                    tooltip = $map.series[0].data[i];
                    tooltip.setState('hover');
                    $map.tooltip.refresh(tooltip);
                }
            }
            esign.fillStars(iso, '.stars');
        }
    });
    countryListItem.mouseout(function () {
        if(!esign.cache.IS_MOBILE) {
            if ($map !== undefined) {
                tooltip.setState();
                $map.tooltip.hide();
            }
            esign.emptyStars('.stars');
        }
    });

    if(esign.cache.$starFilterActive) {
        esign.filterByStars();
    }
};

/* Add star click events */
esign.starListeners = function () {

    var starCer = $('.map-legend .star--cer');
    var starGdr = $('.map-legend .star--gdr');
    var starCap = $('.map-legend .star--cap');
    var starCpc = $('.map-legend .star--cpc');
    var starEpc = $('.map-legend .star--epc');

    esign.cache.$starFilterActive = false;

    starCer.click(function() {
        filter(starCer, 'CER');
    });
    starGdr.click(function() {
        filter(starGdr, 'GDR');
    });
    starCap.click(function() {
        filter(starCap, 'CAP');
    });
    starCpc.click(function() {
        filter(starCpc, 'CPC');
    });
    starEpc.click(function() {
        filter(starEpc, 'EPC');
    });

    function filter(selector, approach) {

        if(esign.cache.$starFilterActive) {
            if(esign.cache.$currentFilterSelector.selector == selector.selector) {
                esign.cache.$currentFilterSelector.removeClass('filter-active');
                $('.colour-legend').removeClass('hidden');
                esign.cache.$currentFilterSelector = null;
                esign.cache.$starFilterActive = false;
                esign.loadMapData();
            } else {
                esign.cache.$starFilterActive = true;
                esign.cache.$currentFilterSelector = selector;
                esign.cache.$currentFilterApproach = approach;
                $('.filter-active').removeClass('filter-active');
                esign.cache.$currentFilterSelector.addClass('filter-active');
                $('.colour-legend').addClass('hidden');
                esign.loadMapData();
            }
        } else {
            esign.cache.$starFilterActive = true;
            esign.cache.$currentFilterSelector = selector;
            esign.cache.$currentFilterApproach = approach;
            esign.cache.$currentFilterSelector.addClass('filter-active');
            $('.colour-legend').addClass('hidden');
            esign.filterByStars();
        }

    }
};

/* Fill # INDC stars */
esign.fillStars = function(iso, selector) {

    function getCountryIso(value) {
        return value['iso-a3'] == iso;
    }
    var countryApproaches = $approaches.filter(getCountryIso);

    $('.stars-legend').addClass('hover');

    for(var i = 0; i < countryApproaches.length; i ++) {
        if(countryApproaches[i]['approach'] == 'CER' && countryApproaches[i]['indc'] == 'X') $(selector + ' .star--cer').addClass('active');
        if(countryApproaches[i]['approach'] == 'GDR' && countryApproaches[i]['indc'] == 'X') $(selector + ' .star--gdr').addClass('active');
        if(countryApproaches[i]['approach'] == 'CAP' && countryApproaches[i]['indc'] == 'X') $(selector + ' .star--cap').addClass('active');
        if(countryApproaches[i]['approach'] == 'CPC' && countryApproaches[i]['indc'] == 'X') $(selector + ' .star--cpc').addClass('active');
        if(countryApproaches[i]['approach'] == 'EPC' && countryApproaches[i]['indc'] == 'X') $(selector + ' .star--epc').addClass('active');
    }

};

/* Reset # INDC stars */
esign.emptyStars = function(selector) {
	$(selector + ' .star').removeClass('active');
	$('.stars-legend').removeClass('hover');
};

/* Filter map by stars */
esign.filterByStars = function () {

    var matchedCountries = [];

    $approaches.map(function(value, i) {
        if(value['approach'] == esign.cache.$currentFilterApproach && value['indc'] == 'X') {
            matchedCountries.push($approaches[i]['iso-a3']);
        }
    });

    if(esign.cache.$currentFilterApproach == 'CER') color = '#ff8950';
    if(esign.cache.$currentFilterApproach == 'GDR') color = '#965c83';
    if(esign.cache.$currentFilterApproach == 'CAP') color = '#406b80';
    if(esign.cache.$currentFilterApproach == 'CPC') color = '#ffc850';
    if(esign.cache.$currentFilterApproach == 'EPC') color = '#8bced7';

    updatePoints(function () {
        setTimeout(function(){
            $map.series[0].points.map(function(point) {
                point.setState();
            });
        }, 0);
    });

    function updatePoints(cb) {
        $map.series[0].points.map(function(point) {
            if(matchedCountries.includes(point['iso-a3'])) {
                point.color = color;
            } else {
                point.color = '#F4F4F4';
            }
        });
        cb();
    }
};

/* Open chart view */
esign.openChart = function() {
	esign.emptyStars('.stars-graph');
	$('.modal-button-graph').trigger('click');
	$('.graph-country').text($countrySelected);

	esign.fairnessStatement($isoSelected);

    // 1.5 °C
    $('#one-graph').click(function (e) {
        e.preventDefault();

        if($second) {
            $second = false;
            esign.emptyStars('.stars-graph');

            $('#two-graph').removeClass('active');
            $('#one-graph').addClass('active');

            $('#two').removeClass('active');
            $('#one').addClass('active');

            esign.loadChartData();
            esign.loadMapData();
        }
    });

    // 2 °C
    $('#two-graph').click(function (e) {
        e.preventDefault();

        if(!$second) {
            $second = true;
            esign.emptyStars('.stars-graph');

            $('#one-graph').removeClass('active');
            $('#two-graph').addClass('active');

            $('#one').removeClass('active');
            $('#two').addClass('active');

            esign.loadChartData();
            esign.loadMapData();
        }
    });

    esign.loadChartData();
};

/* Load chart data */
esign.loadChartData = function () {
    esign.fillStars($isoSelected, '.stars-graph');

    var pathAverages = $second ? 'assets/data/avg_abs_2c.json' : 'assets/data/avg_abs_1p5c.json';
    var pathMin = $second ? 'assets/data/min_abs_2c.json' : 'assets/data/min_abs_1p5c.json';
    var PathMax = $second ? 'assets/data/max_abs_2c.json' : 'assets/data/max_abs_1p5c.json';

    esign.createChart(pathAverages, pathMin, PathMax, 2010);
};

/* Create chart */
esign.createChart = function(pathAverages, pathMin, pathMax, year) {

    var yearMin = 1990,
		yearMax = 2100,
		unitK = 'ktCO2eq',
		unitM = 'MtCO2eq',
		unitG = 'GtCO2eq',
		unit = unitK,
		divider = 1,
		indcAbs,
		indcLowAbs,
		indcHighAbs,
		indcRel,
		indcLowRel,
		indcHighRel;

    $.getJSON(pathAverages, function(data) {
        calcultateAverages(data);
    });

	// Averages
    function calcultateAverages(data) {

        function getCountryIso(value) {
            return value['iso-a3'] == $isoSelected;
        }
        var dataAverages = data.filter(getCountryIso);

        // CER
        function getCer(value) {
            return value['approach'] == 'CER';
        }
        var dataCerAvg = dataAverages.filter(getCer);
        // GDR
        function getGdr(value) {
            return value['approach'] == 'GDR';
        }
        var dataGdrAvg = dataAverages.filter(getGdr);
        // CAP
        function getCap(value) {
            return value['approach'] == 'CAP';
        }
        var dataCapAvg = dataAverages.filter(getCap);
        // CPC
        function getCpc(value) {
            return value['approach'] == 'CPC';
        }
        var dataCpcAvg = dataAverages.filter(getCpc);
        // EPC
        function getEpc(value) {
            return value['approach'] == 'EPC';
        }
        var dataEpcAvg = dataAverages.filter(getEpc);
		//INDC
		function getIndc(value) {
			return value['INDCamb'] == 'INDC';
		}
		var dataIndc = dataAverages.filter(getIndc);
		indcAbs = dataIndc[0]['INDC%'];
		// INDC low
		function getIndcLow(value) {
			return value['INDCamb'] == 'INDC_low';
		}
		var dataIndcLow = dataAverages.filter(getIndcLow);
		indcLowAbs = dataIndcLow[0]['INDC%'];
		// INDC high
		function getIndcHigh(value) {
			return value['INDCamb'] == 'INDC_high';
		}
		var dataIndcHigh = dataAverages.filter(getIndcHigh);
		indcHighAbs = dataIndcHigh[0]['INDC%'];

        var cerAvg = [], gdrAvg = [], capAvg = [], cpcAvg = [], epcAvg = [];

        if($absolute) {
            for(var i = yearMin; i <= yearMax; i++) {
                cerAvg.push([i, dataCerAvg[0][i]]);
                gdrAvg.push([i, dataGdrAvg[0][i]]);
                capAvg.push([i, dataCapAvg[0][i]]);
                cpcAvg.push([i, dataCpcAvg[0][i]]);
                epcAvg.push([i, dataEpcAvg[0][i]]);
            }
        } else {
            for(var i = yearMin; i <= yearMax; i++) {
                cerAvg.push([i, ((dataCerAvg[0][i]/dataCapAvg[0][year])*100)]);
                gdrAvg.push([i, ((dataGdrAvg[0][i]/dataCapAvg[0][year])*100)]);
                capAvg.push([i, ((dataCapAvg[0][i]/dataCapAvg[0][year])*100)]);
                cpcAvg.push([i, ((dataCpcAvg[0][i]/dataCapAvg[0][year])*100)]);
                epcAvg.push([i, ((dataEpcAvg[0][i]/dataCapAvg[0][year])*100)]);
            }
            indcRel = ((indcAbs/dataCapAvg[0][year]))*100;
        }

        $.getJSON(pathMin, function(dataMin) {
            $.getJSON(pathMax, function(dataMax) {
                calcultateRange(dataMin, dataMax, cerAvg, gdrAvg, capAvg, cpcAvg, epcAvg);
            });
        });
    }

	// Ranges
    function calcultateRange(dataMi, dataMa, cerAvg, gdrAvg, capAvg, cpcAvg, epcAvg) {

        function getCountryIso(value) {
            return value['iso-a3'] == $isoSelected;
        }
        var dataMin = dataMi.filter(getCountryIso);
        var dataMax = dataMa.filter(getCountryIso);

        // CER
        function getCer(value) {
            return value['approach'] == 'CER';
        }
        var dataCerMin = dataMin.filter(getCer);
        var dataCerMax = dataMax.filter(getCer);
        // GDR
        function getGdr(value) {
            return value['approach'] == 'GDR';
        }
        var dataGdrMin = dataMin.filter(getGdr);
        var dataGdrMax = dataMax.filter(getGdr);
        // CAP
        function getCap(value) {
            return value['approach'] == 'CAP';
        }
        var dataCapMin = dataMin.filter(getCap);
        var dataCapMax = dataMax.filter(getCap);
        // CPC
        function getCpc(value) {
            return value['approach'] == 'CPC';
        }
        var dataCpcMin = dataMin.filter(getCpc);
        var dataCpcMax = dataMax.filter(getCpc);
        // EPC
        function getEpc(value) {
            return value['approach'] == 'EPC';
        }
        var dataEpcMin = dataMin.filter(getEpc);
        var dataEpcMax = dataMax.filter(getEpc);

        var cerRange = [], gdrRange = [], capRange = [], cpcRange = [], epcRange = [];
		var maxValue = 0;

        if($absolute) {
            for(var i = yearMin; i <= yearMax; i++) {
                cerRange.push([i, dataCerMin[0][i], dataCerMax[0][i]]);
                gdrRange.push([i, dataGdrMin[0][i], dataGdrMax[0][i]]);
                capRange.push([i, dataCapMin[0][i], dataCapMax[0][i]]);
                cpcRange.push([i, dataCpcMin[0][i], dataCpcMax[0][i]]);
                epcRange.push([i, dataEpcMin[0][i], dataEpcMax[0][i]]);
				max([dataCerMax[0][i], dataGdrMax[0][i], dataCapMax[0][i], dataCpcMax[0][i], dataEpcMax[0][i]]);
            }
        } else {
            for(var i = yearMin; i <= yearMax; i++) {
                if(i >= year) {
                    cerRange.push([i, ((dataCerMin[0][i]/dataCapMin[0][year])*100), ((dataCerMax[0][i]/dataCapMax[0][year])*100)]);
                    gdrRange.push([i, ((dataGdrMin[0][i]/dataCapMin[0][year])*100), ((dataGdrMax[0][i]/dataCapMax[0][year])*100)]);
                    capRange.push([i, ((dataCapMin[0][i]/dataCapMin[0][year])*100), ((dataCapMax[0][i]/dataCapMax[0][year])*100)]);
                    cpcRange.push([i, ((dataCpcMin[0][i]/dataCapMin[0][year])*100), ((dataCpcMax[0][i]/dataCapMax[0][year])*100)]);
                    epcRange.push([i, ((dataEpcMin[0][i]/dataCapMin[0][year])*100), ((dataEpcMax[0][i]/dataCapMax[0][year])*100)]);
                }
            }
			indcLowRel = ((indcLowAbs/dataCapMin[0][year]))*100;
			indcHighRel = ((indcHighAbs/dataCapMax[0][year]))*100;
        }

        function max(arr) {
			var m = Math.max.apply(null, arr);
			if(m > maxValue) maxValue = m;
		}

		if(maxValue > 999) {
			unit = unitM;
			divider = 1000;
		}
		if(maxValue > 999999) {
			unit = unitG;
			divider = 1000000;
		}

        drawChart(cerAvg, gdrAvg, capAvg, cpcAvg, epcAvg, cerRange, gdrRange, capRange, cpcRange, epcRange, unit);
    }

    function drawChart(cerAvg, gdrAvg, capAvg, cpcAvg, epcAvg, cerRange, gdrRange, capRange, cpcRange, epcRange, unit) {

		var cerAverageText = 'CER', gdrAverageText = 'GDR', capAverageText = 'CAP', cpcAverageText = 'CPC', epcAverageText = 'EPC',
			cerRangeText = 'CER range', gdrRangeText = 'GDR range', capRangeText = 'CAP range', cpcRangeText = 'CPC range', epcRangeText = 'EPC range',
			relativeYear = year,
			yAxis = {},
			filename,
			chartOptions,
			chart,
			indcData;

		// Chart options & creation
		if($absolute) {
			// Absolute options
			yAxis = {
				title: {
					text: 'Emissions allowances in ' + unit
				},
				//min: 0,
				plotLines: [{
					value: 0,
					color: 'black',
					width: 2
				}],
				labels: {
					formatter: function () {
						if(unit == unitM) {
							return this.value / divider;
						} else if (unit == unitG) {
							return this.value / divider;
						}
						return this.value;
					}
				}
			};
			filename = $countrySelected + ' - Emissions allowances in ' + unit;
		} else {
			// Relative options
			yAxis = {
				title: {
					text: 'Emissions allowances in % of ' + relativeYear + ' levels'
				},
				plotLines: [{
					value: 100,
					color: 'black',
					dashStyle: 'shortdash',
					width: 2
				}, {
					value: 0,
					color: 'black',
					width: 2
				}],
				labels: {
					formatter: function () {
						return this.value;
					}
				}
			};

			var temp;
			$second ? temp = '2°C' : temp = '1.5°C';


			filename = $countrySelected + ' - Emissions allowances in % of ' + relativeYear + ' levels (' + temp + ') [Downloaded from Paris-equity-check.org]';
		}

        chartOptions = {
			chart: {
				renderTo: 'chart',
				style: {
					fontFamily: 'Open Sans'
				},
                backgroundColor: '#ffffff'
			},
            title: {
                text: $countrySelected,
                useHTML: true
            },
            subtitle: {
			    text: '',
                style: {
                    color: '#B4B4B4',
                    fontSize: '5'
                },
                useHTML: true
            },
            xAxis: {
                title: {
                    text: 'Year'
                }
            },
            yAxis: yAxis,
            tooltip: {
                crosshairs: true,
                shared: true,
				useHtml: true,
                borderWidth: 0,
                hideDelay: 30
            },
            legend: {
			    title: {
			        text: 'Allocated emissions ranges and averages for:',
                    style: {
                        fontWeight: 'normal'
                    }
                },
                enabled: true,
                layout: 'vertical',
                floating: false,
                align: 'center left',
                itemStyle: {
                    fontWeight: 'normal',
                    fontSize: '10px'
                },
                itemMarginBottom: 1,
                labelFormatter: function () {
                    var name = this.name;
                    var text = '';

                    if(name == 'CER') text = 'CER: Constant emissions ratio';
                    if(name == 'GDR') text = 'GDR: Greenhouse development rights';
                    if(name == 'CAP') text = 'CAP: Capability';
                    if(name == 'CPC') text = 'CPC: Equal cumulative per capita';
                    if(name == 'EPC') text = 'EPC: Equal per capita';

                    return text;
                }
            },
            exporting: {
				enabled: false,
				filename: filename,
				buttons: {
					contextButton: {
						verticalAlign: 'bottom',
						text: 'export'
					}
				},
                fallbackToExportServer: true
            },
            credits: false,
            plotOptions: {
                line: {
                    events: {
                        // legendItemClick: function () {
                        //     // return false;
                        // }
                    }
                }
            },
            series: [{
                name: cerAverageText,
                data: cerAvg,
                zIndex: 10,
                color: '#ff8950',
                marker: {
                    lineWidth: 0,
                    radius: 0,
                    symbol: 'circle',
                    lineColor: 'transparent'
                },
                zoneAxis: 'x',
                zones: [{
                    value: 2010,
                    color: 'transparent'
                }]
            },{
                name: cerRangeText,
                data: cerRange,
                type: 'areasplinerange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: '#ff8950',
                lineColor: '#ff8950',
                fillOpacity: 0.3,
                zIndex: 5
            }, {
                name: gdrAverageText,
                data: gdrAvg,
                zIndex: 9,
                color: '#965c83',
                marker: {
                    lineWidth: 0,
                    radius: 0,
                    symbol: 'circle',
                    lineColor: 'transparent'
                },
                zoneAxis: 'x',
                zones: [{
                    value: 2010,
                    color: 'transparent'
                }]
            },{
                name: gdrRangeText,
                data: gdrRange,
                type: 'areasplinerange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: '#965c83',
                lineColor: '#965c83',
                fillOpacity: 0.3,
                zIndex: 4
            }, {
                name: capAverageText,
                data: capAvg,
                zIndex: 8,
                color: '#406b80',
                marker: {
                    lineWidth: 0,
                    radius: 0,
                    symbol: 'circle',
                    lineColor: 'transparent'
                },
                zoneAxis: 'x',
                zones: [{
                    value: 2010,
                    color: '#000000'
                }]
            },{
                name: capRangeText,
                data: capRange,
                type: 'areasplinerange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: '#406b80',
                lineColor: '#406b80',
                fillOpacity: 0.3,
                zIndex: 3
            },{
                name: cpcAverageText,
                data: cpcAvg,
                zIndex: 7,
                color: '#ffc850',
                marker: {
                    lineWidth: 0,
                    radius: 0,
                    symbol: 'circle',
                    lineColor: 'transparent'
                },
                zoneAxis: 'x',
                zones: [{
                    value: 2010,
                    color: 'transparent'
                }]
            },{
                name: cpcRangeText,
                data: cpcRange,
                type: 'areasplinerange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: '#ffc850',
                lineColor: '#ffc850',
                fillOpacity: 0.3,
                zIndex: 2
            },{
                name: epcAverageText,
                data: epcAvg,
                zIndex: 6,
                color: '#8bced7',
                marker: {
                    lineWidth: 0,
                    radius: 0,
                    symbol: 'circle',
                    lineColor: 'transparent'
                },
                zoneAxis: 'x',
                zones: [{
                    value: 2010,
                    color: 'transparent'
                }]
            },{
                name: epcRangeText,
                data: epcRange,
                type: 'areasplinerange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: '#8bced7',
                lineColor: '#8bced7',
                fillOpacity: 0.3,
                zIndex: 1
            }]
        };

		chart = new Highcharts.Chart(chartOptions);

		chart.tooltip.options.formatter = function() {
			var points = this.points || Highcharts.splat(this),
				txt = '';

			txt += '<span class="tooltip-year">' + this.x + '</span><br>';

            if(this.x <= year) {
				txt += 'Historical emissions: ' + (this.y/divider).toPrecision(3);
            } else {
				if($absolute) {
					Highcharts.each(points, function(p, i){
						var name = p.series.name;
						if(p.point.low && p.point.high) {
							txt += ' [' + (p.point.low/divider).toPrecision(3) + ' ' + unit + ' to ' + (p.point.high/divider).toPrecision(3) + ' ' + unit + ']<br>';
						} else {
							if(name !== cerRangeText && name !== gdrRangeText && name !== capRangeText && name !== cpcRangeText && name !== epcRangeText) {
								txt += name + ': ' + (p.y/divider).toPrecision(3) + ' ' + unit;
							} else {
								txt += ' [' + (p.point.low/divider).toPrecision(3) + ' ' + unit + ' to ' + (p.point.high/divider).toPrecision(3) + ' ' + unit + ']<br>';
							}
						}
					});
				} else {
					Highcharts.each(points, function(p, i){
						var name = p.series.name,
							avg = p.y,
							low = p.point.low,
							high = p.point.high;

						if(avg) {
							if(avg > 999) {
								avg = Math.round(avg);
							} else {
								avg = avg.toPrecision(3);
							}
						}
						if(low) {
							if(low > 999) {
								low = Math.round(low);
							} else {
								low = low.toPrecision(3);
							}
						}
						if(high) {
							if(high > 999) {
								high = Math.round(high);
							} else {
								high = high.toPrecision(3);
							}
						}
						if(p.point.low && p.point.high) {
							txt += ' [' + low + '% to ' + high + '%]<br>';
						} else {
							if(name !== cerRangeText && name !== gdrRangeText && name !== capRangeText && name !== cpcRangeText && name !== epcRangeText) {
								txt += name + ': ' + avg + '%';
							} else {
								txt += ' [' + low + '% to ' + high + '%]<br>';
							}
						}
					});
				}
            }
			return txt;
		};

		// (I)NDC dot
		if($absolute) {
			indcData = [
				[2030, indcAbs]
			];
		} else {
			indcData = [
				[2030, indcRel]
			];
		}
		chart.addSeries({
			name: '(I)NDC',
			data: indcData,
			type: 'scatter',
			zIndex: 999,
			marker: {
				lineWidth: 0,
				radius: 8,
				lineColor: 'white',
				fillColor: 'black'
			},
			className: 'indc-tour',
            showInLegend: false
		});

		// Exports
		$('#export-chart-print').click(function () {
			chart.print();
		});
		$('#export-chart-png').click(function () {
			chart.exportChartLocal({
				type: 'image/png'
			});
		});
		$('#export-chart-jpg').click(function () {
			chart.exportChartLocal({
				type: 'image/jpeg'
			});
		});
		$('#export-chart-pdf').click(function () {
			chart.exportChartLocal({
				type: 'application/pdf'
			});
		});
		$('#export-chart-svg').click(function () {
			chart.exportChartLocal({
				type: 'image/svg+xml'
			});
		});

		// Hide Ranges
		$('').click(function () {
			chart.series[1].hide();
			chart.series[3].hide();
			chart.series[5].hide();
			chart.series[7].hide();
			chart.series[9].hide();
		});

		// Show Ranges
		$('').click(function () {
			chart.series[1].show();
			chart.series[3].show();
			chart.series[5].show();
			chart.series[7].show();
			chart.series[9].show();
		});

		// Show average over the 5 equity approaches
		$grossAverageCheck = false;
		$('').click(function () {
			if(!$grossAverageCheck) {
				$grossAverageCheck = true;
				var pathGross = $second ? 'assets/data/grossavg2c-abs.json' : 'assets/data/grossavg1p5-abs.json';

				$.getJSON(pathGross, function(data) {
					function getCountryIso(value) {
						return value['Country code ISO Alpha-3'] == $isoSelected;
					}
					var dataGross = data.filter(getCountryIso);
					var gross = [];

					if($absolute) {
						for(var i = yearMin; i <= yearMax; i++) {
							gross.push([i, dataGross[0][i]]);
						}
					} else {
						for(var i = yearMin; i <= yearMax; i++) {
							gross.push([i, ((dataGross[0][i]/dataGross[0][year])*100)]);
						}
					}

					chart.addSeries({
						name: 'Average over the 5 equity approaches',
						data: gross,
						zIndex: 10,
						color: 'grey',
						marker: {
							lineWidth: 0,
							radius: 0,
							symbol: 'circle',
							lineColor: 'transparent'
						},
						zoneAxis: 'x',
						zones: [{
							value: 2010,
							color: 'black'
						}]
					});

					for (var i = 0; i < 10; i++) {
						chart.series[i].hide();
					}
				});
			} else {
				chart.series[11].show();
				for (var i = 0; i < 10; i++) {
					chart.series[i].hide();
				}
			}

		});

		// Hide average over the 5 equity approaches
		$('').click(function () {
			chart.series[11].hide();
			for (var i = 0; i < 10; i++) {
				chart.series[i].show();
			}
		});

		// Show help
        $('.read-button').click(function () {
            $('.how-to-read').slideToggle(300, function () {
                // var topPos = document.getElementById('how-to-read').offsetTop;
                // document.getElementById('graph').scrollTop = topPos-10;
            });
        });

		// Fill table
		if($absolute) {
			$('.unit-2030').html('2030 allocations (in ' + unit + ')');
			$('.unit-2050').html('2050 allocations (in ' + unit + ')');

		} else {
			$('.unit-2030').html('2030 allocations (in % of ' + year + ' levels)');
			$('.unit-2050').html('2050 allocations (in % of ' + year + ' levels)');
		}

		if($second) {
			$('.deg').html('2°C')
		} else {
			$('.deg').html('1.5°C')
		}

		// Data table
        function calc(obj, targetYear, relativeYear, index) {
            var number = (obj[targetYear-relativeYear][index] / divider);
            if(number > 999) {
                number = Math.round(number);
            } else {
                number = number.toPrecision(3);
            }
            return number;
        }

        $('.data-table__2030 .row-cer .avg').html(calc(cerAvg, 2030, year, 1));
		$('.data-table__2030 .row-gdr .avg').html(calc(gdrAvg, 2030, year, 1));
        $('.data-table__2030 .row-cap .avg').html(calc(capAvg, 2030, year, 1));
		$('.data-table__2030 .row-cpc .avg').html(calc(cpcAvg, 2030, year, 1));
        $('.data-table__2030 .row-epc .avg').html(calc(epcAvg, 2030, year, 1));

        $('.data-table__2050 .row-cer .avg').html(calc(cerAvg, 2050, year, 1));
        $('.data-table__2050 .row-gdr .avg').html(calc(gdrAvg, 2050, year, 1));
		$('.data-table__2050 .row-cap .avg').html(calc(capAvg, 2050, year, 1));
		$('.data-table__2050 .row-cpc .avg').html(calc(cpcAvg, 2050, year, 1));
        $('.data-table__2050 .row-epc .avg').html(calc(epcAvg, 2050, year, 1));


        $('.data-table__2030 .row-cer .range').html('[' + (cerRange[2030-2010][1] / divider).toPrecision(3) + ' to ' + (cerRange[2030-2010][2] / divider).toPrecision(3) + ']');
		$('.data-table__2030 .row-gdr .range').html('[' + (gdrRange[2030-2010][1] / divider).toPrecision(3) + ' to ' + (gdrRange[2030-2010][2] / divider).toPrecision(3) + ']');
        $('.data-table__2030 .row-cap .range').html('[' + (capRange[2030-2010][1] / divider).toPrecision(3) + ' to ' + (capRange[2030-2010][2] / divider).toPrecision(3) + ']');
		$('.data-table__2030 .row-cpc .range').html('[' + (cpcRange[2030-2010][1] / divider).toPrecision(3) + ' to ' + (cpcRange[2030-2010][2] / divider).toPrecision(3) + ']');
        $('.data-table__2030 .row-epc .range').html('[' + (epcRange[2030-2010][1] / divider).toPrecision(3) + ' to ' + (epcRange[2030-2010][2] / divider).toPrecision(3) + ']');

        $('.data-table__2050 .row-cer .range').html('[' + (cerRange[2050-2010][1] / divider).toPrecision(3) + ' to ' + (cerRange[2050-2010][2] / divider).toPrecision(3) + ']');
        $('.data-table__2050 .row-gdr .range').html('[' + (gdrRange[2050-2010][1] / divider).toPrecision(3) + ' to ' + (gdrRange[2050-2010][2] / divider).toPrecision(3) + ']');
		$('.data-table__2050 .row-cap .range').html('[' + (capRange[2050-2010][1] / divider).toPrecision(3) + ' to ' + (capRange[2050-2010][2] / divider).toPrecision(3) + ']');
		$('.data-table__2050 .row-cpc .range').html('[' + (cpcRange[2050-2010][1] / divider).toPrecision(3) + ' to ' + (cpcRange[2050-2010][2] / divider).toPrecision(3) + ']');
        $('.data-table__2050 .row-epc .range').html('[' + (epcRange[2050-2010][1] / divider).toPrecision(3) + ' to ' + (epcRange[2050-2010][2] / divider).toPrecision(3) + ']');
    }

};

/* Fill fairness statement */
esign.fairnessStatement = function(iso) {
	$.getJSON('assets/data/fairness-all.json', function(data) {
		try {
			function getCountryIso(value) {
				return value['iso-a3'] == iso;
			}
			var fairnessStatement = data.filter(getCountryIso);
			$('.description-f').html(fairnessStatement[0]['Description of fairness']);
			$('.description-a').html(fairnessStatement[0]['Description of ambition']);
			$('.description-c').html(fairnessStatement[0]['Description of how it contributes towards achieving the objective of the Convention']);
			$('.description-indc').html(fairnessStatement[0]['Conditionality of the INDC']);
			$('.description-updated').html(fairnessStatement[0]['Last updated (in the Module)']);
		} catch(e) {
			$('.description-f').html('Not Specified');
			$('.description-a').html('Not Specified');
			$('.description-c').html('Not Specified');
			$('.description-indc').html('Not Specified');
			$('.description-updated').html('Not Specified');
		}
	});
};

/* Qtip */
esign.qtip = function () {

    if(!esign.cache.IS_MOBILE) {
        addStarTooltip($('.tooltip--cer'), 'Constant Emissions Ratio', 'Maintains current national emissions ratios. All countries mitigate at the same rate.');
        addStarTooltip($('.tooltip--gdr'), 'Greenhouse Development Rights', 'Rich countries with high historical per capita emissions should reduce emissions the most, other countries\' emissions can temporarily increase.');
        addStarTooltip($('.tooltip--cap'), 'Capability', 'Rich countries should reduce emissions the most, other countries\' emissions can temporarily increase.');
        addStarTooltip($('.tooltip--cpc'), 'Equal Cumulative Per Capita', 'Countries with high historical per capita emissions should reduce emissions more the future.');
        addStarTooltip($('.tooltip--epc'), 'Equal Per Capita', 'All countries converge to equal per capita emissions.');
        $('.indc-tip').qtip({
            content: {
                text: "(I)NDCs – (Intended) Nationally Determined Contributions - are climate action plans that were submitted to the UNFCCC during the lead-up to the Paris Agreement in 2015."
            },
            position: {
                my: 'bottom center',
                at: 'top center'
            }
        });
        $('.grading-tip').qtip({
            content: {
                text: "The number of stars given to each country corresponds to the number of visions of equity met by its Nationally Determined Contribution. A country with a higher number of stars can be considered ambitious according to more visions of equity, and is therefore likely to be considered ambitious by a greater number of countries. However, it would not appear ambitious according to the visions of equity that are not matched, and as such could not be considered as universally ambitious."
            },
            position: {
                my: 'bottom left',
                at: 'top center'
            }
        });
    }

    function addStarTooltip(selector, title, text) {
        selector.qtip({
            content: {
                title: title,
                text: text
            },
            position: {
                my: 'bottom center',
                at: 'top center'
            }
        });
    }

};

/* Reset map, charts & elements */
esign.resetState = function() {
    $isoSelected = '';
    $countrySelected = '';
    $absolute = false;
    $('#relative').addClass('active');
    $('#absolute').removeClass('active');
    $('#chart').empty();
    $('#relative').html('Relative to 2010 <span class="caret"></span><span class="sr-only">Toggle Dropdown</span>');
    $('#export-chart-print').unbind( "click" );
    $('#export-chart-png').unbind( "click" );
    $('#export-chart-jpg').unbind( "click" );
    $('#export-chart-pdf').unbind( "click" );
    $('#export-chart-svg').unbind( "click" );
    $('.read-button').unbind( "click" );
    $('.how-to-read').css('display', 'none');
};

// initialize on docready
$(esign.init);