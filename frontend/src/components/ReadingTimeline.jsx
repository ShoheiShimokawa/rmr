import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Box,
  Typography,
  styled,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DoneIcon from "@mui/icons-material/Done";

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  top: 50, // ← アイコンの中央に線を合わせる
  left: "calc(-50% + 22px)",
  right: "calc(50% + 22px)",
  "& .MuiStepConnector-line": {
    borderColor: "#cbd5e1",
    borderTopWidth: 2,
    borderRadius: 2,
  },
}));

const CustomStep = styled(Step)(({ theme }) => ({
  minWidth: 140,
  flex: 1,
  textAlign: "center",
}));

export const ReadingTimeline = ({ reading }) => {
  const allSteps = [
    {
      label: "To Read",
      icon: <BookmarkBorderIcon />,
      date: reading.toReadDate,
      type: "NONE",
    },
    {
      label: "Reading",
      icon: <MenuBookIcon />,
      date: reading.readingDate,
      type: "DOING",
    },
    {
      label: "Read",
      icon: <DoneIcon />,
      date: reading.readDate,
      type: "DONE",
    },
  ];

  const visibleSteps = allSteps.filter((step) => step.date);

  const activeStep = visibleSteps.findIndex(
    (step) => step.type === reading.statusType
  );

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        px: 1,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<CustomConnector />}
        sx={{
          minHeight: 110,
          display: "flex",
          justifyContent:
            visibleSteps.length === 1 ? "center" : "space-between",
          width: visibleSteps.length === 1 ? "auto" : "100%",
        }}
      >
        {visibleSteps.map((step) => (
          <CustomStep key={step.label}>
            <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
              {step.label}
            </Typography>

            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor:
                  reading.statusType === step.type ? "#1976d2" : "transparent",
                color: reading.statusType === step.type ? "#fff" : "#000",
                border:
                  reading.statusType === step.type
                    ? "none"
                    : "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontSize: 20,
                mb: 1,
              }}
            >
              {step.icon}
            </Box>

            <div className="font-soft text-xs text-zinc-600">
              {new Date(step.date).toLocaleDateString()}
            </div>
          </CustomStep>
        ))}
      </Stepper>
    </Box>
  );
};
