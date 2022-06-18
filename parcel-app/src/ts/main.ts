import { Rule, RuleIndex } from "./models/Index.model";
import { getState } from "./utils/AppState";

import "./components/routing-components/router-link";
import "./components/routing-components/router";
import "~components/markdown-vis/tocSidebar";
import { IndexedDB } from "./utils/IndexedDB";
import { customElement, query } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import { styles } from "~src/styles/global-styles";

@customElement('cw-app')
export class App extends LitElement {
    static styles = [styles,
        css`
        :host, cw-app, .cw-app {
            min-height: 100vh;
        }
    `];

    constructor() {
        super();
        main();
    }

    toggleSidebar(e: Event) {
        this.sidebar.classList.toggle("invisible");
    }

    @query('.cw-sidebar')
    sidebar!: HTMLElement;

    protected render(): unknown {
        return html`
        <div class="font-sans object-fill cw-app h-fit">
            <div class="flex flex-columns flex-auto pt-4 h-fit lg:pt-0">
                <!-- Page -->
                <div class="fixed top-2 left-2 z-50 lg:hidden">
                    <!-- Burger -->
                    <button class="cw-burger" @click=${this.toggleSidebar}>
                        🍔
                    </button>
                </div>
        
                <nav
                    class="cw-sidebar pl-8 p-2 fixed left top-0 invisible bg-gray-600 z-40 ml-auto 
                            lg:pl-4 lg:pt-2 lg:pr-0 lg:max-w-xs lg:relative lg:flex-initial lg:bg-inherit lg:z-auto lg:visible">
                    <!-- Above, everything is mobile first then lg breakpoint for bigger screens. -->
                    <router-link href="/" class="no-underline">
                        <p class="no-underline text-pink-200">CardWeb</p>
                    </router-link>
                    <div id="indexEntries">
                        <!-- To be replaced by a search bar of some sort -->
                        <!-- Where the available documents are -->
                        <!-- Temp placement move into sidebar -->
                    </div>
                    <cw-toc-sidebar></cw-toc-sidebar>
                </nav>
        
                <div id="container" class="flex-auto flex-wrap basis-4/5 m-4 md:mr-auto h-fit">
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

async function main() {
    // loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("8-americain")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("ascenceur")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/ascenceur.md");
    // await loadIndex("/fr/fr-index.json");
    // Snippet from: https://tailwindcss.com/docs/dark-mode
    // // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    // if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //     document.documentElement.classList.add('dark')
    // } else {
    //     document.documentElement.classList.remove('dark')
    // }
    document.documentElement.classList.add('dark');


    var db = new IndexedDB();
    await db.openDB();
    console.log("DB opened");
    // getState().then(async state => {
    //     console.log("Await State loaded", state);
    //     if (state.currentIndex?.entries) {
    //         db.addRule(state.currentIndex!.entries[0]);
    //         var rule = await db.getRule(state.currentIndex!.entries[0].id);
    //         console.log(rule);
    //     } else {
    //         console.log("NO STATE ????", state.currentIndex);
    //     }
    //     db.getAllRules().then(rules => { console.log('rules:', rules); });
    // });
}
