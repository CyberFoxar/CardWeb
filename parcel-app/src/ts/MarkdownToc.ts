/**
 * Build and hold a markdown table of contents from other sources.
 * This would also outputs HTML to be put in a menu of some sort.
 */
export class MarkdownToc {

    private toc = {}

    constructor(){}

    addTocItem(url: string, text: string, depth: number) {
        // let menuItemHtml = `<li><a href="#${url}">${text}</a></li>`
        
    }

    toHtml(): string {
        return '';
    }

}

class TocItem {
    constructor(
        private url: string,
        private text: string,
        private depth: number,
        private children: TocItem[]
    ){}
}