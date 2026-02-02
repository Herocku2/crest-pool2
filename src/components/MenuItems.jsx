import { useMediaQuery, useTheme, Box } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';

import Dropdown from "./Dropdown";

const MenuItems = ({ items, depthLevel, services }) => {
  const [dropdown, setDropdown] = useState(false);
  const theme = useTheme();
  const matches = useMediaQuery("(max-width:600px)");
  let ref = useRef();

  useEffect(() => {
    const handler = (event) => {
      if (dropdown && ref.current && !ref.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dropdown]);

  const onMouseEnter = () => {
    window.innerWidth > 960 && setDropdown(true);
  };

  const onMouseLeave = () => {
    window.innerWidth > 960 && setDropdown(false);
  };

  return (
    <Box>
      <Box>
        {" "}
        {services ? (
          <Box>
            <Box
              component="li"
              ref={ref}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              sx={{
                position: 'relative',
                listStyle: 'none',
              }}
            >
              {items.submenu ? (
                <>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdown ? "true" : "false"}
                    onClick={() => setDropdown((prev) => !prev)}
                    style={{
                      color: theme.palette.text.primary,
                      fontSize: matches ? "12px" : "14px",
                      fontWeight: 600,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <HashLink to={items.link} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                      {items.title}{" "}
                      {depthLevel > 0 ? (
                        <KeyboardArrowRightIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowDownIcon fontSize="small" />
                      )}
                    </HashLink>
                  </button>
                  <Dropdown
                    depthLevel={depthLevel}
                    submenus={items.submenu}
                    dropdown={dropdown}
                    services={services}
                    customClass="service"
                  />
                </>
              ) : (
                <HashLink to={items.link} style={{ textDecoration: 'none', color: theme.palette.text.primary, fontSize: matches ? "12px" : "14px", fontWeight: 600 }}>{items.title}</HashLink>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Box
              component="li"
              ref={ref}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              sx={{
                position: 'relative',
                listStyle: 'none',
              }}
            >
              {items.submenu ? (
                <>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdown ? "true" : "false"}
                    onClick={() => setDropdown((prev) => !prev)}
                    style={{
                      color: theme.palette.text.primary,
                      fontSize: matches ? "12px" : "14px",
                      fontWeight: 600,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <HashLink to={items.link} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                      {items.title}{" "}
                      {depthLevel > 0 ? (
                        <KeyboardArrowRightIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowDownIcon fontSize="small" />
                      )}
                    </HashLink>
                  </button>
                  <Dropdown
                    depthLevel={depthLevel}
                    submenus={items.submenu}
                    dropdown={dropdown}
                  />
                </>
              ) : (
                <HashLink to={items.link} style={{ textDecoration: 'none', color: theme.palette.text.primary, fontSize: matches ? "12px" : "14px", fontWeight: 600 }}>{items.title}</HashLink>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MenuItems;
