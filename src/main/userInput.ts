import readline from 'readline-sync'
import getArticlesArray from '../services/algorithmia'
import { Data } from './data'
import { bold } from '../log'
import chalk from 'chalk'

export default async function userInput (data:Data):Promise<Data> {
  console.log(bold('gslides-maker v0.5 [beta]'))
  data.input.search = getSearch()
  data.input.articleName = await getArticle(getArticlesArray(data.input.search))
  data.input.lang = await getLang()

  function getSearch ():string {
    const search = readline.question(`${chalk.bold.green('?')} What do you want to research about? `)
    return search
  }

  async function getArticle (fetchArticles: Promise<Array<string>>):Promise<string> {
    const articles = await fetchArticles
    const selectedIndex = readline.keyInSelect(articles, `${chalk.bold.green('>')} Choose an Wikipedia article: `)
    if (selectedIndex === -1) {
      process.exit(0)
    }
    const selectedArticle = articles[selectedIndex]
    return selectedArticle
  }

  async function getLang ():Promise<string> {
    let answer = readline.question(`${chalk.bold.green('?')} What is the language of the article [en]? `)
    if (!answer) {
      answer = 'en'
    }
    return answer
  }

  return data
}
