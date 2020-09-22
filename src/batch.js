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

  let groups = []
  var group = []
  for (let i = 1; i < pairs.length; i++) {
    group.push(pairs[i - 1])
    if (pairs[i][0][0] != pairs[i - 1][0][0]) {
      groups.push(group)
      group = []
    }
  }
  group.push(pairs[pairs.length - 1])
  groups.push(group)

  // groups

  data.test_cases = []

  for (let group of groups) {
    const response = await prompts({
      type: 'number',
      name: 'score',
      message: 'How many points for group ' + group[0][0][0] + ' ?',
      validate: (score) => (score < 0 ? `Score should not be negative` : true),
    })
    let dictList = []
    for (let pair of group) {
      dictList.push({ in: pair[0], out: pair[1] })
    }
    data.test_cases.push({ points: response.score, batched: dictList })
  }

  yaml(writeTo, data, function (err) {
    if (err) throw err
  })
}

module.exports = generateInit
