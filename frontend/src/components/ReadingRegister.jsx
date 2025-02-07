import { registerReading, updateReading } from "../api/reading"
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext, } from "react"
import UserContext from './UserProvider';
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating } from '@mui/material';


export const ReadingRegister = ({ book, reading, updated }) => {

    const { user } = useContext(UserContext);
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
            description: reading ? reading.description : ''
        }
    });
    const onSubmit = async (values) => {
        if (reading) {
            const updateParam = {
                ...values,
                bookId: reading.book.bookId,
                userId: user.sub,
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
                userId: user.sub,
                statusType: "DONE"
            }
            await registerReading(param);
            console.log("success register reading.")
            updated && updated()
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <Controller
                        name="rate"
                        control={control}
                        render={({ field }) => (
                            <Rating
                                {...field}
                                value={field.value || 0}
                                onChange={(event, newValue) => field.onChange(newValue || 0)} // 値をフォームに反映
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
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register
                </Button>
            </form>
        </div>
    )
}