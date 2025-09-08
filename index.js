// Imports

const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const commands = require('./commands/commandManager.js');
const economy = require('./economy');

// Database Setup

// Stores user balances
economy.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 100
  )
`).run();

// Stores user shop data 
economy.prepare(`
  CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      price INTEGER DEFAULT 0,
      service TEXT DEFAULT '',
      description TEXT DEFAULT ''
  )
`).run();

// Stores statistics
economy.prepare(`
  CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY CHECK (id = 1), 
      money_transferred INTEGER DEFAULT 0,
      purchases INTEGER DEFAULT 0
  )
`).run();

economy.prepare(`INSERT OR IGNORE INTO statistics (id) VALUES (?)`).run(1);


// General discord bot setup (annoying)

let activities = [
  "Wait... this is monopoly money?",
  "Is this capitalism?"
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "balance") {

    commands.balance(interaction);

  } else if (commandName === 'pay') {

    commands.pay(interaction);

  } else if (commandName === 'leaderboard') {

    commands.leaderboard(interaction);

  } else if (commandName === 'shop') {

    commands.shop(interaction);

  } else if (commandName === 'create-product') {

    commands.createProduct(interaction);

  } else if (commandName === 'remove-product') {

    commands.removeProduct(interaction);

  } else if (commandName === 'buy') {

    commands.buy(interaction);

  } else if (commandName === 'edit-product') {

    commands.editProduct(interaction);

  } else if (commandName === 'statistics') {

    commands.statistics(interaction);

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
