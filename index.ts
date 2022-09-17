import { RequestInfo, RequestInit } from 'node-fetch';
import { promises as fs } from 'fs';
import moment from "moment"
const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, init));


let config: any = {httpUser: "", httpPass: ""}; 

async function swkaLogin(user: string, pass: string) {
    
    let json= await (await fetch(`https://autoload.sw-ka.de/TL1/TLM/KASVC/LOGIN?karteNr=${user}&format=JSON&datenformat=JSON`, {
        //@ts-ignore
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "de,en;q=0.7,en-US;q=0.3",
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(config.httpUser + ":" + config.httpPass).toString("base64")}`,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://autoload.sw-ka.de/KartenService/index.html",
        "body": `{\"BenutzerID\":\"${user}\",\"Passwort\":\"${pass}\"}`,
        "method": "POST",
        "mode": "cors"
    })).json();

    return {authToken: json[0].authToken, lTrans: json[0].lTransTage, karte: json[0].karteNr}
}

async function getTrans(params: any) {
    let json = await (await fetch(`https://autoload.sw-ka.de/TL1/TLM/KASVC/TRANS?format=JSON&authToken=${params.authToken}&karteNr=${params.karte}&datumVon=${moment().subtract(params.lTrans, "days").format("DD.MM.YYYY")}&datumBis=${moment().format("DD.MM.YYYY")}&_=1663358285750`, {
        //@ts-ignore
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "de,en;q=0.7,en-US;q=0.3",
            "Authorization": `Basic ${Buffer.from(config.httpUser + ":" + config.httpPass).toString("base64")}`,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://autoload.sw-ka.de/KartenService/index.html",
        "method": "GET",
        "mode": "cors"
    })).json();
    return json;
}

async function getPos(params: any) {
    let json = await (await fetch(`https://autoload.sw-ka.de/TL1/TLM/KASVC/TRANSPOS?format=JSON&authToken=${params.authToken}&karteNr=${params.karte}&datumVon=${moment().subtract(params.lTrans, "days").format("DD.MM.YYYY")}&datumBis=${moment().format("DD.MM.YYYY")}&_=1663358285750`, {
        //@ts-ignore
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "de,en;q=0.7,en-US;q=0.3",
            "Authorization": `Basic ${Buffer.from(config.httpUser + ":" + config.httpPass).toString("base64")}`,
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://autoload.sw-ka.de/KartenService/index.html",
        "method": "GET",
        "mode": "cors"
    })).json();
    return json;
}

(async ()=> {
    await fs.readFile("./config.json", {encoding: 'utf-8'}).then((val) => config = JSON.parse(val)).catch(err => fs.writeFile("./config.json", JSON.stringify(config, null, 4)));
    let res = await swkaLogin(process.argv[2], process.argv[3]);
    let trans = await getTrans(res);
    let pos = await getPos(res);

    fs.writeFile("trans.json", JSON.stringify(trans, null, 4))
    fs.writeFile("pos.json", JSON.stringify(pos, null, 4))
    
})();
