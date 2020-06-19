// import { Data } from '../main/data'
import express, { Request, Response, Express } from 'express'
import credentials from '../../credentials'
import { google } from 'googleapis'
const OAuth2 = google.auth.OAuth2
export default async function authentication ():Promise<void> {
  const webServer = await startWebServer()
  const OAuthClient = await createOAuthClient()
  requestUserConsent(OAuthClient)
  await waitForGoogleCallback(webServer)

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
      scope: ['https://www.googleapis.com/auth/drive.file']
    })

    console.log(`> [youtube-robot] Please give your consent: ${consentUrl}`)
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
}
