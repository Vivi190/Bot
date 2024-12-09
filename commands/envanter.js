const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('envanter')
        .setDescription('Ot envanterinizi gösterir'),

    async execute(interaction) {
        const otData = db.getOt(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle('🌿ᴏᴛ ᴇɴᴠᴀɴᴛᴇʀɪ')
            .setDescription(`${interaction.user.tag} ᴋᴜʟʟᴀɴıᴄısının envanteri`)
            .addFields({ name: 'Ot Miktarı', value: `${otData.miktar}`, inline: true })
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};