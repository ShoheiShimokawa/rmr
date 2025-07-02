import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, InputAdornment } from "@mui/material";
import { updateProfile } from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";

export const ProfileChange = ({ account, update }) => {
  const { notify } = useNotify();
  const allowedChars = /^[a-zA-Z0-9_-]+$/;
  const formSchema = z.object({
    handle: z
      .string()
      .min(1, "ID is required.")
      .max(30, "Please enter a user ID within 30 characters")
      .regex(allowedChars, {
        message: "Only letters, numbers, and -._~ are allowed.",
      }),
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
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: account.handle && account.handle,
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
      await updateProfile(params);
      notify("Success to change profile.", "success");
      update && update();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("handle")) {
          setError("handle", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          notify(errorMessage, "error");
        }
      } else {
        notify("Failed to change profile.", "error");
      }
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <TextField
            {...register("handle")}
            label="user ID*"
            variant="standard"
            multiline
            fullWidth
            margin="normal"
            error={!!errors.handle}
            helperText={errors.handle?.message}
            sx={{ maxWidth: 280 }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">@</InputAdornment>
              ),
            }}
          />
        </div>
        <div>
          <TextField
            {...register("name")}
            label="name*"
            variant="standard"
            multiline
            fullWidth
            margin="normal"
            sx={{ maxWidth: 280 }}
            error={!!errors.name}
            helperText={errors.name?.message}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>
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
