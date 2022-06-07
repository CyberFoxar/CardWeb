import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getState } from '~src/ts/utils/AppState';
import { loadFront } from 'yaml-front-matter';

import '../markdown-vis/md-view';

/**
 * Fetches and displays a markdown file, using only its id and some infos from the ruleIndex.
 * TODO: better rulesroot
 * TODO: check why the loader keeps appearing on the first load of the component (and not on subsequent loads)
 */
@customElement('md-fetch')
export class MarkdownFetchElement extends LitElement {

    public _id: string;

    @property({type: String})
    public set id(id: string) {
        this._id = id;
        this.fetchFile(this.id);
    }

    public get id() {
        return this._id;
    }

    @state()
    private loading: Boolean;

    @state()
    private currentLoadedRuleText: string;

    // TODO: changeme for prod
    private rulesRoot = "/fr/";

    constructor() {
        super();
        this._id = '';
        this.currentLoadedRuleText = '';
        this.loading = false;
    }


    protected render(): unknown {

        if(this.currentLoadedRuleText.length === 0) {
            return html`
            <div>No need to fetch or render md :3</div>
            `;
        }

        return html`
            <div ?hidden="${!this.loading}">This is a loader, trust me bro ${this.loading}</div>
            <md-view markdownFileText="${this.currentLoadedRuleText!}"></md-view>
        `;

    }

    fetchFile(ruleId: string) {
        this.loading = false;
        var loader = setTimeout(() => this.loading = true, 250);

        if (!this.id || !getState().currentIndex) {
            console.warn("No id or no index to fetch from");
            clearTimeout(loader);
            this.loading = false;
            this.currentLoadedRuleText = '';
            return;
        }

        const ruleEntry = (getState().currentIndex)!.entries.find(entry => entry.id === ruleId);
        if(!ruleEntry) {
            console.warn(`No rule found for id ${ruleId}`);
            clearTimeout(loader);
            this.loading = false;
            this.currentLoadedRuleText = '';
            return;
        }

        // Here we should probably check if the rule is already in our offline DB, and if so, just return it.
        // Also add a bunch of other checks to see if we should update/add the rule.

        fetch(this.rulesRoot + ruleEntry.location).then(async response => {
            var t = await response.text();
            // console.log('r:', t);
            const rule = loadFront(t);
            this.currentLoadedRuleText = rule.__content;
            clearTimeout(loader);
            this.loading = false;
        });
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "md-fetch": MarkdownFetchElement;
    }
}