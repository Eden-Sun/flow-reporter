var chalk = require('chalk')
var path = require('path')

var whitespace = start => ' '.repeat(start)
var carets = (start, end) => '^'.repeat(end > start ? end - start + 1 : 1)

module.exports = function (output) {
  output.forEach(error => {
    var firstMessage = error.message[0]
    var lineNumber = firstMessage.line
    var parsedPath = path.parse(firstMessage.path)
    var lineHeading = [
      path.basename(parsedPath.dir),
      '/',
      parsedPath.base,
      ':',
      lineNumber
    ].join('')
    console.log(`${chalk.red.underline(lineHeading)}`)

    var messages = error.message
    // Merge 'Comment' into 'Blame' to reproduce default flow output
    messages.forEach((item, index, list) => {
      if (item.type === 'Comment') {
        list[index - 1].descr += `. ${item.descr}`
      }
    })

    messages = messages.filter(item => item.type !== 'Comment')
    messages.forEach(message => {

      const context = message.context.split('').map((item, index) => {
        var relativeIndex = index + 1

        var indexInWarningBounds = (
          (relativeIndex > message.start || relativeIndex === message.start)
            && (relativeIndex < message.end || relativeIndex === message.end))

        if (indexInWarningBounds) {
          return chalk.red(item)
        }
        return item
      }).join('')

      const descr = `${whitespace(message.start)}${carets(message.start, message.end)} ${message.descr}`
      console.log(` ${chalk.red.bold(lineNumber + ':')} ${context}`)
      console.log(chalk.red.bold(`    ${descr}`))
    })
  })
}
