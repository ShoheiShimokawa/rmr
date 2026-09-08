import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { registerAccount } from "../api/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, InputAdornment } from "@mui/material";
import { useNotify } from "../hooks/NotifyProvider";
import { useTranslation } from "react-i18next";
export const HandleRegister = ({ account, updated }) => {
  const { notify } = useNotify();
  const { t } = useTranslation();
  const { setUser, setToken } = useContext(UserContext);
  const allowedChars = /^[a-zA-Z0-9_-]+$/;
  const formSchema = z.object({
    handle: z
      .string()
      .min(1, "ID is required.")
      .max(30, "Please enter a user ID within 30 characters")
      .regex(allowedChars, {
        message: "Only letters, numbers, and -._~ are allowed.",
      }),
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
    },
  });
  const onSubmit = async (values) => {
    try {
      const params = {
        handle: values.handle,
        registrationToken: account.registrationToken,
      };
      const result = await registerAccount(params);

      setUser(result.data.user);
      setToken(result.data.sessionToken);
      notify(t("notify.accountCreated"), "success");
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
          // バックエンドが返す生のエラーメッセージ。多言語化にはバックエンド側で
          // エラーコードを返すよう変更する必要があり、今回のスコープ外
          notify(errorMessage, "error");
        }
      } else {
        notify(t("notify.profileUpdateFailed"), "error");
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
        <div className="font-soft text-sm mt-3">
          You can change your display name later in your profile settings.
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
