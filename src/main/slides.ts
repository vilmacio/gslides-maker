import { Data } from './data'
import auth from '../services/auth'
import opn from 'opn'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const idResponse = await createPresentation()
  const presentationId = idResponse
  await createStructure(presentationId)
  console.log('> Aguardando o timeout...')
  setTimeout(async () => {
    const presentationData = await slides.presentations.get({ presentationId: presentationId })
    await pushContent(presentationData)
    openBrowser(presentationId)
  }, 6000)

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
  }

  async function pushContent (presentationData) {
    console.log('presentationId do presentationId: ' + presentationId)
    console.log('presentationId da presentationData: ' + presentationData.data.presentationId)
    console.log(presentationData.data.slides)
    for (const sentence of data.sentences) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              insertText: {
                objectId: presentationData.data.slides[sentence.id].pageElements[1].objectId,
                text: sentence.text
              }
            }
          ]
        }
      })
    }
  }

  function openBrowser (presentationId:string) {
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  }
}
