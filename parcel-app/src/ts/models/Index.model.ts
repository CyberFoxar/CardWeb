import { SubscribableEvent } from "~src/ts/utils/SubscribableEvent";

export class RuleIndex {

    static CHANGE_EVENT = 'indexChanged'

    public subEvent: SubscribableEvent<String> = new SubscribableEvent<String>();

    private _entries: Rule[] = [];
    public get entries(): Rule[] {
        return this._entries;
    }
    public set entries(value: Rule[]) {
        this.subEvent.fire(RuleIndex.CHANGE_EVENT);
        this._entries = value;
    }

    public addEntry(entry: Rule) {
        this.subEvent.fire(RuleIndex.CHANGE_EVENT);
        this.entries.push(entry);
    }

    constructor(
        public lang: string,
        entries: Rule[] = []) {
        this.entries = entries;
    }

    public static from(json: any): RuleIndex | null {
        // console.log("RuleIndex from");
        if(!json || !json.lang || !json.entries) {
            console.error("Cannot create RuleIndex from json:", json);
            return null;
        }
        return new RuleIndex(json.lang, json.entries);
    }
}

export class Rule {
    constructor(
        public tags = [],
        public id: string,
        public location: string,
        public playercount?: {
            min: number,
            max: number,
        },
        public complexity?: number,
        public length?: {
            min: number,
            max: number,
        },
        public lastupdated?: Date,
        public content = '') {
        if (!id || id.length === 0) {
            throw new Error(`IndexEntry with tags ${tags} @location ${location} : id is empty`);
        }
    }
}


