import { registerReading, updateReading } from "../api/reading"
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext, } from "react"
import UserContext from './UserProvider';
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating } from '@mui/material';


export const ReadingRegister = ({ book, reading, updated }) => {

    const { user } = useContext(UserContext);

    const isDisabled = book ? false : true;

    const formSchema = z.object({
        rate: z.number().min(1, "rate is required."),
        thoughts: z.string().min(1, "thoughts is required."),
        description: z.string().max(200).optional(),
    });

    const { control, register, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rate: reading ? reading.rate : null,
            thoughts: reading ? reading.thoughts : '',
            memo: reading ? reading.desriotion : ''
        }
    });
    const onSubmit = async (values) => {
        console.log("ugegegege!!")
        console.log(reading)
        if (reading) {
            const updateParam = {
                ...values,
                bookId: reading.book.bookId,
                userId: user.userId,
                statusType: "DONE",
                readingId: reading.readingId
            }
            await updateReading(updateParam)
            console.log("success change reading.")
            updated && updated()
        } else {
            const param = {
                ...values,
                bookId: book ? book.bookId : reading.book.bookId,
                userId: user.userId,
                statusType: "DONE"
            }
            const result=await registerReading(param);
            console.log(result)
            console.log("success register reading.")
            updated && updated()
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex',  marginBottom: '16px' }}>
                    <Controller
                        name="rate"
                        control={control}
                        render={({ field }) => (
                            <Rating
                                {...field}
                                value={field.value || 0}
                                disabled = {isDisabled}
                                onChange={(event, newValue) => field.onChange(newValue || 0)} 
                            />
                        )}
                    />
                    {errors.rate && (
                        <p style={{ color: 'red', marginLeft: '8px' }}>{errors.rate.message}</p>
                    )}
                </div>
                <TextField
                    {...register('thoughts')}
                    label="thoughts"
                    variant="outlined"
                    multiline
                    fullWidth
                    rows={6}
                    margin="normal"
                    error={!!errors.thoughts}
                    helperText={errors.thoughts?.message}
                    disabled = {isDisabled}
                />
                <TextField
                    {...register('memo')}
                    label="memo"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={!!errors.memo}
                    helperText={errors.memo?.message}
                    disabled = {isDisabled}
                />
                <Button 
                type="submit" variant="contained" color="primary" fullWidth disabled = {isDisabled} 
                sx={{ textTransform: 'none' }} 
                // endIcon={<SendIcon />}
                >
                    Post
                </Button>
            </form>
        </div>
    )
}