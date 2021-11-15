import * as fs from 'fs';
import * as path from 'path';

// @ts-ignore -- importing using typescript does not work for some reason
const fm = require('front-matter');

const dir = './data-md/';
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
    if (ext === '.md') {
      // fs.readFile(file, 'UTF8', (err, data) => {
      //   const lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file
      //   index[lang] ? index[lang].push(JSON.stringify(data)) : index[lang] = [JSON.stringify(data)];

      //   console.log(index);
      //  });
      const data = fs.readFileSync(file, { encoding: 'utf8' });
      const lang = path.dirname(file).split('/').pop(); // grabs de parent folder name of the file (use it to select/build index) //TODO
      const parsed = fm(data);
      const entry = new IndexEntry(parsed.attributes['tags'], parsed.attributes['title'], parsed.body);
      index.entries.push(entry);
      // index[lang] ? index[lang].push(JSON.stringify(parsed.body)) : index[lang] = [JSON.stringify(parsed.body)];
    }
  });

  console.log(index);

  fs.writeFile(dir + '/' + index.lang + '-index.json', JSON.stringify(index), err => {
    if (err) {
      console.error(err)
      return
    }
    //file written successfully )
  });

  // console.log(getFiles(dir));
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
    public content = '') {}
}

class Index {
  constructor(
    public lang: string,
    public entries: IndexEntry[] = []) { }
}

main()