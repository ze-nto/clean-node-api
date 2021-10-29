module.exports = class MissingParamError extends Error {
  constructor (paramName) {
    super('Internal Error')
    this.name = 'ServerError'
  }
}
