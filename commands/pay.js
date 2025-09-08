const economy = require('../economy');
const { EmbedBuilder } = require('discord.js');
const withPlural = require('../utils.js')

async function pay(interaction) {

    let userId = interaction.user.id;
    let amount = Math.abs(interaction.options.getNumber('amount'));

    economy.prepare('INSERT OR IGNORE INTO users (user_id, balance) VALUES (?, 100)').run(userId);

    let balance = economy.prepare('SELECT balance FROM users WHERE user_id = ?').get(userId).balance;

    if ((balance - amount) < 0) {

        let embed = new EmbedBuilder()
            .setDescription(':x: You don\'t have enough tokens to make this transfer.')

        await interaction.reply({ embeds: [embed] });

    } else {

        let recipient = interaction.options.getUser('user').id;
        let recipientUser = economy.prepare('SELECT * FROM users WHERE user_id = ?').get(recipient);

        if (recipientUser) {

            economy.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ?').run(amount, userId);
            economy.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, recipient);

            economy.prepare(`UPDATE statistics SET money_transferred = money_transferred + ? WHERE id = 1`).run(amount);


            let embed = new EmbedBuilder()
                .setDescription(`:white_check_mark: Paid user <@${recipient}> **${amount}** ${withPlural(amount)}.`)

            await interaction.reply({ embeds: [embed] });


        } else {
            let embed = new EmbedBuilder()
                .setDescription(":x: This user doesn\'t have an account. Tell them to run /balance.")

            await interaction.reply({ embeds: [embed] });
        }
    }

}


module.exports = pay;