const { aliasJest } = require('react-app-rewire-alias')
const { aliasDangerous } = require('react-app-rewire-alias/lib/aliasDangerous')

const aliasMap = {
  'kea-forms': '../src',
}

module.exports = aliasDangerous(aliasMap)
module.exports.jest = aliasJest(aliasMap)
