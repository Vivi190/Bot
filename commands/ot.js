const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yetkiliRolId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ot')
        .setDescription('Ot talep sistemini açar'),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(yetkiliRolId)) {
            return interaction.reply({
                content: 'Bu komutu kullanma yetkiniz yok!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🌿 ᴏᴛ ᴛᴀʟᴇᴘ ꜱɪꜱᴛᴇᴍɪ')
            .setDescription('ᴏᴛ ᴛᴀʟᴇʙɪɴᴅᴇ ʙᴜʟᴜɴᴍᴀᴋ ɪᴄ̧ɪɴ ᴀꜱ̧ᴀɢ̆ıᴅᴀᴋɪ ʙᴜᴛᴏɴᴀ ᴛıᴋʟᴀʏıɴ.')
            .setColor('#00ff00');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ot-ekle-talep')
                    .setLabel('Ot Talep Et')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};