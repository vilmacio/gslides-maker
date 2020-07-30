import chalk from 'chalk'

export function event (type:string, message:string):void | Error {
  switch (type) {
    case 'sucess':
      console.log(`> ${chalk.rgb(60, 255, 60)('success')} ${message}`)
      break
    case 'error':
      console.log(`> ${chalk.rgb(255, 60, 60)('error')} ${message}`)
      break
    case 'info':
      console.log(`> ${chalk.rgb(185, 138, 255)('info')} ${message}`)
      break
    default:
      return new Error('Invalid event type')
  }
}
