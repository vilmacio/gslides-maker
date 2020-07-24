import express, { Request, Response, Express } from 'express'
import { Server } from 'http'
import credentials from '../../credentials'
import opn from 'opn'
import { google, GoogleApis } from 'googleapis'
const OAuth2 = google.auth.OAuth2

export default async function authentication ():Promise<GoogleApis> {
  const webServer = await startWebServer()
  const OAuthClient = await createOAuthClient()
  requestUserConsent(OAuthClient)
  const authorizationToken = await waitForGoogleCallback(webServer.app)
  await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
  setGlobalGoogleAuthentication(OAuthClient)
  closeServer(webServer.server)

  interface webServer {
    app: Express;
    server: Server;
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

  async function createOAuthClient () {
    const OAuthClient = new OAuth2(
      credentials.oauth.client_id,
      credentials.oauth.client_secret,
      credentials.oauth.redirect_uris[0]
    )

    return OAuthClient
  }

  function requestUserConsent (OAuthClient) {
    const consentUrl = OAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/presentations'
      ]
    })
    opn(consentUrl)
    console.log('> [slides-robot] Please give your consent')
  }

  async function waitForGoogleCallback (webServer:Express) {
    return new Promise((resolve) => {
      console.log('> [slides-robot] Waiting for user consent...')

      webServer.get('/callback', (req:Request, res:Response) => {
        const authCode = req.query.code
        console.log(`> [slides-robot] Consent given: ${authCode}`)

        res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
        resolve(authCode)
      })
    })
  }

  async function requestGoogleForAccessTokens (OAuthClient, authorizationToken) {
    return new Promise((resolve, reject) => {
      OAuthClient.getToken(authorizationToken, (error, tokens) => {
        if (error) {
          return reject(error)
        }

        console.log('> [slides-robot] Access tokens received!')

        OAuthClient.setCredentials(tokens)
        resolve()
      })
    })
  }

  function setGlobalGoogleAuthentication (OAuthClient) {
    google.options({
      auth: OAuthClient
    })
  }

  function closeServer (server:Server) {
    server.close()
  }

  return google
}
