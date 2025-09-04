// Discord Setup

const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

// Database Setup

const economy = require('better-sqlite3')('economy.db');

// Stores user balances
economy.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 100
  )
`).run();

// Stores user shop data (not implemented yet)
economy.prepare(`
  CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      price INTEGER DEFAULT 0,
      service TEXT DEFAULT '',
      description TEXT DEFAULT ''
  )
`).run();


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

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let row = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);

    let balance = row.balance;

    let embed = new EmbedBuilder()
      .setDescription(`Your current balance is **${balance}** ${value(balance)}.`)

    await interaction.reply({ embeds: [embed] });

  } else if (commandName === 'pay') {

    let userId = interaction.user.id;
    let amount = Math.abs(interaction.options.getNumber('amount'));

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let balance = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId);

    if ((balance.balance - amount) < 0) {

      let embed = new EmbedBuilder()
        .setDescription(':x: You don\'t have enough tokens to make this transfer.')

      await interaction.reply({ embeds: [embed] });

    } else {

      let recipient = interaction.options.getUser('user').id;
      let recipientUser = economy.prepare('SELECT * FROM users WHERE user_id = ?').get(recipient);

      if (recipientUser) {

        economy.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(amount, userId);
        economy.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, recipient);

        let embed = new EmbedBuilder()
          .setDescription(`:white_check_mark: Paid user <@${recipient}> **${amount}** ${value(amount)}.`)

        await interaction.reply({ embeds: [embed] });

      } else {
        let embed = new EmbedBuilder()
          .setDescription(":x: This user doesn\'t have an account. Tell them to run /balance.")

        await interaction.reply({ embeds: [embed] });
      }
    }
  } else if (commandName === 'leaderboard') {

    let leaderboard = '';

    let topUsers = economy.prepare(`
      SELECT user_id, balance
      FROM users
      ORDER BY balance DESC
      LIMIT 10
    `).all();

    for (let i = 0; i < topUsers.length; i++) {

      let mention = (await client.users.fetch(topUsers[i].user_id)).username;

      leaderboard += `**${mention}**: ${Math.round(Number(topUsers[i].balance))} \n`;
    }

    let embed = new EmbedBuilder()
      .setTitle('Top Users By Tokens')
      .setDescription(leaderboard)
      .setTimestamp()

    await interaction.reply({ embeds: [embed] });
  } else if (commandName === 'shop') {

    let target = interaction.options.getUser('user').id;
    let userShops = economy.prepare('SELECT * FROM shops WHERE user_id = ?').all(target);

    if (userShops.length > 0) {

      let text = '';

      for (let i = 0; i < userShops.length; i++) {
        let item = userShops[i];
        text += `**#${item.id} - ${item.service}**\n*${item.price} ${value(price)}*\n${item.description}\n\n`;
      }

      let mention = (await client.users.fetch(target)).username;

      let embed = new EmbedBuilder()
        .setTitle(`${mention}'s Shop`)
        .setDescription(text)
        .setTimestamp()

      await interaction.reply({ embeds: [embed] });
    } else {
      let embed = new EmbedBuilder()
        .setDescription(":x: This user doesn't have any shops!")

      await interaction.reply({ embeds: [embed] });
    }

  } else if (commandName === 'create-product') {

    let userId = interaction.user.id;
    
    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let userShops = economy.prepare('SELECT * FROM shops WHERE user_id = ?').all(userId);

    if (userShops.length >= 4) {
      let embed = new EmbedBuilder()
        .setDescription(":x: You have the limit of four products in your shop, please remove some to add this product.")

      await interaction.reply({ embeds: [embed] });

    } else {
      economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

      let product = interaction.options.getString('product');
      let description = interaction.options.getString('description');
      let price = Math.abs(interaction.options.getNumber('price'));

      economy.prepare(`INSERT INTO shops (user_id, service, description, price) VALUES (?, ?, ?, ?);`).run(userId, product, description, price);

      let text = `**${product}**\n*${price} ${value(price)}*\n${description}`;

      let embed = new EmbedBuilder()
        .setTitle(`Product Successfully Created`)
        .setDescription(text)
        .setTimestamp()

      await interaction.reply({ embeds: [embed] });
    }
  } else if (commandName === 'remove-product') {

    let userId = interaction.user.id;

    let productId = interaction.options.getNumber('id');

    let product = economy.prepare('SELECT * FROM shops WHERE id = ? AND user_id = ?').get(productId, userId);

    if (product) {
      economy.prepare('DELETE FROM shops WHERE id = ? AND user_id = ?').run(productId, userId);
      let embed = new EmbedBuilder()
        .setDescription(":white_check_mark: Product successfully removed from your shop.")

      await interaction.reply({ embeds: [embed] });
    } else {
      let embed = new EmbedBuilder()
        .setDescription(":x: You don't own a product listing with that id!")

      await interaction.reply({ embeds: [embed] });
    }

  } else if (commandName === 'buy') {

    let userId = interaction.user.id;

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let balance = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;

    let targetUserShop = interaction.options.getUser('user').id;

    let targetShopId = interaction.options.getNumber('id');

    let product = economy.prepare('SELECT * FROM shops WHERE id = ? AND user_id = ?').get(targetShopId, targetUserShop);

    if (product) {

      if (balance >= product.price) {

        economy.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(product.price, userId);
        economy.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(product.price, targetUserShop);

        let embed = new EmbedBuilder()
          .setDescription(`:white_check_mark: Your purchase of **${product.service}** from <@${targetUserShop}> has gone through successfully.`)

        await interaction.reply({ content: `<@${targetUserShop}>`, embeds: [embed] });

      } else {

        let embed = new EmbedBuilder()
          .setDescription(":x: You don't have enough tokens to buy this product.")

        await interaction.reply({ embeds: [embed] });
      }


    } else {
      let embed = new EmbedBuilder()
        .setDescription(":x: Either this user doesn't have any products, or they don't have one with that id.")

      await interaction.reply({ embeds: [embed] });
    }
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
