module.exports = {
    apps: [
      {
        name: 'phaidra-ir',
        exec_mode: 'cluster',
        instances: 'max',
        script: './node_modules/nuxt/bin/nuxt.js',
        args: 'start'
      }
    ]
  }