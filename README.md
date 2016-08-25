# pixi-transform-tool
I made a PIXI (v4) plugin which can transform a display object.

Demo: http://dev2.digitop.vn/dev/pixi-lab/pixi-transform-v4.html

## How to use:

- Create a new TransformTool:
```
var transformTool = new TransformTool();
stage.addChild(transformTool);
```
- Apply it on an object:
```
var object = new PIXI.Container();
stage.addChild(object);
...
object.on("click", function(){
  transformTool.apply(object);
});
```
- Or remove it on later:
```
transformTool.clear();
```

## Some additional features:
- Hold SHIFT for scaling by ratio.
- Hold CTRL/CMD for scaling from the registration point.

## Notes:
- Must include "js/plugins/gpixi.js" and "js/plugins/helper.js" before "js/transform-tool-v4-v01.js"
- The code is under development and hadn't been compressed. 

Please feel free to contribute!

Cheers,
