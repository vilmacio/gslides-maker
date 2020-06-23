import { Data } from './data'
import auth from '../utils/authentication'
import opn from 'opn'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const presentationId = await createPresentation()
  await createStructure(presentationId)
  openBrowser(presentationId)

  async function createPresentation () {
    const response = slides.presentations.create({
      requestBody: {
        title: data.input.articleName
      }
    })
    const presentationId = (await response).data.presentationId
    return presentationId
  }

  async function createStructure (presentationId:string) {
    const structureReq = []
    await contentPage()
    await finalPage()
    await update()

    async function contentPage () {
      for (const sentence of data.sentences) {
        let layout = 'TITLE_AND_TWO_COLUMNS'
        if (sentence.images === []) {
          layout = 'SECTION_HEADER'
        }
        structureReq.push(
          {
            createSlide: {
              objectId: `content${sentence.id}`,
              slideLayoutReference: { predefinedLayout: layout }
            }
          })
      }
    }

    async function finalPage () {
      structureReq.push(
        {
          createSlide: {
            objectId: 'finalPage',
            slideLayoutReference: { predefinedLayout: 'BIG_NUMBER' }
          }
        })
    }

    async function update () {
      slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: structureReq
        }
      })
    }

    return slides.presentations.get({ presentationId: presentationId })
  }

  function openBrowser (presentationId:string) {
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  }
}
