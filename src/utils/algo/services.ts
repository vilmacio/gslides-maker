import algorithmia from 'algorithmia'
import credentials from '../../../credentials'

async function fetchWikipedia (input:Record<string, unknown>):Promise<any> { // Or Promise<Record<string, any>>
  const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
  const wikipediaResponse = await wikipedia.pipe(input)
  return wikipediaResponse.get()
}

const services = {
  getArticlesArray: async (search:string):Promise<Array<string>> => {
    const input = { search }
    const wikipediaAllArticles = await fetchWikipedia(input)
    const cutArticles = wikipediaAllArticles.slice(0, 7)
    return cutArticles
  },
  getContent: async (articleName:string, lang:string):Promise<string> => {
    try {
      const input = {
        articleName,
        lang
      }
      const wikipediaContent = await fetchWikipedia(input)
      console.log(wikipediaContent.content)
      return wikipediaContent.content
    } catch (e) {
      return String(Error(e))
    }
  }
}

export default services
