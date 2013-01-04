goog.provide('ww.mode.Core');
goog.require('goog.events');

/**
 * RequestAnimationFrame polyfill.
 */
 (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] +
                                      'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] ||
          window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
              callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

window['AudioContext'] = (
  window['AudioContext'] ||
  window['webkitAudioContext'] ||
  null
);

/**
 * @constructor
 * @param {String} name Name of the mode.
 * @param {Boolean} wantsAudio Whether this mode needs webAudio.
 * @param {Boolean} wantsDrawing Whether this mode needs to draw onFrame.
 * @param {Boolean} wantsPhysics Whether this mode needs physics.
 */
ww.mode.Core = function(name, wantsAudio, wantsDrawing, wantsPhysics) {
  this.name_ = name;

  this.hasFocus = false;

  // By default, modes don't need audio.
  this.wantsAudio_ = (wantsAudio && window['AudioContext']) || false;

  // By default, modes don't need audio.
  this.wantsDrawing_ = wantsDrawing || false;

  // By default, modes don't need audio.
  this.wantsPhysics_ = wantsPhysics || false;

  // By default, modes don't need rAF.
  this.wantsRenderLoop_ = this.wantsDrawing_ || this.wantsPhysics_ || false;
  this.shouldRenderNextFrame_ = false;

  // Bind a copy of render method for rAF
  this.boundRenderFrame_ = goog.bind(this.renderFrame_, this);

  if (DEBUG_MODE) {
    this.addDebugUI_();
  }

  $(document.body).css({ minHeight: window.innerHeight + 100 });
  setTimeout(function(){
    window.scrollTo(0, 1);
    setTimeout(function(){
      $(document.body).css({ minHeight: 'auto' });
    }, 20);
  }, 0);

  var self = this;

  goog.events.listen(window, 'message', function(evt) {
    var data = evt.getBrowserEvent().data;
    self.log('Got message: ' + data['name'], data);

    if (data['name'] === 'focus') {
      self['focus']();
    } else if (data['name'] === 'unfocus') {
      self['unfocus']();
    }
  });

  this.letterI = $('#letter-i');
  this.letterO = $('#letter-o');

  // Short-cuts to activating letters for basics setup.
  var hammerOpts = { 'prevent_default': true };
  this.letterI.bind('tap', hammerOpts, function() {
    self.activateI();
  });

  this.letterO.bind('tap', hammerOpts, function() {
    self.activateO();
  });

  $(document).keypress(function(e) {
    if (e.keyCode === 105) {
      self.activateI();
    } else if (e.keyCode === 111) {
      self.activateO();
    } else {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  this.window_ = $(window);
  this.width_ = 0;
  this.height_ = 0;

  // TODO: Throttle
  this.window_.resize(function() {
    self.onResize(true);
  });
  this.onResize();

  // Catch top-level touch events and cancel them to avoid
  // mobile browser scroll.
  if (Modernizr['touch']) {
    $(document.body)
      .css(Modernizr.prefixed("userSelect"), "none")
      .css(Modernizr.prefixed("touchCallout"), "none")
      .css(Modernizr.prefixed("userDrag"), "none")
      .css(Modernizr.prefixed("tapHighlightColor"), "rgba(0,0,0,0)");

    // $(document).bind('touchmove', function(evt) {
    //   evt.preventDefault();
    //   evt.stopPropagation();
    // });
  }

  // $(document.body).addClass(this.name_ + '-mode');

  this.init();

  // Mark this mode as ready.
  this.ready();
};

/**
 * Log a message.
 * @param {String} msg The message to log.
 */
ww.mode.Core.prototype.log = function(msg) {
  if (DEBUG_MODE && console && console.log) {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = this.name_ + ': ' + args[0];
    }
    console.log.apply(console, args);
  }
};

/**
 * Initialize (or re-initialize) the mode
 */
ww.mode.Core.prototype.init = function() {
  this.log('Init');

  if (this.wantsPhysics_) {
    this.resetPhysicsWorld_();
  }
};

/**
 * Handles a browser window resize.
 * @param {Boolean} redraw Whether resize redraws.
 */
ww.mode.Core.prototype.onResize = function(redraw) {
  this.width_ = this.window_.width();
  this.height_ = this.window_.height();
  this.log('Resize ' + this.width_ + 'x' + this.height_);

  if (this.paperCanvas_) {
    this.paperCanvas_.width = this.width_;
    this.paperCanvas_.height = this.height_;
    paper['view']['setViewSize'](this.width_, this.height_);
  }

  if (redraw) {
    this.redraw();
  }
};

if (DEBUG_MODE) {
  /**
   * Add play/pause/restart UI.
   * @private
   */
  ww.mode.Core.prototype.addDebugUI_ = function() {
    var self = this;

    var focusElem = document.createElement('button');
    focusElem.style.fontSize = '15px';
    focusElem.innerHTML = "Focus";
    focusElem.onclick = function() {
      self['focus']();
    };

    var unfocusElem = document.createElement('button');
    unfocusElem.style.fontSize = '15px';
    unfocusElem.innerHTML = "Unfocus";
    unfocusElem.onclick = function() {
      self['unfocus']();
    };

    var restartElem = document.createElement('button');
    restartElem.style.fontSize = '15px';
    restartElem.innerHTML = "Restart";
    restartElem.onclick = function() {
      self.init();
    };

    var containerElem = document.createElement('div');
    containerElem.style.position = 'fixed';
    containerElem.style.bottom = 0;
    containerElem.style.left = 0;
    containerElem.style.right = 0;
    containerElem.style.height = '40px';
    containerElem.style.background = 'rgba(0,0,0,0.2)';

    containerElem.appendChild(focusElem);
    containerElem.appendChild(unfocusElem);
    containerElem.appendChild(restartElem);

    document.body.appendChild(containerElem);
  };
}

/**
 * Begin running rAF, but only if mode needs it.
 */
ww.mode.Core.prototype.startRendering = function() {
  // No-op if mode doesn't need rAF
  if (!this.wantsRenderLoop_) { return; }

  this.lastTime_ = new Date().getTime();

  // Only start rAF if we're not already rendering.
  if (!this.shouldRenderNextFrame_) {
    this.shouldRenderNextFrame_ = true;
    this.boundRenderFrame_();
  }
};

/**
 * Stop running rAF, but only if mode needs it.
 */
ww.mode.Core.prototype.stopRendering = function() {
  // No-op if mode doesn't need rAF
  if (!this.wantsRenderLoop_) { return; }

  this.shouldRenderNextFrame_ = false;
};

/**
 * Render a single frame. Call the mode's draw method,
 * then schedule the next frame if we need it.
 */
ww.mode.Core.prototype.renderFrame_ = function() {
  var currentTime = new Date().getTime();
  var delta = currentTime - this.lastTime_;

  // Reduce large gaps (returning from background tab) to
  // a single frame.
  if (delta > 500) {
    delta = 16.7;
  }

  if (this.wantsPhysics_) {
    this.stepPhysics(delta);
  }

  if (this.wantsDrawing_) {
    this.onFrame(delta);
  }

  this.lastTime_ = currentTime;

  // Schedule the next frame.
  if (this.shouldRenderNextFrame_) {
    requestAnimationFrame(this.boundRenderFrame_);
  }
};

/**
 * Redraw without stepping (for resizes).
 */
ww.mode.Core.prototype.redraw = function() {
  if (this.wantsDrawing_) {
    this.onFrame(0);
  }
};

/**
 * Draw a single frame.
 * @param {Number} delta Ms since last draw.
 */
ww.mode.Core.prototype.onFrame = function(delta) {
  // Render paper if we're using it
  if (this.paperCanvas_) {
    paper['view']['draw']();
  }
};

/**
 * Tell parent frame that this mode is ready.
 */
ww.mode.Core.prototype.ready = function() {
  window['currentMode'] = this;

  this.log('Is ready');

  // Notify parent frame that we are ready.
  this.sendMessage_(this.name_ + '.ready');
};

/**
 * Send the parent a message.
 * @private
 * @param {String} msgName DNS-style message path.
 * @param {Object} value The data to send.
 */
ww.mode.Core.prototype.sendMessage_ = function(msgName, value) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage({
      'name': msgName,
      'data': value
    }, '*');
  }
};

/**
 * Focus this mode (start rendering).
 */
ww.mode.Core.prototype['focus'] = function() {
  if (this.hasFocus) { return; }

  this.log('Got focus');
  this.hasFocus = true;

  // Try to start rAF if requested.
  this.startRendering();

  this.didFocus();
};

/**
 * Event is called after a mode focused.
 */
ww.mode.Core.prototype.didFocus = function() {
  // no-op
};

/**
 * Unfocus this mode (stop rendering).
 */
ww.mode.Core.prototype['unfocus'] = function() {
  if (!this.hasFocus) { return; }

  this.log('Lost focus');
  this.hasFocus = false;

  // Try to stop rAF if requested.
  this.stopRendering();

  this.didUnfocus();
};

/**
 * Event is called after a mode unfocused.
 */
ww.mode.Core.prototype.didUnfocus = function() {
  // no-op
};

/**
 * Load a sound buffer (binary audio file).
 * @private
 * @param {String} url Audio file URL.
 * @param {Function} gotSound On-load callback.
 */
ww.mode.Core.prototype.getSoundBuffer_ = function(url, gotSound) {
  this.soundBuffers_ = this.soundBuffers_ || {};

  if (this.soundBuffers_[url]) {
    gotSound(this.soundBuffers_[url]);
    return;
  }

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  var self = this;
  request.onload = function() {
    var audioContext = this.getAudioContext_();
    audioContext['decodeAudioData'](request.response, function(buffer) {
      self.soundBuffers_[url] = buffer;
      gotSound(self.soundBuffers_[url]);
    }, function() {
      // debugger;
    });
  };
  request.send();
};

/**
 * Get a physics world.
 * @private
 * @return {Physics} The shared audio context.
 */
ww.mode.Core.prototype.getPhysicsWorld_ = function() {
  this.physicsWorld_ = this.physicsWorld_ || new window['Physics']();
  return this.physicsWorld_;
};

/**
 * Clear world.
 * @private
 */
ww.mode.Core.prototype.resetPhysicsWorld_ = function() {
  if (this.physicsWorld_ && this.physicsWorld_['destroy']) {
    this.physicsWorld_['destroy']();
  }

  this.physicsWorld_ = null;
};

/**
 * Step forward in time for physics.
 * @param {Number} delta Ms since last step.
 */
ww.mode.Core.prototype.stepPhysics = function(delta) {
  if (delta > 0) {
    var world = this.getPhysicsWorld_();
    world.step();

    for (var i = 0; i < world['particles'].length; i++) {
      var p = world['particles'][i];
      if (p['drawObj'] || p['drawObj']['position']) {
        p['drawObj']['position']['x'] = p['pos']['x'];
        p['drawObj']['position']['y'] = p['pos']['y'];
      }
    }
  }
};

/**
 * Get an audio context.
 * @private
 * @return {AudioContext} The shared audio context.
 */
ww.mode.Core.prototype.getAudioContext_ = function() {
  this.audioContext_ = this.audioContext_ || new window['AudioContext']();
  return this.audioContext_;
};

/**
 * Play a sound by url.
 * @param {String} filename Audio file name.
 */
ww.mode.Core.prototype.playSound = function(filename) {
  if (!this.wantsAudio_) { return; }

  var url = '../sounds/' + this.name_ + '/' + filename;

  this.log('Requested sound "' + filename + '" from "' + url + '"');

  var audioContext = this.getAudioContext_();

  this.getSoundBuffer_(url, function(buffer) {
    var source = audioContext['createBufferSource']();
    source['buffer'] = buffer;
    source['connect'](audioContext['destination']);
    source['noteOn'](0);
  });
};

/**
 * Method called when activating the I.
 */
ww.mode.Core.prototype.activateI = function() {
  // no-op
  this.log('Activated "I"');
};

/**
 * Method called when activating the O.
 */
ww.mode.Core.prototype.activateO = function() {
  // no-op
  this.log('Activated "O"');
};

/**
 * Get a canvas for use with paperjs.
 * @return {Element} The canvas element.
 */
ww.mode.Core.prototype.getPaperCanvas_ = function() {
  if (!this.paperCanvas_) {
    this.paperCanvas_ = document.createElement('canvas');
    this.paperCanvas_.width = this.width_;
    this.paperCanvas_.height = this.height_;
    $(document.body).prepend(this.paperCanvas_);

    paper['setup'](this.paperCanvas_);
  }

  return this.paperCanvas_;
};