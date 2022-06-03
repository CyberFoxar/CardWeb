import * as fs from 'fs';
import * as path from 'path';
import * as yamlFront from "yaml-front-matter";

// @ts-ignore -- importing using typescript does not work for some reason
// const fm = require('front-matter');

const dir = './fr/';
const distDir = '../dist/';
// Use glob ?
// Use copyfiles ?
// Use something else ?

function main() {
  // Read all MD in one folder
  // Build index as a JSON object
  // - use frontmatter to handle metadata
  // Export index in /dist
  // Do it again for each language

  function getFiles(dir, files_ = []) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
      var name = dir + '/' + files[i];
      if (fs.statSync(name).isDirectory()) {
        getFiles(name, files_);
      } else {
        files_.push(name);
      }
    }
    return files_;
  }

  const fileNames = getFiles(dir);

  const index = new Index('fr', []);

  //TODO: automatically build indexes from end of directory name

  fileNames.forEach(file => {
    const ext = path.extname(file);
    const lastEdit = fs.statSync(file).mtime;
    const fullFilename = path.basename(file);
    if (ext === '.md') {
      const data = fs.readFileSync(file, { encoding: 'utf8' });
      const lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file (use it to select/build index) //TODO
      const parsed = yamlFront.loadFront(data);
      const playercount = parseRange(parsed.playercount);
      const playtime = parseRange(parsed.playtime);
      const id = encodeURI(parsed.title.toLowerCase().replace(/\s/g, '-'));
      const entry = new IndexEntry(
        parsed.tags, 
        id, 
        playercount, 
        parsed.complexity, 
        playtime, 
        lastEdit,
        encodeURI(fullFilename),
        parsed.__content);
      index.entries.push(entry);
    }
  });

  // console.log(index);
  console.log("Index built ! Writing to disk...");

  const filename = index.lang + '-index.json';
  const dirpath = path.resolve(dir, filename);
  const distpath = path.resolve(__dirname, distDir, filename);
  fs.writeFileSync(dirpath, JSON.stringify(index, null, 2));

  // Copy file to dist
  fs.copyFileSync(dirpath, distpath);

  console.log(getFiles(dir));
  console.log(`Done writing at ${distpath}`);
}

/**
 * Parse a range of numbers, usually coming from a humain-readable string.
 * @param range undefined, empty, or of formats: '1-3', '5+', '5-', '5'
 * @returns an object with the range, might be null if nothing was parsed
 */
function parseRange(range: string|number): { min: number, max: number; } {
  if (!range || range.toString().length === 0) {
    // range does not exist or is empty string
    return { min: null, max: null };
  }
  range = range.toString();

  if (range.endsWith('+')) {
    // range is of format: 5+
    return {
      min: parseInt(range.substring(0, range.length - 1)),
      max: Infinity
    };
  } else if (range.endsWith('-')) {
    // range is of format: 5-
    return {
      min: 0,
      max: parseInt(range.substring(0, range.length - 1))
    };
  } else if (range.includes('-')) {
    // range is of format: 5-10
    const [min, max] = range.split('-');
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


class IndexEntry {
  constructor(
    public tags = [],
    public id: string,
    public playercount?: {
      min: number,
      max: number,
    },
    public complexity?: number,
    public length?: {
      min: number,
      max: number,
    },
    public lastupdated?: Date,
    public location?: string,
    public content = '') {
    if (!id || id.length === 0) {
      throw new Error(`IndexEntry with tags ${tags}: id is empty`);
    }
  }
}

class Index {
  constructor(
    public lang: string,
    public entries: IndexEntry[] = []) { }
}

main();