const { Stream: $ } = require('xstream')
const unless = require('ramda/src/unless')
const objOf = require('ramda/src/objOf')
const assoc = require('ramda/src/assoc')
const __ = require('ramda/src/__')
const identity = require('ramda/src/identity')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const applyTo = require('ramda/src/applyTo')
const when = require('ramda/src/when')
const always = require('ramda/src/always')
const { EmptyObject, EmptyString } = require('monocycle/utilities/empty')
const noop = require('ramda-adjunct/lib/noop').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const { WithListener } = require('monocycle/components/Listener')
const propSatisfies = require('ramda/src/propSatisfies')
const ifElse = require('ramda/src/ifElse')
const prop = require('ramda/src/prop')
const pipe = require('ramda/src/pipe')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')

const WithStateLog = ({ log }) => reducer => state => {

  const after = reducer(state)

  log({ before: state, after })

  return after
}

const WithTransition = pipe(
  when(isFunction, objOf('reducer')),
  ensurePlainObj,
  over(lensProp('name'), unless(isNonEmptyString, always('init'))),
  // over(lensProp('from'), unless(isFunction, () => always($.of(void 0)))),

  ({ name, Log, ...options }) =>
    assoc('log', pipe(
      unless(isFunction, always(noop)),
      applyTo(name),
    )(Log))(options),

  ({ log, ...options }) =>
    over(lensProp('reducer'), pipe(
      unless(isFunction, always(always)),
      !log ? identity : WithStateLog({ log })
    ))(options),

  ifElse(propSatisfies(isFunction, 'from'),
    ({ from, reducer }) => {

      return (sinks, sources) => (from(sinks, sources) || $.empty()).map(reducer)
    },
    pipe(
      prop('reducer'),
      $.of,
      always,
    )
  ),

  objOf('from'),
  assoc('to', 'state'),
  assoc('combine', $.merge),
  WithListener
)

WithTransition.coerce = pipe(
  when(isFalsy, EmptyObject),
  unless(isPlainObj, objOf('reducer')),
)

module.exports = {
  default: WithTransition,
  WithTransition
}