import { Data } from './state'
import credentials from '../../credentials'
import algorithmia from 'algorithmia'

export default async function text (data:Data):Promise<Data> {
  data.content.fullContent = await fetchContent(data.input.articleName, data.input.lang)

  async function fetchContent (articleName:string, lang:string):Promise<string> {
    try {
      const input = {
        articleName,
        lang
      }
      const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
      const wikipediaResponse = await wikipedia.pipe(input)
      const wikipediaContent = wikipediaResponse.get()
      return wikipediaContent.content
    } catch (e) {
      return String(Error(e))
    }
  }

  return data
}
