module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};