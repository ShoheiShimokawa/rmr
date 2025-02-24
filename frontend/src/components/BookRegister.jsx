import { registerBook } from "../api/book";
import { useContext } from "react"
import UserContext from './UserProvider';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export const BookRegister = ({ updated, reload }) => {
    const { user, setUser } = useContext(UserContext);

    const formSchema = z.object({
        title: z.string().min(1, "title is required."),
        author: z.string().min(1, "author is required."),
        description: z.string().max(200).optional(),
        genre: z.enum(["LITERATURE", "BUSINESS", "TECHNICAL", "HABIT", "REFERENCE", "OTHER"], {
            message: "genre is required."
        }),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            author: '',
            description: '',
            genre: ''
        }
    });

    const onSubmit = async (params) => {
        const param = { ...params, userId: user.sub }
        await registerBook(param);
        reload && reload();
        updated && updated();
    };


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '400px', margin: '0 auto' }}>
                <TextField
                    {...register('title')}
                    label="title"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                />
                <TextField
                    {...register('author')}
                    label="author"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.author}
                    helperText={errors.author?.message}
                />
                <TextField
                    {...register('description')}
                    label="description"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />
                <FormControl fullWidth margin="normal" error={!!errors.genre}>
                    <InputLabel>genre</InputLabel>
                    <Select
                        {...register('genre')}
                        label="Genre"
                    >
                        <MenuItem value="LITERATURE">literature</MenuItem>
                        <MenuItem value="BUSINESS">Business & self-help</MenuItem>
                        <MenuItem value="TECHNICAL">Technical</MenuItem>
                        <MenuItem value="HABIT">Habit</MenuItem>
                        <MenuItem value="REFERENCE">Study-aid</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register
                </Button>
            </form>

        </div>
    )
}
