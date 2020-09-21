const yaml = require('write-yaml')
const prompts = require('prompts')
const { splitFileName } = require('./utils')

const generateInit = async (files, path) => {
  const writeTo = path + '/init.yml'
  const response = await prompts({
    type: 'text',
    name: 'checker',
    message: 'Which checker to use ?',
  })

  let data = { archive: 'Testcase.zip', checker: response.checker }

  files.sort()

  let pairs = []
  for (let i = 1; i < files.length; i++) {
    if (splitFileName(files[i])[0] == splitFileName(files[i - 1])[0]) {
      if (
        splitFileName(files[i])[1] == 'sol' ||
        splitFileName(files[i])[1] == 'out'
      ) {
        pairs.push([files[i - 1], files[i]])
      }
    }
  }

  data.test_cases = []

  for (let pair of pairs) {
    const response = await prompts({
      type: 'number',
      name: 'score',
      message: 'How many points for case ' + splitFileName(pair[0])[0] + ' ?',
      validate: (score) => (score < 0 ? `Score should not be negative` : true),
    })
    pair.push(response.score == '' ? 0 : response.score)
    data.test_cases.push({ in: pair[0], out: pair[1], points: pair[2] })
  }

  yaml(writeTo, data, function (err) {
    if (err) throw err
  })
}

module.exports = generateInit
