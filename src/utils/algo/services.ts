import algorithmia from 'algorithmia'
import credentials from '../../../credentials'

const services = {
  fetchArticles: async (search:string):Promise<Array<string>> => {
    const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
    const wikipediaResponse = await wikipedia.pipe({ search: search })
    const wkipediaAllArticles = wikipediaResponse.get()
    const cutArticles = wkipediaAllArticles.slice(0, 7)
    return cutArticles
  }
}

export default services
