import data from './main/state'
import userInput from './main/userInput'
import text from './main/text'

async function start ():Promise<boolean> {
  await userInput(data)
  await text(data)
  return true
}
start()
