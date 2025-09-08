const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const commands = [

    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get your current balance')
        .toJSON(),
    
    new SlashCommandBuilder()
        .setName('statistics')
        .setDescription('View the statistics of the economy')
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
        .setName('leaderboard')
        .setDescription('View the global token leaderboard')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View a user\'s shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Shop owner')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('create-product')
        .setDescription('Create a product for your shop')
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Name of the product')
                .setMaxLength(200) 
                .setMinLength(1) 
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description for the product')
                .setMaxLength(200) 
                .setMinLength(1) 
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('price')
                .setDescription('Price for the product')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('remove-product')
        .setDescription('Remove a product from your shop')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('ID of the product to remove')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy a product from a user\'s shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User shop to buy from')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('ID of product to buy')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('edit-product')
        .setDescription('Edit a product from your shop')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('Id of the product to edit')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('product')
                .setDescription('New name of the product')
                .setMaxLength(200) 
                .setMinLength(1) 
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('New description for the product')
                .setMaxLength(200) 
                .setMinLength(1) 
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName('price')
                .setDescription('New price for the product')
                .setRequired(false)
        )
        .toJSON()
        
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {

        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId, guildId), { body: [] });

        console.log('Successfully deleted all application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId, guildId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {
        console.error(error);
    }
})();

