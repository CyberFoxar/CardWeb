import { SubscribableEvent } from "~src/ts/utils/SubscribableEvent";

export class RuleIndex {

    static CHANGE_EVENT = 'indexChanged';

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

    public static from(json: IndexJson): RuleIndex | null {
        // console.log("RuleIndex from");
        if (!json || !json.lang || !json.entries) {
            console.error("Cannot create RuleIndex from json:", json);
            return null;
        }
        return new RuleIndex(json.lang, json.entries as Rule[]);
    }

    static fromMainIndexJson(json: MainIndexJson): MainIndex {
        let mainIndex: MainIndex = {
            indexes: []
        }

        json.indexes.forEach((i) => {
            const index = RuleIndex.from(i.index);
            const lang = index?.lang;
            const location = index?.lang;
            if(!index || !lang || !location){
                throw new Error(`Could not build MainIndex from json: ${json}`)
            }
            mainIndex.indexes.push({
                index: index,
                lang: lang,
                location: location
            })
        })

        return mainIndex;
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

export interface MainIndex {
    indexes: {
        index: RuleIndex,
        lang: string;
        location: string;
    }[];
}

// JSONs:
export interface IndexEntryJson {
    tags: [];
    id: string;
    playercount?: {
        min: number,
        max: number,
    };
    complexity?: number;
    length?: {
        min: number,
        max: number,
    };
    lastupdated?: Date;
    location?: string;
    content: string;
}

export interface IndexJson {
    lang: string;
    entries: IndexEntryJson[];
}

export interface MainIndexJson {
    indexes: {
        index: IndexJson,
        lang: string;
        location: string;
    }[];
}