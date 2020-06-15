import readline from 'readline-sync'

export default function userInput ():void{
  const input = {
    search: String(),
    article: String(),
    lang: String()
  }
  input.search = getSearch()
  input.article = getArticle()
  input.lang = getLang()

  function getSearch ():string {
    return readline.question('What do you want to research about? ')
  }

  function getArticle ():string {
    const articles = ['Example1', 'Example2', 'Example3']
    const selectedIndex = readline.keyInSelect(articles, 'Choose an Wikipedia article: ')
    const selectedArticle = articles[selectedIndex]
    return selectedArticle
  }

  function getLang ():string {
    return readline.question('What is the language of the article? ')
  }

  console.log(input)
}
