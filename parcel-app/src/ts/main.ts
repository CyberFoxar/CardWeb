import * as marked from "marked";
import fm from "../../node_modules/front-matter/index";
import { MarkdownToc } from "./MarkdownToc";
import { Index } from "./models/Index.model";

var container = document.getElementById("container");

var generatedMenu: HTMLElement | null = document.getElementById("generatedMenu");
var TOC = new MarkdownToc();

// Necessary to have our own slugger, because we don't want to use default one.
// A bit hacky, but basically we need to have our own slugger to not interfere with marked's.
// And we still need to have a slugger since it's him who keep track (and makes) unique URLs.
// See: https://github.com/markedjs/marked/blob/master/src/Slugger.js
var slugger = new marked.Slugger(); 

async function main() {
    // loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("8-americain")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("ascenceur")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/ascenceur.md");
    loadIndex("/indexes/fr-index.json");
}

export async function loadMarkdownFromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    loadMarkdown(text);
}

export function loadMarkdown(text: string){
    if(!generatedMenu){
        throw new Error("No generatedMenu element found");
    }
    if(!container){
        throw new Error("No container element found");
    }

    TOC = new MarkdownToc();

    // Clear menu
    while(generatedMenu.firstChild){
        generatedMenu.removeChild(generatedMenu.firstChild);
    }

    const fmDoc = fm(text);
    slugger = new marked.Slugger();
    const markedHTML = marked(fmDoc.body);

    // At this point, TOC is filled with our items
    const ul = TOC.toUl();
    generatedMenu.appendChild(ul);

    container.innerHTML = markedHTML;
}

export async function loadIndex(url: string){
    const response = await fetch(url);
    const text = await response.text();
    const index = JSON.parse(text) as Index;

    const entryMenu = document.getElementById("indexEntries")!;

    index.entries.forEach(entry => {
        const entryElement = document.createElement("button");
        entryElement.innerHTML = entry.id;
        entryElement.addEventListener("click", () => loadMarkdown(index.entries.find(e => e.id === entry.id)!.content));
        entryMenu.appendChild(entryElement);
    })
}




// Override function
const tokenizer: marked.TokenizerObject = {
    heading(this: marked.TokenizerThis, src: string) {
        // Add side-effect of putting a nice link in our menu for quick navigation

        // @ts-ignore -- see https://github.com/markedjs/marked/blob/7c09bb0a62d8abf5ceaaeccca5b9d41f705a2c9a/lib/marked.esm.js#L1043
        const cap = marked.Lexer.rules.block.heading.exec(src);
        if (cap) {
            let [, depth, text] = cap;
            const slugText = slugger.slug(text);

            depth = depth.length;

            console.log("Adding TOC item with text ", slugText , "and level ", depth);
            TOC.addTocItem('#' + slugText, text, depth);
            
        }

        // Return false to use the og marked tokenizer
        return false;
    },
    lheading(this: marked.TokenizerThis, src: string){
        // Add side-effect of putting a nice link in our menu for quick navigation

        // @ts-ignore
        const cap = marked.Lexer.rules.block.lheading.exec(src);
        if(cap){
            const depth = cap[2].charAt(0) === '=' ? 1 : 2;
            const text = cap[1];
            const slugText = slugger.slug(text);
    
            console.log("Adding TOC item with text ", slugText , "and level ", depth);
            TOC.addTocItem('#' + slugText, text, depth);
        }
        return false;
    }
};

marked.use({ tokenizer });
main();