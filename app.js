const express = require("express");
const app = express();
app.use(express.json());
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
  //console.log(result);
  return result;
}

function convertDistrictListToCamelCase(array) {
  let result = array.map((dbObj) => {
    return {
      districtId: dbObj.district_id,
      districtName: dbObj.district_name,
      stateId: dbObj.state_id,
      cases: dbObj.cases,
      cured: dbObj.cured,
      active: dbObj.active,
      deaths: dbObj.deaths,
    };
  });
  return result;
}

//API 1

app.get("/states/", async (request, response) => {
  const statesQuery = `SELECT * FROM state`;
  let bdResponse = await db.all(statesQuery);
  // console.log(request.body);
  //console.log(bdResponse);
  let result = convertSnakeToCamelCase(bdResponse);
  console.log(result);
  response.send(result);
});

//API 2

app.get(`/states/:stateId/`, async (request, response) => {
  const { stateId } = request.params;
  // console.log(stateId);
  let getItemQuery = `SELECT * FROM state WHERE state_id = ${stateId}`;
  let dbResponse = await db.get(getItemQuery);
  //console.log(dbResponse);
  let result = convertSnakeToCamelCase([dbResponse]);
  response.send(result[0]);
});

//API 3
app.post("/districts/", async (request, response) => {
  console.log(request.body);
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const createItemQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  let dbResponse = await db.run(createItemQuery);
  response.send("District Successfully Added");
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtQuery = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const dbResponse = await db.get(districtQuery);
  let result = convertDistrictListToCamelCase([dbResponse]);
  //console.log(result);
  response.send(result[0]);
});

// API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district WHERE district_id = ${districtId}`;
  const dbResponse = await db.run(deleteQuery);
  //console.log(dbResponse);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const updateDetails = request.body;
  //console.log(updateDetails);

  const { districtName, stateId, cases, cured, active, deaths } = updateDetails;

  const updateQuery = `UPDATE district SET district_name = '${districtName}',state_id = ${stateId},cases = ${cases},cured = ${cured},active = ${active},deaths = ${deaths}`;
  let dbResponse = await db.run(updateQuery);
  //console.log(dbResponse);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const staticsQuery = `SELECT SUM(cases) AS totalCases,SUM(cured) AS  totalCured , SUM(active) AS totalActive, SUM(deaths) AS totalDeaths FROM district WHERE state_id = ${stateId} `;
  let dbResponse = await db.get(staticsQuery);
  //console.log(dbResponse);
  response.send(dbResponse);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  let gettingQuery = `SELECT DISTINCT (state_name) AS stateName  FROM district INNER JOIN state ON state.state_id = district.state_id`;
  let dbResponse = await db.get(gettingQuery);
  response.send(dbResponse);
  //console.log(dbResponse);
});

module.exports = app;
