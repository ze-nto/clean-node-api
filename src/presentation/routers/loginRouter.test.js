const LoginRouter = require('./LoginRouter')
const MissingParamError = require('../helpers/MissingParamError')
const UnauthorizedError = require('../helpers/UnauthorizedError')

const makeSut = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCaseSpy)
  return {
    sut,
    authUseCaseSpy
  }
}

describe('Login Router', () => {
  it('should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  it('should return 500 if no httpRequest is provided', () => {
    const { sut } = makeSut()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  it('should return 500 if no httpRequest has no body', () => {
    const { sut } = makeSut()
    const httpResponse = sut.route({})
    expect(httpResponse.statusCode).toBe(500)
  })

  it('should call AuthUseCase with correct params', () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any@example.com',
        password: 'any_pass'
      }
    }
    sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  it('should return 401 when invalid credentials are provided', () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_email@example.com',
        password: 'invalid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  it('should return 200 when valid credentials are provided', () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@example.com',
        password: 'valid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  it('should return 500 if no AuthUseCase is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'any_email@example.com',
        password: 'any_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  it('should return 500 if no AuthUseCase has no auth method', () => {
    const sut = new LoginRouter({})
    const httpRequest = {
      body: {
        email: 'any_email@example.com',
        password: 'any_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
