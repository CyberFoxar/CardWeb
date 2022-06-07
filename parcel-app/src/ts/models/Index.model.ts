export class RuleIndex {
    constructor(
        public lang: string,
        public entries: Rule[] = []) { }
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


