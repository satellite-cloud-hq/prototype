import { InfluxDB, Point } from "@influxdata/influxdb-client";

const url = "http://localhost:8086";
const token = "admin-token";
const org = "satellite-cloud";

const queryApi = new InfluxDB({
  url,
  token,
}).getQueryApi("satellite-cloud");

export { queryApi };
