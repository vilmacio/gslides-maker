import readline from 'readline-sync'
import algorithmia from '../utils/algo/services'
import { Data } from './state'

export default async function userInput (data:Data):Promise<Record<string, unknown>> {
  data.input.search = getSearch()
  data.input.article = await getArticle(algorithmia.getArticlesArray(String(data.input.search)))
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

  console.log(data.input)
  return data.input
}
