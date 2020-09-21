const splitFileName = (fileFullName) => {
  let filename = fileFullName.split('.')
  let ext = filename.pop()
  return [filename.join('.'), ext]
}

module.exports = {
  splitFileName,
}
