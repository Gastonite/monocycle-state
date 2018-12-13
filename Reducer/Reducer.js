const { Stream: $ } = require('xstream')
const unless = require('ramda/src/unless')
const objOf = require('ramda/src/objOf')
const assoc = require('ramda/src/assoc')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const when = require('ramda/src/when')
const always = require('ramda/src/always')
const { EmptyObject } = require('monocycle/utilities/empty')
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { WithListener } = require('monocycle/components/Listener')
const { pipe } = require('monocycle/utilities/pipe')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
// const log = require('monocycle/utilities/log').Log('Reducer')

const WithReducer = pipe(
  when(isFunction, objOf('reducer')),
  ensurePlainObj,
  over(lensProp('reducer'), unless(isFunction, always(always))),
  ({ from, reducer }) => {

    if (!isFunction(from))
      return always($.of(reducer))

    return (sinks, sources) => {

      return (from(sinks, sources) || $.empty())
        .map(reducer)
    }
  },
  objOf('from'),
  assoc('to', 'state'),
  assoc('combine', $.merge),
  WithListener
)

WithReducer.coerce = pipe(
  when(isFalsy, EmptyObject),
  unless(isPlainObj, objOf('reducer')),
)

module.exports = {
  default: WithReducer,
  WithReducer
}