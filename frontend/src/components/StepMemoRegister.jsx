import { Box, Slide } from "@mui/material";
import { CustomStepper } from "../ui/CustomStepper";
import { SelectBook } from "./SelectBook";
import { MemoRegister } from "./MemoRegister";

import { useState } from "react";

export const StepMemoRegister = ({ updated }) => {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [selectedReading, setSelectedReading] = useState();

  const goToStep = (next) => {
    setPrevStep(step);
    setStep(next);
  };

  return (
    <div>
      <CustomStepper activeStep={step}></CustomStepper>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: "600px",
        }}
      >
        <Slide
          direction="right"
          in={step === 0}
          mountOnEnter
          unmountOnExit
          appear={false}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflowY: "auto",
              pr: 1,
            }}
          >
            <SelectBook
              onClick={() => goToStep(1)}
              onNext={(reading) => setSelectedReading(reading)}
            />
          </Box>
        </Slide>
        <Slide
          direction="left"
          in={step === 1}
          mountOnEnter
          unmountOnExit
          appear={false}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflowY: "auto",
              pr: 1,
            }}
          >
            <MemoRegister
              reading={selectedReading && selectedReading}
              updated={updated}
            />
          </Box>
        </Slide>
      </Box>
    </div>
  );
};
