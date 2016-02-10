var init = function(){

	return {

		w:960,
		h:500,

		data_raw:[],
		data:[],

		ttime:300,

		colors:{
			0:'#F6FAAA',
			1:'#FDAE61',
			2:'#D53E4F'
		},

		getData:function(_callback){
			var self = vis;

			//d3.csv('data/sensors.csv',function(e,d){
			d3.json('data/sensors.json',function(e,d){
				self.data_raw = d;

				_callback();
			});
		},
		processData:function(){
			var self = vis;

			self.data_raw.forEach(function(d,i){
				var obj = {};
				obj.idx = i;
				obj.sensorID = d.sensorID;
				obj.status = parseInt(d.status);

				//current hack for dummy data
				if(d.log){
					obj.log = [];
					d.log.forEach(function(_d){
						var _obj = {};
						_obj.date = new Date(_d.date);
						_obj.temp_ext = _d.temp_ext;
						_obj.temp_int = _d.temp_int;
						obj.log.push(_obj);
					});
				}

				self.data.push(obj);
			});

			self.generate();
		},
		generate:function(){
			var self = vis;

			var numCols = 10;

			var margin = { top:50, right:2, bottom:100, left:2 },
				width = self.w -margin.left -margin.right,
				height = self.h -margin.top -margin.bottom,
				gridSize = (width/numCols);

				/*legendElementWidth = gridSize*2,
				buckets = 9,
				colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];*/ // alternatively colorbrewer.YlGnBu[9]

			self.svg = d3.select('#container').append('svg');
			self.overlay = d3.select('#overlay');

			self.logs = d3.select('#overlay #logs');
			self.xout = d3.select('#overlay #xout')
				.on('click',hideDetail);

			//date formatting
			var format = d3.time.format("%Y-%m-%d")

			function showDetail(_d){
				var logs;
				logs = self.logs.selectAll('li.log')
					.data(_d.log);
				logs.enter().append('li')
					.classed('log',true);
				logs
					.html(function(d){
						return format(d.date) + ': ' + d.temp_ext + '&deg; outside, ' + d.temp_int +'&deg; inside';
					});
				logs.exit().remove();

				self.overlay
					.transition()
					.duration(self.ttime)
					.style('opacity',0.95);
			}

			function hideDetail(){
				self.logs.html('');
				self.overlay
					.transition()
					.duration(self.ttime)
					.style('opacity',0);
			}

			var squaresG,
				squares,
				squareLabels;

			squaresG = self.svg.selectAll('g.squaresG')
				.data(self.data);
			squaresG.enter().append('g')
				.classed('squaresG',true);
			squaresG
				.attr('transform',function(d,i){
					var xpos = (i%numCols)*gridSize +margin.left,
						ypos = Math.floor(i/numCols)*gridSize +2;
					return 'translate(' +xpos +',' +ypos +')';
				});
			squaresG
				.on('click',function(d){
					if(d.log){
						showDetail(d);
					}
				});
			squaresG.exit().remove();

			squares = squaresG.selectAll('rect.squares')
				.data(function(d){ return [d]; });
			squares.enter().append('rect')
				.classed('squares',true);
			squares
				.attr('width',gridSize)
				.attr('height',gridSize)
				.attr('x',0)
				.attr('y',0)
				.style('rx',6)
				.transition()
				.delay(function(d){
					return (d.idx%numCols +Math.floor(d.idx/numCols)) *60;
				})
				.duration(300)
				.style('fill',function(d){
					return self.colors[d.status];
				});
			squares.exit().remove();

			squareLabels = squaresG.selectAll('text.squareLabels')
				.data(function(d){ return [d]; });
			squareLabels.enter().append('text')
				.classed('squareLabels',true);
			squareLabels
				.style('opacity',0)
				.attr('x',gridSize/2)
				.attr('y',gridSize/2 +7)
				.text(function(d){
					return d.sensorID;
				})
				.transition()
				.delay(function(d){
					return (d.idx%numCols +Math.floor(d.idx/numCols)) *60;
				})
				.duration(self.ttime)
				.style('opacity',1);
			squareLabels.exit().remove();
		}
	}
}

var vis = init();
vis.getData(vis.processData);