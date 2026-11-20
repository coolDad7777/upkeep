/**
 * Render cron entrypoint. Calls the reminders API over TLS on port 443.
 * Plain HTTP cannot complete the public web service handshake.
 */
const https = require('node:https')

function normalizeHost(host) {
  return String(host).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
}

function buildReminderRequest(env = process.env) {
  const host = normalizeHost(env.APP_HOST || '')
  if (!host) {
    throw new Error('APP_HOST is required (hostname only, for example crewcompliant.onrender.com)')
  }

  return {
    hostname: host,
    port: 443,
    path: '/api/reminders/send',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET || ''}`,
      'Content-Type': 'application/json',
    },
  }
}

function triggerReminders(env = process.env, requestImpl = https.request) {
  const options = buildReminderRequest(env)

  return new Promise((resolve, reject) => {
    const req = requestImpl(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data })
      })
    })
    req.on('error', reject)
    req.end()
  })
}

if (require.main === module) {
  triggerReminders()
    .then(({ statusCode, body }) => {
      console.log('Reminders result:', body)
      process.exit(statusCode === 200 ? 0 : 1)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

module.exports = { buildReminderRequest, normalizeHost, triggerReminders }
