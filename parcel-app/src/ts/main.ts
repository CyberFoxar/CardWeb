import { Rule, RuleIndex } from "./models/Index.model";
import { getState } from "./utils/AppState";

import "./components/routing-components/router-link";
import "./components/routing-components/router";
import { queryShadow } from "./utils/ShadowDomUtils";
import { MarkdownViewElement } from "./components/markdown-vis/md-view";
import { IndexedDB } from "./utils/IndexedDB";
import { customElement } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { styles } from "~src/styles/global-styles";

@customElement('cw-app')
export class App extends LitElement {
    static styles = [styles,
        css`
        :host, cw-app, .cw-app {
            height: 100vh;
        }
    `];

    constructor() {
        super();
        main();
    }

    protected render(): unknown {
        return html`
        <div class="cw-app">
            <div class="flex flex-columns flex-auto">
                <!-- Page -->
                <div class="fixed top-2 left-2 z-50 lg:hidden">
                    <!-- Burger -->
                    <button class="cw-burger">
                        🍔
                    </button>
                </div>
        
                <nav
                    class="cw-sidebar pl-4 fixed left invisible dark:bg-gray-700/100 z-40 ml-auto lg:max-w-xs lg:relative lg:flex-initial lg:bg-inherit lg:z-auto lg:visible">
                    <!-- Above, everything is mobile first then lg breakpoint for bigger screens. -->
                    <router-link href="/" class="no-underline"><a class="no-underline text-pink-200">CardWeb</a></router-link>
                    <div id="indexEntries">
                        <!-- To be replaced by a search bar of some sort -->
                        <!-- Where the available documents are -->
                        <!-- Temp placement move into sidebar -->
                    </div>
        
                    <router-link href="/test">test</router-link>
        
                    <div id="generated-menu" class="generated-menu">
                        <!-- Where the document explorer / TOC goes -->
                    </div>
                </nav>
        
                <div id="container" class="flex-auto flex-wrap basis-4/5 m-4 md:mr-auto">
                    <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cw-app": App;
    }
}

/** Menu that we'll place the ToC elements in */
var generatedMenu: HTMLElement | null = document.getElementById("generated-menu");

// TODO: Change
const markdownDocumentsUrl = "/fr/";

async function main() {
    // loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("8-americain")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("ascenceur")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/ascenceur.md");
    await loadIndex("/fr/fr-index.json");
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

    var db = new IndexedDB();
    await db.openDB();
    if ((await getState()).currentIndex?.entries) {
        db.addRule((await getState())!.currentIndex!.entries[0]);
        var rule = await db.getRule((await getState())!.currentIndex!.entries[0].id);
        console.log(rule);
    } else {
        console.log("NO STATE ????", (await getState()).currentIndex);
    }
    db.getAllRules().then(rules => { console.log('rules:', rules); });
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

export function loadMarkdown(text: string) {

    // var mdView = document.getElementsByTagName("md-view")[0];
    var mdView = queryShadow(["router-outlet", "md-fetch", "md-view"], "md-view") as MarkdownViewElement;
    console.log(mdView);
    if (mdView) {
        mdView.generatedMenu = generatedMenu;
        mdView.setAttribute("markdownFileText", text);
        mdView.requestUpdate();
    }
}

export async function loadIndex(url: string) {
    console.log("loading Index");
    const response = await fetch(url);
    const text = await response.text();
    const index = RuleIndex.from(JSON.parse(text));
    if (!index) {
        console.error("Index is null");
        return;
    }

    const entryMenu = document.getElementById("indexEntries")!;

    index.entries.forEach(entry => {
        const entryElement = document.createElement("button");
        entryElement.innerHTML = entry.id;
        // Load content directly
        // entryElement.addEventListener("click", () => loadMarkdown(index.entries.find(e => e.id === entry.id)!.content));

        // Load content from url
        entryElement.addEventListener("click", () => loadMarkdownFromUrl(markdownDocumentsUrl + entry.location));

        entryMenu.appendChild(entryElement);
    });
    // Save index somewhere I can use everywhere
    // console.log(response, text, index, getState());
    (await getState()).currentIndex = index;
    (await getState()).save();
    return Promise.resolve(index);
}

main();