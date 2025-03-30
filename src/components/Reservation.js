import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
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
  const [teamsData, setTeamsData] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsCollection = collection(firestore, "teams");
      const teamSnapshot = await getDocs(teamsCollection);
      const teams = [];

      teamSnapshot.forEach((doc) => {
        const data = doc.data();
        teams.push({
          name: data.name,
          testrun: statusLabels.testrun[data.testrun] || "不明",
          measurement: statusLabels.measurement[data.measurement] || "不明"
        });
      });
      
      setTeamsData(teams);
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
            {teams.filter(team => team[category] === label).length > 0 ? (
              teams.filter(team => team[category] === label).map((team) => (
                <Typography key={team.name} sx={{ paddingLeft: 2 }}>
                  {team.name}
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
      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}>チーム名</TableCell>
                <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}>テストラン</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>計量計測</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamsData.map((team) => (
                <TableRow key={team.name}>
                  <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}>{team.name}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>{team.testrun}</TableCell>
                  <TableCell>{team.measurement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* テストランタブ */}
      {tabIndex === 1 && <Box>{renderTeams(teamsData, "testrun")}</Box>}

      {/* 計量計測タブ */}
      {tabIndex === 2 && <Box>{renderTeams(teamsData, "measurement")}</Box>}
    </Box>
  );
};

export default Reservation;