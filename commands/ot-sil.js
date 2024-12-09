const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { yetkiliRolId, logKanalId } = require('../config.json');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ot-sil')
        .setDescription('Belirtilen ᴋᴜʟʟᴀɴıᴄıdan ot siler')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Ot silinecek ᴋᴜʟʟᴀɴıᴄı')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Silinecek ot miktarı')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(yetkiliRolId)) {
            return interaction.reply({
                content: 'Bu komutu kullanma yetkiniz yok!',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('kullanici');
        const miktar = interaction.options.getInteger('miktar');
        const otData = db.getOt(user.id);

        if (otData.miktar < miktar) {
            return interaction.reply({
                content: `ᴋᴜʟʟᴀɴıᴄının yeterli otu yok! Mevcut ot: ${otData.miktar}`,
                ephemeral: true
            });
        }

        const yeniMiktar = db.addOt(user.id, -miktar);

        const logChannel = interaction.guild.channels.cache.get(logKanalId);
        const logEmbed = new EmbedBuilder()
            .setTitle('🌿ᴏᴛ ꜱɪʟᴍᴇ ɪ̇ꜱ̧ʟᴇᴍɪ')
            .setColor('#00ff00')
            .addFields(
                { name: 'ɪ̇ꜱ̧ʟᴇᴍ', value: 'Ot Silme', inline: true },
                { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
                { name: 'ʏᴇᴛᴋɪʟɪ ɪᴅ', value: `${interaction.user.id}`, inline: true },
                { name: 'ᴋᴜʟʟᴀɴıcı', value: `<@${user.id}>`, inline: true },
                { name: 'ᴋᴜʟʟᴀɴıᴄı ID', value: `${user.id}`, inline: true },
                { name: 'ꜱɪʟɪɴᴇɴ ᴍɪᴋᴛᴀʀ', value: `${miktar}`, inline: true },
                { name: 'ᴇꜱᴋɪ ᴍɪᴋᴛᴀʀ', value: `${otData.miktar}`, inline: true },
                { name: 'ʏᴇɴɪ ᴍɪᴋᴛᴀʀ', value: `${yeniMiktar}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Ot Sistemi - Silme ɪ̇ꜱ̧ʟᴇᴍi' });

        await logChannel.send({ embeds: [logEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('🌿 Ot Silme Başarılı')
            .setColor('#00ff00')
            .setDescription(`${user.tag} ᴋᴜʟʟᴀɴıᴄısından ${miktar} ot silindi.`)
            .addFields(
                { name: 'ᴇꜱᴋɪ ᴍɪᴋᴛᴀʀ', value: `${otData.miktar}`, inline: true },
                { name: 'ʏᴇɴɪ ᴍɪᴋᴛᴀʀ', value: `${yeniMiktar}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
    }
};