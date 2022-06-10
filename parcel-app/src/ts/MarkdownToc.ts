/**
 * Build and hold a markdown table of contents from other sources.
 * This would also outputs HTML to be put in a menu of some sort.
 * Assumes that root will have a depth of 0 and all items inside have a depth > 0.
 * Also assmues that all items are given in linear order following the document flow.
 */
export class MarkdownToc {

    private currentTocItem: TocItem;
    public toc: TocItem;

    constructor() {
        this.toc = new TocItem(
            '',
            'ToC root',
            0,
            null,
            []
        );
        this.currentTocItem = this.toc;
    }

    public addTocItem(url: string, text: string, depth: number) {
        const itemToAdd = new TocItem(url, text, depth, null);
        // console.debug("Adding: ", itemToAdd, `to TOC `, this.toc, " with current item: ", this.currentTocItem);

        if (depth < this.currentTocItem.depth) {
            // Find a parent with the same depth as the item we are adding.
            // Then add ourselves as a sibling to that parent.
            let parent = this.currentTocItem;
            while (parent.depth > depth) {
                // console.debug("Trying to find parent with depth: ", depth, " examining parent: ", parent);
                if (!parent.parent) {
                    throw new Error(`Parent of item ${parent.text} not found`);
                }
                parent = parent.parent;
            } // parent.depth <= depth
            if (parent.parent) {
                parent.addSibling(itemToAdd);
            } else {
                // Parent is the root, so just add ourselves as a child.
                parent.addChild(itemToAdd);
            }
            this.currentTocItem = itemToAdd;

        } else if (depth === this.currentTocItem.depth) {
            this.currentTocItem.addSibling(itemToAdd);
            this.currentTocItem = itemToAdd;

        } else { // depth > this.currentTocItem.depth
            this.currentTocItem.addChild(itemToAdd);
            this.currentTocItem = itemToAdd;
        }

    }

    public toUl(): HTMLUListElement {
        // let menuItemHtml = `<li><a href="#${url}">${text}</a></li>`
        let ul = <HTMLUListElement>document.createElement("ul");
        this.toc.children.forEach(child => {
            ul.appendChild(child.toHTMLElements());
        });
        return ul;
    }

}

class TocItem {
    constructor(
        public url: string,
        public text: string,
        public depth: number,
        public parent: TocItem | null,
        public children: TocItem[] = []
    ) { }

    public addSibling(item: TocItem) {
        // Add a sibling
        // console.debug("Adding sibling: ", item, " to me: ", this);
        if (!this.parent) {
            throw new Error(`No parent for this item: ${this.text}`);
        }
        this.parent.children.push(item);
        item.parent = this.parent;
    }

    public addChild(item: TocItem) {
        // Add a child
        // console.debug("Adding child: ", item, " to me: ", this);
        this.children.push(item);
        item.parent = this;
    }

    public toHTMLElements(): HTMLLIElement {
        let li = <HTMLLIElement>document.createElement("li");
        let link = <HTMLAnchorElement>document.createElement("a");
        link.href = this.url;
        link.text = this.text;
        li.appendChild(link);
        if (this.children.length > 0) {
            let ul = <HTMLUListElement>document.createElement("ul");
            this.children.forEach(child => {
                ul.appendChild(child.toHTMLElements());
            });
            li.appendChild(ul);
        }
        return li;
    }
}