import { Data } from './state'
import credentials from '../../credentials'
import algorithmia from 'algorithmia'

export default async function text (data:Data):Promise<Data> {
  data.content.fullContent = await fetchContent(data.input.articleName, data.input.lang)
  data.content.cleanContent = cleanContent(data.content.fullContent)
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
    data.content.cleanContent = withoutDatesInParentheses

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
  console.log(data)
  return data
}
