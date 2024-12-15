import axios from "axios";
import * as cheerio from "cheerio";

export function list() {
    return new Promise(async (resolve, reject) => {
        const { data } = await axios.get("https://www.marvelrivals.com/heroes/index.html");

        const $ = cheerio.load(data);

        const heroes = [];

        $(".heroesNewsLists .heroNewsList").each((_, item) => {
            const $item = $(item);

            const $a = $item.find("a");

            const images = [];

            $item.find("img").each((_, image) => {
                images.push($(image).attr("src"));
            });

            const hero = {
                id: $a.data("id"),
                tag: $a.data("tag"),
                title: $a.attr("title"),
                images,
                _url: $a.data("url"),
            };

            heroes.push(hero);
        });

        return resolve(heroes);
    });
}

export function find(id) {
    return new Promise(async (resolve, reject) => {
        const heroes = await this.list();

        const url = heroes.find((hero) => hero.id === id)?._url;

        if (!url) {
            return reject("Hero not found");
        }

        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const $hero = $(".art-inner-content .artText");

        const $generalTable = $hero.find("> table").eq(0);
        const $generalTableRows = $generalTable.find("tbody:first > tr");
        const $generalTableHeader = $generalTableRows.eq(0);

        const covers = [];
        const stats = [];
        const skills = [];
        const images = [];

        $generalTableHeader.find("table tbody tr").each((_, statRow) => {
            const $statRow = $(statRow);
            const $statColumns = $statRow.find("td");

            stats.push({
                title: $statColumns.eq(0).text().trim(),
                value: $statColumns.eq(1).text().trim(),
            });
        });

        $generalTableHeader.find("img").each((_, cover) => {
            covers.push($(cover).attr("src"));
        });

        $generalTableRows.not(":eq(0)").each((_, skill) => {
            const $skill = $(skill);
            const $skillColumns = $skill.find("td");

            const $skillInfosRows = $skill.find("table tbody > tr");

            const infos = [];

            $skillInfosRows.not(":eq(0)").each((_, info) => {
                const $info = $(info);
                const $infoRow = $info.find("td");

                infos.push({
                    title: $infoRow.eq(0).text().trim(),
                    value: $infoRow.eq(1).text().trim(),
                });
            });

            skills.push({
                title: $skillColumns.eq(1).text().trim(),
                icon: $skillColumns.eq(2).find("img").attr("src"),
                description: $skillColumns.eq(3).text().trim(),
                key: $skillInfosRows.eq(0).find("td").eq(1).text().trim(),
                infos,
            });
        });

        const $imagesTable = $hero.find("> table").eq(1);

        $imagesTable.find("img").each((_, image) => {
            const $image = $(image);

            images.push($image.attr("src"));
        });

        const hero = {
            title: $hero.find(".p1").text().trim(),
            name: $hero.find(".p2").text().trim(),
            tag: $hero.find(".p3").text().trim(),
            description: $hero.find(".p4").text().trim(),
            lore: $hero.find(".d1").text().trim(),
            covers,
            images,
            stats,
            skills,
        };

        return resolve(hero);
    });
}
