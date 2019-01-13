import Rapid from 'rapid.js'
const anime = new Rapid({baseURL: 'https://api.jikan.moe/v3'})
/*
anime.append(['anime',1,'stats']).get().then(res =>{
  console.log(res.data)
}).catch(err => console.log(err))
*/


class Anime extends Rapid {
  initializeAPI() {
    super.initializeAPI();
    this.interceptor = this.api.interceptors.response.use(response => {
      //response interception
     return response;
    }, error => {
      // error interception
      return Promise.reject(error.response);
    });
  }
 
  ejectInterceptor() {
    this.api.interceptors.eject(this.interceptor);
  }
boot() {  //{baseURL!}/{modelName?}/{primaryKey?}/{id?}/{...append[]?}.{extension?}
  super.boot()
  this.modelName = 'anime'
 // this.config.primaryKey = 'id'
  this.baseURL = 'https://api.jikan.moe/v3'
  this.config.globalParameters = { key: 'MY_API_KEY' } // Always appended as query to GET and in body otherwise
  this.config.methods = { // Methods used for request
    create: 'post',
    update: 'put',
    delete: 'delete',
  }
  this.config.suffixes = { // Suffixes to add to request
    create: 'create',
    update: 'update',
    delete: 'delete'
  },
  this.config.extension = '' // adds extension to path ex. 'jpg'
  this.config.apiConfig = { // Axios config
    headers:{
    'Content-Type':'application/json',
    Authorization:'Bearer MY_TOKEN'
  }, 
    withCredentials: true,
    //data :{}.
  }
}
getAnimeById(id) {
  return this.id(id)
}
stats() {
  return this.append('stats')
}
}

const anime2 = new Anime()
// https://api.jikan.moe/v3/anime/1/stats
//anime2.getAnimeById(1).stats().get().then((res) => console.log(res.data)).catch(err => console.log(err.message))

const routes = [{
  name: 'get_anime_stats',
 // type: 'get',
  url: '/{modelName}/{id}/stats'
}]
// https://api.jikan.moe/v3/anime/1/stats with custom route
const anime3 = new Rapid({baseURL:'https://api.jikan.moe/v3', customRoutes:routes})
anime3.route('get_anime_stats',{id:1, modelName: 'anime'},/* { request data } */).then((res) => console.log(res.config.url)).catch(err => console.log(err.message))