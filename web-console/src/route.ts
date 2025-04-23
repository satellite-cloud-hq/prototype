import {
  createBrowserRouter,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import App from "./App.tsx";

import {
  handleReousrcesGroundStationsGet,
  handleReousrcesSatellitesGet,
  handleSimulationsGet,
  handleSimulationsGetAll,
  handleSimulationsPost,
  handleSimulationsStopPost,
} from "./utils/data.ts";

import { satellitesType, simulationType } from "./utils/types.ts";

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

  const res = await handleSimulationsGetAll();
  const simulationsList: simulationType[] = res.items;

  const satellitesRes = await handleReousrcesSatellitesGet();
  const satellites: satellitesType[] = satellitesRes.items;

  const groundStations = await handleReousrcesGroundStationsGet();

  return {
    simulation,
    simulationsList,
    satellites: satellites,
    groundStations: groundStations.items,
  };
}
