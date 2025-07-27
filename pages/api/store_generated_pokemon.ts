import type { NextApiRequest, NextApiResponse } from 'next'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'


const pokemondb = await open({
  filename: './database.db',
  driver: sqlite3.Database
})
/*
await db.exec('CREATE TABLE tbl (col TEXT)')
await db.exec('INSERT INTO generated_pokemons VALUES ("test")')
*/
await pokemondb.exec("CREATE TABLE IF NOT EXISTS generated_pokemons (name TEXT,description TEXT, type1 TEXT, type2 TEXT)")

type ResponseData = {
  message: string
}
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  if (req.method === 'GET') {
    const result = await pokemondb.get(`SELECT * FROM generated_pokemons
      WHERE name= ${req.query["name"]} AND description=${req.query["desc"]} 
        AND type1=${req.query["type1"]} AND type2=${req.query["type2"]}`)
    res.send({ message: result })
    
  } 
  else if (req.method === 'POST') {
    await pokemondb.exec(`INSERT INTO generated_pokemons VALUES 
      (${req.query["name"]},${req.query["desc"]},${req.query["type1"]},${req.query["type2"]})`)
    
  }
  else if (req.method === 'DELETE') {
    const result = await pokemondb.get(`DELETE FROM generated_pokemons
      WHERE name= ${req.query["name"]} AND description=${req.query["desc"]} 
        AND type1=${req.query["type1"]} AND type2=${req.query["type2"]}`)
    res.send({ message: result })
  }
  else{

  }
  
}

