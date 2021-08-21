import wiki from 'wikijs'
import { WikipediaObject, WikipediaParams } from './protocols'

export const wikipedia = async ({ articleName, lang = 'en' }: WikipediaParams | null):Promise<WikipediaObject> => {
  const provider = wiki({ apiUrl: `https://${lang}.wikipedia.org/w/api.php` })
  const page = await provider.page(articleName)
  const SEARCH_LIMIT = 7

  return {
    async summary () {
      const content = await page.summary()
      return content
    },
    async search (query: string) {
      const { results } = await provider.search(query, SEARCH_LIMIT)
      return results
    }
  }
}
