import { Box } from "@mui/material";
import React from "react";
import { useLayoutEffect } from "react";

function Prelaunch() {
  useLayoutEffect(() => {
    window.location.href =
      "https://us06web.zoom.us/j/84960431551?pwd=Q01vdFVaNnJKa2hyTExWYmJ1dlpWdz09";
  }, []);
  return <Box>Redirecting...</Box>;
}

export default Prelaunch;
