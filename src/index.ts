import data from './main/data'
import userInput from './main/userInput'
import text from './main/text'
import slides from './main/slides'

async function start ():Promise<void> {
  await userInput(data)
  await text(data)
  await slides(data)
}
start()
