import { TextField, Autocomplete, InputAdornment } from "@mui/material";
import React, { useState, useMemo } from "react";

export const AutoComplete = ({ options, value, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const filteredOptions = useMemo(() => {
    const lowerInput = inputValue.toLowerCase();
    const matches = options.filter((option) =>
      option.toLowerCase().includes(lowerInput)
    );
    const isExisting = options.some(
      (option) => option.toLowerCase() === lowerInput
    );

    if (inputValue !== "" && !isExisting) {
      return [...matches, { inputValue, title: `Add "${inputValue}"` }];
    }

    return matches;
  }, [options, inputValue]);

  return (
    <Autocomplete
      freeSolo
      value={value}
      disabled={disabled}
      options={filteredOptions}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.title
      }
      isOptionEqualToValue={(option, value) =>
        typeof option === "string"
          ? option === value
          : option.inputValue === value
      }
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          onChange(newValue);
        } else if (newValue?.inputValue) {
          // Add "〇〇" を選択したとき
          onChange(newValue.inputValue);
        } else {
          onChange(newValue);
        }
      }}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
    />
  );
};
