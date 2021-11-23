"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
// @ts-ignore -- importing using typescript does not work for some reason
var fm = require('front-matter');
var dir = './data-md/';
var distDir = '../dist/indexes/';
// Use glob ?
// Use copyfiles ?
// Use something else ?
function main() {
    // Read all MD in one folder
    // Build index as a JSON object
    // - use frontmatter to handle metadata
    // Export index in /dist
    // Do it again for each language
    function getFiles(dir, files_) {
        if (files_ === void 0) { files_ = []; }
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files) {
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                getFiles(name, files_);
            }
            else {
                files_.push(name);
            }
        }
        return files_;
    }
    var fileNames = getFiles(dir);
    var index = new Index('fr', []);
    //TODO: automatically build indexes from end of directory name
    fileNames.forEach(function (file) {
        var ext = path.extname(file);
        if (ext === '.md') {
            var data = fs.readFileSync(file, { encoding: 'utf8' });
            var lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file (use it to select/build index) //TODO
            var parsed = fm(data);
            var playercount = parseRange(parsed.attributes.playercount);
            var playtime = parseRange(parsed.attributes.playtime);
            var entry = new IndexEntry(parsed.attributes.tags, parsed.attributes.title, playercount, parsed.attributes.complexity, playtime, parsed.body);
            index.entries.push(entry);
        }
    });
    // console.log(index);
    console.log("Index built ! Writing to disk...");
    var filename = index.lang + '-index.json';
    var dirpath = path.resolve(dir, filename);
    var distpath = path.resolve(__dirname, distDir, filename);
    fs.writeFileSync(dirpath, JSON.stringify(index, null, 2));
    fs.copyFileSync(dirpath, distpath);
    // console.log(getFiles(dir));
    console.log("Done writing at " + distpath);
}
/**
 * Parse a range of numbers, usually coming from a humain-readable string.
 * @param range undefined, empty, or of formats: '1-3', '5+', '5-', '5'
 * @returns an object with the range, might be null if nothing was parsed
 */
function parseRange(range) {
    if (!range || range.length === 0) {
        // range does not exist or is empty string
        return { min: null, max: null };
    }
    if (range.endsWith('+')) {
        // range is of format: 5+
        return {
            min: parseInt(range.substring(0, range.length - 1)),
            max: Infinity
        };
    }
    else if (range.endsWith('-')) {
        // range is of format: 5-
        return {
            min: 0,
            max: parseInt(range.substring(0, range.length - 1))
        };
    }
    else if (range.includes('-')) {
        // range is of format: 5-10
        var _a = range.split('-'), min = _a[0], max = _a[1];
        return {
            min: parseInt(min),
            max: parseInt(max)
        };
    }
    // range is of format: 5 (or unknown, and that'll break)
    return {
        min: parseInt(range),
        max: parseInt(range)
    };
}
var IndexEntry = /** @class */ (function () {
    function IndexEntry(tags, id, playercount, complexity, length, content) {
        if (tags === void 0) { tags = []; }
        if (content === void 0) { content = ''; }
        this.tags = tags;
        this.id = id;
        this.playercount = playercount;
        this.complexity = complexity;
        this.length = length;
        this.content = content;
        if (!id || id.length === 0) {
            throw new Error("IndexEntry with tags " + tags + ": id is empty");
        }
    }
    return IndexEntry;
}());
var Index = /** @class */ (function () {
    function Index(lang, entries) {
        if (entries === void 0) { entries = []; }
        this.lang = lang;
        this.entries = entries;
    }
    return Index;
}());
main();
