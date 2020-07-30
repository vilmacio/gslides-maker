import chalk from 'chalk'
import sleep from '../utils/sleep'

const state = {
  brk: false
}

export function stop ():void {
  state.brk = true
}

export async function start (init:string | number, max:string | number, message:string):Promise<void> {
  state.brk = false
  while (true) {
    if (state.brk) break
    process.stdout.write('\r\x1b[K')
    process.stdout.write(`[${init}/${max}] ${message}.`)
    await sleep(500)
    process.stdout.write('\r\x1b[K')
    process.stdout.write(`[${init}/${max}] ${message}..`)
    await sleep(500)
    process.stdout.write('\r\x1b[K')
    process.stdout.write(`[${init}/${max}] ${message}...`)
    await sleep(500)
  }
  process.stdout.write('\r\x1b[K')
  process.stdout.write(`[${init}/${max}] ${message} ` + chalk.green('✓ \n'))
}
