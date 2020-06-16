import readline from 'readline-sync'
import algorithmia from '../utils/algo/services'

export default async function userInput ():Promise<Record<string, unknown>> {
  const input = {
    search: String(),
    article: String(),
    lang: String()
  }
  input.search = getSearch()
  input.article = await getArticle(algorithmia.getArticlesArray(input.search))
  input.lang = await getLang()

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

  console.log(input)
  return input
}
