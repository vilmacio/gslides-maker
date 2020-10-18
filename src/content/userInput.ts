import readline from 'readline-sync'
import getArticlesArray from '../services/algorithmia'
import { Data } from '../data'
import { bold } from '../log'
import chalk from 'chalk'

export default class userInput {
  constructor (public data:Data) {
    this.data = data
  }

  /**
   * Starts the user input step
   *
   * @returns {Promise.<*>}
   */
  public async start ():Promise<void> {
    console.log(bold('gslides-maker v0.5 [beta]'))
    this.data.input.search = this.getSearch()
    this.data.input.articleName = await this.getArticle(getArticlesArray(this.data.input.search))
    this.data.input.lang = await this.getLang()
  }

  /**
   * Get search term
   *
   * @returns {String}
   */
  private getSearch ():string {
    const search = readline.question(`${chalk.bold.green('?')} What do you want to research about? `)
    return search
  }

  /**
   * Choose from article options
   *
   * @param {Promise.<Array.<String>>} fetchArticles Article options
   * @returns {Promise.<String>}
   */
  private async getArticle (fetchArticles: Promise<Array<string>>):Promise<string> {
    const articles = await fetchArticles
    const selectedIndex = readline.keyInSelect(articles, `${chalk.bold.green('>')} Choose an Wikipedia article: `)
    if (selectedIndex === -1) {
      process.exit(0)
    }
    const selectedArticle = articles[selectedIndex]
    return selectedArticle
  }

  /**
   * Select lang of the article
   *
   * @returns {Promise.<String>}
   */
  private async getLang ():Promise<string> {
    let answer = readline.question(`${chalk.bold.green('?')} What is the language of the article [en]? `)
    if (!answer) {
      answer = 'en'
    }
    return answer
  }
}
