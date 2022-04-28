import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';

import { marked } from "marked";
import * as yamlFront from "yaml-front-matter";
import { MarkdownToc } from '../../MarkdownToc';

@customElement('md-view')
export class MarkdownViewElement extends LitElement {

    @property()
    public markdownFileText: string | null = "";

    @property()
    public generatedMenu: HTMLElement | null = null;

    // Not state per-se, but also needed
    private TOC = new MarkdownToc();

    // Necessary to have our own slugger, because we don't want to use default one.
    // A bit hacky, but basically we need to have our own slugger to not interfere with marked's.
    // And we still need to have a slugger since it's him who keep track (and makes) unique URLs.
    // See: https://github.com/markedjs/marked/blob/master/src/Slugger.js
    private slugger: marked.Slugger = new marked.Slugger();

    // This is a workaround for anchor links not working in shadowDOM
    // This component should not be in _any_ shadowDOM or the TOC anchor will break
    // "Better" solution would be to use element.scrollIntoView but, eeeeh.
    protected createRenderRoot() {
        return this;
    }

    constructor() {
        super();

        const that = this;

        // Marked extension function
        // Add side effect of filling a TOC when making tokens.
        const tokenizer: marked.TokenizerObject = {
            heading(this: marked.TokenizerThis, src: string) {
                // Add side-effect of putting a nice link in our menu for quick navigation

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
                // Add side-effect of putting a nice link in our menu for quick navigation

                // @ts-ignore
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

        if (!this.generatedMenu) {
            throw new Error("No generated-menu element found");
        }

        // Clear menu
        while (this.generatedMenu.firstChild) {
            this.generatedMenu.removeChild(this.generatedMenu.firstChild);
        }

        const fmDoc = yamlFront.loadFront(this.markdownFileText);

        this.slugger = new marked.Slugger();
        this.TOC = new MarkdownToc();
        const markedHTML = marked(fmDoc.__content);

        // At this point, TOC is filled with our items
        const ul = this.TOC.toUl();
        console.log(this.generatedMenu, this.TOC);
        this.generatedMenu.appendChild(ul);

        return html`
        <div class="prose dark:prose-invert">${unsafeHTML(markedHTML)}</div>

        `;

    }

}

declare global {
    interface HTMLElementTagNameMap {
      "md-view": MarkdownViewElement;
    }
}