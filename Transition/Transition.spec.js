const dropRepeats = require('xstream/extra/dropRepeats').default
const test = require('ava')
const jsc = require('jsverify')
const { withState } = require('@cycle/state')
const keys = require('ramda/src/keys')
const when = require('ramda/src/when')
const unless = require('ramda/src/unless')
const split = require('ramda/src/split')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const both = require('ramda/src/both')
const always = require('ramda/src/always')
const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const isInteger = require('ramda-adjunct/lib/isInteger').default
const isNonNegative = require('ramda-adjunct/lib/isNonNegative').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const { WithTransition } = require('./Transition')
const pipe = require('ramda/src/pipe')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
const { diagramArbitrary } = require('cyclejs-test-helpers')
const { isComponent } = require('monocycle/component')
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { withTime } = require('cyclejs-test-helpers')


const replaceAt = (index, replacement, string) => {
  return string.substr(0, index) + replacement + string.substr(index + replacement.length);
}

const generateLetter = (possibles = '', length = 1) => {
  let text = "";

  for (var i = 0; i < length; i++)
    text += possibles.charAt(Math.floor(Math.random() * possibles.length));

  return text;
}

const DiagramArbitrary = pipe(
  ensurePlainObj,
  over(lensProp('possibles'), pipe(
    when(isNonEmptyString, split('')),
    ensureArray
  )),
  over(lensProp('length'), pipe(
    unless(both(isInteger, isNonNegative), always(1)),
  )),
  ({
    possibles,
    length = 1
  } = {}) => {

    if (possibles.length < 1)
      return diagramArbitrary

    return diagramArbitrary.smap((x) => {

      return x.split('')
        .reduce((before, char, i) => {

          if (char === '-')
            return before

          return replaceAt(i, generateLetter(possibles.join(''), length), before)
        }, x)
    }, x => {
      return x.replace(new RegExp(possibles.join('|'), 'g'), 'x')//?
    })
  }
)

const diagramArb = DiagramArbitrary({
  possibles: 'abc'
})


const initStateMacro = (t, Spec) => {

  const {
    sources,
    input,
    expectedSinks,
    expectedState
  } = Spec(t)

  return withTime(Time => {
    const withTransition = WithTransition(input)

    const component = withTransition()//?

    t.true(isComponent(component))

    const sinks = withState(component)(sources)

    t.true(isPlainObj(sinks))

    t.deepEqual(keys(sinks), expectedSinks)

    Time.assertEqual(
      sources.state.stream,
      Time.diagram('x', { x: expectedState }),
      t.is.bind(t)
    )

    return true
  })()
}
initStateMacro.title = (title = '', input, expected) => `Set initial state` + (title ? ' ' + title : '')
initStateMacro.tests = 4

test('from a function', initStateMacro, t => (t.plan(initStateMacro.tests), {
  input: always(42),
  sources: {},
  expectedSinks: ['state'],
  expectedState: 42
}))

test('from a plain object', initStateMacro, t => (t.plan(initStateMacro.tests), {
  input: {
    reducer: always(42)
  },
  sources: {},
  expectedSinks: ['state'],
  expectedState: 42
}))

const updateStateMacro = (t, options) => {

  const {
    sources,
    input,
    expectedSinks,
    ExpectedState
  } = options

  return withTime(Time => {

    const property = jsc.forall(diagramArb, a => {

      const streamA = Time.diagram(a)
      const sources = { mySource: streamA }
      const withTransition = WithTransition(input)
      const component = withTransition()

      t.true(isComponent(component))

      const sinks = withState(component)(sources)

      t.true(isPlainObj(sinks))
      t.deepEqual(keys(sinks), expectedSinks)

      Time.assertEqual(
        sources.state.stream,
        ExpectedState(streamA),
        t.is.bind(t)
      )

      return true
    })

    jsc.assert(property, { tests: 100, size: 100 })
  })()
}

updateStateMacro.title = (title = '', input, expected) => `Updates state` + (title ? ' (' + title + ')' : '')
updateStateMacro.tests = 4

test(updateStateMacro, {
  input: {
    from: (sinks, sources) => sources.mySource,
    reducer: value => (state = '') => state + value
  },
  expectedSinks: ['state'],
  ExpectedState: stream => stream
    .fold((expected = '', character) => expected + character)
    .drop(1)
})


test('implicit reducer', updateStateMacro, {
  input: {
    from: (sinks, sources) => sources.mySource,
  },
  expectedSinks: ['state'],
  ExpectedState: stream => stream.compose(dropRepeats())
})


