const mongoose = require('mongoose');

// MongoDB bağlantısını yap
mongoose.connect('mongodb://localhost:27017/keepersbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Otlar için bir şema oluştur
const otSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    miktar: { type: Number, default: 0 },
});

// Modeli oluştur
const Ot = mongoose.model('Ot', otSchema);

const dbOperations = {
    getOt: async (userId) => {
        let ot = await Ot.findOne({ userId });
        if (!ot) {
            ot = new Ot({ userId, miktar: 0 });
            await ot.save();
        }
        return ot;
    },

    setOt: async (userId, miktar) => {
        await Ot.findOneAndUpdate({ userId }, { miktar }, { upsert: true });
    },

    addOt: async (userId, miktar) => {
        const ot = await dbOperations.getOt(userId);
        ot.miktar += miktar;
        await ot.save();
        return ot.miktar;
    },

    getAllOt: async () => {
        return await Ot.find({});
    },
};

module.exports = dbOperations;