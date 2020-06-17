export interface Data {
    input?:{
        search?: string,
        articleName?: string,
        lang?: string
    },
    cleanContent?: string,
    sentences?:[{
        text?:string,
        keywords?:Array<string>,
        images?:Array<string>
    }]
}

const data:Data = {
  input: {},
  sentences: [{}]
}

export default data
