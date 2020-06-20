import { Data } from './data'
import auth from '../utils/authentication'
import opn from 'opn'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  await createSlide()

  async function createSlide ():Promise<void> {
    // const slide = google.slides({ version: 'v1' })
    const drive = google.drive({ version: 'v3' })
    const y = drive.files.create({
      requestBody: {
        mimeType: 'application/vnd.google-apps.presentation',
        name: data.input.articleName
      }
    })
    const response = await y
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${response.data.id}/`)
    /*
    const x = slide.presentations.batchUpdate({
      requestBody: {}
    })
    */
  }
}
