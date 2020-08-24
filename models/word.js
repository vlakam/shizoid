module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Word', {
        word: DataTypes.STRING
    }, {
        indexes: [
            {
                unique: true,
                fields: ['word'],
		operator: 'varchar_pattern_ops'
            }
        ],
        classMethods: {
            learn: async function (array) {
                let uniqArray = array.filter((word, idx) => array.indexOf(word) === idx);
                let wordsFromBase = await this.findAll({
                    where: {
                        word: uniqArray
                    }
                })

                let oldWords = wordsFromBase.reduce((acc, word) => {
                    acc[word.get('word')] = word;

                    return acc;
                }, {});
                let newWords = uniqArray.filter(word => !oldWords[word]);

                if (newWords.length) {
                    let result = await this.bulkCreate(newWords.map(word => ({ word })));
                    return {
                        ...oldWords,
                        ...result.reduce((acc, word) => {
                            acc[word.get('word')] = word;

                            return acc;
                        }, {})
                    }
                } else {
                    return oldWords;
                }
            }
        }
    });
};