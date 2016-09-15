(function(){
/**
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @PIXI v4 ONLY
 * version: 1.1
 * mobile: supported
 * require: Hammer JS
 */

function TransformTool(params)
{
    PIXI.Container.call(this);
    
    this.name = "TransformTool";
    this.interactive = true;
    this.buttonMode = true;

    this.corners = [];

    this.canvas = (params && (typeof params.canvas != "undefined")) ? params.canvas : null;

    this.SCALE_BY_RATIO 			= 	(params && (typeof params.scaleByRatio != "undefined")) ? params.scaleByRatio : false;
    this.DEBUGGING 					= 	(params && (typeof params.debug != "undefined")) ? params.debug : false;
    this.LOCK_REGISTRATION_POINT 	= 	(params && (typeof params.lockReg != "undefined")) ? params.lockReg : false;
    this.CTRL_HOLD					=	(this.LOCK_REGISTRATION_POINT) ? true : false;
    this.CONTROL_SIZE				=	(params && (typeof params.controlSize != "undefined")) ? params.controlSize : 5;
    this.RELATIVE_SCALE				=	(params && (typeof params.relativeScale != "undefined")) ? params.relativeScale : 1;
    this.SHOW_BORDER				=	(params && (typeof params.border != "undefined")) ? params.border : false;
    //this.UNSELECTABLE 			= 	(params && params.unselectable) ? params.unselectable : false;
    
    // events

    this.ON_CHANGE_CALLBACK = null;

    var scope = this;
    var tool = this;

    //console.log(GDevice.type)
    if(this.canvas && GDevice.type != "desktop")
    {
    	//$(".log").html("init hammer");

	    this.hammer = new Hammer(this.canvas);
	    this.hammer.get('pinch').set({ enable: true });
        this.hammer.get('rotate').set({ enable: true });

        var pinch = new Hammer.Pinch();
		var rotate = new Hammer.Rotate();

		// we want to detect both the same time
		pinch.recognizeWith(rotate);

		// add to the Manager
		this.hammer.add([pinch, rotate]);

		var targetPinchScale = 1;
		var startPinchScale = 1;
		var changedPinchScale = 0;
		var touchPos = {x:0, y:0};
		var startPos = {x:0, y:0};
		
		this.hammer.on("pinchstart", function(e){
			//$(".log").html(e.type);
			startPinchScale = e.scale;
			touchPos = {
				x: e.center.x - $(scope.canvas).offset().left,
				y: e.center.y - $(scope.canvas).offset().top
			}
			touchPos.x /= scope.RELATIVE_SCALE;
			touchPos.y /= scope.RELATIVE_SCALE;
			startPos = {x:scope.target.x, y:scope.target.y};
		})
		this.hammer.on("pinchmove", function(e){
			//$(".log").html(e.type);
			changedPinchScale = e.scale - startPinchScale;
    		if(scope.target){
    			scope.target.scale.x = scope.target.scale.y = targetPinchScale + changedPinchScale;
    			scope._positionControls();
    		}

    		//$(".log").html(e.center.x)
    		var localMouse = {
    			x: e.center.x - $(scope.canvas).offset().left,
    			y: e.center.y - $(scope.canvas).offset().top
    		}
    		localMouse.x /= scope.RELATIVE_SCALE;
			localMouse.y /= scope.RELATIVE_SCALE;

    		var rangePos = {x:localMouse.x - touchPos.x, y:localMouse.y - touchPos.y}
    		tool.target.position.x = startPos.x + rangePos.x;
			tool.target.position.y = startPos.y + rangePos.y;
			tool.translateLayer.x = tool.target.x;
			tool.translateLayer.y = tool.target.y;
		})

		var targetPinchRotate = 1;
		var startPinchRotate = 1;
		var changedPinchRotate = 0;

		this.hammer.on("rotatestart", function(e){
			//$(".log").html(e.scale);
			startPinchRotate = GMath.degToRad(e.rotation);
		    targetPinchRotate = scope.target.rotation;
		})
		this.hammer.on("rotatemove", function(e){
			//$(".log").html(e.type);
			//$(".log").html(e.scale);
			changedPinchRotate = GMath.degToRad(e.rotation) - startPinchRotate;
    		if(scope.target){
    			scope.target.rotation = targetPinchRotate + changedPinchRotate;
    			scope.rotateLayer.rotation = scope.target.rotation;
    			scope._positionControls();
    		}
		})

		this.hammer.on("pan", function(e) {
		    //$(".log").html(e.type);
		    //$(".log").html(e.distance);
		    //$(".log").html(e.scale);
		    //console.log(e);
		});

		$(this.canvas).on("touchstart", function(e){
			targetPinchScale = scope.target.scale.x;
			targetPinchRotate = scope.target.rotation;
		})
	} else {
		console.log("[TransformTool] Can't setup touch manager because canvas parameter is missed.");
	}

    var scope = this;

    $(window).keydown(function(e) {
    	//console.log(e.which)
    	if(e.which == 16){
    		scope.SCALE_BY_RATIO = true;
    	}
    	if(!scope.LOCK_REGISTRATION_POINT)
    	{
	    	if(e.which == 91){
	    		scope.CTRL_HOLD = true;
	    	}
    	}
    });
    $(window).keyup(function(e) {
    	if(e.which == 16){
    		scope.SCALE_BY_RATIO = false;
    	}
    	if(!scope.LOCK_REGISTRATION_POINT)
    	{
	    	if(e.which == 91){
	    		scope.CTRL_HOLD = false;
	    	}
	    }
    });

    // invisible at first

    this.visible = false;
}

TransformTool.prototype = Object.create(PIXI.Container.prototype);
TransformTool.prototype.constructor = TransformTool;

// == CLEAR ==
TransformTool.prototype.clear = function () {
    for(var i=0; i<this.children.length; i++){
		var item = this.children[i];
		this.removeChild(item);
		item.destroy();
		item = null;
	}
	this.target = null;

	this.visible = false;
};

// == APPLY ==
TransformTool.prototype.apply = function(target){
	var scope = this;

	if(scope.DEBUGGING) console.log("[TransformTool] Apply");

	this.clear();
	this.clear();
	this.target = target;
	GPixi.moveToTop(this);
	//GPixi.moveToBottom(this);

	target.originalSize = {width: target.width / target.scale.x, height: target.height / target.scale.y}	
	
	if(scope.DEBUGGING) console.log("target.originalSize:", target.originalSize);
	if(scope.DEBUGGING) console.log("target.pivot:", target.pivot.x , "x" , target.pivot.y);
	if(scope.DEBUGGING) if(target.anchor) console.log("target.anchor:", target.anchor.x , "x" , target.anchor.y);
	if(scope.DEBUGGING) console.log("target.size:", target.width , "x" , target.height);

	// reset anchor - make sure target & anchor always the same
	if(target.anchor && !target.ignoreResetAnchor){
		if(target.anchor.x != target.pivot.x/target.originalSize.width && 
			target.anchor.y != target.pivot.y/target.originalSize.height)
		{
			target.anchor.x = target.pivot.x/target.originalSize.width;
			target.anchor.y = target.pivot.y/target.originalSize.height;

			target.ignoreResetAnchor = true;
		}
	}
	
	// !! use my pivot percent !!
	GPixi.usePivotPercent(target);
	
	var ghostLayer = new PIXI.Graphics();
	if(scope.DEBUGGING)
	{
		ghostLayer.beginFill(0xFFFF00, 0.2);
	} else {
		ghostLayer.beginFill(0xFFFF00, 0.0);
	}
	
	if(scope.SHOW_BORDER){
		ghostLayer.lineStyle(1, 0x000000, 0.8);
	}

	ghostLayer.drawRect(0, 0, target.originalSize.width, target.originalSize.height);
	
	// registration point
	var registrationControl = new PIXI.Graphics();
	registrationControl.lineStyle(1, 0x000000, 1);
	registrationControl.beginFill(0xFFFFFF, 1); // xanh dương
	registrationControl.drawCircle(0,0, scope.CONTROL_SIZE / scope.RELATIVE_SCALE);

	var registrationLayer = new PIXI.Container();
	registrationLayer.ghostLayer = ghostLayer;
	registrationLayer.addChild(ghostLayer);
	registrationLayer.addChild(registrationControl);

	// scale
	var scaleControl = new PIXI.Container();

	var scaleLayer = new PIXI.Container();
	
	for(var i=0; i<4; i++){
		var p = new PIXI.Graphics();
		p.lineStyle(1, 0x000000, 1);
		p.beginFill(0xFFFFFF, 1); // trắng
		p.drawRect(0,0,scope.CONTROL_SIZE*2 / scope.RELATIVE_SCALE, scope.CONTROL_SIZE*2 / scope.RELATIVE_SCALE);
		p.pivot.set(scope.CONTROL_SIZE / scope.RELATIVE_SCALE, scope.CONTROL_SIZE / scope.RELATIVE_SCALE);
		p.id = i;

		scaleControl["p"+i] = p;
		scaleControl.addChild(p);

		if(i==0) p.position.set(-target.width*target.pivotPercent.x, -target.height*target.pivotPercent.y);
		if(i==1) p.position.set(target.width*(1-target.pivotPercent.x), -target.height*target.pivotPercent.y);
		if(i==2) p.position.set(target.width*(1-target.pivotPercent.x), target.height*(1-target.pivotPercent.y));
		if(i==3) p.position.set(-target.width*target.pivotPercent.x, target.height*(1-target.pivotPercent.y));
		
	}

	scaleLayer.addChild(registrationLayer);

	// rotate
	var rotateControl = new PIXI.Graphics();
	rotateControl.lineStyle(1, 0x000000, 1);
	rotateControl.beginFill(0xFFFF00, 1); //vàng
	rotateControl.drawCircle(0,0,scope.CONTROL_SIZE / scope.RELATIVE_SCALE);
	rotateControl.name = "rotateControl1";

	var rotateControl2 = new PIXI.Graphics();
	rotateControl2.lineStyle(1, 0x000000, 1);
	rotateControl2.beginFill(0xFFFF00, 1); //vàng
	rotateControl2.drawCircle(0,0,scope.CONTROL_SIZE / scope.RELATIVE_SCALE);
	rotateControl2.name = "rotateControl2";

	var rotateControl3 = new PIXI.Graphics();
	rotateControl3.lineStyle(1, 0x000000, 1);
	rotateControl3.beginFill(0xFFFF00, 1); //vàng
	rotateControl3.drawCircle(0,0,scope.CONTROL_SIZE / scope.RELATIVE_SCALE);
	rotateControl3.name = "rotateControl3";

	var rotateControl4 = new PIXI.Graphics();
	rotateControl4.lineStyle(1, 0x000000, 1);
	rotateControl4.beginFill(0xFFFF00, 1); //vàng
	rotateControl4.drawCircle(0,0,scope.CONTROL_SIZE / scope.RELATIVE_SCALE);
	rotateControl4.name = "rotateControl4";

	var rotateLayer = new PIXI.Container();
	rotateLayer.addChild(scaleLayer);
	rotateLayer.addChild(scaleControl);
	rotateLayer.addChild(rotateControl);
	rotateLayer.addChild(rotateControl2);
	rotateLayer.addChild(rotateControl3);
	rotateLayer.addChild(rotateControl4);

	// translate 
	var translateControl = new PIXI.Graphics();
	translateControl.lineStyle(1, 0x000000, 1);
	translateControl.beginFill(0xFF0000, 1); // đỏ
	translateControl.drawCircle(0,0,scope.CONTROL_SIZE / scope.RELATIVE_SCALE);

	var translateLayer = new PIXI.Container();
	translateLayer.addChild(rotateLayer);
	
	this.addChild(translateLayer);

	this.registrationControl = registrationControl;
	this.scaleControl = scaleControl;
	this.rotateControl = rotateControl;
	this.rotateControl2 = rotateControl2;
	this.rotateControl3 = rotateControl3;
	this.rotateControl4 = rotateControl4;

	this.ghostLayer = ghostLayer;
	this.registrationLayer = registrationLayer;
	this.scaleLayer = scaleLayer;
	this.rotateLayer = rotateLayer;
	this.translateLayer = translateLayer;

	// copy transform:

	translateLayer.position = target.position;
	rotateLayer.rotation = target.rotation;
	scaleLayer.scale = target.scale;
	ghostLayer.position.x = -target.originalSize.width * target.pivotPercent.x;
	ghostLayer.position.y = -target.originalSize.height * target.pivotPercent.y;

	// position controls:

	this._positionControls();
	
	if(this.LOCK_REGISTRATION_POINT){
		registrationControl.visible = false;
	}
	
	if(GDevice.type != "desktop"){
		//scaleControl.visible = false;
		rotateControl.visible = false;
		rotateControl2.visible = false;
		rotateControl3.visible = false;
		rotateControl4.visible = false;
		registrationControl.visible = false;
	}

	//scaleControl.visible = false;
	//rotateControl.visible = false;
	translateControl.visible = false;

	//scaleControl.position.x = scaleLayer.width * (1-target.anchor.x);
	//scaleControl.position.y = scaleLayer.height * (1-target.anchor.y);

	// bind events:

	if(GDevice.type == "desktop")
	{
		for(i=0; i<4; i++){
			var p = scaleControl["p"+i];
			this._addDragScale(p);
		}
		this._addDragRegistration(registrationControl);
		//this._addDragScale(scaleControl);
		this._addDragRotate(rotateControl);
		this._addDragRotate(rotateControl2);
		this._addDragRotate(rotateControl3);
		this._addDragRotate(rotateControl4);
	}

	this._addDragTranslate(ghostLayer);
	
	// show tool:

	this.visible = true;
}

// == EVENTS ==
TransformTool.prototype.on = function (eventName, callback) {
    var scope = this;

    if(eventName == "change")
    {
    	scope.ON_CHANGE_CALLBACK = callback;
    }
};

// == RESET ==
TransformTool.prototype.reset = function () {
    if(scope.DEBUGGING) console.log("[TransformTool] Reset");
    this.target = null;

};

TransformTool.prototype._positionControls = function() {
	var tool = this;
	var target = tool.target;

	//return;

	tool.scaleLayer.scale.x = target.scale.x;
	tool.scaleLayer.scale.y = target.scale.y;

	tool.translateLayer.x = target.x;
	tool.translateLayer.y = target.y;

	tool.ghostLayer.position.x = -target.originalSize.width * target.pivotPercent.x;
	tool.ghostLayer.position.y = -target.originalSize.height * target.pivotPercent.y;

	tool.registrationControl.position.x = tool.ghostLayer.position.x + tool.ghostLayer.width * target.pivotPercent.x;
	tool.registrationControl.position.y = tool.ghostLayer.position.y + tool.ghostLayer.height * target.pivotPercent.y;
	tool.registrationControl.scale.set(1/target.scale.x, 1/target.scale.y);

	for(var i=0; i<4; i++){
		var p = tool.scaleControl["p"+i];
		if(i==0) p.position.set(-target.width*target.pivotPercent.x, -target.height*target.pivotPercent.y);
		if(i==1) p.position.set(target.width*(1-target.pivotPercent.x), -target.height*target.pivotPercent.y);
		if(i==2) p.position.set(target.width*(1-target.pivotPercent.x), target.height*(1-target.pivotPercent.y));
		if(i==3) p.position.set(-target.width*target.pivotPercent.x, target.height*(1-target.pivotPercent.y));
		//p.scale.set(1/target.scale.x, 1/target.scale.y);
	}

	var newAnchor = {x: target.pivotPercent.x, y: target.pivotPercent.y}
	if(tool.DEBUGGING) console.log("newAnchor:",newAnchor);
	if(newAnchor.x < 0.05 && newAnchor.y < 0.05 && newAnchor.x > -0.1 && newAnchor.y > -0.1){
		tool.scaleControl.p0.visible = false;
	} else {
		tool.scaleControl.p0.visible = true;
	}

	if(newAnchor.x > 0.95 && newAnchor.y < 0.05 && newAnchor.x < 1.1 && newAnchor.y > -0.1){
		tool.scaleControl.p1.visible = false;
	} else {
		tool.scaleControl.p1.visible = true;
	}

	if(newAnchor.x > 0.95 && newAnchor.y > 0.95 && newAnchor.x < 1.1 && newAnchor.y > 0.9){
		tool.scaleControl.p2.visible = false;
	} else {
		tool.scaleControl.p2.visible = true;
	}

	if(newAnchor.x < 0.05 && newAnchor.y > 0.95 && newAnchor.x > -0.1 && newAnchor.y > 0.9){
		tool.scaleControl.p3.visible = false;
	} else {
		tool.scaleControl.p3.visible = true;
	}

	tool.rotateControl.position.x = -target.width * (target.pivotPercent.x) - 15;
	tool.rotateControl.position.y = target.height * -(target.pivotPercent.y) - 15;

	tool.rotateControl2.position.x = target.width * (1-target.pivotPercent.x) + 15;
	tool.rotateControl2.position.y = target.height * -(target.pivotPercent.y) - 15;

	tool.rotateControl3.position.x = target.width * (1-target.pivotPercent.x) + 15;
	tool.rotateControl3.position.y = target.height * (1-target.pivotPercent.y) + 15;

	tool.rotateControl4.position.x = -target.width * (target.pivotPercent.x) - 15;
	tool.rotateControl4.position.y = target.height * (1-target.pivotPercent.y) + 15;
}

TransformTool.prototype._setRegistrationPoint = function(x,y){ // 0 - 1
	var tool = this;
	var target = tool.target;

	var registrationControl = tool.registrationControl;
	registrationControl.x = tool.ghostLayer.x + target.originalSize.width * x;
	registrationControl.y = tool.ghostLayer.y + target.originalSize.height * y;
	
	//GPixi.setAnchor(target, x, y);
	//target.pivotPercent.set(x, y);
	GPixi.setPivotPercentWithoutMoving(target, x, y);

	tool._positionControls();
}

TransformTool.prototype._changeAnchor = function(x,y){
	var tool = this;
	var target = tool.target;

	//GPixi.setAnchor(target, x, y);
	//target.pivotPercent.set(x, y);
	GPixi.setPivotPercentWithoutMoving(target, x, y);

	tool._positionControls();
}

// == DRAG REGISTRATION POINT ==
TransformTool.prototype._addDragRegistration = function(item) {
	if(this.DEBUGGING) console.log("[TransformTool] _addDragRegistration: " + this.name);
	
	var dragRange = {};
	var innerMousePosition = {};
	var tool = this;
	var offsetRotation = 0;
	var targetStartPostition = {}
	var targetEndPostition = {}
	var newAnchor;
	
	item.interactive = true;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);

    function onDown(e){
    	targetStartPostition = tool.target.position;

		/*dragRange.x = (e.data.getLocalPosition(tool.target.parent).x - targetStartPostition.x);
		dragRange.y = (e.data.getLocalPosition(tool.target.parent).y - targetStartPostition.y);

		var mousePosition = e.data.getLocalPosition(this.parent);
		this.position = mousePosition;*/

		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    //console.log("start drag: " + this.name)
	    return true;
	}

	function onUp(e){
		//console.log('reg end drag')
		this.off('mousemove', onMove)
	    this.off('touchmove', onMove)

	    tool._setRegistrationPoint(newAnchor.x, newAnchor.y);
	    //GPixi.setPivotPercentWithoutMoving(tool.target, newAnchor.x, newAnchor.y);

	    /*dragRange.x = (e.data.getLocalPosition(tool.target.parent).x - targetStartPostition.x);
		dragRange.y = (e.data.getLocalPosition(tool.target.parent).y - targetStartPostition.y);

	    var mousePosition = e.data.getLocalPosition(this.parent);
	    var target = tool.target;

	    target.position.x += dragRange.x;
	    target.position.y += dragRange.y;

		if(target instanceof PIXI.Sprite){
			target.anchor = newAnchor;
		} else {
			target.pivot = mousePosition;
			target.anchor = newAnchor;
		}

		tool._positionControls();*/

		return true;
	}

	function onMove(e){

		var mousePosition = e.data.getLocalPosition(this.parent);
		this.position = mousePosition;
		//console.log("mousePosition: ", mousePosition);
		var target = tool.target;

		newAnchor = {
			x: (this.position.x - tool.ghostLayer.position.x) / target.originalSize.width, 
			y: (this.position.y - tool.ghostLayer.position.y) / target.originalSize.height
		}
		//console.log(target instanceof PIXI.Sprite)
		if(tool.DEBUGGING) console.log("newAnchor: ", newAnchor);

		if(newAnchor.x < 0.05 && newAnchor.y < 0.05 && newAnchor.x > -0.1 && newAnchor.y > -0.1){
			tool.scaleControl.p0.visible = false;
		} else {
			tool.scaleControl.p0.visible = true;
		}

		if(newAnchor.x > 0.95 && newAnchor.y < 0.05 && newAnchor.x < 1.1 && newAnchor.y > -0.1){
			tool.scaleControl.p1.visible = false;
		} else {
			tool.scaleControl.p1.visible = true;
		}

		if(newAnchor.x > 0.95 && newAnchor.y > 0.95 && newAnchor.x < 1.1 && newAnchor.y > 0.9){
			tool.scaleControl.p2.visible = false;
		} else {
			tool.scaleControl.p2.visible = true;
		}

		if(newAnchor.x < 0.05 && newAnchor.y > 0.95 && newAnchor.x > -0.1 && newAnchor.y > 0.9){
			tool.scaleControl.p3.visible = false;
		} else {
			tool.scaleControl.p3.visible = true;
		}

		return true;
	}
};

// == DRAG ROTATE ==
TransformTool.prototype._addDragRotate = function(item) {
	var scope = this;
	var dragRange = {};
	var innerMousePosition = {};
	var tool = this;
	var offsetRotation = 0;
	var curRotation;

	if(scope.DEBUGGING) console.log("[TransformTool] _addDragRotate:", item.name);

	item.interactive = true;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);

    function onDown(e){
		dragRange = innerMousePosition = e.data.getLocalPosition(this);

		var position = e.data.getLocalPosition(tool.rotateLayer.parent);

		offsetRotation = GMath.angleRadBetween2Points(position, {x:0,y:0});
		curRotation = tool.target.rotation;

		if(scope.DEBUGGING) console.log(this.name);
		
		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    //console.log("start drag: " + this.name)
	    return true;
	}

	function onUp(e){
		//console.log('end drag')
		this.off('mousemove', onMove)
	    this.off('touchmove', onMove)
	    
	    return true;
	}

	function onMove(e){
		var position = e.data.getLocalPosition(tool.rotateLayer.parent);
		var rotate = GMath.angleRadBetween2Points(position, {x:0,y:0});
		var rangeRotate = rotate - offsetRotation;

		tool.target.rotation = curRotation + rangeRotate;
		tool.rotateLayer.rotation = tool.target.rotation;

		if(tool.ON_CHANGE_CALLBACK) tool.ON_CHANGE_CALLBACK();
		
		return true;
	}
};
// == DRAG TRANSLATE ==
TransformTool.prototype._addDragTranslate = function(item) {
	var dragRange = {};
	var innerMousePosition = {};
	var tool = this;
	var scope = this;
	var startPos = {}
	var touchPos = {};

	if(scope.DEBUGGING) console.log("[TransformTool] _addDragTranslate");

	item.interactive = true;
	item.buttonMode = true;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);
    //item.on('mousemove', onMove);
	//item.on('touchmove', onMove);

    function onDown(e){
    	startPos = {x: tool.target.x, y: tool.target.y}
		touchPos = e.data.getLocalPosition(tool.target.parent);

		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    return true;
	}

	function onUp(e){
		//console.log('end drag')
		this.off('mousemove', onMove);
	    this.off('touchmove', onMove);
	    
	    return true;
	}

	function onMove(e){
		console.log(e.data);
		//$(".log").html(e.data.originalEvent.touches.length);
		//$(".log").html(e.data.originalEvent.changedTouches.length);
		var isMultiTouch = (typeof e.data.originalEvent.touches != "undefined" && e.data.originalEvent.touches.length > 1);
		if(isMultiTouch){
			return;
		}

		var position = e.data.getLocalPosition(tool.target.parent);
		var rangePos = {x:position.x - touchPos.x, y:position.y - touchPos.y}

		tool.target.position.x = startPos.x + rangePos.x;
		tool.target.position.y = startPos.y + rangePos.y;
		tool.translateLayer.x = tool.target.x;
		tool.translateLayer.y = tool.target.y;
		//tool._positionControls();

		if(tool.ON_CHANGE_CALLBACK) tool.ON_CHANGE_CALLBACK();

		return true;
	}
};
// == DRAG SCALE ==
TransformTool.prototype._addDragScale = function(item) {
	var scope = this;
	var dragRange = {};
	var innerMousePosition = {};
	var tool = this;
	var touchPos = 0;
	var startScale = 0;
	var curAnchor;
	var newAnchor;
	var curScale = {};

	if(scope.DEBUGGING) console.log("[TransformTool] _addDragScale: " + this.name);

	item.interactive = true;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);

    function onDown(e){
		var mousePosition = e.data.getLocalPosition(this.parent);

		touchPos = e.data.getLocalPosition(tool.target.parent);
		startScale = {x: tool.target.scale.x, y: tool.target.scale.y}
		curAnchor = {x:tool.target.pivotPercent.x, y: tool.target.pivotPercent.y};
		if(scope.DEBUGGING) console.log("curAnchor: ", curAnchor);

		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    //console.log("start drag: " + this.name)
	    return true;
	}

	function onUp(e){
		//console.log('end drag');
		this.off('mousemove', onMove)
	    this.off('touchmove', onMove)

	    //tool._changeAnchor(curAnchor.x, curAnchor.y);
	    
	    return true;
	}

	function onMove(e){
		var target = tool.target;
		var mousePosition = e.data.getLocalPosition(this.parent);
		this.position = mousePosition;

		var p0 = tool.scaleControl.p0;
		var p1 = tool.scaleControl.p1;
		var p2 = tool.scaleControl.p2;
		var p3 = tool.scaleControl.p3;
		
		if(this.id == 0){
			p3.position.x = this.position.x;
			p1.position.y = this.position.y;
		}
		if(this.id == 1){
			p2.position.x = this.position.x;
			p0.position.y = this.position.y;
		}
		if(this.id == 2){
			p1.position.x = this.position.x;
			p3.position.y = this.position.y;
		}
		if(this.id == 3){
			p0.position.x = this.position.x;
			p2.position.y = this.position.y;
		}
		
		var w = p2.position.x - p0.position.x;
		var h = p2.position.y - p0.position.y;
		
		var newScaleX = 1 * w / target.originalSize.width;
		var newScaleY = 1 * h / target.originalSize.height;
		var changeScaleX = newScaleX - startScale.x;
		var changeScaleY = startScale.y * changeScaleX/startScale.x;

		if(tool.SCALE_BY_RATIO){
			newScaleY = startScale.y + changeScaleY;
		}

		// temporary anchor for resizing:
		if(this.id == 0) newAnchor = {x:1,y:1};
		if(this.id == 1) newAnchor = {x:0,y:1};
		if(this.id == 2) newAnchor = {x:0,y:0};
		if(this.id == 3) newAnchor = {x:1,y:0};
		//newAnchor = {x:0.5, y:0.5};

		if(!tool.CTRL_HOLD){
			tool._setRegistrationPoint(newAnchor.x, newAnchor.y);
		}
		
		//GPixi.setAnchor(target, newAnchor.x, newAnchor.y);
		
		//console.log(target.pivot);
		//console.log(w,h);
		//target.width = w;
		//target.height = h;
		target.scale.set(newScaleX, newScaleY);

		//console.log(curAnchor);
		//GPixi.setAnchor(target, curAnchor.x, curAnchor.y);
		tool._setRegistrationPoint(curAnchor.x, curAnchor.y);

		//tool._positionControls();

		if(tool.ON_CHANGE_CALLBACK) tool.ON_CHANGE_CALLBACK();
		
		return true;
	}
};

// == CORNERS DRAG ==
TransformTool.prototype._addCornerDrag = function(item) {
	//console.log("[TransformTool] _addCornerDrag: " + this.name);
	var dragRange = {};
	var tool = this;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);

    function onDown(e){
		dragRange = e.data.getLocalPosition(this);

		var position = e.data.getLocalPosition(this.parent);

		position.x -= dragRange.x;
		position.y -= dragRange.y;
		this.position = position;
		//onMove(e);

		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    //console.log("start drag: " + this.name)
	    return true;
	}

	function onUp(e){
		if(tool.DEBUGGING) console.log('end drag')
		this.off('mousemove', onMove)
	    this.off('touchmove', onMove)
	    
	    return true;
	}

	function onMove(e){
		var position = e.data.getLocalPosition(this.parent);

		position.x -= dragRange.x;
		position.y -= dragRange.y;

		if(this.id != 1 && this.id != 5)
		{
			this.position.x = position.x;
		}
		if(this.id != 3 && this.id != 7)
		{
			this.position.y = position.y;
		}

		if(this.id == 0){
			tool.corners[1].position.y = tool.corners[2].position.y = this.position.y;
			tool.corners[7].position.x = tool.corners[6].position.x = this.position.x;
		}
		if(this.id == 1){
			tool.corners[0].position.y = tool.corners[2].position.y = this.position.y;
		}
		if(this.id == 2){
			tool.corners[3].position.x = tool.corners[4].position.x = this.position.x;
			tool.corners[0].position.y = tool.corners[1].position.y = this.position.y;
		}
		if(this.id == 3){
			tool.corners[2].position.x = tool.corners[4].position.x = this.position.x;
		}
		if(this.id == 4){
			tool.corners[2].position.x = tool.corners[3].position.x = this.position.x;
			tool.corners[5].position.y = tool.corners[6].position.y = this.position.y;
		}
		if(this.id == 5){
			tool.corners[4].position.y = tool.corners[6].position.y = this.position.y;
		}
		if(this.id == 6){
			tool.corners[0].position.x = tool.corners[7].position.x = this.position.x;
			tool.corners[4].position.y = tool.corners[5].position.y = this.position.y;
		}
		if(this.id == 7){
			tool.corners[0].position.x = tool.corners[6].position.x = this.position.x;
		}

		var w = tool.corners[4].position.x - tool.corners[0].position.x;
		var h = tool.corners[4].position.y - tool.corners[0].position.y;

		//tool.moveLayer.clear();
		//tool.moveLayer.beginFill(0xFFFF00, 0.5);
		//tool.moveLayer.drawRect(0, 0, w, h);

		tool.corners[1].position.x = tool.corners[5].position.x = tool.corners[0].position.x + w/2;
		tool.corners[3].position.y = tool.corners[7].position.y = tool.corners[0].position.y + h/2;

		tool.moveLayer.position.x = tool.corners[0].position.x;
		tool.moveLayer.position.y = tool.corners[0].position.y;
		tool.moveLayer.layer.width = w;
		tool.moveLayer.layer.height = h;

		tool.target.position = tool.corners[0].position;
		//tool.target.width = w;
		//tool.target.height = h;
		var newScaleX = w/tool.target.originalSize.width;
		var newScaleY = h/tool.target.originalSize.height;
		tool.target.scale.set(newScaleX, newScaleY)
		//console.log(w+"x"+h);
		//console.log(tool.target.scale.x +"x"+ tool.target.scale.y);

		tool.positionCorner();

		//console.log('moving: ' + position.x + " x " + position.y);

		return true;
	}
};

// == TOOL DRAG ==
TransformTool.prototype._addDrag = function(item) {
	//console.log("[TransformTool] _addDrag: " + this.name);
	var dragRange = null;
	var tool = this;

    item.on('mousedown', onDown);
    item.on('touchstart', onDown);
    item.on('mouseup', onUp);
    item.on('touchend', onUp);
    item.on('mouseupoutside', onUp);
    item.on('touchendoutside', onUp);
    item.on('mousemove', onMove);
	item.on('touchmove', onMove);

    function onDown(e){
		dragRange = e.data.getLocalPosition(this);
		//console.log(dragRange.x, dragRange.y)
		var position = e.data.getLocalPosition(this.parent);
		//console.log(position.x,position.y)
		position.x -= dragRange.x;
		position.y -= dragRange.y;
		this.position = position;
		
		this.on('mousemove', onMove)
	    this.on('touchmove', onMove)

	    //console.log("start drag: " + this.name)
	    return true;
	}

	function onUp(e){
		//console.log('end drag');
		this.off('mousemove', onMove)
	    this.off('touchmove', onMove)
	    
	    return true;
	}

	function onMove(e){
		if(!dragRange)
		{
			dragRange = e.data.getLocalPosition(this);
		}
		var position = e.data.getLocalPosition(this.parent);

		position.x -= dragRange.x;
		position.y -= dragRange.y;
		this.position = position;

		tool.target.position = this.position;
		tool.rotateLayer.position = this.position;

		tool.positionCorner();
		//console.log('moving: ' + position.x + " x " + position.y);

		return true;
	}
};

TransformTool.prototype.positionCorner = function(){
	//var target = this.target;
	var target = this.moveLayer;
	var tool = this;
	if(target){
		var w = target.layer.width;//tool.corners[4].position.x - tool.corners[0].position.x;
		var h = target.layer.height;//tool.corners[4].position.y - tool.corners[0].position.y;

		this.corners[0].position.set(target.position.x, target.position.y);
		this.corners[1].position.set(target.position.x+w/2, target.position.y);
		this.corners[2].position.set(target.position.x+w, target.position.y);
		this.corners[3].position.set(target.position.x+w, target.position.y+h/2);
		this.corners[4].position.set(target.position.x+w, target.position.y+h);
		this.corners[5].position.set(target.position.x+w/2, target.position.y+h);
		this.corners[6].position.set(target.position.x, target.position.y+h);
		this.corners[7].position.set(target.position.x, target.position.y+h/2);

		tool.rotateLayer.pivotCorner.x = w/2;
		tool.rotateLayer.pivotCorner.y = h/2;
	}
}

PIXI.TransformTool = TransformTool;

}).call(this);