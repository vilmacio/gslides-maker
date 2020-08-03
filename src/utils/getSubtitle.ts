
function upperFirstChar (str:string):string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getKeyword (keywords:string[], articleName:string):string {
  const nameSplit = articleName.split(' ')
  nameSplit.push(articleName)
  for (const name of nameSplit) {
    for (const keyword of keywords) {
      if (!keyword.includes(name)) {
        return keyword
      }
    }
  }
}

const subtitle = (keywords:string[], articleName:string):string => upperFirstChar(getKeyword(keywords, articleName))

export default subtitle
