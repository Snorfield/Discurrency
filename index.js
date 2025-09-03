// Discord Setup

const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

// Database Setup

const db = require('better-sqlite3')('economy.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 100
  )
`).run();

db.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, ?)').run('house', 1000000000000000);

// General discord bot setup (annoying)

function value(amount) {
  return (amount === 1) ? 'token' : 'tokens';
}

let activities = [
  "Wait... this is monopoly money?"
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "balance") {

    let userId = interaction.user.id;

    db.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let row = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);

    let balance = row.balance;

    await interaction.reply(`Your current balance is ${balance} ${value(balance)}.`);

  } else if (commandName === 'pay') {


    let userId = interaction.user.id;
    let amount = Math.abs(interaction.options.getNumber('amount'));

    db.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let balance = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);

    if ((balance.balance - amount) < 0) {

      await interaction.reply('You don\'t have enough tokens to make this transfer.');

    } else {

      let recipient = interaction.options.getUser('user').id;
      let recipientUser = db.prepare('SELECT * FROM users WHERE user_id = ?').get(recipient);

      if (recipientUser) {

        db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(amount, userId);
        db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, recipient);

        await interaction.reply(`Paid user <@${recipient}> ${amount} ${value(amount)}.`);

      } else {

        await interaction.reply('This user doesn\'t have an account. Tell them to run /balance.');

      }
    }
  } else if (commandName === 'gamble') {

    let userId = interaction.user.id;

    let amount = Math.abs(interaction.options.getNumber('amount'));

    db.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let house = db.prepare('SELECT balance FROM users WHERE user_id = ?').get('house').balance;
    let user = db.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;

    if (user >= amount) {
      if (house >= amount) {

        let chance = Math.floor(Math.random() * 100);

        if (chance < 51) {

          await interaction.reply(`You won ${amount} ${value(amount)}!`);
          db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(amount, 'house');
          db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, userId);

        } else {

          await interaction.reply(`You lost ${amount} ${value(amount)}. The house has gained it.`);
          db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, 'house');
          db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(amount, userId);

        }

      } else {

        await interaction.reply("The house doesn't have enough tokens to go through with this bet.");

      }
    } else {

      await interaction.reply("You don't have enough tokens to go through with this bet.");

    }



  } else if (commandName === 'house') {
    let balance = db.prepare('SELECT balance FROM users WHERE user_id = ?').get('house');
    await interaction.reply(`The balance of the house is ${balance.balance} tokens.`);
  } else if (commandName === 'leaderboard') {

    let leaderboard = '';

    let topUsers = db.prepare(`
      SELECT user_id, balance
      FROM users
      ORDER BY balance DESC
      LIMIT 10
    `).all();

    for (let i = 0; i < topUsers.length; i++) {

      let mention = '';

      if (!(topUsers[i].user_id === 'house')) {

        mention = `<@${topUsers[i].user_id}>`;

      } else {

        mention = 'House';

      }
      leaderboard += `${mention}: ${Number(topUsers[i].balance).toFixed(2)} \n`;
    }


    let embed = new EmbedBuilder()
      .setTitle('Top Users By Tokens')
      .setDescription(leaderboard)
      .setTimestamp()

    await interaction.reply({ embeds: [embed] });

  }

  

});


client.once(Events.ClientReady, readyClient => {

  console.log(`Ready on ${readyClient.user.tag}`);

  client.user.setPresence({
    activities: [{ name: activities[Math.floor(Math.random() * activities.length)], type: 4 }],
    status: 'online',
  });

});

client.login(token);




