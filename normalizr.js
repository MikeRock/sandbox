//@ts-check
import { schema, normalize,denormalize } from 'normalizr'
/**
 * Typedefs
 * @typedef {{[k: string]: any}} v
 * @typedef {(v: any,p?: any,k?: string) => any} DEFAULT_STRATEGY
 * */

/**
 * Normalizer Strategy filter function
 * @param {Array<keyof v>} what 
*/
// !TODO Sprawdzic czemu po odwróceniu kolejności add i filter filtruje dodane klucze
let filter = (...what) => f => (v,p,k) => {
  const vals = f(v,p,k)
  const filtered = Object.keys(v).filter(k => !what.includes(k))
  return filtered.reduce((acc,item) => Object.assign(acc,{[item]:vals[item]}),{})
}
/**
 * Normalizer Strategy add function
 * @param {{[k in keyof v]: any}} what 
*/
let add = what => f => (v,p,k) => {
  Object.keys(what).forEach(k => {
  if(what[k] instanceof Function) 
  what[k] = what[k](v)
  })
  return Object.assign({},f(v,p,k),{...what})
}
/**
 * Normalizer Strategy map function
 * @param {{[k in keyof v]}} op 
 */
let map = op => f => (v,p,k) => {
  const _v = Object.keys(v).reduce((acc,k) => Object.assign(acc,{[k]:op[k] ? op[k](v[k]): v[k]}),{})
  return f(_v,p,k)
}
/**
 * Compose function
 * @param {Array<Function>} what 
 */

let compose = (...what) => xcc => what.reverse().reduce((acc,f) => f(acc),xcc)
/**
 * @type {DEFAULT_STRATEGY}
 */
const N_DEFAULT_STRATEGY = (v,p,k) => v

let ob = [
{_id:1, name:"Mike", age:32, job:"Unemployed"},
{_id:1, name:"Rob", age:44, job:"Unemployed"},
{_id:2,name:"Steve", age:22, job:"Unemployed"}]
const sch = [new schema.Entity('users',{},{idAttribute:"_id", mergeStrategy(a,b){
  //Prioritize right most entity
  return {...b,...a}
}, processStrategy:((s=N_DEFAULT_STRATEGY) => compose(add({key:"test", key2({name}){return `${name}`}}),filter("age"),map({name(v){return `Mr ${v}`}}))(s))() })]
const norm = normalize(ob,sch)
console.log(JSON.stringify(norm))
const sch2 = {first:sch}
const dnorm = denormalize({first:[1]},sch2,norm.entities)

const getById = (id, schemas, data, key="key") => {
  try {
  const names = Object.keys(schemas)
  let _data = data.map(item => item[key] ? item : (item[key] = names ? names[0]: "__key",item) )
  const arr = new schema.Array(schemas, (v,p,k) => v.key)
  const norm = normalize(_data,arr)
  console.log(norm)
  return denormalize([{id, schema:names ? names[0] : '__key'}],arr,norm.entities)
  } catch(e) {
    console.warn(e)
    return []
  } 
}

//console.log(getById(1,{users: new schema.Entity('users')},[{name:"Tracy", id:2},{name:"Tim", id:1}]))
