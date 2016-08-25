/*
PIXI v4 ONLY!!!
*/

$(function(){
	PIXIApp.init();
})

var PIXIApp = {

	// pixi vars:

	renderer: null,
	canvas: null,
	center: null,
	stage: null,
	loader: null,
	backgroundColor: 0xffffff,
	transparent: false,
	canvasSize: {width: 0, height: 0},
	canvasHolderClass: "canvasHolder",

	isInit: false,

	// app variables:

	assetsArr: [{name: "img0", url: "assets/img-0.jpg"}],

	// functions

	init: function(){
		var scope = PIXIApp;

		scope.canvas = $("."+ scope.canvasHolderClass +" canvas")[0];
		scope.center = {}
		
		// Resizing

		$(window).resize(scope.onResize);
		scope.onResize();
		
		// setup PIXI

		scope.renderer = PIXI.autoDetectRenderer(scope.canvas.width, scope.canvas.height, {view: scope.canvas, transparent: scope.transparent, backgroundColor: scope.backgroundColor});
		//scope.renderer = new PIXI.WebGLRenderer(scope.canvas.width, scope.canvas.height, {view: scope.canvas, backgroundColor: 0xffffff});
		scope.stage = new PIXI.Container();

		scope.stage.interactive = true;

		// === preload images ===

		scope.loader = PIXI.loader; 

		//-- start load assets --

		if(scope.assetsArr.length == 0){
			scope.onAssetsLoaded();
		} else {
			for(var i=0; i<scope.assetsArr.length; i++){
				scope.loader.add(scope.assetsArr[i].name, scope.assetsArr[i].url);
			}
			PIXI.loader.on('progress', scope.onLoadProgress);
		}

		//-- end load assets --

		scope.loader.once('complete', scope.onAssetsLoaded);
		scope.loader.load();

		// === render ===

		requestAnimationFrame(animate);

		function animate() {
			scope.onRuntime();
		    scope.renderer.render(scope.stage);
		    requestAnimationFrame(animate);
		}
	},
	onLoadProgress: function(){

	},
	onAssetsLoaded: function(){
		console.log("== All assets are loaded! == ");
		var scope = PIXIApp;

		var bottomLayer = new PIXI.Graphics();
		bottomLayer.beginFill(0x000000, 0);
		bottomLayer.drawRect(0, 0, PIXIApp.canvas.width, PIXIApp.canvas.height);
		scope.stage.addChild(bottomLayer);

		bottomLayer.interactive = true;
		bottomLayer.on("click", function(){
			transformTool.clear();
		})

		// place initializing code here...

		var transformTool = new TransformTool({debug:false});
		//transformTool.SCALE_BY_RATIO = true;
		scope.stage.addChild(transformTool);

		/*transformTool.on("change", function(){
			//console.log("onChange");
			img.anchor = imgAlpha.anchor;
			img.position = imgAlpha.position;
			img.scale = imgAlpha.scale;
			img.rotation = imgAlpha.rotation;
		})*/

		
		var img = new PIXI.Sprite(scope.loader.resources.img0.texture);
		img.scale.set(0.4,0.4);
		//console.log("aa", img.width/2, img.height/2)

		//try to change pivot position:
		var originalSize = GPixi.getOriginalSize(img);
		img.pivot.set(originalSize.width/2, originalSize.height/2);
		//console.log(img.anchor);

		// try to change anchor position:
		//img.anchor.set(0.5, 0.5);
		//console.log(img.pivot);

		img.position.x = scope.canvas.width/2;
		img.position.y = scope.canvas.height/2;

		img.rotation = GMath.degToRad(40);

		img.interactive = true;
		scope.img = img;
		scope.stage.addChild(img);

		img.on("mousedown", function(){
			transformTool.apply(this);
		});

		//GPixi.usePivotPercent(img);
		//GPixi.setPivotPercentWithoutMoving(img, 0.5, 0.5);

		/*var imgAlpha = new PIXI.Sprite(scope.loader.resources.img0.texture);
		imgAlpha.scale.set(0.4,0.4);
		imgAlpha.alpha = 0;
		imgAlpha.interactive = true;
		scope.imgAlpha = imgAlpha;
		scope.stage.addChild(imgAlpha);

		imgAlpha.on("mousedown", function(){
			console.log("imgAlpha");
			transformTool.apply(this);
		});*/

		//transformTool.apply(img);

		var shape = new PIXI.Graphics();
		shape.beginFill(0x000000, 1);
		shape.drawRect(0,0,300,200);

		//GPixi.setAnchor(shape, 0.5, 0.5);
		
		shape.width = 200;
		shape.height = 200;

		//shape.width = 200;
		//shape.height = 10;
		//shape.pivot.set(150, 100);
		shape.position.x = scope.canvas.width*2/3;
		shape.position.y = scope.canvas.height/2;
		
		shape.interactive = true;
		scope.shape = shape;
		scope.stage.addChild(shape);

		//GPixi.usePivotPercent(shape);
		//GPixi.setPivotPercentWithoutMoving(shape, 0.5, 0.5);

		shape.on("mousedown", function(){
			transformTool.apply(this);
		})

		
		// end initializing...
		
		scope.isInit = true;
		scope.onResize();
	},

	onRuntime: function(){
		var scope = this;
		//if(scope.img) scope.img.rotation += 0.03;
		//if(scope.shape) scope.shape.rotation += 0.02;
		//if(scope.shape) scope.shape.scale.x += 0.005;
		//if(scope.shape) scope.shape.scale.y += 0.005;

		if(scope.checkCanvasSizeChange){
			scope.checkCanvasSizeChange();
		}
	},

	onResize: function(){
		var scope = PIXIApp;

		scope.canvas.width = $("." + scope.canvasHolderClass).width();
		scope.canvas.height = $("." + scope.canvasHolderClass).height();

		if(scope.isInit){
			// resize code here...
		}

		scope.center.x = scope.canvas.width/2;
		scope.center.y = scope.canvas.height/2;

		if(scope.renderer){
			scope.renderer.resize(scope.canvas.width, scope.canvas.height);
		}
	},

	checkCanvasSizeChange: function(){
		var scope = PIXIApp;

		if(scope.canvas.width != scope.canvasSize.width){
			scope.canvasSize.width = scope.canvas.width;
			scope.onCanvasSizeChange();
		}
		if(scope.canvas.height != scope.canvasSize.height){
			scope.canvasSize.height = scope.canvas.height;
			scope.onCanvasSizeChange();
		}
	},

	onCanvasSizeChange: function(){
		//console.log("Canvas size change");
	}
}

