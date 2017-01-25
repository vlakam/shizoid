'use strict';
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
  var Word = sequelize.define('Word', {
    word: DataTypes.STRING
  }, {
    classMethods: {
      learn: function(words) {
          _.each(words, function(wordString) {
              Chat.findOrCreate({
                  where: {
                      word: wordString
                  }
              });
          });
      }
    }
  });
  return Word;
};