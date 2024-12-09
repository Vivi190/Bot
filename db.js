const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

db.exec(`
    CREATE TABLE IF NOT EXISTS otlar (
        userId TEXT PRIMARY KEY,
        miktar INTEGER DEFAULT 0
    )
`);

const dbOperations = {
    getOt: (userId) => {
        const row = db.prepare('SELECT * FROM otlar WHERE userId = ?').get(userId);
        return row || { userId, miktar: 0 };
    },

    setOt: (userId, miktar) => {
        const stmt = db.prepare('INSERT OR REPLACE INTO otlar (userId, miktar) VALUES (?, ?)');
        stmt.run(userId, miktar);
    },

    addOt: (userId, miktar) => {
        const currentOt = dbOperations.getOt(userId);
        const newMiktar = currentOt.miktar + miktar;
        dbOperations.setOt(userId, newMiktar);
        return newMiktar;
    },

    getAllOt: () => {
        const stmt = db.prepare('SELECT * FROM otlar');
        return stmt.all();
    }
};

module.exports = dbOperations;