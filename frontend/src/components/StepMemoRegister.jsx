import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Slide,
  Stepper,
  Step,
  StepLabel,
  Paper,
  stepConnectorClasses,
  styled,
  StepConnector,
} from "@mui/material";
import { CustomStepper } from "../ui/CustomStepper";
import { SelectBook } from "./SelectBook";
import { MemoRegister } from "./MemoRegister";

import { useState, useEffect, useMemo } from "react";

export const StepMemoRegister = ({ updated }) => {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [selectedReading, setSelectedReading] = useState();

  const goToStep = (next) => {
    setPrevStep(step);
    setStep(next);
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  const steps = ["Select Book", "Register Memo"];
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
              overflowY: "auto", // ✅ ここでスクロール可能に！
              pr: 1, // スクロールバー分の余白（好み）
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
              overflowY: "auto", // ✅ ここでスクロール可能に！
              pr: 1, // スクロールバー分の余白（好み）
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
