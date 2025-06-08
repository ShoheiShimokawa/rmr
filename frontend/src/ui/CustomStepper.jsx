import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Box,
} from "@mui/material";
import Check from "@mui/icons-material/Check";

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 6,
    left: "calc(-50% + 12px)",
    right: "calc(50% + 12px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 2,
    borderRadius: 1,
    borderColor: theme.palette.mode === "dark" ? "#555" : "#ccc",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: "#784af4",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: "#784af4",
  },
}));

const QontoStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: theme.palette.mode === "dark" ? "#aaa" : "#ccc",
  display: "flex",
  height: 16,
  alignItems: "center",
  ...(ownerState.active && {
    color: "#784af4",
  }),
  "& .QontoStepIcon-completedIcon": {
    color: "#784af4",
    zIndex: 1,
    fontSize: 16,
  },
  "& .QontoStepIcon-circle": {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

const steps = ["Select a Book", "add Highlight"];

export const CustomStepper = ({ activeStep }) => {
  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<QontoConnector />}
        sx={{ minHeight: "40px" }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>
              {/* <Typography variant="body2" fontSize="0.8rem" fontWeight="500">
                {label}
              </Typography> */}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
