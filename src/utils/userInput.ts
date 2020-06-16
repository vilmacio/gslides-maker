import readline from 'readline-sync'
import algorithmia from 'algorithmia'
import credentials from '../../credentials'

export default async function userInput ():Promise<Record<string, unknown>> {
  const input = {
    search: String(),
    article: String(),
    lang: String()
  }
  input.search = getSearch()
  input.article = await getArticle(fetchArticles(input.search))
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

  async function fetchArticles (search:string):Promise<Array<string>> {
    const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
    const wikipediaResponse = await wikipedia.pipe({ search: search })
    const wkipediaArticles = wikipediaResponse.get()
    console.log(wkipediaArticles)
    return wkipediaArticles
  }
  console.log(input)
  return {}
}
