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
    onConfirm, 
    onCancel,
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const correctPassword = "KoiKING39";

  const handleInputChange = (e) => {
    setPasswordInput(e.target.value);
  };

  const handleConfirm = () => {
    if (passwordInput === correctPassword) {
      onConfirm();
    }
    setPasswordInput("");
  };

  return (
    <Dialog className="text-confirm-dialog" open={open} onClose={onCancel}>
      <DialogTitle className="dialog-title">パスワードを入力してください</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          className="text-field"
          value={passwordInput}
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
          onClick={handleConfirm}
          variant="contained"
          disabled={passwordInput !== correctPassword}
        >
          決定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextConfirm;
