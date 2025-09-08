const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function shop(interaction) {

    let client = interaction.client;

    let targetUser = interaction.options.getUser('user').id;
    let userShops = economy.prepare('SELECT * FROM shops WHERE user_id = ?').all(targetUser);

    if (userShops.length > 0) {

        let text = '';

        for (let i = 0; i < userShops.length; i++) {
            let item = userShops[i];
            text += `**#${item.id} - ${item.service}**\n*${item.price} ${withPlural(item.price)}*\n${item.description}\n\n`;
        }

        let mention = (await client.users.fetch(targetUser)).username;

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
}

module.exports = shop;