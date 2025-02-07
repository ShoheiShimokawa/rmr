import { BookDetail } from "../components/BookDetail"
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { statusTypeStr } from "../badge";
import { useState, useMemo } from "react";
import { ReadingRegister } from "../components/ReadingRegister";
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Dialog, DialogActions, DialogContent, DialogTitle, Rating } from '@mui/material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Divider from '@mui/material/Divider';
import { deleteReading, toDoing } from "../api/reading"
import { useMessage } from "../ui/useMessage"

export const MyBookDetail = ({ reading, show, updated }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [open, setOpen] = useState(false);
    const { showMessage, AlertComponent } = useMessage();
    const [openRegister, setOpenRegister] = useState(false);

    const judgeIcon = (str) => {
        if (str === "NONE") {
            return <FiberNewRoundedIcon />
        } else if (str === ("DOING")) {
            return <AutoStoriesRoundedIcon />
        } else {
            return <CheckCircleOutlineRoundedIcon />
        }
    }

    const handleStartReading = async () => {
        const readingId = reading.readingId
        await toDoing(readingId);
        updated && updated();
    }
    const handleDelete = async () => {
        if (window.confirm("remove this book?")) {
            const readingId = reading.readingId
            await deleteReading(readingId)
            updated && updated();
            showMessage("test")
        }
    }

    const handleRegister = () => {
        show && show();
    }

    const handleOpenUpdate = () => {
        setOpenUpdate(true);
        handleClose();
    }

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
    }

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        showMessage("test")
    }
    return (
        <div>
            <Dialog open={openUpdate}>
                <DialogTitle>
                    Review
                </DialogTitle>
                <DialogContent>
                    <ReadingRegister reading={reading} updated={() => handleCloseUpdate()} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseUpdate()}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <div className="flex">
                <BookDetail book={reading.book} />
                <Divider sx={{ height: 'auto', m: 1 }} orientation="vertical" />
                <div >
                    <Chip icon={judgeIcon(reading.statusType)} label={statusTypeStr(reading.statusType)}></Chip>
                    <Rating name="read-only" value={reading.rate} size="small" readOnly />
                    <div>{reading && reading.thoughts}</div>
                    <div className="text-xs">Last Updated:{reading.updateDate ? reading.updateDate : reading.registerDate}</div>
                    {reading.statusType === "NONE" ?
                        <Button variant="contained" onClick={() => {
                            handleStartReading()
                        }}><div>start reading!</div>
                        </Button> : reading.statusType === "DOING" ?
                            <Button variant="contained" onClick={() => {
                                handleOpenUpdate();
                            }}><div>
                                    review</div>
                            </Button> : null
                    }
                </div>
                <div>
                    <IconButton
                        className="relative"
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleOpen}

                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu className="absolute bottom-0"
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                style: {
                                    width: 'auto',
                                },
                            },
                        }}
                    ><div >
                            <MenuItem >
                                <div onClick={() => { handleOpenUpdate() }}>edit records</div>
                            </MenuItem>
                            <MenuItem >
                                <div onClick={() => { handleDelete() }}>Remove this from my bookshelf</div>
                            </MenuItem>
                        </div>
                    </Menu>
                </div>

            </div>
        </div>
    )
}