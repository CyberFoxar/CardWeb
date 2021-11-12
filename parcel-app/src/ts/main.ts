import * as marked from "marked";
import fm from "../../node_modules/front-matter/index";
import { IndexBuilder } from "./IndexBuilder";

var container = document.getElementById("container");

var generatedMenu: HTMLElement | null = document.getElementById("generatedMenu");

async function main() {
    loadMarkdown("http://localhost:8080/8-americain.md");
    document.getElementById("8-americain")!.onclick = () => loadMarkdown("http://localhost:8080/8-americain.md");
    document.getElementById("ascenceur")!.onclick = () => loadMarkdown("http://localhost:8080/ascenceur.md");
    let index = new IndexBuilder();
}

export async function loadMarkdown(url: string) {
    generatedMenu!.innerHTML = "";
    const response = await fetch(url);
    const text = await response.text();
    const fmDoc = fm(text);
    const markedHTML = marked(fmDoc.body);
    container!.innerHTML = markedHTML;
}




// Override function
const tokenizer: marked.TokenizerObject = {
    heading(this: marked.TokenizerThis, src: string) {
        // Add side-effect of putting a nice link in our menu for quick navigation

        //^(#{1,6})\s*(.+?)\s*#*$/;
        // const regex = /^(#{1,6})\s*(.*)\s*/;

        // @ts-ignore -- see https://github.com/markedjs/marked/blob/7c09bb0a62d8abf5ceaaeccca5b9d41f705a2c9a/lib/marked.esm.js#L1043
        const cap = marked.Lexer.rules.block.heading.exec(src);
        if (cap) {
            let [, depth, text] = cap;
            const slugText = new marked.Slugger().slug(text);

            // let tokens: marked.Token[] = [];
            // this.lexer.inline(text, tokens);
            // console.log(src, cap, tokens);

            generatedMenu!.innerHTML += `<li><a href="#${slugText}">${text}</a></li>`;

            // return {
            //     depth: cap[1].length,
            //     raw: cap[0],
            //     text: text,
            //     tokens: tokens,
            //     type: 'heading'
            // }
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
            const slugText = new marked.Slugger().slug(text);
    
            generatedMenu!.innerHTML += `<li><a href="#${slugText}">${text}</a></li>`;
        }
        return false;
    }
};


main();
marked.use({ tokenizer });

