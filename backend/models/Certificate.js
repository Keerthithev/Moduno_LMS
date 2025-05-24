const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  issuedDate: { type: Date, default: Date.now },
  certificateUrl: String, // could be a PDF link stored on cloud
});

module.exports = mongoose.model('Certificate', CertificateSchema);
