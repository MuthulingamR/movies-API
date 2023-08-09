const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectTOResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDBObjectTOResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get Movies name API
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `
    SELECT movie_name
    FROM movie
    ORDER BY movie_id;`;
  const moviesNameArray = await db.all(getMovieNameQuery);
  response.send(
    moviesNameArray.map((eachObject) =>
      convertDbObjectTOResponseObject1(eachObject)
    )
  );
});

//Post Movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieNameQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieNameQuery);
  response.send(convertDbObjectTOResponseObject1(movie));
});

//Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}' 
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director
    ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorQuery);
  response.send(
    directorsArray.map((eachObject) =>
      convertDBObjectTOResponseObject2(eachObject)
    )
  );
});

//Get Movies Directed by specific directors
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesDirectedByDirectorQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId}
    ORDER BY director_id;`;
  const moviesArray = await db.all(getMoviesDirectedByDirectorQuery);
  response.send(
    moviesArray.map((eachObject) =>
      convertDbObjectTOResponseObject1(eachObject)
    )
  );
});

module.exports = app;
