goog.require('ww.mode.Core');
goog.provide('ww.mode.BaconMode');


/**
 * @constructor
 */
ww.mode.BaconMode = function() {
  goog.base(this, 'bacon', true, true);
};
goog.inherits(ww.mode.BaconMode, ww.mode.Core);


/**
 * Initailize BaconMode.
 */
ww.mode.BaconMode.prototype.init = function() {
  goog.base(this, 'init');
  this.stripes = $('#stripes');
  this.yolk = $('#yolk');
  this.whites = $('#egg-whites');
};


/**
 * Plays a sound and stretches the letter i when activated.
 */
ww.mode.BaconMode.prototype.activateI = function() {
  goog.base(this, 'activateI');

  var self = this;

  this.playSound('bacon.wav', function(buffer) {
    self.playingSound = buffer;
  });

  var stretchOut = new TWEEN.Tween({ 'scaleX': 1, 'scaleY': 1 });
  stretchOut.to({ 'scaleX': 1.75, 'scaleY': 1.2 }, 400);
  stretchOut.easing(TWEEN.Easing.Elastic.In);
  stretchOut.onUpdate(function() {
    self.transformElem_(self.$letterI_[0], 'scaleY(' + this['scaleY'] + ')');
    self.transformElem_(self.stripes[0], 'scaleX(' + this['scaleX'] + ')');
  });

  var stretchBack = new TWEEN.Tween({ 'scaleX': 1.75, 'scaleY': 1.2 });
  stretchBack.to({ 'scaleX': 1, 'scaleY': 1 }, 600);
  stretchBack.easing(TWEEN.Easing.Elastic.Out);
  stretchBack.delay(400);
  stretchBack.onUpdate(function() {
    self.transformElem_(self.$letterI_[0], 'scaleY(' + this['scaleY'] + ')');
    self.transformElem_(self.stripes[0], 'scaleX(' + this['scaleX'] + ')');
  });

  this.addTween(stretchOut);
  this.addTween(stretchBack);
};


/**
 * Plays a sound and stretches the letter o when activated.
 */
ww.mode.BaconMode.prototype.activateO = function() {
  goog.base(this, 'activateO');
  this.playSound('eggs.wav');

  var self = this;

  var shift = -1 * (Math.random() * (270 - 45) + 45);
  var pos = [Random(-75, 75), Random(-75, 75)];

  var degs = self.whites[0].style[self.prefix_].split('rotate(')[1];
      degs = parseInt(degs) || 0;

  var posX = self.yolk[0].style[self.prefix_].split('translateX(')[1];
      posX = parseInt(posX) || 0;

  var posY = self.yolk[0].style[self.prefix_].split('translateY(')[1];
      posY = parseInt(posY) || 0;

  var sizeX = self.whites[0].style[self.prefix_].split('skewX(')[1];
      sizeX = parseFloat(sizeX) || 0;

  var sizeY = self.whites[0].style[self.prefix_].split('skewY(')[1];
      sizeY = parseFloat(sizeY) || 0;

  var sizing = [Random(-15, 15), Random(-15, 15)];

  var spinEgg = new TWEEN.Tween({
    'translateX': posX,
    'translateY': posY,
    'skewX': sizeX,
    'skewY': sizeY,
    'rotate': degs
  });

  spinEgg.to({
    'translateX': pos[0],
    'translateY': pos[1],
    'skewX': sizing[0],
    'skewY': sizing[1],
    'rotate': (degs + shift / 2)
  }, 500);

  spinEgg.easing(TWEEN.Easing.Elastic.In);

  spinEgg.onUpdate(function() {
    var translate = 'translateX(' + this['translateX'] + 'px) ';
        translate += 'translateY(' + this['translateY'] + 'px) ';
        translate += 'rotate(' + (-1 * this['rotate']) + 'deg) ';

    var whites = 'rotate(' + this['rotate'] + 'deg) ';
        whites += 'skewX(' + this['skewX'] + 'deg) ';
        whites += 'skewY(' + this['skewY'] + 'deg)';

    self.transformElem_(self.whites[0], whites);
    self.transformElem_(self.yolk[0], translate);
  });

  self.addTween(spinEgg);
};
