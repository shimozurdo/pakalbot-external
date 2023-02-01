import express from "express";
import fetch from "node-fetch";
import hive from "@hiveio/hive-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const mainDelayMS = 30000;
var timer = null;
const urlApi = 'http://localhost:3001'//process.env.API_EXTERNAL;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// cors
const whitelist = [
  "http://localhost:3000",
  "http://localhost:8082",
  "https://pakalbot-trader-api.herokuapp.com",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Works!" });
});

app.post("/trx_wif_is_valid", async (req, res) => {
  try {
    const { body: data } = req;
    console.log(data);
    const privWif = process.env.ACTIVE_KEY;
    const response = await wifIsValid(data.accountName, privWif);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.post("/trx_create_limit_order", async (req, res) => {
  try {
    const { body: data } = req;
    console.log(data);
    const privWif = process.env.ACTIVE_KEY;
    const response = await limitOrderCreate(privWif, data);
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.post("/trx_decode_msg", async (req, res) => {
  try {
    const { body: data } = req;
    console.log(data);
    const privWif = process.env.ACTIVE_KEY;
    const response = hive.memo.decode(privWif, data.msg);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

async function wifIsValid(accountName, privWif, keyType = "active") {
  try {
    const result = await getAccountInfo(accountName);
    const pubWif = result[keyType].key_auths[0][0];
    return hive.auth.wifIsValid(privWif, pubWif);
  } catch {
    return false;
  }
}

async function limitOrderCreate(
  privWif,
  { owner, orderid, amountToSell, minToReceive, fillOrKill, expiration }
) {
  return new Promise((resolve, reject) => {
    hive.broadcast.limitOrderCreate(
      privWif,
      owner,
      orderid,
      amountToSell,
      minToReceive,
      fillOrKill,
      expiration,
      function (err, result) {
        if (err) return reject(err && err.message ? err.message : err);
        return resolve(result);
      }
    );
  });
}

async function getAccountInfo(accountName) {
  return new Promise((resolve, reject) => {
    hive.api.getAccounts([accountName], function (err, result) {
      if (err) return reject(err.message);
      return resolve(result[0]);
    });
  });
}

app.listen(process.env.PORT, () => {
  console.log(`App listening on ${urlApi}`);
});

async function loop() {
  fetch(urlApi)
    .then((response) => {
      if (response.ok) return response.json();
      return response.text();
    })
    .then((res) => {
      console.log(res.message);
    })
    .catch((error) => console.log("error", error));
}

loop();
timer = setInterval(loop, mainDelayMS);
