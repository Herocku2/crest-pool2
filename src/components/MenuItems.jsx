import { useMediaQuery } from "@mui/material";
import { Box } from "@mui/system";
import { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";

import Dropdown from "./Dropdown";

const MenuItems = ({ items, depthLevel, services }) => {
  const [dropdown, setDropdown] = useState(false);
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
    <div>
      <div>
        {" "}
        {services ? (
          <div>
            <li
              className="menu-items"
              ref={ref}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {items.submenu ? (
                <>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdown ? "true" : "false"}
                    onClick={() => setDropdown((prev) => !prev)}
                    style={{
                      color: "primary.main",
                      fontSize: matches ? "12px" : "14px",
                      fontWeight: 600,
                    }}
                  >
                    <HashLink to={items.link}>
                      {items.title}{" "}
                      {depthLevel > 0 ? (
                        <span>&raquo;</span>
                      ) : (
                        <span className="arrow" />
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
                <HashLink to={items.link}>{items.title}</HashLink>
              )}
            </li>
          </div>
        ) : (
          <div>
            <li
              className="menu-items"
              ref={ref}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {items.submenu ? (
                <>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdown ? "true" : "false"}
                    onClick={() => setDropdown((prev) => !prev)}
                    style={{
                      color: "primary.main",
                      fontSize: matches ? "12px" : "14px",
                      fontWeight: 600,
                    }}
                  >
                    <HashLink to={items.link}>
                      {items.title}{" "}
                      {depthLevel > 0 ? (
                        <span>&raquo;</span>
                      ) : (
                        <span className="arrow" />
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
                <HashLink to={items.link}>{items.title}</HashLink>
              )}
            </li>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItems;
