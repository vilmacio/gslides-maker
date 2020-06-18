import data from './main/data'
import userInput from './main/userInput'
import text from './main/text'

async function start ():Promise<void> {
  await userInput(data)
  await text(data)
}
start()
