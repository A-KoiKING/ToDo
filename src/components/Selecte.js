import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import "./Selecte.css"; // CSSをインポート

const Selecte = ({
  open,
  selectedTeam,
  setSelectedTeam,
  teamsData,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog className="reservation-dialog" open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle className="dialog-title">チーム状態の変更</DialogTitle>
      <DialogContent className="dialog-content">
        <Select
          className="team-select"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>
            チームを選択
          </MenuItem>
          {teamsData.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button className="dialog-button" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          className="dialog-button confirm"
          onClick={onConfirm}
          variant="contained"
        >
          決定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Selecte;