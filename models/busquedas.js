const fs = require('fs')
const axios = require('axios')

class Busquedas {
  historial = []
  dbPath = './db/database.json'

  constructor() {
    //TODO: leer db si existe
    this.leerDB()
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(' ')
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1))
      return palabras.join(' ')
    })
    //capitalizado cada palabra
    /*return this.historial.map((historial) => {
      let lugar = ''
      const hisEspacio = historial.split(',')
      hisEspacio.map((his) => {
        const frase = his.trim()
        const palabrasAux = frase.split(' ')
        let aux = ''
        palabrasAux.map((palabra) => {
          aux += `${palabra.charAt(0).toUpperCase()}${palabra.slice(1)} `
        })
        lugar += `${aux.slice(0, aux.length - 1)}, `
      })
      //console.log(lugar.slice(0, lugar.length - 2))
      return lugar.slice(0, lugar.length - 2)
    })*/
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: 'es',
    }
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    }
  }

  async ciudad(lugar = '') {
    try {
      const intance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      })

      const resp = await intance.get()
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }))
    } catch (error) {
      return []
    }

    return [] // retornar los lugares
  }

  async climaLugar(lat, lon) {
    try {
      //intance axios.create()
      const intance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon },
      })
      // resp.data
      const resp = await intance.get()
      const { weather, main } = resp.data

      return {
        desc: weather[0].description, //wheatger
        min: main.temp_min, //main
        max: main.temp_max,
        temp: main.temp,
      }
    } catch (error) {
      console.log(error)
    }
  }

  agregarHistorial(lugar = '') {
    //TODO: prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return
    }

    this.historial = this.historial.splice(0, 5)
    this.historial.unshift(lugar.toLocaleLowerCase())
    //grabar en db
    this.guardarDB()
  }

  guardarDB() {
    //por si enc aso se enviaran mas propiedades
    const payload = {
      historial: this.historial,
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(payload))
  }

  leerDB() {
    //debe existir
    if (!fs.existsSync(this.dbPath)) {
      return
    }
    //const ifo ... readfilesyc ... path encoding 'utf-8'
    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' })
    const data = JSON.parse(info)
    this.historial = data.historial
  }
}

module.exports = Busquedas
