import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { registerAccount } from "../api/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, InputAdornment } from "@mui/material";
import { useNotify } from "../hooks/NotifyProvider";
export const HandleRegister = ({ account, updated }) => {
  const { notify } = useNotify();
  const { setUser } = useContext(UserContext);
  const allowedChars = /^[a-zA-Z0-9_-]+$/;
  const formSchema = z.object({
    handle: z
      .string()
      .min(1, "ID is required.")
      .max(30, "Please enter a user ID within 30 characters")
      .regex(allowedChars, {
        message: "Only letters, numbers, and -._~ are allowed.",
      }),
    name: z.string().min(1, "name is required.").max(30),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: "",
      name: account.name && account.name,
    },
  });
  const onSubmit = async (values) => {
    try {
      const params = {
        ...values,
        googleSub: account.googleSub,
        picture: account.picture,
      };
      const result = await registerAccount(params);

      setUser(result.data);
      notify("You've successfully created your account!", "success");
      updated && updated();
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
              : "Pick a unique Id like @john_doe or @lisa-dev."
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
        <div className="font-soft text-sm mt-3">
          You can change these later.
        </div>
        <div className="flex justify-end mr-6 mt-3">
          <Button
            type="submit"
            variant="outlined"
            sx={{
              textTransform: "none",
              backgroundColor: "#000",
              color: "#fff",
              fontWeight: "bold",
              fontFamily: "'Nunito sans'",
              width: "150px",
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            create!
          </Button>
        </div>
      </form>
    </div>
  );
};
