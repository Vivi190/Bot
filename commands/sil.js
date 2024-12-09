const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesaj siler.')
        .addIntegerOption(option => 
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true)),

    async execute(interaction) {

        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: 'Bu komutu kullanmaya yetkiniz yok!',
                ephemeral: true,
            });
        }

        const count = interaction.options.getInteger('miktar');

        if (!count || count < 1 || count > 100) {
            return interaction.reply('Silinecek mesaj sayısı 1 ile 100 arasında olmalıdır.');
        }


        const fetched = await interaction.channel.messages.fetch({ limit: count + 1 });
        await interaction.channel.bulkDelete(fetched);


        const logChannel = interaction.guild.channels.cache.get('1314693884521091084'); // Log kanalının ID'sini buraya ekleyin


        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('Mesaj Silme İşlemi')
            .addFields(
                { name: 'Silinen Mesaj Sayısı', value: count.toString(), inline: true },
                { name: 'Yetkili', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Kanal', value: `${interaction.channel}`, inline: true },
                { name: 'Zaman', value: new Date().toLocaleString(), inline: true }
            );


        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }


        await interaction.reply(`${count} mesaj başarıyla silindi.`);
    }
};
