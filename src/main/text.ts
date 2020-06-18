import { Data } from './data'
import credentials from '../../credentials'
import algorithmia from 'algorithmia'
import sbd from 'sbd'
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1'
import { IamAuthenticator } from 'ibm-watson/auth'

export default async function text (data:Data):Promise<void> {
  console.log('> [text-robot]')
  const fullContent = await fetchContent(data.input.articleName, data.input.lang)
  data.cleanContent = cleanContent(fullContent)
  breakContent(data.cleanContent)
  limitSentences(data, 2)
  await setKeywords(data)

  async function fetchContent (articleName:string, lang:string):Promise<string> {
    try {
      const input = {
        articleName,
        lang
      }
      const wikipedia = algorithmia(credentials.algorithmia).algo('web/WikipediaParser/0.1.2')
      const wikipediaResponse = await wikipedia.pipe(input)
      const wikipediaContent = wikipediaResponse.get()
      return wikipediaContent.content
    } catch (e) {
      return String(Error(e))
    }
  }

  function cleanContent (content:string):string {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    function removeBlankLinesAndMarkdown (text:string):string {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
    function removeDatesInParentheses (text:string):string {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ {2}/g, ' ')
    }
    return withoutDatesInParentheses
  }

  function breakContent (text:string):void {
    const sentences = sbd.sentences(text)
    data.sentences.shift()
    sentences.forEach((item) => {
      data.sentences.push({
        text: item
      })
    })
  }

  function limitSentences (data:Data, max:number):void {
    data.sentences = data.sentences.slice(0, max)
  }

  async function fetchWatson (sentence:string):Promise<Array<string>> {
    const nlu = new NaturalLanguageUnderstandingV1({
      authenticator: new IamAuthenticator({ apikey: credentials.watson.apiKey }),
      version: '2018-04-05',
      url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
    })
    return new Promise((resolve, reject) => {
      nlu.analyze({
        html: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }

        const keywords = response.result.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }
  async function setKeywords (data:Data):Promise<void> {
    for (const sentence of data.sentences) {
      console.log(`> [text-robot] Sentence: "${sentence.text}"`)
      sentence.keywords = await fetchWatson(sentence.text)
    }
  }
}
