import {
  createBrowserRouter,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import App from "./App.tsx";

import {
  handleReousrcesGroundStationsGet,
  handleReousrcesSatellitesGet,
  handleSchedulePost,
  handleSimulationsGet,
  handleSimulationsGetAll,
  handleSimulationsPost,
  handleSimulationsStopPost,
} from "./utils/data.ts";

import { satellitesType, simulationType } from "./utils/types.ts";
import { queryApi } from "./utils/influxClient.ts";

export const router = createBrowserRouter([
  {
    path: "/:simulationId?",
    Component: App,
    loader: loader,
    action: action,
  },
]);

async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "run") {
    const conditionFileContent = formData.get("conditionFileContent") as string;
    const appFileContent = formData.get("appFileContent") as string;
    const res = await handleSimulationsPost({
      conditionFileContent,
      appFileContent,
    });
    console.log(res);
    const { id } = res;
    return redirect(`/${id}`);
  }
  if (action === "switch") {
    const simulationId = formData.get("simulationId") as string;
    try {
      return redirect(`/${simulationId}`);
    } catch (error) {
      console.error("Error fetching simulation:", error);
    }
  }
  if (action === "stop") {
    const simulationId = formData.get("simulationId") as string;
    const res = await handleSimulationsStopPost(simulationId);
    console.log(res);
    const { id } = res;
    return redirect(`/${id}`);
  }
}
async function loader({ params }: LoaderFunctionArgs) {
  const id = params.simulationId;
  console.log("Loader called with id:", id);
  const simulation: simulationType | null = id
    ? await handleSimulationsGet(id!)
    : null;
  console.log(simulation);

  const fluxQuery = `from(bucket: "simulation")
  |> range(start: 0)
  |> filter(fn: (r) => r["_measurement"] == "${id}")
  |> filter(fn: (r) => 
    r["_field"] == "elapsed_time[s]" or
    r["_field"] =~ /^spacecraft_quaternion_i2b_[wxyz]$/ or 
    r["_field"] == "spacecraft_position_i_x[m]" or 
    r["_field"] == "spacecraft_position_i_y[m]" or 
    r["_field"] == "spacecraft_position_i_z[m]" or 
    r["_field"] == "spacecraft_latitude[rad]" or
    r["_field"] == "spacecraft_longitude[rad]" or
    r["_field"] == "spacecraft_altitude[m]" or
    r["_field"] == "spacecraft_velocity_i_x[m/s]" or
    r["_field"] == "spacecraft_velocity_i_y[m/s]" or
    r["_field"] == "spacecraft_velocity_i_z[m/s]" or
    r["_field"] == "spacecraft_acceleration_i_x[m/s2]" or
    r["_field"] == "spacecraft_acceleration_i_y[m/s2]" or
    r["_field"] == "spacecraft_acceleration_i_z[m/s2]" 
  )
  |> group(columns: ["_measurement", "_field"]) // Group by measurement and field
  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
  |> pivot(
    rowKey: ["_time"],
    columnKey: ["_field"],
    valueColumn: "_value"
  )
  |> yield(name: "mean")`;

  const simulationResult =
    simulation && !simulation.running
      ? await queryApi.collectRows(fluxQuery)
      : null;
  if (simulation) {
    console.log("Simulation result:", simulationResult);
  }

  const res = await handleSimulationsGetAll();
  const simulationsList: simulationType[] = res.items;

  const satellitesRes = await handleReousrcesSatellitesGet();
  const satellites: satellitesType[] = satellitesRes.items;

  const groundStations = await handleReousrcesGroundStationsGet();

  return {
    simulation,
    simulationResult,
    simulationsList,
    satellites: satellites,
    groundStations: groundStations.items,
  };
}
