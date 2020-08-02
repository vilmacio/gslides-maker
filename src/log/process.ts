import chalk from 'chalk'
import sleep from '../utils/sleep'

const state = {
  brk: false,
  debug: false
}

export function debug (active:boolean):void {
  state.debug = active
}

export function stop ():void {
  state.brk = true
}

export async function start (init:string | number, max:string | number, message:string):Promise<void> {
  state.brk = false
  if (state.debug) return
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
