import { Rule } from "../models/Index.model";

export class IndexedDB {
    private dbName: string = 'cw-indexed-db';
    private dbVersion: number = 1;
    private db: IDBDatabase | undefined;

    constructor() {
        if (!window.indexedDB) {
            console.log("Your browser doesn't support a stable version of IndexedDB. Offline storage of rules might not work (it'll be in your localStorage, maybe)");
        }
        this.openDB();
    }

    /**
     * Opens the DB and return a Promise with the db object.
     * @param callback 
     */
    public openDB(ver: number = this.dbVersion): Promise<IDBDatabase> {
        this.dbVersion = ver;
        const req = window.indexedDB.open(this.dbName, this.dbVersion);

        return new Promise((resolve, reject) => {
            req.onsuccess = (event: Event) => {
                this.db = req.result;
                resolve(req.result);
            };
            req.onerror = (event: Event) => {
                console.error('error opening indexedDB', event);
                reject(req.result);
            };
            req.onupgradeneeded = async (event: Event) => {
                console.warn("upgrading indexedDB");
                this.db = req.result;
                await this.initDB();
                resolve(req.result);
            };
        });
    }

    /**
     * Initialize the DB: create an object store for our rules and return a promise with it.
     * @param callback 
     */
    public initDB(): Promise<IDBObjectStore> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.error("db not initialized");
                reject();
                return;
            }
            const store = this.db.createObjectStore('saved-rules-fr', { keyPath: 'id' });
            store.createIndex('id', 'id', { unique: true });
            store.transaction.oncomplete = (event: Event) => {
                console.log('store created');
                resolve(store);
            };
            store.transaction.onerror = (event: Event) => {
                console.error('error creating store', event);
                reject(store);
            };
        });
    }

    /**
     * Add a single rule (IndexEntry) to the DB.
     * Calls back once the transaction is complete with the result of the transaction (i.e. the added key or undefined if there was an error).
     * @param rule 
     * @param callback 
     */
    public addRule(rule: Rule): Promise<IDBValidKey> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.error("db not initialized");
                reject();
                return;
            }
            const tx = this.db.transaction('saved-rules-fr', 'readwrite');
            const store = tx.objectStore('saved-rules-fr');
            const req = store.add(rule);
            req.onsuccess = (event: Event) => {
                resolve(req.result);
            };
            req.onerror = (event: Event) => {
                console.error('error adding rule', event);
                reject(req.result);
            };
        });
    }

    public getRule(id: string): Promise<Rule> {
        console.log("getting rule", id);

        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.error("db not initialized");
                reject();
                return;
            }
            const tx = this.db.transaction('saved-rules-fr', 'readonly');
            const store = tx.objectStore('saved-rules-fr');
            const req = store.get(id);
            req.onsuccess = (event: Event) => {
                resolve(req.result);
            };
            req.onerror = (event: Event) => {
                console.error('error adding rule', event);
                reject(req.result);
            };
        });
    }

}