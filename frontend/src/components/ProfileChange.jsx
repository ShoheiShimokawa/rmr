import { registerReading, updateReading } from "../api/reading";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating } from "@mui/material";

export const ProfileChange = ({ account }) => {
  const formSchema = z.object({
    name: z.string().min(1, "name is required."),
    description: z.string().max(200).optional(),
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
      name: account.name && account.name,
      description: account.description ? account.desriotion : "",
    },
  });
  const onSubmit = async () => {};
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: "400px" }}>
        <TextField
          {...register("name")}
          label="name"
          variant="standard"
          multiline
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          {...register("description")}
          label="introduction"
          variant="standard"
          multiline
          rows={6}
          fullWidth
          margin="normal"
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ textTransform: "none" }}
          // endIcon={<SendIcon />}
        >
          Post
        </Button>
      </form>
    </div>
  );
};
