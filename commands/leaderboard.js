const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');

async function leaderboard(interaction) {

    let client = interaction.client;

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

}

module.exports = leaderboard;