import React, { useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import ImagesBoard from "./DashboardPanel/ImagesBoard";
import { handleGetImages } from "../utils/data";
import { useLoaderData } from "react-router";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Grafana() {
  const [value, setValue] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 750, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div ref={containerRef}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'gray' }}>
      <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': {
              color: 'white',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
            },
          }}
        >
          <Tab label="./dashboard" {...a11yProps(0)} />
          <Tab label="./images" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <iframe
          src="http://localhost:3000/public-dashboards/6fefc76edf5c450ba3a4e2d27508ed0f"
          height={dimensions.height}
          width={dimensions.width}
          style={{
            border: "none",
            overflow: "hidden",
            backgroundColor: "black",
          }}
        ></iframe>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ImagesBoard
          height={dimensions.height}
          width={dimensions.width}
        />
      </CustomTabPanel>
    </div>
  );
}
