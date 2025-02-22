import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    primary: {
      // Replace the default MUI blue with a custom orange (or any color you prefer)
      main: "#ff9800",
    },
    secondary: {
      main: "#f44336",
    },
  },
})

export default theme
