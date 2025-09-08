function withPlural(amount) {
  return (amount === 1) ? 'token' : 'tokens';
}

module.exports = withPlural;