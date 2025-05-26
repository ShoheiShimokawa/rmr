import { registerReading, updateReading } from "../api/reading";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating } from "@mui/material";
import { updateProfile } from "../api/account";

export const ProfileChange = ({ account, update }) => {
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
      description: account.description ? account.description : "",
    },
  });
  const onSubmit = async (values) => {
    if (account) {
      var params = {
        ...values,
        userId: account.userId,
      };
    }
    const result = await updateProfile(params);
    console.log("success!!");
    update && update();
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("name")}
          label="name"
          variant="standard"
          multiline
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
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
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ textTransform: "none" }}
          // endIcon={<SendIcon />}
        >
          Edit
        </Button>
      </form>
    </div>
  );
};
