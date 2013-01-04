goog.provide('ww.mode');
goog.provide('ww.mode.modes');
goog.require('ww.mode.CatMode');
goog.require('ww.mode.DogMode');
goog.require('ww.mode.ExplodeMode');
goog.require('ww.mode.HomeMode');
goog.require('ww.mode.PongMode');

/** @define {boolean} */
var DEBUG_MODE = false;

ww.mode.modes = {};

ww.mode.register = function(name, klass, pattern, len) {
  ww.mode.modes[name] = {
    klass: klass,
    pattern: pattern,
    len: len
  };
};

ww.mode.findModeByName = function(name) {
  return ww.mode.modes[name];
};

ww.mode.register('home', ww.mode.HomeMode, null);
ww.mode.register('cat', ww.mode.CatMode, 2, 3); // 010
ww.mode.register('dog', ww.mode.DogMode, 3, 3); // 011
ww.mode.register('pong', ww.mode.PongMode, 4, 3); // 100
ww.mode.register('explode', ww.mode.ExplodeMode, 5, 3); // 101

jQuery(function() {
  var parts = window.location.href.split('/');
  var page = parts[parts.length-1];
  var scriptName = page.replace('.html', '');

  var pair = ww.mode.findModeByName(scriptName);
  var klass = pair.klass;
  
  // Initialize
  var controller = new klass();
});