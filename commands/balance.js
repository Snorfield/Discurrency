const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function balance(interaction) {

    let userId = interaction.user.id;

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let balance = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;

    let embed = new EmbedBuilder()
        .setDescription(`Your current balance is **${balance}** ${withPlural(balance)}.`)

    await interaction.reply({ embeds: [embed] });
}

module.exports = balance;
