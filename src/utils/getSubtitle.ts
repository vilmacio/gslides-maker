
function getSubtitle (keywords:string[], articleName:string):string {
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

export default getSubtitle
