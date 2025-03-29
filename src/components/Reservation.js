import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { firestore } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const statusLabels = {
  testrun: {
    0: "終了",
    1: "実施中",
    2: "順番待ち",
    3: "未実施"
  },
  measurement: {
    0: "再検査",
    1: "合格",
    2: "実施中",
    3: "順番待ち",
    4: "未実施"
  }
};

const Reservation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [testRunTeams, setTestRunTeams] = useState({});
  const [measurementTeams, setMeasurementTeams] = useState({});

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsCollection = collection(firestore, "teams");
      const teamSnapshot = await getDocs(teamsCollection);
      const testRunData = {};
      const measurementData = {};

      teamSnapshot.forEach((doc) => {
        const data = doc.data();
        const teamName = data.name;
        const testRunStatus = Number(data.testrun);
        const measurementStatus = Number(data.measurement);

        if (!testRunData[testRunStatus]) testRunData[testRunStatus] = [];
        if (!measurementData[measurementStatus]) measurementData[measurementStatus] = [];

        testRunData[testRunStatus].push(teamName);
        measurementData[measurementStatus].push(teamName);
      });

      setTestRunTeams(testRunData);
      setMeasurementTeams(measurementData);
    };

    fetchTeams();
  }, []);

  const renderTeams = (teams, category) => {
    return Object.entries(statusLabels[category]).map(([key, label]) => (
      <Accordion defaultExpanded key={key}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{label}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ paddingLeft: 2 }}>
            {teams[key] ? (
              teams[key].map((team) => (
                <Typography key={team} sx={{ paddingLeft: 2 }}>
                  {team}
                </Typography>
              ))
            ) : (
              <Typography sx={{ paddingLeft: 2 }}>該当なし</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Box sx={{ width: "80%", margin: "auto", padding: "20px" }}>
      {/* タブナビゲーション */}
      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} centered>
        <Tab label="ホーム" />
        <Tab label="テストラン" />
        <Tab label="計量計測" />
      </Tabs>

      {/* ホームタブ */}
      {tabIndex === 0 && <Box></Box>}

      {/* テストランタブ */}
      {tabIndex === 1 && <Box>{renderTeams(testRunTeams, "testrun")}</Box>}

      {/* 計量計測タブ */}
      {tabIndex === 2 && <Box>{renderTeams(measurementTeams, "measurement")}</Box>}
    </Box>
  );
};

export default Reservation;