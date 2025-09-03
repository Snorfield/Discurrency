const db = require('better-sqlite3')('economy.db');

let userId = '1120416170328195236';

let row = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);

if (row) {
    console.log('Ok');
    db.prepare('UPDATE users SET balance = ? WHERE user_id = ?').run('100000000000', userId);
}
