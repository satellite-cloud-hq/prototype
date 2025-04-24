import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { handleGetImages } from "../../utils/data";
import { useLoaderData } from "react-router";
import JSZip from "jszip";

interface Props {
  height: number;
  width: number;
}

export default function ImagesBoard({
  height,
  width,
}: Props) {
  const { simulation, simulationsList } = useLoaderData();
  const simulationId = simulation?.id;
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndDisplayImages = async () => {
    setLoading(true);
    setError(null);

    try {
      // ZIP ファイルを取得
      const zipData = await handleGetImages(simulationId);

      // ZIP ファイルを解凍
      const zip = await JSZip.loadAsync(zipData);
      const imageFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.match(/\.(png|jpg|jpeg|gif)$/i)
      );

      // 各画像ファイルを読み込み
      const imagePromises = imageFiles.map(async (fileName) => {
        const fileData = await zip.files[fileName].async("blob");
        return URL.createObjectURL(fileData); // Blob を URL に変換
      });

      const imageUrls = await Promise.all(imagePromises);
      setImages(imageUrls);
    } catch (err) {
      console.error(err);
      setError("画像の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDisplayImages();
  }, [simulationId]);

  return (
    <Box sx={{ height, width, bgcolor: 'black' }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Simulation Image ${index + 1}`}
          style={{ width: "150px", height: "auto", border: "1px solid #ccc", padding: "5px", margin: "5px" }}
        />
      ))}
    </Box>
  );
}
