import express, { Request, Response, Express } from 'express'
import credentials from '../../credentials'
import opn from 'opn'
import { google, GoogleApis } from 'googleapis'
const OAuth2 = google.auth.OAuth2

export default async function authentication ():Promise<GoogleApis> {
  const webServer = await startWebServer()
  const OAuthClient = await createOAuthClient()
  requestUserConsent(OAuthClient)
  const authorizationToken = await waitForGoogleCallback(webServer)
  await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
  setGlobalGoogleAuthentication(OAuthClient)

  async function startWebServer ():Promise<Express> {
    return new Promise((resolve) => {
      const app = express()

      app.listen(3333, () => {
        console.log('> [youtube-robot] Listening on http://localhost:3333')

        resolve(app)
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
      scope: ['https://www.googleapis.com/auth/presentations']
    })
    opn(consentUrl)
    console.log('> [youtube-robot] Please give your consent')
  }

  async function waitForGoogleCallback (webServer:Express) {
    return new Promise((resolve) => {
      console.log('> [youtube-robot] Waiting for user consent...')

      webServer.get('/callback', (req:Request, res:Response) => {
        const authCode = req.query.code
        console.log(`> [youtube-robot] Consent given: ${authCode}`)

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

        console.log('> [youtube-robot] Access tokens received!')

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

  return google
}
