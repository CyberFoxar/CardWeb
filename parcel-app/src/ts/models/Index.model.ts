export class Index {
    constructor(
        public lang: string,
        public entries: IndexEntry[] = []) { }
}

export class IndexEntry {
    constructor(
        public tags = [],
        public id: string,
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
        public location?: string,
        public content = '') {
        if (!id || id.length === 0) {
            throw new Error(`IndexEntry with tags ${tags}: id is empty`);
        }
    }
}


