const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}

module.exports.connect = (done) => {
    const url = "mongodb+srv://jisoChacko:jiso123456@cluster0.lunqa.mongodb.net/ecommerce?retryWrites=true&w=majority"
    const dbname = "ecommerce"

    mongoClient.connect(url, (err,data) => {
      if(err){
        return err
      }
      else{
          state.db = data.db(dbname);
          done()
      }
    })
}

module.exports.get = () => {
    return state.db
}