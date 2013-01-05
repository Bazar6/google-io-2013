goog.require('ww.mode.Core');
goog.provide('ww.mode.PongMode');

/**
 * @constructor
 */
ww.mode.PongMode = function() {
  goog.base(this, 'pong', true, true, true);
};
goog.inherits(ww.mode.PongMode, ww.mode.Core);

/**
 * Function to initialize the current mode.
 * Creates canvas contexts and sets their size.
 * Sets initial variables.
 */
ww.mode.PongMode.prototype.init = function() {
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
   * Sets the mouse position to start at the screen center.
   */
  this.mouseX = this.screenCenterX;
  this.mouseY = this.screenCenterY;

  var world = this.getPhysicsWorld_();
  world['viscosity'] = 0;

  /**
   * Create paddle.
   */
  var paddleWidth = 20;
  var paddleHeight = 200;
  // var paddleX = this.screenCenterX - (this.screenWidthPixels / 4);
  var paddleX = 50;
  var paddleY = this.mouseY - paddleHeight / 2;

  var paddleTopLeft = new paper['Point'](paddleX, paddleY);
  var paddleSize = new paper['Size'](paddleWidth, paddleHeight);
  this.paddle = new paper['Rectangle'](paddleTopLeft, paddleSize);
  this.paperPaddle = new paper['Path']['Rectangle'](this.paddle);
  this.paperPaddle['fillColor'] = 'black';

  this.topWall = new paper['Path']['Rectangle'](
    new paper['Rectangle'](
      new paper['Point'](0, 0),
      new paper['Size'](window.innerWidth, 10)
    )
  );
  this.topWall['fillColor'] = 'red';

  this.bottomWall = new paper['Path']['Rectangle'](
    new paper['Rectangle'](
      new paper['Point'](0, window.innerHeight - 10),
      new paper['Size'](window.innerWidth, 10)
    )
  );
  this.bottomWall['fillColor'] = 'red';

  this.rightWall = new paper['Path']['Rectangle'](
    new paper['Rectangle'](
      new paper['Point'](window.innerWidth - 10, 0),
      new paper['Size'](10, window.innerHeight)
    )
  );
  this.rightWall['fillColor'] = 'red';

  /**
   * Create ball.
   */
  var startXBall = this.screenCenterX + (this.screenWidthPixels / 4);
  var rad = 50;
  this.paperBall = new paper['Path']['Circle'](new paper['Point'](startXBall,
    rad * 3), rad);
  this.paperBall['fillColor'] = 'black';

  var ballSpeed = 150;
  this.ball = new Particle();
  this.ball['setRadius'](rad);
  this.ball['moveTo'](new Vector(startXBall, rad));
  this.ball['drawObj'] = this.paperBall;
  this.ball['vel'] = new Vector(-ballSpeed, ballSpeed);
  world['particles'].push(this.ball);
};

ww.mode.PongMode.prototype.didFocus = function() {
  goog.base(this, 'didFocus');

  var self = this;
  var canvas = this.getPaperCanvas_();
  var evt = Modernizr['touch'] ? 'touchmove' : 'mousemove';

  $(canvas).bind(evt, function(e){
    e.preventDefault();
    e.stopPropagation();

    self.mouseX = e.pageX;
    self.mouseY = e.pageY;
  });
};

ww.mode.PongMode.prototype.didUnfocus = function() {
  goog.base(this, 'didUnfocus');

  var canvas = this.getPaperCanvas_();
  var evt = Modernizr['touch'] ? 'touchmove' : 'mousemove';

  $(canvas).unbind(evt);
};

ww.mode.PongMode.prototype.reflectBall = function(target) {
  /**
   * Window boundary collision detection.
   */
  if (target['pos']['x'] < target['radius']) {
    target['vel']['x'] *= -1;
    this.log('You Lose');
  }

  if (target['pos']['x'] > this.screenWidthPixels - target['radius']) {
    target['vel']['x'] *= -1;
    this.rightWall['fillColor'] = 'orange';
  }

  if (target['pos']['y'] > this.screenHeightPixels - target['radius']) {
    target['vel']['y'] *= -1;
    this.bottomWall['fillColor'] = 'orange';
  }

  if (target['pos']['y'] < target['radius']) {
    target['vel']['y'] *= -1;
    this.topWall['fillColor'] = 'orange';
  }

  /**
   * Paddle collision detection.
   */
  var paddleTop = this.paperPaddle['position']['y'] - (this.paddleHeight / 2);
  var paddleBottom = this.paperPaddle['position']['y'] + (this.paddleHeight / 2);

  if (target['pos']['x'] < (this.paddleX + target['radius'] + (this.paddleWidth / 2)) &&
    (target['pos']['y'] < paddleTop && target['pos']['y'] > paddleBottom)) {
    alert('derp');
    target['vel']['x'] *= -1;
  }
};

ww.mode.PongMode.prototype.onFrame = function(delta) {
  var currentPaddleY = this.paperPaddle['position']['y'];
  var targetPaddleY = this.mouseY;
  this.paperPaddle['position']['y'] = currentPaddleY +
    ((targetPaddleY - currentPaddleY) * 0.5 * (delta/100));

  this.reflectBall(this.ball);

  goog.base(this, 'onFrame', delta);
};
