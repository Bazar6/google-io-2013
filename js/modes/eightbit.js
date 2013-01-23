goog.require('ww.mode.Core');
goog.require('ww.util');
goog.provide('ww.mode.EightBitMode');

/**
 * @constructor
 */
ww.mode.EightBitMode = function() {
  goog.base(this, 'eightbit', true, true, true);
};
goog.inherits(ww.mode.EightBitMode, ww.mode.Core);

/**
 * Method called when activating the I.
 */
ww.mode.EightBitMode.prototype.activateI = function() {
  this.iClicked_ = true;
  if (this.iMultiplier_ < 10) {
    this.iMultiplier_ += 2;
  }
};

/**
 * Method called when activating the O.
 */
ww.mode.EightBitMode.prototype.activateO = function() {
  this.oClicked_ = true;
  if (this.oMultiplier_ < 10) {
    this.oMultiplier_ += 2;
  }
};

/**
 * Function to create and draw I.
 * @private
 * @param {Boolean} isNew Create a new paper object or just edit values.
 */
ww.mode.EightBitMode.prototype.drawI_ = function(isNew) {
  // Set I's initial dimensions.
  this.iWidth_ = this.width_ * .175;
  this.iHeight_ = this.iWidth_ * 2.12698413;

  // Set coordinates for I's upper left corner.
  this.i_X = this.screenCenterX_ - this.iWidth_ * 1.5;
  this.i_Y = this.screenCenterY_ - this.iHeight_ / 2;

  if (isNew) {
    // Create a new paper.js path based on the previous variables.
    var iTopLeft = new paper['Point'](this.i_X, this.i_Y);
    var iSize = new paper['Size'](this.iWidth_, this.iHeight_);
    this.letterI = new paper['Rectangle'](iTopLeft, iSize);
    this.paperI_ = new paper['Path']['Rectangle'](this.letterI);
    this.paperI_['fillColor'] = '#11a860';

    // Create arrays to store the original coordinates for I's path points.
    this.i_PointX = [];
    this.i_PointY_ = [];

    for (this.i_ = 0; this.i_ < this.paperI_['segments'].length; this.i_++) {
      this.i_PointX.push(this.paperI_['segments'][this.i_]['point']['_x']);
      this.i_PointY_.push(this.paperI_['segments'][this.i_]['point']['_y']);
    }

  // Run if drawI_() is called and drawI_(true) has also already been called.
  } else if (!isNew && this.paperI_) {
    // Change the position based on new screen size values.
    this.paperI_['position'] = {x: this.i_X + this.iWidth_ / 2,
      y: this.i_Y + this.iHeight_ / 2};

    // Change the scale based on new screen size values.
    this.paperI_['scale'](this.iWidth_ / this.paperI_['bounds']['width']);

    // Store the coordinates for the newly moved and scaled control points.
    for (this.i_ = 0; this.i_ < this.paperI_['segments'].length; this.i_++) {
      this.i_PointX[this.i_] =
        this.paperI_['segments'][this.i_]['point']['_x'];

      this.i_PointY_[this.i_] =
        this.paperI_['segments'][this.i_]['point']['_y'];
    }
  } else {
    return;
  }
};

/**
 * Function to create and draw O.
 * @private
 * @param {Boolean} isNew Create a new paper object or just edit values.
 */
ww.mode.EightBitMode.prototype.drawO_ = function(isNew) {
  // Set O's radius.
  this.oRad_ = this.width_ * 0.1944444444;

  // Set O's coordinates.
  this.oX_ = this.screenCenterX_ + this.oRad_;
  this.oY_ = this.screenCenterY_;

  // Initial variables for calculating circle angles.
  var pathX;
  var pathY;

  var pathStart;
  var pathMidOne;
  var pathMidTwo;
  var pathEnd;
  var pathLength;

  var altI;

  if (isNew) {
    this.oCreated_ = true;

    // Create an array to store O's paths.
    this.oPaths_ = [];

    // Create a new paper.js path for O based off the previous variables.
    var oCenter = new paper['Point'](this.oX_, this.oY_);
    this.paperO_ = new paper['Path']['Circle'](oCenter, this.oRad_);
    this.paperO_['fillColor'] = 'transparent';

    this.oGroup_ = new paper['Group'];

    for (this.i_ = 0; this.i_ < 90; this.i_++) {
      this.oPaths_.push(new paper['Path']);

      pathX = oCenter['x'] + this.oRad_ * Math.cos((this.i_ * 2) *
        (Math.PI / 180));

      pathY = oCenter['y'] + this.oRad_ * Math.sin((this.i_ * 2) *
        (Math.PI / 180));

      pathStart = new paper['Point'](pathX, pathY);

      pathX = oCenter['x'] + this.oRad_ * Math.cos(((-this.i_ * 2)) *
        (Math.PI / 180));

      pathY = oCenter['y'] + this.oRad_ * Math.sin(((-this.i_ * 2)) *
        (Math.PI / 180));

      pathEnd = new paper['Point'](pathX, pathY);

      pathLength = pathEnd['getDistance'](pathStart);

      pathMidOne = new paper['Point'](pathX, this.screenCenterY_ +
        (pathLength / 4));

      pathMidTwo = new paper['Point'](pathX, this.screenCenterY_ -
        (pathLength / 4));

      this.oPaths_[this.i_]['add'](pathStart, pathMidOne, pathMidTwo, pathEnd);

      this.oGroup_['addChild'](this.oPaths_[this.i_]);
    }

    this.oGroup_['strokeColor'] = '#3777e2';
    this.oGroup_['strokeWidth'] = 1;
    this.oGroup_['rotate'](-45);

    // Create arrays to store the coordinates for O's path points.
    this.oPathsX_ = [];
    this.oPathsY_ = [];

    // Store the coordinates for O's path points.
    for (this.i_ = 0; this.i_ < this.oPaths_.length; this.i_++) {
      this.oPathsX_[this.i_] = [];
      this.oPathsY_[this.i_] = [];
      for (altI = 0; altI < this.oPaths_[this.i_]['segments'].length; altI++) {
        this.oPathsX_[this.i_].push(
          this.oPaths_[this.i_]['segments'][altI]['point']['_x']);

        this.oPathsY_[this.i_].push(
          this.oPaths_[this.i_]['segments'][altI]['point']['_y']);
      }
    }

  // Run if drawO_() is called and drawO_(true) has also already been called.
  } else if (!isNew && this.oCreated_) {
    this.paperO_['position'] = {x: this.oX_, y: this.oY_};
    this.oGroup_['position'] = {x: this.oX_, y: this.oY_};

    this.oGroup_['scale'](this.oRad_ * 2 / this.paperO_['bounds']['height']);
    this.paperO_['scale'](this.oRad_ * 2 / this.paperO_['bounds']['height']);

    // Store the coordinates for O's path points based on the new window size.
    for (this.i_ = 0; this.i_ < this.oPaths_.length; this.i_++) {
      for (altI = 0; altI < this.oPaths_[this.i_]['segments'].length; altI++) {
        this.oPathsX_[this.i_][altI] =
          this.oPaths_[this.i_]['segments'][altI]['point']['_x'];

        this.oPathsY_[this.i_][altI] =
          this.oPaths_[this.i_]['segments'][altI]['point']['_y'];
      }
    }
  } else {
    return;
  }
};

/**
 * Function to create and draw Slash.
 * @private
 * @param {Boolean} isNew Create a new paper object or just edit values.
 */
ww.mode.EightBitMode.prototype.drawSlash_ = function(isNew) {
  // Run only if drawI_(true) and drawO_(true) have been called
  if (isNew && this.paperI_ && this.paperO_) {
    // Determine the slash's start and end coordinates based on I and O sizes.
    this.slashStart_ = new paper['Point'](this.screenCenterX_ + this.oRad_ / 8,
      this.screenCenterY_ - (this.iHeight_ / 2) -
      ((this.iHeight_ * 1.5) * 0.17475728));

    this.slashEnd_ = new paper['Point'](this.i_X + this.iWidth_,
      this.screenCenterY_ + (this.iHeight_ / 2) +
      ((this.iHeight_ * 1.5) * 0.17475728));

    // Create a new paper.js path for the slash based on screen dimensions.
    this.paperSlash_ = new paper['Path'];
    this.paperSlash_['strokeWidth'] = this.width_ * 0.01388889;
    this.paperSlash_['strokeColor'] = '#ebebeb';

    this.paperSlash_['add'](this.slashStart_, this.slashEnd_);

  // Run if drawSlash_() is called and drawSlash(true) has already been called.
  } else if (!isNew && this.paperSlash_) {
    this.slashStart_['x'] = this.screenCenterX_ + this.oRad_ / 8;
    this.slashStart_['y'] = this.screenCenterY_ - (this.iHeight_ / 2) -
      ((this.iHeight_ * 1.5) * 0.17475728);

    this.slashEnd_['x'] = this.i_X + this.iWidth_;
    this.slashEnd_['y'] = this.screenCenterY_ + (this.iHeight_ / 2) +
      ((this.iHeight_ * 1.5) * 0.17475728);

    this.paperSlash_['segments'][0]['point'] = this.slashStart_;
    this.paperSlash_['segments'][1]['point'] = this.slashEnd_;

    this.paperSlash_['strokeWidth'] = this.width_ * 0.01388889;
  } else {
    return;
  }
};

/**
 * Function to initialize the current mode.
 * Requests a paper canvas and creates paths.
 * Sets initial variables.
 */
ww.mode.EightBitMode.prototype.init = function() {
  goog.base(this, 'init');

  // Prep paperjs
  this.getPaperCanvas_();

  // Variable to modify delta's returned value.
  this.deltaModifier_ = 0;

  // Temporarily float variable to use for randomizing animation effects.
  this.tempFloat_ = [];

  // Generic iterator.
  this.i_ = 0;

  // Gets the centerpoint of the viewport.
  this.screenCenterX_ = this.width_ / 2;
  this.screenCenterY_ = this.height_ / 2;

  /**
   * Sets the mouse position to start at the screen center.
   */
  this.mouseX_ = this.screenCenterX_;
  this.mouseY_ = this.screenCenterY_;

  /**
   * Create the letter I.
   */
  // Boolean that sets to true if I is being activated.
  this.iClicked_ = false;

  // Boolean that sets to false if I has been activated but delta is too high.
  this.iIncrement_ = true;

  // Float that increments by delta when I is activated to affect animation.
  this.iModifier_ = 0;

  // Float that increments on each activation of I to affect animation further.
  this.iMultiplier_ = 1;

  this.drawI_(true);

  /**
   * Create the letter O.
   */
  // Boolean that sets to true if O is being activated.
  this.oClicked_ = false;

  // Boolean that sets to false if O has been activated but delta is too high.
  this.oIncrement_ = true;

  // Float that increments by delta when O is activated to affect animation.
  this.oModifier_ = 0;

  // Float that increments on each activation of O to affect animation further.
  this.oMultiplier_ = 1;

  this.drawO_(true);

  /**
   * Create the slash. drawI() and drawO() must be called before drawSlash() to
   * successfully create the slash.
   */
  this.drawSlash_(true);
};

/**
 * Event is called after a mode focused.
 */
ww.mode.EightBitMode.prototype.didFocus = function() {
  goog.base(this, 'didFocus');

  var canvas = this.getPaperCanvas_();

  var self = this;

  var evt = Modernizr.touch ? 'touchmove' : 'mousemove';

  var tool = new paper['Tool']();

  tool['onMouseDown'] = function(event) {
    self.lastClick = event['point'];
    if (self.paperO_['hitTest'](event['point'])) {
      if (self.hasFocus) {
        self.activateO();
      }
    }

    if (self.paperI_['hitTest'](event['point'])) {
      if (self.hasFocus) {
        self.activateI();
      }
    }
  };

  $(canvas).bind(evt, function(e) {
    e.preventDefault();
    e.stopPropagation();

    self.mouseX_ = e.pageX;
    self.mouseY_ = e.pageY;
  });
};

/**
 * Handles a browser window resize.
 * @param {Boolean} redraw Whether resize redraws.
 */
ww.mode.EightBitMode.prototype.onResize = function(redraw) {
  goog.base(this, 'onResize', false);

  // Recalculate the center of the screen based on the new window size.
  this.screenCenterX_ = this.width_ / 2;
  this.screenCenterY_ = this.height_ / 2;

  /**
   * Redraw each shape on window resize. drawI() and drawO() must be called
   * before drawSlash() to maintain accurate drawing scale for the slash.
   */
  this.drawI_();
  this.drawO_();
  this.drawSlash_();

  if (redraw) {
    this.redraw();
  }
};

/**
 * Runs code on each requested frame.
 * @param {Integer} delta The timestep variable for animation accuracy.
 */
ww.mode.EightBitMode.prototype.onFrame = function(delta) {
  goog.base(this, 'onFrame', delta);

  /*
   * Delta is initially a very small float. Need to modify it for it to have a
   * stronger effect.
   */
  this.deltaModifier_ = (delta / 100);

  /*
   * Run the following code if the letter I is activated.
   * It uses delta along with other variables to modify the intensity of the
   * animation.
   */
  if (this.iClicked_ == true) {

    if (this.iModifier_ < this.deltaModifier_ * 10000 &&
      this.iIncrement_ == true) {
        this.iModifier_ += this.deltaModifier_ * 1000;
    } else if (this.iMultiplier_ > 1) {
      if (this.iModifier_ < this.deltaModifier_ * 10000) {
        this.iModifier_ += this.deltaModifier_ * 100;
      }
      if (this.iMultiplier_ > 1) {
        this.iMultiplier_ -= 0.1;
      } else {
        this.iMultiplier_ = 1;
      }
    } else {
      this.iIncrement_ = false;
      this.iModifier_ -= this.deltaModifier_ * 1000;
      if (this.iMultiplier_ > 1) {
        this.iMultiplier_ -= 0.1;
      } else {
        this.iMultiplier_ = 1;
      }
    }

    if (this.iModifier_ < this.deltaModifier_ * 1000) {
      this.iClicked_ = false;
      this.iIncrement_ = true;
      this.iMultiplier_ = 1;
    }

    /*
     * Loop through each path segment on the letter I and move each point's
     * handles based on time as being evaluated by Sine and Cosine.
     */
    for (this.i_ = 0; this.i_ < this.paperI_['segments'].length; this.i_++) {

      this.paperI_['segments'][this.i_]['point']['_x'] =
        this.i_PointX[this.i_] +
        Math.cos(this.framesRendered_ / 10 + this.i_ * 100) * this.iModifier_ *
        this.iMultiplier_;

      this.paperI_['segments'][this.i_]['point']['_y'] =
        this.i_PointY_[this.i_] +
        Math.sin(this.framesRendered_ / 10 + this.i_ * 100) * this.iModifier_ *
        this.iMultiplier_;
    }
  } else {
    /*
     * If I hasn't been activated recently enough, restore the original handle
     * coordinates.
     */
    for (this.i_ = 0; this.i_ < this.paperO_['segments'].length; this.i_++) {
      this.paperI_['segments'][this.i_]['point']['_x'] =
        this.i_PointX[this.i_];

      this.paperI_['segments'][this.i_]['point']['_y'] =
        this.i_PointY_[this.i_];
    }
  }

  /*
   * Run the following code if the letter O is activated.
   * It uses delta along with other variables to modify the intensity of the
   * animation.
   */
  if (this.oClicked_ === true) {

    if (this.oModifier_ < this.deltaModifier_ * 20000 &&
      this.oIncrement_ === true) {
        this.oModifier_ += this.deltaModifier_ * 1000;
    } else if (this.oMultiplier_ > 1) {
      if (this.oModifier_ < this.deltaModifier_ * 20000) {
        this.oModifier_ += this.deltaModifier_ * 10;
      }
      if (this.oMultiplier_ > 1) {
        this.oMultiplier_ -= 0.1;
      } else {
        this.oMultiplier_ = 1;
      }
    } else {
      this.oIncrement_ = false;
      this.oModifier_ -= this.deltaModifier_ * 1000;
      if (this.oMultiplier_ > 1) {
        this.oMultiplier_ -= 0.1;
      } else {
        this.oMultiplier_ = 1;
      }
    }

    // If oModifier drops too low, reset variables to their default state.
    if (this.oModifier_ < this.deltaModifier_ * 1000) {
      this.oClicked_ = false;
      this.oIncrement_ = true;
      this.oMultiplier_ = 1;
    }

    this.delay_['feedback'] = this.oMultiplier_ / 10;

    /*
     * Loop through each path segment on the letter O and move each point's
     * coordinates based on time as being evaluated by Sine and Cosine.
     */
    var altI;

    for (this.i_ = 0; this.i_ < this.oPaths_.length; this.i_++) {
      this.oPaths_[this.i_]['segments'][0]['point']['_x'] =
        this.oPathsX_[this.i_][0] +
        Math.cos(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_x'] - this.oPathsX_[this.i_][0])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][0]['point']['_y'] =
        this.oPathsY_[this.i_][0] +
        Math.sin(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_y'] - this.oPathsY_[this.i_][0])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][1]['point']['_x'] =
        this.oPathsX_[this.i_][1] +
        Math.sin(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_x'] - this.oPathsX_[this.i_][1])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][1]['point']['_y'] =
        this.oPathsY_[this.i_][1] +
        Math.cos(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_y'] - this.oPathsY_[this.i_][1])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][2]['point']['_x'] =
        this.oPathsX_[this.i_][2] +
        Math.cos(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_x'] - this.oPathsX_[this.i_][2])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][2]['point']['_y'] =
        this.oPathsY_[this.i_][2] +
        Math.sin(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_y'] - this.oPathsY_[this.i_][2])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][3]['point']['_x'] =
        this.oPathsX_[this.i_][3] +
        Math.sin(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_x'] - this.oPathsX_[this.i_][3])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['segments'][3]['point']['_y'] =
        this.oPathsY_[this.i_][3] +
        Math.cos(this.framesRendered_ / 10 +
        (this.oGroup_['position']['_y'] - this.oPathsY_[this.i_][3])) *
        this.oModifier_ * this.oMultiplier_;

      this.oPaths_[this.i_]['smooth']();
    }
  } else {
    for (this.i_ = 0; this.i_ < this.oPaths_.length; this.i_++) {
      for (altI = 0; altI < this.oPaths_[this.i_]['segments'].length; altI++) {
        this.oPaths_[this.i_]['segments'][altI]['_x'] =
          this.oPathsX_[this.i_][altI];

        this.oPaths_[this.i_]['segments'][altI]['_y'] =
          this.oPathsY_[this.i_][altI];
      }
    }
  }
};
