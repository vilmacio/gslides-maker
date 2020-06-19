import { Data } from './data'
import { google } from 'googleapis'
import credentials from '../../credentials'
const googleSearch = google.customsearch('v1')

export default async function images (data:Data):Promise<void> {
  console.log('> [robot-images]')
  await joinKeywords(data)
  async function joinKeywords (data:Data):Promise<void> {
    for (const sentence of data.sentences) {
      if (sentence.keywords.length === 0) {
        const query = data.input.articleName
        console.log(query)
        sentence.images = await fetchImageLinks(query)
        return
      }
      const query = '' + data.input.articleName + ' ' + sentence.keywords[0]
      console.log(query)
      sentence.images = await fetchImageLinks(query)
    }
  }

  async function fetchImageLinks (query:string):Promise<Array<string>> {
    const response = await googleSearch.cse.list({
      auth: credentials.google.api_key,
      cx: credentials.google.search_engine_id,
      q: query,
      searchType: 'image',
      num: 2
    })
    console.dir(response, { delph: null })
    const imgLinks = response.data.items.map((item) => {
      return item.link
    })

    return imgLinks
  }
}
