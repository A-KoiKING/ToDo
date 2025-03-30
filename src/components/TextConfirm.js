import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import "./TextConfirm.css";

const TextConfirm = ({
  open,
  selectedTeam,
  setSelectedTeam,
  onConfirm,
  onCancel,
}) => {
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const correctPassword = "KoiKING39";
  
    const handleInputChange = (e) => {
      const inputValue = e.target.value;
      setSelectedTeam(inputValue);
      setIsPasswordCorrect(inputValue === correctPassword);
    };
  return (
    <Dialog className="text-confirm-dialog" open={open} onClose={onCancel}>
      <DialogTitle className="dialog-title">パスワードを入力してください</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          className="text-field"
          value={selectedTeam}
          onChange={handleInputChange}
          label="password"
          variant="outlined"
          fullWidth
          type="password"
        />
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button className="dialog-button" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          className="dialog-button confirm"
          onClick={onConfirm}
          variant="contained"
          disabled={!isPasswordCorrect}
        >
          決定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextConfirm;