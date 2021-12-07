// JavaScript Document
var TMeasurementSerializer = Class.extend({
	init: function(pMC){
		this.pMC = pMC;
	},
	saveToXML: function($parentNode){
		this.mNode = newXMLNode('Measurements');
		$parentNode.append($(this.mNode));
		var i = 0;
		while(i < this.pMC.measurementList.length){
			this.addMeasurementToXML(this.pMC.measurementList[i],this.mNode)	;
			i++;
		}
	},
	addMeasurementToXML: function(aM, parentNode){
		switch(aM.type){
			case TMeasurementType.line:
				n = newXMLNode('Line');
			break;
			case TMeasurementType.textannotation:
				n = newXMLNode('TextAnnotation');
			break;
			case TMeasurementType.horizontaltool:
				n = newXMLNode('LongMeasurement');
			break;
			case TMeasurementType.verticaltool:
				n = newXMLNode('LongMeasurement');
			break;
			case TMeasurementType.pointtopoint:
				n = newXMLNode('PointToPoint');
			break;
			case TMeasurementType.protractor:
				n = newXMLNode('Protractor');
			break;
			case TMeasurementType.ruler:
				n = newXMLNode('Ruler');
			break;
			case TMeasurementType.rectangulararea:
				n = newXMLNode('RectangularArea');
			break;
			case TMeasurementType.ellipticalarea:
				n = newXMLNode('EllipticalArea');
			break;
			case TMeasurementType.exporttopng:
				n = newXMLNode('ExportToPng');
			break;
			case TMeasurementType.line:
				n = newXMLNode('Line');
			break;
			case TMeasurementType.rectangleRegion:
				n = newXMLNode('RectangleRegion');
			break;
			case TMeasurementType.ellipseRegion:
				n = newXMLNode('EllipseRegion');
			break;
			case TMeasurementType.polygonRegion:
				n = newXMLNode('PolygonRegion');
			break;
			case TMeasurementType.polygonalArea:
				n = newXMLNode('PolygonalArea');
			break;
		}
		aM.toXML(n);
		n.appendTo(parentNode);
	},
	loadFromXML: function($xml){
		$ml = $xml.find('Measurements');
		var mSer = this;
		$ml.children().each(function(){
			var m = mSer.createMeasurementFromNode(this);
			m.fromXML($(this));
			mSer.pMC.addMeasurement(m);
		});
	},
	createMeasurementFromNode: function(n){
		$n = $(n);
		var newM = null;
		if(n.nodeName ==	'Line')
			newM = new TLine(new TAtlasPoint(0,0), new TAtlasPoint(0,0));
		else if(n.nodeName ==	'TextAnnotation')
			newM = new TTextAnnotation('', new TAtlasPoint(0,0));
		else if(n.nodeName ==	'LongMeasurement')
			newM = new TLongMeasurement(new TAtlasPoint(0,0), new TAtlasPoint(0,0));
		else if(n.nodeName ==	'PointToPoint')
			newM = new TSimpleMeasurement(new TAtlasPoint(0,0), new TAtlasPoint(0,0));
		else if(n.nodeName ==	'Protractor')
			newM = new TProtractor(0,0);
		else if(n.nodeName ==	'Ruler')
			newM = new TRuler(new TAtlasPoint(0,0), new TAtlasPoint(0,0));
		else if(n.nodeName ==	'RectangularArea')
			newM = new TRectangularArea(0,0,0,0);
		else if(n.nodeName ==	'EllipticalArea')
			newM = new TEllipticalArea(0,0,0,0);
		else if(n.nodeName ==	'ExportToPng')
			newM = new TExportToPNG(0,0,0,0);
		else if(n.nodeName ==	'RectangleRegion')
			newM = new TRectangleRegion(0,0,0,0);
		else if(n.nodeName ==	'EllipseRegion')
			newM = new TEllipseRegion(0,0,0,0);
		else if(n.nodeName ==	'PolygonalArea')
			newM = new TPolygonalArea();
		else if(n.nodeName ==	'PolygonRegion')
			newM = new TPolygonRegion();
		else if(n.nodeName ==	'Polygon')
			newM = new TPolygon();

		newM.state = TMeasurementState.idle;
		return newM;

	}
});
