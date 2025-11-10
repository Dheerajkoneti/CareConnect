import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: String,
  volunteerId: String,
  sessionRoom: String,
  startedAt: { type: Date, default: Date.now },
  duration: Number,
  feedback: String
});

export default mongoose.model('Session', sessionSchema);
