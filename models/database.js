const mongoose = require('mongoose');

// Özel Oda Sistemi için Şema
const roomSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    members: [String],
    createdAt: { type: Date, default: Date.now }
});

// Kullanıcı Verileri için Şema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastDaily: { type: Date },
    inventory: [String],
    createdAt: { type: Date, default: Date.now }
});

// Guild (Sunucu) Ayarları için Şema
const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    prefix: { type: String, default: '!' },
    welcomeChannel: { type: String },
    logChannel: { type: String },
    autoRole: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Modelleri oluştur ve export et
const Room = mongoose.model('Room', roomSchema);
const User = mongoose.model('User', userSchema);
const Guild = mongoose.model('Guild', guildSchema);

module.exports = {
    Room,
    User,
    Guild
};