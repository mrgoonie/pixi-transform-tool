# pixi-transform-tool
I made a PIXI (v4) plugin which can transform a display object.

Demo: http://dev4.digitop.vn/pixi-lab/pixi-transform-v4.html

![transform-tool](http://dev4.digitop.vn/pixi-lab/assets/transform-tool.jpg)

## How to use:

- Create a new TransformTool:
```
// canvas parameter is required!
var transformTool = new TransformTool({canvas: canvasElement});
stage.addChild(transformTool);
```
- Apply it on an object:
```
var object = new PIXI.Container();
stage.addChild(object);
...
object.on("mousedown", function(){
  transformTool.apply(object);
});
```
- Or remove it on later:
```
transformTool.clear();
```

## Parameters:
```
var transformTool = new TransformTool({
	debug: false, // true: show debug layer
    canvas: canvasElement, // this is required
    scaleByRatio: true, // force scale/rotate by ratio ~ same function as holding SHIFT
    lockReg: true, // lock changing registration point ~ force registration point at (0.5, 0.5)
    border: true // show bound border around the transformed object
});
```

## Some additional features:
- Hold SHIFT for scaling by ratio.
- Hold CTRL/CMD for scaling from the registration point.

## Notes:
- Must include "js/plugins/gpixi.js" and "js/plugins/helper.js" before "js/plugins/pixi-transform-tool.min.js"
- jQuery is a need as well! (Sorry, I'm just too lazy to write pure Javascript)
- Hammer JS is required for multi touch handling.
- The code is still under development, there could be some bugs. But overall, it's good enough to go.

Please feel free to contribute!

Cheers,
