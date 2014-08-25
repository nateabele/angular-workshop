angular.module('ur.canvas', ['ur.file']).factory('ImageProjector', function() {

  function ImageProjector(options) {
    var last = { x: null, y: null };
    var state = { active: false, move: false, scale: false }, pos, size, image, target;
    var events = { update: [], change: [] };
    var self = this;

    options = angular.extend({
      target: null,
      image: new Image(),
      pos: { x: 0, y: 0 },
      size: { width: null, height: null },
      scaleFactor: 0.2,
      fit: "auto"
    }, options || {});

    pos = options.pos;
    size = options.size;
    image = options.image;
    target = options.target;

    if (target === null) {
      throw new Error("No target specified");
    }
    var ctx = target.getContext("2d");

    var aspect = function() {
	  if (options.fit === "none") return size;

      if (image.width > image.height) {
        size.height = size.width * (image.height / image.width);
      } else {
        size.width = size.height * (image.width / image.height);
      }
      return size;
    };
    var once = true;

    var redraw = function() {
      ctx.beginPath();
      ctx.rect(0, 0, target.width, target.height);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.drawImage(image, pos.x, pos.y, size.width, size.height);
    };

    var verifyParams = function(e) {
      var badness = (!last.x && !last.y);

      last.x = last.x || e.clientX;
      last.y = last.y || e.clientY;

      return !badness;
    };

    var trigger = function(event) {
      for (var i = 0; i < events[event].length; i++) {
        if (events[event][i].call(self) === false) {
          return;
        }
      }
    };

    image.onload = function() {
      size.width = target.width;
      size.height = target.height;
      size = aspect(this, size);

      pos.x = (target.width / 2) - (size.width / 2);
      pos.y = (target.height / 2) - (size.height / 2);
      redraw();
    };

    this.pos = function() {
      return pos;
    };
    this.size = function() {
      return size;
    };
    this.start = function(options) {
      options = options || {};
      state.active = true;
      state.scale = !!options.scale;
      state.move = !state.scale;
      last = { x: null, y: null };
    };
    this.stop = function() {
      (last.x === null && last.y === null) || trigger('change');
      state.active = false;
      last = { x: null, y: null };
    };

    this.input = function(e) {
      state.scale ? this.scale(e) : this.move(e);
    };
    this.move = function(e) {
      if (!state.active || !verifyParams(e)) {
        return;
      }
      pos.x += (e.clientX - last.x);
      pos.y += (e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      trigger('update');
      redraw();
    };
    this.scale = function(e) {
      if (!state.active || !verifyParams(e)) {
        return;
      }
      var delta = (e.clientY - last.y) / options.scaleFactor;
      last.y = e.clientY;

      if (delta < 0 && ((size.width < (-delta / 2)) || (size.height < (-delta / 2)))) {
        return;
      }

      pos.x -= (delta / 4);
      pos.y -= (delta / 4);

      size.width += (delta / 2);
      size.height += (delta / 2 * (size.height / size.width));
      size = aspect();
      trigger('update');
      redraw();
    };
    this.size = function(newSize) {
      if (!newSize) {
        return size;
      }
      size.height = newSize.height;
      size.width = newSize.width;
      size = aspect();

      redraw();
      return size;
    };
    this.image = function(newImage) {
      if (!newImage) {
        return image;
      }
      image.src = newImage;
      redraw();
    };
    this.bind = function(event, callback) {
      if (events[event]) {
        events[event].push(callback);
      }
    };
  }

  return ImageProjector;

}).directive('imageEditor', ['$parse', '$window', 'ImageProjector', 'fileHandler', function($parse, $window, ImageProjector, fileHandler) {

  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

  return {
    restrict: "E",
    require: "?ngModel",
    replace: true,
    template: "<canvas></canvas>",
    link: function(scope, elem, attrs, ngModel) {

      var box       = new ImageProjector({ target: elem[0], fit: attrs.fit || "auto" }),
          model     = $parse(attrs.ngModel),
          scaleExpr = (attrs.scale) ? $parse(attrs.scale) : null;

      if (attrs.width) elem[0].width = attrs.width;
      if (attrs.height) elem[0].height = attrs.height;

      scope.$watch(attrs.ngModel, function(newVal, oldVal) {
        if (newVal && newVal instanceof File) {
          fileHandler.load(newVal).then(function(value) {
            box.image(value);
            if (attrs.load) scope.$eval(attrs.load);
          });
          if (!scope.$$phase) scope.$apply();
        }
      });

      box.bind("change", function() {
        var data = elem[0].toDataURL();
        model.assign(scope, isSafari ? data : fileHandler.toBlob(data));
        if (attrs.change) scope.$eval(attrs.change);
      });

      elem.bind("mousedown", function(e) {
        box.start({ scale: scaleExpr ? scaleExpr(scope, { $event: e }) : e.metaKey || e.ctrlKey });
      });

      angular.element($window).bind("mouseup", function() {
        box.stop();
      });

      angular.element($window).bind("mousemove", function(e) {
        box.input(e);
      });
    }
  };
}]);