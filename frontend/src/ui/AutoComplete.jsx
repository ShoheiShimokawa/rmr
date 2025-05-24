import { TextField, Autocomplete, InputAdornment } from "@mui/material";
import React, { useState } from "react";

export const AutoComplete = ({ options }) => {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");

  return (
    <Autocomplete
      freeSolo
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, newValue) => setValue(newValue)}
      filterOptions={(options, params) => {
        const filtered = options.filter((option) =>
          option.toLowerCase().includes(params.inputValue.toLowerCase())
        );

        const isExisting = options.some(
          (option) => option.toLowerCase() === params.inputValue.toLowerCase()
        );

        if (params.inputValue !== "" && !isExisting) {
          filtered.push(`Add "${params.inputValue}"`);
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
    />
  );
};
