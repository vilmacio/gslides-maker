import { Data } from './data'
import auth from '../services/auth'
import opn from 'opn'
import sleep from '../utils/sleep'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const idResponse = await createPresentation()
  const presentationId = idResponse
  await createPage()
  await createShape()
  await pushContent()
  openBrowser()

  async function presentationDataUpdate () {
    await sleep(6000)
    const presentationData = await slides.presentations.get({ presentationId: presentationId })
    return presentationData
  }

  async function createPresentation () {
    const response = slides.presentations.create({
      requestBody: {
        title: data.input.articleName
      }
    })
    const presentationId = (await response).data.presentationId
    return presentationId
  }

  async function createPage () {
    const structureReq = []
    await contentPage()
    await finalPage()
    await update()

    async function contentPage () {
      for (const sentence of data.sentences) {
        structureReq.push(
          {
            createSlide: {
              objectId: `content${sentence.id}`,
              slideLayoutReference: { predefinedLayout: 'BLANK' }
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

  async function createShape ():Promise<void> {
    const presentationData = await presentationDataUpdate()
    for (const sentence of data.sentences) {
      slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              createShape: {
                shapeType: 'TEXT_BOX',
                elementProperties: {
                  pageObjectId: presentationData.data.slides[sentence.id].objectId,
                  size: {
                    width: {
                      magnitude: 3000000,
                      unit: 'EMU'
                    },
                    height: {
                      magnitude: 3000000,
                      unit: 'EMU'
                    }
                  },
                  transform: {
                    scaleX: 1.4031,
                    scaleY: 1.7145,
                    translateX: 362600,
                    unit: 'EMU'
                  }
                }
              }
            }
          ]
        }
      })
    }
  }

  async function pushContent () {
    const presentationData = await presentationDataUpdate()
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
                objectId: presentationData.data.slides[sentence.id].pageElements[0].objectId,
                text: sentence.text
              }
            }
          ]
        }
      })
    }
  }

  function openBrowser () {
    console.log('> [google-robot] Opening presentation...')
    opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  }
}
