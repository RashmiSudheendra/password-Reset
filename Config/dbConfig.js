const mongodb = require('mongodb')
const dbName = 'users'
const dburl = `mongodb+srv://passwordReset:passwordReset@passwordreset.wm93n9s.mongodb.net/${dbName}`
module.exports = {mongodb,dbName,dburl}