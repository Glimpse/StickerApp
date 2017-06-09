// this is intended for use in a Kubernetes init container;
// the exit code signals success/failure to k8s

const assert = require('assert');
const db = require('./mongodb');
const initialData = require('./initial-data');

async function initDb() {
    try {
        let stickers = await db.getStickersAsync();
        if (!stickers.length || stickers.length < initialData.length) {
            await db.initializeDatabaseAsync(initialData);
            stickers = await db.getStickersAsync();
            assert.strictEqual(stickers.length, initialData.length);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

initDb();
