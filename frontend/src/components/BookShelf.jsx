import { Card, CardContent, Box, Typography, Rating, Divider } from '@mui/material';
import { useState, useEffect } from "react";
import React from 'react';
import { z } from "zod";
import { useContext } from 'react';
import UserContext from './UserProvider';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { statusTypeStr, judgeIcon } from "../badge/index"
import { MyBookDetail } from '../components/MyBookDetail'
import { BookRegister } from '../components/BookRegister'
import { ReadingRegister } from '../components/ReadingRegister'
import { findReadingByUser } from "../api/reading";
import { getReading } from "../api/reading";
import { useMessage } from "../ui/useMessage"
import Avatar from '@mui/material/Avatar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Chip, Slide, Paper } from '@mui/material';

export const BookShelf = () => {
    const [readings, setReadings] = useState([]);
    const [selectedBook, setSelectedBook] = useState();
    const { user } = useContext(UserContext);
    const [open, setOpen] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [showReadingRegister, setShoWReadingRegister] = useState(false);
    const [reading, setReading] = useState();
    const { showMessage, AlertComponent } = useMessage();

    const recent =
        readings.filter((r) => {
            return r.statusType === "NONE" || r.statusType === "DOING"
        })

    const done =
        readings.filter((d) => {
            return d.statusType === "DONE"
        })
    const fiction = done.filter((b) => {
        return b.book.largeGenre === "FICTION";
    })
    const nonFiction = done.filter((b) => {
        return b.book.largeGenre === "NON_FICTION";
    })
    const tech = done.filter((b) => {
        return b.book.largeGenre === "PROFESSIONAL_TECHNICAL"
    })
    const art = done.filter((b) => {
        return b.book.largeGenre === "ARTS_CULTURE";
    })
    const study = done.filter((b) => {
        return b.book.largeGenre === "EDUCATION_STUDYAIDS";
    })
    const entertainment = done.filter((b) => {
        return b.book.largeGenre === "ENTERTAINMENT";
    })
    const academic = done.filter((b) => {
        return b.book.largeGenre === "ACADEMICS_RESEARCH";
    })
    const practical = done.filter((b) => {
        return b.book.largeGenre === "PRACTICAL_HOBBIES";
    })

    const handleSelect = (selectedReading) => {
        setReading(selectedReading);
        setShoWReadingRegister(false);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleCloseRegister = () => {
        setOpenRegister(false)
    }

    const handleRegister = () => {
        setOpenRegister(true);
    }

    const find = async () => {
        const result = await findReadingByUser(user?.userId);
        setReadings(result.data);
    }
    useEffect(() => {
        find();
    }, []);
    return (<>
        <Dialog open={open}
        ><Slide in direction="left" appear={false}>
                <DialogTitle>
                    {!showReadingRegister ? "Detail" : "Review"}
                </DialogTitle>
            </Slide>
            <Slide in direction="left" appear={false}>
                <DialogContent>
                    <div>{!showReadingRegister ? (
                        <MyBookDetail reading={reading} show={() => { setShoWReadingRegister(true) }} updated={(() => { find(); setOpen(false); })} />) :
                        (
                            <ReadingRegister reading={reading} updated={() => setShoWReadingRegister(false)} />
                        )}
                    </div>
                </DialogContent>
            </Slide>
            <DialogActions>
                <Button onClick={() => handleClose()}>Cancel</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openRegister}>
            <DialogTitle>
                Register books!
            </DialogTitle>
            <DialogContent>
                <BookRegister updated={() => handleCloseRegister()} reload={() => find()} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { handleCloseRegister() }}>Cancel</Button>
            </DialogActions>
        </Dialog>
        <div className="text-xl ">Recently</div>
        {recent.length !== 0 ?
            < div className="flex" >
                {
                    recent.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }}></img>
                            <Typography sx={{ color: 'text.secondary', mb: 1.0 }}>{<Chip icon={judgeIcon(reading.statusType)} label={statusTypeStr(reading.statusType)} size="small" />}</Typography>
                        </Paper>
                    ))
                }
            </div >
            : <Box sx={{ height: '140px', width: '100%' }} />}
        {AlertComponent}
        <Divider sx={{ height: 'auto', m: 1 }} />
        <div className="text-xl font-sans"> Books in My Past</div>
        {fiction.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Fiction</div>
                <div className="flex">
                    {fiction.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {nonFiction.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Non Fiction</div>
                <div className="flex">
                    {nonFiction.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {tech.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Professional & Technical</div>
                <div className="flex">
                    {tech.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {art.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Arts & Culture</div>
                <div className="flex">
                    {art.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {study.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Education & Study-aids</div>
                <div className="flex">
                    {study.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {entertainment.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Entertainment</div>
                <div className="flex">
                    {entertainment.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {academic.length !== 0 && (
            <>
                <div className="text-lg font-sans">  Academics & Research</div>
                <div className="flex">
                    {academic.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
        {practical.length !== 0 && (
            <>
                <div className="text-lg font-sans"> Practical & Hobbies</div>
                <div className="flex">
                    {practical.map((reading) => (
                        <Paper className="hover:bg-slate-50" key={reading.readingId} onClick={() => { handleSelect(reading) }} elevation={0}>
                            <img src={reading.book.thumbnail} style={{ width: "100px", height: "140px" }} className="hover:bg-slate-50"></img>
                            <Rating name="read-only" value={reading.rate} readOnly size="small" />
                        </Paper>
                    ))}
                </div>
            </>
        )}
    </>
    )
}