const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function createProduct(interaction) {
    
        let userId = interaction.user.id;
    
        economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);
    
        let userProducts = economy.prepare('SELECT * FROM shops WHERE user_id = ?').all(userId);
    
        if (userProducts.length >= 8) {

          let embed = new EmbedBuilder()
            .setDescription(":x: You have the limit of eight products in your shop, please remove some to add this product.")
    
          await interaction.reply({ embeds: [embed] });
    
        } else {

          economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);
    
          let product = interaction.options.getString('product');
          let description = interaction.options.getString('description');
          let price = Math.abs(interaction.options.getNumber('price'));
    
          economy.prepare(`INSERT INTO shops (user_id, service, description, price) VALUES (?, ?, ?, ?);`).run(userId, product, description, price);
    
          let text = `**${product}**\n*${price} ${withPlural(price)}*\n${description}`;
    
          let embed = new EmbedBuilder()
            .setTitle(`Product Successfully Created`)
            .setDescription(text)
            .setTimestamp()
    
          await interaction.reply({ embeds: [embed] });
        }

}

module.exports = createProduct;