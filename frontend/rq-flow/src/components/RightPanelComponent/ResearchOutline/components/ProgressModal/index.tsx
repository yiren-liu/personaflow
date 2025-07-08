import React from "react";
import {
  Backdrop,
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";

const ProgressModal = ({ open, message, progress }) => {
  return (
    <Backdrop open={open} style={{ zIndex: 1300 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={2}
        bgcolor="white"
        borderRadius="8px"
      >
        <Typography variant="h6" mt={2}>
          {message}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          style={{
            width: "100%",
            marginBottom: "1em",
            height: 10,
            borderRadius: 5,
          }}
        />
      </Box>
    </Backdrop>
  );
};

export default ProgressModal;
