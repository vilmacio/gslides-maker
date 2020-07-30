import chalk from 'chalk'
import { event } from './event'
import { start, stop } from './process'

export default {
  event,
  process: {
    start,
    stop
  },
  bold
}

export function bold (text:string):string {
  return chalk.bold(text)
}
