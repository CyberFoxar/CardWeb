import { LitElement, html, PropertyValueMap } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';

import { marked } from "marked";
// TODO: is front-matter really useful here ?
import * as yamlFront from "yaml-front-matter";
import { MarkdownToc } from '../../MarkdownToc';
import { styles } from '~src/styles/global-styles';
import { getState } from '~src/ts/utils/AppState';

@customElement('md-view')
export class MarkdownViewElement extends LitElement {

    static styles = [styles];

    @property()
    public markdownFileText: string | null = "";

    // Not state per-se, but also needed
    private TOC = new MarkdownToc();

    // Necessary to have our own slugger, because we don't want to use default one.
    // A bit hacky, but basically we need to have our own slugger to not interfere with marked's.
    // And we still need to have a slugger since it's him who keep track (and makes) unique URLs.
    // It is especially needed for titles that are duplicated (e.g. "Introduction" and "Introduction" will be slugged as "introduction" and "introduction-1")
    // See: https://github.com/markedjs/marked/blob/master/src/Slugger.js
    private slugger: marked.Slugger = new marked.Slugger();

    constructor() {
        super();

        // Shadowroot prevents us from using proper anchor links
        // So we reimplement it from the change in URL
        // This means grabbing the change, interpreting which title we want, then slugging it to query the right element to scroll to
        window.addEventListener('hashchange', () => {
            this.scrollToLocation();
        }, false);

        const that = this;

        // Marked extension function
        // Add side effect of filling a TOC when making tokens.
        const tokenizer: marked.TokenizerObject = {
            heading(this: marked.TokenizerThis, src: string) {
                // @ts-ignore -- see https://github.com/markedjs/marked/blob/7c09bb0a62d8abf5ceaaeccca5b9d41f705a2c9a/lib/marked.esm.js#L1043
                const cap = marked.Lexer.rules.block.heading.exec(src);
                if (cap) {
                    let [, depth, text] = cap;
                    const slugText = that.slugger.slug(text);

                    depth = depth.length;

                    // console.log("Adding TOC item with text ", slugText , "and level ", depth);
                    that.TOC.addTocItem('#' + slugText, text, depth);

                }

                // Return false to use the og marked tokenizer
                return false;
            },
            lheading(this: marked.TokenizerThis, src: string) {
                // @ts-ignore -- see above
                const cap = marked.Lexer.rules.block.lheading.exec(src);
                if (cap) {
                    const depth = cap[2].charAt(0) === '=' ? 1 : 2;
                    const text = cap[1];
                    const slugText = that.slugger.slug(text);

                    // console.log("Adding TOC item with text ", slugText , "and level ", depth);
                    that.TOC.addTocItem('#' + slugText, text, depth);
                }
                return false;
            }
        };

        marked.use({ tokenizer });
    }

    render() {
        if (!this.markdownFileText) {
            return null;
        }

        const fmDoc = yamlFront.loadFront(this.markdownFileText);

        this.slugger = new marked.Slugger();
        this.TOC = new MarkdownToc();
        const markedHTML = marked(fmDoc.__content);

        // At this point, TOC is filled with our items
        this.generateTOC();

        return html`
        <div class="prose dark:prose-invert">${unsafeHTML(markedHTML)}</div>
        `;

    }
    async generateTOC() {
        // Clear menu
        var state = await getState();
        state.currentTOC = this.TOC;
    }

    // Ugly but works
    scrollFirstLoad = true;
    protected update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.update(changedProperties);
        try {
            if (this.scrollFirstLoad) {
                this.scrollToLocation();
                this.scrollFirstLoad = false;
            }
        } catch (e) {
            console.log("Error scrolling to location, retrying until it works");
        }
    }

    scrollToLocation() {
        console.log("Scrolling to location");
        var slugger = new marked.Slugger();
        var selector = '#' + slugger.slug(decodeURI(location.hash).substring(1));
        if (selector.length <= 1) return;
        console.log("selector:", selector, 'in: ', this, this.shadowRoot);
        this.shadowRoot!.querySelector(selector)!.scrollIntoView();
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "md-view": MarkdownViewElement;
    }
}