import express, { Express } from 'express'

export default class Server {
    public express:Express

    constructor () {
      this.express = express()
    }

    public listen (port: number):void {
      this.express.listen(port || 3333)
    }
}
