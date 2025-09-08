const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');

async function statistics(interaction) {

    let stats = economy.prepare(`SELECT * FROM statistics WHERE id = 1`).get();

    let text = `**${stats.money_transferred}** total tokens transferred \n\n**${stats.purchases}** total purchases`;

    let embed = new EmbedBuilder()
        .setTitle('Statistics')
        .setDescription(text)
        .setTimestamp()

    await interaction.reply({ embeds: [embed] })

}

module.exports = statistics;