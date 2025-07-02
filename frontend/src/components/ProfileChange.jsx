import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, InputAdornment } from "@mui/material";
import { updateProfile } from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkIcon from "@mui/icons-material/Link";

export const ProfileChange = ({ account, update }) => {
  const { notify } = useNotify();
  const allowedChars = /^[a-zA-Z0-9_-]+$/;
  const formSchema = z.object({
    handle: z
      .string()
      .min(1, "ID is required.")
      .max(30, "Please enter a user ID within 30 characters")
      .regex(allowedChars, {
        message: "Only letters, numbers, and -_ are allowed.",
      }),
    name: z
      .string()
      .min(1, "name is required.")
      .max(30, "Please enter a name within 30 characters."),
    description: z
      .string()
      .max(300, "Introduction must be 300 characters or fewer.")
      .optional(),
    x: z
      .string()
      .max(15, "Please enter your X ID.")
      .refine(
        (val) => {
          return val === "" || allowedChars.test(val);
        },
        {
          message: "Only letters, numbers, and -_ are allowed.",
        }
      )
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    facebook: z
      .string()
      .max(15, "Please enter your facebook ID.")
      .refine(
        (val) => {
          return val === "" || allowedChars.test(val);
        },
        {
          message: "Only letters, numbers, and -_ are allowed.",
        }
      )
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    link: z
      .string()
      .max(200, "URL must be 200 characters or fewer.")
      .transform((val) => (val === "" ? undefined : val))
      .optional()
      .superRefine((val, ctx) => {
        if (val === undefined) return;

        try {
          const parsed = new URL(val);
          if (parsed.protocol !== "https:") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Only https links are allowed.",
            });
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be a valid URL.",
          });
        }
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
      handle: account.handle && account.handle,
      name: account.name && account.name,
      description: account.description ? account.description : "",
      x: account.x ? account.x : "",
      facebook: account.facebook ? account.facebook : "",
      link: account.link ? account.link : "",
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
        <div className="mt-4">
          <div className="font-soft font-bold">User Id*</div>
          <TextField
            {...register("handle")}
            variant="outlined"
            multiline
            fullWidth
            margin="dense"
            size="small"
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
        <div className="mt-4">
          <div className="font-soft font-bold">Name*</div>
          <TextField
            {...register("name")}
            variant="outlined"
            multiline
            fullWidth
            margin="dense"
            size="small"
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
        <div className="mt-4">
          <div className="font-soft font-bold">Introduction</div>
          <TextField
            {...register("description")}
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            margin="dense"
            size="small"
            placeholder="Tell us about yourself or your reading interests..."
            error={!!errors.description}
            helperText={errors.description?.message}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>
        <div className="flex justify-around">
          <div>
            <div className="flex items-center font-soft font-bold mt-4">
              <XIcon sx={{ fontSize: "20px" }} />
              <div className="ml-2">X</div>
            </div>
            <div>
              <TextField
                {...register("x")}
                variant="outlined"
                multiline
                fullWidth
                margin="dense"
                size="small"
                placeholder="your_X_ID"
                error={!!errors.x}
                helperText={errors.x?.message}
                sx={{ maxWidth: 200 }}
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
          </div>
          <div>
            <div className="flex items-center font-soft font-bold mt-4">
              <FacebookIcon sx={{ fontSize: "20px" }} />
              <div className="ml-2">FaceBook</div>
            </div>
            <div>
              <TextField
                {...register("facebook")}
                variant="outlined"
                multiline
                fullWidth
                margin="dense"
                size="small"
                placeholder="your_facebook_ID"
                error={!!errors.facebook}
                helperText={errors.facebook?.message}
                sx={{ maxWidth: 200 }}
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
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center font-soft font-bold mt-4">
            <LinkIcon sx={{ fontSize: "20px" }} />
            <div className="ml-2 ">Link</div>
          </div>
          <TextField
            {...register("link")}
            variant="outlined"
            multiline
            fullWidth
            size="small"
            placeholder="https://example.com"
            margin="dense"
            error={!!errors.link}
            helperText={errors.link?.message}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>
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
