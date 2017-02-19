'use strict';
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Word', {
        word: DataTypes.STRING
    }, {
        indexes: [
            {
                unique: true,
                fields: ['word']
            }
        ],
        classMethods: {
            learn: async function (array) {
                let Words = await this.findAll({
                    where: {
                        word: array
                    }
                });
                let newWords = _.difference(array, _.map(Words, oldWord => oldWord.get('word')));
                await this.bulkCreate(_.map(newWords, function (newWord){ return {word: newWord}; }));
                return this.findAll({
                    where: {
                        word: array
                    }
                });
            }
        }
    });
};