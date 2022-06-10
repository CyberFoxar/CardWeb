import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "~src/styles/global-styles";
import { getState } from "~src/ts/utils/AppState";

@customElement("cw-toc-sidebar")
export class TocSidebar extends LitElement {

    static styles?: CSSResultGroup | undefined = [
        styles,
        css`
        a {
            @apply text-pink-600 hover:text-pink-400 no-underline;
        }
        li {
            @apply ml-2 mt-1;
        }`
    ]

    private tocUL: HTMLUListElement = document.createElement("ul");

    constructor() {
        super();
        this.subToTocChanges();
    }

    async subToTocChanges(){
        var state = await getState();
        state.subEvent.on(() => {
            this.tocUL = state.currentTOC.toUl();
            this.requestUpdate();
        })
    }

    protected render() {

        return html`
            <div> TOC Sidebar </div>
            ${this.tocUL}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "cw-toc-sidebar": TocSidebar;
    }
}