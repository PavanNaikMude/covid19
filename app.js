const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
    console.log("Server running at 3000");
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

function convertSnakeToCamelCase(array) {
  let result = array.map((dbObj) => {
    return {
      stateId: dbObj.state_id,
      stateName: dbObj.state_name,
      population: dbObj.population,
    };
  });
  return result;
}
//API 1

app.get("/states/", async (request, response) => {
  const statesQuery = `SELECT * FROM state`;
  let bdResponse = await db.all(statesQuery);
  //console.log(bdResponse);
  let result = convertSnakeToCamelCase(bdResponse);
  //console.log(result);
  response.send(result);
});

//API 2

app.get(`/states/:stateId/`, async (request, response) => {
  const { stateId } = request.params;
  const getItemQuery = `SELECT * FROM state WHERE state_id = ${stateId}`;
  let dbResponse = await app.get(getItemQuery);
  let result = convertSingleItem([dbResponse]);
  response.send(result);
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
 // console.log(request.body)
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const createItemQuery = `INSERT INTO district VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  response.send("District Successfully Added");
});
