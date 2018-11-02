const { Stream: $ } = require('xstream')
const isString = require('lodash/isString')
const isObject = require('lodash/isObject')
const isFunction = require('lodash/isFunction')
const identity = require('ramda/src/identity')
const complement = require('ramda/src/complement')
const pipe = require('ramda/src/pipe')
const when = require('ramda/src/when')
const isUndefined = require('lodash/isUndefined')
const either = require('ramda/src/either')
const always = require('ramda/src/always')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const startsWith = require('ramda/src/startsWith')
const both = require('ramda/src/both')
const isNotEmpty = require('ramda-adjunct/lib/isNotEmpty').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const objOf = require('ramda/src/objOf')
const apply = require('ramda/src/apply')
const slice = require('ramda/src/slice')
const prop = require('ramda/src/prop')
const concat = require('ramda/src/concat')
const map = require('ramda/src/map')
const { WithListener, AfterFromString } = require('monocycle/operators/listener')
const equals = require('ramda/src/equals')
const curry = require('ramda/src/curry')
const capitalize = require('monocycle/utilities/capitalize')
const castArray = require('lodash/castArray')
const { makeScopedFunction } = require('monocycle/utilities/scoped')
const log = require('monocycle/utilities/log').Log('Transition')
const unless = require('ramda/src/unless')


const prefixNameReducer = ({ kind } = {}, name) => !kind
  ? name
  : `${kind.length > 1
    ? '(' + kind.toString() + ')'
    : kind[0]
  } ${name}`

const WithStateLogging = curry(({ log, name }, reducer) => {

  let noPrefix = false

  if (isObject(name)) {

    noPrefix = Boolean(name.noPrefix)
    name = name.name
  }

  return before => {

    const after = reducer(before)

    if (!noPrefix && isObject(after))
      name = prefixNameReducer(after, name)

    !equals(before, after) && log(`%c${name}:`, [
      'color: #32b87c',
    ].join(';'), { before, after })

    return after
  }
})




// const WithTransition1 = (options, Cycle) => {

//   log('sdf0')

//   return WithListener(pipe(
//     log.partial('0'),
//     castArray,
//     log.partial('1'),
//     map(pipe(
//       log.partial('2'),

//       // when(isString, Array),

//       // when(isArray, pipe(
//       //   filter(isString),
//       //   functionOptions => {

//       //     return new Function(...functionOptions)
//       //   }
//       // )),

//       when(either(isFunction, isString), objOf('reducer')),

//       log.partial('3'),

//       // over(lensProp('from'), pipe(
//       //   when(isString,
//       //     ifElse(startsWith('return '),
//       //       f => new Function("sinks", "sources", f),
//       //       prop
//       //     )
//       //   )
//       // )),

//       over(lensProp('from'), unless(isFunction, pipe(
//         AfterFromString({
//           dependencies: {
//             $
//           }
//         })
//       ))),


//       log.partial('4'),

//       options => over(lensProp('reducer'), unless(isFunction, pipe(
//         when(isString,
//           either(
//             both(
//               startsWith('return '),
//               pipe(
//                 log.partial('41'),
//                 slice(7, Infinity),
//                 log.partial('42'),
//                 concat('state => '),
//                 log.partial('43'),
//                 unless(complement(options.from), concat('value => ')),
//                 log.partial('44'),
//                 concat('return '),
//                 log.partial('45'),
//                 makeScopedFunction({
//                   dependencies: { 
//                     $
//                   }
//                 }),
//                 log.partial('46'),
//               )
//             ),
//             prop
//           )
//         ),
//       )))(options),


//       // options => {

//       //   const { from } = options

//       //   const argumentName = from
//       //     ? 'value'
//       //     : 'state'

//       //   return over(lensProp('reducer'), pipe(

//       //     log.partial('sdf265 (' + argumentName + ')'),

//       //     when(isString,
//       //       ifElse(startsWith('return '),
//       //         f => {

//       //           const func = new Function(argumentName, f)

//       //           console.log('sdf266', {
//       //             func,
//       //             args: [argumentName, f],
//       //           })
//       //           return func

//       //         },
//       //         () => {
//       //           throw new Error(`reducer as string must begin with "return "`)
//       //         }
//       //       )
//       //     )
//       //   ))(options)
//       // },
//       log.partial('Transition 5'),


//       options => {

//         const {
//           reducer = identity,
//           name = 'init',
//           before = true,
//           from,
//           ...listenerOptions
//         } = options

//         log('WithTransition()', {
//           options,
//           from,
//           reducer,
//           listenerOptions
//         })
//         const a = reducer({})

//         const getReducer$ = !isFunction(from)
//           ? () => $.of(void 0).mapTo(reducer)
//           : (sinks, sources) => {

//             return (from(sinks, sources) || $.empty()).map(reducer)
//           }

//         return {
//           name: `${capitalize(name)}Transition`,
//           from: (sinks, sources) => {

//             const args = [
//               getReducer$(sinks, sources).map(logState({
//                 name,
//                 log: log
//               })),
//               sinks.onion || $.empty()
//             ]

//             return $.merge.apply(void 0,
//               before
//                 ? args
//                 : args.reverse()
//             )
//           },
//           to: 'onion'
//         }
//       }
//     )),
//     log.partial('Transition 6'),
//   )(options),
//     Cycle
//   )
// }


const ReducerFromString = ({
  dependencies,
  isInitReducer
} = {}) => pipe(
  log.partial('ReducerFromString 0'),
  unless(isString, input => {

    throw new Error(`ReducerFromStringError: 'input' must be a string (provided: ${typeof input})`)
  }),
  log.partial('ReducerFromString 1'),
  either(
    both(
      startsWith('return '),
      pipe(
        log.partial('ReducerFromString 2'),
        slice(7, Infinity),
        concat('state => '),
        log.partial('ReducerFromString 3'),
        unless(always(isInitReducer), concat('value => ')),
        // concat('value => '),
        log.partial('ReducerFromString 4'),
        concat('return '),
        makeScopedFunction({
          dependencies
        }),
        log.partial('ReducerFromString 5'),
      )
    ),
    pipe(log.partial('rrrrrr'), prop)
  )
)


const WithTransition = (options = {}, Cycle) => {

  return pipe(

    ensureArray,
    map(pipe(
      when(
        either(isFunction, isString),
        objOf('reducer')
      ),

      over(lensProp('name'), unless(
        both(isString, isNotEmpty),
        always('init')
      )),

      over(lensProp('from'), pipe(
        when(isString, AfterFromString({
          dependencies: {
            $
          }
        })),
        unless(isFunction, always(void 0)),
      )),

      options => over(lensProp('reducer'), pipe(
        when(isString, ReducerFromString({
          isInitReducer: !options.from,
          dependencies: {
            $
          }
        })),

        unless(isFunction, always(identity))
      ))(options),

      options => {

        const {
          reducer,
          from,
          name
        } = options


        const Reducer$ = !from
          ? () => $.of(reducer)
          : (sinks, sources) => (
            from(sinks, sources) || $.empty()
          ).map(reducer)

        return {
          from: (sinks, sources) => {

            const value$ = Reducer$(sinks, sources)


            const reducer$ = Reducer$(sinks, sources)
            // .map(x => console.log('pouet1', {
            //   x
            // }) || x)

            log('pouet2', {
              Reducer$,
              value$,
              reducer$
            })


            return $.merge(
              // Reducer$(sinks, sources)
              //   .map(WithStateLogging({
              //     name,
              //     log: log
              //   })),
              reducer$.debug('reducer'),

              sinks.onion || $.empty()
            )
          },

          name: `${capitalize(name)}Transition`,
          from: (sinks, sources) => {

            const args = [
              Reducer$(sinks, sources).map(WithStateLogging({
                name,
                log: log
              })),
              sinks.onion || $.empty()
            ]

            return $.merge.apply(void 0,
              args
            )
          },
          to: 'onion'
        }
      }
    )),
    log.partial('6'),
    o => Cycle.get('Listener', o)
  )(options)

  log('pouett', {
    from,
    reducer
  })




  return Cycle.get('Listener', {
    from: (sinks, sources) => {

      const value$ = Reducer$(sinks, sources)


      const reducer$ = Reducer$(sinks, sources)


      log('pouet2', {
        Reducer$,
        value$,
        reducer$
      })


      return $.merge(
        // Reducer$(sinks, sources)
        //   .map(WithStateLogging({
        //     name,
        //     log: log
        //   })),
        reducer$.debug('reducer'),
        sinks.onion || $.empty()
      )
    },
    to: 'onion'
  })
}

module.exports = {
  default: WithTransition,
  WithTransition
}
