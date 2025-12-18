/**
 * DmakLoader - Loads SVG data for kanji characters
 * Converted to ES6 module
 */

export class DmakLoader {
	constructor(uri) {
		this.uri = uri;
	}

	/**
	 * Gather SVG data information for a given set of characters.
	 * By default this action is done while instanciating the Word
	 * object, but it can be skipped, see above
	 */
	load(text, callback) {
		const paths = [];
		const nbChar = text.length;
		let done = 0;
		const callbacks = {
			done: (index, data) => {
				paths[index] = data;
				done++;
				if (done === nbChar) {
					callback(paths);
				}
			},
			error: (msg) => {
				console.log("Error", msg);
			}
		};

		for (let i = 0; i < nbChar; i++) {
			loadSvg(this.uri, i, text.charCodeAt(i).toString(16), callbacks);
		}
	}
}

/**
 * Try to load a SVG file matching the given char code.
 * @thanks to the incredible work made by KanjiVG
 * @see: http://kanjivg.tagaini.net
 */
function loadSvg(uri, index, charCode, callbacks) {
	const xhr = new XMLHttpRequest();
	const code = ("00000" + charCode).slice(-5);

	// Skip space character
	if(code === "00020" || code === "03000") {
		callbacks.done(index, {
			paths: [],
			texts: []
		});
		return;
	}

	xhr.open("GET", uri + code + ".svg", true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				callbacks.done(index, parseResponse(xhr.response, code));
			} else {
				callbacks.error(xhr.statusText);
			}
		}
	};
	xhr.send();
}

/**
 * Simple parser to extract paths and texts data.
 */
function parseResponse(response, code) {
	const data = [];
	const dom = new DOMParser().parseFromString(response, "application/xml");
	const texts = dom.querySelectorAll("text");
	const groups = [];
	
	// Private recursive function to parse DOM content
	function __parse(element) {
		const children = element.childNodes;

		for(const child of children) {
			if(child.tagName === "g") {
				groups.push(child.getAttribute("id"));
				__parse(child);
				groups.splice(groups.indexOf(child.getAttribute("id")), 1);
			}
			else if(child.tagName === "path") {
				data.push({
					"path" : child.getAttribute("d"),
					"groups" : groups.slice(0)
				});
			}
		}
	}

	// Start parsing
	__parse(dom.getElementById("kvg:" + code));

	// And finally add order mark information
	for (let i = 0; i < texts.length; i++) {
		if (data[i]) {
			data[i].text = {
				"value" : texts[i].textContent,
				"x" : texts[i].getAttribute("transform").split(" ")[4],
				"y" : texts[i].getAttribute("transform").split(" ")[5].replace(")", "")
			};
		}
	}
	
	return data;
}

