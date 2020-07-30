import readline from 'readline-sync'
import getArticlesArray from '../services/algorithmia'
import { Data } from './data'
import { bold } from '../log'

export default async function userInput (data:Data):Promise<Data> {
  console.log(bold('googleslides-maker v0.5 [beta]'))
  data.input.search = getSearch()
  data.input.articleName = await getArticle(getArticlesArray(data.input.search))
  data.input.lang = await getLang()

  function getSearch ():string {
    const search = readline.question('What do you want to research about? ')
    return search
  }

  async function getArticle (fetchArticles: Promise<Array<string>>):Promise<string> {
    const articles = await fetchArticles
    const selectedIndex = readline.keyInSelect(articles, 'Choose an Wikipedia article: ')
    const selectedArticle = articles[selectedIndex]
    return selectedArticle
  }

  async function getLang ():Promise<string> {
    let answer = readline.question('What is the language of the article [en]? ')
    if (!answer) {
      answer = 'en'
    }
    return answer
  }

  return data
}
