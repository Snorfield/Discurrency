const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');

async function removeProduct(interaction) {

    let userId = interaction.user.id;

    let productId = interaction.options.getNumber('id');

    let productObject = economy.prepare('SELECT * FROM shops WHERE id = ? AND user_id = ?').get(productId, userId);

    if (productObject) {

        economy.prepare('DELETE FROM shops WHERE id = ? AND user_id = ?').run(productId, userId);
        let embed = new EmbedBuilder()
            .setDescription(":white_check_mark: Product successfully removed from your shop.")

        await interaction.reply({ embeds: [embed] });

    } else {

        let embed = new EmbedBuilder()
            .setDescription(":x: You don't own a product listing with that id!")

        await interaction.reply({ embeds: [embed] });

    }

}

module.exports = removeProduct;