import express from "express";
import * as scrapeHeroes from "./src/scrapes/scrapeHeroes.js";

const app = express();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

app.get("/v1/heroes", (req, res) => {
    scrapeHeroes
        .list()
        .then((heroes) => res.json(heroes))
        .catch((err) => res.status(500).json(err));
});

app.get("/v1/heroes/:id", (req, res) => {
    const { id } = req.params;

    scrapeHeroes
        .find(id)
        .then((hero) => res.json(hero))
        .catch((err) => res.status(500).json(err));
});
