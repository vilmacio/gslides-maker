import readline from 'readline-sync'
import getArticlesArray from '../services/algorithmia'
import { Data } from './data'

export default async function userInput (data:Data):Promise<Data> {
  data.input.search = getSearch()
  data.input.articleName = await getArticle(getArticlesArray(data.input.search))
  data.input.lang = await getLang()

  function getSearch ():string {
    return readline.question('What do you want to research about? ')
  }

  async function getArticle (fetchArticles: Promise<Array<string>>):Promise<string> {
    const articles = await fetchArticles
    const selectedIndex = readline.keyInSelect(articles, 'Choose an Wikipedia article: ')
    const selectedArticle = articles[selectedIndex]
    return selectedArticle
  }

  async function getLang ():Promise<string> {
    return readline.question('What is the language of the article? ')
  }

  return data
}
