// import fm from "../../node_modules/front-matter/index";
import { marked } from "marked";
import * as yamlFront from "yaml-front-matter";
import { MarkdownToc } from "./MarkdownToc";
import { Index } from "./models/Index.model";

/** Element to place the generated-from-markdown html in */
var container = document.getElementById("container");

/** Menu that we'll place the ToC elements in */
var generatedMenu: HTMLElement | null = document.getElementById("generated-menu");
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

    // Snippet from: https://tailwindcss.com/docs/dark-mode
    // // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    // if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //     document.documentElement.classList.add('dark')
    // } else {
    //     document.documentElement.classList.remove('dark')
    // }
    document.documentElement.classList.add('dark');

    const burgerToggles = document.querySelectorAll(".cw-burger");
    burgerToggles.forEach(element => {
        element.addEventListener("click", toggleSidebar);
    });
}

function toggleSidebar() {
    const sidebarElements = document.querySelectorAll(".cw-sidebar");
    sidebarElements.forEach(element => {
        element.classList.toggle("invisible");
    });
}

export async function loadMarkdownFromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    loadMarkdown(text);
}

export function loadMarkdown(text: string){
    if(!generatedMenu){
        throw new Error("No generated-menu element found");
    }
    if(!container){
        throw new Error("No container element found");
    }

    TOC = new MarkdownToc();

    // Clear menu
    while(generatedMenu.firstChild){
        generatedMenu.removeChild(generatedMenu.firstChild);
    }

    const fmDoc = yamlFront.loadFront(text);
    slugger = new marked.Slugger();
    const markedHTML = marked(fmDoc.__content);

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
// WARN: Code assumes that my lexer and marked's are on the same page, but that might not be the case.
// I should probably handle that better.
const tokenizer: marked.TokenizerObject = {
    heading(this: marked.TokenizerThis, src: string) {
        // Add side-effect of putting a nice link in our menu for quick navigation

        // @ts-ignore -- see https://github.com/markedjs/marked/blob/7c09bb0a62d8abf5ceaaeccca5b9d41f705a2c9a/lib/marked.esm.js#L1043
        const cap = marked.Lexer.rules.block.heading.exec(src);
        if (cap) {
            let [, depth, text] = cap;
            const slugText = slugger.slug(text);

            depth = depth.length;

            // console.log("Adding TOC item with text ", slugText , "and level ", depth);
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
    
            // console.log("Adding TOC item with text ", slugText , "and level ", depth);
            TOC.addTocItem('#' + slugText, text, depth);
        }
        return false;
    }
};

marked.use({ tokenizer });
main();