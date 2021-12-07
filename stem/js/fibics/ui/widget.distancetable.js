TDistanceTableWidget = TBaseWidget.extend({
	init: function(pAppsC){
		this._super(pAppsC)
		this.ATLASViewportController = pAppsC.ATLASViewportController;
		
		this.icone = 'distance_table_3x3_inv.png';
		this.title = _e('distancetable');
		this.hint = _e('distancetable');
		this.id = 'DistanceTableWidget';
		this.buildHTML();	
		this.rebuildNeeded = false;

		var me = this;		
		this.hoverWP1 = null;
		this.hoverWP2 = null;		
		this.registerEvents();
		this.$panel.on('onShowPanel', function(){
			me.buildDistanceTable();																		 
		});
		// a list of objects that tells if the waypoint has changed.
		this.changeCountTrackerList = new Array();
		// a timer for the update rates of the distance table
		this.interval = setInterval( function(){
					var i = 0;
					
					// check if there is too many waypoint
					if(me.rebuildNeeded){
						me.buildDistanceTable();	
					}
					
					while (i < me.changeCountTrackerList.length) {
						if(me.changeCountTrackerList[i].hasChanged()){
							var aWP = me.changeCountTrackerList[i].changeCountedObj;
							me.$panel.find('#distanceTable').find('td[WPID1='  +  aWP.uid +']').each(function(i){
								var WPID2 = $(this).attr('WPID2');
								var WP2 = me.appController.waypointController.getWaypointWithID(WPID2);
								if(WP2 != null){
									d = WP2.pt.distanceTo(aWP.pt);
									$(this).html(d.toFixed(2));	
								}
								
							});
							me.$panel.find('#distanceTable').find('td[WPID2='  +  aWP.uid +']').each(function(i){
								var WPID1 = $(this).attr('WPID1');
								var WP1 = me.appController.waypointController.getWaypointWithID(WPID1);
								if (WP1 != null){
									d = WP1.pt.distanceTo(aWP.pt);
									$(this).html(d.toFixed(2));
								}
							});
							me.changeCountTrackerList[i].update();
						}
						i++;												
					}
				}, 1000) 
	},
	registerEvents: function(){
		var me = this;
		$(this.appController.waypointController).on('onAddWaypoint', function(e, WP){
			me.buildDistanceTable();		
			// add a tracker for that object
			me.changeCountTrackerList.push(new TChangedCountTracker(WP));			
		});	
		
		$(this.appController.waypointController).on('onDeleteWaypoint', function(e, WP){
			tWp = me.getTrackerFor(WP);
			me.changeCountTrackerList.removeItem(tWp);
			me.clearDistanceTable();
			me.rebuildNeeded = true;
		});	
		
		$(this.ATLASViewportController).on('onAddATLASViewport', function(e, AVP){
			$(AVP).on('onDraw', function(e, theVP){
				if((me.hoverWP1 == null) || (me.hoverWP2 == null)){
					return false;
				}
				
				var dP1 = AVP.pixelFromMicron(me.hoverWP1.pt);
				var dP2 = AVP.pixelFromMicron(me.hoverWP2.pt);
				AVP.ctx.beginPath();
				AVP.ctx.moveTo(dP1.x, dP1.y);
				AVP.ctx.lineTo(dP2.x, dP2.y);
				AVP.ctx.strokeStyle = '#00ff00';
				AVP.ctx.stroke();
				AVP.ctx.closePath();				
			});
		});	
		
		this.$panel.find('#distanceTable').on('mouseover', 'td', function(e){
			me.hoverWP1 = me.appController.waypointController.getWaypointWithID($(this).attr('WPID1'));
			me.hoverWP2 = me.appController.waypointController.getWaypointWithID($(this).attr('WPID2'));
			incDisplayChangeCount();
		});		
		this.$panel.find('#distanceTable').on('mouseout', 'td', function(e){
			me.hoverWP1 = null;
			me.hoverWP2 = null;
			incDisplayChangeCount();
		});
		
	},
	getTrackerFor: function(wp){
		for(var i = 0; i < this.changeCountTrackerList.length; i++){
			if(this.changeCountTrackerList[i].changeCountedObj.uid == wp.uid)
				return this.changeCountTrackerList[i];
		}	
	},
	buildHTML:function(){
		this._super();
		loadCSS('css/distancetable.css');	
		
		// Build the panel		
		this.$panelC.append($('<div></div>').html(_e('nowaypointsnodistances')).attr('id', 'distanceTableEmptyTableNotice'));
		this.$panelC.append($('<p></p>').html(_e('alldistancesareinmirons')).attr('id', 'distanceUnits').hide());
		this.$panelC.append($('<table></table>').attr('id', 'distanceTable'));
		this.$panelC.find('#distanceTable').append($('<tbody></tbody>'));
	},
	clearDistanceTable: function(){
		$('#distanceTable').children('tbody').html('');
		$('#distanceTableEmptyTableNotice').show();
	},
	buildDistanceTable: function(){
		
		if((this.appController.waypointController.waypointList.length == 0) 
			|| (this.appController.waypointController.waypointList.length == 1)) {
			$('#distanceTable').hide();
			$('#distanceTableEmptyTableNotice').show();
			$('#distanceUnits').hide();
			return null;
		};
		$('#distanceUnits').show();
		$('#distanceTable').show();
		$('#distanceTableEmptyTableNotice').hide();
		var j_table = $('#distanceTable').children('tbody');
		var i = 0;
		var j = 0;
		var currentPt;
		var aPt;
		var me = this;
		j_table.html('');
		j_table.append($("<tr></tr>").append($('<td></td>').html('&nbsp;')));
		var row_html = "<tr><td>&nbsp;</td>";
		// add the header
		$.each(
			me.appController.waypointController.waypointList,
			function( intIndex, aPt ){
				j_table.find('tr').append($('<td></td>').addClass('pointLabel pointLabelTop').attr('index', aPt.index).html(aPt.label));
		});
		
		var dist = 0;		
		//Loop for each row
		$.each(
			me.appController.waypointController.waypointList,
			function( i, currentPt ){
				j_table.append($("<tr></tr>"));
				var lastRow = j_table.find('tr:last').append($('<td></td>').addClass('pointLabel pointLabelLeft').attr('index', currentPt.index).html(currentPt.label));
				
				$.each(me.appController.waypointController.waypointList,
					function( j, aPt ){
						dist = currentPt.pt.distanceTo(aPt.pt);
						if((i == j)){
							lastRow.append($('<td></td>').addClass('nanDistance'));
						}
						else {
							lastRow.append($('<td></td>').attr('WPID1', aPt.uid).attr('WPID2', currentPt.uid).addClass('distance').html((dist).toFixed(2)));
						}
				});
			
		});	
		
		// Format Table
		j_table.find('tr:even').addClass('evenRow');
		j_table.find('tr:odd').addClass('oddRow');
		j_table.find('tr').find('td:first').addClass('pointLabel');
		j_table.find('tr:first').addClass('pointLabel');	
		
		me.$panel.css('left', -Math.max(((me.appController.waypointController.waypointList.length * 40) + 100), 300)+ 'px' );


		
	}
});