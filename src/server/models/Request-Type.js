'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  type: {
    type: String,
    unique: true
  },
  hideWhenPublished: Boolean,
  dataUpdateOnly: Boolean,
  created: Date
})

module.exports = mongoose.model('Request-Type', schema);
