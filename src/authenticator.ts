import express, { Request, Response, Express } from 'express'
import { Server } from 'http'
import 'dotenv/config'
import opn from 'opn'
import { google, GoogleApis } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import lowdb, { LowdbSync } from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import Memory from 'lowdb/adapters/Memory'
import path from 'path'
import mkdirp from 'mkdirp'
import jwt from 'jsonwebtoken'
import logger, { bold } from './log'
const OAuth2 = google.auth.OAuth2

export interface webServer {
  app: Express;
  server: Server;
}

export interface AuthOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string
}

export default class Authentication {
  private authOptions: AuthOptions
  private db: LowdbSync<unknown>

  public constructor (authOptions: AuthOptions) {
    this.authOptions = authOptions
  }

  /**
   * Start google authentication
   */
  public async authenticate ():Promise<GoogleApis> {
    this.db = this.initDbSync(path.join(__dirname, '../../.cache/authCode.json'))
    const webServer = await this.startWebServer()
    const OAuthClient = await this.createOAuthClient(this.db)
    const authenticatedUser = await this.getOAuthClient(OAuthClient, this.db, webServer)
    this.closeServer(webServer.server)

    return authenticatedUser
  }

  public initDbSync<T> (filePath: string): lowdb.LowdbSync<T> {
    let adapter: lowdb.AdapterSync
    if (filePath) {
      const parentDir = path.dirname(filePath)
      mkdirp.sync(parentDir)
      adapter = new FileSync<T>(filePath)
    } else {
      adapter = new Memory<T>('')
    }
    return lowdb(adapter)
  }

  public async startWebServer ():Promise<webServer> {
    return new Promise((resolve) => {
      const app = express()

      const server = app.listen(3333)

      resolve({
        app: app,
        server: server
      })
    })
  }

  public async waitForGoogleCallback (app:Express):Promise<string> {
    return new Promise((resolve) => {
      logger.event('info', 'Waiting for user consent')

      app.get('/callback', (req:Request, res:Response) => {
        const authCode:any = req.query.code
        res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
        resolve(authCode)
      })
    })
  }

  public async createOAuthClient (db:LowdbSync<unknown>):Promise<OAuth2Client> {
    const OAuthClient = new OAuth2(
      this.authOptions.clientId || process.env.OAUTH_CLIENT_ID,
      this.authOptions.clientSecret || process.env.OAUTH_CLIENT_SECRET,
      this.authOptions.redirectUri || process.env.OAUTH_REDIRECT_URI
    )

    OAuthClient.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        const payload:any = jwt.decode(tokens.id_token)
        logger.event('info', `Logged in as ${bold(payload.email)}`)
        await db.set('user', tokens).write()
      }
    })

    return OAuthClient
  }

  public async getOAuthClient (OAuthClient:OAuth2Client, db:LowdbSync<unknown>, webServer:webServer):Promise<GoogleApis> {
    const tokens = db.get('user').value()
    if (tokens) {
      const payload:any = jwt.decode(tokens.id_token)
      logger.event('info', `Logged in as ${bold(payload.email)}`)
      OAuthClient.setCredentials(tokens)
      google.options({
        auth: OAuthClient
      })

      return google
    }

    const consentUrl = OAuthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: ['https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/presentations',
        'openid',
        'email'
      ]
    })
    opn(consentUrl)

    const authCode = await this.waitForGoogleCallback(webServer.app)

    const tokenResponse = await OAuthClient.getToken(authCode)
    OAuthClient.setCredentials(tokenResponse.tokens)

    google.options({
      auth: OAuthClient
    })

    return google
  }

  public closeServer (server:Server):void {
    server.close()
  }
}
