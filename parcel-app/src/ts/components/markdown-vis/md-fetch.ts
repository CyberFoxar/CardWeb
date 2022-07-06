import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getState } from '~src/ts/utils/AppState';
import { loadFront } from 'yaml-front-matter';

import '../markdown-vis/md-view';
import { IndexedDB } from '~src/ts/utils/IndexedDB';
import { Rule } from '~src/ts/models/Index.model';

/**
 * Fetches and displays a markdown file, using only its id and some infos from the ruleIndex.
 * TODO: better rulesroot
 * TODO: check why the loader keeps appearing on the first load of the component (and not on subsequent loads)
 */
@customElement('md-fetch')
export class MarkdownFetchElement extends LitElement {

    public _id: string;

    @property({ type: String })
    public set id(id: string) {
        this._id = id;
        this.fetchFile(this.id);
    }

    public get id() {
        return this._id;
    }

    ruleSaved: boolean;

    @state()
    private loading: Boolean;

    @state()
    private currentLoadedRuleText: string;

    private Idb = new IndexedDB;

    // TODO: changeme for prod
    private rulesRoot = "/fr/";

    constructor() {
        super();
        this._id = '';
        this.currentLoadedRuleText = '';
        this.loading = false;
        this.ruleSaved = false;
    }

    loader = html`
    <div> Loader? </div>
    `;


    protected render(): unknown {

        if (!this.id && this.currentLoadedRuleText.length === 0 && !this.loading) {
            console.log("No id or no index to fetch from");
            return html`
            <div>No need to fetch or render md :3</div>
            `;
        }

        return html`
            <div>Page status: ${this.ruleSaved ? 
                html`<button 
                    @mouseenter=${this.setBtnText} 
                    @mouseleave=${this.setBtnText} 
                    @click=${() => this.removeRuleFromIdb(this.id)}>
                    Saved
                </button>` : 
                html`<button @click=${() => this.saveRuleInIDB(this.id)}>Save</button>`}</div>
            ${this.loading ? this.loader : ''}
            <md-view markdownFileText="${this.currentLoadedRuleText}"></md-view>
        `;

    }

    async saveRuleInIDB(ruleId: string) {
        var index = (await getState()).currentIndex;
        var rule = index?.entries.find(entry => entry.id === ruleId);
        if(!rule) {
            console.warn(`No rule found for id ${ruleId}`);
            return;
        }

        rule.content = this.currentLoadedRuleText;
        this.Idb.addRule(rule).finally(() => {
            this.checkRuleSavedInIDB(ruleId).catch(err => {/* Success ! */})
        })
    }

    async removeRuleFromIdb(ruleId: string) {
        this.Idb.deleteRule(ruleId).finally(() => {
            this.checkRuleSavedInIDB(ruleId).catch(err => {/* Success ! */});
        })
    }

    checkRuleSavedInIDB(ruleId: string): Promise<Rule> {
        return new Promise((resolve, reject) => { 
        this.Idb.getRule(ruleId)
        .then(rule => {
            if (rule) {
                this.ruleSaved = true;
                resolve(rule);
            } else {
                this.ruleSaved = false;
                reject("No rule found in IDB");
            }
            this.requestUpdate();
        })});
    }

    setBtnText(e: Event) {
        if (e.type == "mouseenter")
            (e.target as HTMLButtonElement).innerText = "Remove";
        else if (e.type == "mouseleave")
            (e.target as HTMLButtonElement).innerText = "Saved";
    }

    async fetchFile(ruleId: string) {
        this.loading = false;
        var loader = setTimeout(() => this.loading = true, 250);
        var state = await getState();

        if (!this.id || !state.currentIndex) {
            console.warn("No id or no index to fetch from", this.id, state.currentIndex);
            clearTimeout(loader);
            this.loading = false;
            this.currentLoadedRuleText = '';
            return;
        }

        const ruleEntry = (state.currentIndex)!.entries.find(entry => entry.id === ruleId);
        if (!ruleEntry) {
            console.warn(`No rule found for id ${ruleId}`);
            clearTimeout(loader);
            this.loading = false;
            this.currentLoadedRuleText = '';
            return;
        }

        var ruleFromIdb: Rule | null;
        try {
            ruleFromIdb = await this.checkRuleSavedInIDB(ruleId)    
        } catch (error) {
            // Could not load rule for some reason (probably not in DB)
            console.log("Could not load rule from IDB because:", error);
            ruleFromIdb = null;
        }
        // Here we should probably check if the rule is already in our offline DB, and if so, just return it.
        // Also add a bunch of other checks to see if we should update/add the rule.
        /* Fetch a fresh rule if we either:
            - do not have rule in DB
            - the rule has no date
            - the rule has a date but is older than the one in index (which is supposed to have the most fresh metadata)
        */
        if(!ruleFromIdb || !ruleFromIdb.lastupdated || ruleFromIdb.lastupdated < ruleEntry.lastupdated!) {
            console.log("Fetching rule from server");
            fetch(this.rulesRoot + ruleEntry.location).then(async response => {
                var t = await response.text();
                const rule = loadFront(t);
                this.currentLoadedRuleText = rule.__content;
                if(ruleFromIdb) {
                    // We had a saved rule. Update it.
                    var updatedRule = ruleEntry;
                    updatedRule.content = rule.__content;
                    this.Idb.putRule(updatedRule).finally(() => {console.log("Updated rule in IDB")});
                }
            }).catch(err => {
                console.warn("Could not fetch rule because of:", err)
                if(ruleFromIdb) {
                    console.warn("Displaying out of date rule");
                    this.currentLoadedRuleText = ruleFromIdb.content;
                }
            }).finally(() => {
                clearTimeout(loader); 
                this.loading = false;
            });
        } else {
            // We actually have an up-to-date rule in our offline DB.
            console.log("Loading rule from IDB");
            // Just load it.
            this.currentLoadedRuleText = ruleFromIdb.content;
            clearTimeout(loader);
            this.loading = false;
        }
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "md-fetch": MarkdownFetchElement;
    }
}