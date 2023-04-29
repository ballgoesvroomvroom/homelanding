const path = require("path")
const fs = require("fs")

class Parser {
	static headerParser = /^\s*?(?<depth>#{1,6})\s*(?<content>.*?)$/
	static lineSplit = /\r?\n/g

	constructor(content) {
		this.content = content

		// split headers into sections (with subheaders represented as nested arrays)
		this.sections = []

		// build result (parsed to html)
		this.buildResult = ""
	}

	parse() {
		// split it into lines
		var lines = this.content.split(Parser.lineSplit)

		// split it into sections first
		var currentHeader = 0

		// create a first buffer frame to store paragraph content
		var root = []
		var hierarchyPath = [root] // shows the hierarchy within the current session with index 0 as the root section
		this.sections.push(root)

		for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
			// determine if this line is a header
			var line = lines[lineIdx]

			var headerMatch = line.match(Parser.headerParser)
			if (headerMatch) {
				// is a header
				var headerLevel = headerMatch.groups.depth.length // number of hash symbols denote how deep the header is
				var headerContent = headerMatch.groups.content

				if (headerLevel === 1) {
					// create new section
					var content = [headerContent]
					hierarchyPath = [root, content] // update path
					this.sections.push(content)
				} else {
					// h2 or bigger, add it to current section

					// if h2, hierarchyPath[1] should be the h1
					var childrenToDetach = (headerLevel - hierarchyPath.length)
					for (let removalIdx = 0; removalIdx < childrenToDetach; removalIdx++) {
						hierarchyPath.pop()
					}

					var content = [headerContent]

					// add it as a children element within the section container
					hierarchyPath[headerLevel -1].push(content)

					// add it to the hierarchy
					hierarchyPath.push(content)
				}
			} else {
				// regular paragraph
				hierarchyPath[hierarchyPath.length -1].push(line)
			}
		}

		return this.sections
	}

	_buildHeaderFromArray(headerLevel, array, beautify=true, indent=0) {
		// builds array returns in ocntent enclosed by <h<headerLevel>> tag
		// recursive function
		var endLine = beautify ? `\n${"\t".repeat(indent)}` : ""
		var result = "\t".repeat(indent)

		for (let i = 0; i < array.length; i++) {
			if (i === 0) {
				// do not overwrite value of result since it is a recursive approach
				result += `<h${headerLevel}>${array[i]}</h${headerLevel}>${endLine}`
			} else if (typeof array[i] == "object") {
				result += this._buildHeaderFromArray(headerLevel +1, array[i], beautify, indent)
			} else {
				result += `<p>${array[i]}</p>${endLine}`
			}
		}

		// return trimmed endTag
		if (beautify && endLine.length > 1) {
			result = result.slice(0, -endLine.length +1) // +1 for \n character
		}
		return result
	}

	build(parsedContents, beautify=true) {
		this.buildResult = "" // reset content

		// keep track of header level
		var headerLevel = 0;

		for (let i = 0; i < parsedContents.length; i++) {
			if (i === 0) {
				// first container represent floater tags
				// no header, build p tags instead
				var floaterData = parsedContents[0]
				for (let p = 0; p < floaterData.length; p++) {
					this.buildResult += `<p>${floaterData[p]}</p>`
				}
			} else {
				headerLevel = 1

				// build section container
				this.buildResult += (beautify ? "\n" : "") +"<section>\n"
				this.buildResult += this._buildHeaderFromArray(headerLevel, parsedContents[i], beautify, 1)

				// close section tag
				this.buildResult += (beautify ? "\n" : "") +"</section>"
			}
		}

		return this.buildResult
	}
}

function parseContent(data) {
	const p = new Parser(data)
	return p.build(p.parse())
}

// TEST
// var contentFetch = new Promise((res, rej) => {
// 	fs.readFile(path.join(__dirname, "./sample.md"), "utf-8", (err, data) => {
// 		if (err) {
// 			console.log("[DEBUG]: error loading file contents of", path.join(__dirname, "./sample.md"))
// 			return rej()
// 		} else {
// 			return res(data)
// 		}
// 	})
// })

module.exports = parseContent