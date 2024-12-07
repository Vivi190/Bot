const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const minik = require('../../minik.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farm-mesaj')
        .setDescription('Kullanıcıların farm girmesi için menü gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            const militanembed = new EmbedBuilder()
                .setTitle('Farm Menüsü')
                .setColor('ff0400')
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setImage(minik.mesai.ekip.photograph)
                .setDescription(minik.mesai.menuayarlari.mesaj);

            const militaninmenusu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('farm-olustur')
                        .setPlaceholder(minik.farm.menuayarlari.menuplaceholder)
                        .addOptions([
                            {
                                label: minik.farm.menuayarlari.birseceneklabel,
                                emoji: '😊', // Replace with a valid emoji
                                description: minik.farm.menuayarlari.birsecenekaciklama,
                                value: 'farmkontrol',
                            },
                            {
                                label: minik.farm.farmlar.Otlabel,
                                emoji: '🌿', // Replace with a valid emoji
                                description: minik.farm.farmlar.otaciklama,
                                value: 'otekle',
                            },
                            {
                                label: 'Seçenek Sıfırla',
                                description: 'Menüdeki seçeneğinizi sıfırlarsınız.',
                                emoji: '🔄', // Replace with a valid emoji
                                value: 'sifirla',
                            },
                        ])
                );

            // Send initial reply
            await interaction.reply({ content: 'Mesai menüsü gönderiliyor...', ephemeral: true });

            // Send menu
            await interaction.channel.send({
                content: `||@everyone|| & ||@here||`,
                embeds: [militanembed],
                components: [militaninmenusu],
            });

            // Update interaction
            await interaction.editReply({ content: 'Mesai menüsü gönderildi.' });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true });
            }
        }
    },
};
