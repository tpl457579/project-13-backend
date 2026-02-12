import mongoose from 'mongoose';

const catFactSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, default: 'General' }
});

export default mongoose.model('CatFact', catFactSchema); 