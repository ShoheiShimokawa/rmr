import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Rating } from "@mui/material";
import { updateProfile } from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";

export const ProfileChange = ({ account, update }) => {
  const { notify } = useNotify();
  const formSchema = z.object({
    name: z
      .string()
      .min(1, "name is required.")
      .max(30, "Please enter a name within 30 characters."),
    description: z
      .string()
      .max(300, "Introduction must be 300 characters or fewer.")
      .optional(),
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
    try {
      if (account) {
        var params = {
          ...values,
          userId: account.userId,
        };
      }
      const result = await updateProfile(params);
      notify("Success to change profile.", "success");
      update && update();
    } catch (error) {
      notify("Failed to change profile.", "error");
    }
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
          fullWidth
          sx={{
            textTransform: "none",
            backgroundColor: "#000",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
          // endIcon={<SendIcon />}
        >
          Edit
        </Button>
      </form>
    </div>
  );
};
