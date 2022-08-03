import * as fs from 'fs';
import * as path from 'path';
import * as yamlFront from "yaml-front-matter";

// Run paramters-ish.
/** Where are the rules, relative to the generated JS file */
const dir = '../rules/';
/** Where is the generated JS file gonna be */
const distDir = '../dist/';
/** Where do you want the files to end up if copy is true */
const finaldir = '../../dist/rules/';
/** Whether to copy the index + md files */
const copy = true;

const truedir = path.resolve(__dirname, dir);

async function main() {
  /**
   * Read all files in dir folder
   * Parse the markdown files and their yamlfrontmatter to create index entries
   * Build a main index
   * write the index to disk
   * copy the markdown, index, and everything else in dir to finaldir (if copy).
   * */

  console.debug(truedir, getFiles(truedir));
  const fileNames = getFiles(truedir);

  const mainIndex: MainIndex = {
    indexes: []
  };

  // Matches text between the first title (heading 1) and the next (heading n)
  // Also support alternative headings "===" and "---"
  const summaryRegex = new RegExp(/(?<title>(#+\s.*)|(.*\n={3,}))\n*(?<summary>[\S\s.]+?)(?=#|-{3,}|={3,})/, 'm');

  fileNames.forEach(file => {
    const ext = path.extname(file);
    const lastEdit = fs.statSync(file).mtime;
    const fullFilename = path.basename(file);
    if (ext === '.md') {
      const data = fs.readFileSync(file, { encoding: 'utf8' });
      const lang = path.dirname(file).split(path.sep).pop()!; // grabs de parent folder name of the file and use it to select/build index
      const parsed = yamlFront.loadFront(data);
      const playercount = parseRange(parsed.playercount);
      const playtime = parseRange(parsed.playtime);
      const id = encodeURI(parsed.title.toLowerCase().replace(/\s/g, '-'));
      const summaryRes = parsed.__content.match(summaryRegex);
      let summary: string;
      if (Array.isArray(summaryRes)) {
        summary = summaryRes!.groups!['summary'].trim();
      } else {
        summary = parsed.__content.substring(0, 300).trim();
      }
      // console.log(id, summary)
      const entry = new IndexEntry(
        parsed.tags,
        id,
        playercount,
        parsed.complexity,
        playtime,
        lastEdit,
        encodeURI(fullFilename),
        summary);

      // Eventually this should simply references indexes and not copy/have the whole object.
      // So that they can be lazy-loaded.
      let mainIndexEntry = mainIndex.indexes.find((el) => el.lang == lang);
      if (!mainIndexEntry) {
        mainIndexEntry = {
          index: new Index(lang, []),
          lang: lang,
          location: lang
        };
        mainIndex.indexes.push(mainIndexEntry);
      }
      mainIndexEntry.index.entries.push(entry);
    }
  });

  console.info("Indexes built ! Begin writing.");

  console.info("Writing main index to disk...");

  const filename = 'main-index.json';
  const dirpath = path.resolve(truedir, filename);
  const distpath = path.resolve(__dirname, distDir, filename);
  fs.writeFileSync(dirpath, JSON.stringify(mainIndex, null, 2));

  // Copy file to dist
  console.log(`Done writing at ${dirpath}`);

  if (copy) {
    const destDir = path.resolve(__dirname, finaldir);
    console.info("Copying:", truedir, " to ", destDir);
    await copyDir(truedir, destDir);
    console.info("Done copying.");
  }
}


function getFiles(dir, files_: any[] = []) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(path.resolve(__dirname, name));
    }
  }
  return files_;
}

async function copyDir(src, dest) {
  console.debug("making dir: ", dest);
  await fs.promises.mkdir(dest, { recursive: true });
  let entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      console.debug("Copying: ", srcPath, "to ", destPath);
      await fs.promises.copyFile(srcPath, destPath);
    }

  }
}

/**
 * Parse a range of numbers, usually coming from a humain-readable string.
 * @param range undefined, empty, or of formats: '1-3', '5+', '5-', '5'
 * @returns an object with the range, might be null if nothing was parsed
 */
function parseRange(range: string | number): { min: number, max: number; } {
  if (!range || range.toString().length === 0) {
    // range does not exist or is empty string
    return { min: 0, max: 999 };
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

/**
 * Main interface/class for an index entry.
 */
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

interface MainIndex {
  indexes: {
    index: Index,
    lang: string;
    location: string;
  }[];
}

main();