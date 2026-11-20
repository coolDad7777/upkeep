import fs from 'fs'
import path from 'path'

const { buildReminderRequest, triggerReminders } = require('../../scripts/trigger-reminders') as {
  buildReminderRequest: (env: Record<string, string | undefined>) => {
    hostname: string
    port: number
    path: string
    method: string
    headers: Record<string, string>
  }
  triggerReminders: (
    env: Record<string, string | undefined>,
    requestImpl: (
      options: { hostname: string; port: number },
      cb: (res: { statusCode?: number; on: (ev: string, fn: (chunk?: string) => void) => void }) => { on: (ev: string, fn: (err?: Error) => void) => void; end: () => void },
    ) => void,
  ) => Promise<{ statusCode?: number; body: string }>
}

describe('reminder cron transport', () => {
  const script = fs.readFileSync(path.join(process.cwd(), 'scripts/trigger-reminders.js'), 'utf8')
  const blueprint = fs.readFileSync(path.join(process.cwd(), 'render.yaml'), 'utf8')

  it('uses TLS on port 443, not plaintext HTTP', () => {
    expect(script).toContain("require('node:https')")
    expect(script).not.toContain("require('node:http')")
    expect(blueprint).toContain('node scripts/trigger-reminders.js')
    expect(blueprint).not.toContain("require('node:http')")
    expect(blueprint).not.toContain('port: 443')
  })

  it('builds an HTTPS request to the reminders endpoint', () => {
    const options = buildReminderRequest({
      APP_HOST: 'https://crewcompliant.onrender.com/extra',
      CRON_SECRET: 'cron-secret',
    })

    expect(options).toEqual({
      hostname: 'crewcompliant.onrender.com',
      port: 443,
      path: '/api/reminders/send',
      method: 'POST',
      headers: {
        Authorization: 'Bearer cron-secret',
        'Content-Type': 'application/json',
      },
    })
  })

  it('refuses to run without a host', () => {
    expect(() => buildReminderRequest({ APP_HOST: '   ' })).toThrow(/APP_HOST/)
  })

  it('treats a non-200 response as a failed cron run', async () => {
    const result = await triggerReminders(
      { APP_HOST: 'crewcompliant.onrender.com', CRON_SECRET: 'cron-secret' },
      (_options, cb) => {
        const res = {
          statusCode: 500,
          on(ev: string, fn: (chunk?: string) => void) {
            if (ev === 'data') fn('boom')
            if (ev === 'end') fn()
          },
        }
        cb(res)
        return { on() { return this }, end() {} }
      },
    )

    expect(result.statusCode).toBe(500)
    expect(result.body).toBe('boom')
  })
})
