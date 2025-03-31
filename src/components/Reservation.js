import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { firestore } from "../firebase";
import {
  collection,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import "./Reservation.css";
import Selecte from "./Selecte";
import TextConfirm from "./TextConfirm";

const statusLabels = {
  testrun: {
    0: "終了",
    1: "実施中",
    2: "順番待ち",
    3: "未実施",
  },
  measurement: {
    5: "再検査",
    0: "合格",
    1: "実施中",
    2: "順番待ち",
    3: "未実施",
  },
};

const Reservation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [teamsData, setTeamsData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const teamsCollection = collection(firestore, "teams");
    const unsubscribe = onSnapshot(teamsCollection, (teamSnapshot) => {
      const teams = [];

      teamSnapshot.forEach((doc) => {
        const data = doc.data();
        teams.push({
          id: doc.id,
          name: data.name,
          testrun: data.testrun,
          measurement: data.measurement,
          updatedAt: data.updatedAt ? data.updatedAt.toMillis() : 0,
        });
      });

      if (tabIndex !== 0) {
        teams.sort((a, b) => a.updatedAt - b.updatedAt);
      }

      setTeamsData(teams);
    });

    return () => unsubscribe();
  }, [tabIndex]);

  const handleOpenDialog = () => {
    setSelectedTeam("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam("");
  };

  const handleConfirmEditMode = () => {
    setIsEditable(true);
    handleCloseDialog();
  };

  const updateTeamStatus = async () => {
    if (!selectedTeam) return;

    const teamDoc = doc(firestore, "teams", selectedTeam);
    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (tabIndex === 1) {
      updateData.testrun = 2; // テストラン: 順番待ち
    } else if (tabIndex === 2) {
      updateData.measurement = 2; // 計量計測: 順番待ち
    }

    await updateDoc(teamDoc, updateData);
    handleCloseDialog();
  };

  const handleStatusChange = async (teamId, field, value) => {
    const teamDoc = doc(firestore, "teams", teamId);
    const updateData = {
      updatedAt: serverTimestamp(),
      [field]: Number(value),
    };

    await updateDoc(teamDoc, updateData);
  };

  return (
    <div className="reservation-container">
      <div className="reservation-background">
        <Tabs
          className="reservation-tabs"
          value={tabIndex}
          onChange={(e, newIndex) => setTabIndex(newIndex)}
          centered
        >
          <Tab className="reservation-tab" label="ホーム" />
          <Tab className="reservation-tab" label="テストラン" />
          <Tab className="reservation-tab" label="計量計測" />
        </Tabs>

        {tabIndex === 0 && (
          <Box className="reservation-actions">
            <Button
              className="reservation-button"
              variant="contained"
              onClick={handleOpenDialog}
            >
              編集画面
            </Button>
          </Box>
        )}

        {(tabIndex === 1 || tabIndex === 2) && (
          <Box className="reservation-actions">
            <Button
              className="reservation-button"
              variant="contained"
              onClick={handleOpenDialog}
            >
              順番待ちにする
            </Button>
          </Box>
        )}

        {tabIndex === 0 ? (
          <TextConfirm
            open={openDialog}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            onConfirm={handleConfirmEditMode}
            onCancel={handleCloseDialog}
          />
        ) : (
          <Selecte
            open={openDialog}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            teamsData={teamsData}
            onConfirm={updateTeamStatus}
            onCancel={handleCloseDialog}
          />
        )}

        {tabIndex === 0 && (
          <TableContainer
            className="reservation-table-container"
            component={Paper}
          >
            <Table className="reservation-table">
              <TableHead>
                <TableRow>
                  <TableCell className="table-header">チーム名</TableCell>
                  <TableCell className="table-header">テストラン</TableCell>
                  <TableCell className="table-header">計量計測</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamsData.map((team) => (
                  <TableRow key={team.id} className="table-row">
                    <TableCell className="table-cell">{team.name}</TableCell>
                    <TableCell className="table-cell">
                      {isEditable ? (
                        <Select
                          value={team.testrun}
                          onChange={(e) =>
                            handleStatusChange(team.id, "testrun", e.target.value)
                          }
                          fullWidth
                        >
                          {Object.entries(statusLabels.testrun).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        statusLabels.testrun[team.testrun]
                      )}
                    </TableCell>
                    <TableCell className="table-cell">
                      {isEditable ? (
                        <Select
                          value={team.measurement}
                          onChange={(e) =>
                            handleStatusChange(team.id, "measurement", e.target.value)
                          }
                          fullWidth
                        >
                          {Object.entries(statusLabels.measurement).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        statusLabels.measurement[team.measurement]
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        )}

        {(tabIndex === 1 || tabIndex === 2) && (
          Object.entries(
            statusLabels[tabIndex === 1 ? "testrun" : "measurement"]
          ).map(([key, label]) => (
            <Accordion
              className="status-accordion"
              defaultExpanded
              key={key}
            >
              <AccordionSummary
                className="status-summary"
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography className="status-title">{label}</Typography>
              </AccordionSummary>
              <AccordionDetails className="status-details">
                <Box className="status-box">
                  {teamsData
                    .filter(
                      (team) =>
                        Number(team[tabIndex === 1 ? "testrun" : "measurement"]) === Number(key)
                    )
                    .map((team) => (
                      <div key={team.id} className="status-item">
                        <div className="status-content">
                          <Typography>{team.name}</Typography>
                          <Typography className="status-time">
                            最終更新:{" "}
                            {team.updatedAt
                              ? new Date(team.updatedAt).toLocaleString("ja-JP")
                              : "不明"}
                          </Typography>
                        </div>
                      </div>
                    )).length > 0 ? (
                    teamsData
                      .filter(
                        (team) =>
                          Number(team[tabIndex === 1 ? "testrun" : "measurement"]) === Number(key)
                      )
                      .map((team) => (
                        <div key={team.id} className="status-item">
                          <div className="status-content">
                            <Typography>{team.name}</Typography>
                            <Typography className="status-time">
                              最終更新:{" "}
                              {team.updatedAt
                                ? new Date(team.updatedAt).toLocaleString("ja-JP")
                                : "不明"}
                            </Typography>
                          </div>
                        </div>
                      ))
                  ) : (
                    <Typography className="status-item no-border">該当なし</Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>
    </div>
  );
};

export default Reservation;