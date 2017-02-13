'use strict';
const _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Word', {
      word: DataTypes.STRING
  }, {
      classMethods: {
          learn: function (words) {
              let self = this;
              return _.map(words, function (wordString) {
                  return self.findOrCreate({
                      where: {
                          word: wordString
                      }
                  });
              });
          }
      }
  });
};