import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

import pg from "pg";
const { Client } = pg;

const db = new Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432,
  database: "permalist",
});

await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

const readData = async () => {
  const res = await db.query("SELECT * FROM todo");
  return res.rows;
};

const addData = async (item) => {
  const res = await db.query(
    "INSERT INTO todo(title) VALUES($1) RETURNING * ",
    [item],
  );
  return res.rows;
};

const modifyData = async (item, id) => {
  const res = await db.query(
    "UPDATE todo SET title = ($1) WHERE id = ($2) RETURNING *",
    [item, id],
  );
  return res.rows;
};

const deleteData = async (id) => {
  const res = await db.query("DELETE FROM todo WHERE id = ($1) RETURNING *", [
    id,
  ]);
  return res.rows;
};

app.get("/", async (req, res) => {
  try {
    let items = await readData();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    const response = await addData(item);
    items.push({ title: item });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const { updatedItemId, updatedItemTitle } = req.body;
  try {
    const response = await modifyData(updatedItemTitle, updatedItemId);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const { deleteItemId } = req.body;
  console.log(deleteItemId)
  try {
    const response = await deleteData(deleteItemId);
    console.log(response);
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
