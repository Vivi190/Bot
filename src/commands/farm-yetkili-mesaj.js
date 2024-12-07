const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const minik = require('../../minik.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farm-yetkili-mesaj')
        .setDescription('Kullanıcıların farm girmesi için menü gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            // Embed for the menu
            const militanembed = new EmbedBuilder()
                .setTitle('Farm Menüsü')
                .setColor('ff0400')
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setImage(minik.mesai.ekip.photograph)
                .setDescription(minik.farm.yetkilimenuayarlari.mesaj);

            // Menu options
            const militaninmenusu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('farm-olustur')
                        .setPlaceholder(minik.farm.menuayarlari.menuplaceholder)
                        .addOptions([
                            {
                                label: minik.farm.yetkilimenuayarlari.birseceneklabel,
                                emoji: '😊', // Replace with a valid emoji
                                description: minik.farm.yetkilimenuayarlari.birsecenekaciklama,
                                value: 'forceekle',
                            },
                            {
                                label: minik.farm.yetkilimenuayarlari.ikiseceneklabel,
                                emoji: '✅', // Replace with a valid emoji
                                description: minik.farm.yetkilimenuayarlari.ikisecenekaciklama,
                                value: 'forcecheck',
                            },
                            {
                                label: minik.farm.yetkilimenuayarlari.ucseceneklabel,
                                emoji: '❌', // Replace with a valid emoji
                                description: minik.farm.yetkilimenuayarlari.ucsecenekaciklama,
                                value: 'forcefarmsil',
                            },
                            {
                                label: minik.farm.yetkilimenuayarlari.dortseceneklabel,
                                emoji: '📊', // Replace with a valid emoji
                                description: minik.farm.yetkilimenuayarlari.dortsecenekaciklama,
                                value: 'database-check',
                            },
                            {
                                label: 'Seçenek Sıfırla',
                                description: 'Menüdeki seçeneğinizi sıfırlarsınız.',
                                emoji: '🔄', // Replace with a valid emoji
                                value: 'sifirla',
                            },
                        ])
                );

            // Send initial reply to acknowledge the interaction
            await interaction.reply({ content: 'Mesai menüsü gönderiliyor...', ephemeral: true });

            // Send the menu to the channel
            await interaction.channel.send({
                content: `||@everyone|| & ||@here||`,
                embeds: [militanembed],
                components: [militaninmenusu],
            });

            // Update interaction to confirm menu was sent
            await interaction.editReply({ content: 'Mesai menüsü gönderildi.' });
        } catch (error) {
            console.error(error);
            // Handle errors and ensure user gets feedback
            if (!interaction.replied) {
                await interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyiniz.', ephemeral: true });
            }
        }
    },
};
