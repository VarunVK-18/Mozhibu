const mongoose = require('mongoose');

const EngagementScoreConfigSchema = new mongoose.Schema({
  readingCompletionWeight: { type: Number, default: 40 }, // % weight
  consistencyWeight: { type: Number, default: 25 },       // streak weight
  timeSpentWeight: { type: Number, default: 20 },         // time on page weight
  interactionWeight: { type: Number, default: 15 },       // likes/comments/follows
  minCompletionPercentToQualify: { type: Number, default: 30 }, // 30% of chapter = qualified read
  minTimeOnPageSeconds: { type: Number, default: 60 },          // 60 seconds = qualified read
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EngagementScoreConfig', EngagementScoreConfigSchema);
