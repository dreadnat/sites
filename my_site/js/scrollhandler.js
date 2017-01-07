var ScrollHandler = new Class({ 
   Implements : [Options],
   options     : {               // All available options for ComponentButtonsSet.
      container   : null,        // Container which will manage the scroll.
      mode        : 'vertical',  // Vertical or horizontal mode.
      restarea    : 10,           // 20121206-0955 value is 10 / Number of pixels in the middle of the container where the scroll animation is inactive.
      maxspeed    : 16,           // 20121206-0955 value is 24 / Speed factor at both ends of the container.
      onChange    : null         // Optional. If we want to handle change event.
   },
   frameSize  : {x:0,y:0},
   actualSize : {x:0,y:0},
   axis        : null,           // x or y axis.
   state       : {
      runing      : false,
      direction   : 'none'
   },
   initialize: function(options) {

      this.setOptions(options);

      this.container = $(this.options.container);

      this.axis      = (this.options.mode == 'vertical') ? 'y' : 'x';

      this.bounds    = {
         mousemove   : this.engine.bindWithEvent(this),
         mouseleave  : this.stopScroll.bind(this)
      }

      this.container.addEvents(this.bounds);
   },
   engine: function(e) {
      
      this.frameSize    = this.container.getSize();
      this.actualSize   = this.container.getScrollSize();
      var scroll        = this.container.getScroll();
      var offset        = this.container.getPosition();
      
      // Current mouse position compared to the container.
      var position      = e.page[this.axis] - offset[this.axis] - scroll[this.axis];

      // Left side of inactive area (restarea).
      var leftbound     = (this.frameSize[this.axis] - this.options.restarea) / 2;

      // Right side of inactive area (restarea).
      var rightbound    = (this.frameSize[this.axis] + this.options.restarea) / 2;
      

      if (position > rightbound) {     // Go to right side.
         
         this.scrollspeed = (position - rightbound) / ((this.frameSize[this.axis] - this.options.restarea) / 2) * this.options.maxspeed;
         
         // If the direction is changed.
         if(this.state.runing && this.state.direction != 'next') {
            this.stopScroll();
         }

         // If the direction is not changed then the speed has changed.
         if(!this.state.runing) {
            $clear(this.scrollInterval);
            this.scrollInterval = this.scrollNext.periodical(10, this);
         }
      
      } else if (position < leftbound) {  // Go to left side.
         
         this.scrollspeed = (leftbound - position) / ((this.frameSize[this.axis] - this.options.restarea) / 2) * this.options.maxspeed;

         // If the direction is changed.
         if(this.state.runing && this.state.direction != 'previous') {
            this.stopScroll();
         }

         // If the direction is not changed then the speed has changed.
         if(!this.state.runing) {
            $clear(this.scrollInterval);
            this.scrollInterval = this.scrollPrev.periodical(10, this)
         }

      } else {
         // The cursor is in the rest area.
         this.stopScroll();
         this.scrollspeed = 0;

      }
   },
   stopScroll: function(e) {
      $clear(this.scrollInterval);

      // Set state of the object.
      this.state.runing    = false;
      this.state.direction = 'none';
   },
   scrollPrev: function() {

      this.state.runing       = true;
      this.state.direction    = 'previous';

      var scroll              = this.container.getScroll();

      if (scroll[this.axis] > 0) {
         this.setScroll(scroll[this.axis] - this.scrollspeed);
      } else {
         this.stopScroll();
      }
   },
   scrollNext: function() {
      this.state.runing       = true;
      this.state.direction    = 'next';

      var scroll              = this.container.getScroll();

      if (scroll[this.axis] < (this.actualSize[this.axis] - this.frameSize[this.axis])) {
         this.setScroll(scroll[this.axis] + this.scrollspeed);
      } else {
         this.stopScroll();
      }
   },
   setScroll: function(offset) {

      offset = parseInt(offset);

      if(this.options.mode == 'vertical'){
         this.container.scrollTo(0, offset);
      } else {
         this.container.scrollTo(offset);
      }

      if(this.options.onChange) {
         this.options.onChange.apply(this, arguments);
      }
   }
});