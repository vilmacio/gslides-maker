import { Data } from './data'
import auth from '../utils/authentication'
import opn from 'opn'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const presentationId = (await createSlide()).presentationId
  await createContentPages(presentationId)
  await createEnd(presentationId)
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

  async function createContentPages (presentationId:string) {
    for (const sentence of data.sentences) {
      slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              createSlide: {
                objectId: `content${sentence.id}`,
                slideLayoutReference: {
                  predefinedLayout: 'TITLE_AND_TWO_COLUMNS'
                }
              }
            }
          ]
        }
      })
    }
    return slides.presentations.get({ presentationId: presentationId })
  }

  async function createEnd (presentationId:string):Promise<void> {
    slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [
          {
            createSlide: {
              objectId: 'finalPage',
              slideLayoutReference: {
                predefinedLayout: 'BIG_NUMBER'
              }
            }
          }
        ]
      }
    })
  }

  function openBrowser (presentationId:string) {
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  }
}
