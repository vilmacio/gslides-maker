import { Data } from './data'
import { google } from 'googleapis'
import credentials from '../../credentials'
import imageDownloader from 'image-downloader'
import fileSystem from 'fs'
const googleSearch = google.customsearch('v1')

export default async function images (data:Data):Promise<void> {
  console.log('> [robot-images]')
  await joinKeywords(data)
  await downloadImages(data)

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

  async function downloadImages (data:Data):Promise<void> {
    data.downloadedImages = []

    for (let sentenceIndex = 0; sentenceIndex < data.sentences.length; sentenceIndex++) {
      const images = data.sentences[sentenceIndex].images

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex]

        try {
          if (data.downloadedImages.includes(imageUrl)) {
            throw new Error('Image already downloaded')
          }

          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
          data.downloadedImages.push(imageUrl)
          console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`)
          break
        } catch (error) {
          console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)
        }
      }
    }
  }

  async function downloadAndSave (url:string, fileName:string) {
    if (!fileSystem.existsSync('./cache')) {
      fileSystem.mkdirSync('./cache')
    }
    return imageDownloader.image({
      url: url,
      dest: `./cache/${fileName}`
    })
  }
}
