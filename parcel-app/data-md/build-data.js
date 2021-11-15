"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
// @ts-ignore -- importing using typescript does not work for some reason
var fm = require('front-matter');
var dir = './data-md/';
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
    fileNames.forEach(function (file) {
        var ext = path.extname(file);
        if (ext === '.md') {
            // fs.readFile(file, 'UTF8', (err, data) => {
            //   const lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file
            //   index[lang] ? index[lang].push(JSON.stringify(data)) : index[lang] = [JSON.stringify(data)];
            //   console.log(index);
            //  });
            var data = fs.readFileSync(file, { encoding: 'utf8' });
            var lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file
            var parsed = fm(data);
            var entry = new IndexEntry(parsed.attributes['tags'], parsed.attributes['title'], parsed.body);
            index.entries.push(entry);
            // index[lang] ? index[lang].push(JSON.stringify(parsed.body)) : index[lang] = [JSON.stringify(parsed.body)];
        }
    });
    console.log(index);
    fs.writeFile(dir + '/' + 'fr' + '-index.json', JSON.stringify(index), function (err) {
        if (err) {
            console.error(err);
            return;
        }
        //file written successfully )
    });
    // console.log(getFiles(dir));
}
var IndexEntry = /** @class */ (function () {
    function IndexEntry(tags, title, content) {
        if (tags === void 0) { tags = []; }
        if (content === void 0) { content = ''; }
        this.tags = tags;
        this.title = title;
        this.content = content;
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
