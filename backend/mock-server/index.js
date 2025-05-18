const express = require("express");
const cors = require("cors");
const fs = require("fs");
const favicon = require("serve-favicon");
const path = require("path");
const { randomUUID } = require("crypto");

const BASE_JSON_FILE_PATH = "/data/";
const origin = ["http://localhost:4200"];
const port = 3000;
const app = express();
const file = __dirname + BASE_JSON_FILE_PATH + "shipments.json";

app.use(cors({ origin }), favicon(path.join(__dirname, "public", "favicon.ico")), express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("Mock server is running!");
});

/* --------------------------------------------------------------------------------------------- */

app.get("/api/v1/shipments/list", (req, res) => {
  fs.readFile(file, "utf8", (error, data) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200);
      res.send(data);
    }
  });
});

app.get("/api/v1/shipments", (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 100;

  let filterModel = {};
  let sortModel = [];

  try {
    filterModel = JSON.parse(req.query.filterModel || "{}");
    sortModel = req.query.sortModel?.split(",") || "[]";
  } catch (error) {
    console.error("\x1b[31m Invalid model! \x1b[0m");
    return res.status(500).send(error);
  }

  fs.readFile(file, "utf8", (error, data) => {
    if (error) {
      console.error("\x1b[31m Failed to read file! \x1b[0m");
      return res.status(500).send(error);
    }

    let items;

    try {
      items = JSON.parse(data.toString());
    } catch (error) {
      console.error("\x1b[31m Failed to parse JSON! \x1b[0m");
      res.status(500).send(error);
      return;
    }

    // Apply filtering, only status and name currently supported
    let filteredData = items.filter((row) => {
      let matches = true;
      if (filterModel.status) {
        const filterValue = filterModel.status.filter || "";
        matches = matches && row.status === filterValue;
      }
      if (filterModel.name) {
        const filterValue = filterModel.name.filter || "";
        matches = matches && row.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      // Add more filters as needed
      return matches;
    });

    // Apply sorting
    const { colId, sort } = { colId: sortModel[0], sort: sortModel[1] };
    filteredData.sort((a, b) => {
      if (a[colId] < b[colId]) return sort === "asc" ? -1 : 1;
      if (a[colId] > b[colId]) return sort === "asc" ? 1 : -1;
      return 0;
    });

    const pagedData = filteredData.slice(offset, offset + limit);

    res.status(200);
    res.send({
      rows: pagedData,
      total: filteredData.length
    });
  });
});

app.get("/api/v1/shipments/list/customer", (req, res) => {
  const queryName = req.query.name?.toLowerCase() || "";

  fs.readFile(file, "utf8", (error, data) => {
    if (error) {
      console.error("\x1b[31m Failed to read file! \x1b[0m");
      return res.status(500).send(error);
    }

    let items;

    try {
      items = JSON.parse(data);
    } catch (error) {
      console.error("\x1b[31m Failed to parse JSON! \x1b[0m");
      res.status(500).send(error);
      return;
    }

    const filteredData = items.filter((user) => user.name.toLowerCase().includes(queryName));

    res.status(200);
    res.send(filteredData);
  });
});

app.post("/api/v1/shipments/create", (req, res) => {
  const shipment = req.body;
  shipment.id = randomUUID();

  let data = [];

  if (fs.existsSync(file)) {
    const fileContent = fs.readFileSync(file, "utf-8");
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error("\x1b[31m Failed to parse JSON! \x1b[0m");
      res.status(500).send(error);
    }
  }

  data.push(shipment);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  res.status(200);
  res.send({ message: "Shipment created successfully!", shipment });
});

app.patch("/api/v1/shipments/patch/:id", (req, res) => {
  const shipmentId = req.params.id;
  const updates = req.body;

  fs.readFile(file, "utf8", (error, data) => {
    if (error) {
      console.error("\x1b[31m Failed to read file! \x1b[0m");
      return res.status(500).send(error);
    }

    let items;

    try {
      items = JSON.parse(data);
    } catch (error) {
      console.error("\x1b[31m Failed to parse JSON! \x1b[0m");
      res.status(500).send(error);
    }

    const index = items.findIndex((user) => user.id === shipmentId);
    if (index === -1) {
      res.status(404).send(`Shipment with id ${shipmentId} not found`);
      return;
    }

    items[index] = { ...items[index], ...updates };

    fs.writeFile(file, JSON.stringify(items, null, 2), (err) => {
      if (error) {
        console.error("\x1b[31m Failed to write file! \x1b[0m");
        return res.status(500).send(error);
      }
      res.status(200);
      res.send({ message: "Shipment updated successfully!", shipment: items[index] });
    });
  });
});

app.delete("/api/v1/shipments/delete", (req, res) => {
  const idsToDelete = req.query["ids"];

  fs.readFile(file, "utf8", (error, data) => {
    if (error) {
      console.error("\x1b[31m Failed to read file! \x1b[0m");
      return res.status(500).send(error);
    }

    let items;

    try {
      items = JSON.parse(data);
    } catch (error) {
      console.error("\x1b[31m Failed to parse JSON! \x1b[0m");
      res.status(500).send(error);
    }

    const updatedItems = items.filter((item) => !idsToDelete.includes(item.id));

    fs.writeFile(file, JSON.stringify(updatedItems, null, 2), (error) => {
      if (error) {
        console.error("\x1b[31m Failed to write file! \x1b[0m");
        return res.status(500).send(error);
      }
      res.status(200);
      res.send({ message: "Shipment(s) successfully deleted!" });
    });
  });
});

/* --------------------------------------------------------------------------------------------- */

app.listen(port, () => {
  console.log(`Mock server is listening on port ${port}`);
});
