// import fm from "../../node_modules/front-matter/index";
import { marked } from "marked";
import { MarkdownViewElement } from "./components/markdown-vis/md-view";
import { Index } from "./models/Index.model";

/** Menu that we'll place the ToC elements in */
var generatedMenu: HTMLElement | null = document.getElementById("generated-menu");

// TODO: Change
const markdownDocumentsUrl = "/fr/";

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

    var mdView = document.getElementsByTagName("md-view")[0];

    mdView.generatedMenu = generatedMenu;
    mdView.setAttribute("markdownFileText", text);
    mdView.requestUpdate();

}

export async function loadIndex(url: string){
    const response = await fetch(url);
    const text = await response.text();
    const index = JSON.parse(text) as Index;

    const entryMenu = document.getElementById("indexEntries")!;

    index.entries.forEach(entry => {
        const entryElement = document.createElement("button");
        entryElement.innerHTML = entry.id;
        // Load content directly
        // entryElement.addEventListener("click", () => loadMarkdown(index.entries.find(e => e.id === entry.id)!.content));

        // Load content from url
        entryElement.addEventListener("click", () => loadMarkdownFromUrl(markdownDocumentsUrl + entry.location));

        entryMenu.appendChild(entryElement);
    })
}

export function saveToIndexedDb(url: string, text: string) {
    
}


// Override function
// WARN: Code assumes that my lexer and marked's are on the same page, but that might not be the case.
// I should probably handle that better.
// const tokenizer: marked.TokenizerObject = {
//     heading(this: marked.TokenizerThis, src: string) {
//         // Add side-effect of putting a nice link in our menu for quick navigation

//         // @ts-ignore -- see https://github.com/markedjs/marked/blob/7c09bb0a62d8abf5ceaaeccca5b9d41f705a2c9a/lib/marked.esm.js#L1043
//         const cap = marked.Lexer.rules.block.heading.exec(src);
//         if (cap) {
//             let [, depth, text] = cap;
//             const slugText = slugger.slug(text);

//             depth = depth.length;

//             // console.log("Adding TOC item with text ", slugText , "and level ", depth);
//             TOC.addTocItem('#' + slugText, text, depth);
            
//         }

//         // Return false to use the og marked tokenizer
//         return false;
//     },
//     lheading(this: marked.TokenizerThis, src: string){
//         // Add side-effect of putting a nice link in our menu for quick navigation

//         // @ts-ignore
//         const cap = marked.Lexer.rules.block.lheading.exec(src);
//         if(cap){
//             const depth = cap[2].charAt(0) === '=' ? 1 : 2;
//             const text = cap[1];
//             const slugText = slugger.slug(text);
    
//             // console.log("Adding TOC item with text ", slugText , "and level ", depth);
//             TOC.addTocItem('#' + slugText, text, depth);
//         }
//         return false;
//     }
// };

// marked.use({ tokenizer });
main();