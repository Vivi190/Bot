const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { yetkiliRolId } = require('../config.json');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sıralama')
        .setDescription('Ot miktarına göre sıralama gösterir'),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(yetkiliRolId)) {
            return interaction.reply({
                content: 'Bu komutu kullanma yetkiniz yok!',
                ephemeral: true
            });
        }

        try {
            const allData = await db.getAllOt();
            const sortedData = allData.sort((a, b) => b.miktar - a.miktar);

            const perPage = 10;
            const pageCount = Math.ceil(sortedData.length / perPage);

            if (sortedData.length === 0) {
                return interaction.reply({
                    content: 'Henüz hiç veri bulunmuyor!',
                    ephemeral: true
                });
            }

            let currentPage = 0; // currentPage burada tanımlandı

            const generateEmbed = (page) => {
                const start = page * perPage;
                const end = start + perPage;
                const currentData = sortedData.slice(start, end);

                let description = '';
                for (let i = 0; i < currentData.length; i++) {
                    const rank = start + i + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                    description += `${medal} <@${currentData[i].userId}>: **${currentData[i].miktar}** ot\n`;
                }

                return new EmbedBuilder()
                    .setTitle('🌿 ᴏᴛ ꜱıʀᴀʟᴀᴍᴀꜱı')
                    .setDescription(description)
                    .setColor('#00ff00')
                    .setFooter({ text: `Sayfa ${page + 1}/${pageCount} • Toplam ${sortedData.length} ᴋᴜʟʟᴀɴıᴄı` })
                    .setTimestamp();
            };

            const embed = generateEmbed(currentPage);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('⏪ İlk')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pageCount <= 1),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('Son ⏩')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pageCount <= 1)
                );

            const message = await interaction.reply({
                embeds: [embed],
                components: pageCount > 1 ? [buttons] : [],
                fetchReply: true
            });

            if (pageCount <= 1) return;

            // Buton koleksiyoncusu
            const collector = message.createMessageComponentCollector({
                time: 5 * 60 * 1000 
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: 'Bu butonları sadece komutu kullanan kişi kullanabilir!',
                        ephemeral: true
                    });
                }

                switch (i.customId) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'previous':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'next':
                        currentPage = Math.min(pageCount - 1, currentPage + 1);
                        break;
                    case 'last':
                        currentPage = pageCount - 1;
                        break;
                }

                buttons.components[0].setDisabled(currentPage === 0);
                buttons.components[1].setDisabled(currentPage === 0);
                buttons.components[2].setDisabled(currentPage === pageCount - 1);
                buttons.components[3].setDisabled(currentPage === pageCount - 1);

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [buttons]
                });
            });

            collector.on('end', () => {
                buttons.components.forEach(button => button.setDisabled(true));
                message.edit({ components: [buttons] }).catch(() => {});
            });

        } catch (error) {
            console.error('Sıralama oluşturulurken hata:', error);
            await interaction.reply({
                content: 'Sıralama oluşturulurken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
};