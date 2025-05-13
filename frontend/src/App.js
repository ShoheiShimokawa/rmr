import "./App.css";
import { Community } from "./components/Community";
import { BookSearch } from "./components/book/BookSearch";
import { PostRegister } from "./components/PostRegister";
import { ReadingAnalytics } from "./components/ReadingAnalytics";
import { Information } from "./components/Information";
import { UserPage } from "./components/UserPage";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UserProvider } from "./components/UserProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import { HandleRegister } from "./components/HandleRegister";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <div className="App">
        <UserProvider>
          <Box>
            <CssBaseline />
            <Header />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                display: "flex",
                p: 1,
                // justifyContent: "center",
                // alignItems: "center",
                ml: "360px", // Sidebar の幅を考慮
                pt: "70px",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 650 }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/book" element={<BookSearch />} />
                  <Route path="/" element={<Community />} />
                  <Route
                    path="/analytics"
                    element={
                      <RequireAuth>
                        <ReadingAnalytics />
                      </RequireAuth>
                    }
                  />
                  <Route path="/information" element={<Information />} />

                  <Route path="/postRegister" element={<PostRegister />} />
                  <Route path="/:handle" element={<UserPage />} />
                  <Route path="/handleRegister" element={<HandleRegister />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
