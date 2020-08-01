import express, { Request, Response, Express } from 'express'
import { Server } from 'http'
import credentials from '../config/credentials'
import opn from 'opn'
import { google, GoogleApis } from 'googleapis'
import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import Memory from 'lowdb/adapters/Memory'
import path from 'path'
import mkdirp from 'mkdirp'
import jwt from 'jsonwebtoken'
import logger, { bold } from '../log'
const OAuth2 = google.auth.OAuth2

export default async function authentication ():Promise<GoogleApis> {
  const db = initDbSync('./.cache/authCode.json')
  const webServer = await startWebServer()
  const OAuthClient = await createOAuthClient()
  await getOAuthClient(OAuthClient)
  closeServer(webServer.server)

  interface webServer {
    app: Express;
    server: Server;
  }

  function initDbSync<T> (filePath: string): lowdb.LowdbSync<T> {
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

  async function startWebServer ():Promise<webServer> {
    return new Promise((resolve) => {
      const app = express()

      const server = app.listen(3333)

      resolve({
        app: app,
        server: server
      })
    })
  }

  async function waitForGoogleCallback (app:Express) {
    return new Promise((resolve) => {
      logger.event('info', 'Waiting for user consent')

      app.get('/callback', (req:Request, res:Response) => {
        const authCode = req.query.code
        res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
        resolve(authCode)
      })
    })
  }

  async function createOAuthClient () {
    const OAuthClient = new OAuth2(
      credentials.oauth.client_id,
      credentials.oauth.client_secret,
      credentials.oauth.redirect_uris[0]
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

  async function getOAuthClient (OAuthClient) {
    const tokens = db.get('user').value()
    if (tokens) {
      const payload:any = jwt.decode(tokens.id_token)
      logger.event('info', `Logged in as ${bold(payload.email)}`)
      OAuthClient.setCredentials(tokens)
      const newOAuthClient = await OAuthClient.getAccessToken()
      google.options({
        auth: OAuthClient
      })
      return newOAuthClient
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

    const authCode = await waitForGoogleCallback(webServer.app)

    const tokenResponse = await OAuthClient.getToken(authCode)
    OAuthClient.setCredentials(tokenResponse.tokens)

    google.options({
      auth: OAuthClient
    })
  }

  function closeServer (server:Server) {
    server.close()
  }

  return google
}
