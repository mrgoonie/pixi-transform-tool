/*
	[ GPIXI Plugins | Documentation ]
	+ Version: 1.4
	+ Created Date: August 14, 2016
	+ Modified Date: August 25, 2016
	+ Author: Duy Nguyen
	
	- GPixi.usePivotPercent(object) -> Point
	When this method called, you can use object.pivotPercent in range 0-1.
	object.pivotPercent = {x, y}

	- GPixi.setPivotPercent(object, x, y) -> Point
	Make sure GPixi.usePivotPercent(target) was called before using this method.
	Set the pivot point of object by percentage (0-1).

	- GPixi.setPivotPercentWithoutMoving(object, x, y)
	Make sure GPixi.usePivotPercent(target) was called before using this method.
	Set the pivot point of object by percentage (0-1) without moving the object.	

	- GPixi.setAnchor(target,x,y) -> null
	Reset the anchor point of display object (even non-sprite object), without change its position on the container.
	Return: no.

	- GPixi.getOriginalSize(target) -> {width,height}
	Get the original size of the display object (even it's scaled or rotated)
	Return: {width,height}

	- GPixi.createMovieClip(loaderTextureName, fromFrameIndex, toFrameIndex) -> PIXI.MovieClip
	Create a MovieClip from PNG spritesheets, which exported from Flash CC.
	Textures had been loaded in PIXI.loader

	- GPixi.remove(target) -> null
	Remove display object from its parent.

	- GPixi.removeItems(targetArray) -> null
	Remove an array of display objects from its parent.

	- GPixi.moveToTop(target) -> null
	Set zIndex of the display object to the highest depth & move it the top.

	- GPixi.moveToBottom(target) -> null
	Set zIndex of the display object to the lowest depth & move it the bottom.

	- GPixi.moveAboveItem(target, itemToLandOn) -> null
	Set zIndex of the display object ABOVE the given display object.
	
	- GPixi.moveBelowItem(target, itemToLandOn) -> null
	Set zIndex of the display object BELOW the given display object.

	- GPixi.swapIndex(item1, item2) -> null
	Simply swap zIndex & change depth between 2 display objects.

	- GPixi.textureFromLoader(name, loader) -> PIXI.Texture
	Simply return the texture has been loaded by a given loader.
	If loader isn't provided, it will try to get that texture from the Global PIXI.loader

	- GPixi.spriteFromTextureName(textureName, loader) -> PIXI.Sprite
	Simply create & return the PIXI.Sprite by a given texture name & loader (optional)
	If loader isn't provided, it will try to get that texture from the Global PIXI.loader

	- GPixi.addNewSpriteTo(newName, container, textureName, loader) -> PIXI.Sprite
	Simply create the PIXI.Sprite with a new name & add to the given container. 
	This sprite can be accessed by the container hierarchy. For example: var createdSprite = container.newName;
	Sprite texture will be got by its name & loader (optional)
	If loader isn't provided, it will try to get that texture from the Global PIXI.loader

	- GPixi.cloneSprite(sprite, copyProperties) -> PIXI.Sprite
	Clone the sprite & copy its properties (optional)

	- GPixi.copyProperties(target, fromObject) -> null

	- GPixi.copyPropertiesOf(target) -> Properties Object

	- GPixi.applyPropertiesTo(target, properties, excepts) -> Bool

	- GPixi.newButton(normalTextureName, params) -> PIXI.Container
	params: {hover: String, press: String} -> Name of the textures in loader
	Create a new button to interact with. Contains these methods:
		var btn = GPixi.newButton({normal: "btn-normal"});
		btn.changeState("hover"); <- force change button state to "hover"
		btn.buttonMode = false; <- disable button mode
		btn.interactive = false; <- disable interaction
		btn.setStateTexture("press", "btn-new-press") <- change texture of state

	- GPixi.onEnterFrame(object, callback) -> null
	- GPixi.onUpdate(object, callback) -> null
		(event.target = object)

	- GPixi.removeEnterFrame(object) -> null
	- GPixi.offUpdate(object) -> null

	- GPixi.removeAllEnterFrame() -> null
	- GPixi.offAllUpdateEvents(object) -> null

	- GPixi.onSizeChanged(object, callback) -> null
		event.target = object
		event.size = {width: newWidth, height: newHeight}

	- GPixi.containerToTexture(renderer, container, cropSize) -> PIXI.Texture

	- GPixi.containerToBase64(renderer, container, cropSize) -> Base64 String


*/

var GPixi = {

	// vars:

	enterFrameItems: [],
	changedSizeItems: [],

	// methods:

	usePivotPercent: function(target, flag){
		if(target.pivotPercent){
			return;
		}

		//--
		target.originalSize = GPixi.getOriginalSize(target);
		target.pivotPercent = {
			get x(){
				return target.pivot.x/target.originalSize.width;
			},
			set x(val){
				target.pivot.x = target.originalSize.width * val;
			},
			get y(){
				return target.pivot.y/target.originalSize.height;
			},
			set y(val){
				target.pivot.y = target.originalSize.height * val;
			},
			set: function(x,y){
				target.pivotPercent.x = x;
				target.pivotPercent.y = y;
			}
		}

		target.updatePivotPercent = function(){
			var target = this;
			target.pivotPercent.x = target.pivot.x/target.originalSize.width;
			target.pivotPercent.y = target.pivot.y/target.originalSize.height;
		}
		
		GPixi.onSizeChanged(target, function(e){
			var target = e.target;
			if(target.updatePivotPercent) target.updatePivotPercent();
		})

		// Reset anchor
		// from now DO NOT USE ANCHOR
		// USE pivotPercent INSTEAD!!
		if(target.anchor){
			target.pivotPercent.x = target.anchor.x;
			target.pivotPercent.y = target.anchor.y;
			target.anchor.set(0,0);
		}

		return target.pivotPercent;
	},

	setPivotPercentWithoutMoving: function(object, x, y){
		if(!object.pivotPercent){
			//throw "GPixi.usePivotPercent(target) has not been enabled yet.";
			GPixi.usePivotPercent(object);
			//GPixi.setPivotPercentWithoutMoving(object, x, y);
			//console.log("object.anchor:",object.anchor)
			//object.pivotPercent.x = x;
			//object.pivotPercent.y = y;
			return;
		}
		
		var prevPivot = object.pivotPercent;
		var newPivot = {x: object.originalSize.width * x, y: object.originalSize.height * y};

		var pivotGlobalPos = new PIXI.Point(newPivot.x, newPivot.y);
		var pivotPrevX = object.toGlobal(object.pivot).x;
		var pivotPrevY = object.toGlobal(object.pivot).y;
		var pivotGlobalX = object.toGlobal(pivotGlobalPos).x;
		var pivotGlobalY = object.toGlobal(pivotGlobalPos).y;
		//console.log(pivotPrevX, pivotGlobalX, (pivotGlobalX-pivotPrevX));

		var diffX = (pivotGlobalX-pivotPrevX);
		var diffY = (pivotGlobalY-pivotPrevY);

		object.x += diffX;
		object.y += diffY;

		object.pivotPercent.set(x, y);
			
		// đúng 1 lần:
		/*var radius = GMath.distanceBetweenPoints({x:0,y:0}, {x:newPivot.x*object.scale.x, y:newPivot.y*object.scale.y});
		var angle = object.rotation + GMath.angleRadBetween2Points({x:0,y:0}, newPivot);
		var p = GMath.getPointWithAngleAndRadius(angle, radius);
		console.log(radius, GMath.radToDeg(angle), p);
		
		object.x += p.x;
		object.y += p.y;*/

		/*var a = new PIXI.Graphics();
		a.beginFill(0xffff00, 1);
		a.drawCircle(0,0,5);
		a.x = object.pivot.x;
		a.y = object.pivot.y;
		object.addChild(a);*/
		
		/*var pivotGlobalX = object.toGlobal(a.position).x;
		var pivotGlobalY = object.toGlobal(a.position).y;
		var objectGlovalX = object.toGlobal(object.position).x;
		var objectGlovalY = object.toGlobal(object.position).y;

		GPixi.remove(a);
		//console.log(pivotGlobalX, pivotGlobalY);
		//console.log(objectGlovalX, objectGlovalY);
		var diffX = (objectGlovalX - pivotGlobalX);
		var diffY = (objectGlovalY - pivotGlobalY);
		console.log(diffX, diffY);

		object.x += diffX;
		object.y += diffY;*/

		//object.rotation = prevRotation;
	},

	setPivotPercent: function(object, x, y){
		if(!object.pivotPercent){
			throw "GPixi.usePivotPercent(target) has not been enabled yet.";
			return;
		}

		object.pivotPercent.set(x, y);

		var result = {
			x: object.pivotPercent.x,
			y: object.pivotPercent.y
		}

		return result;
	},
	
	getBoundSize: function(object){
		var a = new PIXI.Container();
		var parent = object.parent;

		var prop = this.copyPropertiesOf(object);
		var a = new PIXI.Container();
		a.addChild(object);
		object.x = 0;
		object.y = 0;
		var boundSize = new PIXI.Rectangle(0,0,a.width,a.height);

		console.log(object.width, object.height);
		console.log(boundSize.width, boundSize.height);

		if(parent) parent.addChild(object);
		GPixi.applyPropertiesTo(object, prop);

		return boundSize;
	},

	onSizeChanged: function(object, callback){
		var scope = GPixi;
		object.gpixiCurrentSize = {width: object.width, height: object.height};
		object.sizeChangedCallback = callback;
		scope.changedSizeItems.push(object);
	},
	removeSizeChanged: function(object){
		var scope = GPixi;
		if(!object){
			throw "Object is undefined.";
			return;
		}
		GArray.remove(object, scope.changedSizeItems);
		object.sizeChangedCallback = null;
	},

	onUpdate: function(object, callback){
		var scope = GPixi;
		object.callback = callback;
		scope.enterFrameItems.push(object);
	},
	offUpdate: function(object){
		var scope = GPixi;
		if(!object){
			throw "Object is undefined.";
			return;
		}
		if(scope.enterFrameItems.indexOf(object) < 0){
			//throw "Object isn't on enter frame at the moment.";
			return;
		}
		GArray.remove(object, scope.enterFrameItems);
		object.callback = null;
	},
	offAllUpdateEvents: function(){
		var scope = GPixi;
		// cauntion: do not use this function unless you understand what you're doing very well!!
		for(var i=0; i<scope.enterFrameItems.length; i++){
			var object = scope.enterFrameItems[i];
			object.callback = null;
		}
		scope.enterFrameItems = [];
	},
	onEnterFrame: function(object, callback){
		var scope = GPixi;
		object.callback = callback;
		scope.enterFrameItems.push(object);
	},
	removeEnterFrame: function(object){
		var scope = GPixi;
		if(!object){
			throw "Object is undefined.";
			return;
		}
		if(scope.enterFrameItems.indexOf(object) < 0){
			//throw "Object isn't on enter frame at the moment.";
			return;
		}
		GArray.remove(object, scope.enterFrameItems);
		object.callback = null;
	},
	removeAllEnterFrame: function(){
		var scope = GPixi;
		// cauntion: do not use this function unless you understand what you're doing very well!!
		for(var i=0; i<scope.enterFrameItems.length; i++){
			var object = scope.enterFrameItems[i];
			object.callback = null;
		}
		scope.enterFrameItems = [];
	},

	exportBase64: function(container, renderer, params){
		/* 
		Apply for PIXI v4 ONLY!!!
		params: 
		{
			cropSize: {widht, height}, 
			ignoreRotation: true/false
		}
		*/

		var cropSize = (params) ? params.cropSize : null;
		var ignoreRotation = (params) ? params.ignoreRotation : false;

		/*
		//console.log(container.width, container.height);
		var exportCanvas;
		// add temp canvas for rendering:
		if($("#exportCanvas").length > 0){
			exportCanvas = $("#exportCanvas")[0];
		} else {
			$("body").append("<canvas id='exportCanvas' style='display: none;' width='2000' height='2000'></canvas>")
			exportCanvas = $("#exportCanvas")[0];
		}
		var renderer = PIXI.autoDetectRenderer(exportCanvas.width, exportCanvas.height, {view: exportCanvas, transparent: true, backgroundColor: 0xffffff});
		*/
		
		var oldRotation;

		if(ignoreRotation){
			oldRotation = container.rotation;
			container.rotation = 0;
		}

		var bounds = container.getBounds();
		//console.log(bounds);
		var brt = new PIXI.BaseRenderTexture(renderer.width, renderer.height, PIXI.SCALE_MODES.LINEAR, 1);
		var texture = new PIXI.RenderTexture(brt, new PIXI.Rectangle(bounds.x,bounds.y, Math.floor(bounds.width), Math.floor(bounds.height)));
		
		renderer.render(container, texture);

		var base64 = renderer.extract.base64(texture);

		if(ignoreRotation){
			container.rotation = oldRotation;
		}

		// remove temp canvas:
		/*renderer.destroy();
		renderer = null;
		$("#exportCanvas").remove();*/

		return base64;
	},

	containerToBase64: function(renderer, container, cropSize){
		var texture = GPixi.containerToTexture(renderer, container, cropSize);

		// for PIXI v3
		//var base64 = texture.getBase64();

		// for PIXI v4:
		var base64 = renderer.extract.base64(texture);

		return base64;
	},

	containerToTexture: function(renderer, container, cropSize){
		var sizeToCrop = (cropSize) ? cropSize : {width: container.width, height: container.height};
		//console.log("sizeToCrop: ", sizeToCrop.width, sizeToCrop.height);
		
		// for PIXI v3
		//var rt = new PIXI.RenderTexture(renderer, sizeToCrop.width, sizeToCrop.height, PIXI.SCALE_MODES.LINEAR, 1);
		//rt.render(container);

		// for PIXI v4
		var brt = new PIXI.BaseRenderTexture(sizeToCrop.width, sizeToCrop.height, PIXI.SCALE_MODES.LINEAR, 1);
		var rt = new PIXI.RenderTexture(brt);
		renderer.render(container, rt);

		return rt;
	},

	newButton: function(normalTextureName, params){
		var btn = new PIXI.Container();
		var normal = GPixi.addNewSpriteTo("normal", btn, normalTextureName);
		var hover;
		var press;

		btn.interactive = true;
		btn.buttonMode = true;

		btn.state = "normal";

		if(params && params.hover){
			hover = GPixi.addNewSpriteTo("hover", btn, params.hover);
			hover.visible = false;
		}
		if(params && params.press){
			press = GPixi.addNewSpriteTo("press", btn, params.press);
			press.visible = false;
		}

		if(params && params.auto){
			btn.on("mouseover", function(){
				btn.changeState("hover");
			})
			btn.on("mouseout", function(){
				btn.changeState("normal");
			})
		}

		btn.changeState = function(_state){
			this.state = _state;

			switch(_state){
				case "press":
					if(hover) hover.visible = false;
					if(normal) normal.visible = false;
					if(press) press.visible = true;
				break;

				case "hover":
					if(normal) normal.visible = false;
					if(press) press.visible = false;
					if(hover) hover.visible = true;
				break;

				default:
					if(hover) hover.visible = false;
					if(press) press.visible = false;
					normal.visible = true;
				break;
			}
		}

		btn.setStateTexture = function(_state, textureName){
			switch(_state){
				case "press":
					if(press) press.texture = GPixi.textureFromLoader(textureName);
				break;

				case "hover":
					if(hover) hover.texture = GPixi.textureFromLoader(textureName);
				break;

				default:
					normal.texture = GPixi.textureFromLoader(textureName);
				break;
			}
		}

		return btn;
	},

	addNewButtonTo: function(name, container, textureName, params){
		var btn = GPixi.newButton(textureName, params);
		container[name] = btn;
		container.addChild(btn)
		return btn;
	},

	getRootStage: function(target){
		if(target.parent){
			if(target.parent.parent){
				if(target.parent.parent.parent){
					if(target.parent.parent.parent.parent){
						throw "Can only get max 4 levels of parent";
						return target.parent.parent.parent.parent;
					} else {
						return target.parent.parent.parent;
					}
				} else {
					return target.parent.parent;
				}
			} else {
				return target.parent;
			}
		} else {
			return false;
		}
	},

	setAnchor: function(target, x,y){
		var newAnchor = {x:x, y:y};
		var curAnchor;
		
		target.originalSize = GPixi.getOriginalSize(target);
		//console.log("target.originalSize:",target.originalSize);

		// for non-sprite objects: (they don't have anchor point!!!)
		if(!target.anchor){
			target.anchor = {
				x: target.pivot.x / target.originalSize.width,
				y: target.pivot.y / target.originalSize.height
			}
			//console.log("target.anchor:", target.anchor);
		}

		curAnchor = target.anchor;
		
		// change the position based on new anchor point:
		target.position.x += (target.width*newAnchor.x - target.width*curAnchor.x);
		target.position.y += (target.height*newAnchor.y - target.height*curAnchor.y);
		
		// apply anchor to target:
		if(target instanceof PIXI.Sprite){
			target.anchor = newAnchor;
		} else {
			target.pivot.set(target.originalSize.width*newAnchor.x, target.originalSize.height*newAnchor.y);
			target.anchor = newAnchor;
		}
	},

	textureFromLoader: function(name, _loader){
		var loader = (_loader) ? _loader : PIXI.loader;
		var texture;
		if(loader.resources[name]){
			texture = loader.resources[name].texture;
		} else {
			throw "[GPixi Error] No texture was found from the loader. Please double check your texture name.";
		}
		return texture;
	},

	spriteFromTextureName: function(textureName, _loader){
		var loader = (_loader) ? _loader : PIXI.loader;
		var texture = GPixi.textureFromLoader(textureName, loader);
		var sprite = new PIXI.Sprite(texture);
		return sprite;
	},

	addNewSpriteTo: function(name, container, textureName, _loader){
		var loader = (_loader) ? _loader : PIXI.loader;
		var sprite = GPixi.spriteFromTextureName(textureName, loader);
		container[name] = sprite;
		container.addChild(sprite);
		return sprite;
	},

	cloneSprite: function(sprite, _copyProperties){
		var clone = new PIXI.Sprite(sprite.texture);
		if(_copyProperties){
			GPixi.copyProperties(clone, sprite);
		}
		return clone;
	},

	copyProperties: function(target, fromTarget){
		var prop = this.copyPropertiesOf(fromTarget);
		this.applyPropertiesTo(target);
		return true;
	},

	copyPropertiesOf: function(target){
		var props = {};
		if(target.anchor) props.anchor = {x: target.anchor.x, y: target.anchor.y};
		props.pivot = {x: target.pivot.x, y: target.pivot.y};
		props.x = target.x;
		props.y = target.y;
		props.width = target.width;
		props.height = target.height;
		props.alpha = target.alpha;
		props.rotation = target.rotation;
		props.scale = target.scale;
		return props;
	},

	resetPropertiesOf: function(target){
		if(target.anchor) target.anchor = new PIXI.Point(0,0);
		if(target.pivot) target.pivot = new PIXI.Point(0,0);
		target.x = 0;
		target.y = 0;
		if(target.origialSize) target.width = target.origialSize.width;
		if(target.origialSize) target.height = target.origialSize.height;
		//target.alpha = prop.alpha;
		//if(target.rotation) target.rotation = prop.rotation;
		//if(target.scale) target.scale = prop.scale;
	},

	applyPropertiesTo: function(target, properties, excepts){
		var prop = properties;
		if(prop.anchor) target.anchor = prop.anchor;
		if(prop.pivot) target.pivot = prop.pivot;
		if(prop.x) target.x = prop.x;
		if(prop.y) target.y = prop.y;
		if(prop.width) target.width = prop.width;
		if(prop.height) target.height = prop.height;
		if(prop.alpha) target.alpha = prop.alpha;
		if(prop.rotation) target.rotation = prop.rotation;
		if(prop.scale) target.scale = prop.scale;
		return true;
	},

	getOriginalSize: function(target){
		//console.log(target.scale)
		var scaleX = target.scale.x;
		var scaleY = target.scale.y;
		//console.log(target.width, target.height)
		var originalSize = {};
		originalSize.width = target.width/scaleX;
		originalSize.height = target.height/scaleY;
		
		return originalSize;
	},

	createMovieClip: function(name, fromId, toId){
		var textures = [];
		for(var i=Number(fromId); i<=Number(toId); i++){
			var linkage = name + i;
			//console.log(linkage)
			var texture = PIXI.loader.resources[linkage].texture;
			textures.push(texture);
		}
		var mc = new PIXI.extras.MovieClip(textures);

		return mc;
	},
	remove: function(item){
		if(item.parent){
			item.parent.removeChild(item);
			item.destroy();
			item = null;
		} else {
			throw "[GPixi Error: remove] This object doesn't have any parents.";
		}
	},
	removeItems: function(array){
		for(var i=0; i<array.length; i++){
			var item = array[i];
			GPixi.remove(item);
		}
	},

	moveToTop: function(item){
		//console.log("moveToTop")
		var parent = item.parent;
		var topZIndex = parent.children.length-1;
		for(var i=0; i<parent.children.length; i++){
			parent.children[i].zIndex = i; // re-assign zIndex to children

			if(parent.children[i].zIndex > item.zIndex){
				parent.children[i].zIndex = parseInt(parent.children[i].zIndex) - 1;
			}
		}
		
		//swap zIndex of the top item
		//parent.children[topZIndex].zIndex = item.zIndex;
		item.zIndex = topZIndex;
		//sort children..
		parent.children.sort(function(a,b) {
	        a.zIndex = a.zIndex || 0;
	        b.zIndex = b.zIndex || 0;
	        return a.zIndex - b.zIndex;
	    });
	},

	moveToBottom: function(item){
		//console.log("moveToTop")
		var parent = item.parent;
		var bottomZIndex = 0;
		for(var i=0; i<parent.children.length; i++){
			parent.children[i].zIndex = i+1; // re-assign zIndex to children
		}
		//swap zIndex of the top item
		//parent.children[bottomZIndex].zIndex = item.zIndex;
		item.zIndex = bottomZIndex;
		//sort children..
		parent.children.sort(function(a,b) {
	        a.zIndex = a.zIndex || 0;
	        b.zIndex = b.zIndex || 0;
	        return a.zIndex - b.zIndex;
	    });
	},

	moveAboveItem: function(target, item){
		var parent = item.parent;
		for(var i=0; i<parent.children.length; i++){
			parent.children[i].zIndex = i; // re-assign zIndex to children
		}
		for(i=0; i<parent.children.length; i++){
			if(i > item.zIndex){
				parent.children[i].zIndex += 1;
			}
		}
		target.zIndex = item.zIndex+1;
		//sort children..
		parent.children.sort(function(a,b) {
	        a.zIndex = a.zIndex || 0;
	        b.zIndex = b.zIndex || 0;
	        return a.zIndex - b.zIndex;
	    });
	},

	moveBelowItem: function(target, item){
		var parent = item.parent;
		for(var i=0; i<parent.children.length; i++){
			parent.children[i].zIndex = i; // re-assign zIndex to children
		}
		for(i=0; i<parent.children.length; i++){
			if(i >= item.zIndex){
				parent.children[i].zIndex += 1;
			}
		}
		target.zIndex = item.zIndex-1;
		//sort children..
		parent.children.sort(function(a,b) {
	        a.zIndex = a.zIndex || 0;
	        b.zIndex = b.zIndex || 0;
	        return a.zIndex - b.zIndex;
	    });
	},

	swapIndex: function(item1, item2){
		if(item1.parent != item2.parent){
			console.log("[GPixi Error] Children are not in the same parent.");
			return;
		}
		var parent = item1.parent;
		for(var i=0; i<parent.children.length; i++){
			parent.children[i].zIndex = i; // re-assign zIndex to children
		}
		//swap zIndex
		var tmpZindex = item2.zIndex;
		item2.zIndex = item1.zIndex;
		item1.zIndex = tmpZindex;
		//sort children..
		parent.children.sort(function(a,b) {
	        a.zIndex = a.zIndex || 0;
	        b.zIndex = b.zIndex || 0;
	        return a.zIndex - b.zIndex;
	    });
	}
}

requestAnimationFrame(gpixiRepeater);

function gpixiRepeater() {
	if(GPixi.enterFrameItems.length > 0){
		for(var i=0; i<GPixi.enterFrameItems.length; i++){
			var object = GPixi.enterFrameItems[i];

			if(object){
				if(object.callback){
					var event = {target: object};
					object.callback(event);
				} else {
					throw "[onEnterFrame] Object doesn't contain any callbacks.";
				}
			} else {
				GArray.remove(object, GPixi.enterFrameItems);
			}
		}
	}
	if(GPixi.changedSizeItems.length > 0){
		for(var i=0; i<GPixi.changedSizeItems.length; i++){
			var object = GPixi.changedSizeItems[i];

			if(object){
				var event = {target: object};

				if(object.gpixiCurrentSize){
					if(object.gpixiCurrentSize.width != object.width || object.gpixiCurrentSize.height != object.height){
						object.gpixiCurrentSize.width = object.width;
						object.gpixiCurrentSize.height = object.height;
						event.size = object.gpixiCurrentSize;
						if(object.sizeChangedCallback){
							object.sizeChangedCallback(event);
						}	else {
							throw "[onSizeChanged] Object doesn't contain any callbacks.";
						}
					}
				}
			} else {
				throw "Object is undefined";
			}
		}
	}
	requestAnimationFrame(gpixiRepeater);
}