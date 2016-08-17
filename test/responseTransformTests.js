import test from 'ava'
import {create} from '../lib/apisauce'
import createServer from '../support/server'
import R from 'ramda'
import getFreePort from '../support/getFreePort'

const MOCK = {a: {b: [1, 2, 3]}}
let port
let server = null
test.before(async t => {
  port = await getFreePort()
  server = createServer(port, MOCK)
})

test.after('cleanup', (t) => {
  server.close()
})

test('attaches a response transform', (t) => {
  const api = create({ baseURL: `http://localhost:${port}` })
  t.truthy(api.addResponseTransform)
  t.truthy(api.responseTransforms)
  t.is(api.responseTransforms.length, 0)
  api.addResponseTransform(R.identity)
  t.is(api.responseTransforms.length, 1)
})

test('alters the response', (t) => {
  const x = create({ baseURL: `http://localhost:${port}` })
  let count = 0
  x.addResponseTransform(({ data }) => {
    count++
    data.a = 'hi'
  })
  t.is(count, 0)
  return x.get('/number/201').then(response => {
    t.is(response.status, 201)
    t.is(count, 1)
    t.deepEqual(response.data.a, 'hi')
  })
})
