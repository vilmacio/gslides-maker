import chalk from 'chalk'
import { event } from './event'
import { start, stop, debug } from './process'

export default {
  event,
  process: {
    start,
    stop,
    debug
  },
  bold
}

export function bold (text:string):string {
  return chalk.bold(text)
}
