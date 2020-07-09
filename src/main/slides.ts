import { Data } from './data'
import auth from '../services/auth'
import opn from 'opn'
import sleep from '../utils/sleep'
import upperFirstChar from '../utils/upperFirstChar'

export default async function slides (data:Data):Promise<void> {
  const google = await auth()
  const slides = google.slides({ version: 'v1' })

  const idResponse = await createPresentation()
  const presentationId = idResponse
  await createPage()
  //
  await insertText()
  //
  await updateShape()
  await textStyles()
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
              slideLayoutReference: { predefinedLayout: 'CAPTION_ONLY' }
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

  async function updateShape () {
    const presentationData = await presentationDataUpdate()
    for (const sentence of data.sentences) {
      slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              updatePageElementTransform: {
                objectId: presentationData.data.slides[sentence.id].pageElements[0].objectId,
                applyMode: 'ABSOLUTE',
                transform: {
                  scaleX: 1.4031,
                  scaleY: 1.7145,
                  translateX: 362600,
                  unit: 'EMU'
                }
              }
            }
          ]
        }
      })
    }
  }

  async function insertText () {
    const presentationData = await presentationDataUpdate()
    const pages = presentationData.data.slides
    await firstAndLastPage()
    await contentPage()

    async function firstAndLastPage () {
      const subtitle = upperFirstChar(data.sentences[0].keywords[1])
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              insertText: {
                objectId: pages[0].pageElements[0].objectId,
                text: data.input.articleName
              }
            },
            {
              insertText: {
                objectId: pages[0].pageElements[1].objectId,
                text: subtitle
              }
            },
            {
              insertText: {
                objectId: pages[pages.length - 1].pageElements[0].objectId,
                text: 'Thank You'
              }
            },
            {
              insertText: {
                objectId: pages[pages.length - 1].pageElements[1].objectId,
                text: 'Created by Google Slides Maker'
              }
            }
          ]
        }
      })
    }

    async function contentPage () {
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
  }

  async function textStyles ():Promise<void> {
    const presentationData = await presentationDataUpdate()
    for (const sentence of data.sentences) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              updateShapeProperties: {
                objectId: presentationData.data.slides[sentence.id].pageElements[0].objectId,
                fields: '*',
                shapeProperties: {
                  contentAlignment: 'MIDDLE'
                }
              }
            }
          ]
        }
      })
    }
    for (const sentence of data.sentences) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              updateParagraphStyle: {
                objectId: presentationData.data.slides[sentence.id].pageElements[0].objectId,
                fields: '*',
                style: {
                  lineSpacing: 115,
                  alignment: 'CENTER',
                  indentStart: {
                    unit: 'PT'
                  },
                  indentFirstLine: {
                    unit: 'PT'
                  },
                  direction: 'LEFT_TO_RIGHT'
                }
              }
            }
          ]
        }
      })
    }

    for (const sentence of data.sentences) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: {
          requests: [
            {
              updateTextStyle: {
                objectId: presentationData.data.slides[sentence.id].pageElements[0].objectId,
                fields: 'fontSize',
                style: {
                  fontSize: {
                    magnitude: 21,
                    unit: 'PT'
                  }
                }
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
