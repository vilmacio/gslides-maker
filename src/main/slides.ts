import { Data } from './data'
import auth from '../utils/authentication'
import opn from 'opn'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const presentationId = (await createSlide()).presentationId
  openBrowser(presentationId)

  async function createSlide () {
    const response = slides.presentations.create({
      requestBody: {
        title: data.input.articleName
      }
    })
    const presentationData = (await response).data
    return presentationData
  }

  function openBrowser (presentationId:string) {
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  }
}
