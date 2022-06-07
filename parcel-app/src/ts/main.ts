import { RuleIndex } from "./models/Index.model";
import { getState } from "./utils/AppState";

import '../styles/styles.css';
import "./components/routing-components/router-link";
import "./components/routing-components/router";
import { queryShadow } from "./utils/ShadowDomUtils";
import { MarkdownViewElement } from "./components/markdown-vis/md-view";
import { IndexedDB } from "./utils/IndexedDB";

/** Menu that we'll place the ToC elements in */
var generatedMenu: HTMLElement | null = document.getElementById("generated-menu");

// TODO: Change
const markdownDocumentsUrl = "/fr/";

async function main() {
    // loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("8-americain")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/8-americain.md");
    // document.getElementById("ascenceur")!.onclick = () => loadMarkdownFromUrl("http://localhost:8080/ascenceur.md");
    loadIndex("/fr/fr-index.json");

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
    db.addRule(getState()!.currentIndex!.entries[0]);
    var rule = await db.getRule(getState()!.currentIndex!.entries[0].id);
    console.log(rule);
    db.getAllRules().then(rules => {console.log('rules:', rules)})
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
    const response = await fetch(url);
    const text = await response.text();
    const index = JSON.parse(text) as RuleIndex;

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
    getState().currentIndex = index;
    getState().save();
}

export function saveToIndexedDb(url: string, text: string) {
    // TODO
}

main();