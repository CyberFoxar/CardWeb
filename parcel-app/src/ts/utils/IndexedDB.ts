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
     * Opens the DB and callback with the opened db object.
     * @param callback 
     */
    public openDB(callback: (db: IDBDatabase | undefined) => any = () => {}, ver: number = this.dbVersion): void {
        this.dbVersion = ver;
        const req = window.indexedDB.open(this.dbName, this.dbVersion);

        req.onsuccess = (event: Event) => {
            this.db = req.result;
            callback(req.result);
        }
        req.onerror = (event: Event) => {
            console.error('error opening indexedDB', event);
            callback(req.result);
        }
        req.onupgradeneeded = (event: Event) => {
            console.warn("upgrading indexedDB");
            this.db = req.result;
            this.initDB();
            callback(req.result);
        }
    }

        /**
     * Opens the DB and callback with the opened db object.
     * @param callback 
     */
         public openDBPromise(callback: (db: IDBDatabase | undefined) => any = () => {}, ver: number = this.dbVersion): void {
            this.dbVersion = ver;
            const req = window.indexedDB.open(this.dbName, this.dbVersion);
    
            req.onsuccess = (event: Event) => {
                this.db = req.result;
                callback(req.result);
            }
            req.onerror = (event: Event) => {
                console.error('error opening indexedDB', event);
                callback(req.result);
            }
            req.onupgradeneeded = (event: Event) => {
                console.warn("upgrading indexedDB");
                this.db = req.result;
                this.initDB();
                callback(req.result);
            }
        }

    /**
     * Initialize the DB: create an object store for our rules and callback with it once done.
     * @param callback 
     */
    public initDB(callback: (o: IDBObjectStore) => any = () => {} ): void {
        if(!this.db) {
            console.error("db not initialized");
            return;
        }
        var store = this.db.createObjectStore('saved-rules-fr', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.transaction.oncomplete = (event: Event) => {
            console.log('store created');
        }
        callback(store);
    }

    /**
     * Add a single rule (IndexEntry) to the DB.
     * Calls back once the transaction is complete with the result of the transaction (i.e. the added key or undefined if there was an error).
     * @param rule 
     * @param callback 
     */
    public addRule(rule: Rule, callback: (r: IDBValidKey | undefined) => any = () => {}): void {
        if(!this.db) {
            console.error("db not initialized");
            return;
        }
        const tx = this.db.transaction('saved-rules-fr', 'readwrite');
        const store = tx.objectStore('saved-rules-fr');
        const req = store.add(rule);
        req.onsuccess = (event: Event) => {
            callback(req.result);
        }
        req.onerror = (event: Event) => {
            console.error('error adding rule', event);
            callback(req.result);
        }
    }

    public getRule(id: string, callback: (r: Rule | undefined) => any = () => {}): void {
        if(!this.db) {
            console.error("db not initialized");
            return;
        }
        const tx = this.db.transaction('saved-rules-fr', 'readonly');
        const store = tx.objectStore('saved-rules-fr');
        const req = store.get(id);
        req.onsuccess = (event: Event) => {
            callback(req.result);
        }
        req.onerror = (event: Event) => {
            console.error('error adding rule', event);
            callback(req.result);
        }
    }

}