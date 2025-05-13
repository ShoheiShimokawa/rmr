import { registerReading, updateReading } from "../api/reading";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { registerAccount } from "../api/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating, InputAdornment } from "@mui/material";
import { generateHandleId } from "../util";

export const HandleRegister = ({ account }) => {
  const formSchema = z.object({
    handle: z.string().min(1, "ID is required.").max(12),
    name: z.string().min(1, "name is required.").max(30),
  });
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: "",
      name: account.name && account.name,
    },
  });
  const onSubmit = async () => {
    const result = await registerAccount();
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: "400px" }}>
        <TextField
          {...register("handle")}
          label="your ID"
          variant="standard"
          fullWidth
          margin="normal"
          error={!!errors.handle}
          helperText={
            errors.handle?.message
              ? errors.handle.message
              : "ID can be changed later."
          }
          InputProps={{
            startAdornment: <InputAdornment position="start">@</InputAdornment>,
          }}
        />
        <TextField
          {...register("name")}
          label="name"
          variant="standard"
          multiline
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
          focused
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ textTransform: "none" }}

          // endIcon={<SendIcon />}
        >
          create!
        </Button>
      </form>
    </div>
  );
};
