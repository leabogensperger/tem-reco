// JavaScript Document

THistogram = Class.extend({
	MIN_BUFFER_SIZE: 257,
	init: function(source){
		if(source == undefined)
			throw 'The source of an histogram cannot be undefined!';


		this.type = 'rgb'; // other value is "grayscale"
		this.src = source;
		this.$bufferCnv = $('<canvas></canvas>');
		this.$bufferCnv.get(0).width = this.MIN_BUFFER_SIZE;
		this.$bufferCnv.get(0).height = this.MIN_BUFFER_SIZE;
		this.$displayCnv = $('<canvas></canvas>').addClass('histogramCanvas');;
		this.$displayCnv.get(0).width = 300;
		this.$displayCnv.get(0).height = 300;
		this.theLabels = new Array(256);
		for (var i = 0; i < 256; ++i) {
			this.theLabels[i] = '';
		}
		this.gsLineColor = "rgba(43,144,232,1)";
		this.gsFillColor = "rgba(43,144,232,0.25)";

		this.rgbLineColor = new Array(3);
		this.rgbFillColor = new Array(3);

		this.rgbLineColor[0] = "rgba(255,0,0,1)";
		this.rgbFillColor[0] = "rgba(255,0,0,0.25)";
		this.rgbLineColor[1] = "rgba(0,255,0,1)";
		this.rgbFillColor[1] = "rgba(0,255,0,0.25)";
		this.rgbLineColor[2] = "rgba(0,0,255,1)";
		this.rgbFillColor[2] = "rgba(0,0,255,0.25)";

		this.config = {
            type: 'line',
			animation : false,
			pointDot : false,
			scaleShowLabels : false,
			scaleShowGridLines : false,
			datasetStrokeWidth: 1,
			onAnimationComplete: function(){
				// flip the buffer
				//destCnv.getContext("2d").drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, destCnv.width, destCnv.height);
			},
            data: {
				labels: this.theLabels,
                datasets: [{
					label: "test",
	                backgroundColor: 'rgb(255, 99, 132)',
	                borderColor: 'rgb(255, 99, 132)',
	                data: [23,14,123,31,85,228]}
				]
            },
            options: {
                responsive: false,
				maintainAspectRatio: false,
				legend: {
					display: false
				},
                title:{
                    display:true,
                    text:'RGB Colour Intensity'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: false
                        },
						ticks: {
							min: 0,
							max: 1
						}
                    }]
                }
            }
        };

		var buf = this.$bufferCnv.get(0);
		// dont use buffer?
		var destCnv = this.$displayCnv.get(0);
		this.ChartLines = new Chart(destCnv.getContext("2d"),this.config);
	},
	setType: function(aType){
		this.type = aType;
		this.update();
	},
	appendTo: function($domE){
		this.$displayCnv.appendTo($domE);
	},
	resize: function (w, h){
		this.$displayCnv.get(0).width = w;
		this.$displayCnv.get(0).height = h;

		// make the buffer canvas at least as big as the display canvas.
		this.$bufferCnv.get(0).width = Math.max(w, this.MIN_BUFFER_SIZE);
		this.$bufferCnv.get(0).height = Math.max(h, this.MIN_BUFFER_SIZE);
	},
	update: function(){
		// first test if allow to do this
		//  when running locally, some of the canvas functions are messing with the same origin policies.
		//
		try{
			this.src.toDataURL();
		} catch(e){
			this.$displayCnv.hide();
			return false;
		}
		var hData = null;
		if (this.type == 'grayscale')
			hData = getGrayscaleHistogramFromCanvas(this.src);
		else
			hData = getRGBHistogramFromCanvas(this.src);

		var buf = this.$bufferCnv.get(0);
		var destCnv = this.$displayCnv.get(0);

		// clear the display canvas
		destCnv.getContext('2d').fillRect(0, 0, this.$displayCnv.get(0).width, this.$displayCnv.get(0).height);

		//clear datasets
		this.config.data.datasets = [];

		//add new datasets
		if (this.type == 'grayscale'){
            var newDataset = {
                //label: this.theLabels,
                backgroundColor: this.gsFillColor,
                borderColor: this.gsLineColor,
				borderWidth: 1,
				pointRadius: 0,
                data: hData,
                //fill: false
            };

            this.config.data.datasets.push(newDataset);
            this.ChartLines.update();
		}
		else if (this.type == 'rgb'){
			var newDataset = {
				//label: this.theLabels,
				backgroundColor: this.rgbFillColor[0],
				borderColor: this.rgbLineColor[0],
				borderWidth: 1,
				pointRadius: 0,
				data: hData[0]
			};
			this.config.data.datasets.push(newDataset);

			var newDataset = {
				//label: this.theLabels,
				backgroundColor: this.rgbFillColor[1],
				borderColor: this.rgbLineColor[1],
				borderWidth: 1,
				pointRadius: 0,
				data: hData[1]
			};
			this.config.data.datasets.push(newDataset);

			var newDataset = {
				//label: this.theLabels,
				backgroundColor: this.rgbFillColor[2],
				borderColor: this.rgbLineColor[2],
				borderWidth: 1,
				pointRadius: 0,
				data: hData[2]
			};
			this.config.data.datasets.push(newDataset);

			this.ChartLines.update();
		}
	},
	hide: function(){
		this.$displayCnv.hide();
	},
	show: function(){
		this.$displayCnv.show();
	}
	});
