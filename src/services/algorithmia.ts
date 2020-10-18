import algorithmia from 'algorithmia'
import 'dotenv/config'

async function getArticlesArray (search:string):Promise<Array<string>> {
  const wikipedia = algorithmia(process.env.ALGORITHMIA_API_KEY).algo('web/WikipediaParser/0.1.2')
  const wikipediaResponse = await wikipedia.pipe({ search: search })
  const wikipediaAllArticles = wikipediaResponse.get()
  const cutArticles = wikipediaAllArticles.slice(0, 7)
  return cutArticles
}

export default getArticlesArray
