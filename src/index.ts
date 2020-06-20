// import data from './main/data'
// import userInput from './main/userInput'
// import text from './main/text'
// import images from './main/images'
import authentication from './utils/authentication'

async function start ():Promise<void> {
  // await userInput(data)
  // await text(data)
  // await images(data)
  await authentication()
}
start()
