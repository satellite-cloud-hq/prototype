import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/", // Docker Compose のサービス名を使用
});

// POST /schedule
/*
設定ファイルを受け取り、/scheduleエンドポイントにPOSTリクエストを送信する
*/
const handleSchedulePost = async (conditionFileContent: string) => {
  try {
    const conditionFileBlob = new Blob([conditionFileContent], {
      type: "text/yaml",
    });

    const conditionFile = new File([conditionFileBlob], "config.yaml", {
      type: "text/yaml",
    });

    const formData = new FormData();

    formData.append("condition", conditionFile); // ファイルを追加

    const res = await apiClient.post("/schedule", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// POST /simulations
/*
設定ファイルとアプリケーションファイルを受け取り、/simulationsエンドポイントにPOSTリクエストを送信する
*/
const handleSimulationsPost = async ({
  conditionFileContent,
  appFileContent,
}: {
  conditionFileContent: string;
  appFileContent: string;
}) => {
  try {
    const conditionFileBlob = new Blob([conditionFileContent], {
      type: "text/yaml",
    });
    const conditionFile = new File([conditionFileBlob], "config.yaml", {
      type: "text/yaml",
    });
    const appFileBlob = new Blob([appFileContent], { type: "text/python" });

    const appFile = new File([appFileBlob], "app.py", {
      type: "text/python",
    });

    const formData = new FormData();

    formData.append("condition", conditionFile);
    formData.append("app", appFile);

    const res = await apiClient.post("/simulations", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// GET /resources/satellites
const handleReousrcesSatellitesGet = async () => {
  try {
    const res = await apiClient.get(`/resources/satellites`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  handleSchedulePost,
  handleSimulationsPost,
  handleReousrcesSatellitesGet,
};
