import { Data } from '../data'
import 'dotenv/config'
import sbd from 'sbd'
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1'
import { IamAuthenticator } from 'ibm-watson/auth'
import { wikipedia } from '../helpers/wikipedia'

export default class Text {
  constructor (public data:Data) {
    this.data = data
  }

  /**
   * Fetch Wikipedia content.
   *
   * @param {String} articleName Selected article name
   * @param {String} lang Selected article language
   * @returns {Promise.<String>} Wikipedia content
   */
  public async fetchContent (articleName:string, lang:string):Promise<string> {
    const input = {
      articleName,
      lang
    }
    const page = await wikipedia(input)
    const content = page.summary()
    return content
  }

  public async sanitizeContent (fullContent: string):Promise<void> {
    this.data.cleanContent = this.cleanContent(fullContent)
    this.data.indexContent = this.indexContent(this.data.cleanContent)
    Text.breakContent(this.data, this.data.indexContent)
    this.limitSentences(false, this.data, 1)
    await this.setKeywords(this.data)
  }

  /**
   * Clears the content. Removes blank lines, parentheses and dates.
   *
   * @param {String} content Fetched content
   * @returns {String} Clean content
   */
  protected cleanContent (content:string):string {
    const withoutBlankLinesAndMarkdown = Text.removeBlankLinesAndMarkdown(content)
    const withoutDatesInParentheses = Text.removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    return withoutDatesInParentheses
  }

  public static removeBlankLinesAndMarkdown (text:string):string {
    const allLines = text.split('\n')

    const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
      if (line.trim().length === 0) {
        return false
      }

      return true
    })

    return withoutBlankLinesAndMarkdown.join(' ')
  }

  public static removeDatesInParentheses (text:string):string {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ {2}/g, ' ')
  }

  /**
   * Cuts only the indexed Wikipedia content
   *
   * @param {String} text Clean content
   * @returns {String} Indexed Wikipedia content
   */
  protected indexContent (text:string):string {
    const endPosition = text.search('=')
    const indexContent = text.substring(0, endPosition)
    return indexContent
  }

  /**
   * Breaks content into sentences.
   * @static
   * @param {Data} data main data
   * @param {String} text Indexed content
   * @returns {Array<String>} void
   */
  public static breakContent (data:Data, text:string):Array<string> {
    const sentences = sbd.sentences(text)
    let id = 1
    data.sentences.shift()
    sentences.forEach((item) => {
      data.sentences.push({
        id: id,
        text: item
      })
      id++
    })

    return sentences
  }

  /**
   * Limits the number of sentences.
   *
   * Note this is used for development only.
   *
   * @param active Defines whether the function is active or not
   * @param data Main data
   * @param max Max number of senteces
   */
  protected limitSentences (active:boolean, data:Data, max:number):void {
    if (active) {
      data.sentences = data.sentences.slice(0, max)
    }
  }

  /**
   * Extract keywords from sentences with Natural Language Undertanding V1
   *
   * @param {String} sentence Phrase where the keywords will be taken
   * @returns {Promise.<Array.<String>>} Array of keywords
   */
  protected fetchWatson (sentence:string):Promise<Array<string>> {
    const nlu = new NaturalLanguageUnderstandingV1({
      authenticator: new IamAuthenticator({ apikey: process.env.WATSON_API_KEY }),
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

  protected async setKeywords (data:Data):Promise<void> {
    for (const sentence of data.sentences) {
      sentence.keywords = await this.fetchWatson(sentence.text)
      break
    }
  }
}
