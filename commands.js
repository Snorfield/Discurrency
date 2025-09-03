const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const commands = [

    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get your current balance')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay a user a certain amount of tokens')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Payment recipient')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount of tokens to transfer')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('50/50 chance to win the amount you gambled, if you lose, it\'s added into the house.')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount to gamble')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('house')
        .setDescription('View the balance of the house')
        .toJSON(),
    
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the global token leaderboard')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {

        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: [] });

        console.log('Successfully deleted all application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {
        console.error(error);
    }
})();
