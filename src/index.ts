#!/usr/bin/env node

import opn from 'opn'
import sleep from './utils/sleep'
import logger, { spinner, bold } from './log'

import data from './data'
import UserInput from './content/userInput'
import Text from './content/text'
import slides from './presentation'
import Authentication, { AuthOptions } from './authenticator'

async function contentGenerator ():Promise<void> {
  await new UserInput(data).start()
  spinner.start('Fetching content ')
  const textGenerator = new Text(data)
  const fullContent = await textGenerator.fetchContent(data.input.articleName, data.input.lang)
  await textGenerator.sanitizeContent(fullContent)
  spinner.succeed()
}

async function authentication () {
  const authOptions:AuthOptions = {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: process.env.OAUTH_REDIRECT_URI
  }

  const authenticator = new Authentication(authOptions)
  const authenticatedClient = await authenticator.authenticate()
  return authenticatedClient
}

async function ending (presentationId:string):Promise<void> {
  spinner.start('Finishing ')
  await sleep(1000)
  opn(`https://docs.google.com/presentation/d/${presentationId}/`)
  spinner.succeed()

  logger.event('success', 'Presentation successfully created')
  logger.event('success', `Presentation available: https://docs.google.com/presentation/d/${presentationId}`)
  logger.event('info', `Created by ${bold('vilmacio22')}: https://github.com/vilmacio22`)
  console.log(bold('Thanks for using!'))
}

async function start ():Promise<void> {
  await contentGenerator()
  const authenticatedClient = await authentication()
  const presentationId = await slides(data, authenticatedClient)
  await ending(presentationId)
}

start()
