import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { firestore } from "../firebase";
import { collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const statusLabels = {
  testrun: {
    0: "終了",
    1: "実施中",
    2: "順番待ち",
    3: "未実施"
  },
  measurement: {
    5: "再検査",
    0: "合格",
    1: "実施中",
    2: "順番待ち",
    3: "未実施"
  }
};

const Reservation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [teamsData, setTeamsData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const teamsCollection = collection(firestore, "teams");
    const teamSnapshot = await getDocs(teamsCollection);
    const teams = [];

    teamSnapshot.forEach((doc) => {
      const data = doc.data();
      teams.push({
        id: doc.id,
        name: data.name,
        testrun: data.testrun,
        measurement: data.measurement,
        updatedAt: data.updatedAt ? data.updatedAt.toMillis() : 0
      });
    });
    
    teams.sort((a, b) => a.updatedAt - b.updatedAt);
    setTeamsData(teams);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const updateTeamStatus = async () => {
    if (!selectedTeam) return;
    
    const teamDoc = doc(firestore, "teams", selectedTeam);
    const updateData = {
      updatedAt: serverTimestamp()
    };
  
    if (tabIndex === 1) {
      updateData.testrun = 2;
    } else if (tabIndex === 2) {
      updateData.measurement = 2;
    }
    
    await updateDoc(teamDoc, updateData);
    
    fetchTeams();
    handleCloseDialog();
  };

  return (
    <Box sx={{ width: "80%", margin: "auto", padding: "20px" }}>
      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} centered>
        <Tab label="ホーム" />
        <Tab label="テストラン" />
        <Tab label="計量計測" />
      </Tabs>

      {(tabIndex === 1 || tabIndex === 2) && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
          <Button variant="contained" onClick={handleOpenDialog}>状態を変更</Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>チーム状態の変更</DialogTitle>
        <DialogContent>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>チームを選択</MenuItem>
            {teamsData.map((team) => (
              <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={updateTeamStatus} variant="contained">決定</Button>
        </DialogActions>
      </Dialog>

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
                <TableRow key={team.id}>
                  <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #ccc" }}>{team.name}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #ccc" }}>{statusLabels.testrun[team.testrun]}</TableCell>
                  <TableCell>{statusLabels.measurement[team.measurement]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {(tabIndex === 1 || tabIndex === 2) && (
        Object.entries(statusLabels[tabIndex === 1 ? "testrun" : "measurement"]).map(([key, label]) => (
          <Accordion defaultExpanded key={key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ paddingLeft: 2 }}>
                {teamsData.filter(team => Number(team[tabIndex === 1 ? "testrun" : "measurement"]) === Number(key)).length > 0 ? (
                  teamsData.filter(team => Number(team[tabIndex === 1 ? "testrun" : "measurement"]) === Number(key)).map(team => (
                    <Typography key={team.id} sx={{ paddingLeft: 2 }}>{team.name}</Typography>
                  ))
                ) : (
                  <Typography sx={{ paddingLeft: 2 }}>該当なし</Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default Reservation;
