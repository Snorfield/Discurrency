const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function buy(interaction) {

    let userId = interaction.user.id;
    let userScreenName = interaction.user.username;

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let userBalance = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;

    let shopOwner = interaction.options.getUser('user');
    let shopOwnerId = interaction.options.getUser('user').id;

    let productId = interaction.options.getNumber('id');

    let productObject = economy.prepare('SELECT * FROM shops WHERE id = ? AND user_id = ?').get(productId, shopOwnerId);

    if (productObject) {

        if (userBalance >= productObject.price) {

            economy.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(productObject.price, userId);
            economy.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(productObject.price, shopOwnerId);

            economy.prepare(`UPDATE statistics SET money_transferred = money_transferred + ? WHERE id = 1`).run(productObject.price);
            economy.prepare(`UPDATE statistics SET purchases = purchases + 1 WHERE id = 1`).run();

            let dmSuccess = false;

            let buyerEmbed = new EmbedBuilder()
                .setDescription(`:white_check_mark: Your purchase of **${productObject.service}** from <@${shopOwnerId}> has gone through successfully.`)


            let sellerEmbed = new EmbedBuilder()
                .setDescription(`<@${userId}> (${userScreenName}) has purchased **${productObject.service}** from you. **+${productObject.price}** ${withPlural(productObject.price)}`);

            await interaction.deferReply();

            try {
                await shopOwner.send({ embeds: [sellerEmbed] });
                dmSuccess = true;
            } catch (error) {
                dmSuccess = false;
            }

            if (dmSuccess) {
                await interaction.editReply({ embeds: [buyerEmbed] });
            } else {
                await interaction.editReply({ content: `<@${shopOwnerId}>`, embeds: [buyerEmbed] });
            }

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

module.exports = buy;
