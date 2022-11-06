function response(code, value) {
  return {
    responseCode: code,
    value
  };
}

module.exports = response;