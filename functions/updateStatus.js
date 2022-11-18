module.exports = {
  execute (client, data) {
    const { readdir } = require('fs')
    readdir('./data/applications', (err, files) => {
      if (err) console.error(err)
      client.user.setStatus('online')
      client.user.setPresence({ activity: { name: `${files.length} ${(files.length > 1 || files < 1) ? 'applications' : 'application'}`, type: 'WATCHING' }, status: 'Online' })
        .then(console.log('Presence Updated!'))
        .catch(console.error)
    })
  }
}
