/*
 List of plugins:
	- GDevice 1.0
  - GMath 1.0
  - GArray 1.0
  - GLayoutCSS 1.0
  - GUpload 1.0
*/

/* GDevice - version 1.0
Author: Goon Nguyen
================================================== */

var GDevice = {
  tmpOri: "portrait", //landscape
  ratio: 16/9,
  tmpType: "mobile",
  get type(){
  	GDevice.resize();
  	return GDevice.tmpType;
  },

  get orientation(){
  	GDevice.resize();
  	return GDevice.tmpOri;
  },

  get width(){
  	return $(window).width();
  },

  get height(){
  	return $(window).height();
  },

  init: function(){
    $(window).resize(GDevice.resize);
    GDevice.resize();
  },
  resize: function(e){
    var sw = $(window).width();
    var sh = $(window).height();

    GDevice.ratio = sw/sh;

    if(GDevice.ratio > 1){
		GDevice.tmpOri = "landscape"

		if(sw > 1024){
			GDevice.tmpType = "desktop"
		} else {
			if(sw > 640){
				GDevice.tmpType = "tablet"
			} else {
				GDevice.tmpType = "mobile"
			}
		}

    } else if(GDevice.ratio < 1){
      	GDevice.tmpOri = "portrail"

      	//console.log("sw: " + sw);
		if(sw > 770){
			GDevice.tmpType = "desktop"
		} else {
			if(sw > 480){
				GDevice.tmpType = "tablet"
			} else {
				GDevice.tmpType = "mobile"
			}
		}
    } else {
      GDevice.tmpOri = "square"
      GDevice.tmpType = "desktop"
    }

    //console.log(GDevice);
  }
}
$(document).ready(function() {
  GDevice.init();
})

/* GMath - version 1.0
Author: Goon Nguyen
================================================== */

var GMath = {
  random: function(number){
    return number*Math.random();
  },
  randomInt: function(number){
    return Math.floor(GMath.random(number));
  },
  randomPlusMinus: function(number){
    return number*(Math.random() - Math.random());
  },
  randomIntPlusMinus: function(number){
    return Math.round(GMath.randomPlusMinus(number));
  },
  randomFromTo: function(from, to){
    return from + (to - from) * Math.random();
  },
  randomIntFromTo: function(from, to){
    return Math.floor(GMath.randomFromTo(from, to));
  },

  angleRadBetween2Points: function(p1,p2){
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  },

  angleDegBetween2Points: function(p1,p2){
    return GMath.radToDeg(GMath.angleRadBetween2Points(p1,p2));
  },

  degToRad: function(deg){
    return deg * Math.PI / 180;
  },

  radToDeg: function(rad){
    return rad * 180 / Math.PI;
  },

  angleRadBetween3Points: function(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
  },

  getPointWithAngleAndRadius(angle, radius)
  {
    var p = {x: 0, y: 0};
    p.x = radius * Math.cos(angle);
    p.y = radius * Math.sin(angle);
    return p;
  },

  distanceBetweenPoints: function(p1,p2){
    var x1 = p1.x;
    var y1 = p1.y;

    var x2 = p2.x;
    var y2 = p2.y;

    var d = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );

    return d;
  }
}

/* GArray - version 1.0
Author: Goon Nguyen
================================================== */

var GArray = {
  remove: function(item, array){
    var index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
    return array;
  }
}

/* GLayoutCSS - version 1.0
Author: Goon Nguyen
================================================== */

var GLayoutCSS = {
  init: function(){
    console.log("[GLayoutCSS 1.0] Initialized!");
    $(window).resize(GLayoutCSS.resize);
    GLayoutCSS.resize();
  },
  resize: function(e){
    var sw = $(window).width();
    var sh = $(window).height();
    if($('.helper-layout-fullscreen').length > 0){
      $('.helper-layout-fullscreen').width(sw);
      $('.helper-layout-fullscreen').height(sh);
    }
  }
}
$(function(){
  GLayoutCSS.init();
})

/* GUpload - version 1.0
Author: Goon Nguyen
================================================== */

var GUpload = {
  inputElement: null,
  customClass: "",
  customPostName: "photo",
  customUploadType: "images/*",
  
  onSelect: null, // (base64)

  browse: function(callback){
    this.onSelect = callback;

    if(!this.inputElement){
      if($(".gupload-input").length > 0){
        $(".gupload-input").remove();
        console.log("input is existed")
      }
      $("body").append('<input class="gupload-input helper-hide '+GUpload.customClass+'" type="file" name="'+GUpload.customPostName+'" accept="'+GUpload.customUploadType+'">');
      this.inputElement = $(".gupload-input");
    }
    this.inputElement.click();
    this.inputElement.on("change", onChangeHandler);
    //--
    function onChangeHandler(){
      //console.log($(this).val());
      var file = $(this)[0].files[0];
      if(window.FileReader && window.FileReader.prototype.readAsArrayBuffer){
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
          var base64 = reader.result;

          if(GUpload.onSelect) GUpload.onSelect(base64);

          $(".gupload-input").remove();
        }, false);

        if (file) {
          reader.readAsDataURL(file);
        }
      } else {
        $(".gupload-input").remove();
        alert("Please upload your browser to use this feature.");
        throw "This browser is too old to use this feature.";
      }
    }//--
  },

  onRead: function(){
  },

  onFailRead: function(){

  }
}


