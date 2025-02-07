import React from 'react';
import { z } from "zod";
import { useContext } from 'react';
import UserContext from './UserProvider';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { statusTypeStr, judgeIcon } from "../badge/index"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { BookDetail } from '../components/BookDetail'
import { BookRegister } from '../components/BookRegister'
import { ReadingRegister } from '../components/ReadingRegister'
import SlideDialogExample from '../components/SlidingDialog'
import { findBooks } from "../api/book";
import { login } from "../api/auth"
import { getReading } from "../api/reading";
import { useState, useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Chip, Slide } from '@mui/material';

export const BookList = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState();
    const [open, setOpen] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [transition, setTransition] = useState("left");
    const [showReadingRegister, setShoWReadingRegister] = useState(false);
    const [reading, setReading] = useState();
    const { user, setUser } = useContext(UserContext);

    const formSchema = z.object({
        name: z.string().min(1, "名前は必須です"),
        email: z.string().email("有効なメールアドレスを入力してください"),
        password: z.string().min(6, "パスワードは6文字以上で入力してください")
    });

    const find = async () => {
        const result = await findBooks(user?.sub);
        setBooks(result.data);
    }
    useEffect(() => {
        find();
    }, []);
    const handleSelect = async (selectedBook) => {
        setSelectedBook(selectedBook);
        setShoWReadingRegister(false);
        const reading = await getReading(selectedBook.bookId);
        setReading(reading.data)
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

    //選択されたジャンルの本を表示。

    const handleLoginSuccess = async (response) => {
        const token = response.credential;
        try {
            const result = await fetch('http://localhost:8080/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            const userData = await result.json();
            setUser(userData);
            const resultB = await findBooks(user?.sub);
            setBooks(resultB.data);


        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleLoginFailure = () => {
        console.log("Login Failed");
    };
    return (
        <div>
            <Chip
                avatar={<Avatar src={user.picture} />}
                label={user.name}
                variant="outlined"
            />
            {/* <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log('Login Failed')} /> */}
            <Button onClick={() => handleRegister()} variant="contained">Register</Button>

            <Dialog open={open}
            ><Slide in direction="left" appear={false}>
                    <DialogTitle>
                        {!showReadingRegister ? "Detail" : "Review"}
                    </DialogTitle>
                </Slide>
                <Slide in direction="left" appear={false}>
                    <DialogContent>
                        <div>{!showReadingRegister ? (
                            <BookDetail book={selectedBook} reading={reading} show={() => { setShoWReadingRegister(true) }} />) :
                            (
                                <ReadingRegister book={selectedBook} updated={() => handleClose()} />
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
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>author</TableCell>
                            <TableCell>title</TableCell>
                            <TableCell align="center">genre</TableCell>
                            <TableCell align="center">status</TableCell>
                            <TableCell align="center">rate</TableCell>
                        </TableRow>
                    </TableHead>
                    {books &&
                        <TableBody>
                            {books.map((book) => (
                                <TableRow key={book.bookId}>
                                    <TableCell align="left" >{book.author}</TableCell>
                                    <TableCell component="th" scope="row"
                                        onClick={() => {
                                            handleSelect(book);
                                        }}>
                                        <span> {book.title}</span>
                                    </TableCell>
                                    <TableCell align="center"><Chip label={book.genre} /></TableCell>
                                    <TableCell align="center"><Chip icon={judgeIcon(book.statusType)} label={statusTypeStr(book.statusType)} /></TableCell>
                                    <TableCell align="center">{book.rate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    }
                </Table>
            </TableContainer>
        </div>

    );
}