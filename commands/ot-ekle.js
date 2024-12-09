const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { yetkiliRolId, logKanalId } = require('../config.json');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ot-ekle')
        .setDescription('Belirtilen ᴋᴜʟʟᴀɴıᴄıya ot ekler')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Ot eklenecek ᴋᴜʟʟᴀɴıᴄı')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Eklenecek ot miktarı')
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
        const yeniMiktar = db.addOt(user.id, miktar);

        const logChannel = interaction.guild.channels.cache.get(logKanalId);
        const logEmbed = new EmbedBuilder()
            .setTitle('🌿ᴏᴛ ᴇᴋʟᴇᴍᴇ ɪ̇ꜱ̧ʟᴇᴍi')
            .setColor('#00ff00')
            .addFields(
                { name: 'ɪ̇ꜱ̧ʟᴇᴍ', value: 'Ot Ekleme', inline: true },
                { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
                { name: 'ʏᴇᴛᴋɪʟɪ ɪᴅ', value: `${interaction.user.id}`, inline: true },
               { name: 'ᴋᴜʟʟᴀɴıcı', value: `<@${user.id}>`, inline: true },
                { name: 'ᴋᴜʟʟᴀɴıᴄı ID', value: `${user.id}`, inline: true },
                { name: 'ᴇᴋʟᴇɴᴇɴ ᴍɪᴋᴛᴀʀ', value: `${miktar}`, inline: true },
                { name: 'ᴇꜱᴋɪ ᴍɪᴋᴛᴀʀ', value: `${otData.miktar}`, inline: true },
                { name: 'ʏᴇɴɪ ᴍɪᴋᴛᴀʀ', value: `${yeniMiktar}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Ot Sistemi - Ekleme ɪ̇ꜱ̧ʟᴇᴍi' });

        await logChannel.send({ embeds: [logEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('🌿ᴏᴛ ᴇᴋʟᴇᴍᴇ Başarılı')
            .setColor('#00ff00')
            .setDescription(`${user.tag} ᴋᴜʟʟᴀɴıᴄısına ${miktar} ot eklendi.`)
            .addFields(
                { name: 'ᴇꜱᴋɪ ᴍɪᴋᴛᴀʀ', value: `${otData.miktar}`, inline: true },
                { name: 'ʏᴇɴɪ ᴍɪᴋᴛᴀʀ', value: `${yeniMiktar}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
    }
};