'use strict';
module.exports = function(sequelize, DataTypes) {
  var Word = sequelize.define('Word', {
    word: DataTypes.STRING
  }, {
    classMethods: {
      learn: function(words) {
        
      }
    }
  });
  return Word;
};