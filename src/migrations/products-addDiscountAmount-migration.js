const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
const MongoError = require("mongodb").MongoError
require("dotenv").config()

;(async () => {
  try {
    const host = process.env.MONGO_URI
    const client = await MongoClient.connect(host, { useNewUrlParser: true, useUnifiedTopology: true })
    const ecom = client.db(process.env.MONGO_DB_NAME)

    const predicate = { brand: { $type: 'string' } }
    const cursor = await ecom
      .collection("products")
      .find(predicate)
      .toArray()
    const productsToMigrate = cursor.map(({ _id }) => ({
      updateOne: {
        filter: { _id: ObjectId(_id) },
        update: {
          $set: { discountAmount: 0 },
        },
      },
    }))
    console.log(
      "\x1b[32m",
      `Found ${productsToMigrate.length} documents to update`,
    )

    // Bulk write

    console.log(productsToMigrate)
    const { modifiedCount } = await ecom.collection("products").updateMany(predicate, { $set: { discountAmount: 0 }})

    console.log("\x1b[32m", `${modifiedCount} documents updated`)
    client.close()
    process.exit(0)
  } catch (e) {
    if (
      e instanceof MongoError &&
      e.message.slice(0, "Invalid Operation".length) === "Invalid Operation"
    ) {
      console.log("\x1b[32m", "No documents to update")
    } else {
      console.error("\x1b[31m", `Error during migration, ${e}`)
    }
    process.exit(1)
  }
})()
