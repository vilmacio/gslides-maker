import wiki from 'wikijs'
import { WikipediaObject, WikipediaParams } from './protocols'

export const wikipedia = async ({ articleName, lang = 'en' }: WikipediaParams):Promise<WikipediaObject> => {
  const provider = wiki({ apiUrl: `https://${lang}.wikipedia.org/w/api.php` })
  const page = await provider.page(articleName)

  return {
    async summary () {
      const content = await page.summary()
      return content
    }
  }
}
