const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token, clientId, guildId, yetkiliRolId, logKanalId } = require('./config.json');
const db = require('./db');

// Slash komutlarını yüklemek için kod
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Slash komutları yükleniyor...');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error(error);
    }
})();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandFilesForBot = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFilesForBot) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

client.on('interactionCreate', async interaction => {
    try {

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Komut çalıştırılırken bir hata oluştu!',
                    ephemeral: true
                });
            }
        }


        if (interaction.isButton()) {
            if (interaction.customId === 'ot-ekle-talep') {
                const modal = new ModalBuilder()
                    .setCustomId('ot-talep-modal')
                    .setTitle('Ot Talep Formu');

                const miktarInput = new TextInputBuilder()
                    .setCustomId('miktar')
                    .setLabel('Talep edilecek ot miktarı')
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)
                    .setMaxLength(5)
                    .setPlaceholder('Miktar giriniz (örn: 100)')
                    .setRequired(true);

                const actionRow = new ActionRowBuilder().addComponents(miktarInput);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
            }

            if (interaction.customId === 'ot-onayla') {
                if (!interaction.member.roles.cache.has(yetkiliRolId)) {
                    return interaction.reply({
                        content: 'Bu ɪ̇ꜱ̧ʟᴇᴍi yapmaya yetkiniz yok!',
                        ephemeral: true
                    });
                }

                const embed = interaction.message.embeds[0];
                const userId = embed.fields.find(f => f.name === 'ᴋᴜʟʟᴀɴıᴄı ID').value;
                const miktar = parseInt(embed.fields.find(f => f.name === 'Talep Miktarı').value);
                const user = await client.users.fetch(userId);

                const otData = db.getOt(userId);
                const yeniMiktar = db.addOt(userId, miktar);

                const logEmbed = new EmbedBuilder()
                    .setTitle(' ᴏᴛ ᴛᴀʟᴇʙɪ ᴏɴᴀʏʟᴀɴᴅı')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'ɪ̇ꜱ̧ʟᴇᴍ', value: 'ᴛᴀʟᴇᴘ ᴏɴᴀʏʟᴀᴍᴀ', inline: true },
                        { name: 'ᴏɴᴀʏʟᴀʏᴀɴ ʏᴇᴛᴋɪʟɪ', value: `${interaction.user.tag}`, inline: true },
                        { name: 'ʏᴇᴛᴋɪʟɪ ɪᴅ', value: `${interaction.user.id}`, inline: true },
                        { name: 'ᴋᴜʟʟᴀɴıcı', value: `<@${user.id}>`, inline: true },  // Etiketleme eklendi
                        { name: 'ᴋᴜʟʟᴀɴıᴄı ID', value: userId, inline: true },
                        { name: 'ᴇᴋʟᴇɴᴇɴ ᴍɪᴋᴛᴀʀ', value: `${miktar}`, inline: true },
                        { name: 'ᴇꜱᴋɪ ᴍɪᴋᴛᴀʀ', value: `${otData.miktar}`, inline: true },
                        { name: 'ʏᴇɴɪ ᴍɪᴋᴛᴀʀ', value: `${yeniMiktar}`, inline: true },
                        { name: 'ᴛᴀʀɪʜ', value: `${new Date().toLocaleString()}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Ot Sistemi - Talep Onaylama' });

                const logChannel = interaction.guild.channels.cache.get(logKanalId);
                await logChannel.send({ embeds: [logEmbed] });

                await interaction.update({
                    content: `🌿 ᴛᴀʟᴇᴘ ᴏɴᴀʏʟᴀɴᴅı! ${user.tag} ᴋᴜʟʟᴀɴıᴄısına ${miktar}ᴏᴛ ᴇᴋʟᴇɴᴅɪ.`,
                    embeds: [],
                    components: []
                });

                try {
                    await user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🌿 ᴏᴛ ᴛᴀʟᴇʙɪɴɪᴢ ᴏɴᴀʏʟᴀɴᴅı')
                                .setColor('#00ff00')
                                .setDescription(`ᴛᴀʟᴇʙɪɴɪᴢ ʏᴇᴛᴋɪʟɪ ᴛᴀʀᴀꜰıɴᴅᴀɴ ᴏɴᴀʏʟᴀɴᴅı!`)
                                .addFields(
                                    { name: 'ᴇᴋʟᴇɴᴇɴ ᴍɪᴋᴛᴀʀ', value: `${miktar}`, inline: true },
                                    { name: 'ʏᴇɴɪ ᴛᴏᴘʟᴀᴍ', value: `${yeniMiktar}`, inline: true }
                                )
                                .setTimestamp()
                        ]
                    });
                } catch (error) {
                    console.error('DM gönderilemedi:', error);
                }
            }

            if (interaction.customId === 'ot-reddet') {
                if (!interaction.member.roles.cache.has(yetkiliRolId)) {
                    return interaction.reply({
                        content: 'Bu ɪ̇ꜱ̧ʟᴇᴍi yapmaya yetkiniz yok!',
                        ephemeral: true
                    });
                }

                const embed = interaction.message.embeds[0];
                const userId = embed.fields.find(f => f.name === 'ᴋᴜʟʟᴀɴıᴄı ID').value;
                const user = await client.users.fetch(userId);

                const logEmbed = new EmbedBuilder()
                    .setTitle('🌿 ᴏᴛ ᴛᴀʟᴇʙɪ ʀᴇᴅᴅᴇᴅɪʟᴅɪ')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'ɪ̇ꜱ̧ʟᴇᴍ', value: 'ᴛᴀʟᴇᴘ ʀᴇᴅᴅᴇᴛᴍᴇ', inline: true },
                        { name: 'ʀᴇᴅᴅᴇᴅᴇɴ ʏᴇᴛᴋɪʟɪ', value: `${interaction.user.tag}`, inline: true },
                        { name: 'ʏᴇᴛᴋɪʟɪ ɪᴅ', value: `${interaction.user.id}`, inline: true },
                        { name: 'ᴋᴜʟʟᴀɴıcı', value: `<@${user.id}>`, inline: true },
                        { name: 'ᴋᴜʟʟᴀɴıᴄı ID', value: userId, inline: true },
                        { name: 'ᴛᴀʀɪʜ', value: `${new Date().toLocaleString()}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ᴏᴛ ꜱɪꜱᴛᴇᴍɪ - ᴛᴀʟᴇᴘ ʀᴇᴅᴅᴇᴛᴍᴇ' });

                const logChannel = interaction.guild.channels.cache.get(logKanalId);
                await logChannel.send({ embeds: [logEmbed] });

                await interaction.update({
                    content: `<a:red:1233294320740601887> ᴛᴀʟᴇᴘ ʀᴇᴅᴅᴇᴅɪʟᴅɪ!`,
                    embeds: [],
                    components: []
                });

                try {
                    await user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🌿ᴏᴛ ᴛᴀʟᴇʙɪɴɪᴢ ʀᴇᴅᴅᴇᴅɪʟᴅɪ')
                                .setColor('#00ff00')
                                .setDescription(`ᴛᴀʟᴇʙɪɴɪᴢ ʏᴇᴛᴋɪʟɪ ᴛᴀʀᴀꜰıɴᴅᴀɴ ʀᴇᴅᴅᴇᴅɪʟᴅɪ.`)
                                .setTimestamp()
                        ]
                    });
                } catch (error) {
                    console.error('DM gönderilemedi:', error);
                }
            }
        }


        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'ot-talep-modal') {
                const miktar = parseInt(interaction.fields.getTextInputValue('miktar'));

                if (isNaN(miktar) || miktar <= 0) {
                    return interaction.reply({
                        content: 'Lütfen geçerli bir miktar girin!',
                        ephemeral: true
                    });
                }

                const logChannel = interaction.guild.channels.cache.get(logKanalId);

                const talepEmbed = new EmbedBuilder()
                    .setTitle('🌿 ʏᴇɴɪ ᴏᴛ ᴛᴀʟᴇʙɪ')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'Talep Eden', value: `${interaction.user.tag}`, inline: true },
                        { name: 'ᴋᴜʟʟᴀɴıᴄı ID', value: `${interaction.user.id}`, inline: true },
                        { name: 'Talep Miktarı', value: `${miktar}`, inline: true },
                        { name: 'Mevcut Miktar', value: `${db.getOt(interaction.user.id).miktar}`, inline: true },
                        { name: 'Talep ᴛᴀʀɪʜi', value: `${new Date().toLocaleString()}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ᴏᴛ ꜱɪꜱᴛᴇᴍɪ - ʏᴇɴɪ ᴛᴀʟᴇᴘ' });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('ot-onayla')
                            .setLabel('Onayla')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ot-reddet')
                            .setLabel('Reddet')
                            .setStyle(ButtonStyle.Danger)
                    );

                await logChannel.send({
                    embeds: [talepEmbed],
                    components: [row]
                });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🌿ᴛᴀʟᴇᴘ ɢᴏ̈ɴᴅᴇʀɪʟᴅɪ.')
                            .setColor('#00ff00')
                            .setDescription('ᴛᴀʟᴇʙɪɴɪᴢ ʏᴇᴛᴋɪʟɪʟᴇʀᴇ ɪʟᴇᴛɪʟᴅɪ! ʟᴜ̈ᴛꜰᴇɴ ʙᴇᴋʟᴇʏɪɴ.')
                            .addFields(
                                { name: 'ᴛᴀʟᴇᴘ ᴇᴅɪʟᴇɴ ᴍɪᴋᴛᴀʀ', value: `${miktar}`, inline: true }
                            )
                            .setTimestamp()
                    ],
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        try {
            await interaction.reply({
                content: 'Bir hata oluştu! Lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            });
        } catch (e) {
            console.error('Hata mesajı gönderilemedi:', e);
        }
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(token);