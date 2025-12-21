/**
 * Draw Me A Kanji (dmak) - ES6 Module Version
 * Render your Japanese writings with fun and taste
 */

import { DmakLoader } from './dmakLoader.js';

export class Dmak {
	constructor(text, options, Raphael) {
		if (!Raphael) {
			throw new Error('Raphael is required. Please provide Raphael instance.');
		}
		
		this.Raphael = Raphael;
		this.text = text;
		// Fix #18 clone `default` to support several instance in parallel
		this.options = assign(clone(Dmak.default), options);
		this.strokes = [];
		this.papers = [];
		this.pointer = 0;
		this.timeouts = {
			play : [],
			erasing : [],
			drawing : []
		};

		if (!this.options.skipLoad) {
			const loader = new DmakLoader(this.options.uri);

			loader.load(text, (data) => {
				this.prepare(data);

				// Execute custom callback "loaded" here
				this.options.loaded(this.strokes);

				if (this.options.autoplay) {
					this.render(this.options.renderAt);
				} else {
					if (this.options.renderAt) {
						this.render(this.options.renderAt)
					}
				}
			});
		}
	}

	/**
	 * Prepare kanjis and papers for rendering.
	 */
	prepare(data) {
		this.strokes = preprocessStrokes(data, this.options, this.Raphael);
		this.papers = giveBirthToRaphael(data.length, this.options, this.Raphael);
		if (this.options.grid.show) {
			showGrid(this.papers, this.options);
		}
	}

	/**
	 * Clean all strokes on papers.
	 */
	erase(end) {
		// Cannot have two rendering process for the same draw. Keep it cool.
		if (this.timeouts.play.length) {
			return false;
		}

		// Don't go behind the beginning.
		if (this.pointer <= 0) {
			return false;
		}

		if (end === undefined) {
			end = 0;
		}

		do {
			this.pointer--;
			eraseStroke(this.strokes[this.pointer], this.timeouts.erasing, this.options);

			// Execute custom callback "erased" here
			this.options.erased(this.pointer);
		}
		while (this.pointer > end);
	}

	/**
	 * All the magic happens here.
	 */
	render(end) {
		// Cannot have two rendering process for
		// the same draw. Keep it cool.
		if (this.timeouts.play.length) {
			return false;
		}

		if (end === undefined || end === null) {
			end = this.strokes.length;
		} else if (end > this.strokes.length) {
			return false;
		}

		const cb = (that) => {
			drawStroke(that.papers[that.strokes[that.pointer].char], that.strokes[that.pointer], that.timeouts.drawing, that.options, that.Raphael);

			// Execute custom callback "drew" here
			that.options.drew(that.pointer);

			that.pointer++;
			that.timeouts.play.shift();
		};
		let delay = 0;
		let i;

		// Before drawing clear any remaining erasing timeouts
		for (i = 0; i < this.timeouts.erasing.length; i++) {
			globalThis.clearTimeout(this.timeouts.erasing[i]);
			this.timeouts.erasing = [];
		}

		for (i = this.pointer; i < end; i++) {
			if (!this.options.stroke.animated.drawing || delay <= 0) {
				cb(this);
			} else {
				this.timeouts.play.push(globalThis.setTimeout(cb, delay, this));
			}
			delay += this.strokes[i].duration;
		}
	}

	/**
	 * Pause rendering
	 */
	pause() {
		for (const timeout of this.timeouts.play) {
			globalThis.clearTimeout(timeout);
		}
		this.timeouts.play = [];
	}

	/**
	 * Wrap the erase function to remove the x last strokes.
	 */
	eraseLastStrokes(nbStrokes) {
		this.erase(this.pointer - nbStrokes);
	}

	/**
	 * Wrap the render function to render the x next strokes.
	 */
	renderNextStrokes(nbStrokes) {
		this.render(this.pointer + nbStrokes);
	}
}

// Current version.
Dmak.VERSION = "0.3.1";

Dmak.default = {
	uri: "",
	skipLoad: false,
	autoplay: true,
	height: 109,
	width: 109,
	viewBox: {
		x: 0,
		y: 0,
		w: 109,
		h: 109
	},
	step: 0.03,
	renderAt: null,
	element: "draw",
	stroke: {
		animated : {
			drawing : true,
			erasing : true
		},
		order: {
			visible: false,
			attr: {
				"font-size": "8",
				"fill": "#999999"
			}
		},
		attr: {
			"active": "#BF0000",
			// may use the keyword "random" here for random color
			"stroke": "#2C2C2C",
			"stroke-width": 4,
			"stroke-linecap": "round",
			"stroke-linejoin": "round"
		}
	},
	grid: {
		show: true,
		attr: {
			"stroke": "#CCCCCC",
			"stroke-width": 0.5,
			"stroke-dasharray": "--"
		}
	},
	loaded: function () {
		// a callback
	},
	erased: function () {
		// a callback
	},
	drew: function () {
		// a callback
	}
};

// HELPERS

/**
 * Flattens the array of strokes ; 3D > 2D and does some preprocessing while
 * looping through all the strokes:
 *  - Maps to a character index
 *  - Calculates path length
 */
function preprocessStrokes(data, options, Raphael) {
	const strokes = [];
	let stroke;
	let length;

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			length = Raphael.getTotalLength(data[i][j].path);
			stroke = {
				"char": i,
				"length": length,
				"duration": length * options.step * 1000,
				"path": data[i][j].path,
				"groups" : data[i][j].groups,
				"text": data[i][j].text,
				"object": {
					"path" : null,
					"text": null
				}
			};
			strokes.push(stroke);
		}
	}

	return strokes;
}

/**
 * Init Raphael paper objects
 */
function giveBirthToRaphael(nbChar, options, Raphael) {
	const papers = [];

	for (let i = 0; i < nbChar; i++) {
		const paper = new Raphael(options.element, options.width + "px", options.height + "px");
		paper.setViewBox(options.viewBox.x, options.viewBox.y, options.viewBox.w, options.viewBox.h);
		paper.canvas.setAttribute("class", "dmak-svg");
		papers.push(paper);
	}
	return papers.reverse();
}

/**
 * Draw the background grid
 */
function showGrid(papers, options) {
	for (const paper of papers) {
		paper.path("M" + (options.viewBox.w / 2) + ",0 L" + (options.viewBox.w / 2) + "," + options.viewBox.h).attr(options.grid.attr);
		paper.path("M0," + (options.viewBox.h / 2) + " L" + options.viewBox.w + "," + (options.viewBox.h / 2)).attr(options.grid.attr);
	}
}

/**
 * Remove a single stroke ; deletion can be animated if set as so.
 */
function eraseStroke(stroke, timeouts, options) {
	// In some cases the text object may be null:
	//  - Stroke order display disabled
	//  - Stroke already deleted
	if (stroke.object.text !== null) {
		stroke.object.text.remove();
	}

	const cb = function() {
		stroke.object.path.remove();

		// Finally properly prepare the object variable
		stroke.object = {
			"path" : null,
			"text" : null
		};

		timeouts.shift();
	};

	if (options.stroke.animated.erasing) {
		stroke.object.path.node.style.stroke = options.stroke.attr.active;
		timeouts.push(animateStroke(stroke, -1, options, cb));
	}
	else {
		cb();
	}
}

/**
 * Draw a single stroke ; drawing can be animated if set as so.
 */
function drawStroke(paper, stroke, timeouts, options, Raphael) {
	const cb = function() {
		// The stroke object may have been already erased when we reach this timeout
		if (stroke.object.path === null) {
			return;
		}

		let color = options.stroke.attr.stroke;
		if(options.stroke.attr.stroke === "random") {
			color = Raphael.getColor();
		}

		// Revert back to the default color.
		stroke.object.path.node.style.stroke = color;
		stroke.object.path.node.style.transition = stroke.object.path.node.style.WebkitTransition = "stroke 400ms ease";

		timeouts.shift();
	};

	stroke.object.path = paper.path(stroke.path);
	stroke.object.path.attr(options.stroke.attr);

	if (options.stroke.order.visible) {
		showStrokeOrder(paper, stroke, options);
	}

	if (options.stroke.animated.drawing) {
		animateStroke(stroke, 1, options, cb);
	}
	else {
		cb();
	}
}

/**
 * Draw a single next to
 */
function showStrokeOrder(paper, stroke, options) {
	stroke.object.text = paper.text(stroke.text.x, stroke.text.y, stroke.text.value);
	stroke.object.text.attr(options.stroke.order.attr);
}

/**
 * Animate stroke drawing.
 * Based on the great article wrote by Jake Archibald
 * http://jakearchibald.com/2013/animated-line-drawing-svg/
 */
function animateStroke(stroke, direction, options, callback) {
	stroke.object.path.attr({"stroke": options.stroke.attr.active});
	stroke.object.path.node.style.transition = stroke.object.path.node.style.WebkitTransition = "none";

	// Set up the starting positions
	stroke.object.path.node.style.strokeDasharray = stroke.length + " " + stroke.length;
	stroke.object.path.node.style.strokeDashoffset = (direction > 0) ? stroke.length : 0;

	// Trigger a layout so styles are calculated & the browser
	// picks up the starting position before animating
	stroke.object.path.node.getBoundingClientRect();
	stroke.object.path.node.style.transition = stroke.object.path.node.style.WebkitTransition = "stroke-dashoffset " + stroke.duration + "ms ease";

	// Go!
	stroke.object.path.node.style.strokeDashoffset = (direction > 0) ? "0" : stroke.length;

	// Execute the callback once the animation is done
	// and return the timeout id.
	return globalThis.setTimeout(callback, stroke.duration);
}

/**
 * Helper function to clone an object
 */
function clone(object) {
	if (object === null || typeof object !== "object") {
		return object;
	}

	const temp = object.constructor(); // give temp the original object's constructor
	for (const key in object) {
		temp[key] = clone(object[key]);
	}

	return temp;
}

/**
 * Helper function to copy own properties over to the destination object.
 */
function assign(source, replacement) {
	if (arguments.length !== 2) {
		throw new Error("Missing arguments in assign function");
	}

	for (const key in source) {
		if (replacement.hasOwnProperty(key)) {
			source[key] = (replacement[key] !== null && typeof replacement[key] === "object") ? assign(source[key], replacement[key]) : replacement[key];
		}
	}
	return source;
}

