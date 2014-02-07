/**
 * Registration process page module
 *
 * This handles preventing users from selecting the same security question more
 * than once. The idea is once you select a question in one of the select
 * elements, it must be removed from the others.
 */

define(function(require) {
    'use strict';

    var $ = require('jquery');

    /**
     * Sets Global Selectors
     *
     * @type Variable
     */
    var DIRECTION_PREVIOUS = 'previous';
    var SELECTORS = {
        IS_ACTIVE: 'isActive'
    };

    var ChartCarousel = function ($element) {
        /**
         * A reference to the containing DOM element.
         *
         * @default null
         * @property $element
         * @type {jQuery}
         * @public
         */
        this.$element = $element;

        /**
         * Tracks whether component is enabled.
         *
         * @default false
         * @property isEnabled
         * @type {Boolean}
         * @public
         */
        this.isEnabled = false;

        /**
         * Sets default index value.
         *
         * @default 0
         * @property index
         * @type {Number}
         * @public
         */
        this.index = 0;

        /**
         * Sets default numberOfSlides value.
         *
         * @default 0
         * @property numberOfSlides
         * @type {Number}
         * @public
         */
        this.numberOfSlides = 0;

        this.init();
    };

    ChartCarousel.prototype.init = function() {
        this.setupHandlers()
            .createChildren()
            .layout()
            .enable()
            .updateSlideIndex(this.index);

        return this;  
    };

    ChartCarousel.prototype.setupHandlers = function() {
    	this.onClickHandler = this.onClick.bind(this);
    	this.onClickThumbnailHandler = this.onClickThumbnail.bind(this);

    	return this;
    };

    ChartCarousel.prototype.createChildren = function() {
    	// Charts
    	this.$chartSlide = this.$element.find('.chartSlide');

    	// Buttons
    	this.$controlButton = this.$element.find('.carousel-button');

    	// Thumbnails
    	this.$chartSlideThumb = this.$element.find('.chartThumbSlide');
    	this.$chartSlideThumbWrapper = this.$element.find('.carouselThumbnail');

    	// Total Slides
    	this.$totalNumberofSlides = this.$element.find('.carousel-length');

    	// Current Slide Index
    	this.$currentSlideIndex = this.$element.find('.carousel-current');

    	return this;
    };

    ChartCarousel.prototype.layout = function() {
        // sets numberOfSlides / 0 based 
        this.numberOfSlides = this.$chartSlideThumb.length - 1;

    	// adds class of isActive to first thumbnail on load
    	this.$chartSlideThumb.first().addClass(SELECTORS.IS_ACTIVE);

    	// gets total number of slides and adds valie to .carousel-length
    	this.$totalNumberofSlides.append(this.numberOfSlides + 1);

    	return this;
    };

    ChartCarousel.prototype.enable = function() {
    	if (this.isEnabled) {
            return this;
        }

        this.$controlButton.on('click', this.onClickHandler);
        this.$chartSlideThumb.on('click', this.onClickThumbnailHandler);
        
        this.isEnabled = true;
    	
    	return this;
    };

    ChartCarousel.prototype.onClickThumbnail = function(e, index) {
        // no e.preventDefault due to thumbnails not being anchor tags
        // gets current clicked target
        var $clickedEl = $(e.currentTarget);

        // gets the index of the $clickedEl and storges it to this.clickedElIndex
        this.clickedElIndex = $clickedEl.index();

        // sets index to the clickedElIndex
        this.index = this.clickedElIndex;

        // checks if isActive is already applied and exits out if so
        if ($clickedEl.hasClass(SELECTORS.IS_ACTIVE)) { return false };

        // fires updateSlideDisplay with clickedEl index
        this.updateSlideDisplay(this.clickedElIndex);
    };

    ChartCarousel.prototype.onClick = function(e) {
        e.preventDefault();

        // gets element clicked
        var $clickedEl = $(e.currentTarget);

        var thumbnailDataAttrDirection = $clickedEl.data('direction') === DIRECTION_PREVIOUS;

        // if not 
        if (!thumbnailDataAttrDirection) {
            return this.showNextSlide();
        }
            
        this.showPreviousSlide();
    };

    ChartCarousel.prototype.showNextSlide = function() {
    	// adds positive counter to index when element is clicked
    	var currentSlideIndex = this.index++;

    	// resets index if you're on the last slide and hit next
    	if (currentSlideIndex === this.numberOfSlides) {
    		this.index = 0;
    	}

    	// fires updateSlideDisplay if index is less than or equal to total number of slides
    	if (this.index <= this.numberOfSlides) {
    		this.updateSlideDisplay(this.index);
    	}

    	return this;
    };

    ChartCarousel.prototype.showPreviousSlide = function() {
    	// adds negative counter to index when element is clicked
    	var currentSlideIndex = this.index--;

    	// sets the index to number of slides if you're on the first - 0 based
    	if (currentSlideIndex === 0) {
    		this.index = this.numberOfSlides;
    	}

    	// fires updateSlideDisplay if index is less than or equal to total number of slides
    	if (this.index <= this.numberOfSlides) {
    		this.updateSlideDisplay(this.index);
    	}

    	return this;
    };

    ChartCarousel.prototype.updateSlideDisplay = function(index) {
    	// removes isActive Class from all thumbnails
    	this.$chartSlideThumb.removeClass(SELECTORS.IS_ACTIVE);

    	// hides all charts and based on index, fades in chart according to current index value
    	this.$chartSlide.hide().eq(index).fadeIn();

    	// adds isActive class to thumbnail based on index
    	this.$chartSlideThumb.eq(this.index).addClass(SELECTORS.IS_ACTIVE);

    	// if you go from first slide to the last slide, this handles the animation to the fourth to last slide
    	// so there's always 4 per page
    	if (index === this.numberOfSlides - 1) {
    		this.animateThumbnails(this.numberOfSlides - 3);

    		return this.updateSlideIndex(index);
    	}

    	// if you're on any of the last 4 slides, this exits out before the animation
    	if (index >= this.numberOfSlides - 3) {
    		return this.updateSlideIndex(index);
    	}

    	this.animateThumbnails(index);
    };

    ChartCarousel.prototype.animateThumbnails = function(index, animate) {
    	// animates thumbnails by getting the width of the thumbnail and multiplying by the index negatively
    	this.$chartSlideThumb.animate({
            // gets outerWidth of thumbnails, adds true to take into account margin
    		left: this.$chartSlideThumb.outerWidth(true) * -index
    	});

    	this.updateSlideIndex(index);
    };

    ChartCarousel.prototype.updateSlideIndex = function(index) {
    	// emptys out element and appends the current slide index + 1 (not 0 based)
    	this.$currentSlideIndex.empty().append(index + 1);

    	return this;
    };

    return ChartCarousel;
});