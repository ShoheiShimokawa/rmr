import { BookDetail } from "./BookDetail";
import Button from "@mui/material/Button";
import { statusTypeStr } from "../badge";
import { useState, useMemo } from "react";
import { ReadingRegister } from "../components/ReadingRegister";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Avatar,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Divider from "@mui/material/Divider";
import { deleteReading, toDoing } from "../api/reading";
import { useMessage } from "../ui/useMessage";

export const MyBookDetail = ({ reading, show, updated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [open, setOpen] = useState(false);
  const { showMessage, AlertComponent } = useMessage();
  const [openRegister, setOpenRegister] = useState(false);

  const handleStartReading = async () => {
    const readingId = reading.readingId;
    await toDoing(readingId);
    updated && updated();
  };
  const handleDelete = async () => {
    if (window.confirm("remove from bookshelf?")) {
      const readingId = reading.readingId;
      await deleteReading(readingId);
      updated && updated();
      showMessage("test");
    }
  };

  const handleRegister = () => {
    show && show();
  };

  const handleOpenUpdate = () => {
    setOpenUpdate(true);
    handleClose();
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    showMessage("test");
  };
  return (
    <div>
      <Dialog open={openUpdate}>
        <DialogTitle>Review</DialogTitle>
        <DialogContent>
          <ReadingRegister
            reading={reading}
            book={reading.book}
            updated={() => handleCloseUpdate()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseUpdate()}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <div>
        <BookDetail book={reading.book} reading={reading} />
        <Divider sx={{ height: "auto", m: 1 }} />
        <div>
          <div className="flex">
            <div>
              <Avatar src={reading.user.picture && reading.user.picture} />
            </div>
            <div className="w-2/12">
              <Rating
                name="read-only"
                value={reading.rate}
                size="small"
                readOnly
              />
            </div>
            <div className="w-9/12"></div>
            <div className="w-1/12">
              <IconButton
                className="relative"
                aria-label="more"
                id="long-button"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleOpen}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                className="absolute bottom-0"
                id="long-menu"
                MenuListProps={{
                  "aria-labelledby": "long-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    style: {
                      width: "auto",
                    },
                  },
                }}
              >
                <div>
                  <MenuItem>
                    <div
                      onClick={() => {
                        handleOpenUpdate();
                      }}
                    >
                      edit
                    </div>
                  </MenuItem>
                  <MenuItem>
                    <div
                      onClick={() => {
                        handleDelete();
                      }}
                    >
                      remove from bookshelf
                    </div>
                  </MenuItem>
                </div>
              </Menu>
            </div>
          </div>
          <div>{reading && reading.thoughts}</div>
          <div className="text-xs">
            Last Updated:
            {reading.updateDate ? reading.updateDate : reading.registerDate}
          </div>
          {reading.statusType === "NONE" ? (
            <Button
              variant="contained"
              onClick={() => {
                handleStartReading();
              }}
            >
              <div>start reading!</div>
            </Button>
          ) : reading.statusType === "DOING" ? (
            <Button
              variant="contained"
              onClick={() => {
                handleOpenUpdate();
              }}
            >
              <div>review</div>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
