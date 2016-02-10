var init = function(){

	return {

		w:960,
		h:500,

		data_raw:[],
		data:[],

		colors:{
			0:'#F6FAAA',
			1:'#FDAE61',
			2:'#D53E4F'
		},

		getData:function(_callback){
			var self = vis;

			d3.csv('data/sensors.csv',function(e,d){
				self.data_raw = d;

				_callback();
			});
		},
		processData:function(){
			var self = vis;

			self.data_raw.forEach(function(d){
				var obj = {};
				obj.sensorId = d.sensorID;
				obj.status = parseInt(d.status);
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

			var squares = self.svg.selectAll('rect.squares')
				.data(self.data);
			squares.enter().append('rect')
				.classed('squares',true);
			squares
				.attr('width',gridSize)
				.attr('height',gridSize)
				.attr('x',function(d,i){
					return (i%numCols)*gridSize +margin.left;
				})
				.attr('y',function(d,i){
					return Math.floor(i/numCols)*gridSize +2;
				})
				.style('rx',6)
				.transition()
				.delay(function(d,i){
					return (i%numCols +Math.floor(i/numCols)) *60;
				})
				.duration(300)
				.style('fill',function(d){
					return self.colors[d.status];
				});
			squares.exit().remove();
		}
	}
}

var vis = init();
vis.getData(vis.processData);