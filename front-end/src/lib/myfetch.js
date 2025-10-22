/**
 * Biblioteca 'myfetch'
 * 
 * Facilita o uso da API nativa fetch() do JavaScript
 * 
 * @author Prof. Fausto G. Cintra <professor@faustocintra.com.br>
 * @license GL2PS
 */

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = Number(status)
  }
}

const myfetch = {}  // Objeto vazio

// Lê o endereço do back-end a partir do arquivo .env.local
const baseUrl = import.meta.env.VITE_API_BASE

function getOptions(body = null, method = 'GET') {
  const options = {
    method,
    headers: {"Content-type": "application/json; charset=UTF-8"},
    credentials: 'include'  // Instrui o back-end a gravar cookies no front
  }

  if(body) options.body = JSON.stringify(body)

  // Verifica se existe um token gravado no localStorage e o inclui
  // nos headers, nesse caso
  const token = window.localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_NAME)

  if(token) options.headers.authorization = `Bearer ${token}`

  return options
}

function getErrorDescription(response) {
  switch(response.status) {
    case 401:   // Unauthorized
      return 'ERRO: usuário ou senha incorretos'

    case 403:
      return 'ERRO: acesso não autorizado'

    case 500:
      return 'ERRO: mau funcionamento do servidor remoto'

    default:
      return `ERRO: HTTP ${response.status}: ${response.statusText}`

  }
}

function processResponse(response) {
  if(response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json')
    if(isJson) return response.json()
    else return true
  } else throw new HttpError(response.status, getErrorDescription(response))
}

myfetch.post = async function(path, body) {
  const response = await fetch(baseUrl + path, getOptions(body, 'POST'))
  return processResponse(response)
}

myfetch.put = async function(path, body) {
  const response = await fetch(baseUrl + path, getOptions(body, 'PUT'))
  return processResponse(response)
}

myfetch.get = async function(path) {
  const response = await fetch(baseUrl + path, getOptions())
  return processResponse(response)
}

myfetch.delete = async function(path) {
  const response = await fetch(baseUrl + path, getOptions(null, 'DELETE'))
  return processResponse(response)
}

export default myfetch