const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function editProduct(interaction) {

    let productId = interaction.options.getNumber('id');
    let userId = interaction.user.id;

    let productObject = economy.prepare('SELECT * FROM shops WHERE id = ? AND user_id = ?').get(productId, userId);

    if (productObject) {

        let product = interaction.options.getString('product');
        let description = interaction.options.getString('description');
        let price = interaction.options.getNumber('price');

        if (!product) {
            product = productObject.service;
        }

        if (!description) {
            description = productObject.description;
        }

        if (price === null || price === undefined) {
            price = productObject.price;
        } else {
            price = Math.abs(price);
        }

        economy.prepare('UPDATE shops SET service = ?, description = ?, price = ? WHERE id = ?').run(product, description, price, productId);

        let text = `**${product}**\n*${price} ${withPlural(price)}*\n${description}`;

        let embed = new EmbedBuilder()
            .setTitle(`:white_check_mark: Product Successfully Edited`)
            .setDescription(text)
            .setTimestamp()

        await interaction.reply({ embeds: [embed] });

    } else {
        let embed = new EmbedBuilder()
            .setDescription(":x: Could not find the item you want to edit.")

        await interaction.reply({ embeds: [embed] });

    }

}

module.exports = editProduct;