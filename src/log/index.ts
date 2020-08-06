import chalk from 'chalk'
import ora from 'ora'
import { event } from './event'

export default {
  event,
  bold
}

export const spinner = ora({
  interval: 250
})

export function bold (text:string):string {
  return chalk.bold(text)
}
