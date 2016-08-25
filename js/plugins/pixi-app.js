function PIXIApp(_canvasHolderClass) {
    this.renderer = null;
	this.center = null;
	this.stage = null;
	this.loader = null;
	this.backgroundColor = 0xffffff;
	this.transparent = false;

	this.canvas = null;
	this.canvasSize = {width: 0, height: 0};
	this.canvasHolderClass = _canvasHolderClass;

	this.isInit = false;
	this.isActive = true;
	this.isDebugging = true; // turn on to see debug messages
}

//TransformTool.prototype  = Object.create(PIXI.Container.prototype);
TransformTool.prototype.constructor = TransformTool;

TransformTool.prototype.destroy = function() {

}