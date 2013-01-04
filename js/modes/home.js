goog.require('ww.mode.Core');
goog.provide('ww.mode.HomeMode');

/**
 * @constructor
 */
ww.mode.HomeMode = function() {
  goog.base(this, 'home', true, true);

  this.setupPatternMatchers_();

  this.currentPattern_ = "";
  this.maxPatternLength_ = 15;
};
goog.inherits(ww.mode.HomeMode, ww.mode.Core);

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

/**
 * Build matchers from patterns.
 * @private
 */
ww.mode.HomeMode.prototype.setupPatternMatchers_ = function() {
  var patterns = {}, key, mode;

  // Privately decode patterns into binary.
  for (key in ww.mode.modes) {
    if (ww.mode.modes.hasOwnProperty(key) && ww.mode.modes[key].pattern) {
      mode = ww.mode.modes[key];
      patterns[key] = {
        klass: mode.klass,
        binaryPattern: pad(mode.pattern.toString(2), mode.len)
      };
    }
  }

  // Build per-character matchers
  this.matchers_ = [];

  for (key in patterns) {
    if (patterns.hasOwnProperty(key)) {
      mode = patterns[key];
      this.log('Building matchers for: ' + mode.binaryPattern);
      for (var i = 0; i < mode.binaryPattern.length; i++) {
        this.matchers_.push({
          key: key,
          matcher: mode.binaryPattern.slice(0, i + 1),
          isPartial: ((i + 1) != mode.binaryPattern.length)
        });
      }
    }
  }
};

/**
 * Add a character to the pattern we're tracking.
 * @private
 * @param {String} str The new character.
 */
ww.mode.HomeMode.prototype.addCharacter_ = function(str) {
  this.currentPattern_ += str;

  if (this.currentPattern_.length > this.maxPatternLength_) {
    this.currentPattern_ = this.currentPattern_.slice(-this.maxPatternLength_, this.currentPattern_.length);
  }

  this.log('current pattern: ' + this.currentPattern_);

  var matched = this.runMatchers_();
  if (matched) {
    this.log('matched', matched);

    if (matched.isPartial) {
      // Highlight partial match in UI?
    } else {
      this.goToMode_(matched.key);
    }
  }
};

/**
 * Run the matchers and return the best match.
 * @private
 * @return {Object} The best match.
 */
ww.mode.HomeMode.prototype.runMatchers_ = function() {
  var matches = [];

  for (var i = 0; i < this.matchers_.length; i++) {
    var matcher = this.matchers_[i];
    var lastXChars = this.currentPattern_.slice(-matcher.matcher.length, this.currentPattern_.length);

    if (lastXChars.indexOf(matcher.matcher) > -1) {
      matches.push({
        matcher: matcher,
        len: matcher.matcher.length,
        isPartial: matcher.isPartial
      });

      if (!matcher.isPartial) {
        return matcher;
      }
    }
  }

  var found;
  // Find longest
  var longestLen = 0;
  for (var j = 0; j < matches.length; j++) {
    if (matches[j].len > longestLen) {
      found = matches[j].matcher;
      longestLen = matches[j].len;
    }
  }

  return found;
};

ww.mode.HomeMode.prototype.activateI = function() {
  this.addCharacter_('1');
};

ww.mode.HomeMode.prototype.activateO = function() {
  this.addCharacter_('0');
};

/**
 * Tell the app to transition to the specified mode.
 * @private
 * @param {String} key The mode name.
 */
ww.mode.HomeMode.prototype.goToMode_ = function(key) {
  this.sendMessage_('goToMode', key);
};

/**
 * Function to initialize the current mode.
 * Requests a paper canvas and creates paths.
 * Sets initial variables.
 */
ww.mode.HomeMode.prototype.init = function() {
  goog.base(this, 'init');

  // Prep paperjs
  this.getPaperCanvas_();

  /**
   * Gets the width of the viewport and its center point.
   */
  this.screenWidthPixels = window.innerWidth;
  this.screenHeightPixels = window.innerHeight;
  this.screenCenterX = this.screenWidthPixels / 2;
  this.screenCenterY = this.screenHeightPixels / 2;

  /**
   * Create the letter I.
   */
  var iWidth = 100;
  var iHeight = 200;
  var iX = this.screenCenterX - (this.screenWidthPixels / 8);
  var iY = this.screenCenterY - iHeight / 2;

  var iTopLeft = new paper['Point'](iX, iY);
  var iSize = new paper['Size'](iWidth, iHeight);
  this.letterI = new paper['Rectangle'](iTopLeft, iSize);
  this.paperI = new paper['Path']['Rectangle'](this.letterI);
  this.paperI['fillColor'] = '#F2B50F';

  /**
   * Create the letter O.
   */
  var oRad = 100;
  var oX = this.screenCenterX + (this.screenWidthPixels / 8);
  var oY = this.screenCenterY;

  var oCenter = new paper['Point'](oX, oY);
  this.paperO = new paper['Path']['Circle'](oCenter, oRad);
  this.paperO['fillColor'] = '#00933B';
  this.paperO['fullySelected'] = true;

  var tool = new paper['Tool']();

  tool['onMouseDown'] = function(event) {
    if (event['point']['getDistance'](oCenter) < oRad) {
      this.paperO['removeSegment'](0);
    }
  }
};

/**
 * Runs code on each requested frame.
 * @param {Integer} delta The timestep variable for animation accuracy.
 */
ww.mode.HomeMode.prototype.onFrame = function(delta) {
  goog.base(this, 'onFrame', delta);

};