import MenuItems from "./MenuItems";
import { Box, Paper } from "@mui/material";

const Dropdown = ({
  submenus,
  dropdown,
  depthLevel,
  services,
  customClass,
}) => {
  depthLevel = depthLevel + 1;
  const dropdownClass =
    depthLevel > 1 ? "dropdown-submenu" : services ? customClass : "";
  
  return (
    <Paper
      component="ul"
      elevation={3}
      className={`dropdown ${dropdownClass} ${dropdown ? "show" : ""}`}
      sx={{
        position: "absolute",
        top: "100%",
        left: services ? "-16rem" : "0",
        minWidth: services ? "50rem" : "12rem",
        zIndex: 100,
        borderRadius: "16px",
        p: 1,
        m: 0,
        listStyle: "none",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: dropdown ? "block" : "none",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {services
        ? submenus
        : submenus.map((submenu, index) => (
            <MenuItems
              items={submenu}
              key={index}
              depthLevel={depthLevel}
            />
          ))}
    </Paper>
  );
};

export default Dropdown;
