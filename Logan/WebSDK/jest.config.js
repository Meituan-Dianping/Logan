module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    moduleFileExtensions: ['ts', 'js'],
};