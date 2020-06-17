import algorithmia from 'algorithmia'
import credentials from '../../../credentials'

async function getArticlesArray (search:string):Promise<Array<string>> {
  const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
  const wikipediaResponse = await wikipedia.pipe({ search: search })
  const wikipediaAllArticles = wikipediaResponse.get()
  const cutArticles = wikipediaAllArticles.slice(0, 7)
  return cutArticles
}

export default getArticlesArray
