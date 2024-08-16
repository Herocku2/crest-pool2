import MenuItems from "./MenuItems";
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
    <ul
      className={`dropdown ${dropdownClass} ${dropdown ? "show" : ""}`}
      style={{
        minWidth: services ? "50rem" : "15rem",
        left: services ? "-16rem" : "-3rem",
      }}
    >
      {services
        ? submenus
        : submenus.map((submenu, index) => (
            <MenuItems
              sx={{
                "&:hover": {
                  background: "#01B2F1",
                },
              }}
              items={submenu}
              key={index}
              depthLevel={depthLevel}
            />
          ))}
    </ul>
  );
};

export default Dropdown;
