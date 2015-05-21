var POP2040 = 6261673;
var HOUSE2040 = 2415179;

var d = {};
var model2010 = {active:false};

$(function() {
	// +/- expand
	$('.view h2+div, .view h3+div').hide().prev('h2, h3').addClass('plus').click(function() {
		$(this).toggleClass('minus').next('div').slideToggle();
	});


	function sizeGallery() {
		//179 total width
		//x0.489362 column width
		//x2.25 two row height
		var parent = $('#tall').closest('.span4');
		var src = parent.siblings().filter(function() { return $(this).width() == parent.width(); }).eq(0);
		var heights = src.find('.row-fluid').map(function() { return $(this).height() }).get();
		var height = -6;
		var n = heights.length;
		while (n--)
			height+=heights[n];
		$('#tall').height(height);
		$('#short').height(height*0.6489);
	}
	
///////////////////////////////////////
	ko.bindingHandlers.fadeVisible = {
		init: function(element, valueAccessor) {
			$(element).hide();
		},
		update: function(element, valueAccessor, allBindingsAccessor) {
			var value = valueAccessor(),
				allBindings = allBindingsAccessor();
			
			ko.utils.unwrapObservable(value) && $(element).fadeIn(allBindings.slideDuration || 400); // Make the element visible
		}
	};

	ko.bindingHandlers.scrollTo = {
		init: function() {},
		update: function(element, valueAccessor, allBindingsAccessor) {
			// First get the latest data that we're bound to
			var value = valueAccessor(), 
				allBindings = allBindingsAccessor();
			
			// Grab some more data from another binding property
			var duration = allBindings.slideDuration || 400; // 400ms is default duration unless otherwise specified
			// Now manipulate the DOM element
			ko.utils.unwrapObservable(value) && $('html,body').animate({scrollTop: $(element).offset().top},'slow'); // Make the element visible
		}
	};

	ko.extenders.percent = function(target, precision) {
		var result = ko.dependentObservable({
			read: function() {
			   return (target() * 100).toFixed(precision)+'%';
			},
			write: target
		});

		result.raw = target;
		return result;
	};

	//flexible formatter for numbers
	ko.extenders.numeric = function(target, opts) {
		var settings = {
			commas: false,
			decimals: -1,
			precision: -1,
			roundTo: -1,
			prefix: '',
			postfix: '',
			multiplier: 1
		};
		if (opts) $.extend(settings, opts);
		var result = ko.dependentObservable({
			read: function() {
				var result = target()*settings.multiplier;
				if (settings.decimals > -1) {
					result = result.toFixed(settings.decimals);
				}
				else if (settings.precision > -1) {
					result = Math.round(Number(result).toPrecision(settings.precision));//result.toPrecision(settings.precision);
				}
				else if (settings.roundTo > -1) {
					var len = Math.round(result).toString().length - settings.roundTo.toString().length;
					if (len < 0) len = 0;
					result = Math.round(Number(result).toPrecision(len+1));
				}
				if (settings.commas){
					result += '';
					x = result.split('.');
					x1 = x[0];
					x2 = x.length > 1 ? '.' + x[1] : '';
					var rgx = /(\d+)(\d{3})/;
					while (rgx.test(x1)) {
						x1 = x1.replace(rgx, '$1' + ',' + '$2');
					}
					result = x1 + x2;
				}
				return settings.prefix + result + settings.postfix;
			},
			write: target
		});

		result.raw = target;
		return result;
	};

	
	window.viewModel = {
		//add all inputs here
		housing: ko.observable('2010'),
		dev: ko.observable('0'),
		taxtype: ko.observableArray([]),
		taxamount: ko.observable(0).extend({numeric:{roundTo:10}}),
		mroad: ko.observable(30.6),
		taxes: ko.observable('H'),
		mtransit: ko.observable(17.5),
		mbikeped: ko.observable(0),
		mfreq: ko.observable(0),
		transitfirst: ko.observable(false),
		enhance: ko.observable(0),
		//expand: ko.observable(1),
		newdev: ko.observable(0),
		newtransit: ko.observableArray([]),
		peakVMT: ko.observable(1),
		peakVMTFactor: ko.observable(1),
		GHGFactor: ko.observable(1),
		BikePedRaw: ko.observable(0),
		transitFactor: ko.observable(1),
		newRiders: ko.observable(1),
		is2010: ko.observable(true),
		submitted: ko.observable(false),

		//data
		data: ko.observable({}),
		max: ko.observable(48.0),
		spending: ko.observable(0),
        transitSpending: ko.observable(0),

		//add all indicators here
		Acres: ko.observable(0).extend({numeric:{commas:true,decimals:0,precision:4}}),
		VMT: ko.observable(0).extend({numeric:{roundTo:10, commas:true}}),
		Transit: ko.observable(0).extend({numeric:{commas:true,decimals:0, precision:4}}),
		BikePed: ko.observable(0).extend({numeric:{commas:true,decimals:0, precision:4}}),
		Congestion: ko.observable(0).extend({numeric:{decimals:1}}),
		Costs: ko.observable(0).extend({numeric:{roundTo:10, prefix:'$', commas:true}}),
		RoadCon: ko.observable(0).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
		TransitCon: ko.observable(0).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
		Safety: ko.observable(0).extend({numeric:{decimals:1}}),
		GHG: ko.observable(0).extend({numeric:{decimals:1}}),

		//functions
		views: ['Introduction','How Should<br/>We Grow?','Transportation<br/>Funding','Transportation<br/>Projects','Results'],
		selectedView: ko.observable('Introduction'),
		indicators: ['Acres','VMT','BikePed','Transit','Costs','Congestion','GHG','Safety']

	};
	window.model2010 = {
		Acres: ko.observable(1085600).extend({numeric:{commas:true,decimals:0,precision:4}}),
		VMT: ko.observable(7340).extend({numeric:{roundTo:10, commas:true}}),
		Transit: ko.observable(64).extend({numeric:{commas:true,decimals:0, precision:4}}),
		BikePed: ko.observable(100.061637500567).extend({numeric:{commas:true,decimals:0, precision:4}}),
		Congestion: ko.observable(21.8166907417988).extend({numeric:{decimals:1}}),
		Costs: ko.observable(13681).extend({numeric:{roundTo:10, prefix:'$', commas:true}}),
		RoadCon: ko.observable(0.213).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
		TransitCon: ko.observable(0.3).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
		Safety: ko.observable(7.1).extend({numeric:{decimals:1}}),
		GHG: ko.observable(7.64522066399765).extend({numeric:{decimals:1}})
	};

	window.avgModel = {
			Acres: ko.observable(1085600).extend({numeric:{commas:true,decimals:0,precision:4}}),
			VMT: ko.observable(7340).extend({numeric:{roundTo:10, commas:true}}),
			Transit: ko.observable(64).extend({numeric:{commas:true,decimals:0, precision:4}}),
			BikePed: ko.observable(100.061637500567).extend({numeric:{commas:true,decimals:0, precision:4}}),
			Congestion: ko.observable(21.8166907417988).extend({numeric:{decimals:1}}),
			Costs: ko.observable(13070).extend({numeric:{roundTo:10, prefix:'$', commas:true}}),
			RoadCon: ko.observable(0.213).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
			TransitCon: ko.observable(0.3).extend({numeric:{decimals:1,multiplier:100,postfix:'%'}}),
			Safety: ko.observable(7.1).extend({numeric:{decimals:1}}),
			GHG: ko.observable(7.64522066399765).extend({numeric:{decimals:1}})
	};

	ko.computed(function() {
		$.getJSON('script.aspx', {avg:true}, function(data) {
			var data = data.rows[0];
			for (indicator in data) {
				avgModel[indicator](data[indicator]);
			}
		});
	}, avgModel);

	ko.computed(function() {
		this.housing();
		sizeGallery();
	},viewModel);

	viewModel.enhance.push = function(newValue) {
		if (newValue == 'majorITS') this.enhance.remove('regionalITS');
		if (newValue == 'regionalITS') this.enhance.remove('majorITS');
		if (newValue == 'incTransit10') this.enhance.remove('incTransit25');
		if (newValue == 'incTransit25') this.enhance.remove('incTransit10');
		ko.observableArray.fn.push.call(this.enhance, newValue);
	}.bind(viewModel);

	viewModel.selectView = ko.computed(function() {
		$('.view').hide().filter('[data-title="'+this.selectedView()+'"]').fadeIn(function() {
			if ($('.view:visible').offset().top+$('html,body').offset().top < 0) $('html,body').animate({scrollTop: $(this).offset().top},'slow');
			$('.view:visible').trigger('visible');
		});
	}, viewModel);

	ko.computed(function() {
	if (this.selectedView() == "How Should<br/>We Grow?" && (this.housing() == '2010' || this.dev() == '0'))
		$('#second .button').addClass('hide');
	else
		$('#second .button').removeClass('hide');
	if (this.selectedView() == "Transportation<br/>Funding" && this.taxes() == 'H')
		$('#four .button').addClass('hide');
	else
		$('#four .button').removeClass('hide');
	}, viewModel);

	//add all outputs here

	//GET NEW DATA FROM TABLE
	ko.computed(function() {
		var $this = this;
		$.getJSON('script.aspx', {scenario: this.housing(), density: this.dev()}, function(data) {
			var d = {};
			for (var i in data.rows[0]) {
				d[i] = isNaN(data.rows[0][i])? data.rows[0][i] : parseFloat(data.rows[0][i]);
			}
			$this.data(d);
			if (data.rows[0].conc.substring(0, 5) !== '20100') $this.is2010(false);
			//console.log('data', $this.data());
		});
	}, viewModel);

	//UPDATE MULTIPLIERS
	viewModel.capacity = {};
	viewModel.capacity.newRiders = ko.computed(function() {
		var annual = {
			"BerksRR": 889700,
			"QuakertownRR": 1612000,
			"AtglenRR": 155000,
			"WawaRR": 248000,
			"NorristownHSL": 951700,
			"DelawareAveRR": 1519000,
			"NavyYardBSS": 2480000,
			"CulturalConnector": 1187300,
			"NJ42BRT": 1984000,
			"SouthamptonBRT": 3840280,
			"PATCO": 8029000,
			"US1BRT": 5766000,
			"WestTrenton": 310000
		}, result = 0;
		$.each(this.newtransit(), function() {
			result += annual[this];
		});
		return result/POP2040;
	}, viewModel);


	viewModel._transitService = ko.computed(function() {
		return 0.00009 * this.mfreq() * this.mfreq() + 0.0095 * this.mfreq(); //Transit Service Frequency ($) slider
	}, viewModel);
	viewModel.multipliers = {};
	viewModel.multipliers.bikePed = ko.computed(function() {
		return this.mbikeped() > 0 ? Math.pow(1.00095,  this.mbikeped() * 1250 / 112) : 1;
	}, viewModel);
	viewModel.multipliers.VMT = ko.computed(function() {
		return (0.97*Math.pow(this.RoadCon.raw(), -0.02))
			* Math.pow(1.0016, (1 - 0.97*Math.pow(this.TransitCon.raw(), -0.02)) * 100)
			* Math.pow(1.0016, (1 - this.multipliers.bikePed())*100)
			* Math.pow(1.0016, (1 - (this.transitfirst() ? 1.09 : 1)) * 100)
			* Math.pow(1.0016, (1 - Math.pow(1.005, 100 * this._transitService())) * 100)
			* Math.pow(1.00101, (this.newdev()<=1.6 ? 1583250 * this.newdev() / 1.6 : 1583250 + 2257373 * (this.newdev() - 1.6) / 0.9) * 100 / (103075456.455424 - 1583250 - 2257373))
			* Math.pow(1.0016, (1 - ((this.capacity.newRiders() + this.Transit.raw())/this.Transit.raw()))*100);
	}, viewModel);
	viewModel.multipliers.transit = ko.computed(function() {
		return Math.pow(1.003, (1- (0.97*Math.pow(this.RoadCon.raw(), -0.02))) * 100)
			* (0.97*Math.pow(this.TransitCon.raw(), -0.02))
			* Math.pow(1.0083, (1 - this.multipliers.bikePed()) * 100)
			* (this.transitfirst() ? 1.09 : 1)
			* Math.pow(1.005, 100 * this._transitService())
			* Math.pow(1.0624, (1 - Math.pow(1.00101, (this.newdev()<=1.6 ? 1583250 * this.newdev() / 1.6 : 1583250 + 2257373 * (this.newdev() - 1.6) / 0.9) * 100 / (103075456.455424 - 1583250 - 2257373))) * 100);
	}, viewModel);
	viewModel.multipliers.frequency = ko.computed(function() {
		var $this = this;
		return {I: -0.08, A: -0.41, B: -0.08, C: -0.16, D: -0.08, E: 0, F: -0.04, G: -0.01, H: -0.01};
	}, viewModel);
	viewModel.multipliers.tripLength = ko.computed(function() {
		var $this = this;
		return {I: -0.23, A: -0.15, B: -0.26, C: -0.45, D: -0.23, E: 0, F: 0, G: -0.03, H: -0.03};
	}, viewModel);
	viewModel.multipliers.transitRidership = ko.computed(function() {
		var $this = this;
		return {I: 0, A: 0, B: 0, C: 0, D: 0, E: -0.9, F: 0, G: -0.003, H: -0.003};
	}, viewModel);
	viewModel.multipliers.other = ko.computed(function() {
		var $this = this;
		return {I: -0.47, A: -0.33, B: -0.08, C: 0, D: -0.47, E: 0, F: 0, G: 0, H: 0};
	}, viewModel);
	viewModel.multipliers.baseVMT = ko.computed(function() {
		var $this = this;
		return ($this.data()['peak']*$this.data()['peak_veh_trip'] + $this.data()['off_peak']*$this.data()['off_peak_veh_trip']) * 365 * POP2040 / HOUSE2040;
	}, viewModel);
	viewModel.multipliers.baseTransitCost = ko.computed(function() {
		var $this = this;
		return $this.data()['transit'] * POP2040 / HOUSE2040 * 1.52107696491705;
	}, viewModel);
	viewModel.multipliers.totalCost = ko.computed(function() {
		var $this = this;
		return $this.data()['vehicle_ownership_cost'] + $this.multipliers.baseVMT() * 0.462;
	}, viewModel);

	viewModel.multipliers.amount = ko.computed(function() {
		var $this = this;
		return 1;
	}, viewModel);

	//UPDATE TAX MULTIPLIERS
	viewModel.taxMultipliers = {};
	viewModel.taxMultipliers.amount = ko.computed(function() {
		var $this = this,
			result = {},
			l = $this.taxtype().length,
			t = $this.taxamount();
		$.each($this.taxtype(), function(k, v) {
			result[v] = t/l;
		});
		return result;
	}, viewModel);
	viewModel.taxMultipliers.frequency = ko.computed(function() {
		var $this = this,
			result = {};
		$.each($this.taxMultipliers.amount(), function(k,v) {
			result[k] = Math.pow(1 + $this.multipliers.frequency()[k] / 100, 100 * v / (($.inArray(v, ['G','H'])>-1 ? $this.multipliers.baseTransitCost() : 0) + $this.multipliers.totalCost()));
		});
		return result;
	}, viewModel);
	viewModel.taxMultipliers.tripLength = ko.computed(function() {
		var $this = this,
			result = {};
		$.each($this.taxMultipliers.amount(), function(k,v) {
			result[k] = Math.pow(1 + $this.multipliers.tripLength()[k] / 100, 100 * v / (($.inArray(v, ['G','H'])>-1 ? $this.multipliers.baseTransitCost() : 0) + $this.multipliers.totalCost()));
		});
		return result;
	}, viewModel);
	viewModel.taxMultipliers.transitRidership = ko.computed(function() {
		var $this = this,
			result = {};
		$.each($this.taxMultipliers.amount(), function(k,v) {
			result[k] = Math.pow(1 + $this.multipliers.transitRidership()[k] / 100, 100 * v / (($.inArray(v, ['E','G','H'])>-1 ? $this.multipliers.baseTransitCost() : 0) + $this.multipliers.totalCost()));
		});
		return result;
	}, viewModel);
	viewModel.taxMultipliers.other = ko.computed(function() {
		var $this = this,
			result = {};
		$.each($this.taxMultipliers.amount(), function(k,v) {
			result[k] = Math.pow(1 + $this.multipliers.other()[k] / 100, 100 * v / $this.multipliers.totalCost());
		});
		return result;
	}, viewModel);

	//UPDATE REASSIGNMENT
	viewModel.reassign = {};
	viewModel.reassign._totalFrequency = ko.computed(function() {
		var $this = this,
			result = 1;
		$.each($this.taxMultipliers.frequency(), function(k,v) {
			result *= v;
		});

		return result;
	}, viewModel);
	viewModel.reassign._baselinePeak = ko.computed(function() {
		var $this = this;
		return [POP2040 * $this.data()['peak'], $this.data()['transit'] * POP2040 / 310];
	}, viewModel);
	viewModel.reassign._totalTransitRidership = ko.computed(function() {
		var $this = this,
			result = 1;
		$.each($this.taxMultipliers.transitRidership(), function(k,v) {
			result *= v;
		});
		return result;
	}, viewModel);
	viewModel.reassign._reassignedPeak = ko.computed(function() {
		var $this = this,
			reassignedPeak = ($this.reassign._baselinePeak()[0] - $this.reassign._baselinePeak()[0] * $this.reassign._totalFrequency() * ($.inArray('A', $this.taxtype()) > -1 ? Math.pow(1 + $this.multipliers.other()['A'] / 100, 100 * $this.taxamount() / $this.taxtype().length / $this.multipliers.totalCost()) : 1)) * 0.67,
			reassignedTransit = ($this.reassign._baselinePeak()[1] - $this.reassign._baselinePeak()[1] * $this.reassign._totalTransitRidership()) * 0.67;
		return [reassignedPeak, reassignedTransit];
	}, viewModel);
	viewModel.reassign._baselineOffPeak = ko.computed(function() {
		var $this = this;
		return $this.data()['off_peak'] * POP2040;
	}, viewModel);
	viewModel.reassign._revisedOffPeak = ko.computed(function() {
		var $this = this;
		return $this.reassign._baselineOffPeak() * $this.reassign._totalFrequency() + $this.reassign._baselinePeak()[0] * (1 - Math.pow(1 + $this.multipliers.other()['A'] / 100, 100 * ($.inArray('A', $this.taxtype()) > -1 ? $this.taxamount()/$this.taxtype().length : 0) / $this.multipliers.totalCost()));
	}, viewModel);
	viewModel.reassign._reassignedOffPeak = ko.computed(function() {
		var $this = this;
		return ($this.reassign._baselineOffPeak() - $this.reassign._revisedOffPeak()) * 0.67;
	}, viewModel);

	viewModel.reassign._calc = function (a, b, offPeak) {
		var $this = this;
		return ($this.reassign._reassignedPeak()[0] + (offPeak ? $this.reassign._reassignedOffPeak() : 0)) * a + $this.reassign._reassignedPeak()[1] * b;
	}.bind(viewModel);
	viewModel.reassign.peakDriver = ko.computed(function() {
		var $this = this;
		return $this.reassign._calc(0, 0.40286909766322);
	}, viewModel);
	viewModel.reassign.offPeakDriver = ko.computed(function() {
		var $this = this;
		return $this.reassign._calc(0, 0.285796026547413);
	}, viewModel);
	viewModel.reassign.peakPassenger = ko.computed(function() {
		var $this = this;
		return $this.reassign._calc(0.676281514777855, 0.241032793473721, true);
	}, viewModel);
	viewModel.reassign.transit = ko.computed(function() {
		var $this = this;
		return $this.reassign._calc(0.126467322692487, 0, true);
	}, viewModel);
	viewModel.reassign.bikePed = ko.computed(function() {
		var $this = this;
		return $this.reassign._calc(0.197251162529658, 0.0703020823156461, true);
	}, viewModel);
	viewModel.reassign.annualBikePed = ko.computed(function() {
		var $this = this;
		return $this.reassign.bikePed() * 365 / POP2040;
	}, viewModel);

	//UPDATE ACRES
	ko.computed(function () {
		var $this = this;
		$this.Acres($this.data()['total_acres_developed']);
	}, viewModel);

	//UPDATE VMT
	viewModel._totalTripLength = ko.computed(function () {
		var $this = this,
			result = 1;
		$.each($this.taxMultipliers.tripLength(), function(k,v) {
			result *= v;
		});
		return result;
	}, viewModel);
	viewModel._peakVMT = ko.computed(function () {
		var $this = this,
			peakTrips = ($this.reassign._baselinePeak()[0] * $this.reassign._totalFrequency() * (isNaN($this.taxMultipliers.other()['A']) ? 1 : $this.taxMultipliers.other()['A']) + $this.reassign.peakDriver()) / POP2040,
			peakLength = $this.data()['peak_veh_trip'] * $this._totalTripLength(),
			newRidership = Math.pow(0.9984, $this.capacity.newRiders() / $this.data()['transit'] * 100);
		return peakTrips * peakLength * newRidership * $this.multipliers.VMT();
	}, viewModel);

	viewModel._offPeakVMT = ko.computed(function () {
		var $this = this,
			offPeakTrips = (($this.reassign._baselineOffPeak() * $this.reassign._totalFrequency() + $this.reassign._baselinePeak()[0] * (1 - (isNaN($this.taxMultipliers.other()['A']) ? 1 : $this.taxMultipliers.other()['A']))) + $this.reassign.offPeakDriver()) / POP2040,
			offPeakLength = $this.data()['off_peak_veh_trip'] * $this._totalTripLength(),
			newRidership = Math.pow(0.9984, $this.capacity.newRiders() / $this.data()['transit'] * 100);
		return offPeakTrips * offPeakLength * newRidership * $this.multipliers.VMT();
	}, viewModel);

	ko.computed(function () {
		var $this = this;
		$this.VMT(($this._peakVMT() + $this._offPeakVMT()) * 365);
	}, viewModel);

	//UPDATE COSTS
	ko.computed(function () {
		var $this = this,
			resEnergy = $this.data()['residential_energy'],
			vehicleOwn = $this.data()['vehicle_ownership_cost'],
			vehicleOps = 0.462 * (1 + ( 0.5016 * $this.RoadCon.raw() - 0.1106)),
			transitRidership = $this.Transit.raw() * 1.52107696491705 * POP2040 / HOUSE2040,
			stateTaxes = 0,
			transTaxes = parseInt($this.taxamount());
		$this.Costs(resEnergy + vehicleOwn + vehicleOps * $this.VMT.raw() * POP2040 / HOUSE2040 + transitRidership + stateTaxes + transTaxes);
	}, viewModel);

	//UPDATE GHG EMISSIONS
	ko.computed(function () {
		var $this = this,
			_baselineTransitGHG = 0.27 + (0.1598 * $this.TransitCon.raw() - 0.0483),
			_newCapacityGHG = 0.08 * ($.grep($this.newtransit(), function(v,k) { return $.inArray(v, ['CulturalConnector','QuakertownRR','WawaRR','DelawareAveRR','NorristownHSL','AtglenRR','NavyYardBSS','BerksRR','PATCO','WestTrenton']) > -1; }).length) / 29 + ($.inArray('SouthamptonBRT', $this.newtransit())>-1 ? 0.27*40/1678 : 0)+($.inArray('US1BRT', $this.newtransit())>-1 ? 0.27*130/1678 : 0)+($.inArray('NJ42BRT', $this.newtransit())>-1 ? 0.3782/1678 : 0),
			transitGHG = _baselineTransitGHG * (1 + $this._transitService()) + _newCapacityGHG,
			vehicleGHG = $this.VMT.raw() * POP2040 * 0.00054232386295 * 0.000001
				* (isNaN($this.taxMultipliers.other()['I']) ? 1 : $this.taxMultipliers.other()['I'])
				* (isNaN($this.taxMultipliers.other()['D']) ? 1 : $this.taxMultipliers.other()['D']),
			resEnergyGHG = $this.data()['residential_energy_co2'];
		$this.GHG((transitGHG + vehicleGHG + resEnergyGHG) * 1000000 / POP2040);
	}, viewModel);

	//UPDATE TRANSIT RIDERSHIP
	ko.computed(function () {
		var $this = this;
		$this.Transit((($this.reassign._baselinePeak()[1] * $this.reassign._totalTransitRidership() + $this.reassign.transit())*310/POP2040 + $this.capacity.newRiders()) * $this.multipliers.transit());
	}, viewModel);

	//UPDATE BIKE PED
	ko.computed(function () {
		var $this = this;
		$this.BikePed(($this.data()['nonmotorized_trips'] + $this.reassign.annualBikePed()) * $this.multipliers.bikePed());
	}, viewModel);

	//UPDATE CONGESTION
	ko.computed(function () {
		var $this = this,
			_peakVMT = $this._peakVMT() * POP2040,
			_peakVC =  _peakVMT / (103075456.455424 - 1583250 - 2257373 + (this.newdev()<=1.6 ? 1583250 * this.newdev() / 1.6 : 1583250 + 2257373 * (this.newdev() - 1.6) / 0.9)),
			_peakSpeed = (-29.409 * _peakVC + 41.379)*(this.transitfirst() ? 29.1/29.2 : 1),
			totalDelay = 250 * (_peakVMT / _peakSpeed - _peakVMT / 36.3531517692894),
			conditionalDelay = Math.exp(-0.3186 * $this.mroad() + 19.009) * 365,
			operationalDelay = 0.002872 * $this.enhance() * $this.enhance() - 0.05097 * $this.enhance() + 1.07;
		$this.Congestion((totalDelay * operationalDelay + conditionalDelay) / POP2040);
	}, viewModel);

	//UPDATE SAFETY
	ko.computed(function () {
		var $this = this;
		$this.Safety(($this._peakVMT() * POP2040 * 365 * 0.95 + $this._offPeakVMT() * POP2040 * 365 * 1.03) * 0.001 / POP2040);
	}, viewModel);

	//UPDATE ROAD CONDITION
	ko.computed(function () {
		var $this = this;
		$this.RoadCon(75.515 * Math.pow($this.mroad(), -1.672));
	}, viewModel);

	//UPDATE TRANSIT CONDITION
	ko.computed(function () {
		var $this = this;
		$this.TransitCon(-0.0218 * $this.mtransit() + 0.7379);
	}, viewModel);

	//UPDATE FUNDING
    ko.computed(function () {
		var $this = this,
		result = 0,
		costs = {"WestTrenton":0.2, "US1BRT":0.4, "PATCO":2.4, "SouthamptonBRT":0.2, "NJ42BRT":0.1, "CulturalConnector":0.5, "NavyYardBSS":0.9, "DelawareAveRR":1.3, "NorristownHSL":0.5, "WawaRR":0.1, "BerksRR":1, "AtglenRR":0.1, "QuakertownRR":0.3
			};
		$.each($this.newtransit(), function(i, v) {
			result += costs[v];
		});
		$this.transitSpending(result);
	}, viewModel);

	ko.computed(function () {
		var $this = this,
			result = $this.mroad() + $this.mtransit() + $this.enhance() + $this.mbikeped() + $this.mfreq() + $this.newdev() + $this.transitSpending();
		$this.max(59 + $this.taxamount() * 2266609 * 27 * 0.000000001 * Math.pow(1.03, 13.5));
		$this.spending(result);
	}, viewModel);

	viewModel.remaining = ko.computed(function () {
		var $this = this;
		return $this.max() - $this.spending();
	}, viewModel);


	function PercentOfIdeal(prop) {
		if (!this.hasOwnProperty(prop)) return '';
		var val = this[prop].raw();
		if (prop == 'TransitCon' || prop == 'RoadCon') var result = Math.round((val - model2010[prop].raw())*100)+'%';
		else var result = isNaN(val)||isNaN(model2010[prop].raw()) ? '0%' : Math.round((val / model2010[prop].raw() - 1)*100)+'%';
		return result;
	}

	viewModel.PercentOfIdeal = PercentOfIdeal.bind(viewModel);
	avgModel.PercentOfIdeal = PercentOfIdeal.bind(avgModel);

	function IdealDirection(prop) {
		//Should selected value be higher than the ideal value?
		var direction = {
			Acres: false,
			BikePed: true,
			Congestion: false,
			Costs: false,
			GHG: false,
			RoadCon: false,
			Safety: false,
			Transit: true,
			TransitCon: false,
			VMT: false
		};
		if (this.hasOwnProperty(prop)) {
			var val = this[prop].raw();
			if (!model2010.hasOwnProperty(prop) || (val == model2010[prop].raw())) return {'src':'img/nochange.png', 'color': 'green'};
			var direct = val > model2010[prop].raw() ? 'up' : 'down';
			var color = direction[prop] == (val > model2010[prop].raw()) ? 'green' : 'red';
			return  {'src': 'img/'+color+direct+'.png', 'color': color};
		}
		return {'src':null, 'color':null};
	}

	viewModel.IdealDirection = IdealDirection.bind(viewModel);
	avgModel.IdealDirection = IdealDirection.bind(avgModel);

	viewModel.IndicatorDesc = function(prop, txt) {
		//if (txt == undefined) txt = false;
		txt = txt || false;
		var desc = {
			Acres: {title:'Acres Developed',content:'This is the total number of acres developed in the region for residential, commercial, industrial, transportation, community, recreation, and parking uses. There are approximately 2.44 million total acres in the region. About 550,000 are held as permanently protected open space, and just under 1 million acres are undeveloped and not protected from possible development.'},
			BikePed: {title:'Biking & Walking Trips',content:'These are the number of trips per year an individual completes using only their feet or a bicycle. Though many auto and transit trips have a biking or walking portion, such trips count as auto or transit trips.'},
			Congestion: {title:'Hours of Congestion',content:'This is a measure of how many hours per year the average person wastes as a result of recurring traffic delay. This delay is caused by demand for roadway space being greater than capacity. Delay also occurs from crashes, special events, construction, and weather, but these types of delay are not included in this analysis.'},
			Costs: {title:'Transportation & Energy Costs',content:'This is an estimate of how much the average household spends per year on heating, cooling, and other electricity use, as well as total transportation costs (including vehicle ownership and operating expenses, additional transportation fees, and transit fares). Future values are presented in current-year dollars, allowing for more direct comparison to today\'s expenses. It is expected that energy prices will rise in the future at a rate greater than inflation, consuming a larger portion of the average household\'s budget.'},
			GHG: {title:'Greenhouse Gas Emissions',content:'This is a measure of annual metric tons of greenhouse gas emissions per capita from residential energy use and the region\'s road and transit systems. These sources represent about 54 percent of the region\'s total GHG emissions. More driving, spread out development patterns, and larger houses will all cause this to increase in the future.'},
			RoadCon: {title:'Poor Road Condition',content:'This is the percent of roads and bridges in poor condition. While not eminently unsafe, these facilities need maintenance and repair in order to avoid being closed in the future. Roads in poor condition also increase vehicle operating costs and congestion.'},
			Transit: {title:'Transit Trips',content:'This is a measure of how many times per year an individual rides a public subway, regional rail, trolley or bus.'},
			TransitCon: {title:'Poor Transit Condition',content:'This is an estimate of the amount of transit infrastructure in poor condition. Transit infrastructure condition impacts the reliability, safety, and ridership on the system.'},
			VMT: {title:'Vehicle Miles Driven',content:'This is a measure of how many miles the average person drives per year.'},
			Safety: {title:'Road Fatalities',content:'This is a measure of the estimated number of annual fatalities per 100,000 people that are likely to occur on our region\'s roadways. Generally, the more we all drive, the greater the risk that we are involved in a crash, fatal or not. Expanding our road network and sprawling development patterns generally increase the amount we drive.'}
		};
		return txt?desc[prop].content:desc[prop].title;
	};

	ko.applyBindings(viewModel);


	$('.view:not(:last)').each(function() {
		$(this).append($('<input type="button" value="Next" class="button" />').click(function() {
			var name = $(this).parent('.view').data('title');
			if (name == 'Transportation<br/>Projects' && viewModel.remaining() < -0.1) {
				//alert negative budget
				$('#myModal').modal();
				return;
			}
			var index = $.inArray(name, viewModel.views);
			if (index+1 < viewModel.views.length) viewModel.selectedView(viewModel.views[index+1]);
		}));
	});

	function params() {
		var obj = {},
			arr = ['housing','dev','taxes','taxtype','taxamount','taxtypeother','mroad','mtransit','enhance','mbikeped','mfreq','transitfirst','newdev','newtransit','Acres','VMT','BikePed','Transit','RoadCon','TransitCon','Costs','Congestion','GHG','Safety','max','spending','remaining'];
		$(arr).each(function() {
			if(this in viewModel) {
				if (viewModel[this].hasOwnProperty('raw'))
					obj[this] = viewModel[this].raw();
				else
					obj[this] = viewModel[this]();
			}
		});
		obj.taxtypeother = $('#taxtypeother').val();
		obj.age = $("#age").val();
		obj.zipcode = $("#zipcode").val();
		obj.comments = $("#comments").val();
		return obj;
	}

	$('#submitButton').click(function(e) {
		e.preventDefault();
		$.post('script.aspx?submit=true', params(), function(data) {
			if (data.success)
				this.submitted(true);
		}.bind(viewModel),'json');
		return false;
	}).bind(viewModel);
////////////////////////////////////////
	$('section div[rel*=popover]').popover({delay:500,placement:'in bottom'});
	$('*[rel*=tooltip]').tooltip();
	$('.view *[rel*=popover]').css('display','inline-block').popover({delay:500,placement:'right'});
	$('#cropped').resize(function() {
		$(this).css({'overflow':'hidden','height':$(this).width()/4*3+'px'});
	});
	$('input[name=housing]').click(function() {
		$('#cropped:visible').resize();
	});
	$('input[name=dev]').click(function() {
		$(this).closest('div').animate({width:'48.9362%'},{step:function() {$('#cropped').resize();}}).siblings('div').animate({width:'23.4043%'},{step:function() {$('#cropped').resize();}});
		//$(this).closest('div.span4,div.span3').switchClass('span3 span4','span6').siblings('div').switchClass('span4 span6','span3').eq(0).animate({'z-index':'0'},{step:function() {$('#cropped').resize();}});
	});
	
	function dropped(event, ui) {
		if ($('.dropzone').index(this)) {
			var l = $(this).offset().left+$(this).width()-ui.draggable.width()+15;
			viewModel.is2010(false);
		}
		else {
			var l = $(this).offset().left;
			viewModel.is2010(true);
		}
		$(this).append(ui.draggable.animate({left:l-$(this).parent().offset().left}));
	}
	$('.dropzone').css('cursor','pointer').droppable({
		intersect:'touch',
		drop: dropped
	}).click(function(event) {
		dropped.call(this, event, {draggable:$('#arrow')});
	});
	$('#arrow').css('cursor','pointer').draggable({
		axis:'x',
		containment:'#outerParent'
	});
	ko.computed(function() {
		if (this.is2010()) $('#arrow').appendTo($('.dropzone:eq(0)')).animate({left:0});
		else $('#arrow').appendTo($('.dropzone:eq(1)')).animate({left:$('.dropzone:eq(1)').offset().left+$('.dropzone:eq(1)').width()-$('#arrow').width()-$('#outerParent').offset().left});
	}, viewModel);

	$('.view img[rel*="modal"]').each(function() {
		var modal = $($('<div class="modal"></div>').append($('<div class="modal-body"></div>').append($(this).clone()))).modal({show:false});
		modal.bind('show', function() {$(this).fadeIn('slow');});
		$(this).click(function() { modal.modal('show');});
	});

			function calcWidth(el, val, event) {
			var max=el.data('max'),
				min=el.data('min'),
				w = (val-min)*(el.parent().width())/(max-min);
			setWidth(el, w, event);
		}

		function setWidth(el, val, event) {
			el.width(val);
			bar(event, {element: el, size: {width: val}});
		}

		function bar(event, ui) {
			var obj = (typeof ui == 'undefined') ? this : $(ui.element);
			if (typeof ui == 'undefined') var ui= {size:{width : $(this).width()}};
			var max=obj.data('max'),
				min=obj.data('min'),
				val = parseFloat(((ui.size.width)/obj.parent().width()*(max-min)+min).toFixed(1));
			viewModel[obj.data('observable')](Math.min(val, max));
		}

		$('.progress .bar').resizable({
			containment:'parent',
			handles: {'e':'.handle'},
			resize: bar,
			stop: bar
		});
		$('.progress').css({'position':'relative','z-index':1}).one('visible',function() {
			var $this = this;
			$('.bar',this).css({'z-index':2,position:'absolute'});
			$($('.bar',this).data('ticks')).each(function() {
				var bar = $('.bar',$this);
				var width = $($this).width()/(bar.data('max')-bar.data('min'))*(parseFloat(this)-bar.data('min'));
				$($this).append(
					$('<div>').html('&nbsp;').css({'border-left':'1px solid #ccc',position:'absolute',left:width,'z-index':1})
				);
			});
		}).on('click',function(event) {
			setWidth($('.bar',this),event.pageX-$('.bar', this).offset().left, event);
		}).prop('title', 'Slide or click to adjust value');
	
});
